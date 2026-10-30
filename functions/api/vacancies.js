const SOURCES=[
 {name:"UPSC Recruitment",url:"https://www.upsc.gov.in/recruitment/recruitment-advertisement",kind:"official"},
 {name:"SSC",url:"https://ssc.gov.in/",kind:"official"},
 {name:"Employment News",url:"https://employmentnews.gov.in/NewEmp/AllJobs.aspx?k=All",kind:"government portal"},
 {name:"India Post Vacancies",url:"https://www.indiapost.gov.in/VAS/Pages/Content/Recruitments.aspx?Category=Recruitment",kind:"official"},
 {name:"MP Rojgar",url:"https://mprojgar.gov.in/home",kind:"state portal"},
 {name:"ISRO Careers",url:"https://www.isro.gov.in/ViewAllOpportunities.html",kind:"official"},
 {name:"DSSSB",url:"https://dsssb.delhi.gov.in/",kind:"official"}
];
const SEARCHES=[
 "government job vacancy recruitment notification India",
 "sarkari naukri new vacancy recruitment India",
 "government recruitment notification Madhya Pradesh vacancy",
 "site:youtube.com/watch government job vacancy recruitment India"
];
const TERMS=/recruit|vacan|advertisement|notification|career|job|post|application|selection|engagement|apprentice|constable|officer|assistant|engineer|clerk|teacher|भर्ती|रिक्ति|विज्ञापन|नियुक्ति/i;
function clean(s){return (s||"").replace(/<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>/g,"$1").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g," ").replace(/&#(\\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\\s+/g," ").trim();}
function extract(xml,tag){const m=xml.match(new RegExp("<"+tag+"(?:\\s[^>]*)?>([\\s\\S]*?)</"+tag+">","i"));return m?clean(m[1]):"";}
async function scan(source){
 try{
  const response=await fetch(source.url,{headers:{"User-Agent":"Mozilla/5.0 (compatible; GovJobMitraBot/1.0)","Accept":"text/html,application/xhtml+xml"},cf:{cacheTtl:300}});
  if(!response.ok)throw new Error("HTTP "+response.status);
  const html=await response.text(),links=[...html.matchAll(/<a\\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\\s\\S]*?)<\\/a>/gi)],items=[];
  for(const m of links){
   const label=clean(m[4]);if(!label||label.length<5||!TERMS.test(label))continue;
   let href=m[2].replace(/&amp;/g,"&");try{href=new URL(href,source.url).href;}catch{continue;}
   if(!/^https?:/.test(href)||items.some(x=>x.url===href))continue;
   items.push({title:label.slice(0,220),url:href,source:source.name,kind:"Official portal",publishedAt:"",dateLabel:"Date not shown on listing"});
   if(items.length>=20)break;
  }
  return {source:source.name,url:source.url,status:"ok",count:items.length,items};
 }catch(e){return {source:source.name,url:source.url,status:"unavailable",count:0,error:String(e).slice(0,120),items:[]};}
}
async function searchFeed(query){
 const url="https://news.google.com/rss/search?q="+encodeURIComponent(query+" when:30d")+"&hl=en-IN&gl=IN&ceid=IN:en";
 try{
  const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 GovJobMitraBot/1.0","Accept":"application/rss+xml, application/xml, text/xml"},cf:{cacheTtl:300}});
  if(!r.ok)throw new Error("HTTP "+r.status);const xml=await r.text(),entries=[...xml.matchAll(/<item>([\\s\\S]*?)<\\/item>/gi)],items=[];
  for(const entry of entries.slice(0,15)){
   const block=entry[1],title=extract(block,"title"),link=extract(block,"link"),pub=extract(block,"pubDate"),desc=extract(block,"description");
   if(!title||!link||!TERMS.test(title))continue;
   const date=pub?new Date(pub):null;if(date&&!Number.isNaN(date.getTime())&&Date.now()-date.getTime()>31*86400000)continue;
   let finalUrl=link;try{finalUrl=new URL(link).href;}catch{continue;}
   const isYoutube=/youtube\\.com|youtu\\.be/i.test(finalUrl);
   items.push({title,url:finalUrl,source:isYoutube?"YouTube via search":"Google News search",kind:isYoutube?"YouTube result":"Search result",publishedAt:date&&!Number.isNaN(date.getTime())?date.toISOString():"",dateLabel:pub||"Date not supplied",description:desc.slice(0,360)});
  }
  return {query,status:"ok",count:items.length,items};
 }catch(e){return {query,status:"unavailable",count:0,error:String(e).slice(0,120),items:[]};}
}
export async function onRequestGet(){
 const [portalResults,searchResults]=await Promise.all([Promise.all(SOURCES.map(scan)),Promise.all(SEARCHES.map(searchFeed))]);
 const seen=new Set(),items=[];
 for(const item of [...searchResults.flatMap(x=>x.items),...portalResults.flatMap(x=>x.items)]){
  const key=(item.url||"").split("?")[0].toLowerCase();if(!key||seen.has(key))continue;seen.add(key);items.push(item);
 }
 items.sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0));
 return Response.json({checkedAt:new Date().toISOString(),searches:searchResults,sources:portalResults,items:items.slice(0,100),total:items.length},{headers:{"Cache-Control":"public, max-age=300, s-maxage=300","Access-Control-Allow-Origin":"*"}});
}
