/* ==========================================================================
   ORIXA - SUPABASE ENVIRONMENT CONFIGURATION
   ========================================================================== */

(function () {
    'use strict';

    var isLocal = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '' ||
        window.location.hostname.endsWith('.local')
    );

    var defaultUrl = isLocal ? 'http://127.0.0.1:54321' : 'https://qhjpllwvjoswxbiqtqdt.supabase.co';

    var defaultConfig = {
        SUPABASE_URL: defaultUrl,
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcCIsInJvbGUiOiJhb24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTA0MDAwMH0.placeholder-anon-key',
    window.ORIXA_CONFIG = Object.assign({
        SUPABASE_URL: 'https://qhjpllwvjoswxbiqtqdt.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoanBsbHd2am9zd3hiaXF0cWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MjYxNDEsImV4cCI6MjEwNTUwMjE0MX0.xq_NQtbDvuabR6-WeuC5YTRHaMPBnh2v5W2JIlQC6uE',
        INTERNAL_AUTH_DOMAIN: 'auth.orixa.internal'
    };

    window.ORIXA_CONFIG = Object.assign(defaultConfig, window.ORIXA_CONFIG || {});
})();
