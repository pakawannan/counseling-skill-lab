# เริ่มพัฒนาด้วย Claude

## วิธีใช้

1. แตกไฟล์ ZIP
2. อัปโหลดโฟลเดอร์ทั้งหมดเข้า Claude Project หรือเปิดด้วย Claude Code
3. ให้ Claude อ่าน `CLAUDE.md`, `README_DEV.md` และ `HTML_BACKEND_GUIDE.md` ก่อน
4. ส่ง Prompt ด้านล่าง

## Prompt เริ่มต้น

```text
โปรเจกต์นี้คือ Counseling Skill Lab ระบบฝึกทักษะการปรึกษาสำหรับนักศึกษา

ก่อนทำงาน:
1. อ่าน CLAUDE.md และ README_DEV.md ให้ครบ
2. ตรวจโครงสร้างโปรเจกต์และสรุปสถาปัตยกรรมปัจจุบัน
3. ห้ามแก้เนื้อหาวิชาการ เฉลย การอ้างอิง จริยธรรม และข้อความด้านความปลอดภัยโดยไม่ได้รับอนุญาต
4. รักษาระบบตรวจสิทธิ์หน้าอาจารย์ที่ฝั่ง server
5. รักษาข้อมูลส่วนบุคคลและไม่แสดง answer key ก่อนนักศึกษาส่งคำตอบ
6. ใช้ภาษาไทยที่เป็นธรรมชาติ โดย Cl เป็นภาษาพูดของผู้รับบริการ และ Co เป็นภาษาพูดของผู้ให้การปรึกษาที่สุภาพ กระชับ และไม่ตัดสิน

ขั้นแรกยังไม่ต้องแก้โค้ด ให้:
- ตรวจว่าโปรเจกต์ติดตั้งและ build ได้หรือไม่
- ระบุ environment variables และฐานข้อมูลที่ต้องตั้งค่า
- บอกส่วนที่ผูกกับ OpenAI Sites และส่วนที่ต้องเปลี่ยนหากนำไป deploy ที่อื่น
- เสนอแผนพัฒนาต่อแบบเป็นขั้นตอน โดยยังไม่ลงมือจนกว่าฉันจะอนุมัติ
```

## หากใช้ Claude Artifacts

โครงการนี้เป็น full-stack application จึงไม่ควรคัดลอกเฉพาะไฟล์ HTML ไปไว้ใน Artifact เพราะ API, authentication และฐานข้อมูลจะไม่ทำงานครบ แนะนำให้ใช้ Claude Code หรือ Claude Project ที่รองรับ repository และการรันคำสั่ง

## หากย้ายไปแพลตฟอร์มอื่น

แจ้ง Claude ให้ทราบชื่อแพลตฟอร์มปลายทาง เช่น Cloudflare, Vercel, Supabase หรือ Firebase แล้วให้จัดทำ migration plan ก่อนแก้โค้ด โดยเฉพาะ:

- authentication ของอาจารย์
- D1 database adapter
- environment variables
- database migrations
- deployment configuration
