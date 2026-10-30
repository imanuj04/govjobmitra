const SOURCES=[
 {name:"UPSC Recruitment",url:"https://www.upsc.gov.in/recruitment/recruitment-advertisement",kind:"official"},
 {name:"SSC",url:"https://ssc.gov.in/",kind:"official"},
 {name:"Employment News",url:"https://employmentnews.gov.in/NewEmp/AllJobs.aspx?k=All",kind:"government portal"},
 {name:"India Post Vacancies",url:"https://www.indiapost.gov.in/vacancies",kind:"official"},
 {name:"MP Rojgar",url:"https://mprojgar.gov.in/home",kind:"state portal"}
];
const TERMS=/recruit|vacan|advertisement|notification|career|job|post|application|selection|engagement|apprentice|constable|officer|assistant|engineer|clerk|teacher|भर्ती|रिक्ति|विज्ञापन|नियुक्ति/i;
function decode(s){return s.replace(/&amp;/g,"&").replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g," ");}
async function scan(source){
 try{
  const response=await fetch(source.url,{headers:{"User-Agent":"Mozilla/5.0 GovJobMitra vacancy monitor","Accept":"text/html,application/xhtml+xml"},cf:{cacheTtl:300}});
  if(!response.ok)throw new Error("HTTP "+response.status);
  const html=await response.text();
  const links=[...html.matchAll(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)];
  const items=[];
  for(const m of links){
   const label=decode(m[4].replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim());
   if(!label||label.length<5||!TERMS.test(label))continue;
   let href=m[2].replace(/&amp;/g,"&");
   try{href=new URL(href,source.url).href;}catch{continue;}
   if(!/^https?:/.test(href))continue;
   if(items.some(x=>x.url===href))continue;
   items.push({title:label.slice(0,220),url:href,source:source.name});
   if(items.length>=15)break;
  }
  return {source:source.name,url:source.url,status:"ok",count:items.length,items};
 }catch(e){return {source:source.name,url:source.url,status:"unavailable",count:0,error:String(e).slice(0,120),items:[]};}
}
export async function onRequestGet(){
 const results=await Promise.all(SOURCES.map(scan));
 const items=results.flatMap(x=>x.items);
 return Response.json({checkedAt:new Date().toISOString(),sources:results,items},{headers:{"Cache-Control":"public, max-age=300, s-maxage=300","Access-Control-Allow-Origin":"*"}});
}