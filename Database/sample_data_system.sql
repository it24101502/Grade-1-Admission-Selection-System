-- ============================================================
--  SAMPLE DATA SEED SCRIPT  (Restructured Databases)
--  Grade 1 Admission System
--
--  DATABASE LAYOUT AFTER RESTRUCTURE:
--
--  admission_system   ← run PART 1 against this database
--    parents
--    parent_children
--    parent_applications
--    (system_users, users, marking_schemes, marking_criteria
--     are created automatically by Spring Boot on first run)
--
--  admission_apps     ← run PART 2 against this database
--    applications
--
--  HOW TO RUN:
--    Option A — MySQL Workbench:
--      1. Open this file
--      2. Run the PART 1 block (select it + execute)
--      3. Run the PART 2 block (select it + execute)
--
--    Option B — Command line (run twice, once per DB):
--      mysql -u root -p admission_system < sample_data_system.sql
--      mysql -u root -p admission_apps   < sample_data_apps.sql
--      (or just run this whole file and let the USE statements switch)
--
--  PARENT LOGIN CREDENTIALS:
--    Username = phone number
--    Password = NIC number (initial)
--
--    Phone          NIC              Name
--    0771234001     199012345678     Kamala Perera
--    0772234002     198811223344     Suresh Fernando
--    0773234003     197956789012     Nimal Jayawardena
--    0774234004     200023456789     Priya Wickramasinghe
--    0775234005     199534567890     Roshan Silva
--    0776234006     198745678901     Kumari Dissanayake
--    0777234007     199867890123     Anura Bandara
--    0778234008     200156789012     Malini Ranasinghe
--    0779234009     198978901234     Thilak Gunaratne
--    0770234010     199290123456     Sandya Amarasinghe
-- ============================================================

-- ============================================================
--  PART 1 — admission_system database
--  Run: mysql -u root -p admission_system < sample_data_system.sql
--
--  Fixes stale columns in parents table first, then inserts data.
--  All column names match exactly what Hibernate created (camelCase).
-- ============================================================

USE admission_system;

-- ── Parents ──────────────────────────────────────────────────
INSERT INTO parents (phone, nic, passwordHash, active, hasChangedPassword, createdAt) VALUES
('0771234001', '199012345678', '$2a$10$YR203KuFyQaioOpGMub2TOu8JsfxiCAmq2t.Dx9MVARMxRpKQqImu', 1, 0, NOW()),
('0772234002', '198811223344', '$2a$10$XAHRv6M9k7.dUp5CmRRLB.iSivLG0k8ntkYj5vyHs7FgwpJzAJrtu', 1, 0, NOW()),
('0773234003', '197956789012', '$2a$10$GLeYwwtc4xGp6fZLO4bVa.9O.IKfsC0joXqtcNS4bdbFTgTYdiTIW', 1, 0, NOW()),
('0774234004', '200023456789', '$2a$10$QG/0EUmb.XhP5.8tmuAUs.ziUOLIBaAq22/BneXiS.s3E5sl./U0C', 1, 0, NOW()),
('0775234005', '199534567890', '$2a$10$kwLjBUggEmqPMoXM4Z7NjOB7crwmW7rIoW90TCfeET42v3aRTLcVG', 1, 0, NOW()),
('0776234006', '198745678901', '$2a$10$nQQcO8xj1l7JmAL6NriLuu1ak7j6.vBXA8T2Tc7rj1iD2IGx.98yK', 1, 0, NOW()),
('0777234007', '199867890123', '$2a$10$qoHB5wIQ.1GZvmsLFBIDmOMX6Y/woyl5wAodk5s4DoMfd3.rErt/m', 1, 0, NOW()),
('0778234008', '200156789012', '$2a$10$ulC0MTOhnOFWkZPQE7Hkwu.kzznAX3GYIQ/G5WRkWE4G9Y7plxsvu', 1, 0, NOW()),
('0779234009', '198978901234', '$2a$10$2RAA.blvaYKdUCeRKV7OdOQ9WQw0C1oLwwcZkFVHenkarPVT2jA0C', 1, 0, NOW()),
('0770234010', '199290123456', '$2a$10$hfeMb0DM/hzVNpUPGtWX0e3Q0qcwrrAIWLrM8Qn39nSl58zveQaa.', 1, 0, NOW());

-- ── Children ──────────────────────────────────────────────────
--  child id  name                          parent
--     1      Liona Perera                  1 (Kamala Perera)
--     2      Devindi Perera                1
--     3      Senali Fernando               2 (Suresh Fernando)
--     4      Anudi Jayawardena             3 (Nimal Jayawardena)
--     5      Sathmi Jayawardena            3
--     6      Kaveesha Wickramasinghe       4 (Priya Wickramasinghe)
--     7      Thisari Silva                 5 (Roshan Silva)
--     8      Ranudi Dissanayake            6 (Kumari Dissanayake)
--     9      Sewwandi Dissanayake          6
--    10      Hashini Bandara               7 (Anura Bandara)
--    11      Peheli Ranasinghe             8 (Malini Ranasinghe)
--    12      Savini Gunaratne              9 (Thilak Gunaratne)
--    13      Nimasha Amarasinghe          10 (Sandya Amarasinghe)
INSERT INTO parent_children (parent_id, child_name, createdAt) VALUES
(1,  'Liona Perera',            NOW()),
(1,  'Devindi Perera',          NOW()),
(2,  'Senali Fernando',         NOW()),
(3,  'Anudi Jayawardena',       NOW()),
(3,  'Sathmi Jayawardena',      NOW()),
(4,  'Kaveesha Wickramasinghe', NOW()),
(5,  'Thisari Silva',           NOW()),
(6,  'Ranudi Dissanayake',      NOW()),
(6,  'Sewwandi Dissanayake',    NOW()),
(7,  'Hashini Bandara',         NOW()),
(8,  'Peheli Ranasinghe',       NOW()),
(9,  'Savini Gunaratne',        NOW()),
(10, 'Nimasha Amarasinghe',     NOW());

-- ── Category Slots ────────────────────────────────────────────
-- applicationId = NULL  → slot assigned, form not yet submitted
-- applicationId = N     → links to applications.id in admission_apps
INSERT INTO parent_applications (parent_id, child_id, category, applicationId, createdAt) VALUES
(1, 1,  'CO',  1,    NOW()),
(1, 1,  'SIS', NULL, NOW()),
(1, 2,  'OG',  2,    NOW()),
(2, 3,  'CO',  3,    NOW()),
(2, 3,  'TR',  NULL, NOW()),
(3, 4,  'EDU', 4,    NOW()),
(3, 5,  'AB',  5,    NOW()),
(4, 6,  'CO',  6,    NOW()),
(5, 7,  'SIS', 7,    NOW()),
(6, 8,  'OG',  8,    NOW()),
(6, 8,  'EDU', NULL, NOW()),
(6, 9,  'TR',  9,    NOW()),
(7, 10, 'CO',  10,   NOW()),
(8, 11, 'AB',  11,   NOW()),
(9, 12, 'EDU', 12,   NOW()),
(9, 12, 'SIS', NULL, NOW()),
(10,13, 'CO',  13,   NOW());

-- ── Verify ────────────────────────────────────────────────────
SELECT COUNT(*) AS total_parents   FROM parents;
SELECT COUNT(*) AS total_children  FROM parent_children;
SELECT COUNT(*) AS total_slots     FROM parent_applications;