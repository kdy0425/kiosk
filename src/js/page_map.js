const FLOOR_INFO = ["GF", "1F", "2F", "3F", "4F"];
let mapNavigator = null;
let startInfo = null;
let targetInfo = null;
let kioskLocation = null;
function setRenderMap() {
    return new Promise((resolve) => {
        // 맵 초기화 
        mapNavigator = new MapNavigator({
            contentsData: gl_xml_conf.xml_data,
            routeData: gl_xml_conf.xml_route,
            initScale: 1.0,
            speed: 9, 
            mapWidth: gl_xml_conf.xml_data.HEADER.MAP_RESOLUTION.width,
            mapHeight: gl_xml_conf.xml_data.HEADER.MAP_RESOLUTION.height,
            floorSelector: '.floor-map',
            mapContainerSelector: '.map_container',
            mapWrapperSelector: '.map_wrapper',
            slideWidth: 2160,
            slideHeight: 2345

        });
        mapNavigator.initMap();
        kioskLocation = gl_xml_conf.xml_data.HEADER.KIOSK_FLOOR;
        startInfo = {
            storePos: [Number(kioskLocation.pos_x), Number(kioskLocation.pos_y)],
            gatePos: [Number(kioskLocation.pos_x), Number(kioskLocation.pos_y)],
            floor: kioskLocation.value
        }  

        //cms 코드관리에 등록된 편의시설 정보 버튼으로 랜더링
        // 퀵메뉴 데이터 가져오기
        const quickGroups = getJsonGroups('pubQuickGroup');
        const quickItems = document.querySelector('#pub_quick_items');
        quickItems.innerHTML = '';
        const pubs = Array.isArray(gl_xml_conf.xml_data.PUB_LIST.PUB_INFO)
        ? gl_xml_conf.xml_data.PUB_LIST.PUB_INFO
        : [gl_xml_conf.xml_data.PUB_LIST.PUB_INFO];
        console.log(quickGroups,'cms 코드관리 QUICK PUB LIST')
        quickGroups.forEach(q => {
            // 코드 매칭되는 상세 정보 찾기
            const pub = pubs.find(p => p.PUB_CODE === q.pub_code);
            if (!pub || pub.PUB_USE_YN !== 'Y') return;
            const btnHtml = `<div class="item">
                                <button type="button" onClick="mapSelectCate(this, '${q.pub_code}')">
                                    <img src="${pub.PUB_LIST_URL}" alt="${pub.PUB_NAME_KOR}">
                                    <span data-lang-ko="${pub.PUB_NAME_KOR}" data-lang-en="${pub.PUB_NAME_ENG}">${pub.PUB_NAME_KOR}</span>
                                </button>
                            </div>`;
            quickItems.insertAdjacentHTML('beforeend', btnHtml);
        });

        resolve();
    })
}



function page_map(pageInfo) {

    // active 된 버튼 초기화
    document.querySelectorAll('.facility_cates button').forEach(btn => {
        if (btn.classList.contains('active')) btn.classList.remove('active');
    });
    const splide = slideInstances['map_slide'];
    if (splide) splide.options = {speed: 400};
    document.querySelector('#page_map').classList.toggle('result',false);
    /*
    targetType : store, pub
    storeId: 상점id
    pubCode: 편의시설 code
    wayfindType: path, location
    */
    console.log(pageInfo)
    if (pageInfo) {

        // 길찾기 정보 확인
        if (pageInfo.targetType === 'store') {
            const targetObj = gl_xml_conf.xml_route.STORE_LIST.STORE_INFO.find(store => store.id == pageInfo.storeId);
            if (!targetObj) return;
            targetInfo = {
                storePos: [Number(targetObj.STORE_FLOOR.pos_x), Number(targetObj.STORE_FLOOR.pos_y)],
                gatePos: [Number(targetObj.GATE_POS_X), Number(targetObj.GATE_POS_Y)],
                floor: targetObj.STORE_FLOOR.value
            };
            if (pageInfo.wayfindType === 'path') {
                findTargetPath();
            } else if (pageInfo.wayfindType === 'location') {
                mapNavigator.markStoreLocation(targetInfo);
            }
        } else if (pageInfo.targetType === 'pub') {
            const closestTarget = findClosestPub(pageInfo.pubCode);
            console.log(closestTarget)
            targetInfo = {
                storePos: closestTarget.pos,
                gatePos: closestTarget.pos,
                floor: closestTarget.floor
            };
            if (pageInfo.wayfindType === 'path') {
                findTargetPath();
            } else if (pageInfo.wayfindType === 'location') {
                mapNavigator.markPubLocation(closestTarget);
            }
        }
    }else{
        const splide = slideInstances['map_slide'];
        if (splide && !splide._hasMapMoveHandler) {
            splide.on('move', (newIndex, prevIndex) => {
              mapNavigator.initMapScale();
            });
            splide._hasMapMoveHandler = true; // 사용자 정의 플래그 설정
          }
          
        // 페이지 초기화 코드 
        mapNavigator.showCurrentLocation();
    }    
}



/**
 * 
 * @param {HTMLElement} btn 
 * @param {string} val 
 * 지도 층 변경 함수
 */
