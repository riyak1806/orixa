/* ==========================================================================
   ORIXA - TEACHER & COLLEGE LOGIN CONTROLLER
   ========================================================================== */

class TeacherParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.bubbles = [];
        this.colors = ['#81c784', '#ffd54f', '#4fc3f7', '#ba68c8', '#ffb74d'];

        if (!this.ctx) {
            return;
        }

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initBubbles();
    }

    initBubbles() {
        this.bubbles = [];
        const count = Math.min(Math.floor(window.innerWidth / 35), 35);

        for (let i = 0; i < count; i++) {
            this.bubbles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 12 + 6,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                vx: (Math.random() - 0.5) * 0.4,
                vy: -(Math.random() * 0.6 + 0.3),
                alpha: Math.random() * 0.25 + 0.15
            });
        }
    }

    draw() {
        if (!this.ctx) {
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.bubbles.forEach(bubble => {
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = bubble.color;
            this.ctx.globalAlpha = bubble.alpha;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(
                bubble.x - bubble.radius * 0.3,
                bubble.y - bubble.radius * 0.3,
                bubble.radius * 0.25,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = bubble.alpha * 0.75;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;

            bubble.x += bubble.vx + Math.sin(bubble.y / 50) * 0.15;
            bubble.y += bubble.vy;

            if (bubble.y + bubble.radius < 0) {
                bubble.y = this.canvas.height + bubble.radius;
                bubble.x = Math.random() * this.canvas.width;
                bubble.vx = (Math.random() - 0.5) * 0.4;
                bubble.vy = -(Math.random() * 0.6 + 0.3);
            }

            if (bubble.x < -bubble.radius) {
                bubble.x = this.canvas.width + bubble.radius;
            }

            if (bubble.x > this.canvas.width + bubble.radius) {
                bubble.x = -bubble.radius;
            }
        });
    }

    animate() {
        if (!this.ctx) {
            return;
        }

        this.draw();
        window.requestAnimationFrame(() => this.animate());
    }
}

function initPasswordToggle() {
    const passwordInput = document.getElementById('login-password');
    const toggleButton = document.getElementById('login-password-toggle');
    const eyeOpen = document.getElementById('login-eye-open');
    const eyeClosed = document.getElementById('login-eye-closed');

    if (!passwordInput || !toggleButton || !eyeOpen || !eyeClosed) {
        return;
    }

    toggleButton.addEventListener('click', () => {
        const shouldShowPassword = passwordInput.type === 'password';

        passwordInput.type = shouldShowPassword ? 'text' : 'password';
        toggleButton.setAttribute('aria-label', shouldShowPassword ? 'Hide password' : 'Show password');
        eyeOpen.classList.toggle('hidden', shouldShowPassword);
        eyeClosed.classList.toggle('hidden', !shouldShowPassword);
    });
}

function initHodPasswordToggle() {
    const passwordInput = document.getElementById('hod-password');
    const toggleButton = document.getElementById('hod-password-toggle');
    const eyeOpen = document.getElementById('hod-eye-open');
    const eyeClosed = document.getElementById('hod-eye-closed');

    if (!passwordInput || !toggleButton || !eyeOpen || !eyeClosed) {
        return;
    }

    toggleButton.addEventListener('click', () => {
        const shouldShowPassword = passwordInput.type === 'password';

        passwordInput.type = shouldShowPassword ? 'text' : 'password';
        toggleButton.setAttribute('aria-label', shouldShowPassword ? 'Hide password' : 'Show password');
        eyeOpen.classList.toggle('hidden', shouldShowPassword);
        eyeClosed.classList.toggle('hidden', !shouldShowPassword);
    });
}

function initCollegePasswordToggle() {
    const passwordInput = document.getElementById('college-password');
    const toggleButton = document.getElementById('college-password-toggle');
    const eyeOpen = document.getElementById('college-eye-open');
    const eyeClosed = document.getElementById('college-eye-closed');

    if (!passwordInput || !toggleButton || !eyeOpen || !eyeClosed) {
        return;
    }

    toggleButton.addEventListener('click', () => {
        const shouldShowPassword = passwordInput.type === 'password';

        passwordInput.type = shouldShowPassword ? 'text' : 'password';
        toggleButton.setAttribute('aria-label', shouldShowPassword ? 'Hide password' : 'Show password');
        eyeOpen.classList.toggle('hidden', shouldShowPassword);
        eyeClosed.classList.toggle('hidden', !shouldShowPassword);
    });
}

function initTeacherLoginForm() {
    const form = document.getElementById('teacher-login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');
    const formMessage = document.getElementById('login-form-msg');
    const submitButton = document.getElementById('login-submit-btn');
    const buttonLabel = submitButton ? submitButton.querySelector('.btn-label') : null;
    const buttonSpinner = submitButton ? submitButton.querySelector('.btn-spinner') : null;
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form || !emailInput || !passwordInput || !emailError || !passwordError || !formMessage || !submitButton) {
        return;
    }

    const setFieldState = (input, errorElement, message) => {
        input.classList.toggle('input-invalid', Boolean(message));
        errorElement.textContent = message;
    };

    const setFormMessage = (message, type) => {
        formMessage.textContent = message;
        formMessage.classList.remove('success', 'error');

        if (type) {
            formMessage.classList.add(type);
        }
    };

    const setSubmitting = isSubmitting => {
        submitButton.disabled = isSubmitting;

        if (buttonLabel) {
            buttonLabel.textContent = isSubmitting ? 'LOGGING IN' : 'LOG IN';
        }

        if (buttonSpinner) {
            buttonSpinner.classList.toggle('hidden', !isSubmitting);
        }
    };

    const validate = () => {
        let isValid = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        setFieldState(emailInput, emailError, '');
        setFieldState(passwordInput, passwordError, '');
        setFormMessage('', null);

        if (!email) {
            setFieldState(emailInput, emailError, 'Email is required.');
            isValid = false;
        } else if (!emailPattern.test(email)) {
            setFieldState(emailInput, emailError, 'Enter a valid email address.');
            isValid = false;
        }

        if (!password) {
            setFieldState(passwordInput, passwordError, 'Password is required.');
            isValid = false;
        }

        return isValid;
    };

    emailInput.addEventListener('input', () => {
        setFieldState(emailInput, emailError, '');
        setFormMessage('', null);
    });

    passwordInput.addEventListener('input', () => {
        setFieldState(passwordInput, passwordError, '');
        setFormMessage('', null);
    });

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', event => {
            event.preventDefault();
            setFormMessage('Please contact your Orixa administrator to reset your password.', 'error');
        });
    }

    form.addEventListener('submit', event => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        const emailVal = emailInput.value.trim().toLowerCase();
        let teacherName = 'Professor Riley';
        let teacherEmpId = 'EMP-7392';

        if (emailVal.includes('teachera') || emailVal.includes('teacher-a') || emailVal === 'a@school.edu') {
            teacherName = 'Teacher A';
            teacherEmpId = 'EMP-CS-03';
        } else if (emailVal.includes('teacherb') || emailVal.includes('teacher-b') || emailVal === 'b@school.edu') {
            teacherName = 'Teacher B';
            teacherEmpId = 'EMP-CS-04';
        } else if (emailVal.includes('sarah')) {
            teacherName = 'Prof. Sarah Jenkins';
            teacherEmpId = 'EMP-CS-01';
        } else if (emailVal.includes('alan')) {
            teacherName = 'Prof. Alan Turing';
            teacherEmpId = 'EMP-CS-02';
        }

        try {
            localStorage.setItem('orixa_current_teacher', JSON.stringify({
                name: teacherName,
                email: emailVal,
                empId: teacherEmpId
            }));
        } catch (e) {
            console.warn('Could not save current teacher login to localStorage:', e);
        }

        setSubmitting(true);

        window.setTimeout(() => {
            setSubmitting(false);
            setFormMessage('Opening teacher dashboard.', 'success');
            window.location.href = 'teacher-dashboard.html';
        }, 500);
    });
}

