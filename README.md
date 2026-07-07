# Account Book — Web App สำหรับจดบัญชีรายรับ-รายจ่าย

ระบบบันทึกรายรับ-รายจ่ายส่วนบุคคลแบบครบวงจร (Income-Expense Tracker) ที่มาพร้อมกับระบบจัดการหลายบัญชีเงินฝาก การโอนเงินระหว่างบัญชีที่มีความแม่นยำสูง และการปรับแต่งหมวดหมู่ที่ยืดหยุ่น พัฒนาด้วย Next.js App Router, Drizzle ORM, SQLite และตกแต่งสไตล์ด้วย TailwindCSS v4 แบบพรีเมียม

---

## ✨ ฟีเจอร์หลัก (Key Features)

- **👤 ระบบล็อกอิน & สมัครสมาชิก (Authentication):** ใช้ NextAuth.js ในการควบคุมสิทธิ์การเข้าถึงข้อมูลของผู้ใช้งานแต่ละคนแบบแยกอิสระ พร้อมระบบเข้ารหัสรหัสผ่านที่ปลอดภัยด้วย `bcryptjs`
- **🏦 จัดการหลายบัญชีการเงิน (Multi-Account Management):** สามารถสร้าง แก้ไขยอดเงินเริ่มต้น และลบบัญชีเงินได้หลายรูปแบบ เช่น บัญชีธนาคาร (Bank), เงินสด (Cash), หรือบัตรเครดิต (Credit Card)
- **📉 บันทึกธุรกรรม (Transaction Logging):** รองรับการบันทึกรายการเคลื่อนไหวทั้งแบบ **รายรับ (Income)**, **รายจ่าย (Expense)** และการ **โอนเงินข้ามบัญชี (Transfer)**
- **🔐 ธุรกรรมทางการเงินที่ปลอดภัย (ACID Database Transactions):** การหักลบ/โอนย้ายเงินข้ามบัญชีจะทำงานผ่าน Database Transaction ของ Drizzle ORM เสมอ เพื่อรับประกันว่าเงินคงเหลือในทุกบัญชีจะไม่มีทางเกิดข้อผิดพลาด แม้ระบบเครือข่ายจะขัดข้องในขณะทำธุรกรรม
- **🏷️ ระบบจัดการหมวดหมู่ (Custom Categories):**
  - มีหมวดหมู่ตั้งต้นของระบบ (System Defaults) ให้ใช้งานทันที เช่น อาหาร, การเดินทาง, ช้อปปิ้ง, เงินเดือน
  - ผู้ใช้สามารถสร้างและลบหมวดหมู่เฉพาะตัวของตัวเองได้ตามใจชอบ พร้อมเครื่องมือเลือกสี (Hex Colors) และอีโมจิ (Emojis) สำหรับแสดงไอคอน
- **📊 แผงสรุปแดชบอร์ด (Financial Dashboard):** สรุปสินทรัพย์สุทธิ (Net Balance), อัตราการเข้า/ออกของเงินรายเดือน, และสัดส่วนค่าใช้จ่ายจำแนกตามหมวดหมู่ในรูปแบบของ Progress Bar
- **🔍 ระบบกรองและค้นหา (Filtering & Search):** ค้นหารายการบันทึกย้อนหลังผ่านช่องค้นหา หรือกรองตามบัญชีและประเภทธุรกรรม (รายรับ/รายจ่าย/โอนเงิน) ได้ในหน้าเดียว

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** SQLite (ผ่าน `@libsql/client` เสถียรและเร็วสูง)
- **ORM:** Drizzle ORM (Type-safe และน้ำหนักเบา)
- **Styling:** TailwindCSS v4 (Utility-first, รวดเร็วและทันสมัยที่สุด)
- **Testing:** Vitest + jsdom + React Testing Library
- **Quality & CI/CD Guard:** ESLint, Prettier, Husky, lint-staged (ป้องกันการ commit โค้ดที่ติด error)

---

## 📂 โครงสร้างไดเรกทอรี (Directory Structure)

