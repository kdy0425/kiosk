
class MapNavigator {
    constructor(options) {
        // xml 데이터
        this.contentsData = options.contentsData || [];
        this.routeData = options.routeData || [];

        // 필요 데이터 추출
        this.kioskLocation = this.contentsData.HEADER.KIOSK_FLOOR;
        this.storeRouteList = this.routeData.STORE_LIST.STORE_INFO;
        this.pubRouteList = this.routeData.PUB_LIST.PUB_INFO;
        this.nodeList = this.routeData.NODE_LIST.NODE_INFO;
        this.mapList = this.contentsData.MAP_LIST.MAP_INFO;
        this.floorOrder = this.mapList.map(m => m.floor);
        this.currentFloor = this.kioskLocation.value;

        this.mapWidth = options.mapWidth || 6300;
        this.mapHeight = options.mapHeight || 2450;
        this.slideWidth = options.slideWidth;
        this.slideHeight = options.slideHeight;
        this.initScale = options.initScale || 1;
        this.translateX = -this.mapWidth / 2;
        this.translateY = -this.mapHeight / 2;

        // 맵관련 Selector
        this.floorSelector = options.floorSelector || '.floor-map';
        this.mapContainerSelector = options.mapContainerSelector || '#map-container';
        this.mapWrapperSelector = options.mapWrapperSelector || '#map-wrapper';

        // 사용할 DOM 요소
        this.mapContainer = document.querySelector(this.mapContainerSelector);
        this.mapWrapper = document.querySelector(this.mapWrapperSelector);

        this.translateX = 0;
        this.translateY = 0;
        // 컨트롤 사용 변수 : 드래그
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;

        // 컨트롤 사용 변수 : 줌인아웃
        this.currentScale = 1;
        this.minScale = options.minScale || 0.05;
        this.maxScale = options.maxScale || 2;
        this.zoomStep = 0.04;

        // 길찾기 path 정보
        this.wayFindInfo = {};
        this.routeCandidates = [];
        this.resultPath = {};

        // 길찾기 애니메이션 정보
        this.strokeStyle = options.strokeStyle || "#cb4319";
        this.lineWidth = options.lineWidth || 10;
        this.speed = options.speed || 9;
        this.cameraZoom = options.cameraZoom || 3; //1~10배
        this.pathAnimationFrameId = null;
        this.pathAnimationStopped = false;

        // 맵 위 아이콘 정보
        this.kioskIcon = options.kioskIcon || { "url": "/images/wayfind/ico_here.svg", "width": "100", "height": "100", "direction": this.contentsData.HEADER.ICON_DIRECT - 180 };
        this.targetIcon = options.targetIcon || { "url": "/images/wayfind/ico_arrival.svg", "width": "80", "height": "80", "offsetY": -80 };
        this.moveIcon = options.moveIcon || { "url": "/images/wayfind/ico_human.svg", "width": "100", "height": "100" };

    }


    //////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// 맵 그리기 함수 & 기본 이벤트 [S] /////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    initMap() {
        console.log('initMap')
        // this.mapWrapper.style.position = 'absolute';
        // this.mapWrapper.style.top = '50%';
        // this.mapWrapper.style.left = '50%';
        // this.mapWrapper.style.transform = 'translate(-50%, -50%)';
        // this.mapWrapper.style.transformOrigin = '0 0';

