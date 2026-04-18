/* ============================================================
   Bank of MSIT — script.js
   Members: Sushant, Mayank, Aarushi, Ananya
   DBMS Project — sql.js (SQLite in browser)
   ============================================================ */

let db = null;

/* ── SCHEMA ──────────────────────────────────────────────── */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS Branch (
  Branch_ID   TEXT PRIMARY KEY,
  Name        TEXT NOT NULL,
  Address     TEXT
);
CREATE TABLE IF NOT EXISTS Customer (
  Customer_ID    TEXT PRIMARY KEY,
  Name           TEXT NOT NULL,
  Address        TEXT,
  Contact_Number TEXT
);
CREATE TABLE IF NOT EXISTS Account (
  Account_ID   TEXT PRIMARY KEY,
  Account_Type TEXT NOT NULL,
  Balance      REAL NOT NULL CHECK(Balance >= 0),
  Customer_ID  TEXT,
  Branch_ID    TEXT,
  FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID),
  FOREIGN KEY (Branch_ID)   REFERENCES Branch(Branch_ID)
);
CREATE TABLE IF NOT EXISTS Transaction_Table (
  Transaction_ID   TEXT PRIMARY KEY,
  Transaction_Type TEXT NOT NULL,
  Amount           REAL NOT NULL,
  Date             TEXT,
  Account_ID       TEXT,
  FOREIGN KEY (Account_ID) REFERENCES Account(Account_ID)
);
`;

/* ── SEED DATA ───────────────────────────────────────────── */
const SEED = () => {
  /* Branches */
  const branches = [
    ["BR001", "Janakpuri Branch", "Janakpuri, New Delhi"],
    ["BR002", "Rohini Branch", "Rohini Sector 10, New Delhi"],
    ["BR003", "Dwarka Branch", "Dwarka Sector 6, New Delhi"],
  ];
  branches.forEach((r) => {
    try {
      db.run("INSERT INTO Branch VALUES (?,?,?)", r);
    } catch (e) {
      /* already exists */
    }
  });

  /* Customers — members of the group */
  const customers = [
    ["CUST001", "Sushant", "Janakpuri, New Delhi", "9811001001"],
    ["CUST002", "Mayank", "Rohini, New Delhi", "9822002002"],
    ["CUST003", "Aarushi", "Dwarka, New Delhi", "9833003003"],
    ["CUST004", "Ananya", "Pitampura, New Delhi", "9844004004"],
  ];
  customers.forEach((r) => {
    try {
      db.run("INSERT INTO Customer VALUES (?,?,?,?)", r);
    } catch (e) {}
  });

  /* Accounts */
  const accounts = [
    ["ACC001", "Savings", 45000, "CUST001", "BR001"],
    ["ACC002", "Current", 120000, "CUST002", "BR002"],
    ["ACC003", "Savings", 67500, "CUST003", "BR003"],
    ["ACC004", "Fixed Deposit", 200000, "CUST004", "BR001"],
    ["ACC005", "Savings", 15000, "CUST001", "BR002"],
    ["ACC006", "Recurring Deposit", 30000, "CUST003", "BR002"],
  ];
  accounts.forEach((r) => {
    try {
      db.run("INSERT INTO Account VALUES (?,?,?,?,?)", r);
    } catch (e) {}
  });

  /* Transactions */
  const txns = [
    ["TXN001", "Deposit", 10000, "2025-01-10", "ACC001"],
    ["TXN002", "Deposit", 50000, "2025-01-12", "ACC002"],
    ["TXN003", "Withdrawal", 5000, "2025-01-15", "ACC001"],
    ["TXN004", "Deposit", 20000, "2025-02-01", "ACC003"],
    ["TXN005", "Transfer", 8000, "2025-02-14", "ACC002"],
    ["TXN006", "Deposit", 100000, "2025-02-20", "ACC004"],
    ["TXN007", "Withdrawal", 15000, "2025-03-05", "ACC003"],
    ["TXN008", "Deposit", 5000, "2025-03-10", "ACC005"],
    ["TXN009", "Deposit", 10000, "2025-03-18", "ACC006"],
    ["TXN010", "Withdrawal", 2000, "2025-04-01", "ACC001"],
  ];
  txns.forEach((r) => {
    try {
      db.run("INSERT INTO Transaction_Table VALUES (?,?,?,?,?)", r);
    } catch (e) {}
  });
};

/* ── INIT ────────────────────────────────────────────────── */
async function initDB() {
  const SQL = await initSqlJs({
    locateFile: (f) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`,
  });
  db = new SQL.Database();
  db.run(SCHEMA);
  SEED();
  setDefaultDate();
  refreshAll();
  toast("Database initialised — Bank of MSIT ready!", "green");
}

