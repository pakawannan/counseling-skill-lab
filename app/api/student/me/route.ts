import { getStudent, jsonError } from "../../_student";
export async function GET(request:Request){const student=await getStudent(request);return student?Response.json({student}):jsonError("กรุณาเข้าสู่ระบบใหม่",401)}
