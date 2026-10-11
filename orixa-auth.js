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
                    this._client.auth.onAuthStateChange((event, session) => {
                        // A browser keeps one login per site. If another tab signs in as someone else (or
                        // signs out) while this page is showing one user's dashboard, this page's requests
                        // silently run as the other user and the database refuses them. Catch that here.
                        const loadedUserId = this._cachedProfile && this._cachedProfile.id;
                        const sessionUserId = session && session.user && session.user.id;

                        if (event === 'SIGNED_OUT') {
                            this._cachedProfile = null;
                            if (loadedUserId) this.handleSessionChanged('You were signed out in another tab. Please log in again.');
                        } else if (loadedUserId && sessionUserId && sessionUserId !== loadedUserId) {
                            this._cachedProfile = null;
                            this.handleSessionChanged('Another account was signed in from another tab in this browser, so this page was closed. Please log in again. Tip: use a separate browser window or profile for each role.');
                        }
                    });
                }
            }
            return this._client;
        }

        // Tells the person why the page is being closed, then returns to the start page
        handleSessionChanged(message) {
            alert(message);
            window.location.replace('index.html');
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

        // "2026-2027" -> "2026–2027" for display
        formatAcademicYear(code) {
            return String(code || '').replace(/\s*-\s*/, '\u2013');
        }

        // The college's current academic session (code such as "2026-2027"), or null
        async getCurrentAcademicYear() {
            const client = this.client;
            const profile = await this.getCurrentProfile();
            if (!client || !profile || !profile.college_id) return null;

            const { data, error } = await client
                .from('academic_sessions')
                .select('id, code, start_date, end_date')
                .eq('college_id', profile.college_id)
                .eq('is_current', true)
                .maybeSingle();
            if (error) {
                console.error('Error fetching current academic year:', error);
                return null;
            }
            return data;
        }

        // Shows the "keep your password safe" warning and a COPY button under a new-password input.
        // The password counts as copied only while the input still holds exactly the text that was copied;
        // each change-password form refuses to save until isCopied() is true.
        attachPasswordSafety(newInput) {
            const field = newInput && (newInput.closest('.form-field') || newInput.parentElement);
            if (!field) return { isCopied: () => true, reset() {} };

            const box = document.createElement('div');
            box.className = 'password-safety';
            box.style.cssText = 'display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; margin-top: 8px; background: var(--color-cream); border: var(--border-comic-thin); border-radius: 12px;';
            box.innerHTML =
                '<p role="note" style="margin: 0; font-family: var(--font-body); font-size: 0.85rem; font-weight: 700; color: var(--border-dark); line-height: 1.35;">' +
                'Important: if you forget your password there is no way to get it back. Copy it and keep it saved somewhere safe.</p>' +
                '<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">' +
                '<button type="button" class="cartoon-action-btn password-safety-copy" style="padding: 8px 16px; font-size: 0.85rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);">COPY NEW PASSWORD</button>' +
                '<span class="password-safety-status" role="status" aria-live="polite" style="font-family: var(--font-body); font-size: 0.85rem; font-weight: 700;"></span></div>';
            field.appendChild(box);

            const copyBtn = box.querySelector('.password-safety-copy');
            const status = box.querySelector('.password-safety-status');
            let copiedValue = null;

            const setStatus = (text, ok) => {
                status.textContent = text;
                status.style.color = ok ? 'var(--color-green-dark)' : 'var(--color-red-dark)';
            };
            const reset = () => { copiedValue = null; setStatus('', true); };

            const writeToClipboard = async (text) => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fall back below */ }
                }
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0;';
                document.body.appendChild(ta);
                ta.select();
                let ok = false;
                try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
                ta.remove();
                return ok;
            };

            copyBtn.addEventListener('click', async () => {
                const value = newInput.value;
                if (!value) { setStatus('Type your new password first, then copy it.', false); newInput.focus(); return; }
                if (await writeToClipboard(value)) {
                    copiedValue = value;
                    setStatus('Copied. Paste it somewhere safe before you continue.', true);
                } else {
                    copiedValue = null;
                    setStatus('Could not copy automatically. Allow clipboard access and try again.', false);
                }
            });
            newInput.addEventListener('input', () => { if (copiedValue !== null && copiedValue !== newInput.value) reset(); });
            if (newInput.form) newInput.form.addEventListener('reset', reset);

            return { isCopied: () => copiedValue !== null && copiedValue === newInput.value, reset };
        }

        /* ----- profile pictures ----- */

        // Paints every [data-user-avatar] element with the signed-in user's picture.
        // Without a picture the element keeps (or gets back) its initials.
        async paintAvatars() {
            const profile = await this.getCurrentProfile();
            const url = profile && profile.avatar_url ? profile.avatar_url : '';
            document.querySelectorAll('[data-user-avatar]').forEach(el => {
                if (url) {
                    if (el.dataset.initialsBackup === undefined) el.dataset.initialsBackup = el.textContent;
                    el.textContent = '';
                    el.style.backgroundImage = `url("${url}")`;
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                    el.style.backgroundRepeat = 'no-repeat';
                    el.setAttribute('role', 'img');
                    el.setAttribute('aria-label', 'Your profile picture');
                } else {
                    if (el.dataset.initialsBackup !== undefined) {
                        el.textContent = el.dataset.initialsBackup;
                        delete el.dataset.initialsBackup;
                    }
                    el.style.backgroundImage = '';
                    el.removeAttribute('role');
                    el.removeAttribute('aria-label');
                }
            });
        }

        // Centre-crops the chosen image to a square and shrinks it to 256x256 (a small JPEG)
        _prepareAvatar(file) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                const objectUrl = URL.createObjectURL(file);
                img.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                    const side = Math.min(img.naturalWidth, img.naturalHeight);
                    const canvas = document.createElement('canvas');
                    canvas.width = canvas.height = 256;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
                    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The image could not be processed.')), 'image/jpeg', 0.88);
                };
                img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('That file is not a readable image.')); };
                img.src = objectUrl;
            });
        }

        async _saveAvatarUrl(url) {
            const { error } = await this.client.rpc('fn_set_my_avatar', { p_url: url });
            if (error) throw new Error(error.message);
            if (this._cachedProfile) this._cachedProfile.avatar_url = url || null;
        }

        async uploadAvatar(file) {
            const user = await this.getCurrentUser();
            if (!this.client || !user) throw new Error('You are not signed in. Please log in again.');
            if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Please choose a JPEG, PNG or WebP image.');
            if (file.size > 10 * 1024 * 1024) throw new Error('That image is too large. Please choose one under 10 MB.');

            const blob = await this._prepareAvatar(file);
            const path = `${user.id}/avatar.jpg`;
            const { error } = await this.client.storage.from('avatars').upload(path, blob, {
                contentType: 'image/jpeg', upsert: true, cacheControl: '3600'
            });
            if (error) throw new Error(`Upload failed: ${error.message}`);

            // the version in the address makes browsers fetch the new picture instead of the cached one
            const { data } = this.client.storage.from('avatars').getPublicUrl(path);
            await this._saveAvatarUrl(`${data.publicUrl}?v=${Date.now()}`);
            await this.paintAvatars();
        }

        async removeAvatar() {
            const user = await this.getCurrentUser();
            if (!this.client || !user) throw new Error('You are not signed in. Please log in again.');
            await this._saveAvatarUrl(null);
            await this.client.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);
            await this.paintAvatars();
        }

        // Puts "Change photo" / "Remove" buttons under an avatar element (which must carry data-user-avatar)
        mountAvatarEditor(avatarEl) {
            if (!avatarEl || avatarEl.dataset.avatarEditor) return;
            avatarEl.dataset.avatarEditor = 'true';

            const wrap = document.createElement('div');
            wrap.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0;';
            avatarEl.parentNode.insertBefore(wrap, avatarEl);
            wrap.appendChild(avatarEl);

            const btnStyle = 'padding: 4px 10px; font-size: 0.72rem; border-color: var(--border-dark); background: #cfd8dc; box-shadow: var(--shadow-chunky-pressed);';
            const controls = document.createElement('div');
            controls.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';
            controls.innerHTML =
                `<div style="display: flex; gap: 6px;">` +
                `<button type="button" class="cartoon-action-btn avatar-change-btn" style="${btnStyle}">CHANGE PHOTO</button>` +
                `<button type="button" class="cartoon-action-btn avatar-remove-btn" style="${btnStyle}">REMOVE</button></div>` +
                `<span class="avatar-status" role="status" aria-live="polite" style="font-family: var(--font-body); font-size: 0.75rem; font-weight: 700; text-align: center; max-width: 180px;"></span>` +
                `<input type="file" class="avatar-file" accept="image/jpeg,image/png,image/webp" hidden>`;
            wrap.appendChild(controls);

            const changeBtn = controls.querySelector('.avatar-change-btn');
            const removeBtn = controls.querySelector('.avatar-remove-btn');
            const status = controls.querySelector('.avatar-status');
            const fileInput = controls.querySelector('.avatar-file');

            const say = (text, ok) => { status.textContent = text; status.style.color = ok ? 'var(--color-green-dark)' : 'var(--color-red-dark)'; };
            const busy = (isBusy) => { changeBtn.disabled = isBusy; removeBtn.disabled = isBusy; };
            const refreshRemove = async () => {
                const profile = await this.getCurrentProfile();
                removeBtn.style.display = profile && profile.avatar_url ? '' : 'none';
            };

            changeBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async () => {
                const file = fileInput.files && fileInput.files[0];
                fileInput.value = '';
                if (!file) return;
                busy(true); say('Uploading...', true);
                try { await this.uploadAvatar(file); say('Photo updated.', true); }
                catch (e) { say(e.message, false); }
                busy(false); refreshRemove();
            });
            removeBtn.addEventListener('click', async () => {
                busy(true); say('Removing...', true);
                try { await this.removeAvatar(); say('Photo removed.', true); }
                catch (e) { say(e.message, false); }
                busy(false); refreshRemove();
            });
            refreshRemove();
        }

        // Changes the signed-in user's password after confirming the current one.
        // Returns {} on success, or { field: 'current' | undefined, error } on failure.
        async changePassword(currentPassword, newPassword) {
            const client = this.client;
            const user = await this.getCurrentUser();
            if (!client || !user || !user.email) {
                return { error: 'You are not signed in. Please log in again.' };
            }

            const verify = await client.auth.signInWithPassword({ email: user.email, password: currentPassword });
            if (verify.error) {
                return { field: 'current', error: 'Current password is incorrect.' };
            }

            const { error } = await client.auth.updateUser({ password: newPassword });
            return error ? { error: `Password change failed: ${error.message}` } : {};
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
