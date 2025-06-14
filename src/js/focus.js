(function(){
  function isVisible(el){
    if(!el) return false;
    return !!(el.offsetParent !== null && window.getComputedStyle(el).display !== 'none');
  }

  function getFocusable(el){
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';
    return Array.from(el.querySelectorAll(selector)).filter(isVisible);
  }

  function getContext(){
    const popup = document.querySelector('.popup_layer.show');
    if(popup) return popup;
    return document.querySelector(`#${ControlState.currentPageInfo}`);
  }

  function getGroups(ctx){
    return Array.from(ctx.querySelectorAll('[focus-group]')).filter(isVisible);
  }

  function setInitialFocus(){
    const ctx = getContext();
    if(!ctx) return;
    let target = ctx.querySelector('[page-tts], [popup-tts]');
    if(target){
      target.focus();
      return;
    }
    const groups = getGroups(ctx);
    if(groups.length){
      const items = getFocusable(groups[0]);
      if(items.length) items[0].focus();
    }
  }

  function moveHorizontal(dir){
    const ctx = getContext();
    if(!ctx) return;
    const groups = getGroups(ctx);
    if(!groups.length) return;
    const active = document.activeElement;
    let gi = groups.findIndex(g => g.contains(active));
    if(gi === -1){
      setInitialFocus();
      return;
    }
    const group = groups[gi];
    const items = getFocusable(group);
    if(!items.length) return;
    if((dir === 1) && (active.hasAttribute('page-tts') || active.hasAttribute('popup-tts'))){
      gi = (gi + 1) % groups.length;
      const ni = getFocusable(groups[gi]);
      if(ni.length) ni[0].focus();
      return;
    }
    let idx = items.indexOf(active);
    if(idx === -1) idx = 0;
    idx = (idx + dir + items.length) % items.length;
    items[idx].focus();
  }

  function moveVertical(dir){
    const ctx = getContext();
    if(!ctx) return;
    const groups = getGroups(ctx);
    if(!groups.length) return;
    const active = document.activeElement;
    let gi = groups.findIndex(g => g.contains(active));
    if(gi === -1){
      setInitialFocus();
      return;
    }
    gi = (gi + dir + groups.length) % groups.length;
    const items = getFocusable(groups[gi]);
    if(items.length) items[0].focus();
  }

  document.addEventListener('keydown', function(e){
    switch(e.key){
      case 'ArrowLeft':
        moveHorizontal(-1); e.preventDefault(); break;
      case 'ArrowRight':
        moveHorizontal(1); e.preventDefault(); break;
      case 'ArrowUp':
        moveVertical(-1); e.preventDefault(); break;
      case 'ArrowDown':
        moveVertical(1); e.preventDefault(); break;
    }
  });

  document.addEventListener('page:changed', setInitialFocus);
  document.addEventListener('popup:opened', setInitialFocus);
  document.addEventListener('popup:closed', setInitialFocus);

  window.addEventListener('DOMContentLoaded', setInitialFocus);
})();
