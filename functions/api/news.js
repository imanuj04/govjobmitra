function decodeEntities(value) {
  return value.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));
}
function clean(value){return decodeEntities((value||"").replace(/<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>/g,"$1").replace(/<script[\\s\\S]*?<\\/script>/gi," ").replace(/<style[\\s\\S]*?<\\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\\s+/g," ").trim());}
function readTag(xml,name){const m=xml.match(new RegExp("<"+name+"(?:\\\\s[^>]*)?>([\\\\s\\S]*?)</"+name+">","i"));return m?m[1]:"";}
async function readFeed(url,category,categoryLabel){
 const response=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (compatible; GovJobMitra/1.0)","Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml"},cf:{cacheTtl:180}});
 if(!response.ok)throw new Error("Feed HTTP "+response.status);const xml=await response.text();if(!/<(?:rss|feed|rdf:RDF)\\b/i.test(xml))throw new Error("Feed response was not RSS");
 return [...xml.matchAll(/<(item|entry)(?:\\s[^>]*)?>([\\s\\S]*?)<\\/\\1>/gi)].map(match=>{
  const raw=match[2],title=clean(readTag(raw,"title")),linkText=clean(readTag(raw,"link")),linkAttr=(raw.match(/<link\\b[^>]*\\bhref=["']([^"']+)["']/i)||[])[1]||"";
  const encoded=readTag(raw,"content:encoded")||readTag(raw,"content"),description=clean(readTag(raw,"description")||readTag(raw,"summary")||encoded);
  const date=clean(readTag(raw,"pubDate")||readTag(raw,"published")||readTag(raw,"updated")||readTag(raw,"dc:date"));
  const image=(raw.match(/<(?:media:content|media:thumbnail|enclosure)\\b[^>]*(?:url|href)=["']([^"']+)["']/i)||[])[1]||((encoded||"").match(/<img[^>]+src=["']([^"']+)["']/i)||[])[1]||"";
  const author=clean(readTag(raw,"author")||readTag(raw,"dc:creator"));
  return {title,link:(linkText||linkAttr).trim(),source:clean(readTag(raw,"source")||author),description,content:clean(encoded),publishedAt:date,image,category,categoryLabel};
 }).filter(item=>item.title&&/^https?:\\/\\//i.test(item.link));
}
async function safeFeed(url,category,label){try{return await readFeed(url,category,label);}catch{return[];}}
async function collectHindi(){
 const feeds=[safeFeed("https://feeds.bbci.co.uk/hindi/rss.xml","world","भारत और दुनिया"),safeFeed("https://www.aajtak.in/rssfeeds/?id=home","government","ताज़ा खबरें"),safeFeed("https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi","government","सरकारी और देश की खबरें"),safeFeed("https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3","government","सरकारी सूचना")];
 return merge(await Promise.all(feeds),30);
}
async function collectEnglish(){
 const feeds=[safeFeed("https://feeds.bbci.co.uk/news/india/rss.xml","government","India"),safeFeed("https://feeds.bbci.co.uk/news/world/rss.xml","world","World"),safeFeed("https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en","government","Latest India News"),safeFeed("https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3","government","Government Updates")];
 return merge(await Promise.all(feeds),30);
}
function merge(groups,limit){const seen=new Set(),result=[];for(const items of groups)for(const item of items){const key=item.title.toLocaleLowerCase();if(!seen.has(key)){seen.add(key);result.push(item);}if(result.length>=limit)return result;}return result;}
export async function onRequestGet(){
 const [h,e]=await Promise.allSettled([collectHindi(),collectEnglish()]),hindi=h.status==="fulfilled"?h.value:[],english=e.status==="fulfilled"?e.value:[];
 return Response.json({hindi,english,updatedAt:new Date().toISOString(),status:{hindi:hindi.length?"ok":"empty",english:english.length?"ok":"empty"}},{headers:{"Cache-Control":"public, max-age=60, s-maxage=60","Access-Control-Allow-Origin":"*"}});
}
