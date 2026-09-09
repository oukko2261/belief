const backend='https://live-order-mobile-test.wooks88.chatgpt.site';
const query=new URL(location.href).searchParams;
if(query.has('shop')){
 const shop=query.get('shop');document.body.replaceChildren();
 if(!/^[a-f0-9]{64}$/.test(shop)){document.body.textContent='주문서 주소를 확인해 주세요.';}
 else{const frame=document.createElement('iframe');const target=new URL(backend+'/shop/'+shop);if(query.has('date'))target.searchParams.set('date',query.get('date'));frame.src=target.href;frame.title='고객 주문서';frame.style.cssText='border:0;width:100%;height:100dvh;display:block';document.body.style.cssText='margin:0;padding:0';document.body.append(frame);}
}else{
 const fragment=new URLSearchParams(location.hash.slice(1));if(fragment.has('session')){sessionStorage.setItem('belief-session',fragment.get('session'));history.replaceState(null,'',location.pathname);}
 const nativeFetch=window.fetch.bind(window);
 window.fetch=(input,options={})=>{if(typeof input==='string'&&input.startsWith('/api/')){const headers=new Headers(options.headers);const token=sessionStorage.getItem('belief-session');if(token)headers.set('Authorization','Bearer '+token);return nativeFetch(backend+input,{...options,headers});}return nativeFetch(input,options);};
 const originalDisplay=document.body.style.display;document.body.style.display='none';
 try{
  const response=await fetch('/api/google/status');if(!response.ok)throw Error('로그인 서버에 연결하지 못했습니다.');const login=await response.json();
if(!login.authenticated){document.body.replaceChildren();const area=document.createElement('main');area.style.cssText='padding:48px 24px';const title=document.createElement('h1');title.textContent='판매자 로그인';const note=document.createElement('p');note.textContent='본인 Google 시트로 상품과 주문을 관리합니다.';const link=document.createElement('a');link.href=backend+'/auth/google';link.textContent='Google로 로그인';area.append(title,note,link);if(query.has('google')){const error=document.createElement('p');error.textContent='Google 연결을 완료하지 못했습니다. 허용 주소와 테스트 사용자 등록을 확인한 후 다시 로그인해 주세요.';area.append(error);}document.body.append(area);}
  else if(login.approvalStatus!=='approved'){
   document.body.replaceChildren();const area=document.createElement('main');area.style.cssText='padding:48px 24px';const h=document.createElement('h1');h.textContent=({rejected:'판매자 가입이 거절되었습니다',suspended:'판매자 이용이 중지되었습니다'})[login.approvalStatus]||'판매자 승인 대기';const p=document.createElement('p');p.textContent=login.email+' · 관리자 승인 후 이용할 수 있습니다.';const refresh=document.createElement('button');refresh.textContent='승인 상태 확인';refresh.onclick=()=>location.reload();const logout=document.createElement('button');logout.textContent='로그아웃';logout.onclick=async()=>{await fetch('/api/google/logout',{method:'POST',headers:{'X-CSRF-Token':login.csrf}});sessionStorage.removeItem('belief-session');location.reload();};area.append(h,p,refresh,logout);document.body.append(area);
  }
  else{
   const prefix='belief-seller-'+login.sellerId+':';window.sellerStorage={getItem:key=>localStorage.getItem(prefix+key),setItem:(key,value)=>localStorage.setItem(prefix+key,value),removeItem:key=>localStorage.removeItem(prefix+key)};
const customerQuickView=document.querySelector('#customerQuickView');const updateCustomerQuickView=()=>{if(!customerQuickView)return;const customerUrl=new URL('https://oukko2261.github.io/belief/');customerUrl.searchParams.set('shop',login.sellerId);const date=document.querySelector('#saleDate')?.value;if(/^\\d{4}-\\d{2}-\\d{2}$/.test(date||''))customerUrl.searchParams.set('date',date);customerQuickView.href=customerUrl.href;customerQuickView.textContent=date?'고객 화면 보기 · '+date:'고객 화면 보기';customerQuickView.hidden=false;};updateCustomerQuickView();
   const keys={products:'live-shop-products-v1',salePages:'live-shop-sale-pages-v1',salePageNames:'live-shop-sale-names-v1',storeSettings:'live-shop-store-settings-v1'};
   if(sellerStorage.getItem(keys.products)===null){let data={products:[],salePages:{},salePageNames:{},storeSettings:{}};if(login.sheetUrl){const r=await fetch('/api/catalog/load',{method:'POST',headers:{'X-CSRF-Token':login.csrf}});const saved=await r.json();if(!r.ok)throw Error(saved.error||'시트에서 불러오지 못했습니다.');if(!saved.empty)data=saved.data;}for(const [key,path]of Object.entries(keys))sellerStorage.setItem(path,JSON.stringify(data[key]));}
   for(const src of ['app.js','google-connect.js','store-settings.js','sale-pages.js','sale-pdf.js','inline-copy.js','live-order.js','product-options.js','catalog-sync.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./'+src+'?v=customer-view-fixed-1';script.onload=resolve;script.onerror=reject;document.body.append(script);});
   document.querySelector('#adminToggle').click();
   document.querySelector('#saleDate')?.addEventListener('change',updateCustomerQuickView);document.querySelector('#loadSalePage')?.addEventListener('click',()=>setTimeout(updateCustomerQuickView));document.querySelector('#saveCatalog')?.addEventListener('click',()=>setTimeout(updateCustomerQuickView));
   if(login.isApprovalAdmin){const {showApprovals}=await import('./approval-ui.js?v=customer-view-fixed-1');showApprovals(login);}
   const {organizeAdmin}=await import('./admin-layout.js?v=customer-view-fixed-1');organizeAdmin();
  }
 }catch(error){document.body.replaceChildren();const p=document.createElement('p');p.textContent=error.message||'관리자 화면을 열지 못했습니다. 새로고침해 주세요.';document.body.append(p);}finally{document.body.style.display=originalDisplay;}
}
