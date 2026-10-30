function decode(s){return(s||"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));}
function attr(tag,name){const re=new RegExp("\\b"+name+"\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))","i");const m=tag.match(re);return m?(m[1]??m[2]??m[3]??""):"";}
function meta(html,key,attribute="property"){for(const tag of html.matchAll(/<meta\b[^>]*>/gi)){const value=attr(tag[0],attribute);if(value.toLowerCase()===key.toLowerCase())return decode(attr(tag[0],"content"));}return "";}
function safeUrl(raw){let u;try{u=new URL(raw);}catch{return null;}if(!["http:","https:"].includes(u.protocol)||u.username||u.password)return null;const h=u.hostname.toLowerCase();if(h==="localhost"||h.endsWith(".localhost")||h.endsWith(".local")||/^127\.|^10\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\./.test(h)||h==="::1")return null;return u;}
export async function onRequestGet({request}){
 const req=new URL(request.url),target=safeUrl(req.searchParams.get("url")||"");if(!target)return Response.json({error:"Invalid article URL"},{status:400});
 try{
  const r=await fetch(target.href,{headers:{"User-Agent":"Mozilla/5.0 (compatible; GovJobMitraReader/1.0)","Accept":"text/html,application/xhtml+xml"},redirect:"follow",cf:{cacheTtl:300}});
  if(!r.ok)throw new Error("Article page HTTP "+r.status);
  const final=safeUrl(r.url);if(!final)throw new Error("Unsafe redirect");
  const html=(await r.text()).slice(0,1800000);
  const image=meta(html,"og:image")||meta(html,"twitter:image","name");
  let imageUrl="";try{imageUrl=image?new URL(image,final.href).href:"";}catch{}
  const title=meta(html,"og:title")||meta(html,"twitter:title","name")||((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||"").replace(/<[^>]+>/g," ").trim();
  const description=meta(html,"og:description")||meta(html,"description","name")||meta(html,"twitter:description","name");
  const published=meta(html,"article:published_time")||meta(html,"datePublished","itemprop");
  const headings=[...html.matchAll(/<h[2-3]\b[^>]*>([\s\S]*?)<\/h[2-3]>/gi)].map(m=>decode(m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim())).filter(x=>x.length>8).slice(0,5);
  return Response.json({title:decode(title),description:decode(description),image:imageUrl,published,headings},{headers:{"Cache-Control":"public, max-age=300, s-maxage=300","Access-Control-Allow-Origin":"*"}});
 }catch(e){return Response.json({error:String(e).slice(0,160)},{status:502,headers:{"Cache-Control":"no-store","Access-Control-Allow-Origin":"*"}});}
}
