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
--  PART 2 — admission_apps database
--  Run: mysql -u root -p admission_apps < sample_data_apps.sql
--
--  All column names match exactly what Hibernate created (camelCase).
--
--  assignedUserId values assume DataSeeder created users in this order:
--    CO=1  SIS=2  OG=3  TR=4  EDU=5  AB=6
--  Verify with: SELECT id, username, category FROM admission_system.users;
--  and adjust below if your IDs differ.
-- ============================================================

USE admission_apps;

INSERT INTO applications (
  applicationNumber, parentId, category, status,
  assignedUserId,
  totalScore, rankInCategory, flagColor, flagReason, userComment,
  applicantNameEnglish, applicantNameSinhala, applicantRelationship, applicantNic,
  contactNumber, phoneNumber,
  addressLine1, addressLine2, town, street, district,
  locationLink, distanceFromSchoolKm, homeLat, homeLon,
  childNameEnglish, childNameSinhala,
  birthCertNumber, birthCertDivision, birthCertDistrict,
  dateOfBirth,
  motherFullName, motherContact, motherNic, motherOccupation, motherWorkplace, motherEmail,
  fatherFullName, fatherContact, fatherNic, fatherOccupation, fatherWorkplace, fatherEmail,
  createdAt, submittedAt, updatedAt
) VALUES

