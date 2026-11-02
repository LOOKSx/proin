# ProIM (Intern Manager) - ระบบบริหารจัดการการฝึกงานครบวงจร

ระบบบริหารจัดการการฝึกงานระดับมืออาชีพ (Internship Management System) ที่ออกแบบมาเพื่อเชื่อมโยงและบริหารจัดการระหว่าง **นักศึกษา (Student)**, **อาจารย์ที่ปรึกษา/อาจารย์นิเทศก์ (Advisor)**, **สถานประกอบการ/พี่เลี้ยง (Company/Mentor)** และ **ผู้ดูแลระบบ (Admin)** 

---

## 📂 โครงสร้างไฟล์ในไดเรกทอรี `D:\proin`

| ไฟล์ | รายละเอียด |
| :--- | :--- |
| `index.html` | ไฟล์หน้าเว็บหลัก (เชื่อมต่อไปยัง Backend API `https://proim.vercel.app/api`) |
| `index-offline.html` | ไฟล์หน้าเว็บโหมด Standalone / Offline (ใช้ Mock Data ในเครื่อง รันได้ทันทีโดยไม่ต้องต่อเน็ต) |
| `main-JILFQ4ED.js` | JavaScript Bundle หลักของระบบ (Production Build) |
| `main-offline.js` | JavaScript Bundle ที่เปิดใช้งานโหมด Mock Data ใน LocalStorage |
| `main-decoded.js` | ซอร์สโค้ดที่ผ่านการจัดรูปแบบ (Beautified) และถอดรหัสข้อความภาษาไทยครบถ้วน ทำให้อ่านและวิเคราะห์ตรรกะได้สะดวก |
| `styles-GW5BMILI.css` | ไฟล์ CSS สไตล์ชีตหลัก (Tailwind CSS + แอนิเมชันเฉพาะตัว) |
| `server.js` | เซิร์ฟเวอร์ Node.js (Zero-dependency) สำหรับรัน Static Frontend และทำหน้าที่ Reverse Proxy API |
| `start.bat` | ไฟล์สคริปต์คลิกเดียวสำหรับเริ่มเซิร์ฟเวอร์บน Windows (`http://localhost:3000`) |
| `manifest.json` | PWA Web App Manifest |
| `logo.jpg` / `favicon.ico` | โลโก้และไอคอนของระบบ ProIM |

---

## 🚀 วิธีการเปิดใช้งานระบบ (Quick Start)

### วิธีที่ 1: รันผ่าน Node.js Local Server (แนะนำ)
1. ดับเบิ้ลคลิกไฟล์ `start.bat` หรือเปิด Terminal/PowerShell แล้วพิมพ์:
   ```bash
   node server.js
   ```
2. ระบบจะเปิดเบราว์เซอร์ให้อัตโนมัติที่ `http://localhost:3000`
3. ในโหมดนี้ หน้าเว็บจะเชื่อมต่อกับ API โดยตรงผ่าน Reverse Proxy

### วิธีที่ 2: รันโหมด Standalone / Offline (ไม่ต้องใช้เซิร์ฟเวอร์หรืออินเทอร์เน็ต)
1. เปิดผ่าน Local Web Server หรือเปิดหน้า `http://localhost:3000/index-offline.html`
2. ข้อมูลทั้งหมดจะถูกจำลองและบันทึกลงใน `localStorage` ของเบราว์เซอร์
3. สามารถทดสอบฟังก์ชันการทำงานทุกอย่างได้ทันที

#### บัญชีสำหรับทดสอบในโหมด Offline:
* **Admin (ผู้ดูแลระบบ):**
  * Email: `admin@gmail.com`
  * Password: `;bT;bomN`
* **รหัสลงทะเบียน (Enrollment / Invitation Codes):**
  * นักศึกษา (Bangkok University): `BU-STU-2026`
  * อาจารย์ (Bangkok University): `BU-ADV-2026`
  * นักศึกษา (Chulalongkorn University): `CU-STU-2026`
  * อาจารย์ (Chulalongkorn University): `CU-ADV-2026`
  * สถานประกอบการ (Company): `COMP-INV-2026`

---

## 🛠️ เทคโนโลยีที่ใช้ในระบบ (Tech Stack)

