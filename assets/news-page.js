const params=new URLSearchParams(location.search);
const title=params.get('title')||'News update',articleUrl=params.get('url')||'',category=params.get('category')||'Latest update',excerpt=params.get('description')||'',content=params.get('content')||'',date=params.get('date')||'',feedImage=params.get('image')||'',lang=params.get('lang')||'en',hi=lang==='hi';
const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
document.documentElement.lang=hi?'hi':'en';document.title=title+' | GovJobMitra';set('newsTitle',title);set('newsCategory',category);set('newsCategoryTag',category);set('year',new Date().getFullYear());set('newsMeta',date&&!Number.isNaN(Date.parse(date))?new Date(date).toLocaleString(hi?'hi-IN':'en-IN'):(hi?'ताज़ा अपडेट':'Latest update'));set('readingLabel',hi?'खबर का विवरण':'News details');set('readMoreLabel',hi?'और खबरें पढ़ें':'Read more updates');
function decode(s){return(s||'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');}
function plain(s){return decode(s).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
const body=document.getElementById('newsBody');body.replaceChildren();
function addImage(src){if(!src||!/^https?:\/\//i.test(src))return;const img=document.createElement('img');img.src=src;img.alt=title;img.loading='eager';img.className='news-hero-image';img.onload=()=>{if(img.naturalWidth<640)img.remove();};img.onerror=()=>img.remove();body.prepend(img);}
function addParagraph(text){if(!text)return;const p=document.createElement('p');p.textContent=text;body.append(p);}
function addHeading(text){const h=document.createElement('h2');h.className='news-subhead';h.textContent=text;body.append(h);}
const initial=plain(content||excerpt);if(initial)addParagraph(initial);
if(!initial)addParagraph(hi?'खबर की अतिरिक्त जानकारी लोड की जा रही है…':'Loading more details for this story…');
if(feedImage)addImage(feedImage);
async function loadArticle(){
 if(!articleUrl)return;
 try{
  const r=await fetch('/api/article?url='+encodeURIComponent(articleUrl),{cache:'no-store'});if(!r.ok)throw new Error('Article details unavailable');
  const data=await r.json();
  if(data.image){const old=body.querySelector('.news-hero-image');if(old)old.remove();addImage(data.image);}
  const description=plain(data.description||'');
  if(description&&description!==initial&&description.length>45){if(initial) addHeading(hi?'इस खबर की अतिरिक्त जानकारी':'More about this update');addParagraph(description);}
  const headings=(data.headings||[]).filter(x=>x&&x.length>10);
  if(headings.length){addHeading(hi?'रिपोर्ट के मुख्य विषय':'Key topics in the report');const ul=document.createElement('ul');headings.slice(0,4).forEach(x=>{const li=document.createElement('li');li.textContent=x;ul.append(li);});body.append(ul);}
  if(!initial&&!description&&!headings.length)addParagraph(hi?'इस स्रोत से विस्तृत जानकारी प्राप्त नहीं हो सकी।':'The publisher did not provide an accessible detailed summary for this update.');
 }catch(e){if(!initial){body.replaceChildren();addParagraph(hi?'इस खबर की अतिरिक्त जानकारी अभी उपलब्ध नहीं है।':'Additional details are not available for this story right now.');}}
}
loadArticle();
function card(item){const a=document.createElement('a');a.className='related-card';a.href='news.html?title='+encodeURIComponent(item.title)+'&url='+encodeURIComponent(item.link)+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News')+'&description='+encodeURIComponent(item.description||'')+'&content='+encodeURIComponent(item.content||'')+'&date='+encodeURIComponent(item.publishedAt||'')+'&image='+encodeURIComponent(item.image||'')+'&lang='+encodeURIComponent(hi?'hi':'en');const h=document.createElement('h3');h.textContent=item.title;const small=document.createElement('small');small.textContent=item.categoryLabel||item.category||'Latest update';a.append(h,small);return a;}
(async()=>{try{const r=await fetch('/api/news',{cache:'no-store'});if(!r.ok)throw Error('feed');const data=await r.json(),items=hi?(data.hindi||[]):(data.english||[]),grid=document.getElementById('relatedGrid');grid.replaceChildren();items.filter(x=>x.title!==title).slice(0,6).forEach(x=>grid.append(card(x)));if(!grid.children.length)grid.textContent=hi?'अभी और खबरें उपलब्ध नहीं हैं।':'No more updates right now.';}catch{set('relatedGrid',hi?'खबरें अभी उपलब्ध नहीं हैं।':'Updates temporarily unavailable.');}})();
