const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),ctx={console,structuredClone};vm.createContext(ctx);
for(const f of ['engine.js','wall-qds.js','transport.js','spatial.js','drawings.js','installation.js','project-models.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const {SE,Draw,SEProjectModels:Models,SEInstallation:I}=ctx,models=Models.list(),sizes=[4,12,60,144,320];assert.equal(models.length,5);
let previous=0;const results=[];
for(const [index,model]of models.entries()){
 const snapshot=JSON.parse(model.snapshot),loads=snapshot.loads,c=snapshot.profiles.Actemium,start=performance.now();SE.validate(loads);assert.equal(loads.length,sizes[index]);
 const m=SE.calculate(loads,c),r=I.calculate(m,c);assert(m.normalSum.s>previous);previous=m.normalSum.s;
 assert.equal(loads.length,new Set(loads.map(l=>l.tag)).size);assert(r.active.length>0);assert(r.height<=3.5);assert(m.rooms.every(room=>room.aisle>=room.minAisle-1e-8));
 for(const p of r.spatial.equipment.filter(e=>e.mounting!=='wall'))assert(p.rearClearance>=c.rear-1e-8);
 const svgs=[Draw.plan(m,c),Draw.arrangementSection(m,c,r),...[0,90,180,270].map(isoView=>Draw.arrangement3D(m,{...c,isoView},r)),...Draw.sld(m,c),...Draw.columns(m,c),Draw.basement(m,c,r)];
 for(const svg of svgs){assert(!/NaN|undefined/.test(svg),model.name);assert(svg.endsWith('</svg>'));}
 const grown=SE.calculate(loads.map(l=>({...l,kw:l.kw*1.1})),c);assert(grown.normalSum.s>m.normalSum.s);
 assert.deepEqual(JSON.parse(JSON.stringify(SE.parseCSV(SE.csv(loads)))),loads);
 results.push({modelo:model.name,cargas:loads.length,paineis:m.panelComposition.length,equipamentos:m.eq.length,salas:m.rooms.length,kVA:Math.round(m.normalSum.s),comprimento:+m.length.toFixed(1),largura:+m.width.toFixed(1),svg:svgs.length,alertas:m.warnings.length,poraoCompativel:r.geometryFits,tempoMs:Math.round(performance.now()-start)});
}
const original={version:1,activeId:'existing',projects:[{id:'existing',name:'Projeto original',snapshot:'preservar literalmente'}]},seeded=Models.seed(original,'2026-10-16T17:30:00Z');
assert.equal(original.projects.length,1);assert.equal(seeded.projects.length,6);assert.equal(seeded.activeId,'existing');assert.deepEqual(seeded.projects[0],original.projects[0]);assert.equal(Models.seed(seeded),null);
seeded.projects=seeded.projects.filter(p=>p.modelKey!=='gigante');assert.equal(Models.seed(seeded),null);assert.equal(seeded.projects.length,5);
console.log(JSON.stringify(results,null,2));console.log('PASS: five distinct synthetic projects; all views, four orientations, recalculation, CSV roundtrip, clearances, additive/idempotent seeding and deleted models stay deleted.');
