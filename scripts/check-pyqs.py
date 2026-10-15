"""Browser coverage for the additional PYQ flow. Run against npm run dev."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL=os.environ.get('BASE_URL','http://localhost:3000')
root=Path(__file__).resolve().parents[1]
bank=json.loads((root/'content/pyqs/questions.json').read_text())
qs={q['id']:q for q in bank['questions']}
review=root/'.impeccable/review'
review.mkdir(parents=True,exist_ok=True)
errors=[]

def settle(page):
    page.wait_for_load_state('networkidle')
    page.evaluate('() => document.fonts.ready')

def jump(page,id):
    page.get_by_label('Jump to PYQ',exact=True).select_option(id)
    assert page.locator('.question-title').inner_text()==qs[id]['question']

def bounds(page):
    return page.locator('.pyq-visual .diagram-canvas svg:visible').evaluate_all("""figures=>figures.flatMap(svg=>{
      const v=svg.viewBox.baseVal;
      return [...svg.querySelectorAll('text')].flatMap(t=>{const b=t.getBBox();return b.x< -1||b.y< -1||b.x+b.width>v.width+1||b.y+b.height>v.height+1?[t.textContent]:[];});
    })""")

def check_feedback(page,question):
    feedback=page.locator('.answer-feedback')
    assert feedback.locator('.answer-pointers li').all_text_contents()==question['brief']
    full=feedback.locator('.full-explanation')
    assert not full.evaluate('e=>e.open')
    assert not full.locator('p').is_visible()
    full.locator('summary').click()
    assert full.locator('p').inner_text()==question['explanation']
    full.locator('summary').click()
    if question.get('sourceNote'):
        caveat=feedback.locator('.source-caveat')
        assert not caveat.evaluate('e=>e.open')
        caveat.locator('summary').click()
        assert caveat.locator('.source-note').inner_text()==question['sourceNote'].strip()
        caveat.locator('summary').click()

def check_visual(page):
    assert not bounds(page),bounds(page)
    assert page.locator('.pyq-visual svg:visible').evaluate_all(r"""svgs=>svgs.every(svg=>{
      const ids=(svg.getAttribute('aria-labelledby')||'').split(/\s+/).filter(Boolean);
      return svg.getAttribute('role')==='img'&&svg.firstElementChild.tagName==='title'
        &&ids.length>0&&ids.every(id=>document.getElementById(id)?.textContent.trim());
    })""")

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    page.on('pageerror',lambda error:errors.append(f'{page.url}: {error}'))
    page.goto(f'{BASE_URL}/week/12');settle(page)
    page.evaluate("localStorage.setItem('iiot-study-progress-v1',JSON.stringify({answers:{'w12-q1':{selected:2,correct:true}},understood:{'w12-oil':true},flagged:{}}))")
    page.locator('.course-rail .pyq-nav-link').click()
    page.wait_for_url('**/pyqs');settle(page)
    assert page.get_by_label('Jump to PYQ',exact=True).locator('option').count()==len(qs)
    assert page.get_by_role('button',name='Check answer',exact=True).is_disabled()
    page.screenshot(path=str(review/'pyqs-desktop.png'))
    # Every source question is reachable through its related week/year filters.
    union=set()
    for week in range(1,13):
        page.locator('.pyq-week-nav button').nth(week).click()
        for year in [2023,2024]:
            page.get_by_label('Filter PYQs by year').select_option(str(year))
            visible=page.get_by_label('Jump to PYQ',exact=True).locator('option').evaluate_all('opts=>opts.map(o=>o.value)')
            expected={q['id'] for q in qs.values() if q['weekId']==week and any(s['year']==year for s in q['sources'])}
            assert set(visible)==expected,(week,year)
            union.update(visible)
        page.get_by_label('Filter PYQs by year').select_option('0')
    assert union==set(qs)
    page.locator('.pyq-week-nav button').first.click()
    # Wrong answer, review flag, retry, correct result and educational diagram.
    first=bank['questions'][0];jump(page,first['id'])
    wrong=(first['correctIndex']+1)%len(first['options'])
    page.locator('.answer-options input').nth(wrong).check()
    page.get_by_role('button',name='Check answer',exact=True).click()
    assert page.locator('.answer-feedback.needs-review').is_visible()
    check_feedback(page,first)
    page.get_by_role('button',name='Save for review',exact=True).click()
    page.get_by_role('tab',name='Saved & missed').click()
    assert first['question'] in page.locator('.review-questions').inner_text()
    page.get_by_role('button',name='Practise again').click()
    page.locator('.answer-options input').nth(first['correctIndex']).check()
    page.get_by_role('button',name='Check answer',exact=True).click()
    assert page.locator('.answer-feedback.is-correct').is_visible()
    page.locator('.pyq-visual > summary').click();settle(page)
    check_visual(page)
    page.screenshot(path=str(review/'pyqs-explanation.png'),full_page=True)
    page.reload();settle(page)
    assert page.locator('.answer-feedback.is-correct').is_visible()
    assert page.get_by_role('button',name='Saved for review',exact=True).is_visible()
    assert page.evaluate("JSON.parse(localStorage.getItem('iiot-study-progress-v1')).answers['w12-q1'].correct")
    # A two-choice prompt remains a two-choice exercise.
    tf=next(q for q in qs.values() if len(q['options'])==2)
    jump(page,tf['id']);assert page.locator('.answer-options input').count()==2
    # Conflicting source key stays explicit and is scored to its own paper.
    conflict=qs['pyq-2023-5-15'];jump(page,conflict['id'])
    page.locator('.answer-options input').nth(conflict['correctIndex']).check()
    page.get_by_role('button',name='Check answer',exact=True).click()
    check_feedback(page,conflict)
    page.locator('.source-caveat > summary').click()
    assert '2023 PDF = 6' in page.locator('.source-note').inner_text()
    # Duplicate printed (b) labels must never yield a manufactured correctness result.
    ambiguous=next(q for q in qs.values() if q['correctIndex'] is None)
    jump(page,ambiguous['id'])
    assert page.locator('.answer-options input').first.is_disabled()
    page.get_by_role('button',name='Read explanation & mark reviewed').click()
    assert page.locator('.source-ambiguous').is_visible()
    check_feedback(page,ambiguous)
    saved=page.evaluate("JSON.parse(localStorage.getItem('iiot-pyq-progress-v1'))")
    assert saved['answers'][ambiguous['id']]['correct'] is None
    # PDF provenance and audit download actually exist.
    page.locator('.pyq-sources summary').click()
    source_link=page.locator('.pyq-sources a').first.get_attribute('href')
    response=page.request.get(BASE_URL+source_link)
    assert response.status==200 and 'application/pdf' in response.headers.get('content-type','')
    response=page.request.get(f'{BASE_URL}/pyqs/coverage.json')
    assert len(response.json())==360
    # Paging is bounded, including the last question.
    page.get_by_role('button',name='Next 20 questions',exact=True).click()
    jump(page,bank['questions'][-1]['id'])
    assert page.get_by_role('button',name='Next question',exact=True).is_disabled()
    assert page.get_by_role('button',name='Next 20 questions',exact=True).is_disabled()
    page.get_by_role('link',name='Read the related note',exact=True).click()
    page.wait_for_url('**/week/*#*');settle(page)
    page.locator('#'+bank['questions'][-1]['sectionId']).wait_for()
    assert page.locator('#'+bank['questions'][-1]['sectionId']).count()==1
    # Mobile filters/navigation, and every new conceptual diagram at narrow widths.
    page.goto(f'{BASE_URL}/pyqs');settle(page)
    for width in [390,320]:
        page.set_viewport_size({'width':width,'height':844})
        for id in ['pyq-2024-1-2','pyq-2023-3-14','pyq-2023-6-4','pyq-2023-8-5','pyq-2023-8-10','pyq-2023-9-8','pyq-2024-5-13','pyq-2023-11-9']:
            jump(page,id);q=qs[id]
            if not page.locator('.answer-feedback').count():
                page.locator('.answer-options input').nth(q['correctIndex']).check()
                page.get_by_role('button',name='Check answer',exact=True).click()
            check_feedback(page,q)
            if page.locator('.pyq-visual').count():
                page.locator('.pyq-visual').evaluate("e=>e.open=true");settle(page)
                check_visual(page)
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),(width,id)
        if width==390:
            page.evaluate('() => document.activeElement?.blur()')
            page.screenshot(path=str(review/'pyqs-mobile.png'),full_page=True)
    # Normal-motion branch uses a real, locally authored Lottie and finishes its trace.
    page.emulate_media(reduced_motion='no-preference')
    jump(page,first['id'])
    page.locator('.answer-lottie svg').wait_for()
    assert page.locator('.answer-lottie svg path').count()>0
    assert not errors,errors
    print(f'PASS: all {len(qs)} extras reachable across both year/week filters; wrong/correct/retry, saved review, persistence without weekly-progress changes, ambiguous/conflicting keys, original PDF, 360-row audit, pagination, lesson links, eight diagrams at 390/320px, Motion/Lottie rendering; no JS errors.')
    browser.close()
