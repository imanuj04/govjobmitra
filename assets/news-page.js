const params=new URLSearchParams(location.search);
const title=params.get('title')||'News update',articleUrl=params.get('url')||'',category=params.get('category')||'Latest update',excerpt=params.get('description')||'',fullContent=params.get('content')||'',date=params.get('date')||'',feedImage=params.get('image')||'',lang=params.get('lang')||'en',hi=lang==='hi';
const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
document.documentElement.lang=hi?'hi':'en';document.title=title+' | GovJobMitra';set('newsTitle',title);set('newsCategory',category);set('newsCategoryTag',category);set('year',new Date().getFullYear());set('newsMeta',date&&!Number.isNaN(Date.parse(date))?new Date(date).toLocaleString(hi?'hi-IN':'en-IN'):(hi?'ताज़ा अपडेट':'Latest update'));set('readingLabel',hi?'खबर का विवरण':'News details');set('readMoreLabel',hi?'और खबरें पढ़ें':'Read more updates');
function plain(s){return(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
const body=document.getElementById('newsBody');body.replaceChildren();
function addImage(src){if(!src||!/^https?:\/\//i.test(src))return;const img=document.createElement('img');img.src=src;img.alt=title;img.loading='eager';img.className='news-hero-image';img.onload=()=>{if(img.naturalWidth<640)img.remove();};img.onerror=()=>img.remove();body.prepend(img);}
function renderFeedHtml(html){
 const doc=new DOMParser().parseFromString(html,'text/html'),allowed=new Set(['P','BR','B','STRONG','I','EM','U','H2','H3','UL','OL','LI','BLOCKQUOTE','A','IMG']);
 function appendSafe(parent,node){
  if(node.nodeType===Node.TEXT_NODE){parent.append(document.createTextNode(node.textContent));return;}
  if(node.nodeType!==Node.ELEMENT_NODE||!allowed.has(node.tagName)) {node.childNodes.forEach(child=>appendSafe(parent,child));return;}
  if(node.tagName==='IMG'){const src=node.getAttribute('src')||node.getAttribute('data-src')||'';if(/^https:\/\//i.test(src)){const img=document.createElement('img');img.src=src;img.alt=node.getAttribute('alt')||title;img.loading='lazy';img.className='news-inline-image';parent.append(img);}return;}
  const el=document.createElement(node.tagName.toLowerCase());
  if(node.tagName==='A'){const href=node.getAttribute('href')||'';if(/^https:\/\//i.test(href)){el.href=href;el.rel='nofollow noopener';el.target='_blank';}}
  node.childNodes.forEach(child=>appendSafe(el,child));parent.append(el);
 }
 doc.body.childNodes.forEach(node=>appendSafe(body,node));
}
if(fullContent&&plain(fullContent).length>plain(excerpt).length+80){renderFeedHtml(fullContent);}
else if(excerpt){const p=document.createElement('p');p.textContent=plain(excerpt);body.append(p);}
else{const p=document.createElement('p');p.textContent=hi?'इस खबर की विस्तृत जानकारी लोड की जा रही है…':'Loading more details for this update…';body.append(p);}
if(feedImage)addImage(feedImage);
if(fullContent&&plain(fullContent).length>plain(excerpt).length+80){const note=document.createElement('p');note.className='news-reading-label';note.textContent=hi?'यह लेख उपलब्ध RSS feed के पूरे टेक्स्ट से दिखाया गया है।':'Full text displayed as supplied in the RSS feed.';body.append(note);}
async function loadArticle(){
 if(!articleUrl)return;
 try{
  const r=await fetch('/api/article?url='+encodeURIComponent(articleUrl),{cache:'no-store'});if(!r.ok)return;
  const data=await r.json();
  if(data.image&&!body.querySelector('.news-hero-image'))addImage(data.image);
  const hasStory=!!(fullContent&&plain(fullContent).length>plain(excerpt).length+80)||!!excerpt;
  if(!hasStory){
   body.replaceChildren();
   if(data.description){const p=document.createElement('p');p.textContent=plain(data.description);body.append(p);}
   if(Array.isArray(data.headings)&&data.headings.length){const h=document.createElement('h2');h.className='news-subhead';h.textContent=hi?'इस खबर के मुख्य बिंदु':'Key points';body.append(h);const ul=document.createElement('ul');data.headings.forEach(value=>{const li=document.createElement('li');li.textContent=value;ul.append(li);});body.append(ul);}
   if(!body.children.length){const p=document.createElement('p');p.textContent=hi?'इस खबर का विस्तृत विवरण अभी उपलब्ध नहीं है। नीचे दिए गए मूल स्रोत पर पूरी जानकारी देखें।':'A detailed summary is not available yet. Please use the original report for full details.';body.append(p);}
   const link=document.createElement('a');link.href=articleUrl;link.target='_blank';link.rel='noopener noreferrer';link.className='news-source-link';link.textContent=hi?'मूल रिपोर्ट पढ़ें →':'Read original report →';const wrap=document.createElement('p');wrap.className='news-read-more';wrap.append(link);body.append(wrap);
  }
 }catch{}
}
if(!feedImage)loadArticle();
function card(item){const a=document.createElement('a');a.className='related-card';a.href='news.html?title='+encodeURIComponent(item.title)+'&url='+encodeURIComponent(item.link)+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News')+'&description='+encodeURIComponent(item.description||'')+'&content='+encodeURIComponent(item.fullContent||'')+'&date='+encodeURIComponent(item.publishedAt||'')+'&image='+encodeURIComponent(item.image||'')+'&lang='+encodeURIComponent(hi?'hi':'en');const h=document.createElement('h3');h.textContent=item.title;const small=document.createElement('small');small.textContent=item.categoryLabel||item.category||'Latest update';a.append(h,small);return a;}
(async()=>{try{const r=await fetch('/api/news',{cache:'no-store'});if(!r.ok)throw Error('feed');const data=await r.json(),items=hi?(data.hindi||[]):(data.english||[]),grid=document.getElementById('relatedGrid');grid.replaceChildren();items.filter(x=>x.title!==title).slice(0,6).forEach(x=>grid.append(card(x)));if(!grid.children.length)grid.textContent=hi?'अभी और खबरें उपलब्ध नहीं हैं।':'No more updates right now.';}catch{set('relatedGrid',hi?'खबरें अभी उपलब्ध नहीं हैं।':'Updates temporarily unavailable.');}})();