* **Frontend Framework:** Angular (Standalone Components, Signals, Modern Ivy Architecture)
* **Styling & UI:** Tailwind CSS, Custom Glassmorphism, Responsive Mobile & Desktop Layout
* **3D Particle Scene:** Three.js Particle Canvas ลอยแบบพารัลแลกซ์ (Parallax Background)
* **Map & Geolocation:** Leaflet.js + OpenStreetMap Tile Layer สำหรับระบบปักหมุด GPS และตรวจสอบรัศมีการเข้างาน (Geofencing)
* **IP Fallback:** Geolocation API ควบคู่กับ IP Geolocation (`ipapi.co`) เมื่อเบราว์เซอร์ไม่อนุญาตพิกัดดาวเทียม
* **Alerts & Modals:** SweetAlert2 สำหรับแจ้งเตือนและกล่องยืนยันการทำรายการ
* **State & Storage:** RxJS Signals / LocalStorage (`intern-manager-state-v2`, `intern-manager-api-token-v1`)

---

## 👥 บทบาทผู้ใช้งาน (User Roles & Permissions)

ระบบแบ่งผู้ใช้งานออกเป็น 4 บทบาทหลัก:

### 1. นักศึกษา (Student)
* ค้นหาและดูตำแหน่งฝึกงานที่เปิดรับ
* สมัครฝึกงาน (จำกัดสมัครได้เฉพาะสถานะที่ยังไม่มีที่ฝึกงานที่กำลังดำเนินการ)
* บันทึกเวลาเข้า-ออกงาน (Check-In / Check-Out) ด้วยพิกัด GPS ตรวจจับระยะห่างจากบริษัท หรือเลือก Work From Home (WFH)
* บันทึกสมุดบันทึกการฝึกงานประจำวัน/สัปดาห์ (Logbook) แนบลิงก์และไฟล์ผลงาน
* ยื่นคำขอลา (ลากิจ, ลาป่วย, ลาอื่นๆ) พร้อมระบุเหตุผลและช่วงเวลา
* ดูงานที่ได้รับมอบหมาย (Classwork / Assignments) และส่งงาน (Submissions)
* ดูผลการประเมินการฝึกงานจากอาจารย์และพี่เลี้ยง
* แจ้งปัญหาผ่านระบบ Support Tickets

### 2. อาจารย์ที่ปรึกษา / อาจารย์นิเทศก์ (Advisor)
* ตรวจสอบรายชื่อและข้อมูลนักศึกษาในสังกัดมหาวิทยาลัย/วิทยาลัย
* ติดตามสถานะการฝึกงานของนักศึกษาทุกคน
* ตรวจสอบเวลาเข้างาน (Attendance) และสมุดบันทึกการปฏิบัติงาน (Logbooks) ของนักศึกษา
* มอบหมายงาน (Assignments) ให้นักศึกษารายคนหรือตามกลุ่มเรียน
* ตรวจงานและให้คะแนนงานที่นักศึกษาส่ง (Grading & Feedback)
* ประเมินผลการฝึกงานของนักศึกษา (Advisor Evaluation) ตามเกณฑ์และเทมเพลตที่กำหนด
* สร้างและจัดการแบบประเมินผล (Evaluation Templates & Criteria)
* เปิดคำร้องแจ้งปัญหา (Tickets)

### 3. สถานประกอบการ / พี่เลี้ยง (Company / Mentor)
* จัดการข้อมูลบริษัท ที่ตั้งบนแผนที่ (Latitude, Longitude) และกำหนดรัศมีเช็คอิน (Check-in Radius)
* ประกาศตำแหน่งงานฝึกงาน (Job Postings) ระบุเวลาเข้างาน, เวลาเริ่มสาย, วันทำงาน, สวัสดิการ และจำนวนที่รับ
* ตรวจสอบและคัดกรองใบสมัครฝึกงาน (Applications) - อนุมัติ / ปฏิเสธ
* ตรวจสอบเวลาเข้างานของนักศึกษาแบบเรียลไทม์ (ระบบแจ้งเตือนเมื่ออยู่นอกรัศมี Geofence)
* ตรวจและให้ข้อเสนอแนะในสมุดบันทึกการฝึกงาน (Logbooks Feedback)
* พิจารณาอนุมัติคำขอลางานของนักศึกษา (Leave Approvals)
* สั่งงาน (Assignments) ระบุตำแหน่งงานหรือนักศึกษาเฉพาะราย
* ประเมินผลนักศึกษาฝึกงาน (Mentor Evaluation)
* จัดการรหัสเชิญพนักงาน/พี่เลี้ยงในบริษัท (Company Employee Codes)

