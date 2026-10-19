(function(root){'use strict';
// Price data belongs to each saved project. No commercial price table is shipped.
root.SE_BUDGET_PRICES={file:'Base ainda não importada',rows:[]};
const parseXML=s=>{const d=new DOMParser().parseFromString(s,'application/xml');if(d.querySelector('parsererror'))throw Error('XML inválido na planilha.');return d;};
async function importXlsx(file){
 if(file.size>12*1024*1024)throw Error('Use uma planilha de até 12 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer()),dv=new DataView(bytes.buffer),u16=n=>dv.getUint16(n,true),u32=n=>dv.getUint32(n,true),decode=b=>new TextDecoder().decode(b);let end=-1;
 for(let n=bytes.length-22;n>=Math.max(0,bytes.length-65557);n--)if(u32(n)===0x06054b50){end=n;break;}
 if(end<0)throw Error('Arquivo XLSX inválido.');
 let pos=u32(end+16);const entries=new Map();for(let i=0;i<u16(end+10);i++){if(u32(pos)!==0x02014b50)throw Error('Estrutura ZIP inválida.');const len=u16(pos+28),name=decode(bytes.slice(pos+46,pos+46+len));entries.set(name,{method:u16(pos+10),size:u32(pos+20),expanded:u32(pos+24),offset:u32(pos+42)});pos+=46+len+u16(pos+30)+u16(pos+32);}
 async function read(name){const e=entries.get(name);if(!e)return '';if(e.expanded>8*1024*1024)throw Error('Uma aba excede o limite de leitura.');const start=e.offset+30+u16(e.offset+26)+u16(e.offset+28),data=bytes.slice(start,start+e.size);if(e.method===0)return decode(data);if(e.method!==8)throw Error('Compressão XLSX não suportada.');const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return await new Response(stream).text();}
 const sharedText=await read('xl/sharedStrings.xml'),shared=sharedText?[...parseXML(sharedText).querySelectorAll('si')].map(n=>[...n.querySelectorAll('t')].map(t=>t.textContent).join('')):[];
 const workbook=parseXML(await read('xl/workbook.xml')),rels=parseXML(await read('xl/_rels/workbook.xml.rels')),targets=new Map([...rels.querySelectorAll('Relationship')].map(n=>[n.getAttribute('Id'),n.getAttribute('Target')]));const rows=[];
 const formats={'PPU PN-MT':['MT',n=>(n>=3&&n<=25)||(n>=30&&n<=52)],'PPU PN-BT E SW':['BT',n=>(n>=3&&n<=60)||n===67],'PPU DUTO':['DUTO',n=>n>=3&&n<=8]};
 for(const sh of workbook.querySelectorAll('sheet')){const name=sh.getAttribute('name'),format=formats[name];if(!format)continue;const target=targets.get(sh.getAttribute('r:id'));if(!target)throw Error('Aba sem referência interna.');const path=target.startsWith('/')?target.slice(1):'xl/'+target;const xml=parseXML(await read(path));const cells=new Map([...xml.querySelectorAll('c')].map(c=>{let value=c.querySelector('v')?.textContent??'';if(c.getAttribute('t')==='s')value=shared[Number(value)]??'';if(c.getAttribute('t')==='inlineStr')value=[...c.querySelectorAll('t')].map(t=>t.textContent).join('');return[c.getAttribute('r'),value];}));
  for(const row of xml.querySelectorAll('row')){const n=Number(row.getAttribute('r'));if(!format[1](n))continue;const description=cells.get('A'+n)||'';if(!description.trim())continue;const raw=cells.get('B'+n),price=raw===undefined||raw===''?null:Number(raw);if(price!==null&&(!Number.isFinite(price)||price<0))throw Error('Preço inválido em '+name+'!B'+n);rows.push({id:format[0]+'-'+n,description,price,sheet:name,cell:'B'+n});}
 }
 if(!rows.some(r=>r.id==='MT-3')||!rows.some(r=>r.id==='BT-21'))throw Error('Layout não reconhecido. Use a PPU RPBC original, com descrições na coluna A e preços na B.');
 return {file:file.name,rows};
}
root.SEBudgetImport={importXlsx};
})(globalThis);
