"""
Comprehensive audit script for Fitness Tracker app.
Tests functionality, captures screenshots, and logs issues.
"""
from playwright.sync_api import sync_playwright
import time
import json

AUDIT_RESULTS = {
    "pages_tested": [],
    "functional_issues": [],
    "ui_issues": [],
    "ux_issues": [],
    "screenshots": []
}

def capture_screenshot(page, name, description):
    path = f"C:/Users/Oshiogwe Ugbodaga/.gemini/antigravity/brain/2dbb45c2-2979-46e9-9aa3-ecb50d4e027f/audit_{name}.png"
    page.screenshot(path=path, full_page=True)
    AUDIT_RESULTS["screenshots"].append({"name": name, "path": path, "description": description})
    print(f"📸 Captured: {name}")

def test_homepage(page):
    """Test HomePage functionality and UI"""
    print("\n=== Testing HomePage ===")
    page.goto("https://fitness-tracker-xi-five.vercel.app/")
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    
    capture_screenshot(page, "homepage", "Homepage with schedule")
    
    # Check for key elements
    elements = {
        "program_title": page.locator("text=3-Day Full Body").count() > 0,
        "workout_title": page.locator("text=Workout").first.is_visible() if page.locator("text=Workout").count() > 0 else False,
        "get_started_btn": page.locator("text=GET STARTED").count() > 0,
        "schedule_section": page.locator("text=Schedule").count() > 0,
        "bottom_nav": page.locator("nav").count() > 0 or page.locator("[class*='bottom']").count() > 0,
    }
    
    for elem, found in elements.items():
        if not found:
            AUDIT_RESULTS["ui_issues"].append(f"HomePage: Missing element '{elem}'")
        print(f"  {'✅' if found else '❌'} {elem}")
    
    # Test navigation
    start_buttons = page.locator("text=START").all()
    if len(start_buttons) > 0:
        print(f"  ✅ Found {len(start_buttons)} START buttons")
    else:
        AUDIT_RESULTS["functional_issues"].append("HomePage: No START buttons found")
    
    AUDIT_RESULTS["pages_tested"].append("HomePage")
    return True

def test_workout_summary(page):
    """Navigate to and test WorkoutSummaryPage"""
    print("\n=== Testing WorkoutSummaryPage ===")
    
    # Click GET STARTED to go to workout summary
    get_started = page.locator("text=GET STARTED")
    if get_started.count() > 0:
        get_started.first.click()
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        
        capture_screenshot(page, "workout_summary", "Workout summary with exercises")
        
        # Check for elements
        elements = {
            "workout_name": page.locator("text=Workout").first.is_visible() if page.locator("text=Workout").count() > 0 else False,
            "exercises_list": page.locator("[class*='card']").count() > 0,
            "start_workout_btn": page.locator("text=START WORKOUT").count() > 0,
            "back_button": page.locator("svg").first.is_visible() if page.locator("svg").count() > 0 else False,
        }
        
        for elem, found in elements.items():
            if not found:
                AUDIT_RESULTS["ui_issues"].append(f"WorkoutSummary: Missing element '{elem}'")
            print(f"  {'✅' if found else '❌'} {elem}")
        
        # Test if exercises are clickable (they should navigate to detail)
        exercise_cards = page.locator("[class*='card']").all()
        print(f"  Found {len(exercise_cards)} exercise cards")
        
        if len(exercise_cards) > 0:
            # Check if clicking exercise does anything
            initial_url = page.url
            exercise_cards[0].click()
            time.sleep(0.3)
            if page.url == initial_url:
                # Check if any modal or detail view opened
                detail_visible = page.locator("text=FORM GUIDE").count() > 0 or page.locator("text=HISTORY").count() > 0
                if not detail_visible:
                    AUDIT_RESULTS["ux_issues"].append("WorkoutSummary: Exercises not clickable - no navigation to detail")
                    print("  ⚠️ Exercises don't navigate to detail page")
        
        AUDIT_RESULTS["pages_tested"].append("WorkoutSummaryPage")
        return True
    else:
        AUDIT_RESULTS["functional_issues"].append("Could not navigate to WorkoutSummary - no GET STARTED button")
        return False

