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
Object.assign(storeDefaults,{shippingFee:'0',freeShippingThreshold:'0',shippingMode:'paid',logo:''});
let storeSettings={...storeDefaults};
try{const saved=JSON.parse(sellerStorage.getItem('live-shop-store-settings-v1'));for(const key of Object.keys(storeDefaults))if(typeof saved?.[key]==='string')storeSettings[key]=saved[key];}catch{}
const fieldRoot=document.querySelector('#storeFields');
for(const [key,label] of [...storeFields,['bank','은행명'],['account','계좌번호'],['holder','예금주'],['bankNote','입금 안내문'],['accent','강조·버튼 색상'],['background','배경 색상']]){
  const wrapper=document.createElement('label'),input=document.createElement('input');wrapper.textContent=label;input.name=key;input.value=storeSettings[key];input.maxLength=500;input.type=['accent','background'].includes(key)?'color':'text';if(['title','bank','account','holder','copyLabel','submitLabel'].includes(key))input.required=true;wrapper.append(input);fieldRoot.append(wrapper);
}
const shippingGroup=document.createElement('fieldset');const shippingLegend=document.createElement('legend');shippingLegend.textContent='배송비 설정';shippingGroup.append(shippingLegend);
for(const [key,label]of [['shippingFee','기본 배송비 (원)'],['freeShippingThreshold','무료배송 기준 (원, 0이면 기준 없음)']]){const wrapper=document.createElement('label'),input=document.createElement('input');wrapper.textContent=label;input.type='number';input.name=key;input.min='0';input.max='100000000';input.step='1';input.required=true;input.value=storeSettings[key];wrapper.append(input);shippingGroup.append(wrapper);}
const shippingLabel=document.createElement('label'),shippingSelect=document.createElement('select');shippingLabel.textContent='배송 방식';shippingSelect.name='shippingMode';shippingSelect.add(new Option('기본 배송비 적용','paid'));shippingSelect.add(new Option('항상 무료배송','free'));shippingSelect.value=storeSettings.shippingMode;shippingLabel.append(shippingSelect);shippingGroup.append(shippingLabel);fieldRoot.prepend(shippingGroup);
const logoGroup=document.createElement('fieldset');const logoLegend=document.createElement('legend');logoLegend.textContent='우측 상단 원형 로고';logoGroup.append(logoLegend);
const logoValue=document.createElement('input');logoValue.type='hidden';logoValue.name='logo';logoValue.value=storeSettings.logo;logoGroup.append(logoValue);
const logoPreview=document.createElement('div');logoPreview.className='logo-preview';logoGroup.append(logoPreview);
function drawLogoPreview(){logoPreview.replaceChildren();if(logoValue.value){const img=document.createElement('img');img.src=logoValue.value;img.alt='저장할 로고 미리보기';logoPreview.append(img);}else logoPreview.textContent='로고 없음';}
const logoLabel=document.createElement('label'),logoUpload=document.createElement('input');logoLabel.textContent='로고 사진 선택 · 교체';logoUpload.type='file';logoUpload.accept='image/jpeg,image/png,image/webp';logoLabel.append(logoUpload);logoGroup.append(logoLabel);
const logoRemove=document.createElement('button');logoRemove.type='button';logoRemove.className='copy';logoRemove.textContent='로고 삭제';logoGroup.append(logoRemove);
const logoStatus=document.createElement('p');logoStatus.setAttribute('role','status');logoStatus.textContent='정사각형으로 가운데를 잘라 원형으로 표시합니다. 선택 후 쇼핑몰 설정을 저장해 주세요.';logoGroup.append(logoStatus);fieldRoot.prepend(logoGroup);drawLogoPreview();
let logoBusy=false;
logoRemove.onclick=()=>{if(logoBusy)return;logoValue.value='';logoUpload.value='';drawLogoPreview();logoStatus.textContent='설정을 저장하면 로고가 삭제됩니다.';};
logoUpload.onchange=async()=>{const file=logoUpload.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){logoStatus.textContent='10MB 이하의 JPG·PNG·WebP 사진을 선택해 주세요.';logoUpload.value='';return;}logoBusy=true;const save=document.querySelector('#storeForm button[type=submit]');save.disabled=true;logoRemove.disabled=true;logoStatus.textContent='로고 준비 중…';let bitmap;try{bitmap=await createImageBitmap(file);const side=Math.min(bitmap.width,bitmap.height);const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,256,256);const data=canvas.toDataURL('image/png');if(data.length>150000)throw Error('이미지가 복잡합니다. 더 작은 사진을 선택해 주세요.');logoValue.value=data;drawLogoPreview();logoStatus.textContent='로고가 준비됐습니다. 쇼핑몰 설정 저장 후 고객 화면에 반영해 주세요.';}catch(error){logoStatus.textContent=error.message||'이미지를 읽지 못했습니다.';}finally{bitmap?.close();logoBusy=false;save.disabled=false;logoRemove.disabled=false;logoUpload.value='';}};
function applyStoreSettings(){
  const logo=document.querySelector('#shopLogo');logo.replaceChildren();if(/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(storeSettings.logo||'')){const img=document.createElement('img');img.src=storeSettings.logo;img.alt='쇼핑몰 로고';logo.append(img);}else logo.textContent=Array.from(storeSettings.brand||storeSettings.title||'SHOP')[0];
  for(const [key,label,selector,kind]of storeFields){const el=document.querySelector(selector);if(kind==='placeholder')el.placeholder=storeSettings[key];else if(kind==='textNode')textNode(el).textContent=' '+storeSettings[key]+' ';else el.textContent=storeSettings[key];}
  document.title=storeSettings.title;
  document.querySelector('#transferBox strong').textContent=storeSettings.bank+' '+storeSettings.account;
  document.querySelector('#transferBox small').textContent='예금주: '+storeSettings.holder+' · '+storeSettings.bankNote;
  for(const [key,variable]of [['accent','--accent'],['background','--cream']])if(/^#[0-9a-f]{6}$/i.test(storeSettings[key]))document.documentElement.style.setProperty(variable,storeSettings[key]);
}
document.querySelector('#storeForm').onsubmit=e=>{e.preventDefault();const next=Object.fromEntries(new FormData(e.target));for(const key of Object.keys(next))next[key]=next[key].trim();const status=document.querySelector('#storeStatus');if(['title','bank','account','holder','copyLabel','submitLabel'].some(key=>!next[key])){status.textContent='제목, 계좌 정보와 버튼 문구를 입력해 주세요.';return;}if(!/^[0-9\s-]+$/.test(next.account)){status.textContent='계좌번호는 숫자, 공백, 하이픈으로 입력해 주세요.';return;}try{sellerStorage.setItem('live-shop-store-settings-v1',JSON.stringify(next));storeSettings=next;applyStoreSettings();status.textContent='저장했습니다. 화면에 반영되었으며 새로고침 후에도 유지됩니다.';}catch{status.textContent='설정을 저장하지 못했습니다. 브라우저 저장 공간과 설정을 확인해 주세요.';}};
let copyTimer;
document.querySelector('#copyAccount').onclick=async()=>{const button=document.querySelector('#copyAccount');clearTimeout(copyTimer);try{await navigator.clipboard.writeText(storeSettings.account.replace(/[\s-]/g,''));button.textContent='복사되었습니다';}catch{button.textContent='복사 불가 · 계좌번호를 길게 눌러 복사하세요';}copyTimer=setTimeout(()=>button.textContent=storeSettings.copyLabel,2500);};
applyStoreSettings();
