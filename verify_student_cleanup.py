from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to student portal and disable automatic auth redirect for static layout inspection
    page.add_init_script("""
        window.addEventListener('DOMContentLoaded', () => {
            if (window.OrixaAuth) {
                window.OrixaAuth.requireRole = async () => {
                    return { full_name: 'Test Student', login_id: 'STU-1001', role: 'STUDENT', is_active: true };
                };
            }
        });
    """)
    page.goto("http://localhost:8080/student-portal.html")
    page.wait_for_timeout(1000)

    # Take screenshot of student portal showing clean initial stats and empty quiz state
    page.screenshot(path="/home/jules/verification/screenshots/student_portal_empty_state.png")
    page.wait_for_timeout(1000)

    # Click profile chip to open student profile modal
    profile_chip = page.locator(".profile-chip")
    if profile_chip.is_visible():
        profile_chip.click()
        page.wait_for_timeout(1000)

    # Take screenshot of student profile modal
    page.screenshot(path="/home/jules/verification/screenshots/student_profile_modal.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
