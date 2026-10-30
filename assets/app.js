const toggle=document.getElementById('menuToggle');
const nav=document.getElementById('mainNav');
if(toggle&&nav){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}
const year=document.getElementById('year');
if(year)year.textContent=new Date().getFullYear();

// Live Hindi + English news ticker. Headlines are fetched from our Pages Function.
(function initNewsTicker(){
  const hindiTrack=document.getElementById('tickerHindi');
  const englishTrack=document.getElementById('tickerEnglish');
  const status=document.getElementById('tickerStatus');
  if(!hindiTrack||!englishTrack)return;

  function makeHeadline(item){
    const link=document.createElement('a');
    link.className='ticker-item';
    link.href='news.html?title='+encodeURIComponent(item.title)+'&url='+encodeURIComponent(item.link)+'&source='+encodeURIComponent(item.source||'')+'&category='+encodeURIComponent(item.categoryLabel||item.category||'News');
    link.title=(item.source?item.source+' — ':'')+item.title;
    const source=document.createElement('span');
    source.className='ticker-source';
    source.textContent=item.source||'News';
    const title=document.createElement('span');
    title.textContent=item.title;
    link.append(source,title);
    return link;
  }

  function render(track,items,emptyText){
    track.replaceChildren();
    if(!Array.isArray(items)||items.length===0){
      const empty=document.createElement('span');
      empty.className='ticker-loading';
      empty.textContent=emptyText;
      track.append(empty);
      return;
    }
    // Duplicate the list for a seamless marquee loop.
    for(let copy=0;copy<2;copy++){
      const group=document.createElement('div');
      group.className='ticker-group';
      items.forEach(item=>group.append(makeHeadline(item)));
      track.append(group);
    }
  }

  async function load(){
    try{
      const response=await fetch('/api/news',{headers:{'Accept':'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error('News service returned '+response.status);
      const data=await response.json();
      render(hindiTrack,data.hindi,'अभी हिंदी सुर्खियाँ उपलब्ध नहीं हैं।');
      render(englishTrack,data.english,'No English headlines available right now.');
      if(status)status.textContent='Latest headlines · Updated '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+' · Select a headline to read it on GovJobMitra';
    }catch(error){
      render(hindiTrack,[],'समाचार अभी लोड नहीं हो पाए। कृपया थोड़ी देर बाद देखें।');
      render(englishTrack,[],'Headlines are temporarily unavailable. Please try again later.');
      if(status)status.textContent='News feed temporarily unavailable · Please refresh in a few minutes';
      console.error('GovJobMitra news ticker:',error);
    }
  }
  load();
  window.setInterval(load,5*60*1000);
})();

// Articles will be connected to the publishing workflow in the next phase.
