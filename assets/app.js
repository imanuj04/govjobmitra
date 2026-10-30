const toggle=document.getElementById('menuToggle'),nav=document.getElementById('mainNav');if(toggle&&nav)toggle.addEventListener('click',()=>nav.classList.toggle('open'));
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
(function initNewsTicker(){
 const hindiTrack=document.getElementById('tickerHindi'),englishTrack=document.getElementById('tickerEnglish'),status=document.getElementById('tickerStatus');if(!hindiTrack||!englishTrack)return;
 function makeHeadline(item,track){
  const link=document.createElement('a');link.className='ticker-item';
  link.href='news.html?title='+encodeURIComponent(item.title)+'&url='+encodeURIComponent(item.link)+'&source='+encodeURIComponent(item.source||'')+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News')+'&description='+encodeURIComponent(item.description||'')+'&content='+encodeURIComponent(item.fullContent||'')+'&date='+encodeURIComponent(item.publishedAt||'')+'&image='+encodeURIComponent(item.image||'')+'&lang='+encodeURIComponent(track===hindiTrack?'hi':'en');
  link.title=item.title;const title=document.createElement('span');title.textContent=item.title;link.append(title);return link;
 }
 function render(track,items,emptyText){
  track.replaceChildren();if(!Array.isArray(items)||!items.length){const empty=document.createElement('span');empty.className='ticker-loading';empty.textContent=emptyText;track.append(empty);return;}
  for(let copy=0;copy<2;copy++){const group=document.createElement('div');group.className='ticker-group';items.forEach(item=>group.append(makeHeadline(item,track)));track.append(group);}
 }
 async function load(){try{const response=await fetch('/api/news',{headers:{Accept:'application/json'},cache:'no-store'});if(!response.ok)throw new Error('News service returned '+response.status);const data=await response.json();render(hindiTrack,data.hindi,'अभी हिंदी सुर्खियाँ उपलब्ध नहीं हैं।');render(englishTrack,data.english,'No English headlines available right now.');if(status)status.textContent='ताज़ा खबर पढ़ने के लिए headline पर क्लिक करें · Read the full update here';}catch(error){render(hindiTrack,[],'समाचार अभी लोड नहीं हो पाए।');render(englishTrack,[],'Headlines are temporarily unavailable.');if(status)status.textContent='News feed temporarily unavailable';console.error('GovJobMitra news ticker:',error);}}
 load();window.setInterval(load,5*60*1000);
})();


(function initLatestUpdates(){
 const grid=document.getElementById('articleGrid'),status=document.getElementById('feedStatus'),search=document.getElementById('searchInput'),filters=document.getElementById('filters');
 if(!grid||!filters)return;
 let allItems=[],activeFilter='All',query='';
 const escapeText=value=>String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function card(item){
  const isJob=item.type==='job',date=item.publishedAt?new Date(item.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Recently updated';
  const category=escapeText(item.category|| (isJob?'Government Job':'News & GK'));
  const description=escapeText(item.description||'Open the source to read the complete update.');
  const title=escapeText(item.title);
  const source=escapeText(item.source||item.portal||'Source');
  const link=escapeText(item.url||item.link||'#');
  return '<article class="update-card"><div class="update-card-top"><span class="update-tag">'+category+'</span><span class="update-date">'+escapeText(date)+'</span></div><h3>'+title+'</h3><p>'+description+'</p><div class="update-card-bottom"><span>'+source+'</span><a href="'+link+'" target="_blank" rel="noopener noreferrer">Read source ↗</a></div></article>';
 }
 function render(){
  let list=allItems.filter(item=>{
   const typeMatch=activeFilter==='All'||(activeFilter==='Jobs'&&item.type==='job')||(activeFilter==='News & GK'&&item.type==='news');
   const text=(item.title+' '+item.description+' '+item.category+' '+item.source).toLowerCase();
   return typeMatch&&(!query||text.includes(query));
  });
  if(!list.length){grid.innerHTML='<article class="empty-state"><div class="empty-icon">⌕</div><h3>No updates found</h3><p>Try another search or select a different category. New vacancy feeds are checked automatically.</p></article>';return;}
  grid.innerHTML=list.map(card).join('');
 }
 filters.addEventListener('click',event=>{const btn=event.target.closest('[data-filter]');if(!btn)return;activeFilter=btn.dataset.filter;filters.querySelectorAll('.filter').forEach(el=>el.classList.toggle('active',el===btn));render();});
 if(search)search.addEventListener('input',()=>{query=search.value.trim().toLowerCase();render();});
 async function load(){
  if(status)status.textContent='Fetching updates from job portals and news sources…';
  const [jobs,news]=await Promise.allSettled([fetch('/api/vacancies',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Vacancy feed unavailable');return r.json();}),fetch('/api/news',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('News feed unavailable');return r.json();})]);
  allItems=[];
  if(jobs.status==='fulfilled'&&Array.isArray(jobs.value.items))allItems.push(...jobs.value.items.map(x=>({...x,type:'job',source:x.portal||x.source||'Government job portal'})));
  if(news.status==='fulfilled'){
   for(const item of [...(news.value.hindi||[]),...(news.value.english||[])])allItems.push({...item,type:'news',url:item.link,category:item.categoryLabel||item.category||'News & GK',source:item.source||'News publisher'});
  }
  const unique=new Set();allItems=allItems.filter(x=>{const key=(x.title||'').toLowerCase().trim();if(!key||unique.has(key))return false;unique.add(key);return true;});
  allItems.sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
  render();
  if(status){const jobCount=allItems.filter(x=>x.type==='job').length,newsCount=allItems.filter(x=>x.type==='news').length;status.textContent=jobCount+' job updates · '+newsCount+' news updates · Automatically refreshed';}
 }
 load().catch(error=>{grid.innerHTML='<article class="empty-state"><div class="empty-icon">!</div><h3>Updates are temporarily unavailable</h3><p>Please refresh the page in a moment.</p></article>';if(status)status.textContent='Feed temporarily unavailable';console.error('GovJobMitra updates:',error);});
 window.setInterval(load,5*60*1000);
})();
