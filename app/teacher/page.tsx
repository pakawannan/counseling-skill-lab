import { env } from "cloudflare:workers";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import TeacherDashboard from "./teacher-dashboard";

export const dynamic="force-dynamic";

export default async function TeacherPage(){
  const user=await requireChatGPTUser("/teacher");
  const configured=(env as unknown as {TEACHER_EMAILS?:string}).TEACHER_EMAILS??"";
  const allowed=configured.split(",").map(x=>x.trim().toLowerCase()).includes(user.email.toLowerCase());
  if(!allowed)return <main className="csl-teacher-shell"><section className="csl-denied"><h1>ไม่สามารถเข้าถึงหน้าอาจารย์</h1><p>บัญชี {user.email} ไม่ได้รับสิทธิ์สำหรับ Dashboard นี้</p><a href={chatGPTSignOutPath("/teacher")}>ออกจากระบบ</a></section></main>;
  return <main className="csl-teacher-shell"><header className="csl-teacher-top"><a href="/" className="csl-brand"><b>CS</b><span><strong>Counseling Skill Lab</strong><small>Teacher Dashboard</small></span></a><div><span>{user.displayName}</span><a href={chatGPTSignOutPath("/teacher")}>ออกจากระบบ</a></div></header><TeacherDashboard/></main>
}
