import { getRawDb, sha256 } from "@/db/raw";

export type StudentSession = { id:number; roomCode:string; studentCode:string; displayName:string };

export async function getStudent(request: Request): Promise<StudentSession | null> {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (token.length < 32) return null;
  const hash = await sha256(token);
  return getRawDb().prepare(`
    SELECT id, room_code AS roomCode, student_code AS studentCode, display_name AS displayName
    FROM students WHERE session_hash = ?
  `).bind(hash).first<StudentSession>();
}

export function jsonError(message:string,status=400){return Response.json({error:message},{status})}
