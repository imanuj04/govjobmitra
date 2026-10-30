const FEEDS = {
  hindi: [
    "https://feeds.bbci.co.uk/hindi/rss.xml",
    "https://www.aajtak.in/rssfeeds/?id=home",
    "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    "https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi"
  ],
  english: [
    "https://feeds.bbci.co.uk/news/india/rss.xml",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3",
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
  ]
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
async function readFeed(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GovJobMitra/1.0)", "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml" },
    cf: { cacheTtl: 300, cacheEverything: true }
  });
  if (!response.ok) throw new Error("HTTP " + response.status);
  const xml = await response.text();
  if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error("Not an RSS/Atom document");
  const blocks = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)];
  return blocks.map(match => {
    const raw = match[2];
    const title = readTag(raw, "title");
    const linkText = readTag(raw, "link");
    const linkAttr = (raw.match(/<link\b[^>]*\bhref=["']([^"']+)["']/i) || [])[1] || "";
    const link = linkText || linkAttr;
    const source = readTag(raw, "source") || readTag(raw, "author");
    return { title, link: link.trim(), source };
  }).filter(x => x.title && /^https?:\/\//i.test(x.link));
}
async function collect(urls, limit = 20) {
  const batches = await Promise.allSettled(urls.map(readFeed));
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
  const [hindi, english] = await Promise.all([collect(FEEDS.hindi), collect(FEEDS.english)]);
  return Response.json({ hindi, english, updatedAt: new Date().toISOString() }, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=300", "Access-Control-Allow-Origin": "*" }
  });
}
