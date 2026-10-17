(() => {
 const cards=[...document.querySelectorAll('.rights-list li')], dialog=document.querySelector('.right-dialog');
 if(!dialog)return;
 let current=0;
 const drawings=[
  '<circle class="right-breath-ring" cx="60" cy="60" r="38"/>',
  '<path class="right-wave" d="M12 60Q28 30 44 60T76 60T108 60"/>',
  '<g class="right-circle-bloom"><circle class="right-circle-halo" cx="60" cy="60" r="38"/><circle class="right-circle-core" cx="60" cy="60" r="38"/></g>',
  '<g class="right-orbit"><ellipse cx="60" cy="60" rx="43" ry="20"/><ellipse cx="60" cy="60" rx="20" ry="43"/></g><circle cx="60" cy="60" r="5" fill="currentColor"/>',
  '<rect class="right-rest-square" x="28" y="28" width="64" height="64" rx="15"/>',
  '<g class="right-circle-bloom"><circle class="right-circle-halo" cx="60" cy="60" r="38"/><circle class="right-circle-core" cx="60" cy="60" r="38"/></g>',
  '<g class="right-petals"><path d="M60 60C8 12 22 0 60 60C98 0 112 12 60 60C112 108 98 120 60 60C22 120 8 108 60 60Z"/></g>',
  '<path class="right-wave" d="M12 60Q28 30 44 60T76 60T108 60"/>',
  '<g class="right-circle-bloom"><circle class="right-circle-halo" cx="60" cy="60" r="38"/><circle class="right-circle-core" cx="60" cy="60" r="38"/></g>',
  '<g class="right-orbit"><circle cx="60" cy="60" r="35"/><circle cx="60" cy="25" r="8" fill="currentColor"/></g>',
  '<path class="right-rest-square" d="M25 45Q60 95 95 45M35 35L25 45L15 35M105 35L95 45L85 35"/>',
  '<g class="right-circle-bloom"><circle class="right-circle-halo" cx="60" cy="60" r="38"/><circle class="right-circle-core" cx="60" cy="60" r="38"/></g>',
  '<g class="right-petals"><path d="M60 15V105M15 60H105M28 28L92 92M92 28L28 92"/></g>',
  '<g class="right-orbit"><path d="M60 14L70 45L103 45L77 65L87 98L60 78L33 98L43 65L17 45L50 45Z"/></g>'
 ];
 drawings.push('<g class="right-triangle-turn"><path class="right-triangle-morph" d="M60 17L105 96L15 96Z"/></g>');
 const cube='<div class="right-cube-scene"><div class="right-cube">'+['front','back','left','right','top','bottom'].map(face=>'<span class="cube-face cube-'+face+'"></span>').join('')+'</div></div>';
 const pyramid='<div class="right-pyramid-scene"><div class="right-pyramid">'+['one','two','three'].map(face=>'<span class="pyramid-face pyramid-'+face+'"></span>').join('')+'</div></div>';
 const shapes=[...new Set(drawings),cube,pyramid];let bag=[],lastShape=null;
 function randomArt(){if(!bag.length){bag=[...shapes];for(let i=bag.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag[bag.length-1]===lastShape)[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];}lastShape=bag.pop();return (lastShape===cube||lastShape===pyramid)?lastShape:'<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">'+lastShape+'</svg>';}
 const squiggle='<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path class="right-squiggle" d="M100.00 60.00C102.02 65.42 97.74 74.28 94.24 79.77C90.74 85.25 84.71 91.37 79.00 92.91C73.29 94.45 66.00 89.58 60.00 89.00C54.00 88.42 49.71 90.41 43.00 89.44C36.29 88.48 22.26 88.14 19.76 83.23C17.26 78.32 25.98 66.58 28.00 60.00C30.02 53.42 29.39 48.68 31.89 43.77C34.39 38.86 38.31 35.02 43.00 30.56C47.69 26.09 54.00 17.58 60.00 17.00C66.00 16.42 75.31 22.05 79.00 27.09C82.69 32.13 78.61 41.75 82.11 47.23C85.61 52.72 97.98 54.58 100.00 60.00Z"/></svg>';
 function show(index){current=(index+cards.length)%cards.length;const card=cards[current];dialog.querySelector('.right-dialog-art').innerHTML=current===2?squiggle:randomArt();dialog.style.setProperty('--right-colour',getComputedStyle(card).backgroundColor);dialog.querySelector('#right-dialog-text').textContent=card.querySelector('p').textContent;dialog.querySelector('.right-dialog-number').textContent=String(current+1).padStart(2,'0');dialog.querySelector('.right-position').textContent=`${current+1} / ${cards.length}`;}
 cards.forEach((card,index)=>{const button=card.querySelector('button');button.setAttribute('aria-label',`Take a moment with right ${index+1}`);button.addEventListener('click',()=>{show(index);dialog.showModal();});});
 dialog.querySelector('.right-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('.right-previous').addEventListener('click',()=>show(current-1));
 dialog.querySelector('.right-next').addEventListener('click',()=>show(current+1));
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close();}});
})();
