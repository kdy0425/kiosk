(function(){
  function isVisible(el){
    if(!el) return false;
    if(el.classList.contains('focus_only')) return false;
    return !!(el.offsetParent !== null && window.getComputedStyle(el).display !== 'none');
  }

  function getFocusable(el){
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';
    return Array.from(el.querySelectorAll(selector)).filter(isVisible);
  }

  function getContext(){
    const popup = document.querySelector('.popup_layer.show');
    if(popup) return [popup];
    const activeSelect = document.querySelector('.floating .select_items.active');
    if(activeSelect) return [activeSelect];
    const contexts = [];
    const page = document.querySelector(`#${ControlState.currentPageInfo}`);
    if(page) contexts.push(page);
    const floating = document.querySelector('.floating');
    if(floating) contexts.push(floating);
    return contexts;
  }

  function getGroups(ctxs){
    const all = ctxs.flatMap(ctx => Array.from(ctx.querySelectorAll('[focus-group]')));
    return all.filter(g => {
      if(!isVisible(g)) return false;
      return !all.some(other => other !== g && other.contains(g));
    });
  }

  function setInitialFocus(){
    const ctxs = getContext();
    if(!ctxs.length) return;
    let target = null;
    for(const c of ctxs){
      target = c.querySelector('[page-tts], [popup-tts]');
      if(target) break;
    }
    if(target){
      target.focus();
      return;
    }
    const groups = getGroups(ctxs);
    if(groups.length){
      const items = getFocusable(groups[0]);
      if(items.length) items[0].focus();
    }
  }

  function moveHorizontal(dir){
    const ctxs = getContext();
    if(!ctxs.length) return;
    const groups = getGroups(ctxs);
    if(!groups.length) return;
    const active = document.activeElement;
    const activeGroup = active.closest('[focus-group]');
    let gi = groups.indexOf(activeGroup);
    if(gi === -1){
      setInitialFocus();
      return;
    }
    const group = activeGroup;
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
    const ctxs = getContext();
    if(!ctxs.length) return;
    const groups = getGroups(ctxs);
    if(!groups.length) return;
    const active = document.activeElement;
    const activeGroup = active.closest('[focus-group]');
    let gi = groups.indexOf(activeGroup);
    if(gi === -1){
      setInitialFocus();
      return;
    }
    gi = (gi + dir + groups.length) % groups.length;
    const items = getFocusable(groups[gi]);
    if(items.length) items[0].focus();
  }

  function restorePopupFocus(){
    const el = ControlState.lastFocusBeforePopup;
    ControlState.lastFocusBeforePopup = null;
    if(el && document.contains(el) && isVisible(el)){
      el.focus();
    }else{
      setInitialFocus();
    }
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
  document.addEventListener('popup:closed', restorePopupFocus);

  window.addEventListener('DOMContentLoaded', setInitialFocus);
})();
