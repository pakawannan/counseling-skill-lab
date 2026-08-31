import { env } from "cloudflare:workers";
import { getChatGPTUser } from "./chatgpt-auth";

export async function requireTeacherApi(): Promise<{ email: string; displayName: string } | null> {
  const user = await getChatGPTUser();
  if (!user) return null;
  const configured = (env as unknown as { TEACHER_EMAILS?: string }).TEACHER_EMAILS ?? "";
  const allowed = configured.split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(user.email.toLowerCase())) return null;
  return { email: user.email, displayName: user.displayName };
}
