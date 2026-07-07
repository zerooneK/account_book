# System Architecture, ERD, and Sequence Diagrams

เอกสารนี้รวบรวมแผนภาพภาพรวมการทำงาน โครงสร้างฐานข้อมูล และขั้นตอนการทำงาน (Sequence) ของระบบบันทึกรายรับ-รายจ่ายที่สร้างขึ้นด้วย Next.js, Drizzle ORM และ SQLite

---

## 1. System Architecture Diagram

แผนภาพแสดงสถาปัตยกรรมการทำงานระดับแอปพลิเคชันจาก Frontend สู่ Database Layer:

```mermaid
graph TD
    subgraph Client [Browser / Frontend]
        UI["React UI (Next.js Pages)"] --> Tailwind["TailwindCSS v4 Styles"]
        UI --> Components["Client/Server Components"]
    end

    subgraph Server [Next.js Backend Server]
        Auth["NextAuth.js (Session Guard)"] --> Router["API Routes / Server Actions"]
        Router --> Logic["Business Logic & Calculations"]
        Logic --> Drizzle["Drizzle ORM Client"]
    end

    subgraph Database [Storage Layer]
        Drizzle --> LibSQL["@libsql/client (SQLite Driver)"]
        LibSQL --> DBFile[("SQLite DB (local.db)")]
        Drizzle -.-> InMemoryDB[("In-Memory SQLite (สำหรับ Testing)")]
    end

    UI -->|HTTPS Request / Server Actions| Auth
    Logic -.->|Run tests| InMemoryDB
```

---

## 2. Entity Relationship Diagram (ERD)

แผนภาพแสดงความสัมพันธ์ของข้อมูลใน SQLite ที่จัดการโดย Drizzle ORM:

```mermaid
erDiagram
    users {
        text id PK "Primary Key"
        text email "Unique Email"
        text password_hash "Hashed Password"
        text name "Display Name"
        integer created_at "Created Timestamp"
    }

    accounts {
        text id PK "Primary Key"
        text name "Account Name"
        text type "CASH or BANK or CREDIT_CARD"
        real balance "Current Balance"
        text user_id FK "Ref users"
        integer created_at "Created Timestamp"
    }

    categories {
        text id PK "Primary Key"
        text name "Category Name"
        text type "INCOME or EXPENSE"
        text color "Hex Color"
        text icon "Icon Name"
        text user_id FK "Ref users - null is system"
        integer created_at "Created Timestamp"
    }

    transactions {
        text id PK "Primary Key"
        real amount "Transaction Amount"
        text type "INCOME or EXPENSE or TRANSFER"
        text description "Note"
        integer date "Transaction Date"
        text user_id FK "Ref users"
        text account_id FK "Ref accounts"
        text category_id FK "Ref categories"
        text from_account_id FK "Transfer Source"
        text to_account_id FK "Transfer Destination"
        integer created_at "Created Timestamp"
    }

    users ||--o{ accounts : "owns"
    users ||--o{ categories : "manages"
    users ||--o{ transactions : "logs"
    accounts ||--o{ transactions : "has"
    categories ||--o{ transactions : "categorizes"
```

---

## 3. Sequence Diagram (Money Transfer Flow)

แผนภาพแสดงลำดับการทำงานของฟีเจอร์การโอนเงิน (Transfer) ข้ามบัญชีธนาคาร:

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Client UI)
    participant Page as Accounts/Transfer Page
    participant API as Next.js API/Action Route
    participant DB as SQLite DB (via Drizzle)

    User->>Page: กรอกข้อมูลโอนเงิน (จากบัญชี A ไป B ยอดเงิน 500฿)
    Page->>Page: ตรวจสอบความถูกต้องฝั่ง Client (ยอดเงิน > 0)
    Page->>API: POST /api/transactions/transfer { fromAccountId, toAccountId, amount }
    activate API
    API->>API: ตรวจสอบสิทธิ์ด้วย NextAuth (Session)
    alt Session Invalid / Unauthenticated
        API-->>Page: 401 Unauthorized Error
    else Session Valid
        API->>DB: เริ่มธุรกรรม (Database Transaction)
        activate DB
        DB->>DB: ตรวจสอบยอดคงเหลือของบัญชี A (ต้นทาง) ว่ามีพอหรือไม่?
        alt ยอดเงินคงเหลือไม่เพียงพอ
            DB-->>API: ยกเลิกธุรกรรม (Rollback) & แจ้งเตือนข้อผิดพลาด
            API-->>Page: 400 Bad Request (ยอดเงินในบัญชีต้นทางไม่พอ)
        else ยอดเงินเพียงพอ
            DB->>DB: หักเงินบัญชี A (ยอดเงินเดิม - 500฿)
            DB->>DB: เพิ่มเงินบัญชี B (ยอดเงินเดิม + 500฿)
            DB->>DB: เพิ่มข้อมูลลงตาราง transactions (type: TRANSFER, fromA, toB)
            DB-->>API: บันทึกความเปลี่ยนแปลง (Commit Transaction)
            deactivate DB
            API-->>Page: 200 OK (โอนเงินสำเร็จ)
        end
    end
    deactivate API
    Page->>User: แสดงหน้าต่างแจ้งเตือนสำเร็จ & อัปเดตยอดเงินบน UI
```