### 4. ผู้ดูแลระบบ (Admin)
* แดชบอร์ดภาพรวมสถิติระบบ (ผู้ใช้ทั้งหมด, การฝึกงานที่กำลังดำเนินการ, ตำแหน่งงาน, คำร้อง)
* จัดการผู้ใช้งานทั้งหมด (Users Management): อนุมัติ, แก้ไขบทบาท, ระงับการใช้งาน
* จัดการสถานศึกษา (Schools Management): เพิ่ม/ลบรายชื่อมหาวิทยาลัยและวิทยาลัย
* จัดการรหัสลงทะเบียน (Enrollment / Invitation Codes): สร้างรหัสเชิญแยกตามสถาบันและบทบาท พร้อมกำหนดวันหมดอายุและจำนวนครั้งที่ใช้ได้
* จัดการคำร้องแจ้งปัญหา (Support Ticket Center): ตอบกลับและปรับสถานะปัญหา (Open, In Progress, Resolved)
* เครื่องมือจัดการฐานข้อมูล (Database Schema Workbench):
  * ตรวจสอบโครงสร้างตาราง (DESCRIBE Table)
  * รันคำสั่ง SQL Query ได้โดยตรง
  * ดูประวัติการรันคำสั่ง (Query History)
  * ส่งออกผลลัพธ์ข้อมูลเป็นไฟล์ CSV (Export to CSV)

---

## 📊 โครงสร้างฐานข้อมูล (Database Schema & Entities)

ระบบมีการจำลองโครงสร้างฐานข้อมูลแบบ Relational Database ครอบคลุมเอนทิตีดังนี้:

1. **`users`** - ข้อมูลผู้ใช้งาน, อีเมล, รหัสผ่าน, บทบาท (Role), สถาบัน, สาขา, ชั้นปี, กลุ่มเรียน, โปรไฟล์
2. **`companies`** - ข้อมูลสถานประกอบการ, ที่อยู่, พิกัดละติจูด/ลองจิจูด, รัศมีตรวจจับการเข้างาน (เมตร)
3. **`job_postings`** - ตำแหน่งงานฝึกงาน, คุณสมบัติ, สวัสดิการ, เวลาเข้า-ออกงาน, เวลาสาย, วันทำงาน, จำนวนที่รับ
4. **`applications`** - รายการสมัครงาน, วันที่สมัคร, สถานะ (pending, accepted, rejected)
5. **`internships`** - ข้อมูลการฝึกงานที่ได้รับการอนุมัติ (Active, Completed, Terminated)
6. **`attendances`** - ประวัติการลงเวลา, พิกัด Check-in / Check-out, สถานะตรวจรับรอง, หมายเหตุ, WFH Flag
7. **`logbooks`** - บันทึกการฝึกงานรายวัน, หัวข้อ, รายละเอียดงาน, ไฟล์แนบ, ความเห็นพี่เลี้ยง
8. **`leaves`** - คำขอลางาน, ประเภทการลา, วันที่เริ่ม-สิ้นสุด, เหตุผล, สถานะอนุมัติ
9. **`assignments`** - งานที่มอบหมาย, กำหนดส่ง, คะแนนเต็ม, ผู้สร้าง (อาจารย์ หรือ บริษัท)
10. **`submissions`** - งานที่นักศึกษาส่ง, ไฟล์แนบ, คะแนนที่ได้, ข้อเสนอแนะ (Feedback)
11. **`evaluation_templates`** - เทมเพลตแบบประเมินผลการฝึกงาน
12. **`evaluation_criteria`** - หัวข้อเกณฑ์การให้คะแนนในแต่ละเทมเพลต (คะแนนรวมไม่เกิน 100)
13. **`evaluations`** & **`evaluation_scores`** - ผลคะแนนการประเมินแยกตามรายหัวข้อ
14. **`schools`** - รายชื่อสถาบันการศึกษา
15. **`enrollment_codes`** - รหัสลงทะเบียนเข้าใช้งานระบบ
16. **`tickets`** & **`ticket_replies`** - ระบบสนับสนุนและแจ้งปัญหา
