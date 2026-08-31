"use strict";

const API = "";
const skills = [
  ["humanNature","Understanding the Person","ธรรมชาติของมนุษย์","learn"],
  ["process","Counseling Process","กระบวนการให้การปรึกษา","practice"],
  ["ethics","Ethics & Safety","จรรยาบรรณและความปลอดภัย","safety"],
  ["attending","Attending","การใส่ใจ","learn"],
  ["listening","Listening","การฟัง","listening"],
  ["questioning","Questioning","การถาม","questioning"],
  ["paraphrasing","Paraphrasing","การทวนความ","paraphrasing"],
  ["reflection","Reflection of Feeling","การสะท้อนความรู้สึก","reflection"],
  ["summarization","Summarization","การสรุปความ","summarization"],
  ["clarification","Clarification","การทำให้กระจ่าง","listening"],
  ["advanced","Advanced Responses","การตอบสนองขั้นสูง","practice"],
  ["integration","Integration","การบูรณาการทักษะ","mastery"]
];

const state = { token: localStorage.getItem("csl_student_token") || "", student: null, dashboard: null, modules: null };
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

async function request(path, options={}) {
  const headers = { ...(options.body ? {"content-type":"application/json"} : {}), ...(options.headers || {}) };
  if (state.token) headers.authorization = `Bearer ${state.token}`;
  const response = await fetch(`${API}${path}`, {...options, headers});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "ไม่สามารถเชื่อมต่อระบบได้");
  return data;
}

function showView(id) {
  $$(".view").forEach(view => view.classList.toggle("hidden", view.id !== id));
  $("#logoutButton").classList.toggle("hidden", id !== "dashboardView");
  $("#app").focus();
}

function showPanel(id) {
  $$(".content-panel").forEach(panel => panel.classList.toggle("hidden", panel.id !== `${id}Panel`));
  $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.panel === id));
  if (id === "scores") loadScores();
}

function skillCard(skill) {
  const [key, english, thai, image] = skill;
  return `<article class="lesson-card"><img src="../public/mascots/${image}.png" alt=""><span class="eyebrow">LEARN · PRACTICE</span><h4>${english}</h4><p>${thai}</p><button class="outline-button" data-skill="${key}" type="button">เปิดบทเรียน →</button></article>`;
}

function renderNavigation() {
  $("#lessonNav").innerHTML = skills.map(([key, english, thai]) => `<button class="lesson-mini" data-skill="${key}" type="button"><strong>${english}</strong><br><small>${thai}</small></button>`).join("");
  const cards = skills.map(skillCard).join("");
  $("#lessonCards").innerHTML = cards;
  $("#allLessons").innerHTML = cards;
}

async function loadModules() {
  if (!state.modules) state.modules = await fetch("data/learn-modules.json").then(r => r.json());
  return state.modules;
}

async function openLesson(key) {
  const modules = await loadModules();
  const item = modules[key];
  const meta = skills.find(x => x[0] === key);
  if (!item || !meta) return;
  const sections = item.sections || item.content || [];
  const html = Array.isArray(sections)
    ? sections.map(section => `<section><h2>${escapeHtml(section.title || "สาระสำคัญ")}</h2>${renderText(section.body || section.content || section)}</section>`).join("")
    : renderText(sections);
  $("#lessonContent").innerHTML = `<article class="lesson-article"><span class="eyebrow">${meta[1].toUpperCase()}</span><h1>${meta[2]} <small>(${meta[1]})</small></h1>${html}<aside class="callout"><strong>การประเมินความปลอดภัยและการดูแลเมื่อพบสัญญาณอันตราย</strong><p>หากสถานการณ์กล่าวถึงอันตรายต่อตนเองหรือผู้อื่น ให้หยุดการฝึกทักษะทั่วไป ประเมินความปลอดภัยโดยตรง และดำเนินการตามแนวทางของหน่วยงานภายใต้การนิเทศ</p></aside></article>`;
  showPanel("lesson");
  window.scrollTo({top:0, behavior:"smooth"});
}

function renderText(value) {
  if (Array.isArray(value)) return `<ul>${value.map(x => `<li>${escapeHtml(typeof x === "string" ? x : JSON.stringify(x))}</li>`).join("")}</ul>`;
  if (typeof value === "object" && value) return Object.entries(value).map(([key,val]) => `<h3>${escapeHtml(key)}</h3>${renderText(val)}`).join("");
  return `<p>${escapeHtml(String(value || ""))}</p>`;
}

