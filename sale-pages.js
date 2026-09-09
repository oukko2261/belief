// Each live order sheet has its own key. Older date-only records stay supported.
let salePageNames={};
try{const saved=JSON.parse(sellerStorage.getItem('live-shop-sale-names-v1'));if(saved&&typeof saved==='object'&&!Array.isArray(saved))salePageNames=saved;}catch{}
const savedSaleSelect=document.querySelector('#savedSalePages');
const saleName=document.querySelector('#salePageName');
const pageDate=key=>/^\d{4}-\d{2}-\d{2}/.test(key||'')?key.slice(0,10):activeSaleDate;
const newPageKey=date=>date+'__'+Date.now().toString(36);
function refreshSavedSalePages(){
  const previous=savedSaleSelect.value;savedSaleSelect.replaceChildren(new Option('저장된 주문서 선택',''));
  for(const key of Object.keys(salePages).filter(key=>validSaleDate(pageDate(key))).sort().reverse()){
    const ids=Array.isArray(salePages[key])?salePages[key]:[];
    savedSaleSelect.add(new Option(`${pageDate(key)} · ${salePageNames[key]||'라이브 주문서'} · ${ids.length}개 상품`,key));
  }
  savedSaleSelect.value=Object.hasOwn(salePages,activeSaleKey)?activeSaleKey:previous;
  saleName.value=salePageNames[activeSaleKey]||'';
}
function activatePage(key){activeSaleKey=key;activeSaleDate=pageDate(key);cart=[];drawProducts();drawCart();renderSaleEditor();refreshSavedSalePages();try{history.replaceState(null,'',document.querySelector('#saleLink').value);}catch{}}
document.querySelector('#loadSalePage').onclick=()=>{
  const key=savedSaleSelect.value;if(!key){document.querySelector('#saleDateStatus').textContent='불러올 주문서를 목록에서 선택해 주세요.';return;}
  if((cart.length||saleName.value.trim()!==(salePageNames[activeSaleKey]||''))&&!confirm('저장하지 않은 편집과 장바구니를 비우고 주문서를 불러올까요?'))return;
  activatePage(key);const missing=(salePages[key]||[]).filter(id=>!products.some(p=>p.id===id)).length;
  document.querySelector('#saleDateStatus').textContent=`${activeSaleDate} 주문서를 불러왔습니다.${missing?' 현재 상품 목록에 없는 상품 '+missing+'개는 표시되지 않습니다.':''}`;
};
document.querySelector('#saleDate').onchange=()=>{
  const input=document.querySelector('#saleDate'),date=input.value;if(!validSaleDate(date)){input.value=activeSaleDate;return;}
  if((cart.length||saleName.value.trim()!==(salePageNames[activeSaleKey]||''))&&!confirm('날짜를 변경하면 저장하지 않은 편집과 장바구니가 비워집니다. 변경할까요?')){input.value=activeSaleDate;return;}
  activeSaleDate=date;activeSaleKey=newPageKey(date);cart=[];drawProducts();drawCart();renderSaleEditor();refreshSavedSalePages();document.querySelector('#saleDateStatus').textContent=`${date}의 새 주문서입니다. 이름과 상품을 입력한 뒤 저장하세요.`;
};
saleName.addEventListener('change',()=>{
  const name=saleName.value.trim(),current=salePageNames[activeSaleKey]||'';
  if(Object.hasOwn(salePages,activeSaleKey)&&name&&name!==current){activeSaleKey=newPageKey(activeSaleDate);cart=[];drawProducts();drawCart();renderSaleEditor();document.querySelector('#saleDateStatus').textContent='같은 날짜의 새 주문서로 분리했습니다. 상품을 선택해 저장하세요.';}
});
function persistCurrentSale(){
  const status=document.querySelector('#saleDateStatus');const name=saleName.value.trim();
  if(!name){status.textContent='주문서 이름을 입력해 주세요.';return false;}
  const ids=salePages[activeSaleKey]||[];const next={...salePages,[activeSaleKey]:ids},names={...salePageNames,[activeSaleKey]:name};
  const oldPages=sellerStorage.getItem('live-shop-sale-pages-v1');
  try{sellerStorage.setItem('live-shop-sale-pages-v1',JSON.stringify(next));try{sellerStorage.setItem('live-shop-sale-names-v1',JSON.stringify(names));}catch(error){if(oldPages===null)sellerStorage.removeItem('live-shop-sale-pages-v1');else sellerStorage.setItem('live-shop-sale-pages-v1',oldPages);throw error;}salePages=next;salePageNames=names;cart=cart.filter(isOnSaleDate);drawCart();drawProducts();refreshSavedSalePages();status.textContent='';return true;}catch{status.textContent='저장하지 못했습니다. 브라우저 저장 공간과 설정을 확인해 주세요.';return false;}
};
refreshSavedSalePages();
