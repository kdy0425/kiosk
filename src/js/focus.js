(function(){
  // focus trapping state
  let trappedEl = null;
  let lastFocusedEl = null;

  function isVisible(el){
    if(!el) return false;
    if(el.classList.contains('focus_only')) return false;
    const style = window.getComputedStyle(el);
    if(style.display === 'none' || style.visibility === 'hidden') return false;
    if(el.offsetParent === null && style.position !== 'fixed') return false;
    return true;
  }

  function isGroupVisible(el){
    if(!el) return false;
    const style = window.getComputedStyle(el);
    if(style.display === 'none' || style.visibility === 'hidden') return false;
    if(el.offsetParent === null && style.position !== 'fixed') return false;
    return true;
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
      if(!isGroupVisible(g)) return false;
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
      for(let offset=1; offset<=groups.length; offset++){
        const ni = getFocusable(groups[(gi + offset) % groups.length]);
        if(ni.length){
          ni[0].focus();
          return;
        }
      }
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
    for(let offset=1; offset<=groups.length; offset++){
      const next = groups[(gi + (dir*offset) + groups.length) % groups.length];
      const items = getFocusable(next);
      if(items.length){
        items[0].focus();
        return;
      }
    }
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

  function onKeydown(e){
    switch(e.key){
      case 'ArrowLeft':
        moveHorizontal(-1); e.preventDefault(); e.stopPropagation(); break;
      case 'ArrowRight':
        moveHorizontal(1); e.preventDefault(); e.stopPropagation(); break;
      case 'ArrowUp':
        moveVertical(-1); e.preventDefault(); e.stopPropagation(); break;
      case 'ArrowDown':
        moveVertical(1); e.preventDefault(); e.stopPropagation(); break;
    }
  }

  document.addEventListener('keydown', onKeydown, true);
  document.addEventListener('page:changed', setInitialFocus);
  document.addEventListener('popup:opened', setInitialFocus);
  document.addEventListener('popup:closed', restorePopupFocus);
  window.addEventListener('DOMContentLoaded', setInitialFocus);

  // focus trap helpers
  function trapFocus(container){
    releaseFocus();
    trappedEl = container;
    lastFocusedEl = document.activeElement;
    const focusable = getFocusable(container);
    if(!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length-1];
    function handle(e){
      if(e.key === 'Tab'){
        if(e.shiftKey){
          if(document.activeElement === first){
            e.preventDefault();
            last.focus();
          }
        }else{
          if(document.activeElement === last){
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    container.addEventListener('keydown', handle);
    container._trapHandler = handle;
  }

  function releaseFocus(){
    if(trappedEl){
      trappedEl.removeEventListener('keydown', trappedEl._trapHandler);
      delete trappedEl._trapHandler;
      if(lastFocusedEl) lastFocusedEl.focus();
    }
    trappedEl = null;
    lastFocusedEl = null;
  }

  window.trapFocus = trapFocus;
  window.releaseFocus = releaseFocus;
})();
