"""GPU/WebGL browser smoke using virtual display: xvfb-run -a python tests/visual_browser.py"""
import json,threading,http.server,os
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
os.chdir(root)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Quiet)
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/index.html'
flags=['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']
with sync_playwright() as p:
 b=p.chromium.launch(headless=False,executable_path='/usr/bin/chromium',args=flags)
 page=b.new_page(viewport={'width':1600,'height':920},device_scale_factor=1)
 errors=[];log=[]
 page.on('pageerror',lambda x:errors.append(str(x)))
 page.on('console',lambda x:log.append(f'{x.type}: {x.text}') if x.type=='error' else None)
 page.on('response',lambda x:log.append(f'HTTP {x.status}: {x.url}') if x.status>=400 else None)
 html=(root/'index.html').read_text(encoding='utf-8')
 html=html.replace('<script src="assets/kenney/packed.js"></script>', '<script>'+ (root/'assets/kenney/packed.js').read_text(encoding='utf-8') +'</script>')
 html=html.replace('<script src="src/kenney-space.js"></script>', '<script>'+ (root/'src/kenney-space.js').read_text(encoding='utf-8') +'</script>')
 page.set_content(html,wait_until='domcontentloaded',timeout=30000)
 page.wait_for_function('window.__mediaTechTest && window.__mediaTechTest.kit().ready',timeout=30000)
 page.wait_for_timeout(700)
 st=page.evaluate('''()=>({kit:__mediaTechTest.kit(),agents:__mediaTechTest.getState().agents.length,webgl:!!document.querySelector('canvas').getContext('webgl'),glerror:document.querySelector('canvas').getContext('webgl').getError(),meshes:document.querySelector('canvas').getContext('webgl').getParameter(0x0D33)})''')
 print('GPU INITIAL:',json.dumps(st,ensure_ascii=False));assert st['kit']['ready'] and st['agents']==25 and st['webgl'];assert not st['glerror'],st
 page.screenshot(path=str(root/'preview_v06_kenney.png'),full_page=True)
 page.locator('#kit-palette').select_option('teal');page.wait_for_timeout(400)
 print('TEAL:',page.evaluate('__mediaTechTest.kit()'))
 assert page.evaluate('__mediaTechTest.kit().palette')=='teal'
 page.screenshot(path=str(root/'preview_v06_teal.png'),full_page=True)
 page.locator('#kit-palette').select_option('amber');page.wait_for_timeout(300)
 assert page.evaluate('__mediaTechTest.kit().palette')=='amber'
 page.screenshot(path=str(root/'preview_v06_amber.png'),full_page=True)
 page.locator('#kit-toggle').click();assert page.evaluate('__mediaTechTest.kit().mode')=='original'
 page.wait_for_timeout(250);page.locator('#kit-toggle').click();assert page.evaluate('__mediaTechTest.kit().mode')=='kenney'
 page.locator('#meeting-btn').click()
 meet=page.evaluate('''()=>({meeting:__mediaTechTest.getState().meeting,travel:__mediaTechTest.getState().agents.filter(a=>a.ai.phase==='travel').length})''')
 assert meet['meeting'] and meet['travel']>0,meet
 print('MEETING:',json.dumps(meet,ensure_ascii=False)[:300]);page.evaluate('__mediaTechTest.step(30)')
 assert page.evaluate('__mediaTechTest.getState().agents.length')==25
 page.set_content(html,wait_until='domcontentloaded',timeout=30000)
 page.wait_for_function('window.__mediaTechTest && window.__mediaTechTest.kit().ready',timeout=30000)
 print('RELOAD:',page.evaluate('''()=>({version:__mediaTechTest.getState().version,kit:__mediaTechTest.kit(),agents:__mediaTechTest.getState().agents.length})'''))
 print('BROWSER ERRORS:',errors)
 print('CONSOLE ERRORS:',log[:10])
 assert not errors, errors
 assert not log, log
 b.close()
server.shutdown()
print('PASS: real WebGL Kenney rooms, 3 palettes, scene toggle, agents, meeting and reload')
