from playwright.sync_api import sync_playwright
from pathlib import Path
import json
html=Path(__file__).resolve().parents[1].joinpath('index.html').read_text(encoding='utf-8')
shim="""(()=>{
 const store=window.__testStore||(window.__testStore={});
 Object.defineProperty(window,'localStorage',{configurable:true,value:{
 getItem:k=>Object.hasOwn(store,k)?store[k]:null,
 setItem:(k,v)=>store[k]=String(v),
 removeItem:k=>delete store[k],
 clear:()=>Object.keys(store).forEach(k=>delete store[k])
 }});
})()"""
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page()
 page.evaluate(shim)
 page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(150)
 assert page.evaluate('typeof window.__mediaTechTest')=='object'
 page.evaluate('__mediaTechTest.step(45)')
 data=page.evaluate('''()=>{window.dispatchEvent(new Event('beforeunload'));return JSON.parse(localStorage.getItem('media_agent_world_v05_offline'))}''')
 assert data['version']==3 and len(data['agents'])==25
 print('SAVED:',{k:data[k] for k in ('version','cash','finishedTasks','earned')})
 # Fresh browsing context seeded with current save - full-state reload semantics.
 loaded=browser.new_page();loaded.evaluate(shim)
 loaded.evaluate('''s=>localStorage.setItem('media_agent_world_v05_offline',JSON.stringify(s))''',data)
 loaded.set_content(html,wait_until='domcontentloaded');loaded.wait_for_timeout(150)
 read=loaded.evaluate('__mediaTechTest.getState()')
 assert read['cash']==data['cash']
 assert read['finishedTasks']==data['finishedTasks']
 print('RESTORE V0.5: PASS',read['finishedTasks'],read['cash'])
 # V0.3 legacy SAVE_KEY and version are accepted and old key preserved separately.
 legacy=json.loads(json.dumps(data));legacy['version']=2
 for a in legacy['agents']:
  for k in ['ai','stress','socialNeed','history','relationships']:
   a.pop(k,None)
 legacy.pop('ledger',None);legacy.pop('agentEvents',None)
 older=browser.new_page();older.evaluate(shim)
 older.evaluate('''s=>localStorage.setItem('media_agent_world_v03_offline',JSON.stringify(s))''',legacy)
 older.set_content(html,wait_until='domcontentloaded');older.wait_for_timeout(150)
 upgraded=older.evaluate('__mediaTechTest.getState()')
 assert upgraded['version']==3 and len(upgraded['agents'])==25
 assert upgraded['cash']==legacy['cash']
 assert all('ai' in a for a in upgraded['agents'])
 assert older.evaluate("localStorage.getItem('media_agent_world_v03_offline')") is not None
 print('MIGRATE V0.3 → V0.5: PASS')
 # Imported corrupted zero-length duration is sanitized rather than infinitely completing.
 legacy['agents'][0]['task']={'label':'Corrupt','duration':0,'progress':999999,'projectId':1}
 clean=browser.new_page();clean.evaluate(shim)
 clean.evaluate('''s=>localStorage.setItem('media_agent_world_v03_offline',JSON.stringify(s))''',legacy)
 clean.set_content(html,wait_until='domcontentloaded');clean.wait_for_timeout(150)
 agent=clean.evaluate('__mediaTechTest.getState().agents[0]')
 assert 8<=agent['task']['duration']<=240 and agent['task']['progress']<100
 print('INVALID LEGACY TASK: SANITIZED')
 browser.close()
