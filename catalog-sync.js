const catalogStatus=document.querySelector('#catalogSyncStatus');
const saveCatalogButton=document.querySelector('#saveCatalog'),loadCatalogButton=document.querySelector('#loadCatalog');
const catalogKeys={products:'live-shop-products-v1',salePages:'live-shop-sale-pages-v1',salePageNames:'live-shop-sale-names-v1',storeSettings:'live-shop-store-settings-v1'};
let catalogBusy=false;
async function runCatalog(action,{fromProduct=false,selectedDate=''}={}){
  if(catalogBusy)return false;
  if(location.protocol==='file:'){catalogStatus.textContent='이 브라우저에만 저장되었습니다. 고객 화면 반영은 판매자 웹사이트에서 로그인 후 이용해 주세요.';return false;}
  catalogBusy=true;
  const controls=[...document.querySelectorAll('#productForm input, #productForm button, #productForm select, #productForm textarea, #storeForm input, #storeForm button, #storeForm select, #storeForm textarea, #productSelect, #saleDate, #loadSalePage, #savedSalePages, #salePageName')];
  const states=controls.map(control=>control.disabled);controls.forEach(control=>control.disabled=true);
  saveCatalogButton.disabled=loadCatalogButton.disabled=true;
  try{
    const statusResponse=await fetch('/api/google/status');if(!statusResponse.ok)throw Error('이 주소에는 Google 연결 서버가 없습니다. 로컬 연결 페이지를 이용해 주세요.');
    const login=await statusResponse.json();if(!login.authenticated||!login.sheetUrl){document.querySelector('#sheetSettings').hidden=false;document.querySelector('#sheetConnect').setAttribute('aria-expanded','true');throw Error('아래 Google 연결 설정에서 로그인하고 관리 시트를 연결해 주세요.');}
    if(!fromProduct&&!confirm(action==='save'?`${login.email} 계정의 ${login.shopName} 시트 백업을 갱신하고, 판매 상품·사진·가격을 공개 고객 화면에도 반영할까요?`:`${login.email} 계정의 ${login.shopName} 백업으로 현재 브라우저의 상품·사진·설정을 교체할까요? 저장하지 않은 편집과 장바구니는 초기화됩니다.`))return false;
    if(action==='save'&&!persistCurrentSale())throw Error('날짜별 주문서를 저장하지 못했습니다. 기존 데이터는 유지됩니다.');
    catalogStatus.textContent=action==='save'?'Google 시트에 저장 중…':'Google 시트에서 불러오는 중…';
    const response=await fetch('/api/catalog/'+action,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':login.csrf},body:JSON.stringify(action==='save'?{products,salePages,salePageNames,storeSettings}:{})});
    const result=await response.json();if(!response.ok)throw Error(result.error||'시트 연결에 실패했습니다.');
    if(result.empty){catalogStatus.textContent='시트에 저장된 상품 백업이 없습니다. 먼저 시트에 저장해 주세요.';return;}
    if(action==='load'){
      const before=Object.fromEntries(Object.values(catalogKeys).map(key=>[key,sellerStorage.getItem(key)]));
      try{for(const [field,key]of Object.entries(catalogKeys))sellerStorage.setItem(key,JSON.stringify(result.data[field]));}
      catch(error){for(const [key,value]of Object.entries(before)){if(value===null)sellerStorage.removeItem(key);else sellerStorage.setItem(key,value);}throw Error('브라우저 저장 공간이 부족해 불러오지 못했습니다. 기존 데이터를 유지했습니다.');}
      products=result.data.products;salePages=result.data.salePages;salePageNames=result.data.salePageNames;storeSettings=result.data.storeSettings;
      activeSaleDate=Object.hasOwn(salePages,selectedDate)?selectedDate:Object.hasOwn(salePages,activeSaleDate)?activeSaleDate:Object.keys(salePages).sort().reverse()[0]||activeSaleDate;
      cart=[];applyStoreSettings();for(const [key,value]of Object.entries(storeSettings)){const field=document.querySelector('#storeForm').elements.namedItem(key);if(field)field.value=value;}
      refreshSelect();loadEditor();drawProducts();drawCart();renderSaleEditor();refreshSavedSalePages();catalogStatus.textContent='구글 시트에서 주문서를 불러왔습니다. · '+activeSaleDate;return true;
    }
    if(result.publishError||!result.published){catalogStatus.textContent='시트에는 저장됐지만 고객 화면 반영을 완료하지 못했습니다. '+(result.publishError||'공개 반영 결과를 확인할 수 없습니다.');return false;}
    catalogStatus.textContent='저장 및 고객 화면 반영 완료 · '+new Date(result.savedAt).toLocaleString('ko-KR');
    if(result.published){const link=document.querySelector('#customerViewLink');const target=new URL(result.published.url);target.searchParams.set('date',activeSaleDate);link.href=target.href;link.hidden=false;}
    return true;
  }catch(error){catalogStatus.textContent=error.message;return false;}finally{catalogBusy=false;controls.forEach((control,index)=>control.disabled=states[index]);saveCatalogButton.disabled=loadCatalogButton.disabled=false;}
}
const retryProductPublish=document.createElement('button');retryProductPublish.type='button';retryProductPublish.textContent='고객 화면 반영 다시 시도';retryProductPublish.hidden=true;document.querySelector('#adminMessage').after(retryProductPublish);
async function publishSavedProduct(){
  retryProductPublish.hidden=true;message('상품을 구글 시트에 저장하고 고객 화면에 반영 중…');
  const success=await runCatalog('save',{fromProduct:true});
  message(success?'상품 저장 및 고객 화면 반영 완료. 열려 있는 고객 화면은 새로고침해 주세요.':'상품은 이 브라우저에 보관되었습니다. 고객 화면 반영 미완료: '+catalogStatus.textContent);
  retryProductPublish.hidden=success;return success;
}
retryProductPublish.onclick=publishSavedProduct;
saveCatalogButton.onclick=()=>runCatalog('save');loadCatalogButton.onclick=()=>runCatalog('load');
async function refreshSheetSaleList(){
 if(catalogBusy)return;loadCatalogButton.disabled=true;
 try{const login=await (await fetch('/api/google/status')).json();if(!login.authenticated||!login.sheetUrl)throw Error('설정 메뉴에서 구글 시트를 연결해 주세요.');const response=await fetch('/api/catalog/load',{method:'POST',headers:{'X-CSRF-Token':login.csrf}});const result=await response.json();if(!response.ok)throw Error(result.error||'목록 조회 실패');if(result.empty){catalogStatus.textContent='시트에 저장된 주문서가 없습니다. 현재 편집 내용은 유지됩니다.';return;}
  savedSaleSelect.replaceChildren(new Option('시트의 주문서 선택',''));for(const date of Object.keys(result.data.salePages).sort().reverse())savedSaleSelect.add(new Option(date+' · '+(result.data.salePageNames[date]||'라이브 주문서')+' · '+result.data.salePages[date].length+'개 상품',date));
  catalogStatus.textContent='시트의 최신 목록입니다. 날짜를 선택하고 주문서 불러오기를 누르세요. 편집 내용은 아직 바뀌지 않았습니다.';
 }catch(error){catalogStatus.textContent=error.message;}finally{loadCatalogButton.disabled=false;}
}
loadCatalogButton.textContent='시트의 주문서 목록 새로고침';loadCatalogButton.onclick=refreshSheetSaleList;
document.querySelector('#loadSalePage').onclick=()=>{const date=savedSaleSelect.value;if(!date){catalogStatus.textContent='불러올 날짜를 선택해 주세요.';return;}return runCatalog('load',{selectedDate:date});};
window.refreshSheetSaleList=refreshSheetSaleList;
window.startOrderSyncRecovery=()=>{
 let running=false;
 async function recover(){if(running||document.hidden)return;running=true;const status=document.querySelector('#orderSheetStatus');
  try{const r=await fetch('/api/google/status');if(!r.ok)return;const login=await r.json();if(!login.authenticated||!login.sheetUrl||login.approvalStatus!=='approved')return;
   const response=await fetch('/api/orders/sync',{method:'POST',headers:{'X-CSRF-Token':login.csrf}});const result=await response.json();if(!response.ok)throw Error(result.error||'구글 시트 연결 확인 필요');
   status.textContent=result.pending?'시트 기록 처리 중입니다. 2분 후 다시 확인합니다.':'시트 기록 확인 완료 · '+new Date().toLocaleTimeString('ko-KR');
  }catch(error){status.textContent='시트 기록 미완료: '+error.message+' 이 화면을 열어 두면 2분마다 재시도합니다. 주문 기록은 서버에 보관됩니다.';}finally{running=false;}
 }
 recover();setInterval(recover,120000);
};
async function cancelCustomerOrder(order,button){
  if(!confirm(order.buyer.name+'님의 테스트 주문을 취소할까요? 주문번호: '+order.id+'\n해당 수량의 재고가 복구됩니다. 실제 환불은 발생하지 않습니다.'))return;
  const status=document.querySelector('#orderSheetStatus');button.disabled=true;status.textContent='주문 취소 처리 중…';
  try{const login=await (await fetch('/api/google/status')).json();if(!login.authenticated)throw Error('Google 로그인 후 다시 시도해 주세요.');const response=await fetch('/api/orders/cancel',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':login.csrf},body:JSON.stringify({orderId:order.id})});const result=await response.json();if(!response.ok)throw Error(result.error||'취소 실패');status.textContent='주문 취소 완료 · 재고 복구됨. '+(result.sheetError?'시트 반영 실패: '+result.sheetError+' ‘주문을 구글시트에 기록’으로 다시 시도해 주세요.':'구글시트에도 취소 상태를 기록했습니다.');await document.querySelector('#refreshCustomerOrders').onclick();}catch(error){status.textContent=error.message+' 주문 목록을 새로고침해 상태를 확인하세요.';button.disabled=false;}
}
document.querySelector('#syncOrdersToSheet').onclick=async()=>{
  const button=document.querySelector('#syncOrdersToSheet'),status=document.querySelector('#orderSheetStatus');button.disabled=true;
  try{const login=await (await fetch('/api/google/status')).json();if(!login.authenticated||!login.sheetUrl)throw Error('Google 로그인 후 관리 시트를 연결해 주세요.');status.textContent='주문을 시트에 기록하는 중…';const response=await fetch('/api/orders/sync',{method:'POST',headers:{'X-CSRF-Token':login.csrf}});const result=await response.json();if(!response.ok)throw Error(result.error||'시트 기록 실패');status.textContent='기록 완료 · 새 주문 '+result.added+'건 · 상품 내역 '+result.itemsAdded+'행 · 이미 기록된 주문 '+result.skipped+'건은 유지했습니다.';}catch(error){status.textContent=error.message+' 같은 버튼으로 다시 시도할 수 있습니다.';}finally{button.disabled=false;}
};
document.querySelector('#refreshCustomerOrders').onclick=async()=>{
  const button=document.querySelector('#refreshCustomerOrders'),status=document.querySelector('#customerOrdersStatus'),list=document.querySelector('#customerOrdersList');button.disabled=true;list.replaceChildren();
  try{const login=await (await fetch('/api/google/status')).json();if(!login.authenticated)throw Error('Google 로그인 후 확인해 주세요.');status.textContent='주문 확인 중…';const response=await fetch('/api/orders',{method:'POST',headers:{'X-CSRF-Token':login.csrf}});const result=await response.json();if(!response.ok)throw Error(result.error||'주문 확인 실패');for(const order of result.orders.slice().reverse()){const card=document.createElement('section');card.className='sale-action-group';const heading=document.createElement('h4');heading.textContent=order.buyer.name+' · '+order.total.toLocaleString('ko-KR')+'원';const content=document.createElement('p');content.style.whiteSpace='pre-wrap';content.textContent=(order.status==='cancelled'?'취소':'테스트 접수')+' · '+order.id+'\n'+order.date+' / '+order.buyer.phone+'\n입금자명: '+(order.buyer.depositor||order.buyer.name)+'\n'+order.buyer.address+'\n'+order.items.map(i=>i.name+' '+Object.values(i.options).join('/')+' × '+i.quantity).join('\n');card.append(heading,content);const cancel=document.createElement('button');cancel.type='button';cancel.className='copy';cancel.textContent=order.status==='cancelled'?'취소 완료':'주문 취소';cancel.disabled=order.status==='cancelled';cancel.onclick=()=>cancelCustomerOrder(order,cancel);card.append(cancel);list.append(card);}status.textContent=result.orders.length+'건 · 구글시트에 자동 기록됩니다. 누락된 경우에만 ‘시트 기록 재시도’를 이용하세요.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}
};
