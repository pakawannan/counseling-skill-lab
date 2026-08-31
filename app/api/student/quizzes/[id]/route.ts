import { getRawDb } from "@/db/raw";
import { getStudent, jsonError } from "@/app/api/_student";

type Item={id:number;position:number;type:string;prompt:string;optionsJson:string;correctAnswer:string|null;explanation:string;points:number};
type Quiz={id:number;title:string;description:string;category:string;durationMinutes:number;published:number};
type Submission={id:number;status:string;earnedScore?:number;maxScore?:number;startedAt?:string;submittedAt?:string;feedback?:string};
type Answer={itemId:number;answer:string;isCorrect:number|null;earnedPoints:number|null;feedback:string};
async function context(request:Request,id:number){
  const student=await getStudent(request);if(!student)return null;
  const db=getRawDb();
  const quiz=await db.prepare(`SELECT id,title,description,category,duration_minutes AS durationMinutes,published FROM quizzes WHERE id=? AND room_code=?`).bind(id,student.roomCode).first<Quiz>();
  return quiz?.published?{student,db,quiz}:null;
}
function present(item:Item,submitted:boolean){return {id:item.id,position:item.position,type:item.type,prompt:item.prompt,options:JSON.parse(item.optionsJson||"[]"),points:item.points,...(submitted?{correctAnswer:item.correctAnswer,explanation:item.explanation}:{})}}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const id=Number((await params).id);const ctx=await context(request,id);if(!ctx)return jsonError("ไม่พบแบบฝึกหัดหรือไม่มีสิทธิ์",404);
  const items=(await ctx.db.prepare(`SELECT id,position,type,prompt,options_json AS optionsJson,correct_answer AS correctAnswer,explanation,points FROM quiz_items WHERE quiz_id=? ORDER BY position`).bind(id).all<Item>()).results;
  const submission=await ctx.db.prepare(`SELECT id,status,earned_score AS earnedScore,max_score AS maxScore,started_at AS startedAt,submitted_at AS submittedAt,feedback FROM quiz_submissions WHERE quiz_id=? AND student_id=?`).bind(id,ctx.student.id).first<Submission>();
  const answers:Answer[]=submission?(await ctx.db.prepare(`SELECT qa.item_id AS itemId,qa.answer,qa.is_correct AS isCorrect,qa.earned_points AS earnedPoints,qa.feedback FROM quiz_answers qa WHERE qa.submission_id=?`).bind(submission.id).all<Answer>()).results:[];
  const submitted=Boolean(submission&&submission.status!=="draft");
  return Response.json({quiz:ctx.quiz,items:items.map(x=>present(x,submitted)),submission,answers});
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const id=Number((await params).id);const ctx=await context(request,id);if(!ctx)return jsonError("ไม่พบแบบฝึกหัดหรือไม่มีสิทธิ์",404);
  const body=await request.json() as {itemId?:number;answer?:string};const answer=String(body.answer??"").slice(0,5000);
  const item=await ctx.db.prepare(`SELECT id,type,correct_answer AS correctAnswer,points FROM quiz_items WHERE id=? AND quiz_id=?`).bind(Number(body.itemId),id).first<{id:number;type:string;correctAnswer:string|null;points:number}>();if(!item)return jsonError("ไม่พบข้อคำถาม",404);
  await ctx.db.prepare(`INSERT OR IGNORE INTO quiz_submissions (quiz_id,student_id,status) VALUES (?,?,'draft')`).bind(id,ctx.student.id).run();
  const submission=await ctx.db.prepare(`SELECT id,status FROM quiz_submissions WHERE quiz_id=? AND student_id=?`).bind(id,ctx.student.id).first<Submission>();if(!submission||submission.status!=="draft")return jsonError("ส่งแบบฝึกหัดแล้ว",409);
  const objective=item.type!=="essay";const correct=objective?answer===String(item.correctAnswer):null;const earned=objective?(correct?item.points:0):null;
  await ctx.db.prepare(`INSERT INTO quiz_answers (submission_id,item_id,answer,is_correct,earned_points,updated_at) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(submission_id,item_id) DO UPDATE SET answer=excluded.answer,is_correct=excluded.is_correct,earned_points=excluded.earned_points,updated_at=CURRENT_TIMESTAMP`).bind(submission.id,item.id,answer,correct===null?null:(correct?1:0),earned).run();
  return Response.json({saved:true,updatedAt:new Date().toISOString()});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const id=Number((await params).id);const ctx=await context(request,id);if(!ctx)return jsonError("ไม่พบแบบฝึกหัดหรือไม่มีสิทธิ์",404);
  await ctx.db.prepare(`INSERT OR IGNORE INTO quiz_submissions (quiz_id,student_id,status) VALUES (?,?,'draft')`).bind(id,ctx.student.id).run();
  const submission=await ctx.db.prepare(`SELECT id,status FROM quiz_submissions WHERE quiz_id=? AND student_id=?`).bind(id,ctx.student.id).first<Submission>();if(!submission)return jsonError("สร้างรายการส่งไม่สำเร็จ",500);
  const items=(await ctx.db.prepare(`SELECT id,position,type,prompt,options_json AS optionsJson,correct_answer AS correctAnswer,explanation,points FROM quiz_items WHERE quiz_id=? ORDER BY position`).bind(id).all<Item>()).results;
  const answers=(await ctx.db.prepare(`SELECT item_id AS itemId,answer,is_correct AS isCorrect,earned_points AS earnedPoints,feedback FROM quiz_answers WHERE submission_id=?`).bind(submission.id).all<Answer>()).results;
  const answered=new Set(answers.filter(x=>String(x.answer).trim()).map(x=>Number(x.itemId)));if(answered.size<items.length)return jsonError("กรุณาตอบให้ครบทุกข้อก่อนส่ง",400);
  const maxScore=items.reduce((s,x)=>s+x.points,0);const objectiveScore=answers.reduce((s,x)=>s+(x.earnedPoints??0),0);const hasEssay=items.some(x=>x.type==="essay");
  await ctx.db.prepare(`UPDATE quiz_submissions SET status=?,objective_score=?,earned_score=?,max_score=?,submitted_at=CURRENT_TIMESTAMP WHERE id=?`).bind(hasEssay?"submitted":"graded",objectiveScore,objectiveScore,maxScore,submission.id).run();
  const byId=new Map<number,Answer>(answers.map(x=>[Number(x.itemId),x]));return Response.json({submitted:true,submission:{id:submission.id,status:hasEssay?"submitted":"graded",earnedScore:objectiveScore,maxScore},items:items.map(x=>present(x,true)),answers:items.map(x=>({itemId:x.id,...(byId.get(x.id)??{answer:"",isCorrect:null,earnedPoints:null,feedback:""})}))});
}
