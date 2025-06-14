//키오스크 시작
function startKiosk() {
    if (ControlState.startStatus) return;
    ControlState.startStatus = true;
    startInactivityTimer();
    movePage('page_map');
    const screenSaver = document.querySelector('#page_screen_saver');
    if (screenSaver) {
        screenSaver.classList.add('fade-out-down');
        setTimeout(() => {
        screenSaver.style.display = 'none';
        }, 1000);
    }
}
['pointerdown', 'touchend', 'keydown'].forEach(evt => {
    document.addEventListener(evt, startKiosk);
});


/**
 * 스크린세이버 랜더링
 */
function setRenderScreenSaver() {
    const screenData = gl_xml_conf.xml_data.SCREEN_LIST.SCREEN_INFO || [];
    const renderArea = document.querySelector('#screen_items');
    renderArea.innerHTML = '';
  
    screenData.forEach(item => {
      const url = item.SCREEN_MAIN_URL;
      const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
      let slideHtml;
      if (isVideo) {
        const videoTimer = item.PLAY_TIME < 0 
                        ? '' 
                        : 'data-slide-time="item.PLAY_TIME"'

        slideHtml = `
          <li class="splide__slide" ${videoTimer}>
            <div class="slide_video">
              <video src="${url}" preload="metadata"></video>
            </div>
          </li>
        `;
      } else {
        slideHtml = `
          <li class="splide__slide" data-slide-time="${item.PLAY_TIME}">
            <div class="slide_image" 
                 style="background-image: url('${url}');">
            </div>
          </li>
        `;
      }
      renderArea.insertAdjacentHTML('beforeend', slideHtml);
    });
  
    return Promise.resolve();
  }
    

/**
 * 스크린세이버 진입 함수
 */
function page_screen_saver() {
    //슬라이드 첫페이지로 전환
    const splide = slideInstances['screen_saver_slide'];
    if (!splide) return;
    const prevSpeed = splide.options.speed;
    splide.options = { ...splide.options, speed: 0 };
    splide.go(0);
    setTimeout(() => {
      splide.options = { ...splide.options, speed: prevSpeed };
    }, 0);
}
  