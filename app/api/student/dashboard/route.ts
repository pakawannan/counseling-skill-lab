import { getRawDb } from "@/db/raw";
import { getStudent, jsonError } from "@/app/api/_student";

export async function GET(request:Request){
  const student=await getStudent(request);if(!student)return jsonError("กรุณาเข้าสู่ระบบ",401);
  const db=getRawDb();
  const stages=await db.prepare(`SELECT skill,stage,MAX(percent) AS bestPercent,MAX(passed) AS passed FROM attempts WHERE student_id=? GROUP BY skill,stage`).bind(student.id).all();
  const quizzes=await db.prepare(`
    SELECT q.id,q.title,q.description,q.category,q.duration_minutes AS durationMinutes,
      COUNT(qi.id) AS itemCount,COALESCE(qs.status,'not_started') AS status,
      COALESCE(qs.earned_score,0) AS earnedScore,COALESCE(qs.max_score,0) AS maxScore
    FROM quizzes q LEFT JOIN quiz_items qi ON qi.quiz_id=q.id
    LEFT JOIN quiz_submissions qs ON qs.quiz_id=q.id AND qs.student_id=?
    WHERE q.room_code=? AND q.published=1 GROUP BY q.id ORDER BY q.created_at DESC
  `).bind(student.id,student.roomCode).all();
  return Response.json({student,stages:stages.results,quizzes:quizzes.results});
}
