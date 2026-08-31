# Counseling Skill Lab — Developer Handoff

ชุดนี้เป็น source code ฉบับสมบูรณ์ของ Counseling Skill Lab สำหรับนำไปพัฒนาต่อในโครงการอื่น โดยตัดข้อมูลผูกกับเว็บไซต์ต้นฉบับ ไฟล์ build, node_modules, ประวัติ Git และข้อมูลลับออกแล้ว

## เทคโนโลยี

- React 19 + TypeScript
- Vinext / Vite
- Tailwind CSS 4 และ Shadcn UI
- Cloudflare Worker
- Cloudflare D1 + Drizzle ORM
- Sign in with ChatGPT สำหรับหน้าอาจารย์

## ฟังก์ชันหลัก

- หน้า Home สาธารณะและหน้าเข้าสู่ห้องเรียน
- Student Dashboard, Lesson Hub, Gradebook และ Auto-save
- บทเรียนและแบบฝึกทักษะการปรึกษา 5 ชุด ชุดละ 24 ข้อ
- ระบบห้องเรียน รหัสนักศึกษา และ PIN
- Teacher Dashboard, Quiz Builder, Grading และ Student Analytics
- สร้างรหัสห้อง ลิงก์เชิญ และ QR Code
- ฐานข้อมูลสำหรับห้อง นักศึกษา คะแนน คำตอบ แบบฝึก และ Feedback
- Light/Dark mode และ responsive layout

## โครงสร้างสำคัญ

- `app/counseling-app.tsx` — UI และการทำงานฝั่งนักศึกษา
- `app/teacher/` — หน้าสำหรับอาจารย์
- `app/api/` — API นักศึกษาและอาจารย์
- `app/data/` — เนื้อหาบทเรียนและคลังข้อคำถาม
- `app/globals.css` — ธีมและ responsive styling
- `db/schema.ts` — โครงสร้างฐานข้อมูล
- `drizzle/` — migration ของฐานข้อมูล
- `public/mascots/` — ชุดไอคอนตัวละคร

## เริ่มพัฒนาบนเครื่อง

ต้องใช้ Node.js 22.13 ขึ้นไป

```bash
npm ci
npm run dev
```

ตรวจ build:

```bash
npm run build
```

## ฐานข้อมูล

แอปใช้ Cloudflare D1 binding ชื่อ `DB` และมี migration อยู่ในโฟลเดอร์ `drizzle/`

เมื่อนำไปใช้กับแพลตฟอร์มอื่น นักพัฒนาต้อง:

1. สร้างฐานข้อมูล SQLite/D1 ใหม่
2. รัน migration ตามลำดับ
3. ผูกฐานข้อมูลกับชื่อ `DB` หรือแก้ adapter ใน `db/index.ts` และ `db/raw.ts`

## สิทธิ์หน้าอาจารย์

ตั้งค่า environment variable:

```text
TEACHER_EMAILS=teacher@example.ac.th,teacher2@example.ac.th
```

หน้า `/teacher` ตรวจสิทธิ์ที่ฝั่ง server จากรายชื่ออีเมลนี้ ไม่ได้อาศัยการซ่อนเมนูเพียงอย่างเดียว

ระบบ Sign in with ChatGPT ใช้ header และเส้นทางที่แพลตฟอร์ม Sites จัดให้ หากย้ายไปแพลตฟอร์มอื่น ให้เปลี่ยน `app/chatgpt-auth.ts` เป็นระบบ authentication ของแพลตฟอร์มนั้น โดยคงการตรวจ allowlist ใน `app/teacher/page.tsx`

## สิ่งที่ไม่รวมใน ZIP

- ข้อมูลนักศึกษาและคะแนนจากเว็บไซต์จริง
- รหัสโครงการและข้อมูล deployment เดิม
- environment variables หรือข้อมูลลับ
- `node_modules`, build artifacts และประวัติ Git

## ข้อควรระวัง

- เนื้อหาใช้เพื่อการเรียนรู้และการนิเทศ ไม่ใช่เครื่องมือวินิจฉัย
- คะแนนแบบฝึกไม่ควรใช้เป็นหลักฐานความพร้อมทางวิชาชีพเพียงอย่างเดียว
- ก่อนใช้กับนักศึกษาจริง ควรกำหนดนโยบายเก็บรักษา ลบ และเข้าถึงข้อมูลให้สอดคล้องกับ PDPA และนโยบายมหาวิทยาลัย
