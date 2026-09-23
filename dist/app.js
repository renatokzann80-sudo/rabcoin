const config=window.RABCOIN||{};
const loader=document.querySelector('#loader');let loaderTimer;
function intro(){clearTimeout(loaderTimer);loader.classList.remove('done');loaderTimer=setTimeout(()=>loader.classList.add('done'),1800);}intro();
document.querySelector('#replay').addEventListener('click',intro);
document.querySelector('#year').textContent=new Date().getFullYear();
for(const name of ['x','telegram','instagram']){if(config[name]&&/^https:\/\//.test(config[name])){const a=document.querySelector('#social-'+name);a.href=config[name];a.target='_blank';a.rel='noopener noreferrer';a.removeAttribute('aria-disabled');}}
const dialog=document.querySelector('#lightbox'),chapters=[...document.querySelectorAll('.chapter')];let currentChapter=0;
function showChapter(index){currentChapter=(index+chapters.length)%chapters.length;const card=chapters[currentChapter];const img=document.querySelector('#lightbox-image');img.src=card.dataset.image;img.alt=card.querySelector('img').alt;document.querySelector('#lightbox-title').textContent=card.dataset.title;document.querySelector('#lightbox-story').textContent=card.dataset.story;document.querySelector('#chapter-count').textContent=`0${currentChapter+1} / 0${chapters.length}`;}
document.querySelector('#gallery').addEventListener('click',event=>{const card=event.target.closest('.chapter');if(!card)return;showChapter(chapters.indexOf(card));dialog.showModal();});
document.querySelector('#prev-chapter').addEventListener('click',()=>showChapter(currentChapter-1));document.querySelector('#next-chapter').addEventListener('click',()=>showChapter(currentChapter+1));
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showChapter(currentChapter+1);}if(event.key==='ArrowLeft'){event.preventDefault();showChapter(currentChapter-1);}});
document.querySelector('#close-lightbox').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
const links=[...document.querySelectorAll('[data-section]')];const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){for(const link of links){const active=link.dataset.section===entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}}},{rootMargin:'-10% 0px -55% 0px',threshold:0});for(const link of links)observer.observe(document.getElementById(link.dataset.section));