        this.contentsData.MAP_LIST.MAP_INFO.forEach(map => {
            // const mapLi = document.createElement('li');
            // mapLi.className = 'splide__slide';

            const slideLi = document.createElement('li');
            slideLi.className = 'splide__slide map';
            slideLi.style.width = this.slideWidth;
            slideLi.style.height = this.slideHeight;    // 슬라이드 크기에 맞춤
            // slideLi.style.position = 'relative';
            slideLi.dataset.floor = map.floor;

            const floorDiv = document.createElement('div');
            floorDiv.className = 'floor-map';
            floorDiv.style.cssText = `
                width: ${this.mapWidth}px;
                height: ${this.mapHeight}px;
                position: absolute;
                transform-origin: center center;
                top: 50%;
                left: 50%;
                background-image: url(${map.MAIN_MAP_URL});
                background-size: cover;
                background-position: center;
            `;

            const canvasDisplay = document.createElement('div');
            canvasDisplay.className = 'canvas-display';
            canvasDisplay.style.position = 'absolute';
            canvasDisplay.style.top = '0';
            canvasDisplay.style.left = '0';
            canvasDisplay.style.width = '100%';
            canvasDisplay.style.height = '100%';
            canvasDisplay.style.zIndex = 9;


            const canvas = document.createElement('canvas');
            canvas.className = 'floor-canvas';
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.width = this.mapWidth;
            canvas.height = this.mapHeight;
            canvas.style.zIndex = 8;


            // ✅ 매장 래퍼
            const storeGroup = document.createElement('div');
            storeGroup.className = 'store-group';
            storeGroup.style.position = 'absolute';
            storeGroup.style.top = '0';
            storeGroup.style.left = '0';
            storeGroup.style.width = '100%';
            storeGroup.style.height = '100%';

            this.storeRouteList
                .filter(s => s.STORE_FLOOR.value === map.floor)
                .forEach(store => {
                    const storeEl = document.createElement('div');
                    storeEl.className = 'store-item';
                    storeEl.innerHTML = store.STORE_NAME_KOR.replaceAll(/(\\n|\/n|\n)/g, '<br>');
                    storeEl.dataset.langKr = store.STORE_NAME_KOR.replaceAll(/(\\n|\/n|\n)/g, '<br>');

                    const rawText = store.STORE_NAME_ENG.replaceAll(/(\\n|\/n|\n)/g, '<br>');
                    if (rawText.includes('공용좌석')) {
                        storeEl.dataset.langEn = transformSeatingText(rawText, 'en');
                        console.log(transformSeatingText(rawText, 'en'),'sss')
                    } else {
                        storeEl.dataset.langEn = rawText;
                    }

                    storeEl.style.cssText = `
                        position: absolute;
                        left: ${store.STORE_FLOOR.pos_x}px;
                        top: ${store.STORE_FLOOR.pos_y}px;
                        font-size: ${store.FONT_SIZE * 0.1 || 2.5}rem;
                        color: ${store.FONT_COLOR || '#000'};
                        line-height: ${store.LINE_HEIGHT || 25}px;
                        white-space: nowrap;
                        transform: translate(-50%, -50%);
                        font-weight: 500;
                        ${store.STORE_DEFAULT_ANGLE.value == 'H' ? 'writing-mode: vertical-rl; text-orientation: mixed;' : ''}
                    `;
                    storeGroup.appendChild(storeEl);
                });

            // ✅ 편의시설 래퍼
            const pubGroup = document.createElement('div');
            pubGroup.className = 'pub-group';
            pubGroup.style.position = 'absolute';
            pubGroup.style.top = '0';
            pubGroup.style.left = '0';
            pubGroup.style.width = '100%';
            pubGroup.style.height = '100%';

            this.pubRouteList
                .filter(p => p.PUB_FLOOR.value === map.floor)
                .forEach(pub => {
                    const pubMeta = this.contentsData.PUB_LIST.PUB_INFO.find(meta => meta.PUB_CODE === pub.PUB_CODE);
                    // if (!pubMeta || pubMeta.PUB_DISPLAY_YN !== 'Y') return;
                    const pubEl = document.createElement('img');
                    pubEl.src = pubMeta.PUB_URL;
                    pubEl.alt = pubMeta.PUB_NAME_KOR || '편의시설';
                    pubEl.dataset.id = pub.PUB_ID;
                    pubEl.style.cssText = `
                        position: absolute;
                        left: ${pub.PUB_FLOOR.pos_x}px;
                        top: ${pub.PUB_FLOOR.pos_y}px;
                        width: 40px;
                        height: 40px;
                        transform: translate(-50%, -50%);
                        pointer-events: none;
                    `;
                    pubGroup.appendChild(pubEl);
                });

            // 그룹들을 floor에 추가
            floorDiv.appendChild(canvasDisplay);
            floorDiv.appendChild(canvas);
            floorDiv.appendChild(storeGroup);
            floorDiv.appendChild(pubGroup);
            slideLi.appendChild(floorDiv);
            this.mapWrapper.appendChild(slideLi);
        });


        // 컨테이너에 맞게 비율 조정
        this.setInitScale();
        this.initMapItems();

