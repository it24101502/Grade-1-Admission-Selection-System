// src/server/data/seed.js
const bcrypt = require("bcryptjs");

const CATEGORIES = {
  SCHOOL_ZONE:   "school_zone",
  ELIGIBILITY_A: "eligibility_type_a",
  ELIGIBILITY_B: "eligibility_type_b",
  ADMIN:         "admin",
};

const users = [
  { id: "u1", name: "Alice Parent",  email: "alice@example.com", passwordHash: bcrypt.hashSync("password123", 10), category: CATEGORIES.SCHOOL_ZONE },
  { id: "u2", name: "Bob Parent",    email: "bob@example.com",   passwordHash: bcrypt.hashSync("password123", 10), category: CATEGORIES.ELIGIBILITY_A },
  { id: "u3", name: "Carol Parent",  email: "carol@example.com", passwordHash: bcrypt.hashSync("password123", 10), category: CATEGORIES.ELIGIBILITY_B },
  { id: "u4", name: "Admin User",    email: "admin@example.com", passwordHash: bcrypt.hashSync("adminpass",   10), category: CATEGORIES.ADMIN },
];

const applications = [
  { id: "app1", title: "Greenfield Elementary Enrollment",  description: "Apply for enrollment at Greenfield Elementary School.",          status: "Open",   deadline: "2025-08-01", category: CATEGORIES.SCHOOL_ZONE },
  { id: "app2", title: "Riverside Middle School Transfer",  description: "Request a transfer to Riverside Middle School.",                  status: "Open",   deadline: "2025-07-15", category: CATEGORIES.SCHOOL_ZONE },
  { id: "app3", title: "School Zone Bus Pass",              description: "Apply for a subsidised bus pass for school zone residents.",       status: "Closed", deadline: "2025-05-01", category: CATEGORIES.SCHOOL_ZONE },
  { id: "app4", title: "Type-A Eligibility Grant",          description: "Financial assistance grant for Type-A eligible families.",         status: "Open",   deadline: "2025-09-30", category: CATEGORIES.ELIGIBILITY_A },
  { id: "app5", title: "Type-A After-School Program",       description: "After-school care program for Type-A eligible children.",          status: "Open",   deadline: "2025-08-20", category: CATEGORIES.ELIGIBILITY_A },
  { id: "app6", title: "Type-B Meal Assistance",            description: "Subsidised meal plan for Type-B eligible families.",               status: "Open",   deadline: "2025-10-01", category: CATEGORIES.ELIGIBILITY_B },
  { id: "app7", title: "Type-B Learning Materials",         description: "Free learning materials for Type-B eligible students.",            status: "Open",   deadline: "2025-07-31", category: CATEGORIES.ELIGIBILITY_B },
];

module.exports = { users, applications, CATEGORIES };