function setDefaultDate() {
  const el = document.getElementById("t-date");
  if (el) el.value = new Date().toISOString().split("T")[0];
}

/* ── QUERY HELPERS ───────────────────────────────────────── */
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch (e) {
    return [];
  }
}

function run(sql, params = []) {
  try {
    db.run(sql, params);
    return true;
  } catch (e) {
    return e.message;
  }
}

/* ── NAVIGATION ──────────────────────────────────────────── */
function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("page-" + id).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((n) => {
    if (n.getAttribute("onclick")?.includes(`'${id}'`))
      n.classList.add("active");
  });
  refreshAll();
}

/* ── TOAST ───────────────────────────────────────────────── */
function toast(msg, type = "green") {
  const t = document.createElement("div");
  t.className = `toast-msg toast-${type}`;
  t.textContent = msg;
  document.getElementById("toast").appendChild(t);
  setTimeout(() => {
    t.classList.add("out");
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

/* ── MESSAGE HELPER ──────────────────────────────────────── */
function msg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!text) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<div class="alert alert-${type}" style="margin-bottom:12px">${text}</div>`;
}

/* ── REFRESH ALL ─────────────────────────────────────────── */
function refreshAll() {
  refreshBranches();
  refreshCustomers();
  refreshAccounts();
  refreshTxns();
  refreshDropdowns();
  refreshDash();
}

/* ── DASHBOARD ───────────────────────────────────────────── */
function refreshDash() {
  const c = {
    branches: query("SELECT COUNT(*) as c FROM Branch")[0]?.c || 0,
    customers: query("SELECT COUNT(*) as c FROM Customer")[0]?.c || 0,
    accounts: query("SELECT COUNT(*) as c FROM Account")[0]?.c || 0,
    txns: query("SELECT COUNT(*) as c FROM Transaction_Table")[0]?.c || 0,
    deposits:
      query(
        "SELECT COALESCE(SUM(Amount),0) as s FROM Transaction_Table WHERE Transaction_Type='Deposit'",
      )[0]?.s || 0,
    balance:
      query("SELECT COALESCE(SUM(Balance),0) as s FROM Account")[0]?.s || 0,
  };

  setText("s-branches", c.branches);
  setText("s-customers", c.customers);
  setText("s-accounts", c.accounts);
  setText("s-txns", c.txns);
  setText("s-deposits", "₹" + fmt(c.deposits));
  setText("s-balance", "₹" + fmt(c.balance));

  /* Recent transactions */
  const txns = query(
    "SELECT * FROM Transaction_Table ORDER BY Date DESC LIMIT 8",
  );
  const tbody = document.getElementById("recent-txns");
  tbody.innerHTML = txns.length
    ? txns
        .map(
          (t) => `<tr>
        <td><code style="font-size:11px">${t.Transaction_ID}</code></td>
        <td><span class="badge ${txnBadge(t.Transaction_Type)}">${t.Transaction_Type}</span></td>
        <td><strong>₹${fmt(t.Amount)}</strong></td>
        <td><code style="font-size:11px">${t.Account_ID}</code></td>
        <td>${t.Date || "—"}</td>
      </tr>`,
        )
        .join("")
    : '<tr><td colspan="5" class="empty">No transactions yet</td></tr>';

  /* Top balances */
  const accs = query(
    "SELECT a.*, c.Name FROM Account a JOIN Customer c ON a.Customer_ID=c.Customer_ID ORDER BY a.Balance DESC LIMIT 6",
  );
  const abody = document.getElementById("top-accounts");
  abody.innerHTML = accs.length
    ? accs
        .map(
          (a) => `<tr>
        <td><code style="font-size:11px">${a.Account_ID}</code></td>
        <td>${a.Name}</td>
        <td><span class="badge badge-blue">${a.Account_Type}</span></td>
        <td><strong>₹${fmt(a.Balance)}</strong></td>
      </tr>`,
        )
        .join("")
    : '<tr><td colspan="4" class="empty">No accounts yet</td></tr>';
}

/* ── BRANCHES ────────────────────────────────────────────── */
function addBranch() {
  const id = v("br-id");
  const name = v("br-name");
  const addr = v("br-addr");
  if (!id || !name) {
    msg("msg-branch", "Branch ID and Name are required.", "error");
    return;
  }
  const r = run("INSERT INTO Branch VALUES (?,?,?)", [id, name, addr]);
  if (r === true) {
    msg("msg-branch", "Branch added successfully!", "success");
    cls("br-id", "br-name", "br-addr");
    refreshAll();
    toast("Branch added: " + name);
  } else {
    msg("msg-branch", "Error: " + r, "error");
  }
}

function refreshBranches() {
  const rows = query("SELECT * FROM Branch");
  const tb = document.getElementById("tbl-branches");
  tb.innerHTML = rows.length
    ? rows
        .map(
          (r) => `<tr>
        <td><code>${r.Branch_ID}</code></td>
        <td><strong>${r.Name}</strong></td>
        <td>${r.Address || "—"}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteRow('Branch','Branch_ID','${r.Branch_ID}')">Delete</button></td>
      </tr>`,
        )
        .join("")
    : '<tr><td colspan="4" class="empty">No branches added yet</td></tr>';
}

/* ── CUSTOMERS ───────────────────────────────────────────── */
function addCustomer() {
  const id = v("c-id");
  const name = v("c-name");
  const addr = v("c-addr");
  const phone = v("c-phone");
  if (!id || !name) {
    msg("msg-customer", "Customer ID and Name are required.", "error");
    return;
  }
  const r = run("INSERT INTO Customer VALUES (?,?,?,?)", [
    id,
    name,
    addr,
    phone,
  ]);
  if (r === true) {
    msg("msg-customer", "Customer added successfully!", "success");
    cls("c-id", "c-name", "c-addr", "c-phone");
    refreshAll();
    toast("Customer added: " + name);
  } else {
    msg("msg-customer", "Error: " + r, "error");
  }
}

function refreshCustomers() {
  const rows = query("SELECT * FROM Customer");
  const tb = document.getElementById("tbl-customers");
  tb.innerHTML = rows.length
    ? rows
        .map(
          (r) => `<tr>
        <td><code>${r.Customer_ID}</code></td>
        <td><strong>${r.Name}</strong></td>
        <td>${r.Address || "—"}</td>
        <td>${r.Contact_Number || "—"}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteRow('Customer','Customer_ID','${r.Customer_ID}')">Delete</button></td>
      </tr>`,
        )
        .join("")
    : '<tr><td colspan="5" class="empty">No customers added yet</td></tr>';
}

/* ── ACCOUNTS ────────────────────────────────────────────── */
function addAccount() {
  const id = v("a-id");
  const type = v("a-type");
  const balRaw = v("a-bal");
  const cust = v("a-cust");
  const branch = v("a-branch");
  if (!id || !cust || !branch) {
    msg(
      "msg-account",
      "Account ID, Customer and Branch are required.",
      "error",
    );
    return;
  }
  const balance = parseFloat(balRaw) || 0;
  if (balance < 0) {
    msg(
      "msg-account",
      "Balance cannot be negative (Domain Constraint).",
      "error",
    );
    return;
  }
  const r = run("INSERT INTO Account VALUES (?,?,?,?,?)", [
    id,
    type,
    balance,
    cust,
    branch,
  ]);
  if (r === true) {
    msg("msg-account", "Account opened successfully!", "success");
    cls("a-id", "a-bal");
    refreshAll();
    toast("Account opened: " + id);
  } else {
    msg("msg-account", "Error: " + r, "error");
  }
}

function refreshAccounts() {
  const rows = query(`
    SELECT a.*, c.Name, br.Name as BrName
    FROM Account a
    LEFT JOIN Customer c  ON a.Customer_ID = c.Customer_ID
    LEFT JOIN Branch br   ON a.Branch_ID   = br.Branch_ID
  `);
  const tb = document.getElementById("tbl-accounts");
  tb.innerHTML = rows.length
    ? rows
        .map(
          (r) => `<tr>
        <td><code>${r.Account_ID}</code></td>
        <td><span class="badge badge-blue">${r.Account_Type}</span></td>
        <td><strong>₹${fmt(r.Balance)}</strong></td>
        <td>${r.Name || r.Customer_ID}</td>
        <td>${r.BrName || r.Branch_ID}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteRow('Account','Account_ID','${r.Account_ID}')">Delete</button></td>
      </tr>`,
        )
        .join("")
    : '<tr><td colspan="6" class="empty">No accounts yet</td></tr>';
}

/* ── TRANSACTIONS (ACID) ─────────────────────────────────── */
function addTransaction() {
  const id = v("t-id");
  const type = v("t-type");
  const accId = v("t-acc");
  const amt = parseFloat(v("t-amt"));
  const date = v("t-date");
  const toAcc = v("t-to-acc");

  if (!id || !accId || !amt || amt <= 0) {
    msg(
      "msg-txn",
      "All fields required and amount must be greater than 0.",
      "error",
    );
    return;
  }

  const acc = query("SELECT * FROM Account WHERE Account_ID=?", [accId])[0];
  if (!acc) {
    msg("msg-txn", "Account not found.", "error");
    return;
  }

  try {
    db.run("BEGIN TRANSACTION");

    if (type === "Deposit") {
      db.run("UPDATE Account SET Balance=? WHERE Account_ID=?", [
        acc.Balance + amt,
        accId,
      ]);
      db.run("INSERT INTO Transaction_Table VALUES (?,?,?,?,?)", [
        id,
        type,
        amt,
        date,
        accId,
      ]);
    } else if (type === "Withdrawal") {
      if (acc.Balance < amt) {
        db.run("ROLLBACK");
        msg(
          "msg-txn",
          `Insufficient balance! (Balance: ₹${fmt(acc.Balance)}) — Transaction rolled back (Atomicity).`,
          "error",
        );
        return;
      }
      db.run("UPDATE Account SET Balance=? WHERE Account_ID=?", [
        acc.Balance - amt,
        accId,
      ]);
      db.run("INSERT INTO Transaction_Table VALUES (?,?,?,?,?)", [
        id,
        type,
        amt,
        date,
        accId,
      ]);
    } else if (type === "Transfer") {
      if (!toAcc || toAcc === accId) {
        db.run("ROLLBACK");
        msg(
          "msg-txn",
          "Select a different target account for transfer.",
          "error",
        );
        return;
      }
      const toAccData = query("SELECT * FROM Account WHERE Account_ID=?", [
        toAcc,
      ])[0];
      if (!toAccData) {
        db.run("ROLLBACK");
        msg("msg-txn", "Target account not found.", "error");
        return;
      }
      if (acc.Balance < amt) {
        db.run("ROLLBACK");
        msg(
          "msg-txn",
          `Insufficient balance for transfer! — Transaction rolled back.`,
          "error",
        );
        return;
      }
      db.run("UPDATE Account SET Balance=? WHERE Account_ID=?", [
        acc.Balance - amt,
        accId,
      ]);
      db.run("UPDATE Account SET Balance=? WHERE Account_ID=?", [
        toAccData.Balance + amt,
        toAcc,
      ]);
      db.run("INSERT INTO Transaction_Table VALUES (?,?,?,?,?)", [
        id,
        type,
        amt,
        date,
        accId,
      ]);
    }

    db.run("COMMIT");
    msg(
      "msg-txn",
      `${type} of ₹${fmt(amt)} processed successfully! (ACID compliant)`,
      "success",
    );
    cls("t-id", "t-amt");
    refreshAll();
    toast(`${type} ₹${fmt(amt)} processed`);
  } catch (e) {
    try {
      db.run("ROLLBACK");
    } catch (_) {}
    msg("msg-txn", "Error: " + e.message, "error");
  }
}

function toggleTransfer() {
  const type = document.getElementById("t-type").value;
  document.getElementById("t-to-group").style.display =
    type === "Transfer" ? "block" : "none";
}

function checkBalance() {
  const accId = document.getElementById("bal-acc").value;
  if (!accId) return;
  const acc = query(
    `
    SELECT a.*, c.Name FROM Account a
    JOIN Customer c ON a.Customer_ID = c.Customer_ID
    WHERE a.Account_ID = ?`,
    [accId],
  )[0];
  const el = document.getElementById("bal-result");
  if (!acc) {
    el.innerHTML = '<div class="alert alert-error">Account not found</div>';
    return;
  }
  el.innerHTML = `
    <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:14px">
      <div style="font-size:12px;color:var(--gray-500)">
        Account: <strong>${acc.Account_ID}</strong> &middot; ${acc.Account_Type} &middot; ${acc.Name}
      </div>
      <div style="font-size:28px;font-weight:700;color:var(--gray-900);margin-top:6px">₹${fmt(acc.Balance)}</div>
    </div>`;
}

function refreshTxns() {
  const rows = query("SELECT * FROM Transaction_Table ORDER BY Date DESC");
  const tb = document.getElementById("tbl-txns");
  tb.innerHTML = rows.length
    ? rows
        .map(
          (r) => `<tr>
        <td><code style="font-size:11px">${r.Transaction_ID}</code></td>
        <td><span class="badge ${txnBadge(r.Transaction_Type)}">${r.Transaction_Type}</span></td>
        <td><strong>₹${fmt(r.Amount)}</strong></td>
        <td><code style="font-size:11px">${r.Account_ID}</code></td>
        <td>${r.Date || "—"}</td>
        
      </tr>`,
        )
        .join("")
    : '<tr><td colspan="6" class="empty">No transactions yet</td></tr>';
}

/* ── DROPDOWNS ───────────────────────────────────────────── */
function refreshDropdowns() {
  const branches = query("SELECT * FROM Branch");
  const customers = query("SELECT * FROM Customer");
  const accounts = query("SELECT * FROM Account");

  fillSelect("br-bank", [], "", ""); // not used
  fillSelect("a-cust", customers, "Customer_ID", "Name");
  fillSelect("a-branch", branches, "Branch_ID", "Name");
  fillSelect(
    "t-acc",
    accounts,
    "Account_ID",
    (r) => `${r.Account_ID} (₹${fmt(r.Balance)})`,
  );
  fillSelect(
    "t-to-acc",
    accounts,
    "Account_ID",
    (r) => `${r.Account_ID} (₹${fmt(r.Balance)})`,
  );
  fillSelect(
    "bal-acc",
    accounts,
    "Account_ID",
    (r) => `${r.Account_ID} (₹${fmt(r.Balance)})`,
  );
}

function fillSelect(id, rows, valKey, labelKey) {
  const el = document.getElementById(id);
  if (!el) return;
  const cur = el.value;
  const placeholder =
    el.options[0]?.value === "" ? el.options[0].text : "-- Select --";
  el.innerHTML =
    `<option value="">${placeholder}</option>` +
    rows
      .map(
        (r) =>
          `<option value="${r[valKey]}">${typeof labelKey === "function" ? labelKey(r) : r[labelKey]}</option>`,
      )
      .join("");
  el.value = cur;
}

/* ── SQL CONSOLE ─────────────────────────────────────────── */
function setQ(q) {
  document.getElementById("sql-input").value = q;
}

function runSQL() {
  const sql = document.getElementById("sql-input").value.trim();
  if (!sql) return;
  const errEl = document.getElementById("sql-error");
  const card = document.getElementById("sql-result-card");
  errEl.style.display = "none";
  try {
    const results = db.exec(sql);
    if (!results.length) {
      card.style.display = "none";
      toast("Query executed (no rows returned)");
      return;
    }
    const { columns, values } = results[0];
    document.getElementById("sql-result-head").innerHTML =
      "<tr>" + columns.map((c) => `<th>${c}</th>`).join("") + "</tr>";
    document.getElementById("sql-result-body").innerHTML = values
      .map(
        (row) =>
          "<tr>" + row.map((v) => `<td>${v ?? "NULL"}</td>`).join("") + "</tr>",
      )
      .join("");
    document.getElementById("sql-rows").textContent = `${values.length} row(s)`;
    card.style.display = "block";
    refreshAll();
  } catch (e) {
    card.style.display = "none";
    errEl.style.display = "flex";
    errEl.textContent = "SQL Error: " + e.message;
  }
}

/* ── DELETE ──────────────────────────────────────────────── */
function deleteRow(table, pkCol, pkVal) {
  if (!confirm(`Delete "${pkVal}" from ${table}?`)) return;
  const r = run(`DELETE FROM ${table} WHERE ${pkCol}=?`, [pkVal]);
  if (r === true) {
    refreshAll();
    toast(`Deleted ${pkVal}`, "red");
  } else toast("Error: " + r, "red");
}

/* ── EXPORT / IMPORT ─────────────────────────────────────── */
function exportDB() {
  const data = db.export();
  const blob = new Blob([data], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bank_of_msit.sqlite";
  a.click();
  toast("Database exported as bank_of_msit.sqlite");
}

function importDB(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const SQL = await initSqlJs({
      locateFile: (f) =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`,
    });
    db = new SQL.Database(new Uint8Array(e.target.result));
    refreshAll();
    toast("Database imported successfully!");
  };
  reader.readAsArrayBuffer(file);
  input.value = "";
}

/* ── UTILITIES ───────────────────────────────────────────── */
function v(id) {
  return document.getElementById(id)?.value?.trim() || "";
}
function cls(...ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function fmt(n) {
  return Number(n).toLocaleString("en-IN");
}
function txnBadge(t) {
  if (t === "Deposit") return "badge-green";
  if (t === "Withdrawal") return "badge-red";
  return "badge-blue";
}

/* ── BOOT ────────────────────────────────────────────────── */
initDB();
