"""Canvas fallback smoke under headless Chromium: python tests/fallback_browser.py"""
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1]
html=(r/'index.html').read_text('utf8')
for part,path in [('assets/kenney/packed.js','assets/kenney/packed.js'),('src/kenney-space.js','src/kenney-space.js')]:
 html=html.replace(f'<script src="{part}"></script>',f'<script>{(r/path).read_text("utf8")}</script>')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 page=b.new_page(viewport={'width':1280,'height':800});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.wait_for_timeout(200)
 x=page.evaluate('''()=>({agents:__mediaTechTest.getState().agents.length,kit:__mediaTechTest.kit(),status:document.querySelector('#kit-status').textContent})''')
 assert x['agents']==25 and x['kit']['mode']=='canvas',x
 page.locator('#kit-toggle').click()
 assert page.evaluate('__mediaTechTest.getState().agents.length')==25
 assert not errors,errors
 print('PASS: Canvas fallback, 25 agents, non-destructive Kenney toggle')
 b.close()
