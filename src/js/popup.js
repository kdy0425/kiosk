const popupWrap = document.querySelector('#popup_layer');
const popupBox = popupWrap.querySelector('#popup_box');

/**
 * 
 * @param {string} target - 실행 팝업명
 * @param {string} msg  - 얼랏 메세지
 * @param {boolean} toggle  - 템플릿사용X 토글레이어
 * @param {object} data  - 팝업 데이터
 *
*/
const openPopup = async (targetPopup) => {
    ControlState.lastFocusBeforePopup = document.activeElement;
    ControlState.currentPopupInfo = targetPopup;
    popupBox.innerHTML = '';
    const tpl = document.getElementById(targetPopup);
    const clone = tpl.content ? tpl.content.cloneNode(true) : null;

    if (clone) {
        popupBox.appendChild(clone);
    } else {
        popupBox.innerHTML = tpl.innerHTML;
    }
    
    if (typeof window[targetPopup] === "function") {
        window[targetPopup]();
    }
    popupWrap.classList.add('lang_translating');
    await initHtmlLanguage('popup');// 언어팩에 있는 데이터로 변경

    popupWrap.classList.remove('lang_translating');
    popupWrap.classList.add('show');
    setTimeout(() => {
        const el = popupWrap.querySelector('[popup-tts]');
        if(el) el.focus();
    });
    document.dispatchEvent(new Event('popup:opened'));
    
};


/**
 * 
 * @param {string} targetPopup 
 * 단순 팝업 오픈
 */
function showPopup(targetPopup){
    ControlState.lastFocusBeforePopup = document.activeElement;
    ControlState.currentPopupInfo = targetPopup;
    initHtmlLanguage('popup');// 언어팩에 있는 데이터로 변경

    const layer = document.querySelector(`#${targetPopup}`);
    layer.classList.add('show');
    setTimeout(() => {
        const el = layer.querySelector('[popup-tts]');
        if(el) el.focus();
    });
    document.dispatchEvent(new Event('popup:opened'));
};

const closePopup = (event, targetPopup) => {
    ControlState.currentPopupInfo = null;
    if (!event && !targetPopup) {
        const popupAll = document.querySelectorAll('.popup_layer');
        popupAll.forEach(popup => popup.classList.remove('show'));
        document.dispatchEvent(new Event('popup:closed'));
        return;
    }
    if(targetPopup){
        document.querySelector(`#${targetPopup}`).classList.remove('show');
    }else if(event){
        const closeLayer = event.target.closest('.popup_layer');
        closeLayer.classList.remove('show');
    }
    document.dispatchEvent(new Event('popup:closed'));
}


