import { getRawDb } from "@/db/raw";
import { getStudent, jsonError } from "../../_student";

export async function GET(request:Request){
  try{
    const student=await getStudent(request); if(!student)return jsonError("กรุณาเข้าสู่ระบบใหม่",401);
    const rows=await getRawDb().prepare(`
      SELECT skill, stage, MAX(percent) AS bestPercent, COUNT(*) AS attempts,
             MAX(CASE WHEN passed = 1 THEN 1 ELSE 0 END) AS passed,
             MAX(created_at) AS updatedAt
      FROM attempts WHERE student_id = ? GROUP BY skill, stage ORDER BY skill, stage
    `).bind(student.id).all();
    return Response.json({student,scores:rows.results});
  }catch(error){return jsonError(error instanceof Error?error.message:"อ่านคะแนนไม่สำเร็จ",500)}
}
