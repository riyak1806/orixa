/* ==========================================================================
   ORIXA - SECURE USER PROVISIONING UTILITY (ADMIN / SERVER-SIDE ONLY)
   Provision users into Supabase Auth and public.profiles without email confirmation.
   Usage:
     SUPABASE_URL="http://127.0.0.1:54321" \
     SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
     node scripts/provision_users.js
   ========================================================================== */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INTERNAL_AUTH_DOMAIN = process.env.INTERNAL_AUTH_DOMAIN || 'auth.orixa.internal';

function toInternalEmail(loginId) {
    if (!loginId || typeof loginId !== 'string') {
        throw new Error('Valid loginId is required');
    }
    return `${loginId.trim().toLowerCase()}@${INTERNAL_AUTH_DOMAIN}`;
}

async function provisionOrixaUser(userSpec) {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required to provision users.');
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const {
        loginId,
        password,
        fullName,
        role,
        collegeId,
        departmentId = null,
        employeeId = null,
        studentId = null,
        academicLevelId = null,
        designation = null,
        rollNumber = null
    } = userSpec;

    if (!loginId || !password || !fullName || !role || !collegeId) {
        throw new Error('Missing required user fields: loginId, password, fullName, role, collegeId are mandatory.');
    }

    const internalEmail = toInternalEmail(loginId);

    console.log(`[ORIXA PROVISION] Provisioning user '${loginId}' (${role}) -> internal Auth email: '${internalEmail}'...`);

    // 1. Create or retrieve Supabase Auth User with auto-confirmed email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: internalEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
            login_id: loginId,
            full_name: fullName,
            role: role
        }
    });

    let userId;

    if (authError) {
        if (authError.message && authError.message.includes('already exists')) {
            console.log(`[ORIXA PROVISION] Auth account for '${internalEmail}' already exists. Updating profile...`);
            // Find existing user by email
            const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            if (listError || !usersData || !usersData.users) {
                throw new Error(`Failed to locate existing Auth user: ${listError ? listError.message : 'Unknown error'}`);
            }
            const existingUser = usersData.users.find(u => u.email === internalEmail);
            if (!existingUser) {
                throw new Error(`Could not find existing user ID for ${internalEmail}`);
            }
            userId = existingUser.id;
            // Update password if specified
            await supabaseAdmin.auth.admin.updateUserById(userId, { password });
        } else {
            throw new Error(`Supabase Auth admin createUser failed: ${authError.message}`);
        }
    } else {
        userId = authData.user.id;
    }

    // 2. Upsert into public.profiles
    const profilePayload = {
        id: userId,
        login_id: loginId,
        college_id: collegeId,
        department_id: departmentId,
        role: role,
        full_name: fullName,
        is_active: true
    };

    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
        throw new Error(`Failed to upsert public.profiles record: ${profileError.message}`);
    }

    // 3. Upsert role-specific profile metadata
    if (role === 'TEACHER') {
        const empCode = employeeId || loginId;
        const { error: teacherError } = await supabaseAdmin
            .from('teacher_profiles')
            .upsert({
                profile_id: userId,
                college_id: collegeId,
                role: 'TEACHER',
                employee_id: empCode,
                designation: designation || 'Faculty Member'
            }, { onConflict: 'profile_id' });

        if (teacherError) {
            throw new Error(`Failed to upsert teacher_profiles: ${teacherError.message}`);
        }
    } else if (role === 'STUDENT') {
        const stuCode = studentId || loginId;
        if (!academicLevelId) {
            console.warn(`[ORIXA PROVISION] Warning: Student '${loginId}' missing academicLevelId.`);
        } else {
            const { error: studentError } = await supabaseAdmin
                .from('student_profiles')
                .upsert({
                    profile_id: userId,
                    college_id: collegeId,
                    role: 'STUDENT',
                    student_id: stuCode,
                    academic_level_id: academicLevelId,
                    roll_number: rollNumber
                }, { onConflict: 'profile_id' });

            if (studentError) {
                throw new Error(`Failed to upsert student_profiles: ${studentError.message}`);
            }
        }
    } else if (role === 'HOD') {
        if (departmentId) {
            const { error: hodError } = await supabaseAdmin
                .from('hod_assignments')
                .upsert({
                    profile_id: userId,
                    role: 'HOD',
                    department_id: departmentId,
                    is_active: true
                }, { onConflict: 'id' });

            if (hodError) {
                console.warn(`[ORIXA PROVISION] Warning on hod_assignments upsert: ${hodError.message}`);
            }
        }
    }

    console.log(`[ORIXA PROVISION] SUCCESS: Provisioned user '${loginId}' (UUID: ${userId}) for role '${role}'.`);
    return { userId, loginId, role };
}

// CLI runner if executed directly
if (require.main === module) {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
        console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable must be set.');
        console.error('Usage example:');
        console.error('  SUPABASE_URL="http://127.0.0.1:54321" SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" node scripts/provision_users.js');
        process.exit(1);
    }

    console.log('ORIXA Provisioning Utility ready.');
}

module.exports = {
    provisionOrixaUser,
    toInternalEmail
};
