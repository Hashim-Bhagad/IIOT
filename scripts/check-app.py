"""Local browser verification. Requires Python Playwright; run against npm run dev."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
weeks = sorted([week for file in (root / "content").glob("*.json") for week in json.loads(file.read_text())], key=lambda week: week["id"])
review = root / ".impeccable" / "review"
review.mkdir(parents=True, exist_ok=True)
errors = []

def settle(page):
    page.wait_for_load_state("networkidle")
    page.evaluate("() => document.fonts.ready")
    page.locator(".diagram-canvas svg").first.wait_for()

def diagram_bounds(page):
    return page.locator(".diagram-canvas svg").evaluate_all("""figures => figures.flatMap(svg => {
        const v = svg.viewBox.baseVal;
        return [...svg.querySelectorAll('text')].flatMap(t => {
            const b = t.getBBox();
            return b.x < -1 || b.y < -1 || b.x+b.width > v.width+1 || b.y+b.height > v.height+1 ? [t.textContent] : [];
        });
    })""")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1440,"height":1000}, reduced_motion="reduce")
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://localhost:3000/week/1")
    settle(page)
    page.evaluate("localStorage.clear()")
    page.reload()
    settle(page)
    for week in weeks:
        page.goto(f'http://localhost:3000/week/{week["id"]}')
        settle(page)
        assert page.locator("h1").inner_text() == week["title"]
        assert page.locator(".lesson").count() == len(week["sections"])
        assert page.locator(".diagram-canvas svg").count() == sum(bool(s.get("diagram")) for s in week["sections"])
        assert not diagram_bounds(page), (week["id"], diagram_bounds(page))
        assert page.locator(".diagram-canvas svg").evaluate_all("figs => figs.every(svg => svg.firstElementChild.tagName === 'title' && svg.getAttribute('role') === 'img' && svg.getAttribute('aria-labelledby').split(' ').every(id => document.getElementById(id)))")
        page.get_by_role("tab",name="Practice").click()
        assert page.locator(".question-nav button").count() == 15
        question = week["quiz"][0]
        assert page.locator(".question-title").inner_text() == question["question"]
        assert page.get_by_role("button",name="Check answer").is_disabled()
        wrong = (question["correctIndex"] + 1) % len(question["options"])
        page.locator('.answer-options input').nth(wrong).check()
        page.get_by_role("button",name="Check answer").click()
        assert page.locator(".answer-feedback.needs-review").is_visible()
        assert question["explanation"] in page.locator(".answer-feedback").inner_text()
        page.get_by_role("button",name="Save for review",exact=True).click()
        page.get_by_role("tab",name="Review").click()
        assert question["question"] in page.locator(".review-questions").inner_text()
        page.get_by_role("button",name="Practise again").first.click()
        page.locator('.answer-options input').nth(question["correctIndex"]).check()
        page.get_by_role("button",name="Check answer").click()
        assert page.locator(".answer-feedback.is-correct").is_visible()
        page.get_by_role("button",name="Read the relevant note").click()
        assert page.get_by_role("tab",name="Learn").get_attribute("aria-selected") == "true"
        page.locator(f'#{question["sectionId"]} .understood input').check()
        page.reload()
        settle(page)
        assert page.locator(f'#{question["sectionId"]} .understood input').is_checked()
        page.get_by_role("tab",name="Practice").click()
        assert page.locator(".answer-feedback.is-correct").is_visible()
        page.get_by_role("button",name="Question 15",exact=False).click()
        assert page.locator(".question-title").inner_text() == week["quiz"][14]["question"]
        assert page.get_by_role("button",name="Next question",exact=True).is_disabled()
    page.goto("http://localhost:3000/week/2")
    settle(page)
    page.get_by_role("tab",name="Practice").click()
    page.locator(".question-nav button").nth(6).click()
    assert page.locator('.answer-options input').count() == 2
    page.goto("http://localhost:3000/week/1")
    settle(page)
    page.locator(".understood input").first.uncheck()
    page.screenshot(path=str(review / "desktop.png"), full_page=True)
    page.screenshot(path=str(review / "desktop-viewport.png"))
    page.get_by_role("tab",name="Practice").click()
    page.screenshot(path=str(review / "practice.png"), full_page=True)
    for width in [390,320]:
        page.set_viewport_size({"width":width,"height":844})
        for week in weeks:
            page.goto(f'http://localhost:3000/week/{week["id"]}')
            settle(page)
            assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 1"), (width,week["id"])
            assert not diagram_bounds(page), (width,week["id"],diagram_bounds(page))
        page.goto("http://localhost:3000/week/1")
        settle(page)
        if width==390:
            page.screenshot(path=str(review / "mobile.png"),full_page=True)
            page.screenshot(path=str(review / "mobile-viewport.png"))
            page.get_by_role("tab",name="Practice").click()
            page.screenshot(path=str(review / "mobile-practice.png"),full_page=True)
        else:
            page.screenshot(path=str(review / "compact.png"))
    page.goto("http://localhost:3000/week/99")
    page.wait_for_load_state("networkidle")
    assert "isn’t in your notes" in page.locator("h1").inner_text()
    assert not errors, errors
    print(f"PASS: {len(weeks)} weekly routes, all diagram bounds, representative wrong/correct answers, review, retries, lesson links, persisted progress, true/false, mobile 390/320px, invalid route; no JS errors.")
    browser.close()
