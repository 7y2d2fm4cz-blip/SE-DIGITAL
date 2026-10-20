(function(root){'use strict';
// Synthetic, deterministic projects for exercising the application. No real customer data.
const definitions=[
 {key:'muito-pequeno',size:'Muito pequeno',zones:1,motors:1,services:3,input:480,dual:false,spare:0,dcHours:2,upsHours:.25},
 {key:'pequeno',size:'Pequeno',zones:1,motors:8,services:4,input:13800,dual:false,spare:10,dcHours:4,upsHours:.5},
 {key:'medio',size:'Médio',zones:2,motors:9,services:5,input:13800,dual:true,spare:15,dcHours:6,upsHours:1},
 {key:'grande',size:'Grande',zones:4,motors:10,services:5,input:13800,dual:true,spare:20,dcHours:8,upsHours:1},
 {key:'muito-grande',size:'Muito grande',zones:8,motors:12,services:6,input:13800,dual:true,spare:20,dcHours:8,upsHours:1.5},
 {key:'gigante',size:'Gigante',zones:16,motors:14,services:6,input:13800,dual:true,spare:25,dcHours:12,upsHours:2}
];
function make(def){
 const main=def.input===480?'CDC-480-ENTRADA':'CDC-MT',power=[7.5,11,15,18.5,22,30,37,45];
 const c={...SE.baseProfile('Actemium'),project:'Projeto modelo tamanho '+def.size,document:'SE-MODELO-'+def.key.toUpperCase(),projectNotes:'Dados fictícios para testes. Conferir alertas, pendências e limites da engenharia conceitual; não usar como projeto executivo.',projectStage:'Modelo para testes',projectDate:'2026-10-16',inputV:def.input,inputVB:def.input,mainPanelTag:main,topology:def.dual?'H':'I',sourceRed:def.dual?'2N':'N',redundancy:def.dual?'N+1':'N',upsRed:def.dual?'2N':'N',upsBankRed:def.dual?'2N':'N',dcBankRed:def.dual?'2N':'N',rectifiers:def.dual?2:1,spare:def.spare,dcHours:def.dcHours,upsHours:def.upsHours,includeAuxiliaries:def.zones>=4,auxRooms:def.zones>=8?{'UPS / eletrônica':'UPS / eletrônica','Automação / telecom':'Automação / telecom'}:{'UPS / eletrônica':'BT','Automação / telecom':'BT'},motorControls:def.zones>=4,aisle:def.zones>=8?2:1.5,rear:def.zones>=8?.8:.6,routing:{trayWidth:def.zones>=8?1200:600,height:def.zones>=8?3:1.8,verticalPitch:.3},roadTransport:{mode:def.zones>=8?'standard':'optimized',deck:.8,structure:.35,packing:.05},panelDefinitions:{[main]:{voltage:def.input,room:def.input>1000?'MT':'BT',parent:null,bars:def.dual?'AB':'A',kind:'CA'}},panelPlacement:{},manualConnections:[]};
 const destinations={'muito-pequeno':'1505536',pequeno:'3117504',medio:'3118007',grande:'3131901','muito-grande':'3550308',gigante:'3304557'};c.proposal={commerce:{origin:'3118601',destination:destinations[def.key]}};
 const loads=[],prototype=SE.example()[0];
 const add=(tag,panel,voltage,kw,type='motor',cl='normal',bar='A',extra={})=>loads.push({...prototype,tag,description:'Teste '+def.size+' — '+tag,panelTag:panel,panelRoom:'BT',voltage,kw,type,class:cl,bar,start:type==='motor'?'Direta':'N/A',quantity:1,fd:.8,fp:cl==='CC'?1:.9,eta:type==='motor'?.94:1,powerBasis:type==='motor'?'mecanica':'eletrica',phases:type==='motor'||voltage>1000?3:1,drawerCode:'auto',redundancy:'N',distance:20+loads.length%8*10,...extra});
 for(let z=1;z<=def.zones;z++){
  const code=String(z).padStart(2,'0'),cdc=def.input===480?main:'CDC-480-'+code,ccm='CCM-'+code,qd='QD-220-'+code,ups='QUPS-220-'+code,cc='QCC-125-'+code;
  if(cdc!==main)c.panelDefinitions[cdc]={voltage:480,room:'BT',parent:main,bars:def.dual?'AB':'A',kind:'CA'};
  c.panelDefinitions[ccm]={voltage:480,room:'BT',parent:cdc,bars:def.dual?'AB':'A',kind:'CA'};
  c.panelDefinitions[qd]={voltage:220,room:'BT',parent:cdc,bars:'A',kind:'CA'};
  c.panelPlacement[ccm]={side:(z-1)%2,order:z};
  for(let i=0;i<def.motors;i++)add('M-'+code+'-'+String(i+1).padStart(2,'0'),ccm,480,def.key==='muito-pequeno'?2.2:power[i%power.length],'motor',i===0&&def.key!=='muito-pequeno'?'essencial':'normal',def.dual&&i%2?'B':'A',{start:i%5===4?'VFD':'Direta',redundancy:def.zones>=8&&i===0?'N+1':'N'});
  add('LT-'+code,qd,220,.3,'iluminacao');
  add('AUT-'+code,ups,220,def.zones>=8?1:.3,'automacao','UPS');
  add('DC-'+code,cc,125,def.zones>=8?.15:.08,'distribuicao','CC');
  if(def.services>=4)add('EM-'+code,qd,220,.15,'iluminacao','emergencia');
  if(def.services>=5){const mt='PN-MT-'+code;c.panelDefinitions[mt]={voltage:4160,room:'MT',parent:main,bars:def.dual?'AB':'A',kind:'CA'};add('MT-'+code+'-A',mt,4160,200,'motor','normal','A',{panelRoom:'MT',phases:3});if(def.services>=6)add('MT-'+code+'-B',mt,4160,250,'motor','normal','B',{panelRoom:'MT',phases:3});}
  if(def.zones>=4){for(const [kind,system,spec]of [['NET','Rede industrial','Exemplo: Ethernet industrial'],['FO','Fibra óptica','Exemplo: fibra 12F OS2']])c.manualConnections.push({id:kind+'-'+code,system,origin:ccm,destination:ups,bar:def.dual&&z%2===0?'B':'A',route:'R'+code,quantity:1,length:20+z*2,diameter:kind==='NET'?8:9,kg:kind==='NET'?.06:.07,spec,reference:'Premissa fictícia para teste; selecionar fabricante',confirmed:false,inBasement:true});}
 }
 if(def.zones>=8)c.wallQd=Object.fromEntries(Array.from({length:def.zones},(_,i)=>['QD-220-'+String(i+1).padStart(2,'0'),{mode:i%2===0?'floor':'wall',z:1,reserve:20,dr:2,dps:4,aux:0}]));
 const description=loads.length+' linhas de cargas · '+def.zones+' setor(es) · '+(def.dual?'barras A/B e entrada 2N':'barra A e entrada N')+' · '+(def.input>1000?'MT/480/220/125 Vcc':'480/220/125 Vcc')+' · UPS/CC';
 return {key:def.key,name:c.project,description,snapshot:JSON.stringify({version:5,client:'Actemium',profiles:{Actemium:c},loads,cables:{Actemium:{}}})};
}
function seed(db,now=new Date().toISOString()){
 const installed=new Set(db.installedModels||[]),models=definitions.map(make).filter(m=>!installed.has(m.key));
 const needs= (db.projects||[]).some(p=>p.modelKey&&!JSON.parse(p.snapshot).profiles?.Actemium?.proposal?.commerce?.destination);if(!models.length&&!needs)return null;
 const next=structuredClone(db);for(const p of next.projects){if(!p.modelKey)continue;const fresh=definitions.find(d=>d.key===p.modelKey);if(!fresh)continue;const s=JSON.parse(p.snapshot),c=s.profiles.Actemium;if(!c.proposal?.commerce?.destination){const dc=JSON.parse(make(fresh).snapshot).profiles.Actemium.proposal.commerce;c.proposal={...c.proposal,commerce:{...dc,...c.proposal?.commerce}};p.snapshot=JSON.stringify(s);}}next.installedModels=[...installed];
 for(const m of models){if(!next.projects.some(p=>p.modelKey===m.key)){let id='sample-v1-'+m.key;while(next.projects.some(p=>p.id===id))id+='-copy';next.projects.push({id,name:m.name,modelKey:m.key,modelDescription:m.description,createdAt:now,updatedAt:now,snapshot:m.snapshot});}next.installedModels.push(m.key);}
 return next;
}
root.SEProjectModels={version:1,list:()=>definitions.map(make),seed};
})(globalThis);
