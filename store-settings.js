// Copy is applied as text, never interpreted as HTML. Test-state notices stay visible.
const storeFields=[
  ['brand','상단 영문·브랜드명','header .eyebrow'],
  ['title','주문서 제목','header h1'],
  ['intro','상단 설명','header .intro'],
  ['notice','판매 안내문','.notice'],
  ['orderBrand','주문 영역 영문 제목','#order .eyebrow'],
  ['orderTitle','주문 영역 제목','#order h2'],
  ['totalLabel','합계 제목','.total span'],
  ['nameLabel','주문자 항목 이름','#orderForm label:has([name="name"])','textNode'],
  ['nameHint','주문자 입력 안내','[name="name"]','placeholder'],
  ['phoneLabel','연락처 항목 이름','#orderForm label:has([name="phone"])','textNode'],
  ['phoneHint','연락처 입력 안내','[name="phone"]','placeholder'],
  ['addressLabel','배송지 항목 이름','#orderForm label:has([name="address"])','textNode'],
  ['addressHint','배송지 입력 안내','[name="address"]','placeholder'],
  ['paymentTitle','결제 영역 제목','#orderForm legend'],
  ['transferLabel','무통장입금 선택 문구','#orderForm label:has([value="transfer"])','textNode'],
  ['cardLabel','카드결제 선택 문구','#orderForm label:has([value="card"])','textNode'],
  ['bankTitle','입금 안내 제목','#transferBox p'],
  ['copyLabel','계좌 복사 버튼','#copyAccount'],
  ['submitLabel','주문 버튼','#orderForm > button.submit'],
  ['successTitle','주문 접수 안내 제목','#success h2'],
  ['closeLabel','접수 안내 확인 버튼','#success .close-success'],
];
const textNode=el=>[...el.childNodes].find(n=>n.nodeType===3&&n.textContent.trim())||[...el.childNodes].find(n=>n.nodeType===3);
const storeDefaults=Object.fromEntries(storeFields.map(([key,label,selector,kind])=>{const el=document.querySelector(selector);return [key,kind==='placeholder'?el.placeholder:kind==='textNode'?textNode(el).textContent.trim():el.textContent.trim()];}));
Object.assign(storeDefaults,{bank:'국민은행',account:'123456-78-901234',holder:'라이브샵',bankNote:'입금자명은 주문자명과 같게 입력해 주세요.',accent:'#e84d2a',background:'#fffaf2'});
let storeSettings={...storeDefaults};
try{const saved=JSON.parse(localStorage.getItem('live-shop-store-settings-v1'));for(const key of Object.keys(storeDefaults))if(typeof saved?.[key]==='string')storeSettings[key]=saved[key];}catch{}
const fieldRoot=document.querySelector('#storeFields');
for(const [key,label] of [...storeFields,['bank','은행명'],['account','계좌번호'],['holder','예금주'],['bankNote','입금 안내문'],['accent','강조·버튼 색상'],['background','배경 색상']]){
  const wrapper=document.createElement('label'),input=document.createElement('input');wrapper.textContent=label;input.name=key;input.value=storeSettings[key];input.maxLength=500;input.type=['accent','background'].includes(key)?'color':'text';if(['title','bank','account','holder','copyLabel','submitLabel'].includes(key))input.required=true;wrapper.append(input);fieldRoot.append(wrapper);
}
function applyStoreSettings(){
  for(const [key,label,selector,kind]of storeFields){const el=document.querySelector(selector);if(kind==='placeholder')el.placeholder=storeSettings[key];else if(kind==='textNode')textNode(el).textContent=' '+storeSettings[key]+' ';else el.textContent=storeSettings[key];}
  document.title=storeSettings.title;
  document.querySelector('#transferBox strong').textContent=storeSettings.bank+' '+storeSettings.account;
  document.querySelector('#transferBox small').textContent='예금주: '+storeSettings.holder+' · '+storeSettings.bankNote;
  for(const [key,variable]of [['accent','--accent'],['background','--cream']])if(/^#[0-9a-f]{6}$/i.test(storeSettings[key]))document.documentElement.style.setProperty(variable,storeSettings[key]);
}
document.querySelector('#storeForm').onsubmit=e=>{e.preventDefault();const next=Object.fromEntries(new FormData(e.target));for(const key of Object.keys(next))next[key]=next[key].trim();const status=document.querySelector('#storeStatus');if(['title','bank','account','holder','copyLabel','submitLabel'].some(key=>!next[key])){status.textContent='제목, 계좌 정보와 버튼 문구를 입력해 주세요.';return;}if(!/^[0-9\s-]+$/.test(next.account)){status.textContent='계좌번호는 숫자, 공백, 하이픈으로 입력해 주세요.';return;}try{localStorage.setItem('live-shop-store-settings-v1',JSON.stringify(next));storeSettings=next;applyStoreSettings();status.textContent='저장했습니다. 화면에 반영되었으며 새로고침 후에도 유지됩니다.';}catch{status.textContent='설정을 저장하지 못했습니다. 브라우저 저장 공간과 설정을 확인해 주세요.';}};
let copyTimer;
document.querySelector('#copyAccount').onclick=async()=>{const button=document.querySelector('#copyAccount');clearTimeout(copyTimer);try{await navigator.clipboard.writeText(storeSettings.account.replace(/[\s-]/g,''));button.textContent='복사되었습니다';}catch{button.textContent='복사 불가 · 계좌번호를 길게 눌러 복사하세요';}copyTimer=setTimeout(()=>button.textContent=storeSettings.copyLabel,2500);};
applyStoreSettings();
