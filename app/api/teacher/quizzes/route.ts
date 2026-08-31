import { getRawDb } from "@/db/raw";
import { requireTeacherApi } from "@/app/teacher-auth";

type BuilderItem={type:string;prompt:string;options?:string[];correctAnswer?:string;explanation?:string;points?:number};
function validItems(items:BuilderItem[]){return Array.isArray(items)&&items.length>0&&items.every(x=>["mcq","true_false","essay"].includes(x.type)&&x.prompt?.trim()&&Number(x.points??1)>0)}
export async function GET(request:Request){
  if(!await requireTeacherApi())return Response.json({error:"ไม่มีสิทธิ์"},{status:403});const room=new URL(request.url).searchParams.get("room")?.trim().toUpperCase();if(!room)return Response.json({error:"กรุณาเลือกห้อง"},{status:400});
  const rows=await getRawDb().prepare(`SELECT q.id,q.title,q.description,q.category,q.duration_minutes AS durationMinutes,q.published,COUNT(qi.id) AS itemCount,COUNT(DISTINCT qs.id) AS submissions FROM quizzes q LEFT JOIN quiz_items qi ON qi.quiz_id=q.id LEFT JOIN quiz_submissions qs ON qs.quiz_id=q.id WHERE q.room_code=? GROUP BY q.id ORDER BY q.created_at DESC`).bind(room).all();return Response.json({quizzes:rows.results});
}
export async function POST(request:Request){
  if(!await requireTeacherApi())return Response.json({error:"ไม่มีสิทธิ์"},{status:403});const b=await request.json() as any;const room=String(b.roomCode??"").trim().toUpperCase();const items=b.items as BuilderItem[];
  if(!room||!String(b.title??"").trim()||!validItems(items))return Response.json({error:"กรอกชื่อแบบฝึกและข้อคำถามให้ครบ"},{status:400});
  const db=getRawDb();const exists=await db.prepare(`SELECT code FROM rooms WHERE code=?`).bind(room).first();if(!exists)return Response.json({error:"ไม่พบห้องเรียน"},{status:404});
  const created=await db.prepare(`INSERT INTO quizzes (room_code,title,description,category,duration_minutes,published) VALUES (?,?,?,?,?,?) RETURNING id`).bind(room,String(b.title).trim(),String(b.description??"").trim(),String(b.category??"แบบฝึกเพิ่มเติม").trim(),Math.max(1,Math.min(180,Number(b.durationMinutes)||20)),b.published?1:0).first<{id:number}>();
  await db.batch(items.map((x,i)=>db.prepare(`INSERT INTO quiz_items (quiz_id,position,type,prompt,options_json,correct_answer,explanation,points) VALUES (?,?,?,?,?,?,?,?)`).bind(created!.id,i+1,x.type,x.prompt.trim(),JSON.stringify(x.options??[]),x.type==="essay"?null:String(x.correctAnswer??""),String(x.explanation??""),Number(x.points??1))));
  return Response.json({id:created!.id},{status:201});
}