function escapeHtml(text) { const node=document.createElement("div"); node.textContent=text; return node.innerHTML; }

async function loadDashboard() {
  state.dashboard = await request("/api/student/dashboard");
  state.student = state.dashboard.student;
  $("#studentIdentity").textContent = `รหัสนักศึกษา ${state.student.studentCode} · ห้อง ${state.student.roomCode}`;
  const stages = state.dashboard.stages || [];
  const completed = stages.filter(x => Number(x.passed) === 1).length;
  const total = skills.length * 2;
  const percent = Math.min(100, Math.round(completed / total * 100));
  $("#progressPercent").textContent = `${percent}%`;
  $("#progressBar").style.width = `${percent}%`;
  $("#progressText").textContent = `ผ่านแล้ว ${completed} จาก ${total} ขั้นการเรียนรู้และแบบฝึก`;
  $("#quizCards").innerHTML = (state.dashboard.quizzes || []).map(q => `<article class="lesson-card"><span class="eyebrow">INTERACTIVE QUIZ</span><h4>${escapeHtml(q.title)}</h4><p>${escapeHtml(q.description || "แบบฝึกจากอาจารย์")} · ${q.itemCount} ข้อ</p><span class="status-${q.status === "graded" ? "pass" : "wait"}">${q.status === "not_started" ? "ยังไม่ได้ทำ" : escapeHtml(q.status)}</span></article>`).join("");
}

async function loadScores() {
  const box = $("#scoresContent"); box.textContent = "กำลังอ่านคะแนน...";
  try {
    const data = await request("/api/student/scores");
    if (!data.scores?.length) { box.innerHTML = "<p>ยังไม่มีผลการฝึก เมื่อทำแบบฝึกแล้วคะแนนจะปรากฏที่นี่</p>"; return; }
    box.innerHTML = `<div style="overflow:auto"><table class="scores-table"><thead><tr><th>บทเรียน</th><th>ขั้น</th><th>คะแนนสูงสุด</th><th>จำนวนครั้ง</th><th>สถานะ</th></tr></thead><tbody>${data.scores.map(row => `<tr><td>${escapeHtml(row.skill)}</td><td>${escapeHtml(row.stage)}</td><td>${row.bestPercent}%</td><td>${row.attempts}</td><td class="status-${Number(row.passed) ? "pass" : "wait"}">${Number(row.passed) ? "ผ่าน" : "ฝึกต่อ"}</td></tr>`).join("")}</tbody></table></div>`;
  } catch (error) { box.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`; }
}

async function restoreSession() {
  if (!state.token) return showView("landingView");
  try { const data = await request("/api/student/me"); state.student=data.student; showView("dashboardView"); await loadDashboard(); }
  catch { localStorage.removeItem("csl_student_token"); state.token=""; showView("landingView"); }
}

$("#loginForm").addEventListener("submit", async event => {
  event.preventDefault(); const error=$("#loginError"); error.classList.add("hidden");
  const submit=event.currentTarget.querySelector("button[type=submit]"); submit.disabled=true;
  try {
    const payload={roomCode:$("#roomCode").value.trim(),studentCode:$("#studentCode").value.trim(),pin:$("#pin").value.trim()};
    const data=await request("/api/student/register",{method:"POST",body:JSON.stringify(payload)});
    state.token=data.token; state.student=data.student; localStorage.setItem("csl_student_token",data.token);
    showView("dashboardView"); await loadDashboard();
  } catch (err) { error.textContent=err.message; error.classList.remove("hidden"); }
  finally { submit.disabled=false; }
});

document.addEventListener("click", event => {
  const target=event.target.closest("button,[data-action]"); if(!target)return;
  if(target.dataset.action === "show-login") showView("loginView");
  if(target.dataset.action === "home") showView("landingView");
  if(target.dataset.panel) showPanel(target.dataset.panel);
  if(target.dataset.skill) openLesson(target.dataset.skill);
});

$("#logoutButton").addEventListener("click",()=>{localStorage.removeItem("csl_student_token");state.token="";state.student=null;showView("landingView")});
$("#themeButton").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("csl_html_theme",document.body.classList.contains("dark")?"dark":"light")});
if(localStorage.getItem("csl_html_theme")==="dark")document.body.classList.add("dark");
const invited=new URLSearchParams(location.search).get("room");if(invited){$("#roomCode").value=invited;showView("loginView")}
renderNavigation();restoreSession();
