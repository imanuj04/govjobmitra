const params=new URLSearchParams(location.search);
const title=params.get('title')||'News update';
const original=params.get('url')||'';
const source=params.get('source')||'News publisher';
const category=params.get('category')||'Latest update';
const excerpt=params.get('description')||'';
const lang=params.get('lang')||'en';
const hi=lang==='hi';
const setText=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
document.documentElement.lang=hi?'hi':'en';
document.title=title+' | GovJobMitra';
setText('newsTitle',title);
setText('newsCategory',category);
setText('newsMeta',(source||'News publisher')+' · '+new Date().toLocaleDateString(hi?'hi-IN':'en-IN'));
setText('newsSummary',excerpt?excerpt.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim():(hi?'इस खबर की उपलब्ध जानकारी अभी केवल शीर्षक तक सीमित है। अधिक तथ्य मिलने पर यह अपडेट किया जाएगा।':'The available feed currently provides the headline only. This page will show a fuller summary when the publisher supplies an excerpt or verified details.'));
setText('year',new Date().getFullYear());
setText('detailHeading',hi?'खबर का सार':'News summary');
setText('sourceLabel',hi?'मूल स्रोत':'Original source');
setText('sourceNote',hi?'यह GovJobMitra पर उपलब्ध खबर का सार/अंश है। पूरी रिपोर्ट और नवीनतम जानकारी के लिए मूल प्रकाशक का स्रोत देखें।':'This is the available summary or excerpt on GovJobMitra. Visit the original publisher for the complete report and latest updates.');
const originalLink=document.getElementById('originalLink');
if(originalLink&&/^https?:\/\//i.test(original)){originalLink.href=original;originalLink.textContent=(hi?'मूल स्रोत देखें':'View source')+' ↗';}else if(originalLink){originalLink.hidden=true;}
function card(item){
 const a=document.createElement('a');a.className='related-card';
 a.href='news.html?title='+encodeURIComponent(item.title)+'&url='+encodeURIComponent(item.link)+'&source='+encodeURIComponent(item.source||'')+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News')+'&description='+encodeURIComponent(item.description||'')+'&lang='+encodeURIComponent(hi?'hi':'en');
 const tag=document.createElement('span');tag.className='news-category';tag.textContent=item.categoryLabel||'News';
 const h=document.createElement('h3');h.textContent=item.title;
 const meta=document.createElement('small');meta.textContent=item.source||'News source';
 a.append(tag,h,meta);return a;
}
(async()=>{
 try{
  const res=await fetch('/api/news',{cache:'no-store'});if(!res.ok)throw new Error('feed unavailable');
  const data=await res.json();const items=hi?(data.hindi||[]):(data.english||[]);
  const related=items.filter(x=>x.link!==original&&(x.category===category||x.categoryLabel===category));
  const fallback=items.filter(x=>x.link!==original);
  const grid=document.getElementById('relatedGrid');grid.replaceChildren();
  (related.length?related:fallback).slice(0,6).forEach(x=>grid.append(card(x)));
  if(!grid.children.length){const p=document.createElement('p');p.className='muted';p.textContent=hi?'अभी संबंधित खबरें उपलब्ध नहीं हैं।':'No related updates available right now.';grid.append(p);}
 }catch(e){setText('relatedGrid',hi?'संबंधित खबरें अभी उपलब्ध नहीं हैं।':'Related updates are temporarily unavailable.');}
})();