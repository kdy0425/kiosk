
/**
 * 행사안내 랜더링
 */
function setRenderEvent() {
  const eventData = gl_xml_conf.xml_data.EVENT_LIST.EVENT_INFO || [];
  const renderArea = document.querySelector('#event_items');
  renderArea.innerHTML = '';

  eventData.forEach(item => {
    const url = item.FILE_URL;
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    const langTextPlay = langCodeCheck('재생');
    const langTextPause = langCodeCheck('일시정지');
    let slideHtml;
    if (isVideo) {
      slideHtml = `
        <li class="splide__slide">
          <div class="slide_video">
            <video src="${url}" preload="metadata"></video>
            <div class="slide_text">
              <h2>${item.EVENT_NAME}</h2>
              <p>${item.EVENT_DESC}</p>
            </div>
            <div class="video_controls">
              <button type="button" class="play"  onclick="videoPlay(this);" data-lang-code="재생">${langTextPlay}</button>
              <button type="button" class="pause" onclick="videoPause(this);" data-lang-code="일시정지">${langTextPause}</button>
            </div>
          </div>
        </li>
      `;
    } else {
      slideHtml = `
        <li class="splide__slide">
          <div class="slide_image" 
               style="background-image: url('${url}');">
            <div class="slide_text">
              <h2>${item.EVENT_NAME}</h2>
              <p>${item.EVENT_DESC}</p>
            </div>
          </div>
        </li>
      `;
    }
    renderArea.insertAdjacentHTML('beforeend', slideHtml);
  });

  return Promise.resolve();
}
  

/**
 * 이벤트 진입 함수
 */
function page_event() {
  //시설안내 슬라이드 첫페이지로 전환
  const splide = slideInstances['event_slide'];
  if (!splide) return;
  const prevSpeed = splide.options.speed;
  splide.options = { ...splide.options, speed: 0 };
  splide.go(0);
  setTimeout(() => {
    splide.options = { ...splide.options, speed: prevSpeed };
  }, 0);
}