def test_active_workout(page):
    """Navigate to and test ActiveWorkoutPage"""
    print("\n=== Testing ActiveWorkoutPage ===")
    
    # First go back to summary if needed, then click START WORKOUT
    start_workout = page.locator("text=START WORKOUT")
    if start_workout.count() == 0:
        # Navigate back to homepage and through
        page.goto("https://fitness-tracker-xi-five.vercel.app/")
        page.wait_for_load_state("networkidle")
        page.locator("text=GET STARTED").first.click()
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
    
    start_workout = page.locator("text=START WORKOUT")
    if start_workout.count() > 0:
        start_workout.first.click()
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        
        capture_screenshot(page, "active_workout", "Active workout with set tracking")
        
        # Check for elements
        elements = {
            "progress_bar": page.locator("[class*='progress']").count() > 0,
            "exercise_name": page.locator("text=Dumbbell").count() > 0 or page.locator("text=Press").count() > 0,
            "set_inputs": page.locator("input").count() > 0,
            "finish_button": page.locator("text=FINISH").count() > 0,
            "rest_timer_btn": page.locator("text=REST").count() > 0,
        }
        
        for elem, found in elements.items():
            if not found:
                AUDIT_RESULTS["ui_issues"].append(f"ActiveWorkout: Missing element '{elem}'")
            print(f"  {'✅' if found else '❌'} {elem}")
        
        # Test set input functionality
        inputs = page.locator("input[type='number']").all()
        if len(inputs) > 0:
            # Try typing in an input
            inputs[0].fill("20")
            filled_value = inputs[0].input_value()
            if filled_value == "20":
                print("  ✅ Input fields accept values")
            else:
                AUDIT_RESULTS["functional_issues"].append("ActiveWorkout: Input fields don't accept values properly")
                print("  ❌ Input fields broken")
        
        # Test checkbox/completion
        checkboxes = page.locator("button[class*='rounded-full']").all()
        if len(checkboxes) > 0:
            initial_classes = checkboxes[0].get_attribute("class")
            checkboxes[0].click()
            time.sleep(0.2)
            new_classes = checkboxes[0].get_attribute("class")
            if initial_classes == new_classes:
                AUDIT_RESULTS["functional_issues"].append("ActiveWorkout: Set completion checkboxes don't toggle")
                print("  ⚠️ Checkboxes don't appear to toggle")
            else:
                print("  ✅ Checkboxes toggle state")
        
        # Test rest timer button
        rest_btn = page.locator("text=REST")
        if rest_btn.count() > 0:
            rest_btn.first.click()
            time.sleep(0.3)
            # Check if timer started or modal opened
            timer_visible = page.locator("text=1:").count() > 0 or page.locator("text=2:00").count() > 0
            if not timer_visible:
                AUDIT_RESULTS["functional_issues"].append("ActiveWorkout: Rest timer button doesn't start timer")
                print("  ⚠️ Rest timer doesn't work")
        
        AUDIT_RESULTS["pages_tested"].append("ActiveWorkoutPage")
        return True
    else:
        AUDIT_RESULTS["functional_issues"].append("Could not navigate to ActiveWorkout - no START WORKOUT button")
        return False

