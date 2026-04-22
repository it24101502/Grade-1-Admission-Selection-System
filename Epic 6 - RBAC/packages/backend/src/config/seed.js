require("dotenv").config();
const bcrypt = require("bcryptjs");
const { initDb, run, exec } = require("./db");
const { ROLES } = require("../../../../shared/index.cjs");

const SEED_USERS = [
  { name: "Alice Admin",   email: "admin@demo.com",   password: "admin123",   role: ROLES.ADMIN,               category: null },
  { name: "Jake Judge",    email: "judge@demo.com",   password: "judge123",   role: ROLES.JUDGE,               category: "SchoolZone" },
  { name: "Paula Parent",  email: "parent@demo.com",  password: "parent123",  role: ROLES.PARENT,              category: "SchoolZone" },
  { name: "David DocCtrl", email: "docctrl@demo.com", password: "docctrl123", role: ROLES.DOCUMENT_CONTROLLER, category: null },
];

async function seed() {
  await initDb();
  console.log("🌱 Seeding database...");

  exec("DELETE FROM results");
  exec("DELETE FROM documents");
  exec("DELETE FROM applications");
  exec("DELETE FROM users");

  for (const u of SEED_USERS) {
    const hash = bcrypt.hashSync(u.password, 10);
    run("INSERT INTO users (name, email, password, role, category) VALUES (?, ?, ?, ?, ?)",
      [u.name, u.email, hash, u.role, u.category]);
    console.log(`  ✅ Created: ${u.email} [${u.role}]`);
  }

  const apps = [
    { title: "Scholarship Application A", desc: "Merit scholarship",   status: "pending",  cat: "SchoolZone", by: 3 },
    { title: "Scholarship Application B", desc: "Sports scholarship",  status: "approved", cat: "SchoolZone", by: 3 },
    { title: "Grant Request X",           desc: "Community grant",     status: "pending",  cat: "Community",  by: 3 },
  ];
  for (const a of apps) {
    run("INSERT INTO applications (title, description, status, category, submitted_by) VALUES (?,?,?,?,?)",
      [a.title, a.desc, a.status, a.cat, a.by]);
    console.log(`  ✅ Application: ${a.title}`);
  }

  run("INSERT INTO results (application_id, score, verdict, notes, judged_by) VALUES (2, 85, 'Approved', 'Strong candidate', 2)");
  console.log("  ✅ Sample result created");

  console.log("\n🎉 Seed complete!\n");
  console.log("Demo credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  SEED_USERS.forEach(u => console.log(`  ${u.role.padEnd(20)} ${u.email.padEnd(26)} / ${u.password}`));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
