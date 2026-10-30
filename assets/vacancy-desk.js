const $=id=>document.getElementById(id);$('year').textContent=new Date().getFullYear();
const v=id=>$(id).value.trim();const url=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
function generate(){const org=v('org'),post=v('post'),count=v('count'),elig=v('eligibility'),start=v('start'),last=v('last'),fee=v('fee'),notice=url(v('notice')),apply=url(v('apply')),extra=v('extra');if(!org||!post||!notice){$('status').textContent='Organisation, post name and valid official notification URL are required.';return;}
const hi='# '+org+' भर्ती 2026: '+post+'\n\n'+org+' ने '+post+' के लिए भर्ती अधिसूचना जारी की है। उपलब्ध आधिकारिक विवरण नीचे दिए गए हैं।\n\n## भर्ती विवरण\n- संस्था: '+org+'\n- पद: '+post+'\n- कुल रिक्तियां: '+(count||'आधिकारिक नोटिफिकेशन देखें')+'\n- योग्यता: '+(elig||'आधिकारिक नोटिफिकेशन के अनुसार')+'\n- आवेदन शुरू: '+(start||'नोटिफिकेशन देखें')+'\n- अंतिम तिथि: '+(last||'नोटिफिकेशन देखें')+'\n- शुल्क: '+(fee||'नोटिफिकेशन देखें')+'\n\n## अतिरिक्त जानकारी\n'+(extra||'चयन प्रक्रिया, आयु सीमा और निर्देश आधिकारिक अधिसूचना में जांचें।')+'\n\nआवेदन से पहले सभी शर्तें और तिथियां आधिकारिक नोटिस से जांचें।\n\n[आधिकारिक नोटिफिकेशन देखें]('+notice+')'+(apply?'\n[ऑनलाइन आवेदन करें]('+apply+')':'');
const en='# '+org+' Recruitment 2026: '+post+'\n\n'+org+' has issued a recruitment notification for '+post+'. Key details from the official notice are listed below.\n\n## Recruitment details\n- Organisation: '+org+'\n- Post: '+post+'\n- Vacancies: '+(count||'Refer to official notice')+'\n- Eligibility: '+(elig||'As per official notice')+'\n- Application starts: '+(start||'Refer to official notice')+'\n- Last date: '+(last||'Refer to official notice')+'\n- Fee: '+(fee||'Refer to official notice')+'\n\n## Additional information\n'+(extra||'Check the official notification for age limits, selection process and instructions.')+'\n\nVerify all conditions and dates before applying.\n\n[View Official Notification]('+notice+')'+(apply?'\n[Apply Online]('+apply+')':'');$('hindi').value=hi;$('english').value=en;$('status').textContent='Drafts generated. Review all facts and links before publishing.';}
$('generate').addEventListener('click',generate);async function copy(id){try{await navigator.clipboard.writeText($(id).value);$('status').textContent='Draft copied.'}catch{$('status').textContent='Clipboard blocked; select and copy manually.'}}$('copyhi').addEventListener('click',()=>copy('hindi'));$('copyen').addEventListener('click',()=>copy('english'));
function addResult(item,container){
 const row=document.createElement('div');row.className='jd-source';
 const title=document.createElement('strong');title.textContent=item.title||'Untitled vacancy update';
 const meta=document.createElement('p');meta.textContent=[item.source,item.kind,item.dateLabel||''].filter(Boolean).join(' · ');
 const desc=document.createElement('p');desc.className='jd-help';desc.textContent=item.description||'Open the source and verify the complete notification details.';
 const link=document.createElement('a');link.href=item.url;link.target='_blank';link.rel='noopener';link.textContent='Open original source ↗';
 row.append(title,meta,desc,link);
 row.addEventListener('click',event=>{if(event.target===link)return;$('org').value=item.source||'';$('post').value=item.title||'';$('notice').value=item.url||'';$('status').textContent='Search result added to draft form. Confirm the recruiting organisation and official notification before writing.';document.getElementById('org').scrollIntoView({behavior:'smooth',block:'center'});});
 container.append(row);
}
async function scanSources(){
 const status=$('scanStatus'),out=$('scanResults');status.textContent='Searching recent vacancy updates and checking recruitment portals…';out.replaceChildren();
 try{
  const response=await fetch('/api/vacancies',{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);
  const data=await response.json();
  status.textContent='Search completed '+new Date(data.checkedAt).toLocaleString()+' · '+data.items.length+' unique matching updates found.';
  const searchTitle=document.createElement('h3');searchTitle.textContent='Recent web / YouTube search results';searchTitle.style.cssText='margin:18px 0 8px;font-size:15px;color:var(--navy)';out.append(searchTitle);
  data.searches.forEach(search=>{const p=document.createElement('p');p.className='jd-help';p.textContent=search.query+' — '+(search.status==='ok'?search.count+' results':'search unavailable');out.append(p);});
  const searchItems=data.items.filter(x=>x.kind!=='Official portal');
  if(searchItems.length){searchItems.forEach(item=>addResult(item,out));}else{const p=document.createElement('p');p.className='jd-help';p.textContent='No matching recent search results returned. Try scanning again later.';out.append(p);}
  const portalTitle=document.createElement('h3');portalTitle.textContent='Official recruitment portal checks';portalTitle.style.cssText='margin:22px 0 8px;font-size:15px;color:var(--navy)';out.append(portalTitle);
  data.sources.forEach(source=>{
   const heading=document.createElement('p');heading.style.cssText='font-size:12px;font-weight:700;margin:12px 0 5px';heading.textContent=source.source+' — '+(source.status==='ok'?source.count+' matching links':'could not scan automatically');out.append(heading);
   if(source.status!=='ok'){const note=document.createElement('p');note.className='jd-help';note.textContent=source.error||'Portal blocked automated reading or requires JavaScript.';out.append(note);}
   source.items.forEach(item=>addResult(item,out));
  });
 }catch(e){status.textContent='Scan failed: '+e.message;}
}
$('scanSources')?.addEventListener('click',scanSources);scanSources();
