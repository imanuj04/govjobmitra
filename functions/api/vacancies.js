const FEEDS=[
 {name:"Google News · Government jobs",url:"https://news.google.com/rss/search?q="+encodeURIComponent('(government recruitment OR sarkari naukri OR vacancy) India when:1')+"&hl=en-IN&gl=IN&ceid=IN:en"},
 {name:"Google News · Hindi jobs",url:"https://news.google.com/rss/search?q="+encodeURIComponent('(सरकारी भर्ती OR सरकारी नौकरी OR रिक्तियां) India when:1')+"&hl=hi&gl=IN&ceid=IN:hi"},
 {name:"YouTube job updates",url:"https://news.google.com/rss/search?q="+encodeURIComponent('site:youtube.com/watch (government job OR sarkari naukri OR vacancy) India when:7')+"&hl=en-IN&gl=IN&ceid=IN:en"},
 {name:"Government recruitment feed",url:"https://www.indgovtjobs.in/feeds/posts/default?alt=rss"},
 {name:"PIB official releases",url:"https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3"}
];
const JOB=/recruit|vacan|advertisement|notification|career|job|post|application|selection|engagement|apprentice|constable|officer|assistant|engineer|clerk|teacher|भर्ती|रिक्ति|विज्ञापन|नियुक्ति|नौकरी|रोजगार/i;
function clean(s){return(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();}
function tag(xml,name){const m=xml.match(new RegExp("<"+name+"(?:\\s[^>]*)?>([\\s\\S]*?)</"+name+">","i"));return m?clean(m[1]):"";}
async function readFeed(feed){
 try{
  const r=await fetch(feed.url,{headers:{"User-Agent":"Mozilla/5.0 GovJobMitra RSS reader","Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml"},cf:{cacheTtl:180}});
  if(!r.ok)throw new Error("HTTP "+r.status);
  const xml=await r.text(),entries=[...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)],items=[];
  for(const e of entries){
   const raw=e[2],title=tag(raw,"title"),link=tag(raw,"link")||((raw.match(/<link\b[^>]*href=["']([^"']+)["']/i)||[])[1]||""),date=tag(raw,"pubDate")||tag(raw,"published")||tag(raw,"updated"),desc=tag(raw,"description")||tag(raw,"summary");
   if(!title||!JOB.test(title)||!/^https?:\/\//i.test(link))continue;
   const d=date?new Date(date):null;if(d&&!Number.isNaN(d.getTime())&&Date.now()-d.getTime()>8*86400000)continue;
   items.push({title,url:link,publishedAt:d&&!Number.isNaN(d.getTime())?d.toISOString():"",dateLabel:date||"Recent feed item",description:desc.slice(0,400)});
  }
  return {feed:feed.name,status:"ok",items};
 }catch(err){return {feed:feed.name,status:"unavailable",error:String(err).slice(0,100),items:[]};}
}
export async function onRequestGet(){
 const results=await Promise.all(FEEDS.map(readFeed)),seen=new Set(),items=[];
 for(const group of results)for(const item of group.items){
  const key=item.title.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
  if(!key||seen.has(key))continue;seen.add(key);items.push({...item,source:group.feed});
 }
 items.sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
 return Response.json({checkedAt:new Date().toISOString(),feeds:results.map(x=>({name:x.feed,status:x.status,count:x.items.length,error:x.error||""})),items:items.slice(0,100)},{headers:{"Cache-Control":"public, max-age=180, s-maxage=180","Access-Control-Allow-Origin":"*"}});
}
