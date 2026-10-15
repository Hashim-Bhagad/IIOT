from pathlib import Path
import json
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
review=root/'.impeccable'/'review'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    page.goto('http://localhost:3000/week/1')
    page.wait_for_load_state('networkidle')
    page.evaluate('() => document.fonts.ready')
    page.evaluate('window.scrollTo(0,0)')
    assert page.evaluate('scrollY')==0
    page.screenshot(path=str(review/'desktop.png'),full_page=True)
    page.screenshot(path=str(review/'desktop-viewport.png'))
    svg=page.locator('.diagram-canvas svg').first.evaluate('(el)=>el.outerHTML')
    (review/'diagram-check.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>IIoT diagram check</title><style>:root{--paper:#f5f7f9;--paper-2:#e9eef2;--ink:#12202e;--muted:#526174;--rule-solid:#bec8d1;--accent:#b8430d;--accent-tint:#fff0e7;--link:#244b78}svg{max-width:100%;font-family:Arial,sans-serif}</style></head><body>'+svg+'</body></html>')
    for width in [390,320]:
        page.set_viewport_size({'width':width,'height':844})
        page.evaluate('window.scrollTo(0,0)')
        page.locator('h1').wait_for()
        page.wait_for_timeout(150)
        assert page.evaluate('scrollY')==0
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
        if width==390:
            page.screenshot(path=str(review/'mobile.png'),full_page=True)
            page.screenshot(path=str(review/'mobile-viewport.png'))
        else:page.screenshot(path=str(review/'compact.png'))
    page.set_viewport_size({'width':1440,'height':1000})
    page.get_by_role('tab',name='Practice').click()
    week=json.loads((root/'content'/'weeks-01-04.json').read_text())[0]
    page.locator('.answer-options input').nth(week['quiz'][0]['correctIndex']).check()
    page.get_by_role('button',name='Check answer').click()
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path=str(review/'practice.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path=str(review/'mobile-practice.png'),full_page=True)
    print('Valid captures from document top: desktop 1440px, mobile 390px, compact 320px, practice states; diagram exported for self-check.')
    browser.close()
