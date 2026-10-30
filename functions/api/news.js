const FEEDS = {
  hindi: [
    "https://news.google.com/rss?hl=hi&gl=IN&ceid=IN:hi",
    "https://news.google.com/rss/search?q=India+government+education+jobs&hl=hi&gl=IN&ceid=IN:hi",
    "https://news.google.com/rss/search?q=India+breaking+news&hl=hi&gl=IN&ceid=IN:hi"
  ],
  english: [
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=India+government+education+technology&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=world+business+sports+India&hl=en-IN&gl=IN&ceid=IN:en"
  ]
};

function decodeEntities(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
function tag(item, name) {
  const match = item.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">", "i"));
  return match ? decodeEntities(match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim()) : "";
}
async function readFeed(url) {
  const response = await fetch(url, { headers: { "User-Agent": "GovJobMitraNewsTicker/1.0", "Accept": "application/rss+xml, application/xml, text/xml" }, cf: { cacheTtl: 300, cacheEverything: true } });
  if (!response.ok) throw new Error("RSS feed HTTP " + response.status);
  const xml = await response.text();
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(match => {
    const raw = match[1];
    const title = tag(raw, "title");
    const link = tag(raw, "link") || ((raw.match(/<link[^>]*href=["']([^"']+)["']/i) || [])[1] || "");
    const source = tag(raw, "source");
    return { title: title.replace(/\s+/g, " ").trim(), link: link.trim(), source: source.replace(/\s+/g, " ").trim() };
  }).filter(x => x.title && /^https:\/\//i.test(x.link));
  return items;
}
async function collect(urls, limit = 18) {
  const batches = await Promise.allSettled(urls.map(readFeed));
  const seen = new Set(), result = [];
  for (const batch of batches) {
    if (batch.status !== "fulfilled") continue;
    for (const item of batch.value) {
      const key = item.title.toLowerCase();
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
