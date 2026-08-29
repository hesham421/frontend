import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:4200")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Create Account' button to open the signup form.
        # Login button
        elem = page.get_by_role('button', name='Login', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Create Account' button to open the signup form.
        # Create Account button
        elem = page.get_by_role('button', name='Create Account', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Username or Email', 'Work Email Address', and 'Password' fields and click the 'Submit Registration' button.
        # username text field
        elem = page.locator('[id="avl-username-or-email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("testuser20260829")
        
        # -> Fill the 'Username or Email', 'Work Email Address', and 'Password' fields and click the 'Submit Registration' button.
        # user@avelynq.com email field
        elem = page.locator('[id="avl-work-email-address"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("testuser20260829@avelynq.com")
        
        # -> Fill the 'Username or Email', 'Work Email Address', and 'Password' fields and click the 'Submit Registration' button.
        # •••••••••••• password field
        elem = page.locator('[id="avl-password"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Password123!")
        
        # -> Fill the 'Username or Email', 'Work Email Address', and 'Password' fields and click the 'Submit Registration' button.
        # Submit Registration button
        elem = page.get_by_role('button', name='Submit Registration', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Username or Email' field with 'testuser20260829@avelynq.com', enter activation code 'ACT-998822', then click the 'Activate Account' button.
        # username text field
        elem = page.locator('[id="avl-username-or-email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("testuser20260829@avelynq.com")
        
        # -> Fill the 'Username or Email' field with 'testuser20260829@avelynq.com', enter activation code 'ACT-998822', then click the 'Activate Account' button.
        # ACT-998822 text field
        elem = page.locator('[id="avl-activation-code-/-token"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("ACT-998822")
        
        # -> Fill the 'Username or Email' field with 'testuser20260829@avelynq.com', enter activation code 'ACT-998822', then click the 'Activate Account' button.
        # Activate Account button
        elem = page.get_by_role('button', name='Activate Account', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Back to Login' link to return to the Login tab and attempt signing in with the new account.
        # ← Back to Login button
        elem = page.get_by_role('button', name='← Back to Login', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill 'testuser20260829@avelynq.com' into the Username or Email field, 'Password123!' into the Password field, then click the 'Sign In to ERP' button.
        # username text field
        elem = page.locator('[id="avl-username-or-email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("testuser20260829@avelynq.com")
        
        # -> Fill 'testuser20260829@avelynq.com' into the Username or Email field, 'Password123!' into the Password field, then click the 'Sign In to ERP' button.
        # •••••••••••• password field
        elem = page.locator('[id="avl-password"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Password123!")
        
        # -> Fill 'testuser20260829@avelynq.com' into the Username or Email field, 'Password123!' into the Password field, then click the 'Sign In to ERP' button.
        # Sign In to ERP button
        elem = page.get_by_role('button', name='Sign In to ERP', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Dashboard is displayed after logging in with the new account.
        # Assert-outcome: failed
        # Assert: Expected URL to contain /dashboard after login.
        await expect(page).to_have_url(re.compile("/dashboard"), timeout=15000), "Expected URL to contain /dashboard after login."
        
        # --> The account is activated and accessible after entering the activation code.
        # Assert-outcome: failed
        # Assert: Expected the Activate Account button to be hidden after successful activation.
        await expect(page.locator("xpath=/html/body/div[1]/div[1]/div[2]/div[2]/form/div[4]/button").nth(0)).not_to_be_visible(timeout=15000), "Expected the Activate Account button to be hidden after successful activation."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    