function mapSelectFloor(btn, val) {
    mapNavigator.showFloor(val);
}


/**
 * 
 * @param {HTMLElement} btn 
 * @param {string} val 
 * 지도 편의시설 변경 함수
 */
function mapSelectCate(btn, val) {
    activeRadio(btn);
    const closestTarget = findClosestPub(val);
    mapNavigator.markPubLocation(closestTarget);
}


/**
 * 지도 - 현재 위치로 이동하는 함수
 */
function mapCurrentLocation() {
    mapNavigator.showCurrentLocation();
}


function selectMoveType(pubCode) {
    findTargetPath(pubCode);
    document.querySelector('#popup_box .popup_close').click();
}

/**
 * 
 * @param {string} pubCode 
 *  길찾기 함수, 이동수단 없으면 선택 팝업 > 선택 후 pubCode 포함하여 해당함수 재호출
 */
function findTargetPath(pubCode = '') {
    const pathResult = mapNavigator.findWayPath(startInfo, targetInfo, pubCode);
    console.log(pathResult)
    if (pathResult.result) {
        // 결과 화면 그려주기
        // const floors = Object.keys(pathResult.data);
        const floorsDiv = document.querySelector('.floor_history');
        floorsDiv.innerHTML = '';
        const floors = getFloorRange(startInfo.floor, targetInfo.floor);
        const langTextStart = langCodeCheck('출발');
        const langTextArrival = langCodeCheck('도착');
        floors.forEach((floor,index) => {
            console.log(index)
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.innerHTML = `<strong>${floor}</strong>`;
            if(index === 0) {
                itemDiv.innerHTML += `<span data-lang-code="출발">${langTextStart}</span>`;
                itemDiv.addEventListener('click', function(){
                    mapNavigator.showFloor(floor);
                });
            }else if(index === (floors.length-1)) {
                itemDiv.innerHTML += `<span data-lang-code="도착">${langTextArrival}</span>`;
                itemDiv.addEventListener('click', function(){
                    mapNavigator.showFloor(floor);
                });
            }
            floorsDiv.appendChild(itemDiv);
        });

        // 길찾기 완료 화면
        const splide = slideInstances['map_slide'];
        if (splide) splide.options = {speed: 0, arrows:false};
        document.querySelector('#page_map').classList.toggle('result');

        ttsInstructions = mapNavigator.generateTTSRouteInstructions(pathResult.data);
        console.log(ttsInstructions.join('\n'));
        mapNavigator.startPathAnimation();
    } else {
        if (!pathResult.data) {
            console.log('루트 없음');
        } else {
            openPopup('wayfind_move_type');

        }
    }
}
/**
 * 
 * @param {string} start 
 * @param {string} target 
 * @returns 
 * 출발 층에서 도착층까지 이동하는 층 배열 반환
 */
function getFloorRange(start, target) {
    const startIndex = FLOOR_INFO.indexOf(start);
    const targetIndex = FLOOR_INFO.indexOf(target);
  
    if (startIndex === -1 || targetIndex === -1) return [];
  
    if (startIndex === targetIndex) {
        return [start, target]; // 두 번 포함
    } else if (startIndex < targetIndex) {
        return FLOOR_INFO.slice(startIndex, targetIndex + 1);
    } else {
     return FLOOR_INFO.slice(targetIndex, startIndex + 1).reverse();
    }
  }

// 가까운 편의시설 찾기  
function findClosestPub(pubCode) {
    const filteredPubList = gl_xml_conf.xml_route.PUB_LIST.PUB_INFO.filter(pub => pub.PUB_CODE == pubCode);
    let targetArr = [];
    filteredPubList.forEach(pub => {
        targetArr.push({ id: pub.PUB_ID, pos: [Number(pub.PUB_FLOOR.pos_x), Number(pub.PUB_FLOOR.pos_y)], floor: pub.PUB_FLOOR.value });
    });

    return mapNavigator.findClosestTarget(targetArr);
}

function wayfindEnd() {
    mapNavigator.stopPathAnimation();
    document.querySelector('#page_map').classList.toggle('result');
    mapNavigator.initMapItems();
    mapNavigator.showCurrentLocation();
    const splide = slideInstances['map_slide'];
    if (splide) splide.options = {speed: 400};
}

function changeFloorInfo(floor){
    const activeBtn = document.querySelector('.floor_selects button[data-floor="' + floor + '"]')
    activeRadio(activeBtn);
    document.querySelector('#current_floor').textContent = floor;

    //해당층 제목 출력
    const floorGroups = getJsonGroups('floorGroup');
    const currentFloorInfo = floorGroups.find(floorGroup => floorGroup.floor === floor);
    if (currentFloorInfo) {
        document.querySelector('#floor_info .floor_en').textContent = currentFloorInfo.floor_name_eng;
        document.querySelector('#floor_info .floor_local').textContent = currentFloorInfo.floor_name_kor;
    }
}


function mapZoomControl(type){
    if(type === 'in'){
        mapNavigator.zoomControl(1);
    }else if(type === 'out'){
        mapNavigator.zoomControl(-1);
    }else if(type === 'full'){
        mapNavigator.initMapScale();
    }
}