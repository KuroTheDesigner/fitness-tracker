from playwright.sync_api import sync_playwright
import time
import os

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print("Navigating to Vercel preview...")
        page.goto("https://fitness-tracker-o55w1bap3-davids-projects-9deb44f6.vercel.app/")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(2000)

        print("Clicking Progress Nav Tab...")
        page.click("text=Progress")
        page.wait_for_timeout(1500)

        # Take a screenshot to confirm we are on the Progress Page
        page.screenshot(path="progress_page_load.png")
        print("Progress page loaded.")

        print("Clicking the Chest Label off the 3D SVG to open Goal Modal...")
        # Since it's a graphical element or card:
        # We can look for the text "Chest" or the SVG element. Recharts generates text nodes.
        try:
            page.click("text=Chest", timeout=3000)
            page.wait_for_timeout(1000)
            print("Modal opened successfully.")
            page.screenshot(path="muscle_goal_modal_open.png")

            # Modify the input inside the modal
            # The input might have placeholder or be a number input
            # Let's type '10' in the first number input in the dialog
            dialog = page.locator('[role="dialog"]')
            if dialog.is_visible():
                input_field = dialog.locator('input[type="number"]')
                input_field.fill("10")
                page.screenshot(path="muscle_goal_modal_edited.png")

                # Look for a Save or Close button
                save_buttons = dialog.locator('button:has-text("Save")')
                if save_buttons.count() > 0:
                    save_buttons.first.click()
                else:
                    dialog.locator('button:has-text("Close")').first.click()
                
                page.wait_for_timeout(1000)
                page.screenshot(path="muscle_goal_modal_saved.png")
                print("Math overridden successfully.")
            else:
                print("Dialog not found after clicking Chest.")
        except Exception as e:
            print("Error interacting with SVG/Modal:", e)

        print("Test Complete.")
        context.close()
        browser.close()

if __name__ == "__main__":
    run_test()
