# Counseling Skill Lab — HTML + Backend

ชุดนี้มีหน้าบ้าน HTML/CSS/JavaScript แบบไม่ใช้ React อยู่ใน `html-client/` และใช้ Backend/API กับฐานข้อมูลชุดเดิมของโครงการ

## โครงสร้าง

- `html-client/index.html` — หน้าแรก การเข้าสู่ห้อง Student Dashboard คลังบทเรียน และคะแนน
- `html-client/styles.css` — สี ฟอนต์ responsive layout dark mode และ accessibility
- `html-client/app.js` — session นักศึกษา เรียก API แสดงความก้าวหน้า บทเรียน และคะแนน
- `html-client/data/` และ `html-client/assets/` — ข้อมูลบทเรียนและภาพที่หน้า HTML เรียกใช้โดยตรง
- `html-client/teacher.html` — หน้าจัดการห้องและสรุปผลของอาจารย์
- `html-client/teacher.js` — สร้าง/ลบห้อง คัดลอกลิงก์เชิญ และอ่านผลรายห้อง
- `app/api/` — Backend API ที่ใช้งานจริง
- `db/` และ `drizzle/` — schema และ migrations สำหรับฐานข้อมูล Cloudflare D1
- `app/data/` — คลังบทเรียนและข้อคำถาม

## เรื่องสำคัญก่อน Deploy

ไฟล์ HTML ต้องถูกเสิร์ฟจาก origin เดียวกับ API หรือกำหนด `API` ใน `html-client/app.js` และตั้ง CORS อย่างจำกัด ห้ามเปิด CORS แบบ `*` สำหรับ endpoint ที่มีข้อมูลนักศึกษา

หน้าอาจารย์ไม่พึ่งการซ่อน UI: ทุก endpoint ใน `app/api/teacher/` เรียก `requireTeacherApi()` เพื่อตรวจสิทธิ์ฝั่ง Backend อยู่แล้ว ต้องเชื่อมระบบยืนยันตัวตนของผู้ให้บริการใหม่ให้ฟังก์ชันนี้ก่อนเผยแพร่

## Prompt สำหรับ Claude

```text
โปรดอ่าน CLAUDE.md, README_DEV.md และ HTML_BACKEND_GUIDE.md ทั้งหมดก่อนแก้โค้ด

งานนี้เป็น Counseling Skill Lab สำหรับนักศึกษาจิตวิทยาการปรึกษา หน้าบ้านแบบ Vanilla HTML อยู่ใน html-client/ และ Backend/API อยู่ใน app/api/ โดยมีฐานข้อมูลใน db/ และ drizzle/

1. รักษา API contract เดิมและการตรวจสิทธิ์อาจารย์ฝั่ง Backend
2. ห้ามย้าย PIN, token หรือข้อมูลนักศึกษาไปไว้ใน HTML
3. ทดสอบ student register, session restore, dashboard, scores, room create/delete และ teacher authorization
4. ปรับ static asset path และ data path ให้เหมาะกับ platform ที่จะ deploy
5. หากย้ายออกจาก Cloudflare D1 ให้เขียน adapter และ migration plan ก่อน ห้ามเปลี่ยน query โดยไม่มีการทดสอบ
6. รักษาข้อกำหนดเนื้อหา จริยธรรม และภาษาใน CLAUDE.md
7. ก่อนลงมือแก้ ให้รายงาน architecture, environment variables, authentication dependency และ deployment plan ที่เสนอ
```

## ขอบเขตของ HTML client

HTML client เป็นจุดเริ่มต้นที่อ่านและแก้ได้ง่าย รองรับ flow หลักของนักศึกษาและการจัดการห้องพื้นฐาน ส่วน Quiz Builder การตรวจอัตนัย และหน้าวิเคราะห์เชิงลึกยังมี implementation สมบูรณ์อยู่ใน React client เดิม สามารถให้ Claude ย้ายมาที่ `html-client/` ทีละโมดูลโดยใช้ API เดิมได้
