(function(root){'use strict';
// Internal conceptual allowances, not supplier quotations or electrical sizing.
function estimate(r,m,c,p,installation){
 const id=r.id,area=m.length*m.width,n=m.automation?.ieds.length||0;
 const provision=(price,basis)=>({price,priceKind:'Provisão',source:'Provisão interna de orçamento · 19/10/2026',pricingBasis:basis+' Valor conceitual, sem cotação; confirmar escopo e preço com fornecedor.'});
 const ppu=(key,factor,basis)=>{const q=p.catalog.rows.find(q=>q.id===key&&q.price>0);return q?{...provision(q.price*factor,basis+' Base '+key+' × '+factor.toFixed(3)+'.'),source:p.catalog.file+' · '+q.sheet+'!'+q.cell+' · analogia, não preço original'}:null;};
 const fixed={
  'aux:fire-suppression':[Math.max(5000,area*80),'Provisão de extintores: max(R$ 5.000, R$ 80/m²); rede de hidrantes/agente fixo não dimensionada, substituir conforme estudo de risco'],
  'aux:lighting':[Math.max(8000,area*160),'Materiais: max(R$ 8.000, R$ 160/m²), luminárias, emergência e tomadas; sem quadros e cabos de alimentação já listados'],
  'aux:earthing':[Math.max(15000,area*180),'Materiais: max(R$ 15.000, R$ 180/m²), malha local/SPDA/equipotencialização; solo e malha externa a validar'],
  'aux:fire':[25000+area*220,'SDAI: R$ 25.000 de central + R$ 220/m² em detecção/alarme; combate separado'],
  'aux:ventilation':[Math.max(12000,m.rooms.filter(q=>/bat/i.test(q.name||q.id||'')).length*12000),'Mínimo R$ 12.000, um conjunto por sala de baterias identificada; vazão, redundância e classificação a conferir'],
  'aux:sealing':[Math.max(6000,m.eq.length*400),'Materiais: max(R$ 6.000, R$ 400/equipamento); número e área das passagens a confirmar'],
  'service:freight':[35000,'R$ 35.000/módulo, provisão rodoviária com AET/escolta/seguro; origem, destino, distância e dimensões a cotar'],
  'service:erection':[20000,'R$ 20.000/módulo, guindaste, rigging, mobilização e acoplamento; raio, peso e plano de içamento a confirmar'],
  'service:installation':[Math.max(240,area*4+m.eq.length*2)*p.hourRate,'max(240 h, 4 h/m² + 2 h/equipamento) × taxa de engenharia como taxa composta provisória; montagem/interligações em campo, sem materiais já listados'],
  'scope:tank':[Math.max(8000,(Number(r.basis.match(/[\d.]+/)?.[0])||500)*18),'max(R$ 8.000, capacidade indicada em L × R$ 18/L); tanque, contenção e acessórios a especificar']
 };
 if(fixed[id])return provision(...fixed[id]);
 if(id.startsWith('panel:')){
  const e=m.eq.find(q=>'panel:'+q.id===id)||{},amp=Math.max(100,e.designCurrent||e.mt?.nominal||1250),v=e.boardVoltage||e.voltage||480;
  if(e.mounting==='wall')return provision(3500+(e.wall?.required||12)*250,'Quadro de parede: R$ 3.500 + R$ 250/polo requerido; disjuntores, DR/DPS, IP e Icc a validar');
  if(e.mt)return ppu('MT-3',Math.pow(amp/1250,.35)*Math.max(1,v/13800)**.4,'Cubículo MT por analogia de corrente/tensão; composição e relé a conciliar')||provision(250000,'Cubículo MT completo como reserva orçamentária');
  const incoming=/entrada/i.test(e.role||''),tie=e.role==='TIE',ledger=m.columnLedger.find(q=>q.id===e.id);
  if(incoming||tie)return ppu('BT-25',Math.pow(amp/3200,.45)*(tie?.9:1),'Entrada/TIE face única escalada da entrada 3.200 A; IED do SAE tratado separadamente, revisar sobreposição')||provision(120000,'Coluna de entrada/TIE BT');
  if(ledger&&['gavetas BT','reserva'].includes(ledger.kind))return ppu('BT-42',Math.max(.8,Math.pow(amp/2000,.25)),'Coluna vazia; gavetas em linhas separadas')||provision(31000,'Coluna BT vazia');
  return provision(45000+Math.max(0,e.kw||0)*250,'Coluna funcional BT: R$ 45.000 + R$ 250/kW; acionamento, disjuntor e compartimentação a cotar; IED separado');
 }
 if(id.startsWith('drawer:')){const kw=Number(r.basis.match(/[\d.]+/)?.[0])||0,motor=/direta|soft|inversor|estrela/i.test(r.basis),factor=/inversor/i.test(r.basis)?2.5:/soft/i.test(r.basis)?1.8:1;return provision((motor?22000+kw*250:15000)*factor,'Gaveta: '+(motor?'R$ 22.000 + R$ 250/kW':'R$ 15.000')+' × fator de partida '+factor+'; geometria, potência, proteção e escopo a verificar');}
 if(id.startsWith('transformer:')){const b=m.branches.find(q=>'transformer:'+q.key===id)||{},kva=b.tr||100;return provision(b.inputV<1000?Math.max(8000,350*kva):88500*Math.pow(kva/1000,.7)*1.8,'Trafo BT/BT: max(R$ 8.000, R$ 350/kVA); MT/MT ou tensão especial: R$ 88.500 × (kVA/1.000)^0,7 × 1,8. Enrolamentos, perdas, acessórios e ensaios a cotar');}
 if(id.startsWith('battery:')){const bank=id==='battery:DC'?m.dcBank:m.upsBank;return provision(Math.max(500,(bank?.block?.v||2)*(bank?.block?.ah||100)*8),'R$ 8/Wh nominal por bloco, mínimo R$ 500; química, vida útil e autonomia a verificar');}
 if(id.startsWith('equipment:RECT')){const amps=Number(r.description.match(/[\d.]+/)?.[0])||25;return provision(35000+amps*700,'Retificador 125 Vcc: R$ 35.000 + R$ 700/A; redundância contabilizada pela quantidade; ripple, supervisão e ensaios a cotar');}
 if(id.startsWith('equipment:Q'))return provision(15000,'Quadro auxiliar completo: R$ 15.000/un; circuitos, corrente, tensão e Icc a detalhar');
 if(id.startsWith('cable:')){
  const cable=installation?.active.find(q=>'cable:'+q.id===id),system=cable?.system||r.description,amp=Math.max(1,cable?.amp||20);
  if(/Fibra/.test(system))return provision(20,'R$ 20/m de cabo óptico industrial; fibras, OM/OS e proteção mecânica a confirmar; terminações separadas');
  if(/Rede/.test(system))return provision(90,'R$ 90/m de cabo de rede industrial; categoria e blindagem a conferir');
  if(/Controle|Instrumentação/.test(system))return provision(/Instrumentação/.test(system)?35:50,'R$ 35/m instrumentação ou R$ 50/m controle; pares/vias e blindagem não definidos');
  const mt=/MT/.test(system),cc=/CC/.test(system),price=mt?Math.max(100,amp*.8):Math.max(cc?12:18,amp*(cc?.65:1.1));
  return provision(price,(mt?'max(R$ 100, 0,80 × A), por metro de cabo unipolar':'max(R$ '+(cc?12:18)+', '+(cc?'0,65':'1,10')+' × A), por metro de envelope do circuito')+'; corrente '+amp.toFixed(1)+' A. Correlação exclusivamente de custo, não dimensiona seção, paralelos, neutro ou PE; cotar composição real');
 }
 if(id.startsWith('automation:')){
  const rules=[[/Antena GNSS/,6000,'Conjunto antena/suporte/DPS, sem coaxial'],[/Coaxial/,45,'Por metro, tipo/atenuação a conferir'],[/RTAC/,80000+Math.max(0,n-60)*200,'R$ 80.000 + R$ 200/IED acima de 60; capacidade e variante a confirmar'],[/Estação/,18000,'Hardware da estação; licenças separadas'],[/Firewall/,35000,'Firewall industrial; licenças e suporte a validar'],[/RedBox/,25000,'RedBox PRP industrial por unidade'],[/Circuitos secundários de TC/,700,'Material complementar por canal, bloco de teste/curto; conciliar com painel, sem TC físico'],[/Circuitos de TP/,550,'Material complementar por canal, proteção/teste; conciliar com painel, sem TP físico'],[/Software/,50000+n*150,'Licenças: R$ 50.000 + R$ 150/IED; engenharia já na linha de configuração SAE, sem duplicá-la'],[/Cabo óptico/,20,'Por metro de cabo, sem multiplicar pelo número de fibras'],[/RJ45/,180,'Por extremidade, conector industrial/cordão'],[/Pigtail/,150,'Por fibra terminada: pigtail, adaptador e fusão'],[/SFP/,2500,'Por transceptor industrial; homologação e óptica a confirmar'],[/Distribuição IRIG/,12000,'Distribuidor isolado de oito saídas'],[/Enlace IRIG/,1800,'Conjunto por enlace, cabo/conversão e distância a conferir']];
  for(const [re,value,basis]of rules)if(re.test(r.description))return provision(value,basis);
 }
 const value=r.unit==='m'?100:r.unit==='m²'?500:r.unit==='canal'?700:id.startsWith('ied:')?50000:15000;
 return provision(value,'Reserva genérica de R$ '+value+'/'+r.unit+' para item sem composição específica. Substituição por cotação obrigatória; não representa preço de mercado verificado');
}
root.SEBudgetProvisions={estimate};
})(globalThis);
