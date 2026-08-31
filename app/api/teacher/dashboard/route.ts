import { getRawDb } from "@/db/raw";
import { requireTeacherApi } from "@/app/teacher-auth";

export async function GET(request:Request){
  if(!await requireTeacherApi())return Response.json({error:"ไม่มีสิทธิ์"},{status:403});
  const room=new URL(request.url).searchParams.get("room")?.trim().toUpperCase()??"";
  if(!room)return Response.json({error:"กรุณาเลือกห้อง"},{status:400});
  const db=getRawDb();
  const metrics=await db.prepare(`
    SELECT COUNT(DISTINCT s.id) AS students, COUNT(a.id) AS attempts,
           COALESCE(ROUND(AVG(a.percent)),0) AS average,
           COALESCE(ROUND(100.0 * SUM(CASE WHEN a.passed=1 THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id),0)),0) AS passRate
    FROM students s LEFT JOIN attempts a ON a.student_id=s.id WHERE s.room_code=?
  `).bind(room).first();
  const skills=await db.prepare(`
    SELECT a.skill, a.stage, ROUND(AVG(a.percent)) AS average, COUNT(a.id) AS attempts,
           ROUND(100.0 * SUM(CASE WHEN a.passed=1 THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id),0)) AS passRate
    FROM attempts a JOIN students s ON s.id=a.student_id WHERE s.room_code=?
    GROUP BY a.skill,a.stage ORDER BY a.skill,a.stage
  `).bind(room).all();
  const students=await db.prepare(`
    SELECT s.student_code AS studentCode,s.display_name AS displayName,
           COUNT(a.id) AS attempts,COALESCE(ROUND(AVG(a.percent)),0) AS average,
           COALESCE(MAX(a.percent),0) AS best,MAX(a.created_at) AS lastAttempt
    FROM students s LEFT JOIN attempts a ON a.student_id=s.id WHERE s.room_code=?
    GROUP BY s.id ORDER BY average DESC,s.student_code
  `).bind(room).all();
  const difficult=await db.prepare(`
    SELECT r.skill,r.stage,r.item_index AS itemIndex,COUNT(*) AS responses,
           ROUND(100.0 * SUM(CASE WHEN r.is_correct=1 THEN 1 ELSE 0 END)/COUNT(*)) AS correctRate
    FROM responses r JOIN students s ON s.id=r.student_id WHERE s.room_code=?
    GROUP BY r.skill,r.stage,r.item_index HAVING COUNT(*)>0 ORDER BY correctRate ASC,responses DESC LIMIT 10
  `).bind(room).all();
  const quizResults=await db.prepare(`
    SELECT q.id,q.title,COUNT(DISTINCT qs.id) AS submissions,
      COALESCE(ROUND(100.0*SUM(qs.earned_score)/NULLIF(SUM(qs.max_score),0)),0) AS average,
      SUM(CASE WHEN qs.status='submitted' THEN 1 ELSE 0 END) AS pending
    FROM quizzes q LEFT JOIN quiz_submissions qs ON qs.quiz_id=q.id
    WHERE q.room_code=? GROUP BY q.id ORDER BY q.created_at DESC
  `).bind(room).all();
  const quizDifficult=await db.prepare(`
    SELECT q.title,qi.position,qi.prompt,COUNT(qa.id) AS responses,
      COALESCE(ROUND(100.0*SUM(CASE WHEN qa.is_correct=1 THEN 1 ELSE 0 END)/NULLIF(COUNT(qa.id),0)),0) AS correctRate
    FROM quiz_items qi JOIN quizzes q ON q.id=qi.quiz_id LEFT JOIN quiz_answers qa ON qa.item_id=qi.id
    WHERE q.room_code=? AND qi.type!='essay' GROUP BY qi.id HAVING COUNT(qa.id)>0 ORDER BY correctRate ASC,responses DESC LIMIT 10
  `).bind(room).all();
  return Response.json({room,metrics,skills:skills.results,students:students.results,difficult:difficult.results,quizResults:quizResults.results,quizDifficult:quizDifficult.results});
}
