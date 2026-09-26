/* ==========================================================================
   ORIXA - STUDENT LOGIN CONTROLLER
   ========================================================================== */

class StudentParticles {
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

function initPinToggle() {
    const pinInput = document.getElementById('student-pin');
    const toggleButton = document.getElementById('pin-password-toggle');
    const eyeOpen = document.getElementById('pin-eye-open');
    const eyeClosed = document.getElementById('pin-eye-closed');

    if (!pinInput || !toggleButton || !eyeOpen || !eyeClosed) {
        return;
    }

    toggleButton.addEventListener('click', () => {
        const shouldShowPin = pinInput.type === 'password';

        pinInput.type = shouldShowPin ? 'text' : 'password';
        toggleButton.setAttribute('aria-label', shouldShowPin ? 'Hide PIN' : 'Show PIN');
        eyeOpen.classList.toggle('hidden', shouldShowPin);
        eyeClosed.classList.toggle('hidden', !shouldShowPin);
    });
}

function initStudentLoginForm() {
    const form = document.getElementById('student-login-form');
    const usernameInput = document.getElementById('student-username');
    const pinInput = document.getElementById('student-pin');
    const usernameError = document.getElementById('student-username-error');
    const pinError = document.getElementById('student-pin-error');
    const formMessage = document.getElementById('login-form-msg');
    const submitButton = document.getElementById('login-submit-btn');
    const buttonLabel = submitButton ? submitButton.querySelector('.btn-label') : null;
    const buttonSpinner = submitButton ? submitButton.querySelector('.btn-spinner') : null;

    if (!form || !usernameInput || !pinInput || !usernameError || !pinError || !formMessage || !submitButton) {
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
        const username = usernameInput.value.trim();
        const pin = pinInput.value.trim();

        setFieldState(usernameInput, usernameError, '');
        setFieldState(pinInput, pinError, '');
        setFormMessage('', null);

        if (!username) {
            setFieldState(usernameInput, usernameError, 'Student ID / Username is required.');
            isValid = false;
        } else if (username.length < 3) {
            setFieldState(usernameInput, usernameError, 'Username must be at least 3 characters.');
            isValid = false;
        }

        if (!pin) {
            setFieldState(pinInput, pinError, 'Access PIN / Password is required.');
            isValid = false;
        } else if (pin.length < 4) {
            setFieldState(pinInput, pinError, 'PIN must be at least 4 characters.');
            isValid = false;
        }

        return isValid;
    };

    usernameInput.addEventListener('input', () => {
        setFieldState(usernameInput, usernameError, '');
        setFormMessage('', null);
    });

    pinInput.addEventListener('input', () => {
        setFieldState(pinInput, pinError, '');
        setFormMessage('', null);
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        const usernameVal = usernameInput.value.trim();
        const pinVal = pinInput.value.trim();

        setSubmitting(true);

        try {
            const result = await window.OrixaAuth.signInWithOrixaId(usernameVal, pinVal);

            if (!result.success) {
                setSubmitting(false);
                setFormMessage(result.error || 'Authentication failed. Please check your credentials.', 'error');
                return;
            }

            const profile = result.profile;
            if (profile.role !== 'STUDENT') {
                await window.OrixaAuth.signOut();
                setSubmitting(false);
                setFormMessage('Unauthorized role for Student Login.', 'error');
                return;
            }

            setFormMessage('Opening student portal...', 'success');
            window.setTimeout(() => {
                window.location.href = 'student-portal.html';
            }, 400);
        } catch (err) {
            console.error('Student login submission error:', err);
            setSubmitting(false);
            setFormMessage('An unexpected authentication error occurred.', 'error');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const particles = new StudentParticles('particles-canvas');

    particles.animate();
    initPinToggle();
    initStudentLoginForm();
});