        // 줌 컨트롤/드래그 이벤트 추가
        this.setupZoomControl();
        this.setupPinchZoomControl();
        this.setupPanControl();
    }

    setInitScale() {
        const containerW = this.slideWidth;
        const containerH = this.slideHeight;

        this.initTraslateX = -this.mapWidth / 2;
        this.initTraslateY = -this.mapHeight / 2;

        this.initScale = Math.min(containerW / this.mapWidth, containerH / this.mapHeight);
    }

    // 줌인아웃 초기화 함수
    setupZoomControl() {
        this.mapWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();

            const delta = -e.deltaY;
            const oldScale = this.currentScale;
            const zoomDirection = delta > 0 ? 1 : -1;
            const newScale = oldScale + zoomDirection * this.zoomStep;
            this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));

            // 마우스 위치 기준 줌 적용
            const rect = this.mapWrapper.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const centerX = this.mapWrapper.clientWidth / 2;
            const centerY = this.mapWrapper.clientHeight / 2;

            // 기준점은 transform-origin: center center
            const scaleRatio = this.currentScale / oldScale;
            const dx = mouseX - centerX;
            const dy = mouseY - centerY;

            this.translateX -= dx * (scaleRatio - 1);
            this.translateY -= dy * (scaleRatio - 1);

            const activeFloor = document.querySelector(`.map.is-active ${this.floorSelector}`);
            this.updateTransform(activeFloor);
        }, { passive: false });
    }

    // 핀치 줌인아웃 함수
    setupPinchZoomControl() {
        this.mapWrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                this.pinchStartDistance = Math.hypot(dx, dy);
                this.pinchStartScale = this.currentScale;
            }
        }, { passive: false });

        this.mapWrapper.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.pinchStartDistance !== null) {
                e.preventDefault(); // 확대할 때 스크롤 방지

                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDistance = Math.hypot(dx, dy);
                const scaleFactor = currentDistance / this.pinchStartDistance;

                this.currentScale = this.pinchStartScale * scaleFactor;
                this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, this.currentScale));

                const activeFloor = document.querySelector(`.map.is-active ${this.floorSelector}`);
                this.updateTransform(activeFloor);
            }
        }, { passive: false });

        this.mapWrapper.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                this.pinchStartDistance = null;
                this.pinchStartScale = null;
            }
        });
    }

    // 드래그 초기화 함수 
    setupPanControl() {
        this.mapWrapper.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.mapWrapper.setPointerCapture(e.pointerId);
        });

        this.mapWrapper.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;

            const dx = e.clientX - this.lastX;
            const dy = e.clientY - this.lastY;
            this.lastX = e.clientX;
            this.lastY = e.clientY;

            this.translateX += dx;
            this.translateY += dy;

            const activeFloor = document.querySelector(`.map.is-active ${this.floorSelector}`);
            this.updateTransform(activeFloor);
        });

        this.mapWrapper.addEventListener('pointerup', () => {
            this.isDragging = false;
        });

        this.mapWrapper.addEventListener('pointerleave', () => {
            this.isDragging = false;
        });
    }

    updateTransform(el) {
        el.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.currentScale})`;
    }



    //////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// 맵 그리기 함수 & 기본 이벤트 [E] /////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////// 층 이동 함수 [S] /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////


    // 층 이동
    showFloor(floor) {
        if (this.currentFloor == floor) this.initMapScale();
        this.currentFloor = floor;
        changeFloorInfo(floor);
        const slides = slideInstances['map_slide'].Components.Slides.get(); // 슬라이드 배열

        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i].slide; // 실제 HTML element
            if (slide.dataset.floor === floor) {
                slideInstances['map_slide'].go(i);
                break;
            }
        }
    }

    initMapItems() {
        document.querySelectorAll(`${this.floorSelector}`).forEach(floor => {
            floor.querySelector('.canvas-display').innerHTML = '';
            const floorCanvas = floor.querySelector('canvas');
            const ctx = floorCanvas.getContext('2d');
            ctx.clearRect(0, 0, floorCanvas.width, floorCanvas.height);
        });
        this.drawIconOnMap(Number(this.kioskLocation.pos_x), Number(this.kioskLocation.pos_y), this.kioskIcon, this.kioskLocation.value);
    }

    // 컨테이너에 맞춘 비율로 초기화
    initMapScale() {
        this.currentScale = this.initScale;
        this.translateX = this.initTraslateX;
        this.translateY = this.initTraslateY;
        document.querySelectorAll(`${this.floorSelector}`).forEach(floor => {
            this.updateTransform(floor);
        });
    }

    //현재 위치 보기
    showCurrentLocation() {
        this.initMapItems();
        this.showFloor(this.kioskLocation.value);
        this.applyCameraTransform(Number(this.kioskLocation.pos_x), Number(this.kioskLocation.pos_y), this.kioskLocation.value);
    }

    // 특정 위치 표시 & 확대보기
    markStoreLocation(target) {
        this.showFloor(target.floor);
        this.drawIconOnMap(Number(target.storePos[0]), Number(target.storePos[1]), this.targetIcon, target.floor);
        this.applyCameraTransform(Number(target.storePos[0]), Number(target.storePos[1]), target.floor)
    }


    // 특정 위치 표시 & 확대보기
    markPubLocation(target) {
        console.log(target);
        // 초기화 
        this.mapWrapper.querySelectorAll('.blink-animation')
            .forEach(el => el.classList.remove('blink-animation'));

        this.showFloor(target.floor);
        const pubIcon = document.querySelector(`.map[data-floor="${target.floor}"] .pub-group img[data-id="${target.id}"]`);
        pubIcon.classList.add('blink-animation');
        this.applyCameraTransform(Number(target.pos[0]), Number(target.pos[1]), target.floor)
    }

    // 줌인/줌아웃
    zoomControl(zoomDirection) { // 1 혹은 -1
        if (zoomDirection == 0) {
            this.currentScale = this.initScale;
            this.translateX = this.initTraslateX;
            this.translateY = this.initTraslateY;
            this.updateTransform(floor);
        } else {
            const oldScale = this.currentScale;
            const newScale = oldScale + zoomDirection * this.zoomStep;
            this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));

            const activeFloor = document.querySelector(`.map.is-active ${this.floorSelector}`);
            this.updateTransform(activeFloor);
        }

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////// 층 이동 함수 [E] /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// 길찾기 함수 : 시작점 -> 목표점 [S] ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // 파라미터값 예시: { pos: [3193, 1490], floor: 'L2' }, 'P01'
    findWayPath(start, target, pubCode = '') {    // 이동수단 선택했을 경우 pub_code에 값이 전달됨
        if (!target) return;
        this.wayFindInfo.start = start;
        this.wayFindInfo.target = target;
        this.wayFindInfo.pubCode = pubCode;
        console.log('this.wayFindInfo', this.wayFindInfo);

        const pathResult = this.findOptimalMultiFloorPath();
        if (pathResult.result) {
            this.resultPath = pathResult.data;

            // 출발 도착 아이콘 표시
            // this.drawIconOnMap(this.wayFindInfo.start.storePos[0], this.wayFindInfo.start.storePos[1], this.kioskIcon, this.wayFindInfo.start.floor);
            this.drawIconOnMap(this.wayFindInfo.target.storePos[0], this.wayFindInfo.target.storePos[1], this.targetIcon, this.wayFindInfo.target.floor);
        }

        return pathResult;
    }


    // 층이 다른경우 어떤 이동수단 있는지 확인
    checkPub() {
        const pubCodes = ['P01', 'P02']; // 에스컬레이터, 엘리베이터
        const availableCodes = new Set();
        const startFloor = this.wayFindInfo.start.floor;
        const targetFloor = this.wayFindInfo.target.floor;

        for (const pubCode of pubCodes) {
            const grouped = this.groupPubByArea(pubCode); // { area: { floor: PUB_FLOOR, ... }, ... }

            for (const area in grouped) {
                const floorMap = grouped[area];
                const availableFloors = Object.keys(floorMap);

                // 현재 층에서 시작해서 목표 층까지 도달 가능한지 BFS로 확인
                const visited = new Set();
                const queue = [startFloor];

                while (queue.length > 0) {
                    const floor = queue.shift();
                    if (floor === targetFloor) {
                        availableCodes.add(pubCode);
                        break;
                    }
                    visited.add(floor);
                    for (const nextFloor of availableFloors) {
                        if (!visited.has(nextFloor) && this.areFloorsAdjacent(floor, nextFloor)) {
                            queue.push(nextFloor);
                        }
                    }
                }

                if (availableCodes.has(pubCode)) break; // 하나의 area라도 연결 가능하면 ok
            }
        }

        return Array.from(availableCodes);
    }
    areFloorsAdjacent(f1, f2) {
        // "L1", "L2", "L3" 등 숫자만 비교
        const toNum = f => parseInt(f.replace(/\D/g, ''));
        return Math.abs(toNum(f1) - toNum(f2)) === 1;
    }

    findOptimalMultiFloorPath() {
        // 같은 층인 경우 
        if (this.wayFindInfo.start.floor === this.wayFindInfo.target.floor) {
            const nodeInFloor = this.nodeList.filter(n => n.floor === this.wayFindInfo.start.floor);
            const path = this.findShortestPath(nodeInFloor, this.wayFindInfo.start.gatePos, this.wayFindInfo.target.gatePos);
            return { result: true, data: { [this.wayFindInfo.start.floor]: path } };
        }

        // 다른 층인 경우 > 선택 팝업 띄우게 하기
        if (!this.wayFindInfo.pubCode) {
            const availablePub = this.checkPub();
            console.log('availablePub', availablePub)
            if (availablePub.length == 1) {
                // 이동 가능 수단 하나인 경우 하나로 진행
                this.wayFindInfo.pubCode = availablePub[0];
            } else {
                // 이동 가능 수단 하나 이상인 경우 선택 팝업 뜨도록 값 반환
                return { result: false, data: availablePub };
            }
        }

        // 이동수단 확인
        const grouped = this.groupPubByArea(this.wayFindInfo.pubCode);
        console.log('grouped', grouped)

        this.routeCandidates = this.findValidPubRoutes(grouped);
        if (this.routeCandidates.length === 0) return {};

        let bestResult = null;
        let bestScore = Infinity;

        // console.log('routeCandidates : ', this.routeCandidates);
        for (const route of this.routeCandidates) {
            const pathSet = this.buildMultiFloorPathFromRoute(grouped, route);
            const score = this.evaluatePathScore(pathSet, route.length - 1); // 환승 횟수 = 구간 수 - 
            if (score < bestScore) {
                bestScore = score;
                bestResult = pathSet;
            }
        }
        return { result: true, data: bestResult };
    }

    groupPubByArea(pubCode) {
        const map = {};
        for (const pub of this.pubRouteList) {
            if (pub.PUB_CODE !== pubCode) continue;
            const area = pub.area;
            const floor = pub.PUB_FLOOR.value;
            if (!map[area]) map[area] = {};
            map[area][floor] = pub.PUB_FLOOR;
        }
        return map;
    }


    findValidPubRoutes(grouped) {
        const routes = [];

        for (const area in grouped) {
            const floors = Object.keys(grouped[area]);
            if (floors.includes(this.wayFindInfo.start.floor) && floors.includes(this.wayFindInfo.target.floor)) {
                routes.push([{ fromFloor: this.wayFindInfo.start.floor, toFloor: this.wayFindInfo.target.floor, area }]);
            }
        }

        for (const area1 in grouped) {
            if (!grouped[area1][this.wayFindInfo.start.floor]) continue;

            for (const mid of Object.keys(grouped[area1])) {
                if (mid === this.wayFindInfo.start.floor) continue;

                for (const area2 in grouped) {
                    if (area2 === area1) continue;
                    if (grouped[area2][mid] && grouped[area2][this.wayFindInfo.target.floor]) {
                        routes.push([
                            { fromFloor: this.wayFindInfo.start.floor, toFloor: mid, area: area1 },
                            { fromFloor: mid, toFloor: this.wayFindInfo.target.floor, area: area2 }
                        ]);
                    }
                }
            }
        }

        return routes.sort((a, b) => a.length - b.length);
    }

    buildMultiFloorPathFromRoute(grouped, route) {
        const result = {};
        let prevPos = this.wayFindInfo.start.gatePos;

        for (let i = 0; i < route.length; i++) {
            const { fromFloor, toFloor, area } = route[i];
            const fromFloorNodes = this.nodeList.filter(n => n.floor === fromFloor);
            const from = prevPos;
            const to = this.getPubPosFromArea(grouped, area, fromFloor);
            let path = this.findShortestPath(fromFloorNodes, from, to);

            result[fromFloor] = path;
            prevPos = this.getPubPosFromArea(grouped, area, toFloor);
        }

        const finalNodes = this.nodeList.filter(n => n.floor === this.wayFindInfo.target.floor);
        let finalPath = this.findShortestPath(finalNodes, prevPos, this.wayFindInfo.target.gatePos);

        result[this.wayFindInfo.target.floor] = finalPath;

        return result;
    }

    getPubPosFromArea(grouped, area, floor) {
        if (!grouped[area] || !grouped[area][floor]) return null;
        const { pos_x, pos_y } = grouped[area][floor];
        return [parseInt(pos_x), parseInt(pos_y)];
    }

    evaluatePathScore(pathSet, transferCount, penalty = 100) {
        let total = 0;
        for (const floor in pathSet) {
            total += this.computePathLength(pathSet[floor]);
        }
        return total + penalty * transferCount;
    }

    computePathLength(path) {
        let length = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const [x1, y1] = path[i];
            const [x2, y2] = path[i + 1];
            length += Math.hypot(x2 - x1, y2 - y1);
        }
        return length;
    }

    findShortestPath(nodeList, start, goal) {
        const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
        const nodeKey = (x, y) => `${Math.round(x)},${Math.round(y)}`;
        const parseKey = key => key.split(',').map(Number);

        const graph = new Map();
        for (const node of nodeList) {
            const a = [parseInt(node.x1), parseInt(node.y1)];
            const b = [parseInt(node.x2), parseInt(node.y2)];
            const aKey = nodeKey(...a);
            const bKey = nodeKey(...b);
            const d = dist(a, b);

            if (!graph.has(aKey)) graph.set(aKey, []);
            if (!graph.has(bKey)) graph.set(bKey, []);
            graph.get(aKey).push({ node: bKey, weight: d });
            graph.get(bKey).push({ node: aKey, weight: d });
        }

        function projectPointToSegment(p, a, b) {
            const [px, py] = p;
            const [ax, ay] = a;
            const [bx, by] = b;
            const dx = bx - ax;
            const dy = by - ay;
            if (dx === 0 && dy === 0) return a;
            const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
            const clampedT = Math.max(0, Math.min(1, t));
            return [ax + clampedT * dx, ay + clampedT * dy];
        }

        function findNearestProjection(point) {
            let minDist = Infinity;
            let bestProj = null;
            let bestSeg = null;

            for (const node of nodeList) {
                const a = [parseInt(node.x1), parseInt(node.y1)];
                const b = [parseInt(node.x2), parseInt(node.y2)];
                const proj = projectPointToSegment(point, a, b);
                const d = dist(point, proj);

                if (d < minDist) {
                    minDist = d;
                    bestProj = proj;
                    bestSeg = { a, b };
                }
            }

            return { proj: bestProj, seg: bestSeg };
        }

        function addVirtualNodeToGraph(graph, key, pos, seg) {
            const aKey = nodeKey(...seg.a);
            const bKey = nodeKey(...seg.b);
            const d1 = dist(pos, seg.a);
            const d2 = dist(pos, seg.b);

            if (!graph.has(key)) graph.set(key, []);
            graph.get(key).push({ node: aKey, weight: d1 });
            graph.get(key).push({ node: bKey, weight: d2 });

            if (graph.has(aKey)) graph.get(aKey).push({ node: key, weight: d1 });
            if (graph.has(bKey)) graph.get(bKey).push({ node: key, weight: d2 });
        }

        function areOnSameSegment(p1, p2, nodeList) {
            for (const node of nodeList) {
                const a = [parseInt(node.x1), parseInt(node.y1)];
                const b = [parseInt(node.x2), parseInt(node.y2)];

                const isOn = (p) => {
                    const [x, y] = p;
                    const [x1, y1] = a;
                    const [x2, y2] = b;
                    const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
                    if (Math.abs(cross) > 1e-2) return false;

                    const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
                    const lenSq = (x2 - x1) ** 2 + (y2 - y1) ** 2;
                    return dot >= 0 && dot <= lenSq;
                };

                if (isOn(p1) && isOn(p2)) return true;
            }
            return false;
        }

        const { proj: startProj, seg: startSeg } = findNearestProjection(start);
        const { proj: goalProj, seg: goalSeg } = findNearestProjection(goal);
        const startKey = nodeKey(...startProj);
        const goalKey = nodeKey(...goalProj);

        addVirtualNodeToGraph(graph, startKey, startProj, startSeg);
        addVirtualNodeToGraph(graph, goalKey, goalProj, goalSeg);

        // 두 가상 노드가 같은 선분 위에 있으면 직접 연결
        if (areOnSameSegment(startProj, goalProj, nodeList)) {
            const d = dist(startProj, goalProj);
            graph.get(startKey).push({ node: goalKey, weight: d });
            graph.get(goalKey).push({ node: startKey, weight: d });
        }

        const dists = {};
        const prev = {};
        const pq = new Set(graph.keys());

        for (const key of pq) dists[key] = Infinity;
        dists[startKey] = 0;

        while (pq.size > 0) {
            const current = [...pq].reduce((a, b) => dists[a] < dists[b] ? a : b);
            pq.delete(current);

            if (current === goalKey) break;

            for (const { node: neighbor, weight } of graph.get(current)) {
                if (!pq.has(neighbor)) continue;
                const alt = dists[current] + weight;
                if (alt < dists[neighbor]) {
                    dists[neighbor] = alt;
                    prev[neighbor] = current;
                }
            }
        }

        const path = [];
        let current = goalKey;
        while (current) {
            path.unshift(parseKey(current));
            current = prev[current];
        }

        path.unshift(start);
        path.push(goal);

        return path;
    }



    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// 길찾기 함수 : 시작점 -> 목표점 [E] ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// 길찾기 함수 : 애니메이션 & 맵위 표시 [S] /////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // 좌표에 목적지 아이콘 그리기
    drawIconOnMap(x, y, iconObj, floor) {
        const activeDisplay = document.querySelector(`.map[data-floor="${floor}"] .canvas-display`);
        if (iconObj.url) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('floating-animation'); // float 애니메이션은 wrapper에 적용
            wrapper.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y + (iconObj.offsetY || 0)}px;
                transform: translate(-50%, -50%);
                pointer-events: none;
                width: ${iconObj.width}px;
                height: ${iconObj.height}px;
                `;

            const icon = document.createElement('img');
            icon.src = iconObj.url;
            icon.style.cssText = `
                width: 100%;
                height: 100%;
                transform: rotate(${iconObj.direction || 0}deg);
                display: block;
                `;
            wrapper.appendChild(icon);
            activeDisplay.appendChild(wrapper);
        }
    }

    // 경로 그리기 
    drawPathOnCanvas(floor, path) {
        if (path.length < 2) return;
        const activeCanvas = document.querySelector(`.map[data-floor="${floor}"] canvas`);
        const ctx = activeCanvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);

        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
        }

        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
    }

    // showResultPath(floor) {

    //     document.querySelectorAll('.floor-map').forEach(div => {
    //         if (div.dataset.floor === floor) {
    //             div.style.display = 'block';
    //             div.classList.add('active');
    //         } else {
    //             div.style.display = 'none';
    //             div.classList.remove('active');
    //         }
    //     });
    // }


    startPathAnimation() {

        const iconDiv = document.createElement('div');
        iconDiv.style.position = 'absolute';
        iconDiv.style.zIndex = '9999';
        iconDiv.style.pointerEvents = 'none';

        const iconImg = new Image();
        iconImg.src = this.moveIcon.url;
        iconImg.width = this.moveIcon.width;
        iconImg.height = this.moveIcon.height;

        iconDiv.appendChild(iconImg);

        iconImg.onload = () => {
            //     iconDiv.innerHTML = `<svg id="ico_walking_man" xmlns="http://www.w3.org/2000/svg" width="57" height="57" viewBox="0 0 57 57">
            //     <circle id="타원_742" data-name="타원 742" cx="28.5" cy="28.5" r="28.5" fill="#ff643c" opacity="0.46"/>
            //     <circle id="타원_743" data-name="타원 743" cx="21.5" cy="21.5" r="21.5" transform="translate(7 7)" fill="#ff643c" opacity="0.88"/>
            //     <circle id="타원_744" data-name="타원 744" cx="16.5" cy="16.5" r="16.5" transform="translate(12 12)" fill="#ff643c" opacity="0.88"/>
            //     <g id="ico_walking_man-2" data-name="ico_walking_man" transform="translate(20.182 14.713)">
            //       <g id="그룹_15159" data-name="그룹 15159">
            //         <path id="패스_71540" data-name="패스 71540" d="M15.158,12.767a1.706,1.706,0,0,1-2.124-.96L11.721,8.619,11.289,8.4v3.169a2.772,2.772,0,0,1-.988,2.127l-3.68,3.1a2.836,2.836,0,0,0-.733.955L3.325,23.263A1.743,1.743,0,0,1,.154,21.815l2.565-5.708a3.886,3.886,0,0,1,1.043-1.381L6.17,12.7A1.31,1.31,0,0,0,6.639,11.7V4.917a1.849,1.849,0,0,1,1.6-1.873,2.863,2.863,0,0,1,1.233,0,3.265,3.265,0,0,1,1.314.61l3.483,2.755a1.071,1.071,0,0,1,.323.421l1.573,3.658a1.693,1.693,0,0,1-.007,1.359,1.714,1.714,0,0,1-1,.92m.013-1.852L13.6,7.26l-3.03-2.582a3.673,3.673,0,0,0-1.245-.641,1.856,1.856,0,0,0-1.087.091c-.292,0-.517.5-.517.789V11.7a2.4,2.4,0,0,1-.855,1.839l-2.41,2.022a2.773,2.773,0,0,0-.75.992L1.142,22.258a.655.655,0,0,0-.009.517.646.646,0,0,0,.362.364.661.661,0,0,0,.848-.332l2.563-5.516a3.89,3.89,0,0,1,1.016-1.328l3.675-3.1a1.7,1.7,0,0,0,.609-1.3V6.616l2.009,1.04a1.073,1.073,0,0,1,.506.55l1.317,3.187a.614.614,0,0,0,1.13.015.6.6,0,0,0,0-.493" transform="translate(0 3.714)" fill="#fff"/>
            //         <path id="패스_71541" data-name="패스 71541" d="M.44,7.28c.209-.161.438-.467.7-.421a.951.951,0,0,1,.633.421l5.452,7.874a1.841,1.841,0,0,1,.345,1.461,1.678,1.678,0,0,1-.831,1.163,1.976,1.976,0,0,1-2.665-.67l-5.286-7.8c-.257-.414-.108-.751.291-1.056M4.988,16.53a.9.9,0,0,0,1.213.308.6.6,0,0,0,.3-.425.761.761,0,0,0-.142-.6L.941,7.988l-1.167.851Z" transform="translate(8.704 9.947)" fill="#fff"/>
            //         <path id="패스_71542" data-name="패스 71542" d="M7.347,10.123a1.608,1.608,0,0,1-1.136.471c-.057,0-.113,0-.17-.009a1.61,1.61,0,0,1-.975-2.733L8.077,4.814a.744.744,0,0,1,1.272.523V7.715a.97.97,0,0,1-.288.691Zm.918-3.959L5.835,8.616a.525.525,0,0,0,.744.742L8.265,7.672Z" transform="translate(-1.674 5.084)" fill="#fff"/>
            //         <path id="패스_71543" data-name="패스 71543" d="M1.956,3.093A3.095,3.095,0,1,1,5.051,6.187,3.1,3.1,0,0,1,1.956,3.093M5.051,5.211A2.119,2.119,0,1,0,2.932,3.093,2.121,2.121,0,0,0,5.051,5.211" transform="translate(3.688 0)" fill="#fff"/>
            //       </g>
            //     </g>
            //   </svg>
            //   `;
            this.animateIconAlongPath(iconDiv);
        };
    }


    // 길찾기 애니메이션
    // 길찾기 애니메이션
    animateIconAlongPath(iconDiv) {
        const floors = Object.keys(this.resultPath);
        let currentFloorIndex = 0;
        const self = this;

        function animateFloor(floor) {
            const path = self.resultPath[floor];
            if (!path || path.length < 2) return;

            let segment = 0;
            let progress = 0;
            let lastTimestamp = null;

            const activeFloor = document.querySelector(`.map[data-floor="${floor}"] ${self.floorSelector}`);
            const activeCanvas = activeFloor.querySelector('canvas');
            const ctx = activeCanvas.getContext('2d');
            self.drawPathOnCanvas(floor, path);

            function step(timestamp) {
                if (self.pathAnimationStopped) return;
                if (!lastTimestamp) lastTimestamp = timestamp;
                lastTimestamp = timestamp;

                const distance = self.speed;

                if (segment >= path.length - 1) {
                    currentFloorIndex++;
                    if (currentFloorIndex < floors.length) {
                        const nextFloor = floors[currentFloorIndex];
                        self.showFloor(nextFloor);
                        setTimeout(() => animateFloor(nextFloor), 300);
                    } else {
                        console.log('애니메이션 끝남');
                    }
                    return;
                }

                const [x1, y1] = path[segment];
                const [x2, y2] = path[segment + 1];
                const dx = x2 - x1;
                const dy = y2 - y1;
                const segmentLength = Math.hypot(dx, dy);

                progress += distance;

                if (progress >= segmentLength) {
                    progress = 0;
                    segment++;
                    lastTimestamp = null;
                    requestAnimationFrame(step);
                    return;
                }

                const t = progress / segmentLength;
                const cx = x1 + dx * t;
                const cy = y1 + dy * t;

                self.applyCameraTransform(cx, cy, floor); // 필요 시 카메라 이동

                // 아이콘 이동만, 캔버스는 clear 안 함
                activeFloor.querySelector('.canvas-display').append(iconDiv);
                iconDiv.style.left = `${cx}px`;
                iconDiv.style.top = `${cy}px`;
                iconDiv.style.transform = 'translate(-50%, -50%)';
                iconDiv.style.zIndex = 999;

                self.pathAnimationFrameId = requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        }

        this.pathAnimationStopped = false;
        const firstFloor = floors[0];
        this.showFloor(firstFloor);
        animateFloor(firstFloor);
    }


    stopPathAnimation() {
        this.pathAnimationStopped = true;
        if (this.pathAnimationFrameId) {
            cancelAnimationFrame(this.pathAnimationFrameId);
            this.pathAnimationFrameId = null;
        }

        console.log('경로 애니메이션 중단됨');

    }

    applyCameraTransform(cx, cy, floor) {
        const activeFloor = document.querySelector(`.map[data-floor="${floor}"] ${this.floorSelector}`);

        const baseScale = this.initScale || 1;
        const zoom = Math.max(1, Math.min(this.cameraZoom, 10));
        const totalScale = baseScale * zoom;
        this.currentScale = totalScale;

        // 중심 기준으로 offset 계산
        const offsetX = this.mapWidth / 2 - cx * totalScale;
        const offsetY = this.mapHeight / 2 - cy * totalScale;

        this.translateX = offsetX;
        this.translateY = offsetY;

        this.updateTransform(activeFloor);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// 길찾기 함수 : 애니메이션 [E] ///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////




    ///////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// 가까운 편의시설 찾기 [S] /////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////  

    findClosestTarget(targetArr) {
        const current = this.kioskLocation; // pos_x, pos_y, value (floor)
        const currentFloorIndex = this.floorIndex(current.value); // 예: L1 -> 0, L2 -> 1 등
        let minDist = Infinity;
        let closestTarget = null;

        if (targetArr.length === 1) {
            return targetArr[0];
        }

        targetArr.forEach(target => {
            const targetFloorIndex = this.floorIndex(target.floor);
            const dx = target.pos[0] - Number(current.pos_x);
            const dy = target.pos[1] - Number(current.pos_y);
            const dz = targetFloorIndex - currentFloorIndex;

            // Z축 보정값: 층 간 이동의 거리 감각을 맞춰주는 역할 (예: 1000px = 1층 차이)
            const zWeight = 1000;
            const dist3D = Math.hypot(dx, dy, dz * zWeight);

            if (dist3D < minDist) {
                minDist = dist3D;
                closestTarget = target;
            }
        });

        return closestTarget;
    }

    floorIndex(floorName) {
        // 예시 순서 정의: 지하 → 지상
        const idx = this.floorOrder.indexOf(floorName.toUpperCase());
        return idx !== -1 ? idx : Number.MAX_SAFE_INTEGER;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////// 가까운 편의시설 찾기[E] /////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////// tts 스크립트 작성 [S] ////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////
    getRelativeClockDirectionFromAngle(forwardAngle, curr, next) {
        const dx = next[0] - curr[0];
        const dy = next[1] - curr[1];
        // 오차범위 +-5px면 각도 0을 반환해줌
        let targetAngle = 0;
        if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5) {
            targetAngle = 0;
        } else {
            targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        }
        let relativeAngle = (targetAngle - forwardAngle + 360) % 360;
        console.log(forwardAngle, curr, next, targetAngle, relativeAngle )

        if (relativeAngle < 45 || relativeAngle >= 315) return null;  // 직진
        if (relativeAngle < 67.5) return '2시 방향';
        if (relativeAngle < 112.5) return '3시 방향';
        if (relativeAngle < 157.5) return '5시 방향';
        if (relativeAngle < 202.5) return '6시 방향';
        if (relativeAngle < 247.5) return '8시 방향';
        if (relativeAngle < 292.5) return '9시 방향';
        return '10시 방향';
    }

    getDistance(a, b) {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        return Math.round(Math.sqrt(dx * dx + dy * dy) * 10);
    }

    generateTTSRouteInstructions(data) {
        const directionTexts = [];
        const floorNames = Object.keys(data);
        let forwardAngle = this.contentsData.HEADER.ICON_DIRECT;

        for (let f = 0; f < floorNames.length; f++) {
            const floor = floorNames[f];
            const coords = data[floor];
            directionTexts.push(`[${floor}]층 입니다.`);

            let direction = null;
            let accumulatedDistance = 0;
            let isFirstStep = true;

            for (let i = 0; i < coords.length - 1; i++) {
                const curr = coords[i];
                const next = coords[i + 1];
                const distance = this.getDistance(curr, next);

                // 출발 안내
                if (i === 0) {
                    if (f === 0) {
                        // 첫 층의 첫 구간은 icon_direction 기준
                        forwardAngle = (this.contentsData.HEADER.ICON_DIRECT - 90) % 360;
                    } else {
                        // 층 이동 후 첫 구간은 무조건 직진 간주
                        direction = null;
                        accumulatedDistance = distance;
                        continue;
                    }
                } else {
                    // forwardAngle 갱신
                    const prev = coords[i - 1];
                    // 방향 계산 무시 오차범위 : 5
                    if (Math.abs(curr[1] - prev[1]) <= 5 && Math.abs(curr[0] - prev[0]) <= 5) {
                        forwardAngle = 0;
                    } else {
                        forwardAngle = Math.atan2(curr[1] - prev[1], curr[0] - prev[0]) * 180 / Math.PI;
                    }
                }

                const currentDirection = this.getRelativeClockDirectionFromAngle(forwardAngle, curr, next);

                if (currentDirection === null) {
                    // 직진 구간 → 누적
                    accumulatedDistance += distance;
                } else {
                    // 이전 방향 누적 출력
                    if (accumulatedDistance > 0) {
                        if (direction) {
                            directionTexts.push(`${direction}으로 총 ${accumulatedDistance}미터 이동하세요.`);
                        } else {
                            directionTexts.push(`${accumulatedDistance}미터 직진하세요.`);
                        }
                        accumulatedDistance = 0;
                    }

                    // 새 방향 시작
                    direction = currentDirection;
                    accumulatedDistance = distance;
                }
            }

            // 마지막 구간 처리
            if (accumulatedDistance > 0) {
                if (direction) {
                    directionTexts.push(`${direction}으로 총 ${accumulatedDistance}미터 이동하세요.`);
                } else {
                    directionTexts.push(`${accumulatedDistance}미터 직진하세요.`);
                }
            }

            // 해당 층에서 도착
            //    directionTexts.push('도착지점');

            if (f < floorNames.length - 1) {
                directionTexts.push(`${floorNames[f + 1]}으로 이동합니다.`);
            }
        }

        return directionTexts;
    }





    ///////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////// tts 스크립트 작성 [E] //////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////


}

// 전역으로 사용 가능하게 노출
window.MapNavigator = MapNavigator;
