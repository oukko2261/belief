export function mountSellerProducts(host,getState,controls={}){
 const select=controls.select||document.querySelector('#productSelect'),form=controls.form||document.querySelector('#productForm');
 if(!select||!form)throw Error('상품 편집 화면을 준비하지 못했습니다. 페이지를 다시 열어 주세요.');
 const heading=document.createElement('h3'),context=document.createElement('p'),note=document.createElement('p'),list=document.createElement('div'),add=document.createElement('button');
 heading.textContent='등록된 상품';note.textContent='현재 편집 중인 상품 목록입니다. 고객 화면 반영 여부는 저장 결과를 확인하세요.';
 list.className='seller-product-list';add.type='button';add.textContent='새 상품 등록';host.append(context,heading,note,list,add);
 let dirty=false;form.addEventListener('input',()=>{dirty=true;});form.addEventListener('change',()=>{dirty=true;});
 function edit(id){if(dirty&&!confirm('저장하지 않은 상품 편집을 닫고 이동할까요?'))return;select.value=id==null?'':String(id);select.dispatchEvent(new Event('change'));dirty=false;form.scrollIntoView({behavior:'smooth',block:'start'});document.querySelector('#productName').focus();}
 add.onclick=()=>edit(null);
 function draw(){
  const {products,date,name,ids}=getState();context.textContent='선택한 주문서: '+date+' · '+(name||'이름 없음');heading.textContent='등록된 상품 '+products.length+'개';list.replaceChildren();
  if(!products.length){list.textContent='등록된 상품이 없습니다. 아래에서 새 상품을 등록하세요.';return;}
  for(const p of products){const row=document.createElement('article'),visual=document.createElement('div'),info=document.createElement('div'),title=document.createElement('strong'),meta=document.createElement('p'),button=document.createElement('button');row.className='seller-product-row';visual.className='seller-product-photo';
   const src=p.photos?.[0];if(typeof src==='string'&&/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(src)){const img=document.createElement('img');img.src=src;img.alt=p.name;visual.append(img);}else visual.textContent='사진 없음';
   title.textContent=p.name;meta.textContent=Number(p.price).toLocaleString('ko-KR')+'원 · 재고 '+p.stock+'개'+(p.hideStock?' (고객에게 수량 숨김)':'')+' · '+(!p.visible?'숨김':ids.includes(p.id)?'선택 주문서에 포함':'다른 주문서 상품');info.append(title,meta);button.type='button';button.textContent='수정';button.setAttribute('aria-label',p.name+' 수정');button.onclick=()=>edit(p.id);row.append(visual,info,button);list.append(row);
  }
 }
 document.addEventListener('seller-catalog-changed',()=>{dirty=false;draw();});draw();
}
