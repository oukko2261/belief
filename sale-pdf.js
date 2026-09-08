document.querySelector('#exportSalePdf').onclick=()=>{
  const date=document.querySelector('#savedSalePages').value;
  const status=document.querySelector('#saleDateStatus');
  if(!date||!Array.isArray(salePages[date])){status.textContent='먼저 저장된 주문서를 목록에서 선택해 주세요.';return;}
  const popup=window.open('','_blank');
  if(!popup){status.textContent='팝업이 차단되었습니다. 팝업을 허용한 후 다시 눌러 주세요.';return;}
  popup.opener=null;
  const doc=popup.document;
  const title=`${date} ${salePageNames[date]||storeSettings.title}`;
  doc.title=title;
  doc.documentElement.lang='ko';
  const viewport=doc.createElement('meta');viewport.name='viewport';viewport.content='width=device-width, initial-scale=1';doc.head.append(viewport);
  const style=doc.createElement('style');style.textContent=`
    @page{size:A4;margin:16mm}*{box-sizing:border-box}body{font:15px/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#202020;margin:0 auto;padding:24px;max-width:820px;background:white;overflow-wrap:anywhere}
    h1{font-size:26px;line-height:1.4;margin:8px 0}h2{font-size:18px;margin:0 0 8px}p{white-space:pre-wrap;margin:8px 0}.meta{color:#555}.toolbar{background:#f1f3f5;padding:16px;border-radius:10px;margin-bottom:24px}button{padding:12px 20px;font-size:16px;cursor:pointer}article{border-top:1px solid #ccc;padding:18px 0;break-inside:avoid;display:flow-root}article img{float:left;width:115px;height:115px;object-fit:contain;margin:0 18px 12px 0}section{margin-top:24px;padding-top:16px;border-top:2px solid #333;break-inside:avoid}.description{font-size:14px}.foot{font-size:12px;color:#666}@media print{body{padding:0;max-width:none}.toolbar{display:none}article{break-inside:auto}article h2{break-after:avoid}img{break-inside:avoid}}
  `;doc.head.append(style);
  const el=(tag,text,parent=doc.body)=>{const node=doc.createElement(tag);if(text!==undefined)node.textContent=text;parent.append(node);return node;};
  const toolbar=el('div');toolbar.className='toolbar';
  const print=el('button','인쇄 / PDF로 저장',toolbar);print.disabled=true;
  const hint=el('p','사진을 준비하고 있습니다…',toolbar);
  el('p',storeSettings.brand);el('h1',title);el('p',`판매일: ${date}`).className='meta';
  el('p',storeSettings.intro);el('p',storeSettings.notice);
  const selected=salePages[date].map(id=>products.find(p=>p.id===id));
  if(!selected.length)el('p','등록된 상품이 없습니다.');
  selected.forEach((p,index)=>{
    const row=el('article');
    if(!p){el('p',`${index+1}. 삭제되어 확인할 수 없는 상품`,row);return;}
    if(p.photos?.length){const image=el('img',undefined,row);image.src=p.photos[0];image.alt=p.name;}
    el('h2',`${index+1}. ${p.name}`,row);
    el('p',`${won(p.price)} · 재고 ${p.stock}개${p.visible?'':' · 현재 숨김'}`,row);
    el('p',p.detail||'',row).className='description';
  });
  const bank=el('section');el('h2',storeSettings.bankTitle,bank);el('p',`${storeSettings.bank} ${storeSettings.account}`,bank);el('p',`예금주: ${storeSettings.holder}`,bank);el('p',storeSettings.bankNote,bank);
  el('p','날짜별 판매 상품 안내용 테스트 주문서입니다. 실제 구매 주문이나 결제 영수증이 아닙니다.').className='foot';
  el('p','가격·재고·사진은 PDF를 만든 시점의 저장된 상품 정보입니다.').className='foot';
  print.onclick=()=>popup.print();
  const photos=[...doc.images].map(img=>img.decode().catch(()=>{img.remove();}));
  Promise.all(photos).then(()=>{if(popup.closed)return;print.disabled=false;hint.textContent='컴퓨터·Android: 인쇄 대상에서 PDF로 저장을 선택하세요. iPhone: 인쇄 미리보기를 확대하고 공유 → 파일에 저장을 선택하세요.';});
  status.textContent=`${date} 주문서의 PDF 저장 화면을 열었습니다.`;
};
