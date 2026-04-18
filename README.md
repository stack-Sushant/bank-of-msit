# 🏦 Bank of MSIT — Banking Database Management System

A **DBMS project** built using HTML, CSS, JavaScript and SQLite (via sql.js).  
The entire system runs in the browser — no installation, no backend, no server required.

---

## 👥 Team Members

| Name | Role |
|------|------|
| Sushant | Database Logic (`script.js`) |
| Mayank | Structure & Pages (`index.html`) |
| Aarushi | Styling & Design (`style.css`) |
| Ananya | Testing & SQL Queries |

---

## 📌 Project Overview

This project implements a simplified **Banking System Database** covering:

- Branch management
- Customer records
- Account operations (Savings, Current, Fixed Deposit, Recurring Deposit)
- Financial transactions (Deposit, Withdrawal, Transfer)
- Live SQL Console for running queries
- Export / Import database as `.sqlite` file

---

## 🗂️ File Structure

```
bank-of-msit/
│
├── index.html       → Main HTML structure, all pages and layout
├── style.css        → All styling, colors, components, responsive design
└── script.js        → Database logic, SQL queries, CRUD operations
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure and layout |
| CSS3 | Styling and responsive design |
| JavaScript (ES6) | Application logic |
| sql.js (SQLite) | In-browser SQL database engine |
| Google Fonts | Inter + DM Mono typography |

---

## 🗃️ Database Schema

### Branch
```sql
CREATE TABLE Branch (
  Branch_ID   TEXT PRIMARY KEY,
  Name        TEXT NOT NULL,
  Address     TEXT
);
```

### Customer
```sql
CREATE TABLE Customer (
  Customer_ID    TEXT PRIMARY KEY,
  Name           TEXT NOT NULL,
  Address        TEXT,
  Contact_Number TEXT
);
```

### Account
```sql
CREATE TABLE Account (
  Account_ID   TEXT PRIMARY KEY,
  Account_Type TEXT NOT NULL,
  Balance      REAL NOT NULL CHECK(Balance >= 0),
  Customer_ID  TEXT REFERENCES Customer(Customer_ID),
  Branch_ID    TEXT REFERENCES Branch(Branch_ID)
);
```

### Transaction_Table
```sql
CREATE TABLE Transaction_Table (
  Transaction_ID   TEXT PRIMARY KEY,
  Transaction_Type TEXT NOT NULL,
  Amount           REAL NOT NULL,
  Date             TEXT,
  Account_ID       TEXT REFERENCES Account(Account_ID)
);
```

---

## 🔗 Entity Relationships

```
Branch     (1) ──→ (N) Account
Branch     (1) ──→ (N) Loan
Customer   (1) ──→ (N) Account
Account    (1) ──→ (N) Transaction
```

---

## ⚙️ ACID Properties

All transactions in this system follow ACID principles:

| Property | Implementation |
|----------|---------------|
| **Atomicity** | `BEGIN TRANSACTION` + `COMMIT` / `ROLLBACK` — if balance is insufficient, the entire transaction is rolled back |
| **Consistency** | `CHECK(Balance >= 0)` constraint ensures balance never goes negative |
| **Isolation** | SQLite handles serialized access — transactions don't interfere |
| **Durability** | Database can be exported as `.sqlite` and re-imported to restore all data |

---

## 🚀 How to Run

### Option 1 — Open Locally
1. Download all 3 files (`index.html`, `style.css`, `script.js`) into the **same folder**
2. Open `index.html` in any browser (Chrome / Firefox / Edge)
3. The database initialises automatically with sample data

### Option 2 — GitHub Pages (Live Link)
Visit the live hosted version at:
```
https://stack-Sushant.github.io/bank-of-msit/
```

---

## 📊 Sample Data (Pre-loaded)

### Branches
| Branch ID | Name | Address |
|-----------|------|---------|
| BR001 | Janakpuri Branch | Janakpuri, New Delhi |
| BR002 | Rohini Branch | Rohini Sector 10, New Delhi |
| BR003 | Dwarka Branch | Dwarka Sector 6, New Delhi |

### Customers
| Customer ID | Name |
|-------------|------|
| CUST001 | Sushant |
| CUST002 | Mayank |
| CUST003 | Aarushi |
| CUST004 | Ananya |

---

## 💡 Features

- ✅ Add / Delete Branches, Customers, Accounts
- ✅ Process Deposits, Withdrawals and Transfers
- ✅ Balance Enquiry
- ✅ Live Transaction History
- ✅ SQL Console — run any query directly
- ✅ Export database as `.sqlite` file
- ✅ Import previously saved `.sqlite` file
- ✅ Fully responsive design
- ✅ No installation or server needed

---

## 📝 Subject
**Database Management Systems (DBMS)**  
Maharaja Surajmal Institute of Technology (MSIT)