function initCollegeLoginForm() {
    const form = document.getElementById('college-login-form');
    const codeInput = document.getElementById('college-code');
    const passwordInput = document.getElementById('college-password');
    const codeError = document.getElementById('college-code-error');
    const passwordError = document.getElementById('college-password-error');
    const formMessage = document.getElementById('college-form-msg');
    const submitButton = document.getElementById('college-login-submit-btn');
    const buttonLabel = submitButton ? submitButton.querySelector('.btn-label') : null;
    const buttonSpinner = submitButton ? submitButton.querySelector('.btn-spinner') : null;

    if (!form || !codeInput || !passwordInput || !codeError || !passwordError || !formMessage || !submitButton) {
        return;
    }

    const setFieldState = (input, errorElement, message) => {
        input.classList.toggle('input-invalid', Boolean(message));
        errorElement.textContent = message;
    };

    const setFormMessage = (message, type) => {
        formMessage.textContent = message;
        formMessage.classList.remove('success', 'error');

        if (type) {
            formMessage.classList.add(type);
        }
    };

    const setSubmitting = isSubmitting => {
        submitButton.disabled = isSubmitting;

        if (buttonLabel) {
            buttonLabel.textContent = isSubmitting ? 'LOGGING IN' : 'LOG IN';
        }

        if (buttonSpinner) {
            buttonSpinner.classList.toggle('hidden', !isSubmitting);
        }
    };

    const validate = () => {
        let isValid = true;
        const code = codeInput.value.trim();
        const password = passwordInput.value.trim();

        setFieldState(codeInput, codeError, '');
        setFieldState(passwordInput, passwordError, '');
        setFormMessage('', null);

        if (!code) {
            setFieldState(codeInput, codeError, 'College ID is required.');
            isValid = false;
        }

        if (!password) {
            setFieldState(passwordInput, passwordError, 'Password is required.');
            isValid = false;
        }

        return isValid;
    };

    codeInput.addEventListener('input', () => {
        setFieldState(codeInput, codeError, '');
        setFormMessage('', null);
    });

    passwordInput.addEventListener('input', () => {
        setFieldState(passwordInput, passwordError, '');
        setFormMessage('', null);
    });

    form.addEventListener('submit', event => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        const collegeId = codeInput.value.trim().toLowerCase();

        setSubmitting(true);

        window.setTimeout(() => {
            setSubmitting(false);

            if (collegeId === 'jspmntc') {
                setFormMessage('Redirecting to General College Dashboard...', 'success');
                window.location.href = 'college-dashboard.html';
            } else if (collegeId === 'jspmntccs') {
                setFormMessage('Redirecting to Computer Department HOD Login...', 'success');
                window.location.href = 'hod-login.html';
            } else {
                setFormMessage('Invalid College ID. Please enter a valid registered College ID.', 'error');
                setFieldState(codeInput, codeError, 'Unrecognized College ID.');
            }
        }, 500);
    });
}

