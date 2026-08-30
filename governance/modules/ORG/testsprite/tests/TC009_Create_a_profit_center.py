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
        
        # -> Click the 'دخول لوحة التحكم' button to sign in with the 'admin' account.
        # username text field
        elem = page.locator('[id="avl-اسم-المستخدم-أو-البريد"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin")
        
        # -> Click the 'دخول لوحة التحكم' button to sign in with the 'admin' account.
        # •••••••••••• password field
        elem = page.locator('[id="avl-كلمة-المرور"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin123")
        
        # -> Click the 'دخول لوحة التحكم' button to sign in with the 'admin' account.
        # دخول لوحة التحكم button
        elem = page.get_by_role('button', name='دخول لوحة التحكم', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'مراكز الربحية' (Profit Centers) menu item in the 'الهيكل التنظيمي' (Organizational Structure) section on the left navigation to open the Profit Centers page.
        # مراكز الربحية button
        elem = page.get_by_role('button', name='مراكز الربحية', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'إضافة جديد' (Add New) button to start creating a new profit center.
        # إضافة جديد button
        elem = page.get_by_role('button', name='إضافة جديد', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'الاسم (بالإنجليزية)' and 'الاسم (بالعربية)' fields (and optionally 'الملاحظات / البيان'), then click the 'حفظ التعديلات' (Save Changes) button to create the profit center.
        # text field
        elem = page.locator('[id="avl-الاسم-(بالإنجليزية)-*"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Automated Test PC EN 2026-08-29 0829")
        
        # -> Fill the 'الاسم (بالإنجليزية)' and 'الاسم (بالعربية)' fields (and optionally 'الملاحظات / البيان'), then click the 'حفظ التعديلات' (Save Changes) button to create the profit center.
        # text field
        elem = page.locator('[id="avl-الاسم-(بالعربية)-*"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("\u0645\u0631\u0643\u0632 \u0631\u0628\u062d\u064a\u0629 \u0627\u062e\u062a\u0628\u0627\u0631 \u0622\u0644\u064a 0829 2026-08-29")
        
        # -> Fill the 'الاسم (بالإنجليزية)' and 'الاسم (بالعربية)' fields (and optionally 'الملاحظات / البيان'), then click the 'حفظ التعديلات' (Save Changes) button to create the profit center.
        # text field
        elem = page.locator('[id="avl-الملاحظات-/-البيان"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Created by automated test run 2026-08-29")
        
        # -> Fill the 'الاسم (بالإنجليزية)' and 'الاسم (بالعربية)' fields (and optionally 'الملاحظات / البيان'), then click the 'حفظ التعديلات' (Save Changes) button to create the profit center.
        # حفظ التعديلات button
        elem = page.get_by_role('button', name='حفظ التعديلات', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The newly created profit center appears in the list with the entered English and Arabic names.
        # Assert-outcome: passed
        # Assert: The English name entered appears in the profit centers list.
        await expect(page.locator("xpath=/html/body/div[1]/div[1]/div/div[2]/main/div/div[3]/div/div/table/tbody/tr[5]/td[2]").nth(0)).to_contain_text("Automated Test PC EN 2026-08-29 0829", timeout=15000), "The English name entered appears in the profit centers list."
        # Assert-outcome: passed
        # Assert: The Arabic name entered appears in the profit centers list.
        await expect(page.locator("xpath=/html/body/div[1]/div[1]/div/div[2]/main/div/div[3]/div/div/table/tbody/tr[5]/td[2]").nth(0)).to_contain_text("\u0645\u0631\u0643\u0632 \u0631\u0628\u062d\u064a\u0629 \u0627\u062e\u062a\u0628\u0627\u0631 \u0622\u0644\u064a 0829 2026-08-29", timeout=15000), "The Arabic name entered appears in the profit centers list."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    