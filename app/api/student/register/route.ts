import { getRawDb, randomToken, sha256 } from "@/db/raw";
import { jsonError } from "../../_student";

export async function POST(request:Request){
  try{
    const body=await request.json() as {roomCode?:string;studentCode?:string;pin?:string};
    const roomCode=(body.roomCode??"").trim().toUpperCase();
    const studentCode=(body.studentCode??"").trim().toUpperCase();
    const displayName=studentCode;
    const pin=(body.pin??"").trim();
    if(!/^[A-Z0-9-]{3,20}$/.test(roomCode))return jsonError("กรุณาตรวจสอบรหัสห้อง");
    if(!/^[A-Z0-9-]{2,30}$/.test(studentCode))return jsonError("กรุณากรอกรหัสนักศึกษาให้ถูกต้อง");
    if(!/^\d{4}$/.test(pin))return jsonError("PIN ต้องเป็นตัวเลข 4 หลัก");
    const db=getRawDb();
    const room=await db.prepare("SELECT code FROM rooms WHERE code = ? AND active = 1").bind(roomCode).first();
    if(!room)return jsonError("ไม่พบรหัสห้อง หรือห้องนี้ปิดรับคำตอบแล้ว",404);
    const pinHash=await sha256(`${roomCode}:${studentCode}:${pin}`);
    const token=randomToken(); const sessionHash=await sha256(token);
    const existing=await db.prepare("SELECT id, pin_hash AS pinHash FROM students WHERE room_code = ? AND student_code = ?").bind(roomCode,studentCode).first<{id:number;pinHash:string}>();
    let id:number;
    if(existing){
      if(existing.pinHash!==pinHash)return jsonError("PIN ไม่ถูกต้อง",401);
      id=existing.id;
      await db.prepare("UPDATE students SET display_name = ?, session_hash = ?, last_active_at = CURRENT_TIMESTAMP WHERE id = ?").bind(displayName,sessionHash,id).run();
    }else{
      const created=await db.prepare("INSERT INTO students (room_code, student_code, display_name, pin_hash, session_hash) VALUES (?, ?, ?, ?, ?) RETURNING id").bind(roomCode,studentCode,displayName,pinHash,sessionHash).first<{id:number}>();
      if(!created)throw new Error("Unable to create student"); id=created.id;
    }
    return Response.json({token,student:{id,roomCode,studentCode,displayName}});
  }catch(error){return jsonError(error instanceof Error?error.message:"ไม่สามารถเข้าสู่ระบบได้",500)}
}
