const optionDialog=document.createElement('dialog');
document.body.append(optionDialog);
const plainAdd=window.add;
window.add=id=>{
  const p=products.find(x=>x.id===id);
  if(!p)return;
  if(!(p.sizes?.length||p.colors?.length||p.allowCustomOption)){plainAdd(id);return;}
  if(cart.filter(x=>x.id===id).length>=p.stock){cartNotice('선택 가능한 재고 수량을 모두 담았습니다.');return;}
  optionDialog.replaceChildren();
  const title=document.createElement('h2');title.textContent=p.name+' 옵션 선택';optionDialog.append(title);
  const form=document.createElement('form');optionDialog.append(form);
  for(const [key,label,values]of [['size','사이즈',p.sizes],['color','색상',p.colors]]){
    if(!values?.length)continue;
    const wrapper=document.createElement('label');wrapper.textContent=label;
    const select=document.createElement('select');select.name=key;select.required=true;select.add(new Option('선택해 주세요',''));
    for(const value of values)select.add(new Option(value,value));wrapper.append(select);form.append(wrapper);
  }
  if(p.allowCustomOption){const wrapper=document.createElement('label');wrapper.textContent=p.customOptionLabel||'직접입력';const input=document.createElement('input');input.name='custom';input.required=true;input.maxLength=100;wrapper.append(input);form.append(wrapper);}
  const add=document.createElement('button');add.type='submit';add.className='submit';add.textContent='선택한 옵션 담기';form.append(add);
  const cancel=document.createElement('button');cancel.type='button';cancel.className='copy';cancel.textContent='취소';cancel.onclick=()=>optionDialog.close();form.append(cancel);
  form.onsubmit=e=>{e.preventDefault();const current=products.find(x=>x.id===id);if(!current||!isOnSaleDate(current)||cart.filter(x=>x.id===id).length>=current.stock){cartNotice('판매 상태와 재고를 다시 확인해 주세요.');return;}const data=new FormData(form);if(p.allowCustomOption&&!String(data.get('custom')||'').trim()){form.elements.custom.focus();return;}const parts=[];for(const [key,label]of [['size','사이즈'],['color','색상'],['custom',p.customOptionLabel||'직접입력']])if(data.get(key))parts.push(label+': '+String(data.get(key)).trim());cart.push({...current,optionText:parts.join(' / ')});drawCart();optionDialog.close();cartNotice(p.name+' 담았습니다.');};
  optionDialog.showModal();
};
function optionGroups(){const groups=new Map();cart.forEach((p,index)=>{const key=JSON.stringify([p.id,p.optionText||'']);if(!groups.has(key))groups.set(key,{p,index,count:0});groups.get(key).count++;});return [...groups.values()];}
const previousCart=drawCart;
drawCart=function(){previousCart();if(!cart.length)return;cartEl.innerHTML=optionGroups().map(({p,index,count})=>`<div class="cart-row"><div><strong>${escapeHTML(p.name)}</strong>${p.optionText?`<div class="option-caption">${escapeHTML(p.optionText)}</div>`:''}<div>${won(p.price)} × ${count} = ${won(p.price*count)}</div></div><div class="quantity"><button type="button" onclick="adjustOption(${index},-1)" aria-label="수량 줄이기">−</button><span>${count}</span><button type="button" onclick="adjustOption(${index},1)" aria-label="수량 늘리기" ${cart.filter(x=>x.id===p.id).length>=p.stock?'disabled':''}>+</button></div></div>`).join('');};
window.adjustOption=(index,delta)=>{const p=cart[index];if(!p)return;if(delta<0)cart.splice(index,1);else{const current=products.find(x=>x.id===p.id);if(!current||!isOnSaleDate(current)||cart.filter(x=>x.id===p.id).length>=current.stock){cartNotice('선택 가능한 재고 수량을 모두 담았습니다.');return;}cart.push({...current,optionText:p.optionText});}drawCart();};
const previousSubmit=liveForm.onsubmit;
liveForm.onsubmit=e=>{const wasOpen=document.querySelector('#success').open;previousSubmit(e);if(!wasOpen&&document.querySelector('#success').open){document.querySelector('#successText').textContent+='\n\n선택 옵션\n'+optionGroups().map(({p,count})=>`${p.name} · ${p.optionText||'기본'} × ${count}`).join('\n');}};
drawCart();
