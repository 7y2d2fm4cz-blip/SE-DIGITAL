const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),ctx={console};vm.createContext(ctx);
for(const f of ['engine.js','wall-qds.js','transport.js','spatial.js','drawings.js','installation.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const {SE,SEGeometry:G,Draw,SEInstallation:I}=ctx,eps=1e-8;
function near(a,b){assert(Math.abs(a-b)<eps,`${a} != ${b}`);}
// Mixed depths in both rows: front stays on corridor datum and backs clear wall.
const cfg=SE.baseProfile('Actemium'),room={x:.1,deep:6,rowDepth:[2.16,2.16],accessEnd:2.1};
for(const row of [0,1])for(const d of [.6,.8,1.04,1.56]){const e={d,w:.8,row,localX:0},p=SE.equipmentPosition(room,e,cfg);near(p.frontY,cfg.wall+(row===0?room.rowDepth[0]:room.deep-room.rowDepth[1]));assert(p.rearClearance>=cfg.rear-eps);assert.equal(p.frontDirection,row===0?1:-1);}
for(const row of [0,1]){const p=SE.equipmentPosition(room,{d:.12,w:.47,row,localX:0,mounting:'wall'},cfg);near(p.rearClearance,.02);}
let panelCount=0;
for(const [loads,c]of [[SE.modelLoads(),SE.modelProfile()],[SE.example(),SE.exampleProfile()],[SE.example(),{...SE.exampleProfile(),aisle:2.2,rear:.9}]]){
 const m=SE.calculate(loads,c),g=G.calculate(m,c),r=I.calculate(m,c);
 for(const room of m.rooms){near(room.deep,m.width-2*c.wall);assert(room.aisle>=room.minAisle-eps);const elems=g.equipment.filter(e=>e.room===room.name);
  for(const row of [0,1]){const floor=elems.filter(e=>e.row===row&&e.mounting!=='wall');for(const e of floor){near(e.frontY,floor[0].frontY);assert(e.rearClearance>=c.rear-eps);assert(e.y>=c.wall-eps&&e.y+e.d<=m.width-c.wall+eps);near(e.frontY,row===0?e.y+e.d:e.y);panelCount++;}}
 }
 for(const svg of [Draw.plan(m,c),Draw.arrangementSection(m,c,r),...[0,90,180,270].map(isoView=>Draw.arrangement3D(m,{...c,isoView},r))]){assert(!/NaN|undefined/.test(svg));assert(svg.includes('data-panel-front='));}
 for(const p of r.spatial.panels){const opening=r.spatial.openings.find(o=>o.tag===p.tag);assert(opening.x>=p.x-eps&&opening.x+opening.length<=p.x+p.w+eps);assert(opening.y>=p.y-eps&&opening.y+opening.width<=p.y+p.d+eps);}
}
console.log(`PASS: ${panelCount} floor equipment positions; mixed depths and both rows front-aligned; fronts face corridor; minimum rear/front clearance; wall boxes retained; plan/cut/4 isometrics and floor openings consistent.`);
