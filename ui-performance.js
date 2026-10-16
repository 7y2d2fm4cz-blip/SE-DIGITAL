(function(root){'use strict';const $=id=>document.getElementById(id),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pending=new Map();let active='loads';
function defer(key,view,fn){pending.set(key,{view,fn});if(view===active)run(key);}
function run(key){const task=pending.get(key);if(!task)return;pending.delete(key);task.fn();}
function navigate(id){active=id;for(const [key,t]of [...pending])if(t.view===id)run(key);}
function html(id,view,fn){defer('html:'+id,view,()=>{if($(id))$(id).innerHTML=fn();});}
function onExpand(id,fn){const d=$(id)?.closest('details');let done=false;const fill=()=>{if(!done){done=true;fn();}};if(!d||d.open)fill();if(d)d.ontoggle=()=>{if(d.open)fill();};}
root.SEViews={defer,run,navigate,html,onExpand,getActive:()=>active};window.addEventListener('se:navigate',e=>navigate(e.detail.id));
const lists=new Map();
function mount(id,items,key,render,options={}){
 const host=$(id);if(!host)return;let state=lists.get(id)||{filter:'',page:0,open:options.open??items.length<=30};
 Object.assign(state,{items,key,render,size:options.size||25,title:options.title||'Registros'});lists.set(id,state);
 const groups=[...new Set(items.map(key).map(x=>String(x??'')))].sort();if(state.filter&&!groups.includes(state.filter)){state.filter='';state.page=0;}
 function paint(){const rows=items.map((item,index)=>({item,index})).filter(r=>!state.filter||String(key(r.item))===state.filter),pages=Math.max(1,Math.ceil(rows.length/state.size));state.page=Math.min(state.page,pages-1);
  host.innerHTML=`<details class="data-group" ${state.open?'open':''}><summary>${E(state.title)} · ${items.length} registros</summary><div class="data-group-body"></div></details>`;
  const details=host.querySelector('details'),body=host.querySelector('.data-group-body');
  function fill(){body.innerHTML=`<div class="data-pagination"><label>Grupo<select data-list-filter><option value="">Todos</option>${groups.map(g=>`<option value="${E(g)}" ${g===state.filter?'selected':''}>${E(g)}</option>`).join('')}</select></label><button type="button" data-list-prev ${state.page===0?'disabled':''}>Anterior</button><span>Página ${state.page+1} de ${pages} · ${rows.length} registros</span><button type="button" data-list-next ${state.page===pages-1?'disabled':''}>Próxima</button></div>`+render(rows.slice(state.page*state.size,(state.page+1)*state.size));
   body.querySelector('[data-list-filter]').onchange=e=>{e.stopPropagation();state.filter=e.target.value;state.page=0;paint();};body.querySelector('[data-list-prev]').onclick=()=>{state.page--;paint();};body.querySelector('[data-list-next]').onclick=()=>{state.page++;paint();};
  }
  if(state.open)fill();details.addEventListener('toggle',()=>{state.open=details.open;if(state.open&&!body.innerHTML)fill();});
 }
 paint();
}
function printAll(id){const s=lists.get(id);if(!s)return '';return s.render(s.items.map((item,index)=>({item,index}))).replace(/<select\b[^>]*>([\s\S]*?)<\/select>/gi,(_,options)=>{const selected=options.match(/<option\b[^>]*\bselected\b[^>]*>([\s\S]*?)<\/option>/i)||options.match(/<option\b[^>]*>([\s\S]*?)<\/option>/i);return '<span>'+(selected?.[1]||'')+'</span>';}).replace(/<input\b([^>]*)>/gi,(_,attrs)=>/type="checkbox"/.test(attrs)?(/\bchecked\b/.test(attrs)?'Sim':'Não'):(attrs.match(/value="([^"]*)"/)?.[1]||'')).replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi,'').replace(/<textarea\b[^>]*>([\s\S]*?)<\/textarea>/gi,'$1');}
root.SELists={mount,printAll};
// Generic collapsible sections, populated only when expanded. Delegated table edits remain intact.
function headings(container){let body=null;for(const node of [...container.childNodes]){if(node.nodeType===1&&/^H[23]$/.test(node.tagName)){const d=document.createElement('details'),s=document.createElement('summary'),b=document.createElement('div');d.className='data-group';s.textContent=node.textContent;b.className='data-group-body';d.append(s,b);container.insertBefore(d,node);node.remove();body=b;}else if(body)body.append(node);}for(const d of container.querySelectorAll(':scope > details.data-group')){const b=d.querySelector('.data-group-body'),markup=b.innerHTML;b.innerHTML='';d.addEventListener('toggle',()=>{if(d.open&&!b.innerHTML)b.innerHTML=markup;});}}
root.SEGroups={headings};
})(globalThis);
