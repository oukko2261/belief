// Preserve the existing date-to-product mapping; names are optional metadata.
let salePageNames={};
try{const saved=JSON.parse(localStorage.getItem('live-shop-sale-names-v1'));if(saved&&typeof saved==='object'&&!Array.isArray(saved))salePageNames=saved;}catch{}
const savedSaleSelect=document.querySelector('#savedSalePages');
const saleName=document.querySelector('#salePageName');
function refreshSavedSalePages(){
  const previous=savedSaleSelect.value;savedSaleSelect.replaceChildren(new Option('저장된 주문서 선택',''));
  for(const date of Object.keys(salePages).filter(validSaleDate).sort().reverse()){
    const ids=Array.isArray(salePages[date])?salePages[date]:[];
    savedSaleSelect.add(new Option(`${date} · ${salePageNames[date]||'라이브 주문서'} · ${ids.length}개 상품`,date));
  }
  savedSaleSelect.value=Object.hasOwn(salePages,activeSaleDate)?activeSaleDate:previous;
  saleName.value=salePageNames[activeSaleDate]||'';
}
document.querySelector('#loadSalePage').onclick=()=>{
  const date=savedSaleSelect.value;
  if(!date){document.querySelector('#saleDateStatus').textContent='불러올 주문서를 목록에서 선택해 주세요.';return;}
  const unsaved=saleName.value.trim()!==(salePageNames[activeSaleDate]||'');
  if((cart.length||unsaved)&&!confirm('저장하지 않은 주문서 이름과 장바구니를 비우고 주문서를 불러올까요?'))return;
  activeSaleDate=date;cart=[];drawProducts();drawCart();renderSaleEditor();refreshSavedSalePages();
  try{history.replaceState(null,'',document.querySelector('#saleLink').value);}catch{}
  const missing=(salePages[date]||[]).filter(id=>!products.some(p=>p.id===id)).length;
  document.querySelector('#saleDateStatus').textContent=`${date} 주문서를 불러왔습니다.${missing?' 현재 상품 목록에 없는 상품 '+missing+'개는 표시되지 않습니다.':''}`;
};
document.querySelector('#saleDate').onchange=()=>{
  const input=document.querySelector('#saleDate'),date=input.value;
  if(!validSaleDate(date)){input.value=activeSaleDate;return;}
  if(date===activeSaleDate)return;
  if((cart.length||saleName.value.trim()!==(salePageNames[activeSaleDate]||''))&&!confirm('날짜를 변경하면 저장하지 않은 주문서 이름과 장바구니가 비워집니다. 변경할까요?')){input.value=activeSaleDate;return;}
  activeSaleDate=date;cart=[];drawProducts();drawCart();renderSaleEditor();refreshSavedSalePages();
  try{history.replaceState(null,'',document.querySelector('#saleLink').value);}catch{}
  document.querySelector('#saleDateStatus').textContent=`${date} 주문서입니다. 상품을 저장하면 이 날짜에 추가됩니다.`;
};
document.querySelector('#saveSaleDate').onclick=()=>{
  const status=document.querySelector('#saleDateStatus');
  const ids=salePages[activeSaleDate]||products.filter(isOnSaleDate).map(p=>p.id);
  const next={...salePages,[activeSaleDate]:ids},names={...salePageNames,[activeSaleDate]:saleName.value.trim()};
  const oldPages=localStorage.getItem('live-shop-sale-pages-v1');
  try{
    localStorage.setItem('live-shop-sale-pages-v1',JSON.stringify(next));
    try{localStorage.setItem('live-shop-sale-names-v1',JSON.stringify(names));}catch(error){if(oldPages===null)localStorage.removeItem('live-shop-sale-pages-v1');else localStorage.setItem('live-shop-sale-pages-v1',oldPages);throw error;}
    salePages=next;salePageNames=names;cart=cart.filter(isOnSaleDate);drawCart();drawProducts();refreshSavedSalePages();status.textContent=`${activeSaleDate} · ${names[activeSaleDate]||'라이브 주문서'} 저장 완료. 목록에서 다시 불러올 수 있습니다.`;
  }catch{status.textContent='저장하지 못했습니다. 브라우저 저장 공간과 설정을 확인해 주세요.';}
};
refreshSavedSalePages();
