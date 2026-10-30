const params=new URLSearchParams(location.search),slug=params.get('slug')||'';
const el=id=>document.getElementById(id),set=(id,v)=>{if(el(id))el(id).textContent=v||''};
set('year',new Date().getFullYear());
function safeBody(value){
 const root=document.createElement('div'),doc=new DOMParser().parseFromString(String(value||''),'text/html');
 const allowed=new Set(['P','BR','B','STRONG','I','EM','U','H2','H3','UL','OL','LI','BLOCKQUOTE','A']);
 function add(parent,node){
  if(node.nodeType===Node.TEXT_NODE){parent.append(document.createTextNode(node.textContent));return;}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  if(!allowed.has(node.tagName)){node.childNodes.forEach(n=>add(parent,n));return;}
  const child=document.createElement(node.tagName.toLowerCase());
  if(node.tagName==='A'){const href=node.getAttribute('href')||'';if(/^https:\/\//i.test(href)){child.href=href;child.target='_blank';child.rel='noopener noreferrer nofollow';}else{node.childNodes.forEach(n=>add(parent,n));return;}}
  node.childNodes.forEach(n=>add(child,n));parent.append(child);
 }
 doc.body.childNodes.forEach(n=>add(root,n));
 if(!root.textContent.trim()){const p=document.createElement('p');p.textContent=String(value||'');root.append(p);}
 return root;
}
(async()=>{
 try{
  const r=await fetch('/api/content',{headers:{Accept:'application/json'},cache:'no-store'});if(!r.ok)throw Error('Content unavailable');
  const data=await r.json(),post=(data.posts||[]).find(x=>x.slug===slug);
  if(!post)throw Error('यह पोस्ट उपलब्ध नहीं है या अभी प्रकाशित नहीं हुई है।');
  document.documentElement.lang='hi';document.title=(post.title||'Update')+' | GovJobMitra';
  set('postTitle',post.title);set('postType',post.type);set('postCategory',post.type);
  set('postDate',post.publishedAt?new Date(post.publishedAt).toLocaleDateString('hi-IN'):'');
  set('postDepartment',post.department||'');
  const body=el('postBody');body.replaceChildren(safeBody(post.body));
  if(post.imageUrl){const img=document.createElement('img');img.src=post.imageUrl;img.alt=post.title||'GovJobMitra update';img.loading='lazy';body.prepend(img);}
  const links=el('postLinks');
  if(post.notificationUrl){const a=document.createElement('a');a.href=post.notificationUrl;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Official Notification ↗';links.append(a);}
  if(post.applyUrl){const a=document.createElement('a');a.href=post.applyUrl;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Apply Online ↗';links.append(a);}
  const description=(post.seo||post.excerpt||post.title||'GovJobMitra update').slice(0,155);
  let meta=document.querySelector('meta[name="description"]');if(meta)meta.content=description;
  let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=location.href.split('#')[0];
 }catch(error){
  el('postBody').innerHTML='';const p=document.createElement('p');p.className='post-error';p.textContent=error.message||'पोस्ट लोड नहीं हो सकी। कृपया बाद में प्रयास करें।';el('postBody').append(p);
 }
})();