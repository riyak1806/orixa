# ORIXA — User Provisioning & Account Management Workflow

## 1. Overview

ORIXA authenticates users using **ID + Password** credentials without email verification or user-entered email addresses.

To support this model securely:
1. Each ORIXA Login ID (e.g., `jspmntc`, `HOD-CS-01`, `EMP-CS-01`, `STAR_STUDENT`) is deterministically mapped internally to an authentication identity:
   `<login_id>@auth.orixa.internal`
2. Supabase Auth serves as the session and password verification authority.
3. User authorization details, roles (`COLLEGE_ADMIN`, `HOD`, `TEACHER`, `STUDENT`), names, and institutional linkages reside in `public.profiles` and its corresponding sub-tables.
4. Passwords are write-only credentials and are stored strictly within Supabase Auth (`auth.users.encrypted_password`). Passwords are never stored in public database tables.

---

## 2. Admin User Provisioning Script

Administrators provision new users using the secure server-side Node.js utility: `scripts/provision_users.js`.

### Environment Setup

Set the necessary environment variables (or supply them in `.env` for local CLI execution):

```bash
export SUPABASE_URL="http://127.0.0.1:54321"
export SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"
```

*Note: Never expose or commit `SUPABASE_SERVICE_ROLE_KEY` to client-side code, Git history, or repositories.*

---

## 3. Programmatic Provisioning Example

```javascript
const { provisionOrixaUser } = require('./scripts/provision_users');

async function main() {
  // Provision a new Teacher
  await provisionOrixaUser({
    loginId: 'EMP-CS-05',
    password: 'SecurePassword123!',
    fullName: 'Prof. David Clark',
    role: 'TEACHER',
    collegeId: '11111111-1111-1111-1111-111111111111',
    departmentId: '22222222-2222-2222-2222-222222222222',
    employeeId: 'EMP-CS-05',
    designation: 'Assistant Professor'
  });

  // Provision a new Student
  await provisionOrixaUser({
    loginId: 'STU-2026-001',
    password: 'StudentPin123!',
    fullName: 'Maria Garcia',
    role: 'STUDENT',
    collegeId: '11111111-1111-1111-1111-111111111111',
    departmentId: '22222222-2222-2222-2222-222222222222',
    studentId: 'STU-2026-001',
    academicLevelId: '33333333-3333-3333-3333-333333333333',
    rollNumber: 'CS-SE-12'
  });
}

main().catch(console.error);
```

---

## 4. Local Database Seed File

For local development and automated testing, default seed data across all 4 roles is maintained in `supabase/seed.sql`.

Running `npx supabase db reset` automatically applies migrations and loads `supabase/seed.sql`, populating test accounts:

- **College Admin:** ID `jspmntc`
- **HOD:** ID `HOD-CS-01`
- **Teacher:** ID `EMP-CS-01`
- **Student:** ID `STAR_STUDENT`
