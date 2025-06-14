
/**
 * 시설안내 랜더링
 */
function setRenderFacility() {
  const facilityData = gl_xml_conf.xml_data.PUB_LIST.PUB_INFO;
  console.log(facilityData);

  const renderArea = document.querySelector('#facility_items');
  renderArea.innerHTML = '';
  facilityData.sort((a, b) => a.PUB_ORDER_NUM - b.PUB_ORDER_NUM);
  facilityData.forEach((facility) => {
    if (String(facility.PUB_DISPLAY_YN).toUpperCase() === 'Y') {
      const langFcilityName = ControlState.language === 'KO' ? facility.PUB_NAME_KOR : facility.PUB_NAME_ENG;
      const renderHtml = `
        <li class="splide__slide">
          <button
            type="button"
            class="facility_item"
            onclick="openFacilityPopup('${facility.PUB_CODE}')"
          >
            <div
              class="icon"
              style="background-image: url('${facility.PUB_LIST_URL}');"
            ></div>
            <div class="name" data-lang-ko="${facility.PUB_NAME_KOR}" data-lang-en="${facility.PUB_NAME_ENG}">${langFcilityName}</div>
          </button>
        </li>
      `;
        // <li class="splide__slide">
        //     <button type="button" class="facility_item" onclick="openPopup('facility_popup')">
        //         <div class="icon" style="background-image: url('./images/dummy/facility_item.png');"></div>
        //         <div class="name">서비스 라운지</div>
        //     </button>
        // </li>
      renderArea.insertAdjacentHTML('beforeend', renderHtml);
    }
  });
  return Promise.resolve();
}
  

/**
 * 시설안내 진입 함수
 */
function page_facility() {
  //시설안내 슬라이드 첫페이지로 전환
  const splide = slideInstances['facility_slide'];
  if (!splide) return;
  const prevSpeed = splide.options.speed;
  splide.options = { ...splide.options, speed: 0 };
  splide.go(0);
  setTimeout(() => {
    splide.options = { ...splide.options, speed: prevSpeed };
  }, 0);
}

//시설안내 팝업 열기
function openFacilityPopup(pubCode) {
  const all = gl_xml_conf.xml_data.PUB_LIST.PUB_INFO;
  const item = all.find(f => f.PUB_CODE === pubCode);
  if (!item) {
    console.warn('facility not found:', pubCode);
    return;
  }
  ControlState.currentFacility = item;
  openPopup('facility_popup');
}

//시설안내 팝업 데이터 삽입
function facility_popup() {
  const data = ControlState.currentFacility;
  if (!data) return;

  const box = popupBox.querySelector('.popup_facility');

  box.querySelector('.icon img').src = data.PUB_POPUP_URL;
  box.querySelector('.name').textContent = data.PUB_NAME_KOR;

  const nameEl = box.querySelector('.name');
  nameEl.dataset.langKo = data.PUB_NAME_KOR;
  nameEl.dataset.langEn = data.PUB_NAME_ENG;
  nameEl.textContent = data.PUB_NAME_KOR || '';

  const routes = gl_xml_conf.xml_route.PUB_LIST.PUB_INFO || [];
  const matched = routes.filter(r => r.PUB_CODE === data.PUB_CODE);

  let floorStrings = matched.map(r => {
    return r.floor || '';
  });

  let floorList = floorStrings
    .filter(s => s)
    .flatMap(s => s.split(','))
    .map(f => f.trim())
    .filter(f => f)
  floorList = [...new Set(floorList)];

  const locCnt = box.querySelector('.popup_location .cnt');
  locCnt.textContent = floorList.length
    ? floorList.join(', ')
    : '위치 정보 없음';

    popupBox.querySelector('.wayfind_location').addEventListener('click', function(){
      const pageInfo = {targetType: 'pub', wayfindType: 'location', pubCode: data.PUB_CODE};
      popupBox.querySelector('.popup_close').click();
      movePage('page_map', pageInfo);
    });
  
    popupBox.querySelector('.wayfind_path').addEventListener('click', function(){
      const pageInfo = {targetType: 'pub', wayfindType: 'path', pubCode: data.PUB_CODE};
      popupBox.querySelector('.popup_close').click();
      movePage('page_map', pageInfo);
    });
}
