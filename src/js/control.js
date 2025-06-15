/**
 * 
 * @param {HTMLElement} button 
 * @param {string} type 
 * @param {string} option 
 * 하단 컨트롤러 버튼 함수들
 */
function controlAction(button, type, option){
    const htmlEl = document.querySelector('html')
    const selectItemsAll = document.querySelectorAll('.floating .select_items');
    const selectItemsNext = button.nextElementSibling;
    const selectItemsStatus = selectItemsNext && selectItemsNext.classList.contains('active');
    selectItemsAll.forEach(item => item.classList.remove('active'))

    if(type === 'toggle'){
        const langText = button.querySelector('.value').textContent === langCodeCheck('꺼짐') ? langCodeCheck('켜짐') : langCodeCheck('꺼짐')
        button.classList.toggle('active');
        button.querySelector('.value').textContent = langText;
        button.querySelector('.value').dataset.langCode = 
            button.querySelector('.value').textContent === 
            '꺼짐' ? '켜짐' : '꺼짐';
        ControlState[option] = !ControlState[option];
        console.log('접근성 옵션 변경', option, ControlState[option])

        //html에 고대비 저자세 class 토글
        if (typeof ControlState[option] === 'boolean') {
            if (ControlState[option]) {
                htmlEl.classList.add(option);
            } else {
                htmlEl.classList.remove(option);
            }
        }
        if (option === 'lowScreen') {
            const isLow = ControlState.lowScreen;
            applyLowScreen(isLow);
        }
    } else if(type === 'pannel'){
        if(selectItemsStatus){
            selectItemsNext.classList.remove('active');
            releaseFocus();
        }else{
            selectItemsNext.classList.add('active');
            trapFocus(selectItemsNext);
            selectItemsNext.querySelector('.active').focus();
        }
    }
}

//빈곳 클릭 floating 닫힘
document.addEventListener('click', (event) => {
    const wrapper = event.target.closest('.floating .btns button');
    if (!wrapper) {
      document.querySelectorAll('.floating .select_items')
        .forEach(item => item.classList.remove('active'));
      releaseFocus();
    }
});
  
/**
 * 
 * @param {HTMLElement} button 
 * @param {string} option 
 * @param {string} val 
 * 기기 세팅 변경
 */
function setControl(button, option, val, renderText){
    const selectItemsAll = document.querySelectorAll('.floating .select_items');
    const buttonAll = button.closest('.select_items').querySelectorAll('button');
    const beforeVal = ControlState[option]; //변경 전 값값
    selectItemsAll.forEach(item => item.classList.remove('active'))
    buttonAll.forEach(item => item.classList.remove('active'));
    releaseFocus();
    
    ControlState[option] = val;
    button.classList.add('active');
    button.closest('.item').querySelector('button').focus();
    button.closest('.item').querySelector('.value').textContent = renderText ? renderText : val;

    console.log('접근성 옵션 변경(옵션)', option, ControlState[option])

    if (option === 'language') {
        const htmlElement = document.querySelector('html');

        //변경전 언어와 변경후 언어가 같으면 언어 변경 생략
        if(ControlState.language != beforeVal){
            initHtmlLanguage();// 언어팩에 있는 데이터로 변경
        }
        ControlState.language = val;
        if(val != 'KO'){
            htmlElement.classList.add('language');
        }else{
            htmlElement.classList.remove('language');
        }
    }

    if (option === 'fontSize') {
        const htmlElement = document.querySelector('html');
        const fontSize = ControlState.fontSize;
        let setFontSize = '';
        switch(fontSize){
            case '1':
                setFontSize = '62.5%';
                break;
            case '1.05':
                setFontSize = '65.625%';
                break;
            case '1.1':
                setFontSize = '68.75%';
                break;
        }
        htmlElement.style.fontSize = setFontSize;
    }

}

