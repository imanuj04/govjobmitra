const toggle=document.getElementById('menuToggle');const nav=document.getElementById('mainNav');if(toggle&&nav){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
// Articles will be connected to the publishing workflow in the next phase.

// Bilingual headline ticker. Headlines are linked to the original publisher.
(async function loadNewsTicker(){
  const hindiEl=document.getElementById('tickerHindi');
  const englishEl=document.getElementById('tickerEnglish');
  const statusEl=document.getElementById('tickerStatus');
  if(!hindiEl||!englishEl)return;
  const safe=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function render(target,items,emptyText){
    if(!items.length){target.innerHTML='<span class="ticker-empty">'+safe(emptyText)+'</span>';return;}
    const links=items.map(item=>'<a href="'+safe(item.link)+'" target="_blank" rel="noopener noreferrer" aria-label="Read '+safe(item.title)+' at '+safe(item.source)+'">'+safe(item.title)+' <small>('+safe(item.source)+')</small></a>').join('');
    target.innerHTML=links+links;
  }
  try{
    const response=await fetch('/api/news',{headers:{'Accept':'application/json'}});
    if(!response.ok)throw new Error('News service unavailable');
    const data=await response.json();
    const items=Array.isArray(data.items)?data.items:[];
    render(hindiEl,items.filter(x=>x.lang==='hi'),'अभी हिंदी headlines उपलब्ध नहीं हैं।');
    render(englishEl,items.filter(x=>x.lang==='en'),'No English headlines are available right now.');
    const time=data.updatedAt?new Date(data.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'';
    statusEl.textContent=items.length?('Headlines from publishers and official sources · Updated '+time+' · Click to read original reports'):'News feeds did not return headlines. Please check again shortly.';
  }catch(error){
    render(hindiEl,[],'समाचार सेवा अभी उपलब्ध नहीं है।');
    render(englishEl,[],'News service is temporarily unavailable.');
    statusEl.textContent='Live headlines could not be loaded. The rest of GovJobMitra is available.';
  }
})();
