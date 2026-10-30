const TOPICS = [
  { key: "jobs", label: "Jobs & Recruitment", query: '"government jobs" OR recruitment OR vacancy OR UPSC OR SSC OR railway jobs' },
  { key: "exams", label: "Exams & Results", query: '"exam notification" OR "exam result" OR "admit card" OR "answer key" OR entrance exam' },
  { key: "government", label: "Government & Policy", query: 'government policy OR ministry OR parliament OR cabinet OR public scheme' },
  { key: "world", label: "World & Politics", query: '"world politics" OR election OR parliament OR diplomacy OR international policy' },
  { key: "weather", label: "Weather & Alerts", query: '"weather alert" OR cyclone OR rainfall OR heatwave OR flood OR storm' },
  { key: "sports", label: "Sports", query: 'sports OR cricket OR football OR Olympics OR tournament OR championship' }
];

const LANGS = {
  hindi: { hl: "hi", ceid: "IN:hi" },
  english: { hl: "en-IN", ceid: "IN:en" }
};

function decodeEntities(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
function clean(value) {
  return decodeEntities(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}
function readTag(xml, name) {
  const match = xml.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">", "i"));
  return match ? clean(match[1]) : "";
}
async function readFeed(url, category, categoryLabel) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GovJobMitra/1.0)", "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml" },
    cf: { cacheTtl: 300, cacheEverything: true }
  });
  if (!response.ok) throw new Error("RSS HTTP " + response.status);
  const xml = await response.text();
  if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error("Not RSS");
  return [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map(match => {
    const raw = match[2], title = readTag(raw, "title");
    const linkText = readTag(raw, "link");
    const linkAttr = (raw.match(/<link\b[^>]*\bhref=["']([^"']+)["']/i) || [])[1] || "";
    const link = linkText || linkAttr;
    const source = readTag(raw, "source") || readTag(raw, "author");
    const description = readTag(raw, "description") || readTag(raw, "summary");
    return { title, link: link.trim(), source, description, category, categoryLabel };
  }).filter(x => x.title && /^https?:\/\//i.test(x.link));
}
async function collect(language, limit = 45) {
  const lang = LANGS[language];
  const tasks = TOPICS.map(topic => {
    const q = encodeURIComponent(topic.query);
    const url = "https://news.google.com/rss/search?q=" + q + "&hl=" + lang.hl + "&gl=IN&ceid=" + lang.ceid;
    return readFeed(url, topic.key, topic.label);
  });
  // Include a primary official government information feed for government/policy updates.
  const officialUrl = language === "hindi"
    ? "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3"
    : "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3";
  tasks.splice(2, 0, readFeed(officialUrl, "government", "Government & Policy"));
  const batches = await Promise.allSettled(tasks);
  const seen = new Set(), result = [];
  for (const batch of batches) {
    if (batch.status !== "fulfilled") continue;
    for (const item of batch.value) {
      const key = item.title.toLocaleLowerCase();
      if (!seen.has(key)) { seen.add(key); result.push(item); }
      if (result.length >= limit) return result;
    }
  }
  return result;
}
export async function onRequestGet() {
  const [hindi, english] = await Promise.all([collect("hindi"), collect("english")]);
  return Response.json({ hindi, english, updatedAt: new Date().toISOString() }, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=300", "Access-Control-Allow-Origin": "*" }
  });
}
