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
        
        # -> Fill the username and password fields and click the 'دخول لوحة التحكم' (Login to dashboard) button to sign in as the admin user.
        # username text field
        elem = page.locator('[id="avl-اسم-المستخدم-أو-البريد"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin")
        
        # -> Fill the username and password fields and click the 'دخول لوحة التحكم' (Login to dashboard) button to sign in as the admin user.
        # •••••••••••• password field
        elem = page.locator('[id="avl-كلمة-المرور"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("admin")
        
        # -> Fill the username and password fields and click the 'دخول لوحة التحكم' (Login to dashboard) button to sign in as the admin user.
        # دخول لوحة التحكم button
        elem = page.get_by_role('button', name='دخول لوحة التحكم', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'الفروع المؤسسية' (Branches) entry in the Organizational Structure sidebar menu to open the Branches section.
        # الفروع المؤسسية → button
        elem = page.get_by_role('button', name='الفروع المؤسسية →', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'إضافة جديد' (Add New) button to open the branch creation form.
        # إضافة جديد button
        elem = page.get_by_role('button', name='إضافة جديد', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'الكيان القانوني' (Legal Entity) dropdown so the company '(LE-001) شركة أفيلينك القابضة العالمية' can be selected.
        # text field
        elem = page.locator('[id="avl-الاسم-(بالإنجليزية)-*"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Dept Scope Branch")
        
        # -> Open the 'الكيان القانوني' (Legal Entity) dropdown so the company '(LE-001) شركة أفيلينك القابضة العالمية' can be selected.
        # text field
        elem = page.locator('[id="avl-الاسم-(بالعربية)-*"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("\u0641\u0631\u0639 \u0627\u062e\u062a\u0628\u0627\u0631 \u0627\u0644\u0623\u0642\u0633\u0627\u0645")
        
        # -> Open the 'الكيان القانوني' (Legal Entity) dropdown so the company '(LE-001) شركة أفيلينك القابضة العالمية' can be selected.
        # شركة أفيلينك القابضة العالمية (LE-001) شركة... dropdown
        elem = page.locator('[id="avl-الكيان-القانوني-*"]')
        await elem.click(timeout=10000)
        
        # -> Click the 'حفظ التعديلات' (Save changes) button to submit the new branch form.
        # حفظ التعديلات button
        elem = page.get_by_role('button', name='حفظ التعديلات', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'شجرة الأقسام والهيكل' (Departments tree) for the 'فرع اختبار الأقسام / Dept Scope Branch' row by clicking the 'شجرة الأقسام والهيكل' button.
        # شجرة الأقسام والهيكل button
        elem = page.get_by_text('BR-DEP-05', exact=True).locator("xpath=ancestor-or-self::*[.//button][1]").get_by_role('button', name='شجرة الأقسام والهيكل', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'إضافة مستوى رئيسي' (Add Root Node) button to open the new department creation form.
        # إضافة مستوى رئيسي button
        elem = page.get_by_role('button', name='إضافة مستوى رئيسي', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill 'الاسم (بالإنجليزية)' and 'الاسم (بالعربية)' then set 'نوع المستوى' to 'تفصيلي (فرعي / ترحيلي)'.
        # text field
        elem = page.locator('[id="avl-الاسم-(بالإنجليزية)-*"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Dept Scope Level")
        
        # -> Fill 'الاسم (بالإنجليزية)' and 'الاسم (بالعربية)' then set 'نوع المستوى' to 'تفصيلي (فرعي / ترحيلي)'.
        # text field
        elem = page.locator('[id="avl-الاسم-(بالعربية)-*"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("\u0642\u0633\u0645 \u0627\u062e\u062a\u0628\u0627\u0631 \u0627\u0644\u0623\u0642\u0633\u0627\u0645")
        
        # -> Fill 'الاسم (بالإنجليزية)' and 'الاسم (بالعربية)' then set 'نوع المستوى' to 'تفصيلي (فرعي / ترحيلي)'.
        # تجميعي (رئيسي) تفصيلي (فرعي / ترحيلي) dropdown
        elem = page.locator("xpath=/html/body/div/div/div/div[2]/main/div/div[3]/div[2]/div/form/div[3]/div/select").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.select_option("")
        
        # -> Click the 'حفظ التعديلات' (Save changes) button to submit the new department.
        # حفظ التعديلات button
        elem = page.get_by_role('button', name='حفظ التعديلات', exact=True)
        await elem.click(timeout=10000)
        
        # -> Change the department English name to 'Dept Scope Level Edited' and Arabic name to 'قسم اختبار الأقسام - معدل', then click the 'حفظ التعديلات' (Save changes) button to save.
        # text field
        elem = page.locator('[id="avl-الاسم-(بالإنجليزية)-*"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Dept Scope Level Edited")
        
        # -> Change the department English name to 'Dept Scope Level Edited' and Arabic name to 'قسم اختبار الأقسام - معدل', then click the 'حفظ التعديلات' (Save changes) button to save.
        # text field
        elem = page.locator('[id="avl-الاسم-(بالعربية)-*"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("\u0642\u0633\u0645 \u0627\u062e\u062a\u0628\u0627\u0631 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 - \u0645\u0639\u062f\u0644")
        
        # -> Change the department English name to 'Dept Scope Level Edited' and Arabic name to 'قسم اختبار الأقسام - معدل', then click the 'حفظ التعديلات' (Save changes) button to save.
        # حفظ التعديلات button
        elem = page.get_by_role('button', name='حفظ التعديلات', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The edited department appears in the departments list with the Arabic label 'قسم اختبار الأقسام - معدل'.
        # Assert-outcome: passed
        # Assert: Department Arabic name in the list equals the edited value.
        await expect(page.locator("xpath=/html/body/div[1]/div[1]/div/div[2]/main/div/div[3]/div[1]/div/div[2]/div/div/span[2]").nth(0)).to_have_text("\u0642\u0633\u0645 \u0627\u062e\u062a\u0628\u0627\u0631 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 - \u0645\u0639\u062f\u0644", timeout=15000), "Department Arabic name in the list equals the edited value."
        
        # --> The department edit form shows the updated English and Arabic names.
        # Assert-outcome: passed
        # Assert: English name input has the edited English value.
        await expect(page.locator("xpath=/html/body/div[1]/div[1]/div/div[2]/main/div/div[3]/div[2]/div/form/div[2]/div/input").nth(0)).to_have_value("Dept Scope Level Edited", timeout=15000), "English name input has the edited English value."
        # Assert-outcome: passed
        # Assert: Arabic name input has the edited Arabic value.
        await expect(page.locator("xpath=/html/body/div[1]/div[1]/div/div[2]/main/div/div[3]/div[2]/div/form/div[3]/div/input").nth(0)).to_have_value("\u0642\u0633\u0645 \u0627\u062e\u062a\u0628\u0627\u0631 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 - \u0645\u0639\u062f\u0644", timeout=15000), "Arabic name input has the edited Arabic value."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    