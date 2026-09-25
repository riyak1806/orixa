/* ==========================================================================
   ORIXA - CORE AUTHENTICATION & SESSION UTILITY
   Provides ID+Password login via Supabase Auth session authority & role guards.
   ========================================================================== */

(function () {
    'use strict';

    class OrixaAuthManager {
        constructor() {
            this._client = null;
            this._cachedProfile = null;
        }

        get client() {
            if (!this._client) {
                const config = window.ORIXA_CONFIG || {};
                const url = config.SUPABASE_URL || 'http://127.0.0.1:54321';
                const key = config.SUPABASE_ANON_KEY || 'placeholder-anon-key';

                if (window.supabase && typeof window.supabase.createClient === 'function') {
                    this._client = window.supabase.createClient(url, key);
                } else if (typeof createClient === 'function') {
                    this._client = createClient(url, key);
                } else {
                    console.error('Supabase JS client library not loaded.');
                }

                if (this._client && this._client.auth) {
                    this._client.auth.onAuthStateChange((event) => {
                        if (event === 'SIGNED_OUT') {
                            this._cachedProfile = null;
                        }
                    });
                }
            }
            return this._client;
        }

        async getCurrentUser() {
            const client = this.client;
            if (!client) {
                return null;
            }
            try {
                const { data, error } = await client.auth.getUser();
                if (error || !data) return null;
                return data.user;
            } catch (e) {
                console.warn('Error fetching current user:', e);
                return null;
            }
        }

        async createUserAccount(loginId, password, metadata = {}) {
            const config = window.ORIXA_CONFIG || {};
            const url = config.SUPABASE_URL || 'http://127.0.0.1:54321';
            const key = config.SUPABASE_ANON_KEY || 'placeholder-anon-key';

            let anonClient = null;
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                anonClient = window.supabase.createClient(url, key, { auth: { persistSession: false } });
            } else if (typeof createClient === 'function') {
                anonClient = createClient(url, key, { auth: { persistSession: false } });
            }

            if (!anonClient) {
                return { success: false, error: 'Supabase client library not initialized.' };
            }

            const cleanLoginId = (loginId || '').trim();
            if (!cleanLoginId) {
                return { success: false, error: 'Login ID is required.' };
            }

            const internalEmail = this.toInternalEmail(cleanLoginId);
            const userPassword = password || 'Password123!';

            try {
                const { data, error } = await anonClient.auth.signUp({
                    email: internalEmail,
                    password: userPassword,
                    options: { data: metadata }
                });

                if (error) {
                    if (error.message && error.message.includes('already exists')) {
                        const primaryClient = this.client;
                        if (primaryClient) {
                            const { data: existingProf } = await primaryClient
                                .from('profiles')
                                .select('id')
                                .eq('login_id', cleanLoginId)
                                .maybeSingle();

                            if (existingProf && existingProf.id) {
                                return { success: true, userId: existingProf.id };
                            }
                        }
                    }
                    return {
                        success: false,
                        error: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    };
                }

                if (data && data.user && data.user.id) {
                    return { success: true, userId: data.user.id };
                }

                return { success: false, error: 'Auth user creation did not return a valid user ID.' };
            } catch (err) {
                console.error('Error in OrixaAuth.createUserAccount:', err);
                return { success: false, error: err?.message || 'Failed to create user account.' };
            }
        }

        toInternalEmail(loginId) {
            if (!loginId || typeof loginId !== 'string') {
                return '';
            }
            const cleanId = loginId.trim().toLowerCase();
            const domain = (window.ORIXA_CONFIG && window.ORIXA_CONFIG.INTERNAL_AUTH_DOMAIN)
                ? window.ORIXA_CONFIG.INTERNAL_AUTH_DOMAIN
                : 'auth.orixa.internal';
            return `${cleanId}@${domain}`;
        }

        async signInWithOrixaId(loginId, password) {
            const client = this.client;
            if (!client) {
                return { success: false, error: 'Authentication service unavailable.' };
            }

            const cleanLoginId = (loginId || '').trim();
            if (!cleanLoginId) {
                return { success: false, error: 'Login ID is required.' };
            }
            if (!password) {
                return { success: false, error: 'Password is required.' };
            }

            const internalEmail = this.toInternalEmail(cleanLoginId);

            try {
                const { data, error } = await client.auth.signInWithPassword({
                    email: internalEmail,
                    password: password
                });

                if (error || !data || !data.user) {
                    return {
                        success: false,
                        error: 'Invalid ID or password. Please check your credentials.'
                    };
                }

                // Fetch user profile from public.profiles
                const { data: profile, error: profileErr } = await client
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .maybeSingle();

                if (profileErr || !profile) {
                    await client.auth.signOut();
                    return {
                        success: false,
                        error: 'Authenticated user profile not found. Please contact administrator.'
                    };
                }

                if (profile.is_active === false) {
                    await client.auth.signOut();
                    return {
                        success: false,
                        error: 'Your account is deactivated. Please contact your administrator.'
                    };
                }

                this._cachedProfile = profile;

                return {
                    success: true,
                    user: data.user,
                    session: data.session,
                    profile: profile
                };
            } catch (err) {
                console.error('OrixaAuth signIn error:', err);
                return {
                    success: false,
                    error: 'Authentication request failed. Please check network connection.'
                };
            }
        }

        async signOut() {
            this._cachedProfile = null;
            const client = this.client;
            if (client) {
                try {
                    await client.auth.signOut();
                } catch (e) {
                    console.warn('Error during signOut:', e);
                }
            }
        }

        async getCurrentSession() {
            const client = this.client;
            if (!client) {
                return null;
            }
            try {
                const { data } = await client.auth.getSession();
                return data ? data.session : null;
            } catch (e) {
                console.warn('Error fetching session:', e);
                return null;
            }
        }

        async getCurrentProfile() {
            if (this._cachedProfile) {
                return this._cachedProfile;
            }

            const session = await this.getCurrentSession();
            if (!session || !session.user) {
                return null;
            }

            const client = this.client;
            if (!client) {
                return null;
            }

            try {
                const { data: profile, error } = await client
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (error || !profile) {
                    return null;
                }

                this._cachedProfile = profile;
                return profile;
            } catch (e) {
                console.warn('Error fetching current profile:', e);
                return null;
            }
        }

        async requireRole(allowedRoles, redirectUrl) {
            const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            const targetRedirect = redirectUrl || 'index.html';

            const session = await this.getCurrentSession();
            if (!session) {
                window.location.replace(targetRedirect);
                return null;
            }

            const profile = await this.getCurrentProfile();
            if (!profile || profile.is_active === false) {
                await this.signOut();
                window.location.replace(targetRedirect);
                return null;
            }

            if (!rolesList.includes(profile.role)) {
                console.warn(`Unauthorized role access: User role '${profile.role}' not in required roles:`, rolesList);
                await this.signOut();
                window.location.replace(targetRedirect);
                return null;
            }

            return profile;
        }
    }

    window.OrixaAuth = new OrixaAuthManager();
})();
