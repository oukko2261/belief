let googleSession=null;
const googleStatus=document.querySelector('#googleStatus');
const googleLogin=document.querySelector('#googleLogin');
const googleCreate=document.querySelector('#googleCreateSheet');
const googleLogout=document.querySelector('#googleLogout');
const googleLink=document.querySelector('#googleSheetLink');
async function loadGoogleStatus(){
  if(location.protocol==='file:'){
    googleStatus.textContent='Google 로그인은 파일 미리보기에서 실행할 수 없습니다. 연결용 미리보기(http://localhost:4180)를 열어 주세요.';
    googleLogin.disabled=true;return;
  }
  try{
    const response=await fetch('/api/google/status');if(!response.ok)throw Error();
    googleSession=await response.json();
    googleLogin.disabled=!googleSession.configured;
    googleLogin.hidden=googleSession.authenticated;
    googleCreate.hidden=!googleSession.authenticated||Boolean(googleSession.sheetUrl);
    googleLogout.hidden=!googleSession.authenticated;
    googleLink.hidden=!googleSession.sheetUrl;
    if(googleSession.sheetUrl)googleLink.href=googleSession.sheetUrl;
    googleStatus.textContent=!googleSession.configured?'최초 Google 앱 설정이 필요합니다. 클라이언트 ID·보안 비밀번호·관리자 이메일 설정 후 로그인할 수 있습니다.':googleSession.authenticated?`${googleSession.email} 로그인됨 · ${googleSession.sheetUrl?'시트 생성됨 · 상품/주문 동기화 미연결':'관리 시트를 만들어 주세요.'}`:'Google 계정으로 로그인해 주세요.';
  }catch{googleLogin.disabled=true;googleStatus.textContent='이 테스트 페이지는 상품·사진·날짜별 주문서 체험용입니다. Google 로그인과 시트 자동 동기화는 아직 연결 전입니다.';}
}
googleLogin.onclick=()=>location.assign('/auth/google');
async function googleAction(path){
  const response=await fetch(path,{method:'POST',headers:{'X-CSRF-Token':googleSession?.csrf||''}});
  const result=await response.json();if(!response.ok)throw Error(result.error||'연결에 실패했습니다.');
  await loadGoogleStatus();return result;
}
googleCreate.onclick=async()=>{googleCreate.disabled=true;googleStatus.textContent='관리 시트를 만들고 있습니다…';try{await googleAction('/api/google/create-sheet');}catch(error){googleStatus.textContent=error.message+' 생성 결과가 불확실하면 Google Drive에서 먼저 확인해 주세요.';}finally{googleCreate.disabled=false;}};
googleLogout.onclick=async()=>{try{await googleAction('/api/google/logout');}catch(error){googleStatus.textContent=error.message;}};
loadGoogleStatus().then(()=>{
  const result=new URL(location.href).searchParams.get('google');
  if(result){document.querySelector('#adminPanel').hidden=false;document.querySelector('#adminToggle').setAttribute('aria-expanded','true');document.querySelector('#sheetSettings').hidden=false;document.querySelector('#sheetConnect').setAttribute('aria-expanded','true');
    const errors={cancelled:'Google 권한 승인이 취소되었습니다.',denied:'지정된 관리자 Google 계정으로 로그인해 주세요.',invalid:'로그인 요청이 만료되었습니다. 다시 로그인해 주세요.',failed:'Google 로그인에 실패했습니다. 앱 설정을 확인하고 다시 시도해 주세요.'};
    if(errors[result])googleStatus.textContent=errors[result];
    const url=new URL(location.href);url.searchParams.delete('google');history.replaceState(null,'',url);
  }
});
