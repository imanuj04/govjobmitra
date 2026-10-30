function decodeEntities(value) {
 return value.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));
}
function clean(value){return decodeEntities((value||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim());}
function readTag(xml,name){const m=xml.match(new RegExp("<"+name+"(?:\\s[^>]*)?>([\\s\\S]*?)</"+name+">","i"));return m?m[1]:"";}
async function readFeed(url,category,categoryLabel){
 const response=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (compatible; GovJobMitra/1.0)","Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml"},cf:{cacheTtl:180}});
 if(!response.ok)throw new Error("Feed HTTP "+response.status);const xml=await response.text();if(!/<(?:rss|feed|rdf:RDF)\b/i.test(xml))throw new Error("Feed response was not RSS");
 return [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(match=>{
  const raw=match[2],title=clean(readTag(raw,"title")),linkText=clean(readTag(raw,"link")),linkAttr=(raw.match(/<link\b[^>]*\bhref=["']([^"']+)["']/i)||[])[1]||"";
  const encoded=readTag(raw,"content:encoded")||readTag(raw,"content"),summary=readTag(raw,"description")||readTag(raw,"summary");
  const description=clean(summary||encoded),fullContent=encoded&&clean(encoded).length>description.length?encoded:"";
  const date=clean(readTag(raw,"pubDate")||readTag(raw,"published")||readTag(raw,"updated")||readTag(raw,"dc:date"));
  const image=(raw.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*(?:url|href)=["']([^"']+)["']/i)||[])[1]||((encoded||"").match(/<img[^>]+src=["']([^"']+)["']/i)||[])[1]||"";
  const author=clean(readTag(raw,"author")||readTag(raw,"dc:creator"));
  return {title,link:(linkText||linkAttr).trim(),source:clean(readTag(raw,"source")||author),description,fullContent,publishedAt:date,image,category,categoryLabel};
 }).filter(item=>item.title&&/^https?:\/\//i.test(item.link));
}
async function safeFeed(url,category,label){try{return await readFeed(url,category,label);}catch{return[];}}
function googleFeed(query,lang,category,label){
 const q=encodeURIComponent(query);
 const hl=lang==="hi"?"hi":"en-IN",ceid=lang==="hi"?"IN:hi":"IN:en";
 return safeFeed("https://news.google.com/rss/search?q="+q+"&hl="+hl+"&gl=IN&ceid="+ceid,category,label);
}
async function collectHindi(){
 const feeds=[
  googleFeed("भारत राजनीति OR संसद OR सरकार OR चुनाव","hi","politics","राजनीति"),
  safeFeed("https://feeds.bbci.co.uk/hindi/rss.xml","world","दुनिया और समाचार"),
  safeFeed("https://hindi.oneindia.com/rss/feeds/hindi-news-fb.xml","politics","राजनीति और देश"),
  googleFeed("भारत खेल OR क्रिकेट OR हॉकी OR बैडमिंटन OR टेनिस","hi","sports","खेल"),
  safeFeed("https://hindi.oneindia.com/rss/feeds/hindi-sports-fb.xml","sports","खेल"),
  googleFeed("विश्व समाचार OR अंतरराष्ट्रीय","hi","world","दुनिया"),
  safeFeed("https://hindi.oneindia.com/rss/feeds/hindi-international-fb.xml","world","दुनिया"),
  googleFeed("भारत मौसम OR मौसम विभाग OR IMD बारिश OR मानसून","hi","weather","मौसम"),
  googleFeed("भारत सामान्य ज्ञान OR करेंट अफेयर्स OR विज्ञान OR अंतरिक्ष OR पुरस्कार OR नियुक्ति","hi","gk","GK और करेंट अफेयर्स"),
  googleFeed("आज के करेंट अफेयर्स सामान्य ज्ञान विज्ञान खोज भारत हिंदी","hi","gk","GK और करेंट अफेयर्स"),
  safeFeed("https://www.bhaskar.com/rss-v1--category-1061.xml","gk","GK और करेंट अफेयर्स")
 ];
 const groups=await Promise.all(feeds);\n return filterAndMerge(groups.map(items=>items.filter(item=>/[\\u0900-\\u097F]/.test(item.title))),50);
}
async function collectEnglish(){
 const feeds=[
  safeFeed("https://indianexpress.com/section/politics/feed/","politics","Politics"),
  safeFeed("https://news.abplive.com/news/india/feed","politics","India & Politics"),
  safeFeed("https://indianexpress.com/section/sports/feed/","sports","Sports"),
  safeFeed("https://news.abplive.com/sports/feed","sports","Sports"),
  safeFeed("https://indianexpress.com/section/world/feed/","world","World"),
  safeFeed("https://news.abplive.com/news/world/feed","world","World"),
  safeFeed("https://indianexpress.com/section/weather/feed/","weather","Weather"),
  googleFeed("India weather IMD forecast monsoon heatwave","en","weather","Weather"),
  safeFeed("https://indianexpress.com/section/upsc-current-affairs/feed/","gk","GK & Current Affairs"),
  googleFeed("India general knowledge current affairs science space awards appointments","en","gk","GK & Current Affairs")
 ];
 return filterAndMerge(await Promise.all(feeds),35);
}
const unwanted=/\b(murder|rape|robbery|theft|kidnap|crime|criminal|accident|shootout|stabbing|suicide|dead body|dacoity|loot|assault)\b|हत्या|बलात्कार|लूट|डकैती|चोरी|अपहरण|दुष्कर्म|हादसा|एक्सीडेंट|शव|आत्महत्या|मारपीट/i;
function filterAndMerge(groups,limit){
 const seen=new Set(),result=[];let cursor=0,added=true;
 while(result.length<limit&&added){added=false;for(const items of groups){if(cursor>=items.length)continue;const item=items[cursor];if(!item)continue;const text=item.title+" "+item.description;if(unwanted.test(text))continue;const key=item.title.toLocaleLowerCase();if(!seen.has(key)){seen.add(key);result.push(item);added=true;if(result.length>=limit)break;}}cursor++;}
 return result;
}
function merge(groups,limit){const seen=new Set(),result=[];for(const items of groups)for(const item of items){const key=item.title.toLocaleLowerCase();if(!seen.has(key)){seen.add(key);result.push(item);}if(result.length>=limit)return result;}return result;}
export async function onRequestGet(){
 const [h,e]=await Promise.allSettled([collectHindi(),collectEnglish()]),hindi=h.status==="fulfilled"?h.value:[],english=e.status==="fulfilled"?e.value:[];
 return Response.json({hindi,english,updatedAt:new Date().toISOString(),status:{hindi:hindi.length?"ok":"empty",english:english.length?"ok":"empty"}},{headers:{"Cache-Control":"public, max-age=60, s-maxage=60","Access-Control-Allow-Origin":"*"}});
}
