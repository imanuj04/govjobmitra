const $=id=>document.getElementById(id);
let allItems=[],selected=null;
$('year').textContent=new Date().getFullYear();
function cleanText(s=''){return String(s).replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();}
function renderList(){
 const q=$('searchNews').value.trim().toLocaleLowerCase(),lang=$('language').value;
 const items=allItems.filter(x=>!q||x.title.toLocaleLowerCase().includes(q)||cleanText(x.description).toLocaleLowerCase().includes(q));
 const list=$('newsList');list.replaceChildren();
 if(!items.length){const p=document.createElement('p');p.className='desk-empty';p.textContent='No matching feed items. Try another language or refresh.';list.append(p);return;}
 items.forEach(item=>{
  const b=document.createElement('button');b.type='button';b.className='desk-item'+(selected&&selected.link===item.link?' selected':'');
  const title=document.createElement('strong');title.textContent=item.title;
  const meta=document.createElement('small');meta.textContent=(item.source||'News feed')+' · '+(item.categoryLabel||item.category||'News')+(item.description?' · excerpt available':' · headline only');
  b.append(title,meta);b.addEventListener('click',()=>choose(item,lang));list.append(b);
 });
}
function buildDraft(item,lang){
 const excerpt=cleanText(item.description||''),hi=lang==='hindi';
 if(!excerpt)return hi?'इस खबर के बारे में RSS feed में अभी केवल शीर्षक उपलब्ध है।\n\nप्रकाशन से पहले आधिकारिक स्रोत खोलकर तारीख, संबंधित विभाग/स्थान, मुख्य घोषणा और प्रभावित लोगों की जानकारी स्वयं सत्यापित करें। पर्याप्त तथ्य मिलने तक इसे प्रकाशित न करें।\n\nसंपादकीय नोट: उपलब्ध जानकारी अधूरी है; कोई अतिरिक्त तथ्य अनुमान से नहीं जोड़ा गया है।':'The RSS feed currently provides only a headline.\n\nBefore publication, check the original/official source and independently verify the date, department or location, key announcement, and people affected. Do not publish until sufficient facts are confirmed.\n\nEditorial note: Available information is incomplete; no additional facts have been assumed.';
 return hi?'इस अपडेट के अनुसार, '+excerpt+'\n\n**पाठकों के लिए इसका महत्व**\nइस जानकारी का असर किन लोगों पर पड़ता है और उन्हें आगे क्या करना चाहिए, यह आधिकारिक सूचना से सत्यापित करके यहां स्पष्ट करें।\n\n**क्या ध्यान रखें?**\nतारीख, पात्रता, आवेदन प्रक्रिया, फीस और जरूरी निर्देश संबंधित आधिकारिक नोटिस से जांचें।\n\n**संपादकीय नोट:** यह मसौदा RSS में उपलब्ध अंश पर आधारित है। प्रकाशन से पहले मूल दस्तावेज़ से सभी तथ्य जांचें और अपने शब्दों में संदर्भ जोड़ें।':'According to the available update, '+excerpt+'\n\n**Why this matters**\nExplain who is affected and what readers should do next, using verified information from the official notice or primary source.\n\n**What readers should check**\nConfirm dates, eligibility, fees, application steps, and instructions against the relevant official notice.\n\n**Editorial note:** This draft is based only on the RSS excerpt. Verify every fact against the original document and add independently researched context before publication.';
}
function choose(item,lang){selected=item;$('draftTitle').value=item.title;$('draftCategory').value=item.categoryLabel||item.category||'News';$('draftBody').value=buildDraft(item,lang);$('draftSource').value=item.link||'';$('deskStatus').textContent=item.description?'Draft prepared from the available RSS excerpt. Please fact-check and edit.':'Only a headline was supplied. This is a verification checklist, not a publish-ready article.';renderList();}
async function load(){
 $('feedStatus').textContent='Fetching public RSS feed items…';
 try{const r=await fetch('/api/news',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const data=await r.json(),lang=$('language').value;allItems=Array.isArray(data[lang])?data[lang]:[];renderList();$('feedStatus').textContent=allItems.length+' items loaded. Select one to prepare a draft.';}
 catch(e){$('feedStatus').textContent='Could not load feeds. Please refresh later.';$('newsList').textContent='News feed temporarily unavailable.';}
}
$('language').addEventListener('change',load);$('reload').addEventListener('click',load);$('searchNews').addEventListener('input',renderList);
$('copyDraft').addEventListener('click',async()=>{
 const title=$('draftTitle').value.trim(),body=$('draftBody').value.trim(),source=$('draftSource').value.trim();
 if(!title||!body){$('deskStatus').textContent='Select a news item and prepare the draft first.';return;}
 const md='# '+title+'\n\n'+body+'\n\n---\n**Source for verification:** '+source+'\n\n*Published by GovJobMitra after editorial review.*';
 try{await navigator.clipboard.writeText(md);$('deskStatus').textContent='Markdown article copied. It has not been published.';}catch(e){$('deskStatus').textContent='Clipboard access blocked. Select and copy the text manually.';}
});
$('saveDraft').addEventListener('click',()=>{
 const draft={title:$('draftTitle').value,category:$('draftCategory').value,body:$('draftBody').value,source:$('draftSource').value,savedAt:new Date().toISOString()};
 if(!draft.title||!draft.body){$('deskStatus').textContent='Nothing to save yet.';return;}
 const drafts=JSON.parse(localStorage.getItem('gjm-drafts')||'[]');drafts.unshift(draft);localStorage.setItem('gjm-drafts',JSON.stringify(drafts.slice(0,50)));$('deskStatus').textContent='Saved in this browser only. Not published online.';
});
$('clearDraft').addEventListener('click',()=>{selected=null;['draftTitle','draftCategory','draftBody','draftSource'].forEach(id=>$(id).value='');$('deskStatus').textContent='Draft cleared.';renderList();});
load();