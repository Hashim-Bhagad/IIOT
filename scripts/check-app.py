"""Local browser verification. Requires Python Playwright; run against npm run dev."""
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
root = Path(__file__).resolve().parents[1]
weeks = sorted([week for file in (root / "content").glob("*.json") for week in json.loads(file.read_text())], key=lambda week: week["id"])
review = root / ".impeccable" / "review"
review.mkdir(parents=True, exist_ok=True)
errors = []
reading = {}

def settle(page):
    page.wait_for_load_state("networkidle")
    page.evaluate("() => document.fonts.ready")
    page.locator(".quick-visual figure").first.wait_for()

def diagram_bounds(page):
    return page.locator(".quick-visual svg:visible").evaluate_all("""figures => figures.flatMap(svg => {
        const v = svg.viewBox.baseVal;
        return [...svg.querySelectorAll('text')].flatMap(t => {
            const b = t.getBBox();
            return b.x < -1 || b.y < -1 || b.x+b.width > v.width+1 || b.y+b.height > v.height+1 ? [t.textContent] : [];
        });
    })""")

def check_feedback(page, question):
    feedback = page.locator(".answer-feedback")
    assert feedback.locator(".answer-pointers li").all_text_contents() == question["brief"]
    full = feedback.locator(".full-explanation")
    assert not full.evaluate("e => e.open")
    assert not full.locator("p").is_visible()
    full.locator("summary").click()
    assert full.locator("p").inner_text() == question["explanation"]
    full.locator("summary").click()
    if question.get("sourceNote"):
        caveat = feedback.locator(".source-caveat")
        assert not caveat.evaluate("e => e.open")
        caveat.locator("summary").click()
        assert caveat.locator(".source-note").inner_text() == question["sourceNote"].strip()
        caveat.locator("summary").click()

def check_lessons(page, week):
    assert page.locator(".quick-lesson").count() == len(week["sections"])
    for section in week["sections"]:
        lesson = page.locator(f'#{section["id"]}')
        assert lesson.locator(".lesson-intro").inner_text() == section["quick"]["summary"]
        assert lesson.locator(".quick-points > li").all_text_contents() == section["quick"]["points"]
        assert lesson.locator(".quick-visual > figure").count() == 1
        assert lesson.locator(".quick-visual > figure").is_visible()
        detail = lesson.locator(".lesson-detail")
        assert not detail.evaluate("e => e.open")
        assert not detail.locator(":scope > p").first.is_visible()
        detail.locator(":scope > summary").click()
        assert detail.locator(":scope > p").all_text_contents() == [section["intro"], *section["paragraphs"]]
        assert detail.locator(".key-points li").all_text_contents() == section["keyPoints"]
        detail.locator(":scope > summary").click()
    assert page.locator(".quick-visual svg").evaluate_all(r"""figs => figs.every(svg => {
        const ids = (svg.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean);
        return svg.firstElementChild.tagName === 'title' && svg.getAttribute('role') === 'img'
            && ids.length > 0 && ids.every(id => document.getElementById(id)?.textContent.trim());
    })""")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1440,"height":1000}, reduced_motion="reduce")
    page.on("pageerror", lambda error: errors.append(f"{page.url}: {error}"))
    page.goto(f"{BASE_URL}/week/1")
    settle(page)
    page.evaluate("localStorage.clear()")
    page.reload()
    settle(page)
    for week in weeks:
        page.goto(f'{BASE_URL}/week/{week["id"]}')
        settle(page)
        assert page.locator("h1").inner_text() == week["title"]
        check_lessons(page, week)
        reading[str(week["id"])] = page.locator(".quick-lesson").evaluate_all(
            r"els => els.reduce((n, e) => n + e.innerText.split(/\s+/).filter(Boolean).length, 0)"
        )
        Path("/tmp/iiot-reading-final.json").write_text(json.dumps(reading, indent=2) + "\n")
        assert not diagram_bounds(page), (week["id"], diagram_bounds(page))
        page.get_by_role("tab",name="Practice").click()
        assert page.locator(".question-nav button").count() == 15
        question = week["quiz"][0]
        assert page.locator(".question-title").inner_text() == question["question"]
        assert page.get_by_role("button",name="Check answer").is_disabled()
        wrong = (question["correctIndex"] + 1) % len(question["options"])
        page.locator('.answer-options input').nth(wrong).check()
        page.get_by_role("button",name="Check answer").click()
        assert page.locator(".answer-feedback.needs-review").is_visible()
        check_feedback(page, question)
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
    page.goto(f"{BASE_URL}/week/2")
    settle(page)
    page.get_by_role("tab",name="Practice").click()
    page.locator(".question-nav button").nth(6).click()
    assert page.locator('.answer-options input').count() == 2
    page.goto(f"{BASE_URL}/week/1")
    settle(page)
    page.locator(".understood input").first.uncheck()
    page.screenshot(path=str(review / "desktop.png"), full_page=True)
    page.screenshot(path=str(review / "desktop-viewport.png"))
    page.get_by_role("tab",name="Practice").click()
    page.screenshot(path=str(review / "practice.png"), full_page=True)
    for width in [390,320]:
        page.set_viewport_size({"width":width,"height":844})
        for week in weeks:
            page.goto(f'{BASE_URL}/week/{week["id"]}')
            settle(page)
            assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 1"), (width,week["id"])
            assert not diagram_bounds(page), (width,week["id"],diagram_bounds(page))
        page.goto(f"{BASE_URL}/week/1")
        settle(page)
        if width==390:
            page.screenshot(path=str(review / "mobile.png"),full_page=True)
            page.screenshot(path=str(review / "mobile-viewport.png"))
            page.get_by_role("tab",name="Practice").click()
            page.screenshot(path=str(review / "mobile-practice.png"),full_page=True)
        else:
            page.screenshot(path=str(review / "compact.png"))
    page.goto(f"{BASE_URL}/week/99")
    page.wait_for_load_state("networkidle")
    assert "isn’t in your notes" in page.locator("h1").inner_text()
    assert not errors, errors
    print(f"PASS: {len(weeks)} weekly routes, concise pointers and one quick visual per lesson, preserved teaching details, visible SVG bounds/accessibility, brief feedback and expandable explanations/caveats, representative wrong/correct answers, review, retries, lesson links, persisted progress, true/false, mobile 390/320px, invalid route; no JS errors.")
    print(f"Visible words by week saved to /tmp/iiot-reading-final.json: {json.dumps(reading)}")
    browser.close()