function initHodLoginForm() {
    const form = document.getElementById('hod-login-form');
    const empIdInput = document.getElementById('hod-employee-id');
    const passwordInput = document.getElementById('hod-password');
    const empIdError = document.getElementById('hod-employee-id-error');
    const passwordError = document.getElementById('hod-password-error');
    const formMessage = document.getElementById('hod-form-msg');
    const submitButton = document.getElementById('hod-login-submit-btn');
    const buttonLabel = submitButton ? submitButton.querySelector('.btn-label') : null;
    const buttonSpinner = submitButton ? submitButton.querySelector('.btn-spinner') : null;

    if (!form || !empIdInput || !passwordInput || !empIdError || !passwordError || !formMessage || !submitButton) {
        return;
    }

    const setFieldState = (input, errorElement, message) => {
        input.classList.toggle('input-invalid', Boolean(message));
        errorElement.textContent = message;
    };

    const setFormMessage = (message, type) => {
        formMessage.textContent = message;
        formMessage.classList.remove('success', 'error');

        if (type) {
            formMessage.classList.add(type);
        }
    };

    const setSubmitting = isSubmitting => {
        submitButton.disabled = isSubmitting;

        if (buttonLabel) {
            buttonLabel.textContent = isSubmitting ? 'LOGGING IN' : 'LOG IN';
        }

        if (buttonSpinner) {
            buttonSpinner.classList.toggle('hidden', !isSubmitting);
        }
    };

    const validate = () => {
        let isValid = true;
        const empId = empIdInput.value.trim();
        const password = passwordInput.value.trim();

        setFieldState(empIdInput, empIdError, '');
        setFieldState(passwordInput, passwordError, '');
        setFormMessage('', null);

        if (!empId) {
            setFieldState(empIdInput, empIdError, 'HOD Employee ID is required.');
            isValid = false;
        }

        if (!password) {
            setFieldState(passwordInput, passwordError, 'Password is required.');
            isValid = false;
        }

        return isValid;
    };

    empIdInput.addEventListener('input', () => {
        setFieldState(empIdInput, empIdError, '');
        setFormMessage('', null);
    });

    passwordInput.addEventListener('input', () => {
        setFieldState(passwordInput, passwordError, '');
        setFormMessage('', null);
    });

    form.addEventListener('submit', event => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        const empId = empIdInput.value.trim().toUpperCase();
        const password = passwordInput.value.trim();

        setSubmitting(true);

        window.setTimeout(() => {
            setSubmitting(false);

            const validEmpIds = ['HOD-CS-01', 'HOD-CS-02', 'HOD-CS-03', 'HOD-CS-04', 'HOD-CS', 'HOD-101', 'HOD01'];
            const validPasswords = ['password123', 'hod123', 'password', 'admin123', 'jspmntccs', 'hod-cs-01'];

            const isValidEmpId = validEmpIds.includes(empId) || (empId.startsWith('HOD-') && empId.length > 4);
            const isValidPassword = validPasswords.includes(password) || password === 'hod123' || password === 'password123';

            if (isValidEmpId && isValidPassword) {
                setFormMessage('Opening Computer Department HOD Dashboard...', 'success');
                window.location.href = 'hod-dashboard.html';
            } else {
                setFormMessage('Invalid HOD Employee ID or Password. Please try again.', 'error');
                if (!isValidEmpId) {
                    setFieldState(empIdInput, empIdError, 'Unrecognized HOD Employee ID.');
                }
                if (!isValidPassword) {
                    setFieldState(passwordInput, passwordError, 'Incorrect password.');
                }
            }
        }, 500);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const particles = new TeacherParticles('particles-canvas');

    particles.animate();
    initPasswordToggle();
    initCollegePasswordToggle();
    initHodPasswordToggle();
    initTeacherLoginForm();
    initCollegeLoginForm();
    initHodLoginForm();
});
