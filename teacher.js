/* ==========================================================================
   ORIXA - TEACHER LOGIN CONTROLLER
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

        setSubmitting(true);

        window.setTimeout(() => {
            setSubmitting(false);
            setFormMessage('Opening teacher dashboard.', 'success');
            window.location.href = 'teacher-dashboard.html';
        }, 500);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const particles = new TeacherParticles('particles-canvas');

    particles.animate();
    initPasswordToggle();
    initTeacherLoginForm();
});
