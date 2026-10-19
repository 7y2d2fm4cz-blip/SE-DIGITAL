(function(root){'use strict';
const data=root.SE_BUDGET_HISTORY;
function estimate(r,m,c,p,installation){
 if(!p.useMarket)return null;
 const ref=(id,price,basis)=>{const q=data.rows.find(q=>q.id===id);return {price,priceKind:'Histórico',source:q.source+' · '+q.supplier+' · '+q.date,pricingBasis:basis+' Referência: '+q.description+'. Base tributária: '+q.tax+'. '+(q.ipi?'IPI: '+q.ipi+'. ':'')+'Confirmar equivalência e validade; sem equalização tributária automática.'};};
 const id=r.id,area=m.length*m.width;
 if(id.startsWith('equipment:RECT')){const amp=Number(r.description.match(/[\d.]+/)?.[0])||25;return ref(51,88000*Math.pow(amp/75,.6),'Analogia ADELCO 125 Vcc / 75 A: R$ 88.000 × ('+amp+'/75)^0,6; expoente orçamentário, confirmar pulsos, ripple, IP e redundância');}
 if(id.startsWith('transformer:')){const b=m.branches.find(b=>'transformer:'+b.key===id);if(b?.inputV<1000&&b.v<1000&&b.tr>0)return ref(29,17550*Math.pow(b.tr/15,.75),'Analogia BT/BT 15 kVA: R$ 17.550 × ('+b.tr+'/15)^0,75. Referência é PREÇO DE VENDA; não representa custo líquido, contém margem não separada. Rever BDI e tensão '+b.inputV+'/'+b.v+' V');}
 if(id.startsWith('battery:')){const b=id==='battery:DC'?m.dcBank:m.upsBank;if(b?.block?.v===2)return ref(48,48736.94*.85/60*Math.pow(b.block.ah/150,.85),'Banco VRLA OPzV 60 elementos de 2 V / 150 Ah: 85% de R$ 48.736,94 / 60 × (Ah/150)^0,85. Rateio provisório de 15% para estante excluída; estante já em linha separada. Confirmar OPzV/AGM e regime de descarga');}
 if(id==='aux:earthing'){const meters=4*(m.length+m.width);return ref(54,meters*86+6000+area*50,'Premissa: duas voltas no perímetro = '+meters.toFixed(2)+' m de cobre nu 50 mm² × R$ 86/m + R$ 6.000 de conexões + R$ 50/m² para materiais de SPDA. Somente cobre tem preço documentado; demais parcelas são provisões. Sem montagem e sem malha externa; não dimensiona aterramento');}
 if(id.startsWith('cable:')){const cable=installation?.active.find(q=>'cable:'+q.id===id);if(cable&&/cobre\s+nu/i.test(cable.spec)){if(/\b50\s*mm/i.test(cable.spec))return ref(54,86,'Preço por metro de cobre nu 50 mm², sem instalação');if(/\b95\s*mm/i.test(cable.spec))return ref(56,97.75,'Custo por metro de cobre nu 95 mm², sem aplicar preço de venda com BDI');}}
 if(['service:engineering','service:fat','service:commissioning','service:installation','automation:engineering'].includes(id)){
  const rate=id==='service:installation'?p.installationRate:id==='service:commissioning'?p.fieldRate:p.hourRate;
  const hours=id==='service:installation'?Math.max(240,area*4+m.eq.length*2):id==='service:commissioning'?Math.max(160,m.eq.length*3):id==='service:fat'?Math.max(80,m.eq.length*1.5):id==='automation:engineering'?Math.max(80,(m.automation?.ieds.length||0)*2):Math.max(160,area*2);
  const team=id==='service:installation'?'Equipe-base: 1 encarregado a R$ 93/h + 4 eletricistas a R$ 71/h + 2 auxiliares a R$ 44/h; média R$ 66,43 por HH':id==='service:commissioning'?'Equipe-base: 1 engenheiro a R$ 231/h + 2 técnicos a R$ 155/h; média R$ 180,33 por HH':'Engenharia: R$ 231/h, full cost 2026';
  return {price:hours*rate,priceKind:'Histórico',source:'Coletânea fornecida · Taxas_HH_Actemium · 2026',pricingBasis:team+'. Aplicado: '+hours.toFixed(2)+' HH × R$ '+rate+'/HH (taxa editável). HH são provisórios, não validados por produtividade. Sem mobilização/diárias e equipamentos especiais; confirmar composição. Taxas de 2027 são premissa majorada em 5%, não usadas automaticamente.'};
 }
 return null;
}

const shellIds=['shell:frame','shell:floor','shell:roof','shell:walls','shell:partitions','scope:personnel','scope:equipment','aux:lighting','aux:earthing','aux:fire'];
function shellAllocation(lines,m,c,p,installation){
 const prices=new Map();if(!p.useMarket||p.shellMethod==='detailed')return {prices,enabled:false};
 const reference=data.curves.find(q=>q.id===2),rate=p.shellRate,area=m.length*m.width,target=area*rate;
 const entries=lines.filter(r=>shellIds.includes(r.id)&&r.qty>0).map(r=>({r,estimate:r.price!==null?{price:r.price}:estimate(r,m,c,p,installation)||root.SEBudgetMarket?.estimate(r,m,c,p)||root.SEBudgetProvisions?.estimate(r,m,c,p,installation)}));
 const weight=entries.reduce((sum,q)=>sum+q.r.qty*(q.estimate?.price||0),0);
 if(!(weight>0))return {prices,enabled:false};
 const factor=target/weight;
 for(const {r,estimate:e} of entries){if(r.price!==null||!e)continue;prices.set(r.id,{price:e.price*factor,priceKind:'Histórico',source:'Curva histórica de eletrocentros · nível 2 · set/2025 → set/2026',shellAllocated:true,pricingBasis:'Pacote casco + iluminação + aterramento + SDAI: '+area.toFixed(2)+' m² × R$ '+rate.toFixed(2)+'/m². Referência da planilha: R$ 35.000/m² × '+reference.factor.toFixed(9)+' = R$ '+reference.updated.toFixed(2)+'/m². Rateio conceitual proporcional à composição detalhada: participação '+(r.qty*e.price/weight*100).toFixed(3)+'%; fator '+factor.toFixed(6)+'. A planilha não discrimina estes preços unitários. Confirmar escopo, impostos e fornecedor. Sem pilotis, acessos, HVAC, equipamentos, combate ou montagem de campo.'});}
 return {prices,enabled:true,rate,area,target,weight,factor};
}
function comparisons(r){return data.curves.map(q=>{const scope=q.id===1?r.lines.filter(l=>l.id.startsWith('shell:')||['scope:personnel','scope:equipment'].includes(l.id)):q.id===2?r.lines.filter(l=>l.id.startsWith('shell:')||['scope:personnel','scope:equipment','aux:lighting','aux:earthing','aux:fire'].includes(l.id)):q.id===3?r.lines.filter(l=>!l.id.startsWith('civil:')&&!l.id.startsWith('service:')||l.id==='service:fat'):r.lines;const subtotal=scope.filter(l=>l.status==='active').reduce((sum,l)=>sum+(l.total||0),0);return {...q,projectPerM2:r.area?subtotal/r.area:null,note:'Comparação indicativa de escopo, sem impostos/BDI/contingência adicionais; verificar inclusões e equalização. Não altera o total.'};});}
root.SEBudgetHistory={data,estimate,comparisons,shellAllocation,shellIds};
})(globalThis);
