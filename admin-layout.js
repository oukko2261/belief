import {mountSellerProducts} from './seller-products.js?v=c0ad4accb4eb6583';
export function organizeAdmin(){
 const panel=document.querySelector('#adminPanel');
 const nav=document.createElement('nav');nav.setAttribute('aria-label','판매자 관리 메뉴');nav.className='seller-menu';
 const areas=[];
 function area(name,nodes){const section=document.createElement('section');section.className='seller-area';section.setAttribute('aria-label',name);for(const node of nodes)if(node)section.append(node);areas.push(section);const button=document.createElement('button');button.type='button';button.textContent=name;button.onclick=()=>{areas.forEach(a=>a.hidden=a!==section);for(const b of nav.children)b.setAttribute('aria-current',b===button?'page':'false');};nav.append(button);return section;}
 const q=s=>document.querySelector(s);
 const productSelect=q('#productSelect'),productForm=q('#productForm');
 const dates=area('주문서',[q('#dateManager')]);
 const productList=document.createElement('section');
 const product=area('상품',[productList,q('#productSelect').closest('label'),q('#productForm')]);
 const orders=area('주문',[q('#customerOrdersPanel')]);
 const settings=area('설정',[q('#storeEditor'),q('#sheetConnect'),q('#sheetSettings')]);
 const approval=q('#sellerApprovalPanel');if(approval)area('판매자 승인',[approval]);
 panel.replaceChildren(nav,...areas);nav.firstChild.click();
 mountSellerProducts(productList,window.getSellerCatalogState,{select:productSelect,form:productForm});
 q('#productSelect').closest('label').hidden=true;
 window.refreshSheetSaleList?.();
 q('#customerOrdersPanel').open=true;q('#storeEditor').open=false;q('#sheetSettings').hidden=true;q('#sheetConnect').setAttribute('aria-expanded','false');
 q('#syncOrdersToSheet').textContent='시트 기록 재시도';q('#orderSheetStatus').textContent='주문은 자동 기록됩니다. 시트에 누락된 경우에만 재시도하세요.';
 window.startOrderSyncRecovery?.();
 q('#storeEditor summary').textContent='쇼핑몰 설정';
 q('#saveProduct').textContent='상품 저장 · 고객 화면 반영';
 // Keep the old demo nodes available to existing renderers, but never present a second checkout to sellers.
 document.body.classList.add('seller-workspace');
 for(const selector of ['header .eyebrow','header h1','header .intro','.notice']){const node=q(selector);node.contentEditable='false';node.classList.remove('editable-copy');node.removeAttribute('role');}
 const style=document.createElement('style');style.textContent=`
 .seller-workspace #inlineCopyControls,.seller-workspace #adminToggle,.seller-workspace main>.notice,.seller-workspace #products,.seller-workspace #cartFeedback,.seller-workspace #order,.seller-workspace #mobileCartBar{display:none!important}
 .seller-workspace header{padding:24px 20px}.seller-workspace header .intro,.seller-workspace header #saleDateHeading{display:none}
 .seller-menu{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}.seller-menu button{flex:1;min-height:44px;font:inherit;border:1px solid #ddd;border-radius:8px;padding:10px;background:white;cursor:pointer}.seller-menu button[aria-current=page]{background:#222;color:white}.seller-area[hidden]{display:none}.seller-area>details{margin-top:0}
 .seller-product-row{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #ddd}.seller-product-row p{margin:6px 0;font-size:14px;overflow-wrap:anywhere}.seller-product-photo{width:64px;height:64px;background:#f3f3f3;display:grid;place-items:center;font-size:12px;border-radius:8px;overflow:hidden}.seller-product-photo img{width:100%;height:100%;object-fit:cover}.seller-product-row button{min-height:44px;padding:8px 12px}.seller-product-list{margin-bottom:16px}
 `;document.head.append(style);
}
