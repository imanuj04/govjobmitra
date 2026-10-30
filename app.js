const toggle=document.getElementById('menuToggle');const nav=document.getElementById('mainNav');if(toggle&&nav){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
// Articles will be connected to the publishing workflow in the next phase.
