import { getRawDb } from "@/db/raw";
import { requireTeacherApi } from "@/app/teacher-auth";

export async function GET(){
  if(!await requireTeacherApi())return Response.json({error:"ไม่มีสิทธิ์"},{status:403});
  const rows=await getRawDb().prepare("SELECT code, title, active, created_at AS createdAt FROM rooms ORDER BY created_at DESC").all();
  return Response.json({rooms:rows.results});
}
export async function POST(request:Request){
  if(!await requireTeacherApi())return Response.json({error:"ไม่มีสิทธิ์"},{status:403});
  const body=await request.json() as {title?:string};const title=(body.title??"").trim();
  if(title.length<2)return Response.json({error:"กรุณาระบุชื่อห้องเรียน"},{status:400});
  const db=getRawDb();
  for(let attempt=0;attempt<30;attempt++){
    const bytes=crypto.getRandomValues(new Uint16Array(1));
    const code=String(1000+(bytes[0]%9000));
    try{
      await db.prepare("INSERT INTO rooms (code, title) VALUES (?, ?)").bind(code,title).run();
      return Response.json({room:{code,title,active:true},invitePath:`/?room=${code}`},{status:201});
    }catch{/* ถ้ารหัสชนกัน ให้สุ่มใหม่ */}
  }
  return Response.json({error:"ยังสร้างรหัสห้องไม่ได้ กรุณากดลองอีกครั้ง"},{status:503});
}

export async function DELETE(request:Request){
  if(!await requireTeacherApi())return Response.json({error:"ไม่มีสิทธิ์"},{status:403});
  const body=await request.json() as {code?:string;confirmCode?:string};
  const code=(body.code??"").trim().toUpperCase();
  if(!code||body.confirmCode?.trim().toUpperCase()!==code)return Response.json({error:"กรุณาพิมพ์รหัสห้องให้ตรงกันเพื่อยืนยัน"},{status:400});
  const db=getRawDb();const room=await db.prepare("SELECT code FROM rooms WHERE code=?").bind(code).first();
  if(!room)return Response.json({error:"ไม่พบห้องเรียน"},{status:404});
  await db.batch([
    db.prepare("DELETE FROM quiz_answers WHERE submission_id IN (SELECT qs.id FROM quiz_submissions qs JOIN quizzes q ON q.id=qs.quiz_id WHERE q.room_code=?)").bind(code),
    db.prepare("DELETE FROM quiz_submissions WHERE quiz_id IN (SELECT id FROM quizzes WHERE room_code=?)").bind(code),
    db.prepare("DELETE FROM quiz_items WHERE quiz_id IN (SELECT id FROM quizzes WHERE room_code=?)").bind(code),
    db.prepare("DELETE FROM quizzes WHERE room_code=?").bind(code),
    db.prepare("DELETE FROM responses WHERE student_id IN (SELECT id FROM students WHERE room_code=?)").bind(code),
    db.prepare("DELETE FROM attempts WHERE student_id IN (SELECT id FROM students WHERE room_code=?)").bind(code),
    db.prepare("DELETE FROM students WHERE room_code=?").bind(code),
    db.prepare("DELETE FROM rooms WHERE code=?").bind(code),
  ]);
  return Response.json({deleted:true,code});
}
