const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qhjpllwvjoswxbiqtqdt.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoanBsbHd2am9zd3hiaXF0cWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MjYxNDEsImV4cCI6MjEwNTUwMjE0MX0.xq_NQtbDvuabR6-WeuC5YTRHaMPBnh2v5W2JIlQC6uE';

async function runDatabaseTests() {
    console.log('Starting ORIXA End-to-End Supabase Database Audits (Read & Write Tests)...\n');

    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const results = [];

    async function recordTestResult(tableName, insertSuccess, fetchSuccess, errorObj) {
        let errorMsg = 'None';
        if (errorObj) {
            errorMsg = `[Code: ${errorObj.code || 'N/A'}] ${errorObj.message || String(errorObj)}`;
            if (errorObj.details) errorMsg += ` (${errorObj.details})`;
        }
        results.push({
            tableName,
            insertSuccess: insertSuccess ? 'PASS' : 'FAIL',
            fetchSuccess: fetchSuccess ? 'PASS' : 'FAIL',
            error: errorMsg
        });
    }

    // Authenticate as Teacher (Prof. Sarah Jenkins)
    const { data: authData, error: authErr } = await client.auth.signInWithPassword({
        email: 'emp-cs-01@auth.orixa.internal',
        password: 'Password123!'
    });

    if (authErr) {
        console.error('Authentication failed:', authErr.message);
        return;
    }

    const teacherUserId = authData.user.id;
    console.log(`Successfully authenticated session as Prof. Sarah Jenkins (${teacherUserId}).\n`);

    // 1. Read test on Colleges
    try {
        const { data: cols, error: colErr } = await client.from('colleges').select('*').limit(5);
        await recordTestResult('colleges', false, !colErr, colErr ? colErr : { message: 'Read-only table for teachers' });
    } catch (e) {
        await recordTestResult('colleges', false, false, e);
    }

    // 2. Read test on Departments
    try {
        const { data: depts, error: deptErr } = await client.from('departments').select('*').limit(5);
        await recordTestResult('departments', false, !deptErr, deptErr ? deptErr : { message: 'Read-only table for teachers' });
    } catch (e) {
        await recordTestResult('departments', false, false, e);
    }

    // 3. Profiles
    try {
        const { data: profs, error: profErr } = await client.from('profiles').select('*').limit(5);
        await recordTestResult('profiles', false, !profErr, profErr ? profErr : { message: 'Read-only profile view' });
    } catch (e) {
        await recordTestResult('profiles', false, false, e);
    }

    // 4. Teacher Profiles
    try {
        const { data: tp, error: tpErr } = await client.from('teacher_profiles').select('*, profiles!teacher_profiles_profile_id_fkey(full_name, login_id)').limit(5);
        await recordTestResult('teacher_profiles', false, !tpErr, tpErr ? tpErr : { message: 'Read-only teacher profile' });
    } catch (e) {
        await recordTestResult('teacher_profiles', false, false, e);
    }

    // 5. Student Profiles
    try {
        const { data: sp, error: spErr } = await client.from('student_profiles').select('*, profiles!student_profiles_profile_id_fkey!inner(full_name, login_id, department_id)').limit(5);
        await recordTestResult('student_profiles', false, !spErr, spErr ? spErr : { message: 'Read-only student profiles' });
    } catch (e) {
        await recordTestResult('student_profiles', false, false, e);
    }

    // 6. Notifications (Insert -> Fetch -> Delete)
    try {
        const notifPayload = {
            user_id: teacherUserId,
            title: 'Audit Test Notification',
            message: 'Testing Notification Write Path',
            category: 'System',
            priority: 'Normal'
        };
        const { data: nIns, error: nInsErr } = await client.from('notifications').insert(notifPayload).select().single();
        if (nInsErr || !nIns) {
            await recordTestResult('notifications', false, false, nInsErr);
        } else {
            const { data: nFetch, error: nFetchErr } = await client.from('notifications').select('*').eq('id', nIns.id).single();
            const fetchOk = !nFetchErr && nFetch && nFetch.id === nIns.id;
            await recordTestResult('notifications', true, fetchOk, nFetchErr);
            // Delete test row
            await client.from('notifications').delete().eq('id', nIns.id);
        }
    } catch (e) {
        await recordTestResult('notifications', false, false, e);
    }

    // 7. Feedback (Insert -> Fetch -> Delete)
    try {
        const feedbackPayload = {
            user_id: teacherUserId,
            problem_type: 'Bug Report',
            subject: 'Audit Test Feedback',
            description: 'Testing Feedback Write Path'
        };
        const { data: fbIns, error: fbInsErr } = await client.from('feedback').insert(feedbackPayload).select().single();
        if (fbInsErr || !fbIns) {
            await recordTestResult('feedback', false, false, fbInsErr);
        } else {
            const { data: fbFetch, error: fbFetchErr } = await client.from('feedback').select('*').eq('id', fbIns.id).single();
            const fetchOk = !fbFetchErr && fbFetch && fbFetch.id === fbIns.id;
            await recordTestResult('feedback', true, fetchOk, fbFetchErr);
            // Delete test row
            await client.from('feedback').delete().eq('id', fbIns.id);
        }
    } catch (e) {
        await recordTestResult('feedback', false, false, e);
    }

    // 8. Quiz Attempts (Read-only for Direct Insert, Write via Gameplay RPC)
    try {
        const { data: attempts, error: attErr } = await client.from('quiz_attempts').select('*').limit(5);
        await recordTestResult('quiz_attempts', false, !attErr, attErr ? attErr : { message: 'Write via RPC fn_start_quiz_attempt' });
    } catch (e) {
        await recordTestResult('quiz_attempts', false, false, e);
    }

    // Output Table Summary
    console.log('| Table Name | Write Test | Read Test | Status / Error Info |');
    console.log('|------------|------------|-----------|---------------------|');
    results.forEach(r => {
        console.log(`| ${r.tableName} | ${r.insertSuccess} | ${r.fetchSuccess} | ${r.error} |`);
    });
}

runDatabaseTests().catch(err => {
    console.error('Fatal error in test script execution:', err);
});
