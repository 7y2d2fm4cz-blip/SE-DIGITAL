const assert=require('node:assert/strict');const SE=require('./engine.js');require('./drawings.js');
const p=SE.baseProfile('Petrobras'),loads=SE.example(),m=SE.calculate(loads,p);
assert.deepEqual(SE.parseCSV(SE.csv(loads)),loads);
assert.throws(()=>SE.parseCSV('tag;kw;voltage;class\nX;abc;480;normal'));
assert.throws(()=>SE.validate([...loads,loads[0]]));
const large=SE.calculate(loads.map(l=>({...l,quantity:10})),p);assert(large.area>m.area);assert(large.normalSum.s>m.normalSum.s);assert(large.totalLevels>m.totalLevels);
const red=SE.calculate(loads.map(l=>({...l,redundancy:'2N'})),p);assert(red.eq.length>m.eq.length);assert(red.all[0].installed===2);
const i=SE.calculate(loads,{...p,topology:'I',sourceRed:'N'});assert(i.branches.every(b=>b.bar==='A'));
const cc=SE.calculate(loads,{...p,dcHours:16});assert(cc.ah>m.ah);
const safe=SE.calculate(loads.map(l=>({...l,kw:l.class==='emergencia'?l.kw*10:l.kw})),p);assert(safe.genRequired>m.genRequired);
const direct=SE.calculate(loads,{...p,inputV:480,inputVB:480});assert(direct.branches.filter(b=>b.v===480).every(b=>b.direct&&b.count===0));
const pv=SE.baseProfile('Vale');p.aisle=2;assert.equal(pv.aisle,1.5);
const wide=SE.calculate(loads,{...pv,trayWidth:1200});assert(wide.totalLevels<=m.totalLevels);
for(const svg of [Draw.plan(m,p),Draw.cables(m,p),...Draw.sld(m,p)]){assert(!/NaN|undefined/.test(svg));assert(svg.endsWith('</svg>'));}
console.log('11 cenários verificados: CSV, validação, crescimento, redundância, barras, CC, diesel, tensão, perfis, bandejas e desenhos.');
