const liveFeedback=document.querySelector('#cartFeedback');
const liveForm=document.querySelector('#orderForm');
let feedbackTimer;
function cartNotice(text){liveFeedback.textContent=text;clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>liveFeedback.textContent='',3500);}
const baseDrawCart=drawCart;
drawCart=function(){
  baseDrawCart();
  if(cart.length){const grouped=new Map();for(const p of cart){const row=grouped.get(p.id)||{p,count:0};row.count++;grouped.set(p.id,row);}cartEl.innerHTML=[...grouped.values()].map(({p,count})=>`<div class="cart-row"><div><strong>${escapeHTML(p.name)}</strong><div>${won(p.price)} × ${count} = ${won(p.price*count)}</div></div><div class="quantity"><button type="button" onclick="changeQuantity(${p.id},-1)" aria-label="${escapeHTML(p.name)} 수량 줄이기">−</button><span>${count}</span><button type="button" onclick="changeQuantity(${p.id},1)" aria-label="${escapeHTML(p.name)} 수량 늘리기" ${count>=p.stock?'disabled':''}>+</button></div></div>`).join('');}
  document.querySelector('#mobileCartBar').hidden=!cart.length;
  document.querySelector('#mobileCartSummary').textContent=`${cart.length}개 · ${won(cart.reduce((sum,p)=>sum+p.price,0))}`;
};
window.add=id=>{const p=products.find(p=>p.id===id);if(!p||!isOnSaleDate(p)){cartNotice('현재 판매하지 않는 상품입니다.');return;}if(cart.filter(p=>p.id===id).length>=p.stock){cartNotice('선택 가능한 재고 수량을 모두 담았습니다.');return;}cart.push(p);drawCart();cartNotice(`${p.name} 담았습니다.`);};
window.changeQuantity=(id,delta)=>{if(delta>0){window.add(id);return;}const index=cart.findIndex(p=>p.id===id);if(index!==-1)cart.splice(index,1);drawCart();};
document.querySelector('#goToOrder').onclick=()=>document.querySelector('#order').scrollIntoView({behavior:'smooth'});
liveForm.elements.name.autocomplete='name';liveForm.elements.phone.autocomplete='tel';liveForm.elements.phone.type='tel';liveForm.elements.address.autocomplete='street-address';
liveForm.elements.phone.pattern='[+0-9() \\-]{8,20}';
liveForm.elements.phone.title='연락 가능한 전화번호를 8~20자로 입력해 주세요.';
const originalPaymentChange=liveForm.onchange;
liveForm.onchange=e=>{originalPaymentChange(e);document.querySelector('#depositorField').hidden=liveForm.elements.payment.value!=='transfer';};
const baseDetail=window.showDetail;
window.showDetail=id=>{baseDetail(id);const p=products.find(p=>p.id===id);if(!p)return;const button=document.createElement('button');button.className='submit';button.type='button';button.textContent=p.stock?'이 상품 담기':'품절';button.disabled=!p.stock||!isOnSaleDate(p);button.onclick=()=>{window.add(id);document.querySelector('#detailDialog').close();};document.querySelector('#detail').append(button);};
let submitting=false;
liveForm.onsubmit=e=>{
  e.preventDefault();if(submitting)return;
  const error=document.querySelector('#orderError');error.textContent='';
  if(!cart.length){error.textContent='주문할 상품을 먼저 담아 주세요.';return;}
  if(!liveForm.elements.name.value.trim()||!liveForm.elements.address.value.trim()){error.textContent='주문자 이름과 배송지를 입력해 주세요.';return;}
  const counts=new Map();for(const p of cart)counts.set(p.id,(counts.get(p.id)||0)+1);
  for(const [id,count]of counts){const current=products.find(p=>p.id===id);if(!current||!isOnSaleDate(current)||count>current.stock){error.textContent='판매 상태 또는 재고가 변경되었습니다. 상품과 수량을 다시 확인해 주세요.';return;}if(cart.some(p=>p.id===id&&p.price!==current.price)){cart=cart.map(p=>p.id===id?current:p);drawCart();error.textContent='상품 가격이 변경되었습니다. 변경된 금액을 확인 후 다시 진행해 주세요.';return;}}
  submitting=true;
  const transfer=liveForm.elements.payment.value==='transfer';
  const name=liveForm.elements.depositor.value.trim()||liveForm.elements.name.value.trim();
  const text=[`판매일: ${activeSaleDate}`,...[...counts].map(([id,count])=>{const p=products.find(p=>p.id===id);return `${p.name} × ${count} · ${won(p.price*count)}`;}),`상품 합계: ${won(cart.reduce((sum,p)=>sum+p.price,0))}`,`결제 방법: ${transfer?'무통장입금':'카드결제'}`,transfer?`입금자명: ${name}`:'','테스트 완료입니다. 실제 주문은 접수되지 않았으며 결제·입금하지 마세요. 배송비는 아직 계산되지 않습니다.'].filter(Boolean).join('\n');
  document.querySelector('#successText').textContent=text;document.querySelector('#success').showModal();
  const button=liveForm.querySelector('button[type=submit]');button.disabled=true;
  document.querySelector('#success').addEventListener('close',()=>{submitting=false;button.disabled=false;},{once:true});
};
drawCart();
