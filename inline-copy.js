const inlineCopyFields=[['brand','header .eyebrow'],['title','header h1'],['intro','header .intro'],['notice','.notice']];
const inlineControls=document.querySelector('#inlineCopyControls');
function updateInlineMode(){
  const enabled=document.querySelector('#adminToggle').getAttribute('aria-expanded')==='true';
  inlineControls.hidden=!enabled;
  for(const [key,selector]of inlineCopyFields){const node=document.querySelector(selector);node.contentEditable=String(enabled);node.classList.toggle('editable-copy',enabled);if(enabled){node.setAttribute('role','textbox');node.setAttribute('aria-label',`${key==='title'?'주문서 제목':key==='brand'?'브랜드명':key==='notice'?'특가 안내문':'상단 설명'} 수정`);}else{node.removeAttribute('role');node.removeAttribute('aria-label');}}
}
for(const [key,selector]of inlineCopyFields){
  const node=document.querySelector(selector);
  node.addEventListener('paste',e=>{if(!node.isContentEditable)return;e.preventDefault();const text=e.clipboardData.getData('text/plain');const selection=window.getSelection();if(selection.rangeCount){const range=selection.getRangeAt(0);range.deleteContents();const t=document.createTextNode(text);range.insertNode(t);range.setStartAfter(t);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}});
  node.addEventListener('input',()=>{document.querySelector('#inlineCopyStatus').textContent='수정 후 상단 문구 저장을 눌러 주세요.';});
}
document.querySelector('#saveInlineCopy').onclick=()=>{
  const next={...storeSettings};for(const [key,selector]of inlineCopyFields)next[key]=document.querySelector(selector).textContent.trim();
  const status=document.querySelector('#inlineCopyStatus');
  if(!next.title){status.textContent='주문서 제목을 입력해 주세요.';return;}
  if(inlineCopyFields.some(([key])=>next[key].length>500)){status.textContent='각 문구는 500자 이하로 입력해 주세요.';return;}
  try{localStorage.setItem('live-shop-store-settings-v1',JSON.stringify(next));storeSettings=next;applyStoreSettings();for(const [key]of inlineCopyFields)document.querySelector('#storeForm').elements.namedItem(key).value=next[key];status.textContent='저장했습니다. 현재 브라우저에 적용됩니다.';}catch{status.textContent='저장하지 못했습니다. 브라우저 저장 설정을 확인해 주세요.';}
};
new MutationObserver(updateInlineMode).observe(document.querySelector('#adminToggle'),{attributes:true,attributeFilter:['aria-expanded']});
updateInlineMode();