-- ── App 1: CO-0001 — Liona Perera ────────────────────────────
(
  'CO-0001', 1, 'CO', 'SCORED', 1,
  87.5, 1, NULL, NULL, 'Strong family connection. Father is an old boy.',
  'Kamala Devi Perera', 'කමලා දේවී පෙරේරා', 'Mother', '199012345678',
  '0771234001', '0771234001',
  'No. 45, Lotus Road', 'Colombo 03', 'Colombo', 'Lotus Road', 'Colombo',
  'https://www.google.com/maps/@6.9108,79.8641,15z', 2.340, 6.9108, 79.8641,
  'Liona Perera', 'ලිඔනා පෙරේරා',
  'B/2019/COL/034521', 'Colombo', 'Colombo', '2019-03-14',
  'Kamala Devi Perera', '0771234001', '199012345678', 'Teacher',  'Royal College',  'kamala.perera@gmail.com',
  'Sunil Perera',       '0771234099', '198810234567', 'Engineer', 'MAS Holdings',   'sunil.perera@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 2: OG-0002 — Devindi Perera ──────────────────────────
(
  'OG-0002', 1, 'OG', 'SCORED', 3,
  72.0, 2, NULL, NULL, 'Old girl mother. Documents verified.',
  'Kamala Devi Perera', 'කමලා දේවී පෙරේරා', 'Mother', '199012345678',
  '0771234001', '0771234001',
  'No. 45, Lotus Road', 'Colombo 03', 'Colombo', 'Lotus Road', 'Colombo',
  'https://www.google.com/maps/@6.9108,79.8641,15z', 2.340, 6.9108, 79.8641,
  'Devindi Perera', 'දේවින්දි පෙරේරා',
  'B/2020/COL/012345', 'Colombo', 'Colombo', '2020-07-22',
  'Kamala Devi Perera', '0771234001', '199012345678', 'Teacher',  'Royal College',  'kamala.perera@gmail.com',
  'Sunil Perera',       '0771234099', '198810234567', 'Engineer', 'MAS Holdings',   'sunil.perera@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 3: CO-0003 — Senali Fernando ─────────────────────────
(
  'CO-0003', 2, 'CO', 'SCORED', 1,
  91.0, NULL, NULL, NULL, 'Excellent proximity. Both parents in education sector.',
  'Suresh Kumara Fernando', 'සුරේෂ් කුමාර ප්‍රනාන්දු', 'Father', '198811223344',
  '0772234002', '0772234002',
  'No. 12, School Lane', 'Nugegoda', 'Nugegoda', 'School Lane', 'Colombo',
  'https://www.google.com/maps/@6.8721,79.8900,15z', 1.120, 6.8721, 79.8900,
  'Senali Fernando', 'සේනාලි ප්‍රනාන්දු',
  'B/2019/COL/055432', 'Nugegoda', 'Colombo', '2019-11-05',
  'Priyanka Fernando',      '0772234099', '199245678901', 'Principal', 'Visakha Vidyalaya',     'priyanka.fernando@gmail.com',
  'Suresh Kumara Fernando', '0772234002', '198811223344', 'Lecturer',  'University of Colombo', 'suresh.fernando@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 4: EDU-0004 — Anudi Jayawardena ──────────────────────
(
  'EDU-0004', 3, 'EDU', 'UNDER_REVIEW', 5,
  NULL, NULL, NULL, NULL, NULL,
  'Nimal Prasad Jayawardena', 'නිමල් ප්‍රසාද් ජයවර්ධන', 'Father', '197956789012',
  '0773234003', '0773234003',
  'No. 78, Temple Road', 'Maharagama', 'Maharagama', 'Temple Road', 'Colombo',
  'https://www.google.com/maps/@6.8480,79.9270,15z', 5.670, 6.8480, 79.9270,
  'Anudi Jayawardena', 'අනූදි ජයවර්ධන',
  'B/2019/KAL/078901', 'Maharagama', 'Colombo', '2019-06-18',
  'Sandamali Jayawardena',    '0773234099', '198123456789', 'Doctor',     'Colombo National Hospital', 'sandamali.j@gmail.com',
  'Nimal Prasad Jayawardena', '0773234003', '197956789012', 'Accountant', 'BOC Bank',                  'nimal.j@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 5: AB-0005 — Sathmi Jayawardena ──────────────────────
(
  'AB-0005', 3, 'AB', 'SCORED', 6,
  65.5, NULL, NULL, NULL, 'Family relocated from Australia. Documentation complete.',
  'Nimal Prasad Jayawardena', 'නිමල් ප්‍රසාද් ජයවර්ධන', 'Father', '197956789012',
  '0773234003', '0773234003',
  'No. 78, Temple Road', 'Maharagama', 'Maharagama', 'Temple Road', 'Colombo',
  'https://www.google.com/maps/@6.8480,79.9270,15z', 5.670, 6.8480, 79.9270,
  'Sathmi Jayawardena', 'සත්මි ජයවර්ධන',
  'B/2020/KAL/034567', 'Maharagama', 'Colombo', '2020-02-09',
  'Sandamali Jayawardena',    '0773234099', '198123456789', 'Doctor',     'Colombo National Hospital', 'sandamali.j@gmail.com',
  'Nimal Prasad Jayawardena', '0773234003', '197956789012', 'Accountant', 'BOC Bank',                  'nimal.j@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 6: CO-0006 — Kaveesha Wickramasinghe (FLAGGED YELLOW) ─
(
  'CO-0006', 4, 'CO', 'FLAGGED', 1,
  NULL, NULL, 'YELLOW', 'Birth certificate district does not match address. Needs verification.', NULL,
  'Priya Wickramasinghe', 'ප්‍රියා වික්‍රමසිංහ', 'Mother', '200023456789',
  '0774234004', '0774234004',
  'No. 33, Galle Road', 'Dehiwala', 'Dehiwala', 'Galle Road', 'Colombo',
  'https://www.google.com/maps/@6.8520,79.8710,15z', 3.890, 6.8520, 79.8710,
  'Kaveesha Wickramasinghe', 'කවීෂා වික්‍රමසිංහ',
  'B/2019/GAL/099123', 'Galle', 'Galle', '2019-09-30',
  'Priya Wickramasinghe', '0774234004', '200023456789', 'Nurse',          'Lanka Hospitals',  'priya.w@gmail.com',
  'Ruwan Wickramasinghe', '0774234099', '199312345678', 'Police Officer', 'Sri Lanka Police', 'ruwan.w@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 7: SIS-0007 — Thisari Silva ──────────────────────────
(
  'SIS-0007', 5, 'SIS', 'SCORED', 2,
  95.0, 1, NULL, NULL, 'Elder sibling currently in Grade 4. Confirmed enrollment.',
  'Roshan Pradeep Silva', 'රොෂාන් ප්‍රදීප් සිල්වා', 'Father', '199534567890',
  '0775234005', '0775234005',
  'No. 07, Palm Grove', 'Colombo 03', 'Colombo', 'Palm Grove', 'Colombo',
  'https://www.google.com/maps/@6.9050,79.8560,15z', 1.780, 6.9050, 79.8560,
  'Thisari Silva', 'තිසාරි සිල්වා',
  'B/2020/COL/022211', 'Colombo', 'Colombo', '2020-04-12',
  'Dilini Silva',         '0775234099', '199712345678', 'Pharmacist', 'National Pharmacy',  'dilini.silva@gmail.com',
  'Roshan Pradeep Silva', '0775234005', '199534567890', 'Pilot',      'SriLankan Airlines', 'roshan.silva@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 8: OG-0008 — Ranudi Dissanayake ──────────────────────
(
  'OG-0008', 6, 'OG', 'SCORED', 3,
  80.5, 1, NULL, NULL, 'Mother is a verified old girl. Graduation certificate attached.',
  'Kumari Dissanayake', 'කුමාරි දිසානායක', 'Mother', '198745678901',
  '0776234006', '0776234006',
  'No. 22, Flower Road', 'Colombo 07', 'Colombo', 'Flower Road', 'Colombo',
  'https://www.google.com/maps/@6.9140,79.8660,15z', 0.950, 6.9140, 79.8660,
  'Ranudi Dissanayake', 'රනූදි දිසානායක',
  'B/2020/COL/011223', 'Colombo', 'Colombo', '2020-08-17',
  'Kumari Dissanayake', '0776234006', '198745678901', 'Lawyer',    'Attorney General Dept', 'kumari.d@gmail.com',
  'Asanka Dissanayake', '0776234099', '198012345678', 'Architect', 'Urban Development',     'asanka.d@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 9: TR-0009 — Sewwandi Dissanayake ────────────────────
(
  'TR-0009', 6, 'TR', 'UNDER_REVIEW', 4,
  NULL, NULL, NULL, NULL, NULL,
  'Kumari Dissanayake', 'කුමාරි දිසානායක', 'Mother', '198745678901',
  '0776234006', '0776234006',
  'No. 22, Flower Road', 'Colombo 07', 'Colombo', 'Flower Road', 'Colombo',
  'https://www.google.com/maps/@6.9140,79.8660,15z', 0.950, 6.9140, 79.8660,
  'Sewwandi Dissanayake', 'සෙව්වන්දි දිසානායක',
  'B/2021/COL/044556', 'Colombo', 'Colombo', '2021-01-25',
  'Kumari Dissanayake', '0776234006', '198745678901', 'Lawyer',    'Attorney General Dept', 'kumari.d@gmail.com',
  'Asanka Dissanayake', '0776234099', '198012345678', 'Architect', 'Urban Development',     'asanka.d@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 10: CO-0010 — Hashini Bandara ────────────────────────
(
  'CO-0010', 7, 'CO', 'SCORED', 1,
  79.0, NULL, NULL, NULL, 'Very close to school. Chief occupant category confirmed.',
  'Anura Bandara', 'අනුර බණ්ඩාර', 'Father', '199867890123',
  '0777234007', '0777234007',
  'No. 05, School Mawatha', 'Borella', 'Colombo', 'School Mawatha', 'Colombo',
  'https://www.google.com/maps/@6.9210,79.8700,15z', 0.430, 6.9210, 79.8700,
  'Hashini Bandara', 'හාෂිනි බණ්ඩාර',
  'B/2019/COL/088432', 'Colombo', 'Colombo', '2019-05-20',
  'Nimesha Bandara', '0777234099', '200023456788', 'Bank Manager',  'Peoples Bank',          'nimesha.b@gmail.com',
  'Anura Bandara',   '0777234007', '199867890123', 'Civil Servant', 'Ministry of Education', 'anura.b@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 11: AB-0011 — Peheli Ranasinghe ──────────────────────
(
  'AB-0011', 8, 'AB', 'SCORED', 6,
  70.0, NULL, NULL, NULL, 'Family returning from UK. Father held UK employment visa.',
  'Malini Ranasinghe', 'මලිනී රණසිංහ', 'Mother', '200156789012',
  '0778234008', '0778234008',
  'No. 88, Marine Drive', 'Wellawatte', 'Colombo', 'Marine Drive', 'Colombo',
  'https://www.google.com/maps/@6.8720,79.8600,15z', 4.210, 6.8720, 79.8600,
  'Peheli Ranasinghe', 'පෙහෙලි රණසිංහ',
  'B/2020/COL/077654', 'Colombo', 'Colombo', '2020-11-03',
  'Malini Ranasinghe', '0778234008', '200156789012', 'Accountant',       'KPMG Lanka', 'malini.r@gmail.com',
  'Danesh Ranasinghe', '0778234099', '199501234567', 'Software Engineer', 'WSO2',      'danesh.r@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 12: EDU-0012 — Savini Gunaratne ──────────────────────
(
  'EDU-0012', 9, 'EDU', 'SCORED', 5,
  88.0, NULL, NULL, NULL, 'Both parents hold postgraduate qualifications.',
  'Thilak Gunaratne', 'තිලක් ගුණරත්න', 'Father', '198978901234',
  '0779234009', '0779234009',
  'No. 14, University Road', 'Peradeniya', 'Kandy', 'University Road', 'Kandy',
  'https://www.google.com/maps/@7.2562,80.5936,15z', 98.200, 7.2562, 80.5936,
  'Savini Gunaratne', 'සවිනි ගුණරත්න',
  'B/2019/KAN/012980', 'Kandy', 'Kandy', '2019-12-01',
  'Iresha Gunaratne', '0779234099', '199412345678', 'University Lecturer', 'University of Peradeniya', 'iresha.g@gmail.com',
  'Thilak Gunaratne', '0779234009', '198978901234', 'University Lecturer', 'University of Peradeniya', 'thilak.g@gmail.com',
  NOW(), NOW(), NOW()
),

-- ── App 13: CO-0013 — Nimasha Amarasinghe (FLAGGED RED) ───────
(
  'CO-0013', 10, 'CO', 'FLAGGED', 1,
  NULL, NULL, 'RED', 'Address does not match utility bill submitted. Suspected fraud.', NULL,
  'Sandya Amarasinghe', 'සන්ද්‍යා අමරසිංහ', 'Mother', '199290123456',
  '0770234010', '0770234010',
  'No. 66, Temple Lane', 'Rajagiriya', 'Colombo', 'Temple Lane', 'Colombo',
  'https://www.google.com/maps/@6.9050,79.8920,15z', 6.780, 6.9050, 79.8920,
  'Nimasha Amarasinghe', 'නිමාෂා අමරසිංහ',
  'B/2019/COL/099001', 'Colombo', 'Colombo', '2019-08-14',
  'Sandya Amarasinghe',  '0770234010', '199290123456', 'Housewife', NULL,      'sandya.a@gmail.com',
  'Pradeep Amarasinghe', '0770234099', '198890123456', 'Driver',    'Private', NULL,
  NOW(), NOW(), NOW()
);

-- ── Verify ────────────────────────────────────────────────────
SELECT COUNT(*) AS total_applications FROM applications;
SELECT category, status, COUNT(*) AS count FROM applications GROUP BY category, status ORDER BY category;