```text
Account_Book/
├── .agents/               # โฟลเดอร์เก็บกฎเกณฑ์และขอบเขตเฉพาะของโปรเจกต์
├── .husky/                # การตั้งค่า Git Hooks สำหรับ pre-commit check
├── docs/                  # เอกสารและแผนภาพระบบ (System Architecture, ERD, Sequence)
├── drizzle/               # ไฟล์ประวัติ SQL Migrations ที่สร้างจาก Drizzle Kit
├── src/
│   ├── app/               # Next.js App Router (Pages, Layouts, Server Actions)
│   │   ├── actions/       # Server Actions ของ Accounts, Categories, Transactions
│   │   ├── api/           # API Endpoints (เช่น /register, NextAuth handlers)
│   │   ├── auth/          # หน้า SignIn และ SignUp
│   │   └── ...            # หน้า Dashboard, Accounts, Categories, Transactions
│   ├── components/        # UI Components ที่ใช้งานร่วมกัน (เช่น Navbar, Providers)
│   ├── db/                # การตั้งค่า Drizzle Schema และ Database Clients
│   ├── lib/               # Utility ฟังก์ชัน (เช่น ตัวเชื่อม DB ทดสอบ In-memory)
│   └── types/             # ไฟล์ขยาย TypeScript Definitions (เช่น NextAuth session ID)
├── tsconfig.json          # การตั้งค่า TypeScript compiler
├── vitest.config.ts       # การตั้งค่าเฟรมเวิร์กการรันเทส Vitest
└── drizzle.config.ts      # โครงสร้างคอนฟิก Drizzle Kit
```

---

## 🚀 เริ่มต้นติดตั้งและใช้งาน (Getting Started)

### 1. การเตรียมความพร้อม

ตรวจสอบให้มั่นใจว่าเครื่องของคุณได้ติดตั้ง [Node.js](https://nodejs.org/) เวอร์ชัน 18+ ขึ้นไปแล้ว

### 2. ติดตั้ง Dependencies ทั้งหมด

```bash
npm install
```

### 3. ตั้งค่าระบบควบคุมคุณภาพและทดสอบ (Husky & DB Setup)

สั่งรันคำสั่ง Migration เพื่อสร้างไฟล์ฐานข้อมูล `local.db` และสร้างตารางทั้งหมด:

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

### 4. รัน Seed ข้อมูลระบบเริ่มต้น (Default Categories)

```bash
npx tsx src/db/seed.ts
```

### 5. เปิดใช้งาน Local Development Server

```bash
npm run dev
```

จากนั้นเข้าชมหน้าเว็บได้ผ่านทาง: [http://localhost:3000](http://localhost:3000)

---

## 🧪 การตรวจสอบและการรันเทส (Testing & Quality Control)

โปรเจกต์นี้มีระบบตรวจสอบคุณภาพโค้ดที่รัดกุมมาก โดยโค้ดจะต้องผ่านการตรวจสอบ ESLint, Prettier format และรัน Vitest ให้ผ่านทั้งหมดก่อนที่จะกดยืนยันการ Commit ลงในระบบ Git ได้

### รันชุดทดสอบ (Vitest) แบบ Manual:

```bash
npm run test:run
```

ชุดทดสอบจะรันครอบคลุม:

- **Unit Tests:** ความถูกต้องในการสมัครสมาชิกและตรวจสอบการเข้ารหัสผ่าน
- **Integration Tests:** ทดสอบธุรกรรมการเงินข้ามตาราง การฝาก, การถอน, การโอนเงินข้ามบัญชี และการกู้ยอดคืน (Revert balance) เมื่อมีการลบข้อมูลจริง

### ตรวจสอบมาตรฐานฟอร์แมตและสไตล์โค้ด:

```bash
npm run lint
npm run format
```

---

## 📐 รายละเอียดไดอะแกรมการออกแบบ (Architecture Diagrams)

คุณสามารถเปิดดูแผนภาพการทำงานเชิงลึกของโปรเจกต์ ทั้งตัวแผนภาพ **System Architecture**, **ERD** (ตารางฐานข้อมูล) และ **Sequence Diagram** (การไหลของข้อมูลการโอนเงิน) ได้โดยเปิดไฟล์นี้บนเว็บเบราว์เซอร์:

- [docs/architecture.html](file:///d:/Account_Book/docs/architecture.html) (มีปุ่ม Zoom In/Out และปุ่ม Reset ขนาดได้ง่าย)
