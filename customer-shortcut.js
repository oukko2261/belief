export function addCustomerShortcut(sellerId){
 if(!/^[a-f0-9]{64}$/.test(sellerId||''))return;
 const panel=document.querySelector('#adminPanel');if(!panel||document.querySelector('#customerShortcut'))return;
 const bar=document.createElement('div');bar.id='customerShortcut';bar.style.cssText='display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:20px';
 const link=document.createElement('a');link.textContent='고객 화면 보기';link.target='_blank';link.rel='noopener noreferrer';link.style.cssText='display:inline-block;padding:12px 16px;border:1px solid #bbb;border-radius:8px;background:white;color:#222;font-weight:700';
 const dateText=document.createElement('span');dateText.style.fontSize='14px';
 function update(){const date=document.querySelector('#saleDate')?.value;const url=new URL('https://oukko2261.github.io/belief/');url.searchParams.set('shop',sellerId);if(/^\d{4}-\d{2}-\d{2}$/.test(date||''))url.searchParams.set('date',date);link.href=url.href;dateText.textContent=date?date+' · 마지막으로 공개 반영된 주문서':'';}
 bar.append(link,dateText);panel.prepend(bar);update();
 document.querySelector('#saleDate')?.addEventListener('change',update);
 const heading=document.querySelector('#saleDateHeading');if(heading)new MutationObserver(update).observe(heading,{childList:true,characterData:true,subtree:true});
}
