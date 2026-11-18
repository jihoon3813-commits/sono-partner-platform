
const products=[{name:'마음든든 3',month:32000,total:3072000,cnt:96},{name:'마음든든 4',month:43000,total:4128000,cnt:96},{name:'마음든든 5',month:54000,total:5184000,cnt:96}];
const stepNames=['상품 선택','가입자 정보','결제 정보','약관·서명','계약서 확인'];let step=1,chosen=0,pay='cms',gender='',payDate='',consent='',signatureEmpty=true;
const won=n=>new Intl.NumberFormat('ko-KR').format(n)+'원';const $=id=>document.getElementById(id);
$('products').innerHTML=products.map((p,i)=>`<button class="product ${i===0?'selected':''}" data-product="${i}"><span class="radio"></span><span class="prod-main"><span class="prod-row"><span class="prod-name">${p.name}</span><span class="price">${won(p.month)}<small style="font-size:10px;color:#758078;font-weight:600"> / 월</small></span></span><span class="prod-sub">${p.cnt}회 납입 · 총 ${won(p.total)}</span></span></button>`).join('');
$('products').addEventListener('click',e=>{let b=e.target.closest('[data-product]');if(!b)return;chosen=Number(b.dataset.product);document.querySelectorAll('.product').forEach(x=>x.classList.toggle('selected',x===b));updateSummary()});
function updateSummary(){let p=products[chosen];$('summaryName').textContent=p.name;$('summaryPrice').textContent='월 '+won(p.month);$('summaryPrice').parentElement.innerHTML=`<strong id="summaryPrice">월 ${won(p.month)}</strong><br>${p.cnt}회 납입 · 총 ${won(p.total)}`}
$('dates').innerHTML=[5,10,15,20,25].map(x=>`<button class="gender date-choice" data-date="${x}">${x}일</button>`).join('');
$('dates').addEventListener('click',e=>{let b=e.target.closest('[data-date]');if(!b)return;payDate=b.dataset.date;document.querySelectorAll('.date-choice').forEach(x=>x.classList.toggle('selected',x===b))});
document.querySelectorAll('.gender[data-gender]').forEach(b=>b.onclick=()=>{gender=b.dataset.gender;document.querySelectorAll('.gender[data-gender]').forEach(x=>x.classList.toggle('selected',x===b))});
document.querySelectorAll('.pay-card').forEach(b=>b.onclick=()=>{pay=b.dataset.pay;document.querySelectorAll('.pay-card').forEach(x=>x.classList.toggle('selected',x===b));$('cmsFields').classList.toggle('hidden',pay!=='cms');$('cardFields').classList.toggle('hidden',pay!=='card');$('paymentSubtitle').textContent=pay==='cms'?'등록한 계좌에서 매월 자동 출금됩니다.':'본인 명의의 신용·체크카드를 등록해 주세요.'});
document.querySelectorAll('[data-consent]').forEach(b=>b.onclick=()=>{consent=b.dataset.consent;document.querySelectorAll('[data-consent]').forEach(x=>x.classList.toggle('on',x===b));$('consentError').style.display=consent==='disagree'?'block':'none'});
for(let m=1;m<=12;m++)$('cardMonth').insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${String(m).padStart(2,'0')}월</option>`);for(let y=2026;y<=2042;y++)$('cardYear').insertAdjacentHTML('beforeend',`<option value="${y}">${y}년</option>`);
$('cardNumber').addEventListener('input',e=>{let v=e.target.value.replace(/\D/g,'').slice(0,16);e.target.value=v.replace(/(.{4})/g,'$1 ').trim()});$('phone').addEventListener('input',formatPhone);$('agentPhone').addEventListener('input',formatPhone);function formatPhone(e){let v=e.target.value.replace(/\D/g,'').slice(0,11);if(v.length>7)v=v.slice(0,3)+'-'+v.slice(3,7)+'-'+v.slice(7);else if(v.length>3)v=v.slice(0,3)+'-'+v.slice(3);e.target.value=v}

function koreaToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map(({type,value}) => [type,value]));
  return date.year + date.month + date.day;
}
function birthAge(value, today = koreaToday()) {
  if (!/^[0-9]{8}$/.test(value) || value > today) return null;
  const year = Number(value.slice(0,4)), month = Number(value.slice(4,6)), day = Number(value.slice(6));
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year,month,0)).getUTCDate()) return null;
  return Number(today.slice(0,4)) - year - Number(today.slice(4) < value.slice(4));
}
function updateBirth(id, reportIncomplete = false) {
  const input = $(id), designated = id === 'beneficiaryBirth';
  const output = $(designated ? 'ageFlag' : 'birthMessage');
  const age = birthAge(input.value);
  const tooOld = designated && age !== null && age > 80;
  let error = '';
  if (input.value.length !== 8) error = '생년월일을 숫자 8자리로 입력해 주세요.';
  else if (age === null) error = '오늘까지의 실제 날짜를 연월일 순서로 입력해 주세요.';
  else if (tooOld) error = '만 ' + age + '세 · 만 80세를 초과해 지정할 수 없습니다.';
  input.setCustomValidity(error);
  const showError = error && (reportIncomplete || input.value.length === 8);
  input.setAttribute('aria-invalid', String(Boolean(showError)));
  output.dataset.valid = String(!error);
  output.textContent = showError ? error : designated && !error ? '만 ' + age + '세 · 지정 가능합니다.' : '';
  if (designated && step === 2) $('nextBtn').disabled = tooOld;
  return !error;
}
for (const id of ['birth','beneficiaryBirth']) {
  const input = $(id);
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g,'').slice(0,8);
    updateBirth(id);
  });
  input.addEventListener('blur', () => updateBirth(id, Boolean(input.value)));
}
$('postcode').addEventListener('input', event => {
  event.target.value = event.target.value.replace(/\D/g,'').slice(0,5);
});

const addressDialog = $('addressDialog');
let sdkRequest;
function loadAddressSearch() {
  if (window.kakao?.Postcode) return Promise.resolve();
  if (sdkRequest) return sdkRequest;
  sdkRequest = new Promise((resolve,reject) => {
    const script = document.createElement('script');
    const fail = () => { clearTimeout(timer); script.remove(); sdkRequest = null; reject(new Error('postcode')); };
    const timer = setTimeout(fail, 12000);
    script.onload = () => {
      clearTimeout(timer);
      if (window.kakao?.Postcode) resolve(); else fail();
    };
    script.onerror = fail;
    script.src = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    document.head.append(script);
  });
  return sdkRequest;
}
let searchVisit = 0;
async function openAddressSearch() {
  const visit = ++searchVisit;
  const mount = $('lookupResult'), status = $('lookupStatus');
  mount.replaceChildren();
  status.textContent = '주소 검색창을 여는 중입니다.';
  addressDialog.showModal();
  try {
    await loadAddressSearch();
    if (!addressDialog.open || visit !== searchVisit) return;
    status.textContent = '';
    new kakao.Postcode({
      width:'100%', height:'100%', autoMapping:false,
      oncomplete(data) {
        if (!addressDialog.open || visit !== searchVisit) return;
        if (!data.roadAddress) {
          status.textContent = '도로명주소를 선택해 주세요.';
          return;
        }
        if ($('address').value !== data.roadAddress) $('addressDetail').value = '';
        $('postcode').value = data.zonecode;
        $('address').value = data.roadAddress;
        addressDialog.close();
        $('addressDetail').focus();
      }
    }).embed(mount, {autoClose:false});
  } catch {
    if (addressDialog.open && visit === searchVisit)
      status.textContent = '검색창에 연결할 수 없습니다. 주소를 직접 입력하거나 다시 검색해 주세요.';
  }
}
$('addrBtn').addEventListener('click',openAddressSearch);
$('closeLookup').onclick = () => addressDialog.close();
$('manualAddress').onclick = () => { addressDialog.close(); $('address').focus(); };
addressDialog.addEventListener('close', () => { searchVisit++; $('lookupResult').replaceChildren(); });
$('closeBtn').onclick=()=>{alert('시안에서는 마음든든 랜딩으로 이동하지 않습니다. 실제 적용 시 랜딩 주소에 연결합니다.')};
const clauses=[
'본인은 납부하여야 할 요금에 대하여 별도의 통지 없이 본인의 지정출금계좌에서 수납기관이 정한 지정 출금일(휴일인 경우 익영업일)에 출금 대체 납부하여 주십시오.',
'출금이체를 위하여 지정출금계좌의 예금을 출금하는 경우에는 예금약관이나 약정서의 규정에 불구하고 예금청구서나 수표 없이 출금이체 처리절차에 의하여 출금하여도 이의가 없습니다.',
'지정계좌의 예금잔액(자동대출약정이 있는 경우 대출한도 포함)이 지정 출금일 현재 청구금액보다 부족하거나 지급제한 또는 약정대출 연체 등으로 대체 납부가 불가능한 경우의 손해는 본인의 책임으로 하겠습니다.',
'지정 출금일에 동일한 수종의 출금이체청구가 있는 경우 출금우선순위는 출금은행이 정하는 바에 따르도록 하겠습니다.',
'출금이체 신규신청에 의한 이체개시일은 수납기관의 사정에 의하여 결정됩니다.',
'출금이체신청(신규, 해지)은 해당 납기일 5일 전까지 신청서를 제출하여야 합니다.',
'출금이체 신청에 의한 지정계좌에서의 출금은 수납기관의 청구대로 출금하며, 출금요금에 이의가 있는 경우에는 본인과 수납기관이 협의하여 조정합니다.',
'출금이체금액은 지정 출금일 은행 영업시간 내에 입금된 예금(지정 출금일에 입금된 타점권 제외)에 한하여 출금 처리됩니다.',
'이 약관은 신청서를 수납기관에 직접 제출하여 출금이체를 신청한 경우에도 적용합니다.',
'본 신청과 관련하여 본인은 금융거래정보를 출금이체 신규 신청 시부터 해지 신청 시까지 수납기관에 제공하는 것에 대하여 금융실명거래 및 비밀보장에 관한 법률에 따라 동의합니다.'
];$('termsText').innerHTML=clauses.map((t,i)=>`<p><b>${i+1}.</b> ${t}</p>`).join('');$('allTerms').onclick=()=>{$('cmsDisclosure').open=!$('cmsDisclosure').open};
$('stepper').innerHTML=stepNames.map((n,i)=>`<div class="step ${i===0?'active':''}" data-ind="${i+1}"><span class="dot">${i+1}</span><span>${n}</span></div>`).join('');$('tabs').innerHTML=stepNames.map((_,i)=>`<span class="${i===0?'on':''}"></span>`).join('');
function showStep(){$('nextBtn').disabled=false;if(step===2) updateBirth('beneficiaryBirth');document.querySelectorAll('.step-panel').forEach(x=>x.classList.toggle('hidden',Number(x.dataset.step)!==step));document.querySelectorAll('.stepper .step').forEach(x=>{let n=Number(x.dataset.ind);x.classList.toggle('active',n===step);x.classList.toggle('done',n<step)});document.querySelectorAll('.tabstrip span').forEach((x,i)=>x.classList.toggle('on',i===step-1));$('backBtn').classList.toggle('hidden',step===1||step===5);$('nextBtn').textContent=step===1?'상품 선택 완료':step===2?'가입자 정보 확인':step===3?'결제 정보 확인':step===4?'계약서 미리보기':'PDF로 저장하기';$('barHint').textContent=step===5?'계약일자 · 계약자명 · 서명 내용을 확인해 주세요':`가입 정보가 안전하게 보호되는지 확인하며 진행해 주세요 · ${step}/4`}

function escapeText(value) {
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function get(id) { return escapeText($(id).value.trim()) || '미입력'; }
function mailingAddress() {
  const code = $('postcode').value.trim();
  return escapeText([code && '(' + code + ')', $('address').value.trim(), $('addressDetail').value.trim()].filter(Boolean).join(' '));
}
function checkPeople() {
  for (const id of ['name','birth','phone','postcode','address','relation','beneficiaryBirth']) {
    const field = $(id);
    if (id === 'birth' || id === 'beneficiaryBirth') updateBirth(id,true);
    else if (id !== 'postcode') field.required = true;
    if (!field.reportValidity() || (field.required && !field.value.trim())) {
      field.focus(); return false;
    }
  }
  if (!gender) { alert('성별을 선택해 주세요.'); return false; }
  return true;
}
function validate(){if(step===1)return true;if(step===2)return checkPeople();if(step===3){let ids=pay==='cms'?['accountOwner','bank','account']:['cardBrand','cardNumber','cardMonth','cardYear'];for(let id of ids)if(!$(id).value.trim()){ $(id).focus();return false}if(pay==='cms'&&!payDate){alert('출금일을 선택해 주세요.');return false}if(pay==='card'&&$('cardNumber').value.replace(/\D/g,'').length<12){$('cardNumber').focus();return false}return true}if(step===4){if(!$('termsAgree').checked){alert('출금이체 약관에 동의해 주세요.');return false}if(consent!=='agree'){$('consentError').style.display='block';return false}if(signatureEmpty){alert('계약자 서명을 입력해 주세요.');return false}return true}return true}
function renderContract(){let p=products[chosen],payinfo=pay==='cms'?`<b>자동이체</b><br>예금주 ${get('accountOwner')} · ${get('bank')}<br>계좌 ${get('account').replace(/\d(?=\d{4})/g,'•')} · 매월 ${payDate}일`:`<b>카드 자동결제</b><br>${get('cardBrand')} · ${get('cardNumber').replace(/\s/g,'').replace(/\d(?=\d{4})/g,'•')}<br>유효기간 ${get('cardMonth')} / ${get('cardYear')}`;let date=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replaceAll(' ','');let sig=signatureEmpty?'(전자서명 영역)':`<img alt="계약자 서명" style="width:115px;height:40px;object-fit:contain" src="${canvas.toDataURL('image/png')}">`;$('contractDoc').innerHTML=`<div class="doc-top"><div class="doc-brand">im READY · SONO STATION</div><div class="doc-type">회사 제출용 · VER. 2026.10<br>회원번호 __________________</div></div><h3>마음든든 회원가입 계약서</h3><table class="doc-table"><tr><th>가입 상품</th><td>${p.name}</td><th>상품 금액</th><td>${won(p.total)}</td></tr><tr><th>월 납입금 / 회차</th><td>${won(p.month)} × ${p.cnt}회</td><th>납입방법</th><td>${pay==='cms'?'CMS(통장 자동이체)':'카드 자동결제'}</td></tr><tr><th>가입자 성명</th><td>${get('name')}</td><th>생년월일 / 성별</th><td>${get('birth')} / ${gender||'미입력'}</td></tr><tr><th>연락처</th><td>${get('phone')}</td><th>이메일</th><td>${get('email')}</td></tr><tr><th>주소 (우편물 수령)</th><td colspan="3">${mailingAddress()}</td></tr><tr><th>지정인 관계</th><td>${get('relation')}</td><th>지정인 나이</th><td>만 ${birthAge($('beneficiaryBirth').value)}세</td></tr><tr><th>결제정보</th><td colspan="3">${payinfo}</td></tr></table><h4>지정인 정보 확인</h4><p class="doc-note">가입일 기준 만 80세 이하, 본인·배우자·직계 존·비속 중 1인을 지정합니다. 지정인 관계 및 연령 확인을 위해 필요한 정보 제공에 동의합니다.</p><h4>출금이체 약관 / 개인정보 제공 동의</h4><p class="doc-note">출금이체 약관 10개 조항을 확인했습니다: ${$('termsAgree').checked?'동의함':'미동의'}<br>CMS이체 및 카드 자동결제 개인정보 제공: ${consent==='agree'?'동의함':'미동의'}<br>제공받는 자: 금융결제원 / ㈜NICE정보통신 / ㈜KIS정보통신</p><table class="doc-table"><tr><th>소속</th><td>${get('affiliation')}</td><th>직원명 / 사원번호</th><td>${get('agentName')} / ${get('agentNo')}</td></tr><tr><th>부서(팀)명</th><td>${get('team')}</td><th>연락처</th><td>${get('agentPhone')}</td></tr></table><p class="doc-note" style="text-align:center;margin-top:18px">위 내용을 확인하고 계약을 신청합니다.</p><table class="doc-table"><tr><th>계약일자</th><td>${date}</td><th>계약자명</th><td>${get('name')}</td></tr></table><div class="doc-sign"><span>서명 (날인)</span>${sig}</div><p class="doc-note">주식회사 소노스테이션</p>`}
$('nextBtn').onclick=()=>{if(step===5){window.print();return}if(!validate())return;if(step===4)renderContract();step=Math.min(5,step+1);showStep();$('formScroll').scrollTop=0};$('backBtn').onclick=()=>{step=Math.max(1,step-1);showStep();$('formScroll').scrollTop=0};
// Touch-friendly signature pad for the layout prototype.
const canvas=document.createElement('canvas');canvas.width=800;canvas.height=220;canvas.style.width='100%';canvas.style.height='110px';const ctx=canvas.getContext('2d');ctx.strokeStyle='#28685e';ctx.lineWidth=4;ctx.lineCap='round';let drawing=false;function point(e){let r=canvas.getBoundingClientRect();return[(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height]}canvas.addEventListener('pointerdown',e=>{drawing=true;signatureEmpty=false;canvas.setPointerCapture(e.pointerId);let p=point(e);ctx.beginPath();ctx.moveTo(...p)});canvas.addEventListener('pointermove',e=>{if(!drawing)return;let p=point(e);ctx.lineTo(...p);ctx.stroke()});canvas.addEventListener('pointerup',()=>drawing=false);canvas.addEventListener('pointercancel',()=>drawing=false);document.querySelector('.signature-box').insertBefore(canvas,document.querySelector('.sign-foot'));$('clearSign').onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);signatureEmpty=true};
$('barHint').textContent='가입 상품과 납입 조건을 확인해 주세요';showStep();
