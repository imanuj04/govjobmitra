const params=new URLSearchParams(location.search);
const title=params.get('title')||'News update';
const original=params.get('url')||'';
const source=params.get('source')||'News publisher';
const category=params.get('category')||'Latest update';
const setText=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
setText('newsTitle',title);
setText('newsCategory',category);
setText('newsMeta',source+' · '+new Date().toLocaleDateString());
setText('newsSummary','This update is shared as a headline with its source link. Open the original report for complete facts, context and any later corrections.');
setText('year',new Date().getFullYear());
const originalLink=document.getElementById('originalLink');
if(originalLink&&/^https?:\/\//i.test(original)){originalLink.href=original;}else if(originalLink){originalLink.hidden=true;}
function card(item){
 const a=document.createElement('a');a.className='related-card';
 a.href='news.html?title='+encodeURIComponent(item.title)+'&url='+encodeURIComponent(item.link)+'&source='+encodeURIComponent(item.source||'')+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News');
 const tag=document.createElement('span');tag.className='news-category';tag.textContent=item.categoryLabel||'News';
 const h=document.createElement('h3');h.textContent=item.title;
 const meta=document.createElement('small');meta.textContent=item.source||'Open source report';
 a.append(tag,h,meta);return a;
}
(async()=>{
 try{
  const res=await fetch('/api/news',{cache:'no-store'});if(!res.ok)throw new Error('feed unavailable');
  const data=await res.json();const all=[...(data.hindi||[]),...(data.english||[])];
  const related=all.filter(x=>x.link!==original&&(x.category===category||x.categoryLabel===category));
  const fallback=all.filter(x=>x.link!==original);
  const grid=document.getElementById('relatedGrid');grid.replaceChildren();
  (related.length?related:fallback).slice(0,6).forEach(x=>grid.append(card(x)));
  if(!grid.children.length){const p=document.createElement('p');p.className='muted';p.textContent='No related updates available right now.';grid.append(p);}
 }catch(e){setText('relatedGrid','Related updates are temporarily unavailable.');}
})();