const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qhjpllwvjoswxbiqtqdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoanBsbHd2am9zd3hiaXF0cWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MjYxNDEsImV4cCI6MjEwNTUwMjE0MX0.xq_NQtbDvuabR6-WeuC5YTRHaMPBnh2v5W2JIlQC6uE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAuthTest() {
    console.log("1. Attempting login as TEACHER...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'emp-cs-01@auth.orixa.internal',
        password: 'Password123!'
    });
    
    if (authError) {
        console.error("Login failed:", authError.message);
        return;
    }
    console.log("Login Success! User ID:", authData.user.id);
    
    console.log("\n2. Performing SELECT on public.profiles as authenticated user...");
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id);
        
    if (profileError) {
        console.error("SELECT failed:", profileError.message);
    } else {
        console.log("SELECT Success! Data returned:");
        console.log(profileData);
    }
    
    console.log("\n3. Testing a WRITE operation (Updating own profile name)...");
    const newName = 'Prof. Sarah Jenkins (Updated via test)';
    const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: newName })
        .eq('id', authData.user.id)
        .select();
        
    if (updateError) {
        console.error("UPDATE failed:", updateError.message);
    } else {
        console.log("UPDATE Success! Data returned:");
        console.log(updateData);
    }
    
    // Revert it back just to be clean
    await supabase.from('profiles').update({ full_name: 'Prof. Sarah Jenkins' }).eq('id', authData.user.id);
}

runAuthTest();
