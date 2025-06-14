/**
 * 스토어 목록 렌더링
 */
function setRenderStore(reRender = false) {
    const all = gl_xml_conf.xml_data.STORE_LIST.STORE_INFO || [];
    const filtered = applyCommonFilters(all, 'STORE_FLOOR.value' , 'value')
    .filter(store => {
        if (searchFilters.cate !== '전체') {
            return store.CATE_CODE?.value === searchFilters.cate;
        }
        return true;
    });
    if (reRender) {
        slideInstances['store_slide'].destroy(true);
    }

    const ul = document.querySelector('#store_items');
    ul.innerHTML = '';
    
    if(filtered.length < 1){
        const html = `
                <li class="store_empty" data-lang-code="검색결과없음">${langCodeCheck('검색결과없음')}</li>`;
        ul.insertAdjacentHTML('beforeend', html);
    }else{
        filtered.forEach(store => {
            const thumb = store.STORE_LOGO_URL || store.STORE_MAIN_URL || './images/connect_hyundai_g.jpg';
            const floor = store.STORE_FLOOR?.value || store.STORE_FLOOR?.floor || '';
            const langStoreName = ControlState.language === 'KO' ? store.STORE_NAME_KOR : store.STORE_NAME_ENG;
            const langTextPlace = langCodeCheck('위치보기');
            const html = `
                <li class="splide__slide">
                    <button type="button"
                        class="store_item"
                        onclick="storePopup('${store.id}')">
                        <div class="thum">
                            <img src="${thumb}" data-image-url="${store.STORE_LOGO_URL}" onerror="this.src='./images/connect_hyundai_g.jpg';"/>
                        </div>
                        <div class="info">
                            <div class="name" data-lang-ko="${store.STORE_NAME_KOR}" data-lang-en="${store.STORE_NAME_ENG}">${langStoreName}</div>
                            <div class="location">
                                <div class="floor">${floor}</div>
                                <div class="view" data-lang-code="위치보기">${langTextPlace}</div>
                            </div>
                        </div>
                    </button>
                </li>`;
            ul.insertAdjacentHTML('beforeend', html);
        });
    }
    if (reRender) {
        const isLow = ControlState.lowScreen;
        const cfg = slidesConfig.find(cfg => cfg.id === 'store_slide');
        const override = isLow ? cfg.overrides.lowPosition : cfg.overrides.default;
        const newSplide = new Splide(`#${cfg.id}`, {
        ...sharedOptions,
        ...override,
        });

        if (cfg.grid) {
        newSplide.mount(window.splide.Extensions);
        } else {
        newSplide.mount();
        }

        slideInstances['store_slide'] = newSplide;
        initCounter(newSplide, `#${cfg.id} .slide-counter`);
    }
    return Promise.resolve();
}

// 카테고리 정보 가져옴
function getCategoryGroups() {
    const codeList = gl_xml_conf.xml_data.CODE_LIST.CODE_INFO;
    const infos = Array.isArray(codeList) ? codeList : [codeList];
    const categoryInfo = infos.find(info => info.CODE_KEY === 'CUSTOMCODE');
    console.log(categoryInfo,'categoryInfo')
    return categoryInfo?.CODE_VALUE?.HDC?.cateGroup || [];
}

/**
 * 
 * 매장정보 카테고리 랜더링
 */
function setRenderStoreCates() {
    const groups = getCategoryGroups();
    const container = document.querySelector('#store_cates');
    const langTextAll = langCodeCheck('전체');
    let html = `
        <li class="splide__slide">
            <button type="button" class="active" data-rel="전체" data-lang-code="전체">${langTextAll}</button>
        </li>
    `;
    console.log(groups,'groups')
    groups.forEach(group => {
        const langGroupName = ControlState.language === 'KO' ? group.cate_name_kor : group.cate_name_eng;
        html += `
            <li class="splide__slide">
                <button type="button" data-rel="${group.groupCode}" data-lang-ko="${group.cate_name_kor}" data-lang-en="${group.cate_name_eng}">${langGroupName}</button>
            </li>
        `;
    });
    container.innerHTML = html;
    return Promise.resolve();
}

  
/**
 * 스토어 팝업 열기
 */
function storePopup(storeId) {
  const store = gl_xml_conf.xml_data.STORE_LIST.STORE_INFO.find(s => s.id === storeId);
  if (!store) return;
  ControlState.currentStore = store;
  openPopup('store_popup', null);
}

/**
 * store_popup 콜백: 템플릿에 내용 주입
 */
function store_popup() {
    const data = ControlState.currentStore;
    if (!data) return;
    
    const box = popupBox.querySelector('.popup_store');
    if (!box) return;

    const thumbEl = box.querySelector('.thum img');
    const thumbUrl = data.STORE_MAIN_URL
                    || data.STORE_LOGO_URL
                    || '/images/connect_hyundai_w.jpg';
    thumbEl.src = thumbUrl;

    const nameEl = popupBox.querySelector('.popup_title');
    nameEl.dataset.langKo = data.STORE_NAME_KOR;
    nameEl.dataset.langEn = data.STORE_NAME_ENG;
    nameEl.textContent = data.STORE_NAME_KOR || '';

    const floor = data.STORE_FLOOR?.value
                || data.STORE_FLOOR?.floor
                || '';
    box.querySelector('.info_table #store_floor')
        .textContent = floor || '-';

    box.querySelector('.info_table #store_tell')
        .textContent = data.STORE_PHONE || '-';

    box.querySelector('.info_table #store_time')
        .textContent = data.STORE_SERVICETIME_KOR
                    || '-';

    popupBox.querySelector('.wayfind_location').addEventListener('click', function(){
        const pageInfo = {targetType: 'store', wayfindType: 'location', storeId: data.id};
        popupBox.querySelector('.popup_close').click();
        movePage('page_map', pageInfo);
    });

    popupBox.querySelector('.wayfind_path').addEventListener('click', function(){
        const pageInfo = {targetType: 'store', wayfindType: 'path', storeId: data.id};
        popupBox.querySelector('.popup_close').click();
        movePage('page_map', pageInfo);
    });
}


/**
 * 스토어 페이지 진입 시 호출
 */
function page_store() {
    searchFilterReset();
    document.querySelector(`#${ControlState.currentPageInfo} .search_form_low`).classList.remove('hidden');
}
