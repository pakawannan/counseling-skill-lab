import { getRawDb } from "@/db/raw";
import { getStudent, jsonError } from "../../_student";
import lessonsData from "@/app/data/learn-modules.json";
import questionsData from "@/app/data/questions.json";
import coreData from "@/app/data/core-response-questions.json";
import reflectionData from "@/app/data/reflection-questions.json";

type IdentifyQuestion={answer:string};
const identifyBank={...questionsData,...coreData,...reflectionData} as Record<string,IdentifyQuestion[]>;
const lessons=lessonsData as Record<string,{quiz:{correct:number}[]}>;
const allowedSkills=new Set(Object.keys(lessons));

export async function POST(request:Request){
  try{
    const student=await getStudent(request); if(!student)return jsonError("กรุณาเข้าสู่ระบบใหม่",401);
    const body=await request.json() as {skill?:string;stage?:"learn"|"identify";answers?:string[];itemIndices?:number[]};
    const skill=body.skill??""; const stage=body.stage; const answers=body.answers??[];
    if(!allowedSkills.has(skill)||!stage)return jsonError("ข้อมูลทักษะไม่ถูกต้อง");
    const identifyQuestions=identifyBank[skill];
    const itemIndices=stage==="identify"?(body.itemIndices??answers.map((_,i)=>i)):answers.map((_,i)=>i);
    if(stage==="identify"&&(!identifyQuestions||answers.length!==5||itemIndices.length!==answers.length||new Set(itemIndices).size!==itemIndices.length||itemIndices.some(i=>!Number.isInteger(i)||i<0||i>=identifyQuestions.length)))return jsonError("ชุดสถานการณ์ไม่ถูกต้อง");
    const correctAnswers=stage==="learn"?lessons[skill]?.quiz.map(q=>String(q.correct)):itemIndices.map(i=>identifyQuestions[i].answer);
    if(!correctAnswers||answers.length!==correctAnswers.length)return jsonError("จำนวนคำตอบไม่ถูกต้อง");
    const correctness=answers.map((answer,i)=>answer===correctAnswers[i]);
    const score=correctness.filter(Boolean).length,total=answers.length,percent=Math.round(score/total*100),passed=percent>=80;
    const db=getRawDb();
    const attempt=await db.prepare("INSERT INTO attempts (student_id, skill, stage, score, total, percent, passed) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id, created_at AS createdAt").bind(student.id,skill,stage,score,total,percent,passed?1:0).first<{id:number;createdAt:string}>();
    if(!attempt)throw new Error("Unable to save attempt");
    const statements=answers.map((answer,i)=>db.prepare("INSERT INTO responses (attempt_id, student_id, skill, stage, item_index, answer, correct_answer, is_correct) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(attempt.id,student.id,skill,stage,stage==="identify"?itemIndices[i]+1:i+1,answer,correctAnswers[i],correctness[i]?1:0));
    if(statements.length)await db.batch(statements);
    await db.prepare("UPDATE students SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?").bind(student.id).run();
    return Response.json({attempt:{...attempt,skill,stage,score,total,percent,passed}});
  }catch(error){return jsonError(error instanceof Error?error.message:"บันทึกคะแนนไม่สำเร็จ",500)}
}
