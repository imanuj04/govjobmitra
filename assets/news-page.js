const params=new URLSearchParams(location.search);
const title=params.get('title')||'News update',category=params.get('category')||'Latest update',excerpt=params.get('description')||'',content=params.get('content')||'',date=params.get('date')||'',image=params.get('image')||'',lang=params.get('lang')||'en',hi=lang==='hi';
const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
document.documentElement.lang=hi?'hi':'en';document.title=title+' | GovJobMitra';
set('newsTitle',title);set('newsCategory',category);set('newsCategoryTag',category);set('year',new Date().getFullYear());
set('newsMeta',date&&!Number.isNaN(Date.parse(date))?new Date(date).toLocaleString(hi?'hi-IN':'en-IN'):(hi?'ताज़ा अपडेट':'Latest update'));
set('readingLabel',hi?'खबर का विवरण':'News details');set('readMoreLabel',hi?'और खबरें पढ़ें':'Read more updates');
function decode(s){return(s||'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');}
function plain(s){return decode(s).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
const raw=content||excerpt,body=document.getElementById('newsBody'),text=plain(raw);
if(body){
 body.replaceChildren();
 if(image&&/^https?:\/\//i.test(image)){const img=document.createElement('img');img.src=image;img.alt=title;img.loading='lazy';img.className='news-hero-image';body.append(img);}
 if(text){
  const chunks=text.split(/(?<=[.!?।])\s+/).filter(x=>x.trim().length>20);
  if(chunks.length>1){chunks.forEach(chunk=>{const p=document.createElement('p');p.textContent=chunk;body.append(p);});}
  else{const p=document.createElement('p');p.textContent=text;body.append(p);}
  if(text.length<350){const note=document.createElement('p');note.className='news-reading-label';note.textContent=hi?'यह उपलब्ध समाचार फीड का संक्षिप्त विवरण है।':'This is the available feed summary. More verified details will be added when the feed provides them.';body.append(note);}
 }else{const p=document.createElement('p');p.textContent=hi?'इस खबर का पूरा विवरण अभी उपलब्ध नहीं है।':'The full details for this update are not available in the news feed yet.';body.append(p);}
}
function card(item){const a=document.createElement('a');a.className='related-card';a.href='news.html?title='+encodeURIComponent(item.title)+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News')+'&description='+encodeURIComponent(item.description||'')+'&content='+encodeURIComponent(item.content||'')+'&date='+encodeURIComponent(item.publishedAt||'')+'&image='+encodeURIComponent(item.image||'')+'&lang='+encodeURIComponent(hi?'hi':'en');const h=document.createElement('h3');h.textContent=item.title;const small=document.createElement('small');small.textContent=item.categoryLabel||item.category||'Latest update';a.append(h,small);return a;}
(async()=>{try{const r=await fetch('/api/news',{cache:'no-store'});if(!r.ok)throw Error('feed');const data=await r.json(),items=hi?(data.hindi||[]):(data.english||[]),grid=document.getElementById('relatedGrid');grid.replaceChildren();items.filter(x=>x.title!==title).slice(0,6).forEach(x=>grid.append(card(x)));if(!grid.children.length)grid.textContent=hi?'अभी और खबरें उपलब्ध नहीं हैं।':'No more updates right now.';}catch{set('relatedGrid',hi?'खबरें अभी उपलब्ध नहीं हैं।':'Updates temporarily unavailable.');}})();
