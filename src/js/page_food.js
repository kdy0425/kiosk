/**
 * 스토어 목록 렌더링
 */
function setRenderFood(reRender = false) {
    const all = (gl_xml_conf.xml_data.STORE_LIST.STORE_INFO || [])
        .filter(store => store.CATE_CODE?.value === 'C01');

    const filtered = applyCommonFilters(all, 'STORE_FLOOR.value', 'sub_cate')
        .filter(store => {
          if (searchFilters.cate !== '전체') {
            return store.CATE_CODE?.sub_cate === searchFilters.cate;
          }
          return true;
        });
    if (reRender) {
        slideInstances['food_slide'].destroy(true);
    }

    const ul = document.querySelector('#food_items');
    ul.innerHTML = '';
    
    if(filtered.length < 1){
        const html = `
                <li class="store_empty">검색 결과가 없습니다</li>`;
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
                            <img src="${thumb}" onerror="this.src='./images/connect_hyundai_g.jpg';"/>
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
        const cfg = slidesConfig.find(cfg => cfg.id === 'food_slide');
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

        slideInstances['food_slide'] = newSplide;
        initCounter(newSplide, `#${cfg.id} .slide-counter`);
    }
    return Promise.resolve();
}

/**
 * 
 * 식음료매장 카테고리 랜더링
 */
function setRenderFoodCates() {
    const groups = getCategoryGroups();
    const targetGroup = groups.find(g => g.subName === '전문식당가');
    const categories = targetGroup?.categories || [];
    const container = document.querySelector('#food_cates');
    const langTextAll = langCodeCheck('전체');
    let html = `
        <li class="item">
            <button type="button" class="active" data-rel="전체" data-lang-code="전체">${langTextAll}</button>
        </li>
    `;
    console.log(categories)
    categories.forEach(cate => {
        const langCateName = ControlState.language === 'KO' ? cate.cate_name_kor : cate.cate_name_eng;
        html += `
            <li class="item">
                <button type="button" data-rel="${cate.code}" data-lang-ko="${cate.cate_name_kor}" data-lang-en="${cate.cate_name_eng}">${langCateName}</button>
            </li>
        `;
    });
    container.innerHTML = html;
    return Promise.resolve();
}


/**
 * 스토어 페이지 진입 시 호출
 */
function page_food() {
    searchFilterReset();
    document.querySelector(`#${ControlState.currentPageInfo} .search_form_low`).classList.remove('hidden');
}
