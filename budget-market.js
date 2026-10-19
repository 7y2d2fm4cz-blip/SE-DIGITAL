(function(root){'use strict';
const date='2026-10-19';
const sources={
 rack:['Mercato · rack 42U 800 × 1100 mm',8352.13,'BRL','https://loja.mercatoautomacao.com.br/produtos/racks/rack-server/rack-server-de-42u-x-800-x-1100mm-com-portas-perfuradas-e-bipartidas/'],
 mesh:['Telas Imperial · tela galvanizada fio 12 por m²',42.96,'BRL','https://telasimperial.com.br/produto/tela-alambrado-1-1-2-fio-12-galvanizado/'],
 ups:['Magazine Luiza · TS Shara 5 kVA sem baterias internas',8791.90,'BRL','https://www.magazineluiza.com.br/busca/nobreak%2B5000va/'],
 steel:['Mendes e Mendes · perfil W 200 × 19,3, 6 m',1655.16,'BRL','https://loja.mendesemendesferroeaco.com.br/perfil-w-200-x-19-3-6-metros'],
 floor:['Dominik · chapa xadrez 6,35 mm, 1,20 × 3 m',2035,'BRL','https://acos.dominik.com.br/orcamento-rapido/'],
 roof:['Isolamax · PIR 50 mm, preço por m² anunciado',250,'BRL','https://loja.isolamax.com.br/produto/isotelha-trapezoidal-termica-sanduiche-branco-neve-nucleo-em'],
 rail:['CYPE · guarda de aço FDD100, por metro',313.73,'BRL','https://brasil.geradordeprecos.info/reabilitacao/F_Fachadas__paredes__divisorias_e_pro/Protecoes_e_gradeamentos/Guarda-corpos_e_corrimaos/Guarda_de_escada__de_aco.html'],
 concrete:['CYPE · concreto C25 em sapatas, m³ (sem aço)',445.25,'BRL','https://brasil.geradordeprecos.info/obra_nova/Fundacoes/CH_Concretos__acos_e_sistemas_de_/Concretos/Concreto_para_armar_em_sapatas.html'],
 door:['Fadef · kit porta P90 90 × 210 cm',1830,'BRL','https://distribuidorafadef.com.br/produtos/conjunto-porta-corta-fogo-p-90-90x210x5-branca-com-acessorios-chumbar/'],
 tray:['Loja Elétrica · eletrocalha 300 × 100 mm, chapa 18, 3 m',233.28,'BRL','https://www.lojaeletrica.com.br/eletrocalha-perfurada-300x100mm-3m-chapa-18-aco-galvaniz-eletrolitico.html'],
 hvac:['Dufrio · Hisense piso-teto 60.000 BTU/h',10488.60,'BRL','https://www.dufrio.com.br/ar-condicionado-piso-teto-inverter-60000-btus-hisense-wifi-frio-auv-60tr2rf3e-220v.html'],
 transformer:['Siemetrafo · seco 1.000 kVA, 13,8/0,38 kV',88500,'BRL','https://siemetrafo.com.br/produto/transformador-a-seco-1000kva-13-8kv/'],
 generator:['K-Gen · Tecmax carenado 100 kVA',113280.34,'BRL','https://kgencomercial.com.br/produto/tc-8/'],
 battery:['BBL · EnerSys SBS B14F, sem VAT britânico',271.25,'GBP','https://www.bblbatteries.co.uk/product/sbsb14f-enersys-battery-12v-61ah-tppl-agm-ftm6/'],
 cat6:['Loja Elétrica · Cat.6A industrial SFTP, por metro',87.85,'BRL','https://www.lojaeletrica.com.br/cabo-cat6a-sftp-4-pares-23awg-cinza-lszh-industrial-23370102-furukawa.html'],
 dio:['Policabos · DIO 24 fibras (estrutura)',472,'BRL','https://www.policabos.com.br/fibra-otica'],
 patch:['Policabos · cordão OM3/OM4',275,'BRL','https://www.policabos.com.br/fibra-otica'],
 'SEL-751':['SEL · 751, preço inicial',1380,'USD','https://selinc.com/products/751/'],
 'SEL-710':['SEL · 710, preço inicial',3560,'USD','https://selinc.com/products/710/'],
 'SEL-710-5':['SEL · 710-5, preço inicial',4260,'USD','https://selinc.com/products/710-5/'],
 'SEL-787':['SEL · família 787, preço inicial',4200,'USD','https://selinc.com/products/787-3-4/'],
 'SEL-700G':['SEL · 700G, preço inicial',3560,'USD','https://selinc.com/products/700g/'],
 'SEL-487B':['SEL · 487B, preço inicial',9700,'USD','https://selinc.com/products/487B/'],
 'SEL-2440':['SEL · 2440, preço inicial',1390,'USD','https://selinc.com/products/2440/'],
 'SEL-2731':['SEL · 2731, preço inicial',3240,'USD','https://selinc.com/products/2731/'],
 'SEL-2488':['SEL · 2488, preço inicial',3500,'USD','https://selinc.com/products/2488/']
};
function estimate(row,m,c,p){
 if(!p.useMarket||row.status!=='active')return null;
 const id=row.id,area=m.length*m.width,steel=sources.steel[1]/(6*19.3)*2.2,plate=sources.floor[1]/3.6*1.25;
 const ref=(key,price,formula,kind='Estimativa')=>({price,priceKind:kind,source:sources[key][0]+' · consulta '+date,sourceUrl:sources[key][3],pricingBasis:formula});
 const provision=(price,formula)=>({price,priceKind:'Provisão',source:'Premissa de engenharia · '+date,pricingBasis:formula+' Não é cotação de fornecedor.'});
 const map={
 'scope:mesh':()=>ref('mesh',42.96+4*steel,'Tela por m² + 4 kg/m² de estrutura fabricada; ancoragem e acabamento a conferir.'),
 'shell:frame':()=>ref('steel',95*steel,'95 kg/m² × preço do perfil por kg × 2,2 para fabricação/acabamento. Consumo e fator são premissas; sem piso/pilotis.'),
 'shell:floor':()=>ref('floor',plate,'R$ 2.035 / 3,6 m² × 1,25 para perdas/acabamento. Espessura e resistência a confirmar.'),
 'shell:roof':()=>ref('roof',250*1.3,'PIR 50 mm × 1,30 para acessórios e aplicação em fábrica; resistência ao fogo e ambiente a especificar.'),
 'shell:walls':()=>ref('roof',250*1.4,'Analogia com PIR 50 mm × 1,40; painel de parede, vedação, pintura e resistência ao fogo a confirmar.'),
 'shell:partitions':()=>ref('roof',250*1.4,'Analogia com PIR 50 mm × 1,40; divisória industrial a especificar.'),
 'civil:pilots':()=>ref('steel',350*steel,'350 kg por apoio × aço fabricado/acabado. Peso inclui contraventamento por rateio; não é cálculo estrutural.'),
 'civil:foundations':()=>ref('concrete',2.5*445.25*4,'2,5 m³ por base × concreto × 4: provisão de aço, formas, escavação e chumbadores. Sem estacas; sondagem pendente.'),
 'civil:walk':()=>ref('floor',plate+25*steel,'Piso estimado + 25 kg/m² de suporte metálico fabricado. Guarda-corpo separado.'),
 'civil:rail':()=>ref('rail',313.73*1.6,'Referência de guarda comum × 1,60 para adaptação industrial/rodapé. Altura, galvanização e fixações a validar.'),
 'scope:personnel':()=>ref('door',1830*1.8,'Kit P90 × 1,80 para acabamento, ferragens e aplicação industrial. Dimensões finais a confirmar.'),
 'scope:equipment':()=>ref('door',1830*4,'Analogia com quatro kits simples para porta de movimentação; fabricação sob medida a cotar.'),
 'scope:stairs':()=>ref('steel',400*steel+4*plate,'400 kg de aço + 4 m² de piso por escada; altura/largura e proteção a conferir.'),
 'scope:hvac':()=>ref('hvac',10488.6*((c.hvacUnit||20)/17.584)*2,'Unidade equivalente a '+(c.hvacUnit||20)+' kW térmicos / 17,584 kW × preço 60.000 BTU/h × 2; adaptação industrial e controles. Não equivale a cotação HVAC industrial.'),
 'scope:generator':()=>ref('generator',113280.34*Math.pow(Math.max(m.genKva,1)/100,.8)*1.3,'100 kVA × (potência/100)^0,8 × 1,30 para integração industrial; QTA/escopo final a conferir.'),
 'tray:main':()=>ref('tray',233.28/3*2.5,'Barra de 3 m / 3 × 2,5 para tampa, curvas e adaptação. Referência eletrolítica; custo de galvanização a fogo/inox a cotar.'),
 'tray:support':()=>ref('steel',8*steel,'8 kg de aço fabricado por suporte; vão, carga e acabamento a conferir.'),
 'service:engineering':()=>provision(Math.max(160,area*2)*p.hourRate,'max(160 h, 2 h/m²) × taxa de engenharia; exclui configuração SAE'),
 'service:fat':()=>provision(Math.max(80,m.eq.length*1.5)*p.hourRate,'max(80 h, 1,5 h/equipamento) × taxa; inspeção integrada, sem repetir ensaios de fábrica inclusos na PPU'),
 'service:commissioning':()=>provision(Math.max(160,m.eq.length*3)*p.hourRate,'max(160 h, 3 h/equipamento) × taxa; equipe/testes/logística a detalhar'),
 'automation:engineering':()=>provision(Math.max(80,(m.automation?.ieds.length||0)*2)*p.hourRate,'max(80 h, 2 h/IED) × taxa; SCL, rede, integração e testes; licenças separadas')
 };
 if(map[id])return map[id]();
 if(id.startsWith('equipment:NET-'))return ref('rack',8352.13*1.5,'Rack comercial 42U × 1,50 para adaptação industrial; rack vazio, sem switches/IEDs.');
 if(id.startsWith('equipment:UPS-'))return ref('ups',8791.9*Math.pow(m.upsKva/5,.85)*3,'UPS comercial 5 kVA sem baterias × (kVA/5)^0,85 × 3 para adaptação industrial. Analogia de orçamento; não comprova equivalência a UPS industrial contratual.');
 if(id.startsWith('equipment:BAT-')){const e=m.eq.find(e=>'equipment:'+e.id===id);if(e?.rack)return ref('steel',Math.max(40,(e.kg||0)*.15)*steel,'Massa conceitual da estante: max(40 kg, 15% da massa do conjunto) × aço fabricado; sem blocos de bateria.');}
 if(id.startsWith('transformer:')){const b=m.branches.find(b=>'transformer:'+b.key===id);if(b?.tr&&b.inputV>=1000&&b.inputV<=13800&&b.v<1000)return ref('transformer',88500*Math.pow(b.tr/1000,.7)*1.35,'Referência 1.000 kVA × (kVA/1000)^0,7 × 1,35; adaptação de tensão/escopo. Limitado a MT/BT até 13,8 kV; acessórios a confirmar.');}
 if(id.startsWith('battery:')){const b=id==='battery:DC'?m.dcBank:m.upsBank;if(b?.block?.v===12)return ref('battery',271.25*p.gbp*p.importFactor*Math.pow(b.block.ah/62,.85),'GBP 271,25 × câmbio orçamentário '+p.gbp+' × fator posto Brasil '+p.importFactor+' × (Ah/62)^0,85. Analogia B14F; sem VAT britânico.');}
 if(id.startsWith('ied:')||id.startsWith('automation:SAE - SEL-')){const model=id.startsWith('ied:')?m.automation?.ieds.find(d=>'ied:'+d.id===id)?.model:row.description.slice(6);const key=Object.keys(sources).filter(k=>k.startsWith('SEL-')).sort((a,b)=>b.length-a.length).find(k=>model===k||model?.startsWith(k+'-')||model?.startsWith(k+' '));if(key)return ref(key,sources[key][1]*p.usd*p.importFactor*p.optionFactor,'USD '+sources[key][1]+' inicial × câmbio orçamentário '+p.usd+' × fator posto Brasil '+p.importFactor+' × configuração '+p.optionFactor+'. Cartões, PRP, firmware e código de encomenda a cotar.');}
 if(id.includes('Cabo Cat.6A industrial'))return ref('cat6',87.85,'Preço anunciado por metro, sem instalação e frete.','Mercado');
 if(id.startsWith('automation:SAE - DIO-'))return ref('dio',472/24,'Estrutura DIO 24F / 24, por fibra de capacidade. Pigtails, adaptadores e fusões separados.','Estimativa');
 if(id.includes('Cordão óptico duplex'))return ref('patch',275,'Referência OM3/OM4; comprimento/conectores do projeto a confirmar.','Mercado');
 // Equipment without a defensible comparable price remains visibly pending.
 return null;
}
root.SEBudgetMarket={sources,date,estimate};
})(globalThis);
