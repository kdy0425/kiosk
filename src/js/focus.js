// Simple focus trap utility
let trappedEl = null;
let lastFocusedEl = null;

function getFocusableElements(container){
  const selectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])'
  ];
  return Array.from(container.querySelectorAll(selectors.join(',')));
}

function trapFocus(container){
  releaseFocus();
  trappedEl = container;
  lastFocusedEl = document.activeElement;
  const focusable = getFocusableElements(container);
  if(focusable.length===0) return;
  const first = focusable[0];
  const last = focusable[focusable.length-1];
  function onKeydown(e){
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
  container.addEventListener('keydown', onKeydown);
  container._trapHandler = onKeydown;
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