def test_progress_page(page):
    """Navigate to and test ProgressPage via bottom nav"""
    print("\n=== Testing ProgressPage ===")
    
    # Find and click Progress tab in bottom nav
    progress_tab = page.locator("text=Progress")
    if progress_tab.count() == 0:
        # Try looking for the icon
        nav_items = page.locator("nav button, nav a, [class*='nav'] button").all()
        print(f"  Found {len(nav_items)} nav items")
        if len(nav_items) >= 2:
            nav_items[1].click()  # Assume Progress is second tab
            page.wait_for_load_state("networkidle")
            time.sleep(0.5)
    else:
        progress_tab.first.click()
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
    
    capture_screenshot(page, "progress_page", "Progress/Analytics page")
    
    # Check for analytics elements
    elements = {
        "analytics_title": page.locator("text=Analytics").count() > 0,
        "streak_display": page.locator("text=Streak").count() > 0,
        "pr_display": page.locator("text=PR").count() > 0,
        "chart": page.locator("svg").count() > 1,  # Charts use SVG
        "weekly_activity": page.locator("text=Weekly").count() > 0,
    }
    
    for elem, found in elements.items():
        if not found:
            AUDIT_RESULTS["ui_issues"].append(f"ProgressPage: Missing element '{elem}'")
        print(f"  {'✅' if found else '❌'} {elem}")
    
    AUDIT_RESULTS["pages_tested"].append("ProgressPage")
    return True

def check_fonts_and_styling(page):
    """Check that proper fonts are loaded"""
    print("\n=== Checking Fonts & Styling ===")
    
    # Execute JS to check computed fonts
    font_check = page.evaluate("""
        () => {
            const headline = document.querySelector('h1, h2');
            const body = document.querySelector('p, span');
            return {
                headlineFont: headline ? window.getComputedStyle(headline).fontFamily : 'not found',
                bodyFont: body ? window.getComputedStyle(body).fontFamily : 'not found'
            };
        }
    """)
    
    print(f"  Headline font: {font_check['headlineFont']}")
    print(f"  Body font: {font_check['bodyFont']}")
    
    if "Bebas" not in font_check['headlineFont']:
        AUDIT_RESULTS["ui_issues"].append(f"Font issue: Headlines not using Bebas Neue (found: {font_check['headlineFont'][:50]})")
    if "Outfit" not in font_check['bodyFont']:
        AUDIT_RESULTS["ui_issues"].append(f"Font issue: Body not using Outfit (found: {font_check['bodyFont'][:50]})")

def generate_report():
    """Generate final audit report"""
    print("\n" + "="*50)
    print("AUDIT SUMMARY")
    print("="*50)
    
    print(f"\n📄 Pages Tested: {len(AUDIT_RESULTS['pages_tested'])}")
    for page in AUDIT_RESULTS['pages_tested']:
        print(f"   - {page}")
    
    print(f"\n🔴 Functional Issues: {len(AUDIT_RESULTS['functional_issues'])}")
    for issue in AUDIT_RESULTS['functional_issues']:
        print(f"   - {issue}")
    
    print(f"\n🟡 UI Issues: {len(AUDIT_RESULTS['ui_issues'])}")
    for issue in AUDIT_RESULTS['ui_issues']:
        print(f"   - {issue}")
    
    print(f"\n🟠 UX Issues: {len(AUDIT_RESULTS['ux_issues'])}")
    for issue in AUDIT_RESULTS['ux_issues']:
        print(f"   - {issue}")
    
    print(f"\n📸 Screenshots: {len(AUDIT_RESULTS['screenshots'])}")
    for ss in AUDIT_RESULTS['screenshots']:
        print(f"   - {ss['name']}: {ss['path']}")
    
    # Save results to JSON
    with open("C:/Users/Oshiogwe Ugbodaga/.gemini/antigravity/brain/2dbb45c2-2979-46e9-9aa3-ecb50d4e027f/audit_results.json", "w") as f:
        json.dump(AUDIT_RESULTS, f, indent=2)
    
    print("\n✅ Results saved to audit_results.json")

def main():
    print("🔍 Starting Fitness Tracker App Audit")
    print("="*50)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844})  # iPhone 14 Pro
        page = context.new_page()
        
        try:
            test_homepage(page)
            test_workout_summary(page)
            test_active_workout(page)
            test_progress_page(page)
            check_fonts_and_styling(page)
        except Exception as e:
            AUDIT_RESULTS["functional_issues"].append(f"Test crashed: {str(e)}")
            print(f"❌ Error during testing: {e}")
        finally:
            browser.close()
    
    generate_report()

if __name__ == "__main__":
    main()
