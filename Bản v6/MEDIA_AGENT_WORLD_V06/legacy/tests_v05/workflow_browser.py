from playwright.sync_api import sync_playwright
from pathlib import Path
html=Path(__file__).resolve().parents[1].joinpath('index.html').read_text(encoding='utf-8')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(300)
 original=page.evaluate('__mediaTechTest.getState().cash')
 page.evaluate('__mediaTechTest.step(14)')
 early=page.evaluate('''()=>{let s=__mediaTechTest.getState();return {earned:s.earned,cash:s.cash,done:s.finishedTasks}}''')
 assert early['earned']==0 and early['cash']==original and early['done']>=0, early
 print('NO TASK MONEY MINTING:',early)
 page.evaluate('__mediaTechTest.step(130)')
 pre=page.evaluate('''()=>{let s=__mediaTechTest.getState();return {pending:s.posts.filter(p=>p.status==='pending').length,projects:s.projects.filter(p=>p.completed).length,cash:s.cash,earned:s.earned,agents:s.agents.map(a=>a.ai.mode)}}''')
 assert pre['pending']>0 and pre['projects']>0, pre
 print('PROJECTS & PENDING:',{k:pre[k] for k in ('pending','projects','earned')})
 page.locator('#channel-btn').click();page.locator('[data-publish]').first.click()
 approved=page.evaluate('''()=>{let s=__mediaTechTest.getState();return s.posts.find(p=>p.status==='published')}''')
 assert approved and approved['reach']>=0
 page.evaluate('__mediaTechTest.step(15)')
 posted=page.evaluate(f'''()=>__mediaTechTest.getState().posts.find(p=>p.id=={approved['id']})''')
 assert posted['reach']>0 and posted['likes']>=0
 print('VIRTUAL PUBLISH:',{k:posted[k] for k in ('platform','status','reach','likes','comments')})
 page.locator('#close-modal').click()
 if not page.evaluate('''()=>__mediaTechTest.getState().projects.every(p=>p.completed)'''):
  page.evaluate('__mediaTechTest.step(200)')
 page.locator('#new-project').click();page.locator('#confirm-project').click()
 contract=page.evaluate('''()=>{let s=__mediaTechTest.getState();return {active:s.projects.filter(p=>!p.completed).length,newTasks:s.agents.filter(a=>a.task).length}}''')
 assert contract['active']>=1 and contract['newTasks']>=10,contract
 print('NEW CONTRACT:',contract)
 page.locator('.speed-controls [data-speed="0"]').first.click()
 coords=page.evaluate('''()=>__mediaTechTest.getState().agents.map(a=>[a.x,a.z])''')
 page.wait_for_timeout(400)
 coords2=page.evaluate('''()=>__mediaTechTest.getState().agents.map(a=>[a.x,a.z])''')
 assert coords==coords2,'Agent positions changed while paused'
 print('PAUSE: positions unchanged')
 assert not errors,errors
 print('PASS: contract economy, CEO approval, virtual engagement, contract renewal, pause')
 b.close()
