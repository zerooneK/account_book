# Account Book — Web App สำหรับจดบัญชีรายรับ-รายจ่าย

ระบบบันทึกรายรับ-รายจ่ายส่วนบุคคลแบบครบวงจร (Income-Expense Tracker) ที่มาพร้อมกับระบบจัดการหลายบัญชีเงินฝาก การโอนเงินระหว่างบัญชีที่มีความแม่นยำสูง และการปรับแต่งหมวดหมู่ที่ยืดหยุ่น พัฒนาด้วย Next.js App Router, Drizzle ORM, SQLite และตกแต่งสไตล์ด้วย TailwindCSS v4 แบบพรีเมียม

---

## 🔗 Live Demo

**👉 [ทดลองใช้งานจริงได้ที่ account-book-blue.vercel.app](https://account-book-blue.vercel.app)**

- กด **สมัครสมาชิก (Sign Up)** ด้วยอีเมลและรหัสผ่านของคุณเอง เพื่อสร้างบัญชีทดลองใช้งานได้ทันที
- ข้อมูลของแต่ละผู้ใช้แยกจากกันโดยสมบูรณ์ แต่เว็บนี้เป็นเดโมสาธารณะ จึงไม่ควรกรอกข้อมูลทางการเงินหรือรหัสผ่านจริงที่ใช้ที่อื่น
- Deploy บน [Vercel](https://vercel.com/) และใช้ฐานข้อมูล [Turso](https://turso.tech/) (รายละเอียดอยู่ในหัวข้อ [Vercel & Turso Deployment Guide](#-การติดตั้งใช้งานจริงบนระบบคลาวด์-vercel--turso-deployment-guide))

---

## ✨ ฟีเจอร์หลัก (Key Features)

- **👤 ระบบล็อกอิน & สมัครสมาชิก (Authentication):** ใช้ NextAuth.js ในการควบคุมสิทธิ์การเข้าถึงข้อมูลของผู้ใช้งานแต่ละคนแบบแยกอิสระ พร้อมระบบเข้ารหัสรหัสผ่านที่ปลอดภัยด้วย `bcryptjs`
- **🛡️ ระบบแบ่งสิทธิ์ & แผงควบคุมผู้ดูแลระบบ (Admin Panel & RBAC):** มีระบบจัดการระดับสิทธิ์ผู้ใช้งาน (`USER` และ `ADMIN`) โดย Admin สามารถเข้าสู่หลังบ้านหน้า `/admin` เพื่อเรียกดูผู้ใช้ทั้งหมด เพิ่มผู้ใช้งานใหม่ หรือลบผู้ใช้ได้ (การลบผู้ใช้จะลบประวัติบัญชี หมวดหมู่ และธุรกรรมทั้งหมดของผู้ใช้รายนั้นออกทันทีผ่านระบบ Cascade Delete)
- **🏦 จัดการหลายบัญชีการเงิน (Multi-Account Management):** สามารถสร้าง แก้ไขยอดเงินเริ่มต้น และลบบัญชีเงินได้หลายรูปแบบ เช่น บัญชีธนาคาร (Bank), เงินสด (Cash), หรือบัตรเครดิต (Credit Card)
- **📉 บันทึกธุรกรรม (Transaction Logging):** รองรับการบันทึกรายการเคลื่อนไหวทั้งแบบ **รายรับ (Income)**, **รายจ่าย (Expense)**, และการ **โอนเงินข้ามบัญชี (Transfer)** พร้อมทั้งเปิดให้ผู้ใช้สามารถกด **แก้ไขธุรกรรม (Edit Transaction)** ได้ตลอดเวลา
- **🔐 ธุรกรรมทางการเงินที่ปลอดภัย (ACID Database Transactions):** การหักลบ/โอนย้ายเงินข้ามบัญชี หรือการปรับย้อนคืนยอดเงินเมื่อผู้ใช้ลบ/แก้ไขธุรกรรม จะทำงานผ่าน Database Transaction ของ Drizzle ORM เสมอ เพื่อรับประกันความถูกต้องแม่นยำสูง
- **🏷️ ระบบจัดการหมวดหมู่ (Custom Categories):**
  - มีหมวดหมู่ตั้งต้นของระบบ (System Defaults) แสดงผลเป็น Emoji สีสันสวยงาม (เช่น 💼, 📈, 🍔, 🚗)
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
│   │   ├── actions/       # Server Actions ของ Accounts, Categories, Transactions, Admin
│   │   ├── api/           # API Endpoints (เช่น /register, NextAuth handlers)
│   │   ├── auth/          # หน้า SignIn และ SignUp
│   │   ├── admin/         # หน้าแผงควบคุมหลักของผู้ดูแลระบบ (Admin Panel)
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

### 4. รัน Seed ข้อมูลระบบเริ่มต้น (Default Categories & Admin User)

รันคำสั่ง Seed เพื่อลงทะเบียนข้อมูลหมวดหมู่ตั้งต้น และสร้างบัญชี Admin โดยกำหนดอีเมลและรหัสผ่านผ่าน environment variable (รหัสผ่านอย่างน้อย 12 ตัวอักษร):

```bash
ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="รหัสผ่านของคุณ" npx tsx src/db/seed.ts
```

> [!IMPORTANT]
> สคริปต์ Seed ไม่มีรหัสผ่านตั้งต้นอยู่ในโค้ดและจะหยุดทำงานถ้าไม่ได้ตั้งค่าทั้งสองตัวแปร
>
> - เมื่อเข้าสู่ระบบแล้ว เมนู "Admin" จะปรากฏบนแถบนำทาง (Navbar) เพื่อจัดการผู้ใช้ได้ทันที
> - ในโหมด production ต้องตั้ง `NEXTAUTH_SECRET` ด้วย ไม่เช่นนั้นระบบล็อกอินจะไม่ทำงาน

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
- **Integration Tests:**
  - ทดสอบธุรกรรมการเงินข้ามตาราง การฝาก, การถอน, การโอนเงินข้ามบัญชี และการกู้ยอดคืน (Revert balance) เมื่อลบหรือแก้ไขข้อมูลธุรกรรม
  - ทดสอบการเข้าถึงระดับสิทธิ์ Role-Based Access Control และบล็อกการลบ ID ตัวเองของ Admin

### ตรวจสอบมาตรฐานฟอร์แมตและสไตล์โค้ด:

```bash
npm run lint
npm run format
```

---

---

## 🎨 ระบบสลับธีมสี (Light / Dark Mode Switcher)

แอปพลิเคชันรองรับการสลับสไตล์ระหว่าง **ธีมสว่าง (Light Mode)** และ **ธีมมืด (Dark Mode)** เพื่อความสบายตาในการใช้งาน โดยจะจำค่าธีมที่ผู้ใช้เลือกผ่าน `localStorage` โดยอัตโนมัติ

- **ปุ่มสลับธีม:** อยู่บนแถบนำทาง (Navbar) ตกแต่งด้วย **Gooey Effect** ไหลลื่นแบบของเหลวระหว่างสลับสถานะ
- **ความเข้ากันได้:** ระบบดีไซน์รองรับการสลับหน้าจอโปร่งแสงกระจก (Glassmorphism) ในทั้งสองธีมสีอย่างลงตัวผ่าน TailwindCSS v4

---

## 🤖 การจัดทำเอกสารและบูรณาการ LangChain OpenWiki

โปรเจกต์นี้ได้รับการติดตั้งระบบ **LangChain OpenWiki** ซึ่งเป็นผู้ช่วยเอกสาร AI-Ready Documentation CLI เพื่อวิเคราะห์ประวัติ Git และเขียนเอกสารสรุปความสัมพันธ์ของระบบลงในไดเรกทอรี `openwiki/` โดยอัตโนมัติ ช่วยลดปัญหาความล้นของบริบทโค้ด (Context Bloating) ของ AI Coding Agent

### 🛠️ วิธีการตั้งค่าผู้ให้บริการโมเดลผ่าน OpenRouter (โมเดล `tencent/hy3:free`)

ในกรณีที่คุณใช้งานร่วมกับ OpenRouter และต้องการใช้โมเดลฟรีรุ่นประหยัด `tencent/hy3:free` สามารถตั้งค่าง่ายๆ ดังนี้:

#### 1. การใส่ API Key ของ OpenRouter

ให้สร้างไฟล์ `.env` ไว้ที่โฟลเดอร์หลักของโปรเจกต์ (หรือบันทึกในระบบ Environment Variables ของคุณ) จากนั้นเพิ่มคีย์ต่อไปนี้:

```env
OPENROUTER_API_KEY="คีย์_openrouter_ของคุณที่นี่"
```

#### 2. รันสคริปต์เริ่มต้นของ OpenWiki (Interactive Setup)

เปิดเทอร์มินัลและพิมพ์คำสั่ง:

```bash
npm run openwiki:init
```

- ในหน้าตั้งค่า ให้ระบุผู้ให้บริการโมเดล (Model Provider) เป็น **openrouter**
- เมื่อระบบถามหาโมเดล ให้ระบุชื่อโมเดลเป็น **tencent/hy3:free**
- ระบบจะนำ OpenRouter API Key และการตั้งค่าโมเดลไปจัดเก็บอย่างปลอดภัยภายนอกโปรเจกต์ที่ไดเรกทอรีผู้ใช้ของคุณ (`~/.openwiki/.env`)

#### 3. สั่งอัปเดตหรือพูดคุยเกี่ยวกับเอกสาร

- **อัปเดตเอกสารอัตโนมัติจากโค้ดใหม่:**
  ```bash
  npm run openwiki:update
  ```
- **เปิดแชทคุยเพื่อถามเกี่ยวกับระบบโค้ดอิงตามเอกสาร:**
  ```bash
  npm run openwiki:chat
  ```

---

## 🌐 การติดตั้งใช้งานจริงบนระบบคลาวด์ (Vercel & Turso Deployment Guide)

โปรเจกต์นี้ได้รับการปรับแต่งให้พร้อมสำหรับการ Deploy ขึ้นเซิร์ฟเวอร์แบบไร้เซิร์ฟเวอร์ (Serverless) บน **Vercel** และเชื่อมต่อกับฐานข้อมูล SQLite บนคลาวด์ของ **Turso** ได้อย่างรวดเร็ว

### ขั้นตอนที่ 1: เตรียมฐานข้อมูล Turso (Cloud LibSQL)

1. สมัครใช้งานเว็บไซต์ [Turso](https://turso.tech/) (ฟรีเทียร์ Starter Plan)
2. สร้างฐานข้อมูลใหม่ เช่น `account-book` ด้วยการกำหนด Location ใกล้เคียง (เช่น **AWS Tokyo** หรือ **Singapore**)
3. บันทึกค่า **DATABASE_URL** (ตัวอย่าง: `libsql://account-book-ชื่อผู้ใช้.turso.io`)
4. สร้างโทเค็นรหัสผ่านในการเชื่อมต่อ เพื่อเอา **DATABASE_AUTH_TOKEN**

### ขั้นตอนที่ 2: ตั้งค่า Vercel Deployment

1. ล็อกอินเข้าใช้งาน [Vercel](https://vercel.com/) และสั่ง Import Repository นี้จาก GitHub ของคุณ
2. ในหน้าการตั้งค่าแอปพลิเคชัน (Project Settings) ให้เพิ่ม **Environment Variables** ดังนี้:
   - `DATABASE_URL`: ลิงก์เชื่อมต่อจาก Turso
   - `DATABASE_AUTH_TOKEN`: โทเค็นที่ได้จาก Turso
   - `NEXTAUTH_SECRET`: คีย์เข้ารหัสล็อกอิน โดยใช้คำสั่งสร้างสุ่มใน PowerShell:
     ```powershell
     [Convert]::ToBase64String((1..32 | % { [byte](Get-Random -Min 0 -Max 256) }))
     ```
   - `NEXTAUTH_URL`: ลิงก์โดเมนหลักของแอปคุณบน Vercel (เช่น `https://account-book.vercel.app`)

### ขั้นตอนที่ 3: สั่งรันตารางข้อมูล (Migration) สู่คลาวด์

ในการสร้างตารางฐานข้อมูลและลงทะเบียนแอดมินเริ่มต้นขึ้นระบบคลาวด์ ให้รันคำสั่งโดยรวม URL และ Token เข้าด้วยกันเป็น Query Parameter ในเทอร์มินัลของคุณ:

```powershell
# สำหรับ Windows (PowerShell) - รวม URL และ Token ด้วย ?authToken=
$env:DATABASE_URL="libsql://your-db-url.turso.io?authToken=your-token"
npx drizzle-kit push
npx tsx src/db/seed.ts
```

หรือหากใช้ Mac/Linux (Bash):

```bash
DATABASE_URL="libsql://your-db-url.turso.io?authToken=your-token" npx drizzle-kit push
DATABASE_URL="libsql://your-db-url.turso.io?authToken=your-token" npx tsx src/db/seed.ts
```

เมื่อดำเนินการเสร็จสิ้น เว็บไซต์ของคุณจะสามารถรันและเข้าถึงได้ตลอด 24 ชั่วโมงโดยไม่ต้องเปิดเครื่องทิ้งไว้ครับ!

---

## 📐 รายละเอียดไดอะแกรมการออกแบบ (Architecture Diagrams)

คุณสามารถเปิดดูแผนภาพการทำงานเชิงลึกของโปรเจกต์ ทั้งตัวแผนภาพ **System Architecture**, **ERD** (ตารางฐานข้อมูล) และ **Sequence Diagram** (การไหลของข้อมูลการโอนเงิน) ได้โดยเปิดไฟล์นี้บนเว็บเบราว์เซอร์:

- [docs/architecture.html](file:///d:/Account_Book/docs/architecture.html) (มีปุ่ม Zoom In/Out และปุ่ม Reset ขนาดได้ง่าย)
