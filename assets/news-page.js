const params=new URLSearchParams(location.search);
const title=params.get('title')||'News update',articleUrl=params.get('url')||'',category=params.get('category')||'Latest update',excerpt=params.get('description')||'',fullContent=params.get('content')||'',date=params.get('date')||'',feedImage=params.get('image')||'',lang=params.get('lang')||'en',hi=lang==='hi';
const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
document.documentElement.lang=hi?'hi':'en';document.title=title+' | GovJobMitra';set('newsTitle',title);set('newsCategory',category);set('newsCategoryTag',category);set('year',new Date().getFullYear());set('newsMeta',date&&!Number.isNaN(Date.parse(date))?new Date(date).toLocaleString(hi?'hi-IN':'en-IN'):(hi?'ताज़ा अपडेट':'Latest update'));set('readingLabel',hi?'खबर का विवरण':'News details');set('readMoreLabel',hi?'और खबरें पढ़ें':'Read more updates');
function plain(s){return(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}

function addSeoMeta(name,content,property=false){let el=document.querySelector((property?'meta[property="':'meta[name="')+name+'"]');if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',name);document.head.append(el);}el.content=content;}
function addOriginalBiharPmkisanArticle(){
 const match=/बिहार/.test(title)&&/किसान|सम्मान निधि|pm.?kisan/i.test(title+' '+excerpt);
 if(!match)return false;
 const heading=(text)=>{const h=document.createElement('h2');h.className='news-subhead';h.textContent=text;body.append(h);};
 const para=(text)=>{const p=document.createElement('p');p.textContent=text;body.append(p);};
 const list=(items)=>{const ul=document.createElement('ul');items.forEach(text=>{const li=document.createElement('li');li.textContent=text;ul.append(li);});body.append(ul);};
 const articleTitle='PM Kisan 24th Installment 2026: बिहार के 73 लाख किसानों को मिले ₹1,476 करोड़, जानें पूरी जानकारी';
 set('newsTitle',articleTitle);document.title=articleTitle+' | GovJobMitra';
 addSeoMeta('description','PM Kisan 24th Installment 2026 के तहत बिहार के 73 लाख से अधिक किसान परिवारों को ₹1,476 करोड़ मिले। जानें 24वीं किस्त, ₹2,000 भुगतान, पात्रता और स्टेटस चेक करने का तरीका।');
 addSeoMeta('keywords','PM Kisan 24th Installment 2026, Bihar PM Kisan 24th Kist, PM Kisan 2000 रुपये, PM Kisan status check, किसान सम्मान निधि');
 addSeoMeta('robots','index,follow');
 const canonical='https://govjobmitra.pages.dev/news.html?story=pm-kisan-bihar-24';
 let canon=document.querySelector('link[rel="canonical"]');if(!canon){canon=document.createElement('link');canon.rel='canonical';document.head.append(canon);}canon.href=canonical;
 addSeoMeta('og:title',articleTitle,true);addSeoMeta('og:description','बिहार के 73 लाख से अधिक किसान परिवारों को पीएम किसान की 24वीं किस्त के तहत ₹1,476 करोड़ की राशि मिली।',true);
 body.replaceChildren();
 para('बिहार के किसानों के लिए 30 अक्टूबर 2026 को प्रधानमंत्री किसान सम्मान निधि योजना (PM-KISAN) की 24वीं किस्त जारी होने के साथ बड़ी राहत की खबर सामने आई। इस किस्त के तहत राज्य के 73 लाख से अधिक किसान परिवारों को कुल ₹1,476 करोड़ की आर्थिक सहायता मिलने की जानकारी दी गई है। राशि सीधे लाभार्थियों के बैंक खातों में डायरेक्ट बेनिफिट ट्रांसफर (DBT) के माध्यम से भेजी गई।');
 para('राष्ट्रीय स्तर पर प्रधानमंत्री नरेंद्र मोदी ने गुजरात के बनासकांठा में आयोजित कार्यक्रम से 9.34 करोड़ से अधिक पात्र किसानों के खातों में ₹18,690 करोड़ से ज्यादा की राशि ट्रांसफर की। यह पीएम किसान योजना की 24वीं किस्त है।');
 heading('बिहार के किसानों को कितनी राशि मिली?');
 para('बिहार के 73 लाख से अधिक किसान परिवारों के लिए इस किस्त के अंतर्गत ₹1,476 करोड़ जारी किए गए। योजना के नियमों के अनुसार पात्र किसान परिवार को एक किस्त में ₹2,000 मिलते हैं। यह भुगतान सीधे बैंक खाते में किया जाता है, इसलिए लाभार्थियों को किसी एजेंट या बिचौलिए को पैसे देने की जरूरत नहीं होती।');
 heading('PM Kisan योजना में सालाना कितने रुपये मिलते हैं?');
 para('प्रधानमंत्री किसान सम्मान निधि योजना के तहत पात्र किसान परिवारों को सालाना कुल ₹6,000 की आर्थिक सहायता दी जाती है। यह रकम ₹2,000 की तीन बराबर किस्तों में DBT के जरिए भेजी जाती है। इस सहायता का उद्देश्य खेती से जुड़े खर्चों—जैसे बीज, खाद, सिंचाई और अन्य कृषि जरूरतों—में किसानों को मदद देना है।');
 heading('24वीं किस्त का पैसा खाते में नहीं आया तो क्या करें?');
 para('यदि आपके खाते में किस्त की राशि दिखाई नहीं दे रही है, तो सबसे पहले आधिकारिक PM-KISAN पोर्टल पर जाकर Beneficiary Status जांचें। इसके बाद यह सुनिश्चित करें कि आपकी e-KYC पूरी है, बैंक खाता आधार से सही तरीके से जुड़ा है और भूमि रिकॉर्ड का सत्यापन पूरा है। बैंक खाते में नाम या विवरण की गलती होने पर संबंधित बैंक या कृषि विभाग से संपर्क करें।');
 list(['PM-KISAN पोर्टल खोलें: https://pmkisan.gov.in/','Farmers Corner या Know Your Status विकल्प चुनें।','मांगी गई जानकारी भरकर अपना लाभार्थी और भुगतान स्टेटस देखें।','e-KYC अधूरी हो तो आधिकारिक पोर्टल, अधिकृत CSC या उपलब्ध फेस ऑथेंटिकेशन सुविधा से प्रक्रिया पूरी करें।']);
 heading('पीएम किसान की किस्त पाने के लिए जरूरी बातें');
 list(['लाभार्थी का नाम योजना के पात्र किसान परिवार के रिकॉर्ड में होना चाहिए।','e-KYC पूरी होना जरूरी है।','आधार और बैंक खाते की जानकारी सही तथा अपडेट होनी चाहिए।','भूमि रिकॉर्ड और लाभार्थी विवरण का सत्यापन संबंधित राज्य प्राधिकरण द्वारा किया जाता है।']);
 heading('PM Kisan 24th Installment 2026: महत्वपूर्ण जानकारी');
 const table=document.createElement('table');table.style.width='100%';table.style.borderCollapse='collapse';
 [['योजना','प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)'],['किस्त','24वीं किस्त'],['जारी होने की तारीख','30 अक्टूबर 2026'],['बिहार के लाभार्थी','73 लाख से अधिक किसान परिवार'],['बिहार के लिए राशि','₹1,476 करोड़'],['देशभर के लाभार्थी','9.34 करोड़ से अधिक किसान'],['देशभर में जारी राशि','₹18,690 करोड़ से अधिक'],['एक किस्त की राशि','₹2,000'],['सालाना सहायता','₹6,000']].forEach(([a,b])=>{const tr=document.createElement('tr');[a,b].forEach(value=>{const td=document.createElement('td');td.textContent=value;td.style.border='1px solid #dbe3ee';td.style.padding='10px';tr.append(td);});table.append(tr);});body.append(table);
 heading('अक्सर पूछे जाने वाले सवाल (FAQs)');
 [['PM Kisan की 24वीं किस्त कब जारी हुई?','24वीं किस्त 30 अक्टूबर 2026 को जारी की गई।'],['बिहार के किसानों को कुल कितनी राशि मिली?','बिहार के 73 लाख से अधिक किसान परिवारों के लिए ₹1,476 करोड़ जारी किए गए।'],['एक किसान परिवार को कितने रुपये मिलते हैं?','पात्र किसान परिवार को प्रत्येक किस्त में ₹2,000 और सालाना कुल ₹6,000 मिलते हैं।'],['किस्त का स्टेटस कहां चेक करें?','लाभार्थी आधिकारिक वेबसाइट pmkisan.gov.in पर Know Your Status विकल्प से भुगतान की स्थिति देख सकते हैं।'],['e-KYC जरूरी है क्या?','हां, PM-KISAN के लिए e-KYC अनिवार्य है।']].forEach(([q,a])=>{heading(q);para(a);});
 heading('निष्कर्ष');
 para('पीएम किसान योजना की 24वीं किस्त से बिहार के 73 लाख से अधिक किसान परिवारों को ₹1,476 करोड़ की सहायता मिली है। लाभार्थियों को सलाह दी जाती है कि वे भुगतान की पुष्टि केवल आधिकारिक PM-KISAN पोर्टल और अपने बैंक खाते से करें। किसी अनजान व्यक्ति के साथ OTP, बैंक विवरण या संवेदनशील जानकारी साझा न करें।');
 const source=document.createElement('p');source.className='news-read-more';const link=document.createElement('a');link.href='https://pmkisan.gov.in/';link.target='_blank';link.rel='noopener noreferrer';link.textContent='आधिकारिक PM-KISAN वेबसाइट पर जाएं →';source.append(link);body.append(source);
 return true;
}

const body=document.getElementById('newsBody');body.replaceChildren();
function addImage(src){if(!src||!/^https?:\/\//i.test(src))return;const img=document.createElement('img');img.src=src;img.alt=title;img.loading='eager';img.className='news-hero-image';img.onload=()=>{if(img.naturalWidth<640)img.remove();};img.onerror=()=>img.remove();body.prepend(img);}
function renderFeedHtml(html){
 const doc=new DOMParser().parseFromString(html,'text/html'),allowed=new Set(['P','BR','B','STRONG','I','EM','U','H2','H3','UL','OL','LI','BLOCKQUOTE','A','IMG']);
 function appendSafe(parent,node){
  if(node.nodeType===Node.TEXT_NODE){parent.append(document.createTextNode(node.textContent));return;}
  if(node.nodeType!==Node.ELEMENT_NODE||!allowed.has(node.tagName)) {node.childNodes.forEach(child=>appendSafe(parent,child));return;}
  if(node.tagName==='IMG'){const src=node.getAttribute('src')||node.getAttribute('data-src')||'';if(/^https:\/\//i.test(src)){const img=document.createElement('img');img.src=src;img.alt=node.getAttribute('alt')||title;img.loading='lazy';img.className='news-inline-image';parent.append(img);}return;}
  const el=document.createElement(node.tagName.toLowerCase());
  if(node.tagName==='A'){const href=node.getAttribute('href')||'';if(/^https:\/\//i.test(href)){el.href=href;el.rel='nofollow noopener';el.target='_blank';}}
  node.childNodes.forEach(child=>appendSafe(el,child));parent.append(el);
 }
 doc.body.childNodes.forEach(node=>appendSafe(body,node));
}
const hasOriginalArticle=addOriginalBiharPmkisanArticle();
if(!hasOriginalArticle&&fullContent&&plain(fullContent).length>plain(excerpt).length+80){renderFeedHtml(fullContent);}
else if(!hasOriginalArticle&&excerpt){const p=document.createElement('p');p.textContent=plain(excerpt);body.append(p);}
else if(!hasOriginalArticle){const p=document.createElement('p');p.textContent=hi?'इस खबर की विस्तृत जानकारी लोड की जा रही है…':'Loading more details for this update…';body.append(p);}
if(feedImage)addImage(feedImage);
if(fullContent&&plain(fullContent).length>plain(excerpt).length+80){const note=document.createElement('p');note.className='news-reading-label';note.textContent=hi?'यह लेख उपलब्ध RSS feed के पूरे टेक्स्ट से दिखाया गया है।':'Full text displayed as supplied in the RSS feed.';body.append(note);}
async function loadArticle(){
 if(!articleUrl)return;
 try{
  const r=await fetch('/api/article?url='+encodeURIComponent(articleUrl),{cache:'no-store'});if(!r.ok)return;
  const data=await r.json();
  if(data.image&&!body.querySelector('.news-hero-image'))addImage(data.image);

  if(!hasOriginalArticle){
   const summary=plain(data.description||excerpt),points=Array.isArray(data.headings)?data.headings.filter(x=>x&&x.length>8):[];
   body.replaceChildren();if(feedImage)addImage(feedImage);else if(data.image)addImage(data.image);
   const addHeading=(value)=>{const h=document.createElement('h2');h.className='news-subhead';h.textContent=value;body.append(h);};
   const addPara=(value)=>{const p=document.createElement('p');p.textContent=value;body.append(p);};
   const addList=(values)=>{const ul=document.createElement('ul');values.forEach(value=>{const li=document.createElement('li');li.textContent=value;ul.append(li);});body.append(ul);};
   if(summary)addPara(summary);
   if(points.length){addHeading(hi?'खबर के मुख्य बिंदु':'Key points from this report');addList(points);}
   addHeading(hi?'इस खबर का महत्व':'Why this update matters');
   const cat=category.toLowerCase();
   if(cat.includes('weather')||category.includes('मौसम'))addPara(hi?'मौसम से जुड़ी जानकारी यात्रा, खेती और रोजमर्रा की योजनाओं को प्रभावित कर सकती है। अपने क्षेत्र के लिए आधिकारिक मौसम विभाग की चेतावनी और अपडेट जरूर देखें।':'Weather updates can affect travel, agriculture and daily plans. Check official meteorological alerts for your own location before making decisions.');
   else if(cat.includes('sports')||category.includes('खेल'))addPara(hi?'इस खेल अपडेट में मुकाबले, खिलाड़ियों या प्रतियोगिता से जुड़ी जानकारी दी गई है। परिणाम, अंकतालिका और अगले मैच की पुष्टि संबंधित खेल संस्था के आधिकारिक अपडेट से करें।':'This sports update concerns a match, athlete or competition. Confirm results, standings and upcoming fixtures through the relevant sports body.');
   else if(cat.includes('politics')||category.includes('राजनीति'))addPara(hi?'यह अपडेट सरकारी फैसलों, सार्वजनिक नीति या राजनीतिक घटनाक्रम से संबंधित है। किसी निर्णय के लागू होने, तारीख या पात्रता जैसी जानकारी के लिए संबंधित सरकारी आदेश या आधिकारिक बयान देखें।':'This update relates to public policy, government decisions or political developments. Check the relevant official order or statement for effective dates, eligibility and implementation details.');
   else if(cat.includes('world')||category.includes('दुनिया'))addPara(hi?'यह अंतरराष्ट्रीय घटनाक्रम भारत और वैश्विक समुदाय के लिए महत्वपूर्ण हो सकता है। आगे के घटनाक्रम और आधिकारिक प्रतिक्रियाओं के लिए विश्वसनीय अपडेट देखते रहें।':'This international development may matter to India and the wider global community. Follow reliable updates for subsequent developments and official responses.');
   else addPara(hi?'यह अपडेट सामान्य ज्ञान और करेंट अफेयर्स की दृष्टि से उपयोगी हो सकता है। परीक्षा या किसी महत्वपूर्ण निर्णय में उपयोग करने से पहले संबंधित आधिकारिक दस्तावेज से तथ्य और तारीख की पुष्टि करें।':'This update may be useful for general knowledge and current-affairs preparation. Verify facts and dates against the relevant official document before relying on them for an exam or decision.');
   addHeading(hi?'पाठकों को क्या जांचना चाहिए':'What readers should verify');
   addList(hi?['खबर में दी गई तारीख और संबंधित संस्था के आधिकारिक अपडेट की पुष्टि करें।','यदि कोई सरकारी योजना, नियम या घोषणा है, तो उसकी आधिकारिक अधिसूचना पढ़ें।','पुरानी जानकारी को नई घोषणा न मानें; अपडेट की तारीख जरूर देखें।']:['Confirm the date and the relevant organisation’s official update.','For any scheme, rule or announcement, read the official notification.','Check the publication and update date so older information is not mistaken for a new announcement.']);
   addHeading(hi?'अक्सर पूछे जाने वाले सवाल':'Frequently asked questions');
   const qa=hi?[[ 'यह खबर किस बारे में है?',title],[ 'इसकी आधिकारिक जानकारी कहां मिलेगी?','संबंधित विभाग, संस्था या आधिकारिक वेबसाइट के अपडेट में इसकी पुष्टि करें।'],[ 'क्या इस जानकारी पर तुरंत कार्रवाई करनी चाहिए?','पहले मूल रिपोर्ट और संबंधित आधिकारिक सूचना की पुष्टि करें।']]:[['What is this news about?',title],['Where can I verify the details?','Check the relevant department, organisation or official website for confirmation.'],['Should I act on this update immediately?','Verify the original report and any relevant official notice first.']];
   qa.forEach(([q,a])=>{const h=document.createElement('h3');h.className='news-subhead';h.textContent=q;body.append(h);addPara(a);});
   const note=document.createElement('p');note.className='news-reading-label';note.textContent=hi?'GovJobMitra सारांश: यह लेख उपलब्ध RSS विवरण और स्रोत पेज के सार्वजनिक शीर्षकों पर आधारित है। पूर्ण रिपोर्ट के लिए मूल स्रोत देखें।':'GovJobMitra summary: This article is based on the available feed description and public headings from the source page. Read the original report for the full story.';body.append(note);
   const link=document.createElement('a');link.href=articleUrl;link.target='_blank';link.rel='noopener noreferrer';link.className='news-source-link';link.textContent=hi?'मूल रिपोर्ट पढ़ें →':'Read original report →';const wrap=document.createElement('p');wrap.className='news-read-more';wrap.append(link);body.append(wrap);
   const seoDescription=(summary||title).slice(0,155);addSeoMeta('description',seoDescription);addSeoMeta('keywords',[title,category,'GovJobMitra','Hindi news','current affairs'].join(', '));
   let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=location.href.split('#')[0];
   addSeoMeta('og:title',title+' | GovJobMitra',true);addSeoMeta('og:description',seoDescription,true);
   const schema={"@context":"https://schema.org","@type":"NewsArticle","headline":title,"description":seoDescription,"datePublished":date||undefined,"image":data.image||feedImage||undefined,"mainEntityOfPage":location.href.split('#')[0],"publisher":{"@type":"Organization","name":"GovJobMitra"}};
   let jsonld=document.getElementById('newsArticleSchema');if(!jsonld){jsonld=document.createElement('script');jsonld.id='newsArticleSchema';jsonld.type='application/ld+json';document.head.append(jsonld);}jsonld.textContent=JSON.stringify(schema);
  }
 }catch{}
}
loadArticle();
function card(item){const a=document.createElement('a');a.className='related-card';a.href='news.html?title='+encodeURIComponent(item.title)+'&url='+encodeURIComponent(item.link)+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News')+'&description='+encodeURIComponent(item.description||'')+'&content='+encodeURIComponent(item.fullContent||'')+'&date='+encodeURIComponent(item.publishedAt||'')+'&image='+encodeURIComponent(item.image||'')+'&lang='+encodeURIComponent(hi?'hi':'en');const h=document.createElement('h3');h.textContent=item.title;const small=document.createElement('small');small.textContent=item.categoryLabel||item.category||'Latest update';a.append(h,small);return a;}
(async()=>{try{const r=await fetch('/api/news',{cache:'no-store'});if(!r.ok)throw Error('feed');const data=await r.json(),items=hi?(data.hindi||[]):(data.english||[]),grid=document.getElementById('relatedGrid');grid.replaceChildren();items.filter(x=>x.title!==title).slice(0,6).forEach(x=>grid.append(card(x)));if(!grid.children.length)grid.textContent=hi?'अभी और खबरें उपलब्ध नहीं हैं।':'No more updates right now.';}catch{set('relatedGrid',hi?'खबरें अभी उपलब्ध नहीं हैं।':'Updates temporarily unavailable.');}})();
