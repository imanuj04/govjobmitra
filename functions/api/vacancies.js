const FEEDS=[
 {name:"FreeJobAlert",url:"https://www.freejobalert.com/feed/"},
 {name:"Sarkari Result",url:"https://news.google.com/rss/search?q="+encodeURIComponent('site:sarkariresult.com (recruitment OR vacancy OR notification OR "online form") when:14d')+"&hl=en-IN&gl=IN&ceid=IN:en"},
 {name:"Jagran Josh",url:"https://news.google.com/rss/search?q="+encodeURIComponent('site:jagranjosh.com (government job OR recruitment OR vacancy OR sarkari naukri) when:14d')+"&hl=en-IN&gl=IN&ceid=IN:en"},
 {name:"Testbook",url:"https://news.google.com/rss/search?q="+encodeURIComponent('site:testbook.com/news (recruitment OR vacancy OR notification OR "apply online") when:14d')+"&hl=en-IN&gl=IN&ceid=IN:en"},
 {name:"Employment News",url:"https://news.google.com/rss/search?q="+encodeURIComponent('site:employmentnews.gov.in (recruitment OR vacancy OR notification OR "employment news") when:14d')+"&hl=en-IN&gl=IN&ceid=IN:en"}
];
const JOB=/recruit|vacan|advertisement|notification|career|job|post|application|selection|engagement|apprentice|constable|officer|assistant|engineer|clerk|teacher|walk.?in|भर्ती|रिक्ति|विज्ञापन|नियुक्ति|नौकरी|रोजगार|ऑनलाइन फॉर्म|आवेदन/i;
const EXCLUDE=/result|answer key|admit card|hall ticket|syllabus|exam analysis|cut.?off|score card|merit list|रिजल्ट|उत्तर कुंजी|प्रवेश पत्र/i;
function clean(s){return(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();}
function rawTag(xml,name){const m=xml.match(new RegExp("<"+name+"(?:\\s[^>]*)?>([\\s\\S]*?)</"+name+">","i"));return m?m[1]:"";}
function tag(xml,name){return clean(rawTag(xml,name));}
async function readFeed(feed){
 try{
  const r=await fetch(feed.url,{headers:{"User-Agent":"Mozilla/5.0 GovJobMitra Vacancy Scanner","Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml"},cf:{cacheTtl:180}});
  if(!r.ok)throw new Error("HTTP "+r.status);
  const xml=await r.text();if(!/<(?:rss|feed|rdf:RDF)\b/i.test(xml))throw new Error("Not an RSS/Atom feed");
  const entries=[...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)],items=[];
  for(const e of entries){
   const raw=e[2],title=tag(raw,"title"),link=tag(raw,"link")||((raw.match(/<link\b[^>]*href=["']([^"']+)["']/i)||[])[1]||""),date=tag(raw,"pubDate")||tag(raw,"published")||tag(raw,"updated"),desc=tag(raw,"description")||tag(raw,"summary"),source=tag(raw,"source")||feed.name;
   if(!title||!JOB.test(title)||EXCLUDE.test(title)||!/^https?:\/\//i.test(link))continue;
   const d=date?new Date(date):null;if(d&&!Number.isNaN(d.getTime())&&Date.now()-d.getTime()>14*86400000)continue;
   const category=/apprentice|प्रशिक्षु/i.test(title)?"Apprenticeship":/teacher|professor|faculty|शिक्षक|अध्यापक/i.test(title)?"Teaching":/police|constable|army|navy|air force|defence|defense|सीआरपीएफ|पुलिस|सेना/i.test(title)?"Police & Defence":/railway|rrb|रेलवे/i.test(title)?"Railway":/bank|ibps|sbi|rbi/i.test(title)?"Banking":/ssc|upsc|psc| लोक सेवा/i.test(title)?"Central / State Exams":"Other Government Jobs";
   items.push({title,url:link,publishedAt:d&&!Number.isNaN(d.getTime())?d.toISOString():"",dateLabel:date||"Recent feed item",description:desc.slice(0,500),source,category});
  }
  return {feed:feed.name,status:"ok",items};
 }catch(err){return {feed:feed.name,status:"unavailable",error:String(err).slice(0,120),items:[]};}
}
export async function onRequestGet(){
 const results=await Promise.all(FEEDS.map(readFeed)),seen=new Set(),items=[];
 for(const group of results)for(const item of group.items){
  const key=item.title.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
  if(!key||seen.has(key))continue;seen.add(key);items.push({...item,portal:group.feed});
 }
 items.sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
 return Response.json({checkedAt:new Date().toISOString(),feeds:results.map(x=>({name:x.feed,status:x.status,count:x.items.length,error:x.error||""})),items:items.slice(0,120)},{headers:{"Cache-Control":"public, max-age=180, s-maxage=180","Access-Control-Allow-Origin":"*"}});
}
