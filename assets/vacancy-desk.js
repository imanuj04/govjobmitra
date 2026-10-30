const $=id=>document.getElementById(id);$('year').textContent=new Date().getFullYear();
const v=id=>$(id).value.trim();const url=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
function generate(){const org=v('org'),post=v('post'),count=v('count'),elig=v('eligibility'),start=v('start'),last=v('last'),fee=v('fee'),notice=url(v('notice')),apply=url(v('apply')),extra=v('extra');if(!org||!post||!notice){$('status').textContent='Organisation, post name and official notification URL are required.';return;}
const hi='# '+org+' भर्ती 2026: '+post+'\n\n'+org+' ने '+post+' के लिए भर्ती अधिसूचना जारी की है। उपलब्ध विवरण नीचे दिए गए हैं।\n\n## भर्ती विवरण\n- संस्था: '+org+'\n- पद: '+post+'\n- कुल रिक्तियां: '+(count||'आधिकारिक नोटिफिकेशन देखें')+'\n- योग्यता: '+(elig||'आधिकारिक नोटिफिकेशन के अनुसार')+'\n- आवेदन शुरू: '+(start||'नोटिफिकेशन देखें')+'\n- अंतिम तिथि: '+(last||'नोटिफिकेशन देखें')+'\n- शुल्क: '+(fee||'नोटिफिकेशन देखें')+'\n\n'+extra+'\n\n[आधिकारिक नोटिफिकेशन देखें]('+notice+')'+(apply?'\n[ऑनलाइन आवेदन करें]('+apply+')':'');
const en='# '+org+' Recruitment 2026: '+post+'\n\n'+org+' has issued a recruitment notification for '+post+'.\n\n## Recruitment details\n- Organisation: '+org+'\n- Post: '+post+'\n- Vacancies: '+(count||'Refer to official notice')+'\n- Eligibility: '+(elig||'As per official notice')+'\n- Application starts: '+(start||'Refer to official notice')+'\n- Last date: '+(last||'Refer to official notice')+'\n- Fee: '+(fee||'Refer to official notice')+'\n\n'+extra+'\n\n[Official notification]('+notice+')'+(apply?'\n[Apply online]('+apply+')':'');$('hindi').value=hi;$('english').value=en;$('status').textContent='Drafts ready. Check facts before publishing.';}
$('generate').addEventListener('click',generate);async function copy(id){try{await navigator.clipboard.writeText($(id).value);$('status').textContent='Draft copied.'}catch{$('status').textContent='Select and copy manually.'}}$('copyhi').addEventListener('click',()=>copy('hindi'));$('copyen').addEventListener('click',()=>copy('english'));
function addResult(item,container){
 const row=document.createElement('button');row.type='button';row.className='jd-result';row.textContent=item.title||'Vacancy update';
 row.addEventListener('click',()=>{$('post').value=item.title||'';$('extra').value=item.description||'';$('status').textContent='Headline added. Fill department and official notification details before generating the article.';document.getElementById('org').scrollIntoView({behavior:'smooth',block:'center'});});
 container.append(row);
}
async function scanSources(){
 const status=$('scanStatus'),out=$('scanResults');status.textContent='Latest vacancy updates search ho rahi hain…';out.replaceChildren();
 try{
  const response=await fetch('/api/vacancies',{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);
  const data=await response.json();
  status.textContent='Updated '+new Date(data.checkedAt).toLocaleString()+' · '+data.items.length+' updates';
  if(!data.items.length){out.textContent='Abhi matching updates nahi mili. Thodi der baad dobara try karein.';return;}
  data.items.forEach(item=>addResult(item,out));
 }catch(e){status.textContent='Search abhi available nahi hai: '+e.message;}
}
$('scanSources')?.addEventListener('click',scanSources);scanSources();
