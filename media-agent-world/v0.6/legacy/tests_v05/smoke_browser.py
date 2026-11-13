import json,sys,os,threading,http.server,socketserver
from playwright.sync_api import sync_playwright
path=os.path.abspath(os.path.join(os.path.dirname(__file__),'../index.html'))
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
os.chdir(os.path.abspath(os.path.join(os.path.dirname(__file__),'..')))
server=socketserver.TCPServer(('127.0.0.1',0),Quiet)
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/index.html'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1440,'height':900}, device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(open(path,encoding='utf-8').read(),wait_until='domcontentloaded',timeout=20000)
 page.wait_for_timeout(1500)
 info=page.evaluate('''()=>({title:document.title,ready:!!window.__mediaTechTest,roster:document.querySelectorAll('[data-agent]').length,engine:!!globalThis.MediaAgentEngine,stage:!!document.querySelector('canvas')})''')
 print('INITIAL:',json.dumps(info,ensure_ascii=False))
 if info['ready']:
  d=page.evaluate('''()=>{const s=__mediaTechTest.getState();return {version:s.version,agents:s.agents.length,cash:s.cash,states:s.agents.map(a=>a.ai.mode).slice(0,5),ledger:s.ledger.length}}''')
  print('STATE:',json.dumps(d,ensure_ascii=False))
  page.locator('#meeting-btn').click()
  meeting=page.evaluate('''()=>{const s=__mediaTechTest.getState();return {meeting:s.meeting,first:s.agents[0].ai, cash:s.cash,ledger:s.ledger.length}}''')
  print('MEETING:',json.dumps({'active':meeting['meeting'],'first_mode':meeting['first']['mode'],'first_phase':meeting['first']['phase'],'route_len':len(meeting['first']['route']),'cash':meeting['cash'],'ledger':meeting['ledger']},ensure_ascii=False))
  page.evaluate('__mediaTechTest.step(17)')
  post=page.evaluate('''()=>{const s=__mediaTechTest.getState();return {meeting:s.meeting,modes:[...new Set(s.agents.map(a=>a.ai.mode))],steps:s.finishedTasks,events:s.agentEvents.slice(-3)}}''')
  print('POST_MEETING:',json.dumps(post,ensure_ascii=False))
  page.evaluate('__mediaTechTest.step(150)')
  after=page.evaluate('''()=>{const s=__mediaTechTest.getState();return {cash:s.cash,earned:s.earned,spent:s.spent,steps:s.finishedTasks,posts:s.posts.length,history:s.agents[0].history.length,mode:s.agents[0].ai.mode}}''')
  print('AFTER_STEP:',json.dumps(after,ensure_ascii=False))
  page.locator('#autonomy-btn').click()
  print('AUTONOMY:',page.evaluate('''()=>__mediaTechTest.getState().auto'''))
  page.set_content(open(path,encoding='utf-8').read(),wait_until='domcontentloaded',timeout=20000);page.wait_for_timeout(900)
  print('RELOAD:',page.evaluate('''()=>{const s=__mediaTechTest.getState();return {version:s.version,agents:s.agents.length,meeting:s.meeting,auto:s.auto, cash:s.cash}}'''))
 print('ERRORS:',json.dumps(errors[:12],ensure_ascii=False))
 page.screenshot(path=os.path.abspath(os.path.join(os.path.dirname(__file__),'../preview_v05.png')),full_page=True)
 browser.close()
 if errors or not info['ready']:sys.exit(1)
