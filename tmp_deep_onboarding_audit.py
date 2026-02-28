import json
import subprocess
import time
from datetime import datetime
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import sync_playwright


PROJECT = r"C:\Users\Oshiogwe Ugbodaga\OneDrive\Documents\Coding stuff\Fitness Tracker V1"
URL = "http://127.0.0.1:4173"
OUT_DIR = Path(PROJECT) / "audit_artifacts" / "onboarding_deep_reaudit_20260227"


def wait_for_server(timeout=70):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urlopen(URL, timeout=2) as r:
                if r.status == 200:
                    return
        except Exception:
            time.sleep(1)
    raise RuntimeError("Server did not start")


def shot(page, name):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUT_DIR / f"{name}.png"), full_page=True)


def new_user(page, suffix):
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Sign Up", exact=True).click()
    page.get_by_placeholder("First name").fill("Audit")
    page.get_by_placeholder("Username").fill(f"deepaudit_{suffix}")
    page.get_by_placeholder("Create 4-digit PIN").fill("1234")
    page.get_by_placeholder("Confirm 4-digit PIN").fill("1234")
    page.get_by_role("button", name="Create Account").click()
    page.wait_for_selector("text=Onboarding")


def reach_guided(page):
    page.get_by_role("button", name="Continue").click()
    page.wait_for_timeout(200)
    page.get_by_role("button", name="Continue").click()
    page.wait_for_timeout(200)
    page.get_by_role("button", name="Start First Workout").click()
    page.wait_for_selector("text=First Workout Guide")


def main():
    server = subprocess.Popen(
        ["cmd", "/c", "npm run dev -- --host 127.0.0.1 --port 4173"],
        cwd=PROJECT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )

    report = {
        "core_flow": {
            "account_created": False,
            "step3_start_disabled_when_no_days": False,
            "guided_reached": False,
            "separate_hidden_before_superset": False,
            "modal_open_close_stable": False,
            "guide_step1_add_exercise": False,
            "guide_step2_create_superset": False,
            "guide_step3_separate_superset": False,
            "add_set_rapid_tap_delta": 0,
            "finish_enabled_after_3_steps": False,
            "completed_to_dashboard": False,
        },
        "edge_flow": {
            "reload_midflow_returns_to_guided": False,
            "reload_midflow_preserves_guide_progress": False,
        },
        "console_errors": [],
    }

    try:
        wait_for_server()
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)

            page = browser.new_page(viewport={"width": 430, "height": 932})
            page.on("console", lambda m: report["console_errors"].append(m.text) if m.type == "error" else None)

            suffix = datetime.now().strftime("%H%M%S")
            new_user(page, suffix)
            report["core_flow"]["account_created"] = True
            shot(page, "01_onboarding_step1")

            page.get_by_role("button", name="Continue").click()
            page.wait_for_timeout(200)
            page.get_by_role("button", name="Continue").click()
            page.wait_for_timeout(200)
            shot(page, "02_step3_initial")

            for d in ["Monday", "Wednesday", "Friday"]:
                page.get_by_role("button", name=d).click()
                page.wait_for_timeout(100)
            start_btn = page.get_by_role("button", name="Start First Workout")
            report["core_flow"]["step3_start_disabled_when_no_days"] = start_btn.is_disabled()
            shot(page, "03_step3_no_days")

            for d in ["Monday", "Wednesday", "Friday"]:
                page.get_by_role("button", name=d).click()
            start_btn.click()
            page.wait_for_selector("text=First Workout Guide")
            report["core_flow"]["guided_reached"] = True
            shot(page, "04_guided_initial")

            report["core_flow"]["separate_hidden_before_superset"] = page.get_by_text("Separate Superset", exact=True).count() == 0

            page.get_by_label("Add exercise").click()
            page.wait_for_selector("text=Add Exercise")
            page.get_by_label("Close add exercise").click()
            page.wait_for_timeout(180)
            page.get_by_label("Add exercise").click()
            page.wait_for_selector("text=Add Exercise")
            report["core_flow"]["modal_open_close_stable"] = True
            choices = page.locator("div.fixed button.w-full.text-left")
            if choices.count() > 0:
                choices.first.click()
                page.wait_for_timeout(600)
            shot(page, "05_after_add_exercise")
            report["core_flow"]["guide_step1_add_exercise"] = page.get_by_text("1/3 steps", exact=False).count() > 0 or page.get_by_text("2/3 steps", exact=False).count() > 0 or page.get_by_text("3/3 steps", exact=False).count() > 0

            page.locator("button[aria-label^='Open actions for']").first.click()
            page.get_by_text("Create Superset", exact=True).click()
            page.wait_for_selector("text=Create Superset")
            superset_choices = page.locator("div.fixed button.w-full.text-left")
            if superset_choices.count() > 0:
                superset_choices.first.click()
                page.get_by_role("button", name="Confirm Superset").click()
                page.wait_for_timeout(700)
            shot(page, "06_after_create_superset")
            report["core_flow"]["guide_step2_create_superset"] = page.get_by_text("2/3 steps", exact=False).count() > 0 or page.get_by_text("3/3 steps", exact=False).count() > 0

            page.locator("button[aria-label^='Open actions for']").first.click()
            page.get_by_text("Separate Superset", exact=True).click()
            page.wait_for_timeout(700)
            shot(page, "07_after_separate_superset")
            report["core_flow"]["guide_step3_separate_superset"] = page.get_by_text("3/3 steps", exact=False).count() > 0

            inputs_before = page.locator("input[placeholder='0']").count()
            add_set_btn = page.get_by_role("button", name="ADD SET").first
            for _ in range(4):
                add_set_btn.click()
            page.wait_for_timeout(900)
            inputs_after = page.locator("input[placeholder='0']").count()
            report["core_flow"]["add_set_rapid_tap_delta"] = inputs_after - inputs_before
            shot(page, "08_after_rapid_add_set")

            finish_btn = page.get_by_role("button", name="Finish Onboarding")
            report["core_flow"]["finish_enabled_after_3_steps"] = finish_btn.is_enabled()
            finish_btn.click()
            page.wait_for_timeout(1200)
            shot(page, "09_after_finish_onboarding")
            report["core_flow"]["completed_to_dashboard"] = page.get_by_text("DASHBOARD", exact=False).count() > 0

            edge_page = browser.new_page(viewport={"width": 430, "height": 932})
            edge_page.on("console", lambda m: report["console_errors"].append(m.text) if m.type == "error" else None)
            edge_suffix = f"{suffix}e"
            new_user(edge_page, edge_suffix)
            reach_guided(edge_page)
            edge_page.get_by_label("Add exercise").click()
            edge_page.wait_for_selector("text=Add Exercise")
            edge_choices = edge_page.locator("div.fixed button.w-full.text-left")
            if edge_choices.count() > 0:
                edge_choices.first.click()
                edge_page.wait_for_timeout(500)
            shot(edge_page, "10_edge_before_reload")
            edge_page.reload()
            edge_page.wait_for_load_state("networkidle")
            edge_page.wait_for_timeout(1500)
            shot(edge_page, "11_edge_after_reload")
            if edge_page.get_by_text("First Workout Guide", exact=False).count() > 0:
                report["edge_flow"]["reload_midflow_returns_to_guided"] = True
                report["edge_flow"]["reload_midflow_preserves_guide_progress"] = edge_page.get_by_text("1/3 steps", exact=False).count() > 0 or edge_page.get_by_text("2/3 steps", exact=False).count() > 0 or edge_page.get_by_text("3/3 steps", exact=False).count() > 0

            browser.close()

    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except Exception:
            server.kill()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
