const toggle=document.getElementById('menuToggle'),nav=document.getElementById('mainNav');if(toggle&&nav)toggle.addEventListener('click',()=>nav.classList.toggle('open'));
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
(function initNewsTicker(){
 const hindiTrack=document.getElementById('tickerHindi'),englishTrack=document.getElementById('tickerEnglish'),status=document.getElementById('tickerStatus');if(!hindiTrack||!englishTrack)return;
 function makeHeadline(item,track){
  const link=document.createElement('a');link.className='ticker-item';
  link.href='news.html?title='+encodeURIComponent(item.title)+'&url='+encodeURIComponent(item.link)+'&source='+encodeURIComponent(item.source||'')+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News')+'&description='+encodeURIComponent(item.description||'')+'&content='+encodeURIComponent(item.content||'')+'&date='+encodeURIComponent(item.publishedAt||'')+'&image='+encodeURIComponent(item.image||'')+'&lang='+encodeURIComponent(track===hindiTrack?'hi':'en');
  link.title=item.title;const title=document.createElement('span');title.textContent=item.title;link.append(title);return link;
 }
 function render(track,items,emptyText){
  track.replaceChildren();if(!Array.isArray(items)||!items.length){const empty=document.createElement('span');empty.className='ticker-loading';empty.textContent=emptyText;track.append(empty);return;}
  for(let copy=0;copy<2;copy++){const group=document.createElement('div');group.className='ticker-group';items.forEach(item=>group.append(makeHeadline(item,track)));track.append(group);}
 }
 async function load(){try{const response=await fetch('/api/news',{headers:{Accept:'application/json'},cache:'no-store'});if(!response.ok)throw new Error('News service returned '+response.status);const data=await response.json();render(hindiTrack,data.hindi,'अभी हिंदी सुर्खियाँ उपलब्ध नहीं हैं।');render(englishTrack,data.english,'No English headlines available right now.');if(status)status.textContent='ताज़ा खबर पढ़ने के लिए headline पर क्लिक करें · Read the full update here';}catch(error){render(hindiTrack,[],'समाचार अभी लोड नहीं हो पाए।');render(englishTrack,[],'Headlines are temporarily unavailable.');if(status)status.textContent='News feed temporarily unavailable';console.error('GovJobMitra news ticker:',error);}}
 load();window.setInterval(load,5*60*1000);
})();
