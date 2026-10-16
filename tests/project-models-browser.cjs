const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.join(__dirname,'..'),errors=[];
const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'image/png');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 browser=await chromium.launch({headless:true,channel:process.env.SE_BROWSER_CHANNEL||'msedge'});const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.accept());const url='http://127.0.0.1:'+server.address().port;
 const ready=()=>page.waitForFunction(()=>window.SEProjects&&window.SEInstallationUI&&globalThis.SEProjectModels);await page.goto(url);await ready();
 assert.equal(await page.evaluate(()=>SEProjects.list().length),6);
 // Simulate an existing user database from before models were installed, without legacy reset marker.
 const prior=await page.evaluate(()=>{SEApp.updateProfile({project:'Projeto do usuário — porte médio'});SEProjects.save();const key='se-digital-projects-v1',db=JSON.parse(localStorage.getItem(key));db.projects=db.projects.filter(p=>p.id===db.activeId);delete db.installedModels;localStorage.setItem(key,JSON.stringify(db));localStorage.removeItem('se-digital-reset-20261015-model-v1');return {id:SEProjects.getActiveId(),snapshot:SEApp.snapshot()};});
 await page.reload();await ready();assert.equal(await page.evaluate(()=>SEProjects.getActiveId()),prior.id);assert.equal(await page.evaluate(()=>SEApp.snapshot()),prior.snapshot);assert.equal(await page.evaluate(()=>SEProjects.list().length),6);
 const models=await page.evaluate(()=>SEProjects.list().filter(p=>p.modelKey).map(p=>({id:p.id,name:p.name})));
 const timings=[];
 for(const model of models){const started=performance.now();await page.click('#projectList');await page.locator('[data-project-open="'+model.id+'"]').click();await page.waitForFunction(id=>SEProjects.getActiveId()===id,model.id);assert.equal(await page.evaluate(()=>SEApp.getState().profiles.Actemium.project),model.name);await page.locator('#stepNav [data-open="plant"]').click();
  for(const view of ['plan','section','iso']){await page.locator('#arrangementView-'+view).click();assert.equal(await page.locator('#plantDrawing > svg:visible').count(),1);}
  await page.selectOption('#arrangement3DView','90');assert.equal(await page.evaluate(()=>SEApp.getState().profiles.Actemium.isoView),90);await page.locator('#saveLocal').click();timings.push({modelo:model.name,abrirETestarMs:Math.round(performance.now()-started)});
 }
 const current=await page.evaluate(()=>({id:SEProjects.getActiveId(),snapshot:SEApp.snapshot()}));await page.reload();await ready();assert.equal(await page.evaluate(()=>SEProjects.getActiveId()),current.id);assert.equal(await page.evaluate(()=>SEApp.snapshot()),current.snapshot);assert.equal(await page.evaluate(()=>SEProjects.list().length),6);
 await page.click('#projectList');await page.locator('[data-project-delete="'+models[0].id+'"]').click();await page.reload();await ready();assert.equal(await page.evaluate(()=>SEProjects.list().length),5);assert.equal(await page.evaluate(id=>SEProjects.list().some(p=>p.id===id),models[0].id),false);
 assert.equal(await page.evaluate(id=>SEProjects.list().find(p=>p.id===id).snapshot,prior.id),prior.snapshot);assert.deepEqual(errors,[]);console.log(JSON.stringify(timings,null,2));console.log('PASS browser: five models open; views and 3D edits; save/reload; existing active project and snapshot retained; no duplication; deletion retained; no script errors.');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
