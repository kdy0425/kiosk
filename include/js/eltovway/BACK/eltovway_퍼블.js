const eltovway = {};
eltovway.Maps = class {

    constructor(param) {
        this.kioskCode = param.kioskCode;
        this.mapContainer = param.mapContainer;

        this.jsonContentsData = null; // 전역 변수로 사용할 속성 선언
        this.jsonRouteData = null;
        this.jsonLangData = null;
        this.header = null;
        this.gateList = new Array();
        this.mapList = new Array();
        this.pubContentsList = new Array();
        this.pubRouteList = new Array();
        this.storeContentsList = new Array();
        this.storeRouteList = new Array();
        this.parkRouteList = new Array();
        this.nodeRouteList = new Array();

        this.langCode = 'KOR';

        this.lineList = new Array();
        this.nearDistance = 5;
        this.nodeList = new Array();

        this.mapRate = null;

        this.m_point = null;
        this.startLine = null;
        this.m_line_target = null;

        this.wayfindList = new Array();
        this.findFloorList = new Array();
        this.totalLength = 0;

        this.wayNode1List = new Array();
        this.wayNode2List = new Array();

        this.m_value_max_dis = 1000000000;

        this.m_arr_nodes_visit = new Array();
        this.m_arr_nodes_dis = new Array();
        this.m_arr_nodes_via = new Array();
        this.m_arr_nodes_path = new Array();

        // 편의시설 tweenmax
        this.tweenmaxPub = null;

        // 위치안내 tweenmax
        this.tweenmaxLocation = null;

        // 사이니지 던킨도너츠 기준 1800px = 338m = 6분
        this.standardPx = 1800;
        this.standardM = 338;
        this.metersPerPixel = this.standardM / this.standardPx;
        this.walkingSpeedPerMinute = 60;  // 1분에 84m, 어린이 보폭으로 84m에서 70%로 축소, 58.8m 나오지만 반올림해서 59로 세팅

        this.wayfindParam = new Object();
        this.intervalId = null;
        this.kioskDirection = null;
        this.mapAngle = 0;
        this.isMove = false;
        this.wayfindType = "STORE"; // "STORE", "PARK"
        this.wayfindId = 0;
        this.notChangeText = ['B1', 'MF']; // 해당 floorCode는 floorCode로 나오게 설정.

        this.canvasLineYn = param.canvasLineYn || "Y";// Y이면 선, N이면 점
        this.canvasColor = param.canvasColor || "#FF0080";
        this.securityTime = param.securityTime || 5; // 보안구역 소요시간(분 단위)
        this.eleTime = param.eleTime || 0; // 엘리베이터 소요시간(분 단위)
        this.escTime = param.escTime || 0; // 보안구역 소요시간(분 단위)
        this.defaultMapRate = param.defaultMapRate || 0.8; // 기본 scale
        this.smallMapRate = param.smallMapRate || 0.8; // 전체 지도 표출 scale
        this.bigMapRate = param.bigMapRate || 0.8; // 도착지 확대 scale
    }

    async init() {
        await this.loadData(this.kioskCode);
        await this.loadMap();
        await this.parseNodeList();
        this.loadShape();
        this.loadPub();
        this.loadStore();
        this.loadCurrent();
        this.loadPubArea();
        // this.storeIconRemove();
    }

    async loadData(kioskCode) {
        // TODO 배포시 serverHost 변경
        const contentsResponse = await fetch(contentsURL);
        const conetnsXmlString = await contentsResponse.text();
        let contentsXmlNode = new DOMParser().parseFromString(conetnsXmlString, "text/xml");
        this.jsonContentsData = $.xml2json(contentsXmlNode); // 전역 변수로 설정

        const routeResponse = await fetch(routeUrl);
        const routeXmlString = await routeResponse.text();
        let routeXmlNode = new DOMParser().parseFromString(routeXmlString, "text/xml");
        this.jsonRouteData = $.xml2json(routeXmlNode);

        this.header = this.jsonContentsData.HEADER;

        const langCodeUrl = './include/kiosk_lang.json';
        const langCodeResponse = await fetch(langCodeUrl);
        this.jsonLangData = await langCodeResponse.json();


        /*this.header.MAP_RESOLUTION.width = "3920";
        this.header.MAP_RESOLUTION.height = "2205";*/

        // TODO CMS 맵 지도 크기
        // this.header.MAP_RESOLUTION.width = "4320";
        // this.header.MAP_RESOLUTION.height = "2800";

        /*this.header.MAP_RESOLUTION.width = "5000";
        this.header.MAP_RESOLUTION.height = "5000";*/

        // this.mapRate = this.getCalScale({w:this.mapContainer.clientWidth, h:this.mapContainer.clientHeight}, {w:this.header.MAP_RESOLUTION.width, h:this.header.MAP_RESOLUTION.height});
        // TODO initScale 현장에서 확인하여 조절 필요
        // this.mapRate = 0.8;

        this.kioskDirection = this.header.KIOSK_MAP;
        this.mapAngle = 0;
        if(this.kioskDirection == "E") {
            this.mapAngle = -90;
        } else if(this.kioskDirection == "W") {
            this.mapAngle = 90;
        } else if(this.kioskDirection == "N") {
            this.mapAngle = 0;
        } else if(this.kioskDirection == "S") {
            this.mapAngle = 180;
        }

        this.gateList = this.jsonContentsData.GATE_LIST.GATE_INFO.array;
        this.mapList = this.jsonContentsData.MAP_LIST.MAP_INFO;
        this.pubContentsList = this.jsonContentsData.PUB_INFO_LIST.PUB_INFO;

        // TODO 일반구역에 있는 키오스크는 일반구역에 있는 공용시설만 표시
        // 코드값 일반구역 A, 면세구역 T
        this.pubRouteList = this.jsonRouteData.PUB_LIST.PUB_INFO;
        if(this.header.KIOSK_SECT == "T") {
            this.pubRouteList = this.pubRouteList.filter(pub => pub.area_type == "T");
        }

        this.storeContentsList = this.jsonContentsData.STORE_LIST.STORE_INFO;
        this.storeRouteList = this.jsonRouteData.STORE_LIST.STORE_INFO;

        // TODO 일반구역에 있는 키오스크는 일반구역에 있는 매장만 표시
        // 코드값 일반구역 A, 면세구역 T
        if(this.header.KIOSK_SECT == "T") {
            this.storeRouteList = this.storeRouteList.filter(store => store.area_type == "T");
        }
        this.parkRouteList = this.jsonRouteData.PARK_LIST.PARK_INFO;

        this.nodeRouteList = this.jsonRouteData.NODE_LIST.NODE_INFO;
        this.shapeRouteList = this.jsonRouteData.SHAPE_LIST.SHAPE_INFO;
        this.movePubList = this.pubRouteList.filter(pub => ["P01", "P02"].includes(pub.PUB_CODE));
        this.securityPubList = this.pubRouteList.filter(pub => ["P999"].includes(pub.PUB_CODE));

        // TODO 맵 회전 소스 정리 필요
        let chg_ret_pos = {x:0,y:0};
        let chg_in_pos = {
            c_x:(this.header.MAP_RESOLUTION.width / 2),
            c_y:(this.header.MAP_RESOLUTION.height / 2),
            rad:(this.mapAngle) * Math.PI/180,
            p_x:0,
            p_y:0
        };

        chg_in_pos.p_x = Number(this.header.KIOSK_FLOOR.pos_x);
        chg_in_pos.p_y = Number(this.header.KIOSK_FLOOR.pos_y);

        chg_ret_pos = this.getChgAnglePos(chg_in_pos);
        this.header.KIOSK_FLOOR.pos_x = chg_ret_pos.x;
        this.header.KIOSK_FLOOR.pos_y = chg_ret_pos.y;

        this.pubRouteList.forEach(pub => {
            let chg_ret_pos = {x:0,y:0};
            let chg_in_pos = {
                c_x:(this.header.MAP_RESOLUTION.width / 2),
                c_y:(this.header.MAP_RESOLUTION.height / 2),
                rad:(this.mapAngle) * Math.PI/180,
                p_x:0,
                p_y:0
            };

            chg_in_pos.p_x = Number(pub.PUB_FLOOR.pos_x);
            chg_in_pos.p_y = Number(pub.PUB_FLOOR.pos_y);

            chg_ret_pos = this.getChgAnglePos(chg_in_pos);
            pub.PUB_FLOOR.pos_x = chg_ret_pos.x;
            pub.PUB_FLOOR.pos_y = chg_ret_pos.y;
        });

        this.storeRouteList.forEach(store => {
            let chg_ret_pos = {x:0,y:0};
            let chg_ret_pos_gate = {x:0, y:0};
            let chg_in_pos = {
                c_x:(this.header.MAP_RESOLUTION.width / 2),
                c_y:(this.header.MAP_RESOLUTION.height / 2),
                rad:(this.mapAngle) * Math.PI/180,
                p_x:0,
                p_y:0
            };

            let chg_in_pos_gate = {
                c_x:(this.header.MAP_RESOLUTION.width / 2),
                c_y:(this.header.MAP_RESOLUTION.height / 2),
                rad:(this.mapAngle) * Math.PI/180,
                p_x:0,
                p_y:0
            }

            chg_in_pos.p_x = Number(store.STORE_FLOOR.pos_x);
            chg_in_pos.p_y = Number(store.STORE_FLOOR.pos_y);

            chg_ret_pos = this.getChgAnglePos(chg_in_pos);

            chg_in_pos_gate.p_x = Number(store.GATE_POS_X);
            chg_in_pos_gate.p_y = Number(store.GATE_POS_Y);

            chg_ret_pos_gate = this.getChgAnglePos(chg_in_pos_gate);


            store.STORE_FLOOR.pos_x = chg_ret_pos.x;
            store.STORE_FLOOR.pos_y = chg_ret_pos.y;

            store.GATE_POS_X = chg_ret_pos_gate.x;
            store.GATE_POS_Y = chg_ret_pos_gate.y;
        });


        this.nodeRouteList.forEach(node => {
            let chg_ret_pos_node1 = {x:0, y:0};
            let chg_ret_pos_node2 = {x:0, y:0};
            let chg_in_pos_node1 = {
                c_x:(this.header.MAP_RESOLUTION.width / 2),
                c_y:(this.header.MAP_RESOLUTION.height / 2),
                rad:(this.mapAngle) * Math.PI/180,
                p_x:0,
                p_y:0
            };

            let chg_in_pos_node2 = {
                c_x:(this.header.MAP_RESOLUTION.width / 2),
                c_y:(this.header.MAP_RESOLUTION.height / 2),
                rad:(this.mapAngle) * Math.PI/180,
                p_x:0,
                p_y:0
            }

            chg_in_pos_node1.p_x = Number(node.x1);
            chg_in_pos_node1.p_y = Number(node.y1);

            chg_ret_pos_node1 = this.getChgAnglePos(chg_in_pos_node1);

            chg_in_pos_node2.p_x = Number(node.x2);
            chg_in_pos_node2.p_y = Number(node.y2);

            chg_ret_pos_node2 = this.getChgAnglePos(chg_in_pos_node2);


            node.x1 = chg_ret_pos_node1.x;
            node.y1 = chg_ret_pos_node1.y;

            node.x2 = chg_ret_pos_node2.x;
            node.y2 = chg_ret_pos_node2.y;
        });

        this.shapeRouteList.forEach(shape => {
            let chg_ret_pos = {x:0,y:0};
            let chg_in_pos = {
                c_x:(this.header.MAP_RESOLUTION.width / 2),
                c_y:(this.header.MAP_RESOLUTION.height / 2),
                rad:(this.mapAngle) * Math.PI/180,
                p_x:0,
                p_y:0
            };

            chg_in_pos.p_x = Number(shape.SHAPE_FLOOR.pos_x);
            chg_in_pos.p_y = Number(shape.SHAPE_FLOOR.pos_y);

            chg_ret_pos = this.getChgAnglePos(chg_in_pos);
            shape.SHAPE_FLOOR.pos_x = chg_ret_pos.x;
            shape.SHAPE_FLOOR.pos_y = chg_ret_pos.y;
        });

        this.parkRouteList.forEach(park => {
            let chg_ret_pos = {x:0,y:0};
            let chg_in_pos = {
                c_x:(this.header.MAP_RESOLUTION.width / 2),
                c_y:(this.header.MAP_RESOLUTION.height / 2),
                rad:(this.mapAngle) * Math.PI/180,
                p_x:0,
                p_y:0
            };

            chg_in_pos.p_x = Number(park.PARK_FLOOR.pos_x);
            chg_in_pos.p_y = Number(park.PARK_FLOOR.pos_y);

            chg_ret_pos = this.getChgAnglePos(chg_in_pos);
            park.PARK_FLOOR.pos_x = chg_ret_pos.x;
            park.PARK_FLOOR.pos_y = chg_ret_pos.y;
        });
        // TODO 맵 회전 소스 정리 필요
    }

    parseNodeList() {

        this.mapList.forEach((map) => {
            let floorCode = map.floor;
            let floorLineList = this.nodeRouteList.filter(node => node.floor == floorCode);
            let nodeNum = 0;

            let divMap = this.mapContainer.querySelector('div[data-floor-code=' + floorCode + ']');
            // divMap.style.transform = "scale(1.5)";
            let canvas = divMap.querySelector("canvas");
            let context2D = canvas.getContext("2d");


            for (let i = 0; i < floorLineList.length; i++) {
                let line = floorLineList[i];
                // area_type:"A"b_code:"B01"etime0:"2359"etime1:"2359"etime2:"2359"floor:"B1"stime0:"0000"stime1:"0000"stime2:"0000"weight:"1"x1:"2076"x2:"2131"y1:"1348"y2:"1349"

                // TODO 라인 debugger
                /*if(map.floor == "F3"){
                    debugger;
                    context2D.beginPath();
                    context2D.strokeStyle = "#FF0080";
                    context2D.lineWidth = 7;
                    context2D.lineCap = "round";
                    context2D.lineJoin = "round";

                    context2D.moveTo(line.x1, line.y1);
                    context2D.lineTo(line.x2, line.y2);
                    context2D.stroke();
                    context2D.restore();
                }*/
                line.lineNum = i;
                line.lineName = "LINE_" + floorCode + "_" + i, line.pos1 = {x: Number(line.x1), y: Number(line.y1), nearLineList: new Array()}
                line.pos2 = {x: Number(line.x2), y: Number(line.y2), nearLineList: new Array()}

                // 노드 리스트 중복체크하여 추가
                if (!this.getNodeExist(line.pos1, floorCode)) {
                    let node1 = {
                        nodeNum: nodeNum,
                        nodeName: "NODE1_" + floorCode + "_" + nodeNum,
                        floor: floorCode,
                        pos: {x: line.pos1.x, y: line.pos1.y},
                        lineName: line.lineName,
                        nearNodeList : new Array(),
                        nearNodeDistanceList : new Array()
                    }

                    nodeNum++;
                    this.nodeList.push(node1);
                }

                if (!this.getNodeExist(line.pos2, floorCode)) {
                    let node2 = {
                        nodeNum: nodeNum,
                        nodeName: "NODE2_" + floorCode + "_" + nodeNum,
                        floor: floorCode,
                        pos: {x: line.pos2.x, y: line.pos2.y},
                        lineName: line.lineName,
                        nearNodeList : new Array(),
                        nearNodeDistanceList : new Array()
                    }

                    nodeNum++;
                    this.nodeList.push(node2);
                }
            }

            // 노드 중복없이 노드 리스트 만들기
            let floorNodeList = this.nodeList.filter(node => node.floor == floorCode);
            for (let i = 0; i < floorLineList.length; i++) {
                let line = floorLineList[i];
                for (let j = 0; j < floorNodeList.length; j++) {
                    let node = floorNodeList[j];
                    if(this.getNearPos(line.pos1, node.pos)) {
                        line.node1 = node;
                        line.node1Name = node.nodeName;
                    }
                    if(this.getNearPos(line.pos2, node.pos)) {
                        line.node2 = node;
                        line.node2Name = node.nodeName;
                    }
                }
            }

            // 인접한 라인 찾기
            for (let i = 0; i < floorLineList.length; i++) {
                let line1 = floorLineList[i];
                for (let j = 0; j < floorLineList.length; j++) {
                    if (i == j) continue;
                    let line2 = floorLineList[j];

                    if (this.getNearPos(line1.pos1, line2.pos1)) {
                        line1.pos1.nearLineList.push(line2);
                    }
                    if (this.getNearPos(line1.pos1, line2.pos2)) {
                        line1.pos1.nearLineList.push(line2);
                    }
                    if (this.getNearPos(line1.pos2, line2.pos1)) {
                        line1.pos2.nearLineList.push(line2);
                    }
                    if (this.getNearPos(line1.pos2, line2.pos2)) {
                        line1.pos2.nearLineList.push(line2);
                    }
                }
            }

            // 인접한 노드 찾기

            for (let i = 0; i < floorNodeList.length; i++) {
                let node = floorNodeList[i];
                for (let j = 0; j < floorLineList.length; j++) {
                    let line = floorLineList[j];
                    if (line.node1Name == node.nodeName) {
                        node.nearNodeDistanceList.push(this.getPointLen2(line.pos2, node.pos, line.weight));
                        node.nearNodeList.push(line.node2);
                    }
                    if (line.node2Name == node.nodeName) {
                        node.nearNodeDistanceList.push(this.getPointLen2(line.pos1, node.pos, line.weight));
                        node.nearNodeList.push(line.node1);
                    }
                }
            }

        });
    }

    loadMap() {

        let floorInfoHtml = `
            <div class="floor_info_area">
                <div class="floor_title_area">
                    <h2 id="floorTitle" class="floor_title">GL</h2>
                </div>
    
                <div class="zone_area">
                    <div id="zone_duty">면세구역</div>
                    <div id="zone_general">일반구역</div>
                </div>
            </div>
        `;

        document.getElementById("mapArea").insertAdjacentHTML('afterbegin', floorInfoHtml);

        let footerHtml = `
            <div class="floor_lnb">
                <div class="depth1">
                    <nav id="divZone"> 
                        <button class="active">일반구역</button>
                        <button>면세구역</button>
                    </nav>
                    <nav id="divFloor"></nav>
                </div>
                    
                <div class="depth2">
                    <nav>
                        <ul>
                            <li><button>교통</button></li>
                            <li><button>음식</button></li>
                            <li class="active"><button>면세쇼핑</button></li>
                            <li><button>편의시설</button></li>
                            <li><button>공공시설</button></li>
                        </ul>
                    </nav>
                </div>

                <div class="depth3">
                    <nav>
                        <ul>
                            <li class="active"><button>신세계면세점</button></li>
                            <li><button>신라면세점</button></li>
                            <li><button>현대백화점면세점</button></li>
                            <li><button>시티면세점</button></li>
                            <li><button>경복궁면세점</button></li>
                            <li><button>판판면세점</button></li>
                            <li><button>면세품인도장</button></li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;

        document.getElementById("mapArea").insertAdjacentHTML('beforeend', footerHtml);

        // 디버깅
        let _mapList = this.mapList;

        let mapContainerWidth = this.mapContainer.clientWidth;
        let mapContainerHeight = this.mapContainer.clientHeight;

        // 지도의 실제 크기
        let mapWidth = parseInt(this.header.MAP_RESOLUTION.width);
        let mapHeight = parseInt(this.header.MAP_RESOLUTION.height);

        let clientRect = this.mapContainer.getBoundingClientRect();

        // 지도를 컨테이너 중앙에 배치하기 위한 오프셋 계산
        /* let offsetX = (mapContainerWidth - (mapActualWidth * scaleFactor)) / 2;
        let offsetY = (mapContainerHeight - (mapActualHeight * scaleFactor)) / 2;*/


        for(let i = 0; i < _mapList.length; i++) {
            let map = _mapList[i];
            const divTranslate = document.createElement("div");
            const divCenter = document.createElement("div");
            const div = document.createElement("div");
            const imgEl = document.createElement("img");
            const humanDiv = document.createElement("div");
            const humanImgEl = document.createElement("img");
            const canvasEl = document.createElement("canvas");


            divTranslate.className = "divTranslate";
            divTranslate.style.position = "absolute";
            divTranslate.style.width =  "3000px";
            divTranslate.style.height= "1640px";
            // divTranslate.style.width = clientRect.width + "px";
            // divTranslate.style.height= clientRect.height + "px";
            divTranslate.style.display = "none";
            divTranslate.dataset.floorCode = map.floor;

            divCenter.className = "divCenter";
            divCenter.style.position = "absolute";
            divCenter.style.left = "1500px";
            divCenter.style.top = "820px";
            divCenter.dataset.floorCode = map.floor;
            divCenter.style.transform = `scale(${this.mapRate})`;


            div.dataset.floorCode = map.floor;
            div.style.width =  mapWidth + "px";
            div.style.height = mapHeight + "px";
            div.style.transform = "translate(" + -mapWidth/2 + "px, " + -mapHeight/2 + "px)";
            div.className = "divMap";

            const scale = this.mapRate;
            const offsetX = (mapContainerWidth - mapWidth * scale) / 2;
            const offsetY = (mapContainerHeight - mapHeight * scale) / 2;

            // div.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
            // div.style.transform = `scale(${scale})`;

            imgEl.src = map.MAIN_MAP_URL;
            imgEl.style.position = "absolute";
            imgEl.style.width = mapWidth + "px";
            imgEl.style.height = mapHeight + "px";
            imgEl.style.transform = "rotate("+ this.mapAngle +"deg)";


            humanDiv.style.position = "absolute";
            humanDiv.style.transform = "translate(-50%, -50%)";
            humanDiv.className = "divHuman";
            humanDiv.style.zIndex = 25;
            humanDiv.style.display = "none"
            humanImgEl.src = "./images/ico_m_point_human.svg";
            humanImgEl.className = "imgHuman";
            humanImgEl.style.width = "140px";
            humanImgEl.style.height = "140px";


            canvasEl.id = "canvas" + map.floor;
            canvasEl.className = "lineCanvas"
            canvasEl.style.position = "absolute";
            canvasEl.setAttribute("width", mapWidth);
            canvasEl.setAttribute("height", mapHeight);
            canvasEl.style.width = mapWidth + "px";
            canvasEl.style.height = mapHeight + "px";
            canvasEl.transform = "retate(" + this.mapAngle + "deg)";

            const floorBtn = document.createElement("button")
            const floorBtnSpan = document.createElement("span");
            floorBtn.dataset.floorCode = map.floor;
            floorBtnSpan.innerText = map.floor;
            
            
            
            floorBtn.addEventListener("click", (event) => {
                const floorCode = event.currentTarget.dataset.floorCode;
                this.onClickFloorbtn(floorCode);
            })
            
            floorBtn.appendChild(floorBtnSpan);
            document.getElementById("divFloor").appendChild(floorBtn);

            divTranslate.appendChild(divCenter);
            divCenter.appendChild(div);

            div.appendChild(imgEl);
            div.appendChild(canvasEl);
            humanDiv.appendChild(humanImgEl);
            div.appendChild(humanDiv);

            this.mapContainer.appendChild(divTranslate);

            if(this.header.KIOSK_FLOOR.text == map.floor) {
                divTranslate.style.display = "block";
                document.getElementById("floorTitle").textContent = map.floor
                document.querySelector('button[data-floor-code=' +  this.header.KIOSK_FLOOR.text + ']').classList.add("active");
            }

            new PinchZoom(divTranslate);
        }
    }
    // 노드 중복 체크
    getNodeExist(pos, floorCode){
        let isExist = false;
        const nodeList = this.nodeList.filter(node => node.floor == floorCode);
        for(let i = 0; i < nodeList.length; i++) {
            if(this.getNearPos(nodeList[i].pos, pos) == true){
                isExist = true;
                break;
            }
        }
        return isExist;
    }


    // 근접 여부
    getNearPos(pos1, pos2){
        if((Math.abs(pos1.x - pos2.x) <= this.nearDistance && Math.abs(pos1.y - pos2.y) <= this.nearDistance )){
            return true;
        }else{
            return false;
        }
    }

    // 층 버튼 클릭
    onClickFloorbtn(floorCode) {
        document.getElementById("divLocation")?.remove();
        this.canvasInit();
        this.divHumanInit();
        this.stopTweenmax();
        this.stopFocusCenterMove();
        this.storeIconRemove();
        const floorBtn = document.getElementById("divFloor").querySelectorAll("button");
        // 각 버튼 요소에서 active 클래스 제거
        floorBtn.forEach(button => {
            button.classList.remove("active");
        });
        document.getElementById("divFloor").querySelector("button[data-floor-code=" + floorCode + "]").classList.add("active");

        let divMap = this.mapContainer.querySelector('div[data-floor-code=' +  floorCode + ']');
        /*if(divMap.style.display == "block") {
            return false;
        }*/

        document.getElementById("floorTitle").textContent = this.notChangeText.includes(floorCode) ? floorCode 
                                                            : floorCode === 'P4' ? '4F':  floorCode.split('')[1] + floorCode.split('')[0];

        // document.getElementById("floorTitle").textContent = floorCode;

        let allTranslateDivs = this.mapContainer.querySelectorAll('.divTranslate');
        let allCenterDivs = this.mapContainer.querySelectorAll(".divCenter");
        let allMapDivs = this.mapContainer.querySelectorAll(".divMap");

        allCenterDivs.forEach(div => {
            div.style.transform = " scale(" + this.mapRate + ") translate(0px, 0px)";
        });

        allMapDivs.forEach(div => {
            div.style.transform = "translate(" + -parseInt(this.header.MAP_RESOLUTION.width)/2 + "px, " + -parseInt(this.header.MAP_RESOLUTION.height)/2 + "px)";
        });

        allTranslateDivs.forEach(div => {
            if (div.dataset.floorCode === floorCode) {
                div.classList.remove('fade-out');
                div.classList.add('fade-in');
                div.style.display = "block"; // Ensure the element is shown before starting the animation
            } else {
                div.style.display = "none";
            }
        });
    }
    loadShape() {
        let angle = 0;
        let posX = 0, posY = 0, width = 0, height = 0;
        let mapWidth = parseInt(this.header.MAP_RESOLUTION.width);
        let mapHeight = parseInt(this.header.MAP_RESOLUTION.height);

        this.mapList.forEach((map) => {
            let shapeCanvas = document.createElement("canvas");

            shapeCanvas.id = "canvasShape" + map.floor;
            shapeCanvas.classList.add('canvasShape');
            shapeCanvas.style.position = "absolute";
            shapeCanvas.setAttribute("width", mapWidth);
            shapeCanvas.setAttribute("height", mapHeight);
            shapeCanvas.style.width = mapWidth + "px";
            shapeCanvas.style.height = mapHeight + "px";

            let divMap = this.mapContainer.querySelector('.divMap[data-floor-code=' +  map.floor + ']');
            divMap.appendChild(shapeCanvas);
        });

        for(let i = 0; i < this.shapeRouteList.length; i++) {
            let shape = this.shapeRouteList[i];
            let shapeCanvas = document.getElementById("canvasShape" + shape.SHAPE_FLOOR.text);
            let shapeContext = shapeCanvas.getContext("2d");

            if(shape.type == "RECT") {
                let shapeAngle = shape.SHAPE_FLOOR.angle;
                angle = Number(shapeAngle) * Math.PI/180;

                shapeContext.save();
                shapeContext.translate(Number(shape.SHAPE_FLOOR.pos_x), Number(shape.SHAPE_FLOOR.pos_y));
                shapeContext.rotate(angle);
                shapeContext.translate(Number(-shape.SHAPE_FLOOR.pos_x),Number(-shape.SHAPE_FLOOR.pos_y));
                shapeContext.fillStyle = shape.LINE_COLOR;

                posX = Number(shape.SHAPE_FLOOR.pos_x);
                posY = Number(shape.SHAPE_FLOOR.pos_y);
                width = Number(shape.SHAPE_FLOOR.width);
                height = Number(shape.SHAPE_FLOOR.height);

                if(shape.LINE_COLOR > 0) {
                    shapeContext.strokeStyle = shape.LINE_COLOR;
                    shapeContext.lineWidth = shape.LINE_THICK;
                }

                shapeContext.fillRect(
                    posX - width/2,
                    posY - height/2,
                    width,
                    height
                );
            } else if(shape.type == "TEXT") {
                let shapeAngle = shape.SHAPE_FLOOR.angle;
                angle = Number(shapeAngle) * Math.PI/180;

                shapeContext.save();
                shapeContext.translate(Number(shape.SHAPE_FLOOR.pos_x), Number(shape.SHAPE_FLOOR.pos_y));
                shapeContext.rotate(angle);
                shapeContext.translate(Number(-shape.SHAPE_FLOOR.pos_x),Number(-shape.SHAPE_FLOOR.pos_y));
                shapeContext.fillStyle = shape.LINE_COLOR;

                shapeContext.textAlign = shape.SHAPE_TEXT.align;
                shapeContext.textBaseline = "top";
                shapeContext.font = "bold " + shape.SHAPE_TEXT.font_size + "px NotoSansCJK";

                let textArr = shape.SHAPE_TEXT.text.split('\n');
                if(shape.SHAPE_TEXT.align == "left") {
                    posX = Number(shape.SHAPE_FLOOR.pos_x) - Number(shpae.SHAPE_FLOOR.width)/2;
                } else if(shape.SHAPE_TEXT.align == "right") {
                    posX = Number(shape.SHAPE_FLOOR.pos_x) + Number(shpae.SHAPE_FLOOR.width)/2;
                } else {
                    posX = Number(shape.SHAPE_FLOOR.pos_x);
                }

                for(let i = 0; i < textArr.length; i++) {
                    shapeContext.fillText(textArr[i],
                        posX,
                        Number(shape.SHAPE_FLOOR.pos_y) - Number(shape.SHAPE_FLOOR.height)/2 + ((Number(shape.SHAPE_TEXT.font_size) + Number(shape.LINE_THICK)) * i),
                        Number(shape.SHAPE_FLOOR.width),
                        Number(shape.SHAPE_FLOOR.height)
                    );
                }
            }
            shapeContext.restore();
        }
    }
    loadPub() {
        for(let i = 0; i < this.pubRouteList.length; i++) {
            let pub = this.pubRouteList[i];

            let posX = parseInt(pub.PUB_FLOOR.pos_x);
            let posY = parseInt(pub.PUB_FLOOR.pos_y);

            let pubEl = document.createElement("div");
            let pubImgEl = document.createElement("img");
            pubEl.dataset.pubCode = pub.PUB_CODE;
            pubEl.dataset.pubId = pub.PUB_ID;
            pubEl.dataset.floor = pub.floor;
            pubEl.dataset.area = pub.area;
            pubEl.className = "pub_info";
            pubEl.style.position = "absolute";
            pubEl.style.left = posX + "px";
            pubEl.style.top = posY + "px";
            pubEl.style.transform = "translate(-50%, -50%)";

            // pubImgEl.style.width = this.header.PUB_ICON_RESOLUTION.width + "px";
            // pubImgEl.style.height = this.header.PUB_ICON_RESOLUTION.height + "px";
            pubImgEl.src = `${this.pubContentsList.find(item => item.PUB_CODE == pub.PUB_CODE).PUB_URL}`;

            if(pub.PUB_CODE === 'P999') { // 보안 검색대 아이콘 안보이게 처리
                pubImgEl.style.display = 'none';
            }

            pubEl.appendChild(pubImgEl);
            this.mapContainer.querySelector('.divMap[data-floor-code=' +  pub.PUB_FLOOR.text + ']').appendChild(pubEl);
        }
    }


    // this.m_app_stores.push({"ID":obj.ID, CONTAINER:txt_name});

    loadStore() {
        document.querySelectorAll(".store_info").forEach(el => {
            el.remove();
        });
        let textCateList = ["110"];
        for(let i = 0; i < this.storeRouteList.length; i++) {
            let storeRouteObj = this.storeRouteList[i];
            let storeContentsObj = this.storeContentsList.find(item => item.id == storeRouteObj.id);

            if(storeContentsObj) {
                let posX = parseInt(storeRouteObj.STORE_FLOOR.pos_x);
                let posY = parseInt(storeRouteObj.STORE_FLOOR.pos_y);

                let storeEl = document.createElement("div");
                storeEl.className = "store_info";
                storeEl.style.position = "absolute";
                storeEl.style.left = posX + "px";
                storeEl.style.top = posY + "px";

                if(textCateList.includes(storeContentsObj.CATE_CODE.text)) { // 탑승구

                    let storeTextEl = document.createElement("div");
                    let storeName = storeContentsObj[`STORE_NAME_${this.langCode}`];
                    storeTextEl.textContent = storeName;
                    storeTextEl.classList.add('storeText');
                    storeTextEl.style.fontFamily = "NotoSansCJK";
                    storeTextEl.style.fontWeight = "700";
                    storeTextEl.style.fontSize = storeRouteObj.FONT_SIZE + "px";
                    storeTextEl.style.lineHeight = "9px";
                    storeTextEl.style.color = storeRouteObj.FONT_COLOR;
                    storeTextEl.style.whiteSpace = "nowrap";
                    storeTextEl.style.transform = "translate(-50%, -50%)";
                    storeEl.appendChild(storeTextEl);

                    // 매장 팝업
                    storeTextEl.addEventListener("click", () => {
                        // TODO onClickInfoStore, onClickInfoStoreByStoreId 인천공항 예외처리
                        //this.onClickInfoStore(storeRouteObj, storeContentsObj);
                        this.onClickInfoStoreById(storeRouteObj.id, false);
                    });
                } else {
                    // TODO 매장 로고 이미지 있을 시 좌표값 수정 (height/2 = 40px)
                    storeEl.style.transform = "translate(-50%, calc(-50% - 40px))";
                    let storeImg = document.createElement("img");
                    let storeCateCode = storeContentsObj.CATE_CODE.text
                    storeImg.src = storeContentsObj.STORE_LOGO_URL;
                    // storeImg.style.display = 'none';
                    storeImg.dataset.storeId = storeContentsObj.id;
                    storeImg.onerror = () => {
                        // TODO 이미지 없을 시 대체 이미지 경로 수정
                        storeImg.src = `./images/category/ico_category_${storeCateCode}.png`;
                    }
                    storeEl.appendChild(storeImg);

                    // 매장 팝업
                    storeImg.addEventListener("click", () => {
                        this.onClickInfoStoreById(storeRouteObj.id,false);
                    });
                }

                /*
                let storeTextEl = document.createElement("div");
                storeTextEl.textContent = storeContentsObj[`STORE_NAME_${this.langCode}`];
                storeTextEl.style.fontFamily = "NotoSansCJK";
                storeTextEl.style.fontWeight = "700";
                storeTextEl.style.fontSize = storeRouteObj.FONT_SIZE + "px";
                storeTextEl.style.lineHeight = "9px";
                storeTextEl.style.color = storeRouteObj.FONT_COLOR;
                storeTextEl.style.whiteSpace = "nowrap";
                storeEl.appendChild(storeTextEl);

                // 매장 팝업
                storeTextEl.addEventListener("click", () => {
                    this.onClickInfoStore(storeRouteObj, storeContentsObj);
                });*/

                this.mapContainer.querySelector('.divMap[data-floor-code=' +  storeRouteObj.STORE_FLOOR.text + ']').appendChild(storeEl);
            }
        }
    }

    loadCurrent() {
        // this.storeIconRemove();
        document.querySelector('.popup_security').style.display = "none";
        document.getElementById('moveLoadingPopup')?.remove();
        document.getElementById("divWaytypePopup")?.remove();
        document.getElementById("divStorePopup")?.remove();
        document.querySelector(".currentDiv")?.remove();

        this.isMove = false;
        this.stopFocusCenterMove();
        // 현위치 좌표
        let posX = parseInt(this.header.KIOSK_FLOOR.pos_x);
        let posY = parseInt(this.header.KIOSK_FLOOR.pos_y);
        let floorCode = this.header.KIOSK_FLOOR.text;
        this.onClickFloorbtn(floorCode);

        let textTop = this.langCode == "ENG" ? 10 : 70;

        document.querySelector(".currentImg")?.remove();
        let currentEl = document.createElement("div");
        let currentImgEl = document.createElement("img");
        let currentTextEl = document.createElement("div");

        currentEl.className = "currentDiv";
        currentEl.style.position = "absolute";
        currentEl.style.left = posX + "px";
        currentEl.style.top = (posY - 25) + "px"; // 아이콘 높이만큼
        currentEl.style.transform = "translate(-50%, -50%)";
        currentEl.style.textAlign = "center"


        currentTextEl.className = "lang_code_names currentText";
        currentTextEl.setAttribute("lang_code", "WAYFIND_DEPARTURE");
        currentTextEl.innerText = this.jsonLangData["index"]["WAYFIND_DEPARTURE"][this.langCode.toLowerCase()];
        currentTextEl.style.position = "relative";
        currentTextEl.style.top = textTop + "px";
        currentTextEl.style.fontSize = "25px";
        currentTextEl.style.display = "none";

        currentImgEl.className = "currentImg";
        currentImgEl.src = "./images/ico_m_point_human.svg";
        currentImgEl.style.width = "110px";
        currentImgEl.style.height = "144px";

        currentEl.appendChild(currentTextEl);
        currentEl.appendChild(currentImgEl);

        this.mapContainer.querySelector(".divMap[data-floor-code=" +  floorCode + "]").appendChild(currentEl);
        this.mapContainer.querySelector(".divCenter[data-floor-code=" +  floorCode + "]").style.transform = `scale(0.8)`;
        this.mapContainer.querySelector(".divMap[data-floor-code=" +  floorCode + "]").style.transform = "translate(" + -posX + "px, " + -posY +`px)`;
    }

    loadPubArea() {

        // TODO 찾을 공용시설 리스트
        let displayPubList = ["P11", "P12", "P13", "P10"];

        let pubList = this.pubContentsList.filter(pub => displayPubList.includes(pub.PUB_CODE));
        pubList.sort((a, b) => {
            return displayPubList.indexOf(a.PUB_CODE) - displayPubList.indexOf(b.PUB_CODE)
        });
        
        let pubAreaHtml = `
            <div class="floor_pub_area">
                <button class="store_popup" id="storeListBtn">
                    <img src="./images/menu.svg" alt="현재 위치">
                </button>

                <ul id="ulPub"></ul>

                <button id="currentBtn">
                    <img src="./images/current.svg" alt="현재 위치">
                </button>
            </div>
        `;

        document.getElementById("mapArea").insertAdjacentHTML('afterbegin', pubAreaHtml);
        pubList.forEach(pub => {
            let pubHtml = `
                <li>
                    <button data-pub-code="${pub.PUB_CODE}">                
                    <img src="${pub.PUB_URL}" alt="${pub.PUB_NAME}" >
                    </button>
                </li>
            `;
            document.getElementById("ulPub").insertAdjacentHTML('beforeend', pubHtml);
        });

        document.getElementById("currentBtn").addEventListener("click", () => {
            this.loadCurrent();
        });

        document.getElementById("ulPub").querySelectorAll("button").forEach(button => {
            button.addEventListener("click",  () => {
                // const activeButton = document.querySelector('#divFloor button.active');
                // const currentFloorCode = activeButton.dataset.floorCode;
                const kioskFloorCode = this.header.KIOSK_FLOOR.text;
                const pubCode = button.dataset.pubCode;
                this.onClickPubIcon(kioskFloorCode, pubCode);
            });
        });
    }

    // 공용시설 클릭 이벤트
    onClickPubIcon(floorCode, pubCode) {
        this.stopTweenmax();

        // TODO 편의시설 아이콘 크기
        const xx = -30;
        const yy = -30;

        // 현재 층 코드 가져오기
        let kioskFloorIdx = this.mapList.findIndex(map => map.floor == floorCode);
        let floorMapList = this.mapList;

        // TODO this.loadPub 함수에서 한번만 선언
        for(let i = 0; i < floorMapList.length; i++) {
            let floorMapObj =  floorMapList[i];
            let floorCode = floorMapList[i].floor;
            let floorPubCnt = this.pubRouteList.filter(pub => pub.PUB_FLOOR.text == floorCode && pub.PUB_CODE == pubCode).length;
            floorMapObj.pubCnt = floorPubCnt;
        }

        // 가까운 순으로 정렬
        let nearFloorMap = floorMapList
            .map((item, index) => ({ index, item }))
            .sort((a, b) => Math.abs(a.index - kioskFloorIdx) - Math.abs(b.index - kioskFloorIdx))
            .map(({ item }) => item)
            .find(item => item.pubCnt > 0);
        if(!nearFloorMap) {
            return;
        }

        this.onClickFloorbtn(nearFloorMap.floor);

        let divMapEl = this.mapContainer.querySelector('.divMap[data-floor-code=' +  nearFloorMap.floor + ']');
        this.mapContainer.querySelector('.divCenter[data-floor-code=' +  nearFloorMap.floor + ']').style.transform = `scale(${this.smallMapRate})`
        divMapEl.querySelectorAll('.pub_info[data-pub-code=' + pubCode  +']').forEach((el) => {
            el.style.zIndex = 20;
        });

        this.tweenmaxPub = TweenMax.fromTo(divMapEl.querySelectorAll('.pub_info[data-pub-code=' + pubCode  +']'), 0.5, { x: xx, y: yy, scale: 2 }, { x: xx, y: yy, scale: 1, yoyo: true, repeat: 8, onComplete: function () {
                divMapEl.querySelectorAll('.pub_info[data-pub-code=' + pubCode  +']').forEach((el) => {
                    el.style.removeProperty("z-index");
                });
            }});
    }

    stopTweenmax() {
        if(this.tweenmaxPub) {
            document.body.querySelectorAll('.pub_info').forEach((el) => {
                el.style.transform = "translate(-50%, -50%)";
            });
            this.tweenmaxPub.kill();
        } else if (this.tweenmaxLocation) {
            if(document.querySelector('#divLocation')) {
                document.querySelector('#divLocation').style.transform = "translate(-50%, -50%)";
            }
            this.tweenmaxLocation.kill();
        }
    }

    canvasInit() {
        const canvasEl = document.querySelectorAll(".lineCanvas").forEach((canvas) => {
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        });
        document.getElementById('wayEndInfoPopup')?.remove();
    }

    divHumanInit() {
        document.querySelectorAll('.divHuman').forEach(el => {
            el.style.display = "none";
        });
    }


    getCalScale(containerSize, mapSize){  // CANVAS크기, 맵크기
        var new_scale = {w:containerSize.w,h:containerSize.h};

        var i_canvas_rate = containerSize.h / containerSize.w;

        if(mapSize.w < containerSize.w && mapSize.w < containerSize.h){  // 맵크기가 작으면 스케일 1
            return 1;
        }else{  // 맵크기가 더 크면
            var i_map_rate = mapSize.h / mapSize.w;

            if(i_canvas_rate < i_map_rate){  // 가로가 더 긴것
                new_scale.h = containerSize.h;
                new_scale.w = containerSize.h * (mapSize.w / mapSize.h);
            }else{
                new_scale.w = containerSize.w;
                new_scale.h = containerSize.w * (mapSize.h / mapSize.w);
            }
            var i_scale = new_scale.w / mapSize.w;
            i_scale = Math.floor(i_scale * 1000) / 1000;
            return i_scale;
        }
    }

    onClickInfoStore(storeRouteObj, storeContents, isIframe) {
        this.wayfindType = "STORE";
        let storeSubCate = storeRouteObj.CATE_CODE.sub_cate;
        let storeName = `${storeContents[`STORE_NAME_${this.langCode}`]}`;
        if(storeSubCate == "11001" || storeSubCate == "11002") { // 탑승구: 11001, 체크인카운터: 11002
            let storeSubCateName = this.jsonLangData["store"][`STORE_SUBCATE_${storeSubCate}`][this.langCode.toLowerCase()];
            storeName = storeSubCateName + ` ${storeContents[`STORE_NAME_${this.langCode}`]}`;
        } else {
            storeName = `${storeContents[`STORE_NAME_${this.langCode}`]}`
        }
        // 매장 상세 비노출
        let displayNoneArr = ["110"];
        const foodNoneArr = ['102']; // 카테고리가 음식일 경우에만 영업시간, 주요메뉴 사용 - 나머지 카테고리는 운영시간, 주요품목
        const popupHtml = `
            <div id="divStorePopup" class="popup_store">
                <div class="popup_base">
                    <div class="popup_box">
                        <div id="btnClose" class="btn_close"><img src="./images/pop_bt_close.svg"></div>
                        <div class="store_info">
                            <div class="store_title">
                                <h3>${storeName}</h3>
                                <span>/${this.getCateName(storeContents.CATE_CODE, this.langCode)}</span>
                            </div>
                            <div class="store_desc">
                                <ul>
                                    <li>
                                        <dl>
                                            <dt class="lang_code_names popup_time" lang_code="POP_HOUR_TXT">${this.jsonLangData["index"]["POP_HOUR_TXT"][this.langCode.toLowerCase()]}</dt>
                                            <dd>${storeContents.STORE_SERVICETIME}</dd>
                                        </dl>
                                    </li>
                                    <li>
                                        <dl>
                                            <dt class="lang_code_names" lang_code="POP_TEL_TXT">${this.jsonLangData["index"]["POP_TEL_TXT"][this.langCode.toLowerCase()]}</dt>
                                            <dd>${storeContents.STORE_PHONE}</dd>
                                        </dl>
                                    </li>
                                    <li>
                                        <dl>
                                            <dt class="lang_code_names popup_items" lang_code="POP_ITEM_TXT">${this.jsonLangData["index"]["POP_ITEM_TXT"][this.langCode.toLowerCase()]}</dt>
                                            <dd>${storeContents[`STORE_ITEM_${this.langCode}`]}</dd>
                                        </dl>
                                    </li>
                                </ul>
                            </div>
    
                            <div class="store_location">
                                <h3 class="lang_code_names" lang_code="POP_LOCATION_TXT">${this.jsonLangData["index"]["POP_LOCATION_TXT"][this.langCode.toLowerCase()]}</h3>
                                <div id="id_pop_desc">${storeContents[`STORE_DESC_${this.langCode}`]}</div>
                            </div>
                        </div>
    
                        <div class="btn_box">
                            <button id="btnWayFind" class="btn_way">
                                <img src="./images/popup_ico_wayfinding.svg">
                                <span class="way_txt lang_code_names" lang_code="POP_WAYFIND_WAYFIND">${this.jsonLangData["index"]["POP_WAYFIND_WAYFIND"][this.langCode.toLowerCase()]}</span>
                            </button>
                            <button id="btnLocation" class="btn_wayfind">
                                <img src="./images/popup_ico_location.svg">
                                <span class="way_txt lang_code_names" lang_code="POP_WAYFIND_LOCATION">${this.jsonLangData["index"]["POP_WAYFIND_LOCATION"][this.langCode.toLowerCase()]}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="popupCover" class="popup_close_cover"></div>
        `;

        document.body.insertAdjacentHTML('afterbegin', popupHtml);

        if(!isIframe) {
            document.getElementById("btnLocation").style.display = "none";
        }

        if (displayNoneArr.includes(storeContents.CATE_CODE.text)) {
            document.querySelector(".store_desc").remove();
            document.querySelector(".store_location").remove();
        }

        if (foodNoneArr.includes(storeContents.CATE_CODE.text)) {
            document.querySelector(".popup_time").textContent = this.jsonLangData["index"]["POP_HOUR_TXT_FOOD"][this.langCode.toLowerCase()];
            document.querySelector(".popup_items").textContent = this.jsonLangData["index"]["POP_ITEM_TXT_FOOD"][this.langCode.toLowerCase()];
        }

        document.querySelectorAll("#popupCover, #btnClose").forEach(el => {
            el.addEventListener("click", () => {
                this.closeStorePopup();
            });
        });

        // 위치안내 버튼
        document.getElementById("btnLocation").addEventListener("click",  () => {
            this.closeStorePopup();
            // this.locationInfoById(storeRouteObj.id);

            if(document.querySelector(".currentImg")?.getAttribute("src") == "./images/departure.png") {
                document.querySelector(".currentImg").src = "./images/ico_m_point_human.svg";
                document.querySelector(".currentText").style.display = "none";
            }
            // TODO onClickInfoStore, onClickInfoStoreByStoreId, locationInfo, locationInfoById 인천공항 예외처리 종료
            this.locationInfoById(storeRouteObj.id, "STORE");
        });

        // TODO 보안구역에서 다른 구역갈 때길안내 버튼 숨김
        if(this.header.KIOSK_SECT === 'T' && storeRouteObj.area_type !== 'T') {
            document.getElementById("btnWayFind").remove();
        } else {
            // 길찾기 버튼
            document.getElementById("btnWayFind").addEventListener("click", () => {
                this.wayfindParam = new Object();
                document.querySelector(".currentImg").src = "./images/departure.png";
                document.querySelector(".currentText").style.display = "block";

                this.closeStorePopup();
                let currentFloorCode = document.getElementById("divFloor").querySelector("button.active").dataset.floorCode;

                // TODO 인천공항 예외처리
                // this.wayfind(storeRouteObj, storeContents);
                this.wayfindById(storeRouteObj.id, "STORE");
            });
        }
    }

    // 위치안내 버튼
    locationInfo(endObj) {

        // 길찾기 후 초기화
        this.canvasInit();
        this.stopTweenmax();
        document.getElementById("divLocation")?.remove();

        if(!this.isMove) {
            this.onClickFloorbtn(endObj.floor)
        }

        const floorCode = endObj.floor;
        let divMap = this.mapContainer.querySelector('.divMap[data-floor-code=' +  floorCode + ']');

        let posX = parseInt(endObj.x);
        let posY = parseInt(endObj.y);
        if(endObj.storeObj?.GATE_POS_X) {
            posX = parseInt(endObj.storeObj.GATE_POS_X);
            posY = parseInt(endObj.storeObj.GATE_POS_Y);
        }
        let textTop = this.langCode == "ENG" ? 10 : 70;

        let locationEl = document.createElement("div");
        let locationImgEl = document.createElement("img");
        let locationTextEl = document.createElement("div");
        locationEl.id = "divLocation";
        locationEl.style.position = "absolute";
        locationEl.style.left = posX + "px";
        locationEl.style.textAlign = "center";

        locationTextEl.className = "lang_code_names arrivalText";
        locationTextEl.setAttribute("lang_code", "WAYFIND_ARRIVAL");
        locationTextEl.innerText = this.jsonLangData["index"]["WAYFIND_ARRIVAL"][this.langCode.toLowerCase()];
        locationTextEl.style.position = "relative";
        locationTextEl.style.top = textTop + "px";
        locationTextEl.style.fontSize = "25px";

        this.mapContainer.querySelector(".divCenter[data-floor-code=" +  floorCode + "]").style.transform = `scale(${this.smallMapRate})`;
        // TODO 로고 이미지 위치 수정에 따른 수정
        // 현위치 그래도 아이콘을 위치 시키면 매장 텍스트를 가리기 때문에 -15 추가
        // locationEl.style.top = `${posY - 15}px`;
        locationEl.style.top = `${posY}px`;
        locationEl.style.transform = "translate(-50%, calc(-50% - 72px))";
        // TODO 로고 이미지 위치 수정에 따른 수정

        locationImgEl.src = "./images/arrival.png";
        locationImgEl.style.width = "110px";
        locationImgEl.style.height = "144px";

        if(!this.isMove) {
            locationImgEl.src = "./images/location_info.png";
            // TODO 위치안내 아이콘 크기
            const xx = -60;
            const yy = -120;
            this.tweenmaxLocation = TweenMax.fromTo(locationEl, 0.5, { x: xx, y: yy, scale: 2 }, { x: xx, y: yy, scale: 1, yoyo: true, repeat: 8})
        } else {
            locationEl.appendChild(locationTextEl);
        }

        // locationEl.appendChild(locationTextEl);
        locationEl.appendChild(locationImgEl);
        divMap.appendChild(locationEl);

    }

    closeStorePopup() {
        document.getElementById("divStorePopup")?.remove();
    }

    async wayfind(id, type) {

        this.totalLength = 0;

        let moveTypePopup = () => {
            const popupHtml = `
                <div id="divWaytypePopup" class="popup_way">
                    <div class="popup_base">
                        <div id="btnClose" class="btn_close"><img src="./images/pop_bt_close.svg"></div>
                        <div class="pop_waytype_box">
                            <h2>이동수단 선택</h2>
                            <p class="title lang_code_names" lang_code="POP_WAYTYPE_TITLE">${this.jsonLangData["index"]["POP_WAYTYPE_TITLE"][this.langCode.toLowerCase()]}</p>
                            <div class="btn_box">
                                <button id="btnEscalator" class="btn_esc" data-waytype-code="ESC">
                                    <img src="./images/popup_ico_escalator.svg">
                                    <div class="lang_code_names" lang_code="POP_WAYTYPE_ESC">${this.jsonLangData["index"]["POP_WAYTYPE_ESC"][this.langCode.toLowerCase()]}</div>
                                </button>
                                <button id="btnElevator" class="btn_ele" data-waytype-code="ELE">
                                    <img src="./images/popup_ico_elevator.svg">
                                    <div class="lang_code_names" lang_code="POP_WAYTYPE_ELE">${this.jsonLangData["index"]["POP_WAYTYPE_ELE"][this.langCode.toLowerCase()]}</div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="wayTypePopupCover" class="popup_close_cover"></div>
                </div>
            `;

            document.body.insertAdjacentHTML('afterbegin', popupHtml);

            document.getElementById("btnClose").addEventListener("click", () =>{
                this.closeWayTypePopup();
            });

            document.querySelectorAll("#btnEscalator, #btnElevator").forEach(el => {
                el.addEventListener("click", (event) => {
                    this.closeWayTypePopup();
                    this.onClickwayType(event, endObj);
                });
            });
        }

        this.isMove = true;

        let endObj = new Object();
        if(type == "STORE") {
            let storeObj = this.storeRouteList.find(store => store.id == id);
            endObj = {
                id : id,
                floor : storeObj.STORE_FLOOR.text,
                x: storeObj.GATE_POS_X,
                y: storeObj.GATE_POS_Y,
                storeObj: storeObj
            }
        } else if(type == "PARK") {
            let parkObj = this.parkRouteList.find(park => park.id == id);
            endObj = {
                id : id,
                code : parkObj.PARK_CODE,
                floor : parkObj.PARK_FLOOR.text,
                x: parkObj.PARK_FLOOR.pos_x,
                y: parkObj.PARK_FLOOR.pos_y,
            }
        }

        // TODO 키오스크 위치가 면세구역인데 일반구역 상점 길찾기 시 메세지 노출
        if(type == "STORE" && this.header.KIOSK_SECT == "T" && endObj.storeObj?.area_type == "A") {
            let noticeHtml = `
                <div id="divStorePopup" class="popup_store">
                    <div class="popup_base">
                        <div class="popup_box">
                            <div id="btnClose" class="btn_close"><img src="./images/pop_bt_close.svg"></div>
                            <div class="store_info">
                                <div class="store_title">
                                    <h3>${this.jsonLangData["index"]["NO_ROUTE_AVAILABLE"][this.langCode.toLowerCase()]}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="popupCover" class="popup_close_cover"></div>
                </div>
            `;

            document.getElementById("mapArea").insertAdjacentHTML('afterbegin', noticeHtml);
            document.querySelector(".store_title").style.border = "none";
            document.querySelectorAll("#popupCover, #btnClose").forEach(el => {
                el.addEventListener("click", () => {
                    this.closeStorePopup();
                });
            });
            return;
        }

        const startFloorCode = this.header.KIOSK_FLOOR.text;
        const endFloorCode = endObj.floor;

        if(startFloorCode == endFloorCode) {
            this.wayfindParam = {
                id: id,
                // moveType: wayTypeCode,
                startFloor: startFloorCode,
                startPos: {x: Number(this.header.KIOSK_FLOOR.pos_x), y: Number(this.header.KIOSK_FLOOR.pos_y)},
                endFloor: endFloorCode,
                endPos: {x: Number(endObj.x), y: Number(endObj.y)},
                endObj: endObj,
                originStartFloor: startFloorCode,
                originEndFloor: endFloorCode
            }

            // TODO 키오스크가 일반구역에 있고, 목적지가 면세구역에 있으면 보안검색대 통과
            if(this.header.KIOSK_SECT == "A" && endObj.storeObj && endObj.storeObj?.area_type == "T" && endFloorCode != "F3") {
                 moveTypePopup();
            } else {
                this.canvasInit();
                this.wayFindPath(this.wayfindParam);
                this.getWayFindTotalLength();
                this.setDraw2DWayLine(this.wayfindParam);
            }
        } else {
            moveTypePopup();
        }

    }

    closeWayTypePopup() {
        document.getElementById("divWaytypePopup").remove();
    }

    onClickwayType(event, endObj) {
        this.isMove = true;
        const wayTypeCode = event.currentTarget.dataset.waytypeCode;
        const startFloorCode = this.header.KIOSK_FLOOR.text;
        const endFloorCode = endObj.floor;

        this.wayfindParam = {
            moveType: wayTypeCode,
            startFloor: startFloorCode,
            startPos: {x: Number(this.header.KIOSK_FLOOR.pos_x), y: Number(this.header.KIOSK_FLOOR.pos_y)},
            endFloor: endFloorCode,
            endPos: {x: Number(endObj.x), y: Number(endObj.y)},
            endObj: endObj,
            originStartFloor : startFloorCode,
            originEndFloor : endFloorCode,
            floorList : new Array()
        }

        if (startFloorCode == endFloorCode) {  // 같은 층일 경우
            // TODO 키오스크가 일반구역에 있고, 목적지가 면세구역에 있으면 보안검색대 통과
            if(this.header.KIOSK_SECT == "A" && endObj.storeObj?.area_type == "T" && endFloorCode != "F3") {
                this.wayfindParam.isVisitSecurity = "N";
                this.startWayfinding();
                return;
            } else {
                this.wayFindPath(this.wayfindParam);
                this.getWayFindTotalLength();
                this.setDraw2DWayLine(this.wayfindParam);
            }
        } else {  // 다른 층일 경우
            this.startWayfinding();
        }
    }

    // 애니메이션 끝난 후 콜백
    animationCallack() {
        let infoTitle, infoType;
        let infoTypeHtml = '';

        // 목적지가 같으면 중지
        if(this.wayfindParam.endObj.x == this.wayfindParam.endPos.x && this.wayfindParam.endObj.y == this.wayfindParam.endPos.y) {
            let currentFloorCode = document.getElementById("divFloor").querySelector("button.active").dataset.floorCode;

            if(this.wayfindType === "PARK"){
                const parkAllCode = this.wayfindParam.endObj.code.split('');
                const parkAreaCode = this.wayfindParam.endObj.code.slice(0,3);
                const parkZone = parkAllCode[0] === 1 ? `${this.jsonLangData["index"]["POP_ZONE_WEST"][this.langCode.toLowerCase()]}`
                                                : `${this.jsonLangData["index"]["POP_ZONE_EAST"][this.langCode.toLowerCase()]}`;
                infoTitle =`[${parkZone}]${parkAreaCode}`
            } else {
                const storeSubCate = this.wayfindParam.endObj.storeObj.CATE_CODE.sub_cate;
                if(storeSubCate == "11001" || storeSubCate == "11002") { // 탑승구: 11001, 체크인카운터: 11002
                    let storeSubCateName = this.jsonLangData["store"][`STORE_SUBCATE_${storeSubCate}`][this.langCode.toLowerCase()];
                    infoTitle = `${storeSubCateName} ${this.wayfindParam.endObj.storeObj[`STORE_NAME_${this.langCode}`]}` ;
                    infoType = 'other';
                    infoTypeHtml = `
                    <h3 class="info_title">
                        <img src="./images/flag.png" alt="깃발 이미지">
                        ${infoTitle}
                    </h3>`;
                } else {
                    infoTitle = this.wayfindParam.endObj.storeObj[`STORE_NAME_${this.langCode}`] ;
                    infoType = 'store';
                    infoTypeHtml = `
                    <div class="info_store_logo">
                        <img src="./images/test_logo.svg" alt="IMG">
                    </div>
                    <h3 class="info_title">
                        <img src="./images/pubIcon/p_ico_shopping.png" alt="카테고리 아이콘">
                        ${infoTitle}
                    </h3>
                    `;
                }
            }

            let wayfindResultInfoHtml = `
                <div id="wayEndInfoPopup">
                    <div class="info_box ${infoType}">
                        ${infoTypeHtml}
                        <div class="info_desc">
                            <dl>
                                <dt>${this.jsonLangData["index"]["POP_TIME"][this.langCode.toLowerCase()]}</dt>
                                <dd id="idTime">3분</dd>
                            </dl>
                            <dl>
                                <dt>${this.jsonLangData["index"]["POP_DISTANCE"][this.langCode.toLowerCase()]}</dt>
                                <dd id="idMeter">500 미터</dd>
                            </dl>
                            <!--<dl>
                                <dt>구역</dt>
                                <dd id="idEndName">동편 238</dd>
                            </dl>-->
                        </div>
                        <div class="btn_box">
                            <button class="replay">
                                <img src="./images/replay_w.svg" alt="다시보기 아이콘">
                                <span>다시보기</span>
                            </button>
                            <button class="close">
                                <img src="./images/close_w.svg" alt="닫기 아이콘">
                                <span>닫기</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById("mapArea").insertAdjacentHTML('afterbegin', wayfindResultInfoHtml);
            document.getElementById("wayEndInfoPopup").style.left = "calc(50% - " + document.getElementById("wayEndInfoPopup").clientWidth/2 + "px)";

            let length = Math.round(this.totalLength * this.metersPerPixel);
            let resultLength = `${length}M`;
            if(length >= 1000) {
                resultLength = `${(length / 1000).toFixed(1)}KM`;
            }

            let timeInMinutes = Math.ceil(length / this.walkingSpeedPerMinute);

            //TODO 보안검색대, 엘리베이터, 에스컬레이터 소요시간
            if (this.wayfindParam.isEle) timeInMinutes += this.eleTime;
            if (this.wayfindParam.isEsc) timeInMinutes += this.escTime;
            if (this.wayfindParam.isSecurity) timeInMinutes += this.securityTime;

            let resultTime;
            // 시간과 분으로 변환

            let hours = Math.floor(timeInMinutes / 60);
            let minutes = timeInMinutes % 60;

            // 최소 1분으로 처리
            if (hours === 0 && minutes === 0) {
                minutes = 1;
            }


            if(hours > 0) {
                resultTime = `${hours}${this.jsonLangData["index"]["POP_TIME_HOUR"][this.langCode.toLowerCase()]} ${minutes}${this.jsonLangData["index"]["POP_TIME_MINUTE"][this.langCode.toLowerCase()]}`;
            } else {
                resultTime = `${minutes}${this.jsonLangData["index"]["POP_TIME_MINUTE"][this.langCode.toLowerCase()]}`;
            }
            document.getElementById("idTime").innerText = resultTime;
            document.getElementById("idMeter").innerText = resultLength;
            document.querySelectorAll('.divHuman').forEach(div => {
                div.style.display = "none";
            });
            // document.getElementById("idEndName").innerText = this.wayfindParam.storeRouteObj.STORE_NAME_KOR;

            document.querySelectorAll("#popupCover, #btnClose").forEach(el => {
                el.addEventListener("click", () => {
                    document.getElementById("wayEndInfoPopup")?.remove();
                    // console.log(window.parent.body.document, 'iframe call')
                    this.loadCurrent();
                    // this.onClickFloorbtn(this.header.KIOSK_FLOOR.text);
                });
            });

            this.isMove = false;

        } else {
            this.startWayfinding();
        }
    }

    async startWayfinding() {
        // debugger;
        if(this.isMove) {
            let currentFloorCode = document.getElementById("divFloor").querySelector("button.active").dataset.floorCode;

            if(!this.wayfindParam.startFloorPub && this.wayfindParam.originEndFloor != this.wayfindParam.originStartFloor) {
                this.onClickFloorbtn(this.wayfindParam.startFloor);
            }

            if(this.wayfindParam.isVisitSecurity == "N" && !this.wayfindParam.startFloorPub) {
                this.findMovePubInfo();
                this.wayFindPath(this.wayfindParam);
                this.setDraw2DWayLine();
                this.getWayFindTotalLength();
                return;
            } else if(this.wayfindParam.isVisitSecurity == "N" && this.wayfindParam.startFloorPub){
                this.wayfindParam.originEndFloor = this.wayfindParam.endObj.floor;
                this.wayfindParam.startFloor = this.wayfindParam.endFloorPub.PUB_FLOOR.text;
                this.wayfindParam.startPos = {x: this.wayfindParam.endFloorPub.PUB_FLOOR.pos_x, y: this.wayfindParam.endFloorPub.PUB_FLOOR.pos_y}
                this.wayfindParam.endFloor = this.wayfindParam.endObj.floor;
                this.wayfindParam.endPos = {x: this.wayfindParam.endObj.x, y: this.wayfindParam.endObj.y};
                this.onClickFloorbtn(this.wayfindParam.startFloor);
                this.findMovePubInfo();
                this.wayFindPath(this.wayfindParam);
                this.setDraw2DWayLine();
                this.getWayFindTotalLength();
                return;
            }

            if(!this.wayfindParam.startFloorPub) {
                this.findMovePubInfo();
                this.wayFindPath(this.wayfindParam);
                this.setDraw2DWayLine();
                this.getWayFindTotalLength();
                return;
            } else {
                if(this.wayfindParam.visitPubList?.length) {
                    this.wayfindParam.visitPubList = new Array();
                    this.wayfindParam.startFloor = this.wayfindParam.endFloorPub.PUB_FLOOR.text;
                    this.wayfindParam.startPos = {x: this.wayfindParam.endFloorPub.PUB_FLOOR.pos_x, y: this.wayfindParam.endFloorPub.PUB_FLOOR.pos_y}
                    this.wayfindParam.endFloor = this.wayfindParam.originEndFloor;
                    this.wayfindParam.endPos = {x: this.wayfindParam.endObj.x, y: this.wayfindParam.endObj.y};
                    this.onClickFloorbtn(this.wayfindParam.startFloor);
                    this.findMovePubInfo()
                    this.wayFindPath(this.wayfindParam);
                    this.setDraw2DWayLine();
                    this.getWayFindTotalLength();
                    return;
                } else {
                    if(this.wayfindParam.endPos.x == this.wayfindParam.startFloorPub?.PUB_FLOOR.pos_x && this.wayfindParam.endPos.y == this.wayfindParam.startFloorPub?.PUB_FLOOR.pos_y) {
                        if(!this.wayfindParam.endFloorPub) {
                            console.error("도착층 이동수단 없음");
                            return;
                        }
                        this.wayfindParam.startFloor = this.wayfindParam.endFloorPub.PUB_FLOOR.text;
                        this.wayfindParam.startPos = {x: this.wayfindParam.endFloorPub.PUB_FLOOR.pos_x, y: this.wayfindParam.endFloorPub.PUB_FLOOR.pos_y}
                        this.wayfindParam.endFloor = this.wayfindParam.endObj.floor;
                        this.wayfindParam.endPos = {x: this.wayfindParam.endObj.x, y: this.wayfindParam.endObj.y}
                        this.onClickFloorbtn(this.wayfindParam.startFloor);
                        this.wayFindPath(this.wayfindParam);
                        this.setDraw2DWayLine();
                        this.getWayFindTotalLength();
                    }
                }
            }
        }
    }

    findMovePubInfo() {
        // debugger;
        let distance = 0;
        let minDistance = -1;
        const movePubCode = this.wayfindParam.moveType == "ELE" ? "P01" : "P02";


        let _wayfindIdWE = "W"
        let _movePubCodeList = this.movePubList.filter(pub => pub.PUB_CODE == movePubCode && pub.PUB_FLOOR.text == this.wayfindParam.startFloor && (pub.floor.includes(this.wayfindParam.startFloor) && pub.floor.includes(this.wayfindParam.endFloor)));

        if(this.wayfindType == "PARK") {
            let _wayfindIdWE = this.wayfindId.toString().substring(0, 1) == 1 ? "W" : "E";
            _movePubCodeList = _movePubCodeList.filter(pub => pub.area.split("_")[1] == "P" + _wayfindIdWE);
        }

        // TODO 키오스크가 일반구역에 있고, 목적지가 면세구역에 있으면 보안검색대 통과
        if(this.wayfindParam.isVisitSecurity == "N" && !this.wayfindParam.startFloorPub) {
            _movePubCodeList = this.movePubList.filter(pub => pub.PUB_CODE == movePubCode && pub.PUB_FLOOR.text == this.wayfindParam.startFloor && (pub.floor.includes(this.wayfindParam.startFloor) && pub.floor.includes(this.wayfindParam.endFloor)));
            this.wayfindParam.originEndFloor = "F3";
            this.wayfindParam.endFloor = "F3";
            this.wayfindParam.endPos = { x: this.securityPubList[0].PUB_FLOOR.pos_x, y: this.securityPubList[0].PUB_FLOOR.pos_y}
        } else if (this.wayfindParam.isVisitSecurity && this.wayfindParam.startFloorPub) {
            _movePubCodeList = this.movePubList.filter(pub => pub.PUB_CODE == movePubCode && pub.PUB_FLOOR.text == this.wayfindParam.startFloor && pub.area_type == "T" && (pub.floor.includes(this.wayfindParam.startFloor) && pub.floor.includes(this.wayfindParam.endFloor)));
        }

        // 가까운 이동 수단 찾기
        if(_movePubCodeList.length > 0) {

            let startClosetPub = _movePubCodeList[0];
            let endFloorPub = new Object();

            //TODO 해당 매장과 가까운 이동수단 선택
            if(this.wayfindParam.endFloor == "F4") {
                let startFloor = this.wayfindParam.startFloor;
                let startPos = this.wayfindParam.startPos;
                let _movePubCodeList = this.movePubList.filter(pub => pub.PUB_CODE == movePubCode && pub.PUB_FLOOR.text == this.wayfindParam.endFloor && (pub.floor.includes(this.wayfindParam.startFloor) && pub.floor.includes(this.wayfindParam.endFloor)));
                let endFloorPub =_movePubCodeList[0];
                _movePubCodeList.forEach(pub => {
                    this.wayfindParam.startFloor = this.wayfindParam.endFloor;
                    this.wayfindParam.startPos = {x: this.wayfindParam.endObj.x, y:this.wayfindParam.endObj.y};
                    this.wayfindParam.endFloor = pub.PUB_FLOOR.text;
                    this.wayfindParam.endPos = { x: Number(pub.PUB_FLOOR.pos_x), y: Number(pub.PUB_FLOOR.pos_y)};
                    this.wayFindPath(this.wayfindParam);
                    let totalLength = this.getWayFindLength();
                    distance = totalLength;
                    if(minDistance == -1 || distance < minDistance) {
                        endFloorPub = pub;
                        minDistance = distance;
                    }
                });

                startClosetPub = this.movePubList.find(pub => pub.PUB_FLOOR.text == startFloor && pub.area == endFloorPub.area && pub.area)
                this.wayfindParam.startFloor = startFloor;
                this.wayfindParam.startPos = startPos;
                this.wayfindParam.startFloorPub = startClosetPub;
                this.wayfindParam.endFloorPub = endFloorPub;
                this.wayfindParam.endFloor = startClosetPub.PUB_FLOOR.text;
                this.wayfindParam.endPos = { x: Number(startClosetPub.PUB_FLOOR.pos_x), y: Number(startClosetPub.PUB_FLOOR.pos_y)}
                return;
            }


            _movePubCodeList.forEach(pub => {
                this.wayfindParam.endFloor = pub.PUB_FLOOR.text;
                this.wayfindParam.endPos = { x: Number(pub.PUB_FLOOR.pos_x), y: Number(pub.PUB_FLOOR.pos_y)}
                this.wayFindPath(this.wayfindParam);
                let totalLength = this.getWayFindLength();
                distance = totalLength;
                if(minDistance == -1 || distance < minDistance) {
                    startClosetPub = pub;
                    minDistance = distance;
                }
            });

            endFloorPub = this.movePubList.find(pub => pub.PUB_FLOOR.text == this.wayfindParam.originEndFloor && pub.area == startClosetPub.area && pub.area);

            this.wayfindParam.startFloorPub = startClosetPub;
            this.wayfindParam.endFloorPub = endFloorPub;
            this.wayfindParam.endFloor = startClosetPub.PUB_FLOOR.text;
            this.wayfindParam.endPos = { x: Number(startClosetPub.PUB_FLOOR.pos_x), y: Number(startClosetPub.PUB_FLOOR.pos_y)}
        } else {
            const pubs = this.movePubList.filter(pub => pub.PUB_CODE == movePubCode && pub.area_type == this.header.KIOSK_SECT);

            // 층 별로 PUB을 그룹화
            const groupByFloor = (data) => {
                return data.reduce((acc, curr) => {
                    if (!acc[curr.PUB_FLOOR]) acc[curr.PUB_FLOOR] = [];
                    acc[curr.PUB_FLOOR].push(curr);
                    return acc;
                }, {});
            };

            console.log(groupByFloor);

            // 특정 층에서 다른 층으로 이동 가능한 PUB 찾기
            const findConnectingPubs = (currentFloor, nextFloor, pubsByFloor) => {
                if (!pubsByFloor[currentFloor]) return [];
                return pubsByFloor[currentFloor].filter(pub => pub.floor.split(',').includes(nextFloor));
            };

            // 최단 경로 찾기
            const findShortestPath = (startFloor, endFloor, pubs) => {
                const pubsByFloor = groupByFloor(pubs);
                const queue = [[startFloor, []]]; // 현재 층과 경로를 담는 큐
                const visited = new Set(); // 방문한 층을 기록하는 집합

                while (queue.length > 0) {
                    const [currentFloor, path] = queue.shift();

                    if (currentFloor === endFloor) return path; // 목표 층에 도달하면 경로 반환

                    if (visited.has(currentFloor)) continue;
                    visited.add(currentFloor);

                    for (const nextFloor in pubsByFloor) {
                        if (nextFloor !== currentFloor) {
                            const connectingPubs = findConnectingPubs(currentFloor, nextFloor, pubsByFloor);
                            for (const pub of connectingPubs) {
                                if (!visited.has(nextFloor)) {
                                    queue.push([nextFloor, [...path, pub]]);
                                }
                            }
                        }
                    }
                }
                return null; // 경로를 찾지 못한 경우
            };

            // 1층에서 5층까지의 최단 경로 찾기
            const startFloor = this.wayfindParam.startFloor;
            const endFloor = this.wayfindParam.originEndFloor;
            const shortestPath = findShortestPath(startFloor, endFloor, pubs);

            console.log(shortestPath);
            if (shortestPath) {
                this.wayfindParam.visitPubList = shortestPath;
                this.wayfindParam.startFloorPub = this.wayfindParam.visitPubList[0];
                this.wayfindParam.endFloorPub = this.movePubList.find(pub => pub.PUB_FLOOR.text == this.wayfindParam.visitPubList[1].PUB_FLOOR.text && pub.area == this.wayfindParam.visitPubList[0].area && pub.area);
                this.wayfindParam.endFloor = this.wayfindParam.visitPubList[0].PUB_FLOOR.text;
                this.wayfindParam.endPos = { x: Number(this.wayfindParam.visitPubList[0].PUB_FLOOR.pos_x), y: Number(this.wayfindParam.visitPubList[0].PUB_FLOOR.pos_y)}
            } else {
                console.error('이동 수단 없음');
                return;
            }
        }
    }

    getWayFindTotalLength() {
        if(this.wayfindList.length > 1) {
            for(let i = 0; i < this.wayfindList.length - 1; i++) {
                this.totalLength += this.getPointLen2(this.wayfindList[i], this.wayfindList[i + 1])
            }
        }
    }

    getWayFindLength() {
        let totalLength = 0;
        if(this.wayfindList.length > 1) {
            for(let i = 0; i < this.wayfindList.length - 1; i++) {
                totalLength += this.getPointLen2(this.wayfindList[i], this.wayfindList[i + 1])
            }
        }
        return totalLength;
    }


    findTargetName() {
        let weight = 0;
        this.lineList.find(line => {
            if (line.name === this.m_line_target.name) {
                weight = this.m_line_target.pweight !== 0 ? this.m_line_target.pweight : 1;
            }
        });
        return weight;
    }

    wayFindPath(param) {
        
        document.querySelectorAll('.divTranslate').forEach(el => {
            if(el.getAttribute('data-floor-code') === param.startFloor){
                let mapDiv = new PinchZoom(el);
                mapDiv.getIconScale(el.querySelector('.divCenter'), true);
            }
        })
        
        // 매장위치 표시
        this.locationInfoById(this.wayfindParam.endObj.id, this.wayfindType);

        document.querySelector(".currentImg").src = "./images/departure.png"
        document.querySelector(".currentText").style.display = "block";
        let floorCode = param.startFloor;
        let crossCnt = 0;
        let distance = 0;
        let minStartDistance = -1;
        let minEndDistance = -1;
        let startMin = -1;
        let endMin = -1;
        let startNode = -1;
        let endNode = -1;

        let weight = 1;

        let myStartPoint = {x:0, y:0};  // 키오스크 좌표
        let myEndPoint = {x:0, y:0};   // 매장 좌표

        let tmpPoint = {x:0, y:0}

        myStartPoint.x = Number(param.startPos.x);
        myStartPoint.y = Number(param.startPos.y);
        myEndPoint.x = Number(param.endPos.x);
        myEndPoint.y = Number(param.endPos.y);


        let startPoint = {x:0 , y:0}   // 키오스크 위치와 교차하면서 직각인 좌표
        let endPoint = {x:0 , y:0}     // 매장 위치와 교차하면서 직각인 좌표

        this.startLine = null;
        this.endLine = null;
        this.wayfindList = new Array();

        let floorLineList = this.nodeRouteList.filter(line => line.floor == param.startFloor);

        for(let i = 0; i < floorLineList.length; i++) {
            let line = floorLineList[i];
            let weight = line.weight;

            // 시작점
            // 교차점이 직각이 있을 경우, 시작점과 라인중 제일 가까운 거리의 점 찾기
            if(this.getPointAngle(myStartPoint, line.pos1, line.pos2)) {
                tmpPoint = this.m_point;
                // 교차점과의 거리 비교 후 시작점
                distance = this.getPointLen2(myStartPoint, tmpPoint, weight);
                if(minStartDistance == -1 || distance < minStartDistance) {
                    minStartDistance = distance;
                    startNode = -1;
                    this.startLine = line;
                    startPoint = tmpPoint;
                }
            }

            // 시작점 교차점은 없지만 더 짧은길이 있는지 확인
            distance = this.getPointLen2(myStartPoint, line.pos1, weight);
            if(minStartDistance == -1 || distance < minStartDistance){
                minStartDistance = distance;
                this.startLine = line;
                startNode = line.node1; // 가장 근접한곳이 인의 끝
                startPoint.x = line.pos1.x;
                startPoint.y = line.pos1.y;
            }

            distance = this.getPointLen2(myStartPoint, line.pos2, weight);
            if(minStartDistance == -1 || distance < minStartDistance){
                minStartDistance = distance;
                this.startLine = line;
                startNode = line.node2; // 가장 근접한곳이 인의 끝
                startPoint.x = line.pos2.x;
                startPoint.y = line.pos2.y;
            }

            // 목표점
            // 교차점이 직각이 있을 경우, 목표점 라인중 제일 가까운 거리의 점 찾기
            if(this.getPointAngle(myEndPoint, line.pos1, line.pos2)) {
                tmpPoint = this.m_point;
                distance = this.getPointLen2(myEndPoint, tmpPoint, weight);
                if(minEndDistance == -1 || distance < minEndDistance) {
                    minEndDistance = distance;
                    endNode = -1;
                    this.endLine = line;
                    endPoint = tmpPoint;
                }
            }

            // 목표점 교차점은 없지만 더 짧은길이 있는지 확인
            distance = this.getPointLen2(myEndPoint, line.pos1, weight);
            if(minEndDistance == -1 || distance < minEndDistance){
                minEndDistance = distance;
                this.endLine = line;
                endNode = line.node1; // 가장 근접한곳이 인의 끝
                endPoint.x = line.pos1.x;
                endPoint.y = line.pos1.y;
            }

            distance = this.getPointLen2(myEndPoint, line.pos2, weight);
            if(minEndDistance == -1 || distance < minEndDistance){
                minEndDistance = distance;
                this.endLine = line;
                endNode = line.node2; // 가장 근접한곳이 인의 끝
                endPoint.x = line.pos2.x;
                endPoint.y = line.pos2.y;
            }

            if(crossCnt == 0){
                if(this.getPointCross(myStartPoint, myEndPoint,line.pos1, line.pos2)){
                    crossCnt++;
                }
            }
        }

        // 두 점 사이에 길이 없고 두 점의 차이가 매우 작을 경우에는 바로 경로를 이어 버리고 끝낸다.
        if(crossCnt == 0) {
            distance = this.getPointLen2(myStartPoint, myEndPoint, weight);
            if(distance <= 20) {
                this.wayfindList.push(startPoint);
                this.wayfindList.push(endPoint);
                console.log("WAYFIND SUCC-01");
                return;
            }
        }

        if(minEndDistance == -1) {
            console.log("FAIL-02");
            return;
        }

        this.wayfindList.push(myStartPoint);
        this.wayfindList.push(startPoint);

        // 같은 동선에 있는가?
        if(this.startLine.lineName == this.endLine.lineName) {
            this.wayfindList.push(endPoint);
            this.wayfindList.push(myEndPoint);
            console.log("WAYFIND SUCC-02");
            return;
        }


        // 인접한 선분이 있는가?  이것이 어떤 의미인지 좀더 확인이 필요하다.
        crossCnt = 0;
        for(let i = 0; i <this.startLine.pos1.nearLineList.length; i++) {
            let line = this.startLine.pos1.nearLineList[i];
            if(line.lineName == this.endLine.lineName) {
                if(!this.getNearPos(this.startLine.pos1, endPoint)) {
                    this.wayfindList.push(this.startLine.pos1);
                }
                crossCnt++;
                break;
            }
        }

        if(crossCnt == 0) {
            for(let i = 0; i < this.startLine.pos2.nearLineList.length; i++) {
                let line = this.startLine.pos2.nearLineList[i];
                if(line.lineName == this.endLine.lineName) {
                    if(!this.getNearPos(this.startLine.pos2, endPoint)) {
                        this.wayfindList.push(this.startLine.pos2);
                    }
                    crossCnt++;
                    break;
                }
            }
        }

        if(crossCnt > 0) {
            this.wayfindList.push(endPoint);
            this.wayfindList.push(myEndPoint);
            console.log("WAYFIND SUCC-03");
            return;
        }

        let tmpLen1 = 0, tmpLen2 = 0;

        if(startNode == -1) {
            this.wayNode1List = new Array();
            this.wayNode2List = new Array();

            // 첫번째 노드
            tmpLen1 = this.getFindPathIng("NODE1", this.startLine.node1.nodeNum, endNode, floorCode);
            // 두번째 노드
            tmpLen2 = this.getFindPathIng("NODE2", this.startLine.node2.nodeNum, endNode, floorCode);

            if(tmpLen1 < tmpLen2) {
                for(let i = 0; i < this.wayNode1List.length; i++) {
                    this.wayfindList.push(this.wayNode1List[i]);
                }
            } else {
                for(let i = 0 ; i< this.wayNode2List.length; i++) {
                    this.wayfindList.push(this.wayNode2List[i]);
                }
            }
        } else {
            this.getFindPathIng("NONE", startNode.nodeNum, -1, floorCode);
        }

        this.wayfindList.push(endPoint);
        this.wayfindList.push(myEndPoint);

        console.log("SUCCESS");
    }



    async setDraw2DWayLine() {
        /* this.canvasInit();
         this.divHumanInit();*/

        let intervalSpeed = 15;
        let moveSpeed = 10;
        let maxSpeed = 2;
        let nearLen = 4;

        let wayfindList = this.wayfindList;


        let currentCnt = 1;
        let currentPoint = {x:this.wayfindList[0].x, y:this.wayfindList[0].y}
        let targetPoint = {x:this.wayfindList[1].x, y:this.wayfindList[1].y}
        let perX = targetPoint.x - currentPoint.x;
        let perY = targetPoint.y - currentPoint.y;

        let divMap = this.mapContainer.querySelector('.divMap[data-floor-code=' + this.wayfindParam.endFloor + ']');
        let divCenter = this.mapContainer.querySelector('.divCenter[data-floor-code=' + this.wayfindParam.endFloor + ']');
        let divHuman = divMap.querySelector(".divHuman");

        divCenter.style.transform = "translate(0px, 0px)";
        // divCenter.style.transform = `translate((${currentPoint.x}/2))px, (${currentPoint.y}/2)px)`;

        divHuman.style.display ="block";
        divHuman.style.left = Number(currentPoint.x) + "px";
        divHuman.style.top = Number(currentPoint.y) + "px";

        let canvas = divMap.querySelector("canvas");
        let context2D = canvas.getContext("2d");

        context2D.beginPath();
        context2D.strokeStyle = this.canvasColor;
        context2D.lineWidth = 7;
        context2D.lineCap = "round";
        context2D.lineJoin = "round";

        if(this.canvasLineYn == "N") {
            context2D.setLineDash([1, 20]); // 10 픽셀 길이의 대시와 5 픽셀 간격
        }

        for(let i = 0; i < this.wayfindList.length; i++) {
            if(i == 0) {
                context2D.moveTo(this.wayfindList[i].x, this.wayfindList[i].y);
            } else {
                context2D.lineTo(this.wayfindList[i].x, this.wayfindList[i].y);
            }
            context2D.stroke();
        }

        let divTranslate = this.mapContainer.querySelectorAll('.divTranslate');
        divTranslate.forEach(div => {
            div.style.pointerEvents = "none";
        });


        try {
            if(this.isMove) {
                this.intervalId = setInterval(() => {
                    if(Math.abs(perX) > Math.abs(perY)) {
                        if(Math.abs(currentPoint.x - targetPoint.x) < maxSpeed) {
                            moveSpeed = 0;
                        } else {
                            moveSpeed = maxSpeed;
                        }

                        if(moveSpeed > 0) {
                            if(perX > 0) {
                                currentPoint.x = currentPoint.x + moveSpeed;
                                currentPoint.y = currentPoint.y + (perY / perX) * moveSpeed;
                            } else {
                                currentPoint.x = currentPoint.x - moveSpeed;
                                currentPoint.y = currentPoint.y - (perY / perX) * moveSpeed;
                            }
                        } else {
                            currentPoint.x = targetPoint.x;
                            currentPoint.x = targetPoint.y;
                        }
                    } else {
                        if(Math.abs(currentPoint.y - targetPoint.y) < maxSpeed) {
                            moveSpeed = 0;
                        } else {
                            moveSpeed = maxSpeed;
                        }

                        if(moveSpeed > 0) {
                            if(perY > 0) {
                                currentPoint.y = currentPoint.y + moveSpeed;
                                currentPoint.x = currentPoint.x + (perX / perY) * moveSpeed;
                            } else {
                                currentPoint.y = currentPoint.y - moveSpeed;
                                currentPoint.x = currentPoint.x - (perX / perY) * moveSpeed;
                            }
                        } else {
                            currentPoint.x = targetPoint.x;
                            currentPoint.y = targetPoint.y;
                        }
                    }

                    divHuman.style.left = Number(currentPoint.x) + "px";
                    divHuman.style.top = Number(currentPoint.y) + "px";
                    this.onFocusCenterMove(currentPoint);

                    // 보안검색대 통과 팝업
                    let _securityPub = this.pubRouteList.filter(pub => pub.PUB_CODE == 'P999');
                    _securityPub.forEach(pub => {
                        if(this.getPointLen2({x:currentPoint.x, y:currentPoint.y},{x:pub.PUB_FLOOR.pos_x , y:pub.PUB_FLOOR.pos_y}, 1) <= this.nearDistance){
                            document.querySelector('.popup_security').style.display = "block";
                            this.wayfindParam.isSecurity = true;
                            this.wayfindParam.isVisitSecurity = "Y";

                            setTimeout(function () {
                                document.querySelector('.popup_security').style.display = "none"
                            }, 1500);
                        }
                    });

                    if(Math.abs(currentPoint.x - targetPoint.x) <= nearLen && Math.abs(currentPoint.y - targetPoint.y) <= nearLen){
                        let x1 = currentPoint.x;
                        let y1 = currentPoint.y;
                        currentCnt++;
                        if(currentCnt >= wayfindList.length){
                            clearInterval(this.intervalId);
                            console.log("애니메이션 끝");

                            divTranslate.forEach(div => {
                                div.style.pointerEvents = "";
                            });

                            if(this.wayfindParam.startFloorPub?.PUB_FLOOR.pos_x == this.wayfindParam.endPos.x && this.wayfindParam.startFloorPub?.PUB_FLOOR.pos_y == this.wayfindParam.endPos.y) {
                                this.wayfindParam.moveType == "ELE" ? this.wayfindParam.isEle = true : this.wayfindParam.isEsc = true;
                                const startFloor = this.wayfindParam.startFloorPub.PUB_FLOOR.text === 'P4' ? '4F' : this.wayfindParam.startFloorPub.PUB_FLOOR.text;
                                const endFloor = this.wayfindParam.endFloorPub.PUB_FLOOR.text === 'P4' ? '4F' : this.wayfindParam.endFloorPub.PUB_FLOOR.text;
                                this.isSecurity = false;
                                this.isEle = false;
                                this.isEsc = false;
                                let floorInfoHtml = `
                                    <div id="moveLoadingPopup" class="popup_move">
                                        <div class="popup_base">
                                            <div class="move_info">
                                                <div class="move_animation">
                                                    <div class="move_animation_box">
                                                        <img id="imgMoveType" alt="">
                                                    </div>
                                                </div>
                                                <div class="move_desc">
                                                    <div class="move_current">
                                                        <div>
                                                            <span>${startFloor}</span>
                                                            <span>${this.wayfindParam.moveType == "ELE" ? "E/V" : "E/S"}</span>
                                                        </div>
                                                    </div>
                                                    <div class="move_arrow">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </div>
                                                    <div class="move_target">
                                                        <div>
                                                            <span>${endFloor}</span>
                                                             <span>${this.wayfindParam.moveType == "ELE" ? "E/V" : "E/S"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div id="popupCover" class="popup_close_cover"></div>
                                    </div>`;

                                document.getElementById("mapArea").insertAdjacentHTML('afterbegin', floorInfoHtml);

                                let startFloorIdx = this.mapList.findIndex(map => map.floor == this.wayfindParam.originStartFloor);
                                let endFloorIdx = this.mapList.findIndex(map => map.floor == this.wayfindParam.originEndFloor);
                                let strUpDown = startFloorIdx < endFloorIdx ? "up" : "down";

                                let imgMoveTypeStr = this.wayfindParam.moveType == "ESC" ? "./images/escalator_" + strUpDown + ".gif" : "./images/elevator_" + strUpDown + ".gif";
                                document.getElementById("imgMoveType").src= imgMoveTypeStr;
                                setTimeout(() => {
                                    document.getElementById('moveLoadingPopup')?.remove();
                                    this.animationCallack();
                                }, 3000);
                            } else {
                                this.animationCallack();
                                this.mapContainer.querySelector(".divCenter[data-floor-code=" +  this.wayfindParam.endObj.floor + "]").style.scale = this.bigMapRate;
                            }
                        }else{
                            targetPoint.x = wayfindList[currentCnt].x;
                            targetPoint.y = wayfindList[currentCnt].y;

                            perX = targetPoint.x - x1;
                            perY = targetPoint.y - y1;
                        }
                    }
                }, intervalSpeed);
            }
        } catch(e) {
            console.log("애니메이션 error", e);
        }
    }

    onFocusCenterMove(pos) {
        // 줌 배율: 0.5 -> 2배, 기본 0.25
        // 움직여야 할 지도 오브젝트

        let divMap = this.mapContainer.querySelector('.divMap[data-floor-code=' + this.wayfindParam.startFloor+ ']');
        let divCenter = this.mapContainer.querySelector('.divCenter[data-floor-code=' + this.wayfindParam.startFloor+ ']');
        const style = window.getComputedStyle(divCenter);
        const transform = style.transform;
        let scale = 1;

        // transform 속성 값이 존재하는지 확인
        if (transform && transform !== 'none') {
            // 매트릭스 값에서 scale 값을 추출
            const matrixValues = transform.match(/matrix\((.+)\)/)[1].split(', ');
            scale = parseFloat(matrixValues[0]); // X축 scale 값
        } else {
            console.log('No transform scale applied.');
        }
        if(divMap?.style) {
            // 사람 포인터의 pos값 -> 양수로 들어오기 때문에 네거티브로변경
            const strPos = "translate(" + -pos.x + "px," + -pos.y + "px) scale(" + scale + ")";
            divMap.style.transform = strPos;
            divMap.style.transition = "transform 0.15s linear";
        }
    }

    getFindPathIng(p_type,p_start,p_end, floorCode){
        var i = 0,j = 0,k = 0;
        var i_path_cnt = 0;
        var i_ret_len = -1, i_ret_len2 = -1, i_ret_len3 = -1;
        var i_node_cnt = 0;
        var i_min = 0,i_dis = 0, i_sel = 0;

        let floorNodeList = this.nodeList.filter(node => node.floor == floorCode);

        for(i = 0; i < floorNodeList.length; i++){  // 변수 클리어
            this.m_arr_nodes_visit[i] = 0;
            this.m_arr_nodes_via[i] = 0;
            this.m_arr_nodes_path[i] = 0;
            this.m_arr_nodes_dis[i] = this.m_value_max_dis;
        }

        this.m_arr_nodes_dis[p_start] = 0;

        //console.log("p_startp_start = " + p_arr_nodes_dis[this.m_line_target.node1];_start);

        for(i = 0; i < floorNodeList.length; i++){  // 짧은 동선을 찾자
            i_min = this.m_value_max_dis;
            for(j = 0; j < floorNodeList.length; j++){
                if(this.m_arr_nodes_visit[j] == 0 && this.m_arr_nodes_dis[j] < i_min){
                    i_sel = j;
                    i_min = this.m_arr_nodes_dis[j];
                }
            }
            this.m_arr_nodes_visit[i_sel] = 1;
            if(i_min == this.m_value_max_dis){  // 더 작은것을 못찾았다.
                i_ret_len = -1;
                //console.log("CAN'T");
                break;
            }

            for(j = 0; j < floorNodeList.length; j++){
                let nodeNum = floorNodeList[j].nodeNum;
                i_dis = this.m_value_max_dis;
                for(k = 0; k < floorNodeList[i_sel].nearNodeList.length; k++){
                    if(floorNodeList[i_sel].nearNodeList[k].nodeNum == nodeNum){
                        i_dis = floorNodeList[i_sel].nearNodeDistanceList[k];
                        break;
                    }
                }
                if(this.m_arr_nodes_dis[j] > this.m_arr_nodes_dis[i_sel] + i_dis){
                    this.m_arr_nodes_dis[j] = this.m_arr_nodes_dis[i_sel] + i_dis;
                    this.m_arr_nodes_via[j] = i_sel;
                }
            }
        }

        if(p_end == -1){
            i_ret_len2 = this.m_arr_nodes_dis[this.endLine.node1.nodeNum];
            i_ret_len3 = this.m_arr_nodes_dis[this.endLine.node2.nodeNum];
            if(i_ret_len2 < i_ret_len3){
                i_ret_len = i_ret_len2;
                i_sel = this.endLine.node1.nodeNum;
            }else{
                i_ret_len = i_ret_len3;
                i_sel = this.endLine.node2.nodeNum;
            }
        }else{
            i_sel = p_end;
            i_ret_len = this.m_arr_nodes_dis[p_end];
        }

        if(p_type != ""){
            for(i = 0; i < floorNodeList.length; i++){
                this.m_arr_nodes_path[i_path_cnt++] = i_sel;
                if(i_sel == p_start){
                    break;
                }
                i_sel = this.m_arr_nodes_via[i_sel];
            }

            //trace("getFindPathIng 2-5 = " + path_cnt + "," + m_node_cnt);

            if(i_path_cnt > floorNodeList.length) i_path_cnt = floorNodeList.length;

            // 마지막 동선까지 한다.
            for(i = i_path_cnt-1; i >= 0; i--){
                j = this.m_arr_nodes_path[i];
                if(j < floorNodeList.length && j >= 0){
                    if(p_type == "NONE"){
                        this.wayfindList.push(floorNodeList[j].pos);
                    }else if(p_type == "NODE1"){
                        this.wayNode1List.push(floorNodeList[j].pos);
                    }else if(p_type == "NODE2"){
                        this.wayNode2List.push(floorNodeList[j].pos);

                    }
                }
            }
        }
        return i_ret_len;
    }


    // 이동가능수단 개수 찾기
    getFindMovePubCnt(startFloorCode, endFloorCode){
        var i = 0, j = 0, k = 0;
        var i_start = 0, i_target = 0;
        var strMoveUpdown = "";
        var obj;
        var arr_ele_pub = [];
        var arr_esc_pub = [];

        var pubCntObj = {"eleCnt":0,"escCnt":0};

        for(let i = 0; i < this.pubRouteList.length; i++){  // 목적지 층으로 갈수 있는 이동수단을 찾자.
            let pubObj = this.pubRouteList[i];
            if(pubObj.PUB_FLOOR.text == startFloorCode && pubObj.floor.includes(endFloorCode)){
                if(pubObj.PUB_CODE == "P01"){ arr_ele_pub.push(pubObj); }
                if(pubObj.PUB_CODE == "P02"){ arr_esc_pub.push(pubObj); }
            }
        }

        pubCntObj = {
            eleCnt : arr_ele_pub.length,
            escCnt : arr_esc_pub.length
        }
        return pubCntObj;
    }

    getPointAngle(p_my,p_pos1,p_pos2){

        let divMap = this.mapContainer.querySelector('.divMap[data-floor-code=' + this.wayfindParam.startFloor + ']');
        let canvas = divMap.querySelector("canvas");
        let context2D = canvas.getContext("2d");

        var m = 0,n = 0,c = 0;
        var t_x = 0,t_y = 0;

        var p_angle = {x:0,y:0};

        if(p_pos1.y == p_pos2.y){
            p_angle.x = p_my.x; p_angle.y = p_pos1.y;
        }else if(p_pos1.x == p_pos2.x){
            p_angle.x = p_pos1.x; p_angle.y = p_my.y;
        }else{
            m = (p_pos1.y - p_pos2.y) / (p_pos2.x - p_pos1.x);
            n = -1/m;
            c = (p_pos1.y - p_my.y) - (n * (p_my.x - p_pos1.x));

            t_x = c / (m - n);
            t_y = 0 - ( n * t_x + c);

            p_angle.x = p_pos1.x + t_x;
            p_angle.y = p_pos1.y + t_y;
        }

        this.m_point = {
            x: p_angle.x,
            y: p_angle.y,
        };

        if(this.getPointCross(p_my,p_angle,p_pos1,p_pos2)) {
            // debugger;
            /* context2D.beginPath();
             context2D.arc(p_my.x, p_my.y, 10, 0, 2*Math.PI);
             context2D.fillStyle = "red";
             context2D.fill();

             context2D.beginPath();
             context2D.arc(p_pos1.x, p_pos1.y, 10, 0, 2*Math.PI);
             context2D.fillStyle = "purple";
             context2D.fill();

             context2D.beginPath();
             context2D.arc(p_pos2.x, p_pos2.y, 10, 0, 2*Math.PI);
             context2D.fillStyle = "purple";
             context2D.fill();

             context2D.lineWidth = 10;
             context2D.strokeStyle = "green";
             context2D.moveTo(p_pos1.x, p_pos1.y);
             context2D.lineTo(p_pos2.x, p_pos2.y);
             context2D.stroke();

             context2D.lineWidth = 1;
             context2D.strokeStyle = "yellow";
             context2D.moveTo(p_my.x, p_my.y);
             context2D.lineTo(p_angle.x, p_angle.y);
             context2D.stroke();*/

            /*context2D.beginPath();
            context2D.arc(this.m_point.x, this.m_point.y, 10, 0, 2*Math.PI);
            context2D.fillStyle = "blue";
            context2D.fill();*/
        }

        return this.getPointCross(p_my,p_angle,p_pos1,p_pos2)
    }

    getPointCross(p_my,p_angle,p_pos1,p_pos2){
        var m = 0,n = 0,c = 0;
        var t_x = 0,t_y = 0;
        var floor_point = 10000000;

        var under = (p_pos2.y - p_pos1.y)*(p_angle.x - p_my.x) - (p_pos2.x - p_pos1.x)*(p_angle.y - p_my.y);
        if(under == 0){ // 두 직선은 평행
            return false;
        }

        var _t = (p_pos2.x - p_pos1.x)*(p_my.y - p_pos1.y) - (p_pos2.y - p_pos1.y)*(p_my.x - p_pos1.x);
        var _s = (p_angle.x - p_my.x)*(p_my.y - p_pos1.y) - (p_angle.y - p_my.y)*(p_my.x - p_pos1.x);

        var t = _t / under;
        var s = _s / under;

        t = Math.floor(t * floor_point)/floor_point;
        s = Math.floor(s * floor_point)/floor_point;

        if( t < 0 || t > 1 || s < 0 || s > 1 ){
            return false;
        }
        if( _t == 0 && _s == 0 ){
            return false;
        }
        return true;
    }

    getPointLen2(p_p1,p_p2, weight){

        let i_len = 0;
        weight = !weight ? 1 : weight;

        i_len = Math.sqrt( (p_p1.x - p_p2.x) * (p_p1.x - p_p2.x) + (p_p1.y - p_p2.y) * (p_p1.y - p_p2.y) );
        // console.log('i_len : ' , i_len)
        // console.log('i_len * parseInt(weight) : ', i_len * parseInt(weight))

        return i_len * parseInt(weight);
    }

    stopFocusCenterMove() {
        clearInterval(this.intervalId);
        let divTranslate = this.mapContainer.querySelectorAll('.divTranslate');
        divTranslate.forEach(div => {
            div.style.pointerEvents = "";
        });
    }

    getChgAnglePos(p_pos) {
        var ret_pos = {x:0,y:0};

        var x1 = p_pos.p_x - p_pos.c_x;
        var y1 = p_pos.p_y - p_pos.c_y;

        var i_len = Math.sqrt( (p_pos.c_x - p_pos.p_x) * (p_pos.c_x - p_pos.p_x) + (p_pos.c_y - p_pos.p_y) * (p_pos.c_y - p_pos.p_y) );

        var i_rad = Math.atan2(y1,x1);

        ret_pos.x = Math.cos(i_rad + p_pos.rad) * i_len + p_pos.c_x;
        ret_pos.y = Math.sin(i_rad + p_pos.rad) * i_len + p_pos.c_y;

        return ret_pos;
    }


    //TODO 다국어 인천공항 langCode 예외
    setMainLang(p_lang) {
        if (this.langCode == p_lang) { return; }

        switch(p_lang){
            case 'ko_KR':
                this.langCode = 'KOR'
                break;
            case 'en_US':
                this.langCode = 'ENG'
                break;
            case 'zh_CN':
                this.langCode = 'CHN'
                break;
            case 'ja_JP':
                this.langCode = 'JPN'
                break;
        }


        let str_attr = "";
        let str_lang = this.langCode;

        // TODO 인천공항 도착, 출발 다국어 예외처리
        let textTop = this.langCode == "ENG" ? 10 : 70;

        if(document.querySelector(".arrivalText")) {
            document.querySelector(".arrivalText").style.top = `${textTop}px`;
        }
        document.querySelector(".currentText").style.top = `${textTop}px`;

        document.querySelectorAll(".lang_code_names").forEach(el => {
            str_attr = el.getAttribute("lang_code");
            try {
                el.innerText = this.jsonLangData["index"][str_attr][str_lang.toLowerCase()];
            } catch (err) {
                console.error("ERROR LANG FLOOR1 : " + str_attr);
            }
        });

        document.querySelectorAll(".lang_code_names_fac").forEach(el => {
            str_attr = el.getAttribute("lang_code");
            try {
                el.innerText = this.jsonLangData["facility"][str_attr][str_lang.toLowerCase()];
            } catch (err) {
                console.error("ERROR LANG FLOOR2 : " + str_attr);
            }
        });
        this.loadStore();
        document.getElementById('zone_duty').innerHTML = this.jsonLangData["index"]["POP_ZONE_DUTY"][this.langCode.toLowerCase()];
        document.getElementById('zone_general').innerHTML = this.jsonLangData["index"]["POP_ZONE_GENERAL"][this.langCode.toLowerCase()];
        document.querySelector('.popup_security .desc').innerHTML = this.jsonLangData["index"]["POP_ZONE_SECURITY"][this.langCode.toLowerCase()];

    }

    getCateName(p_cate, p_lang){
        let arr_cate = p_cate.text;
        let t_cate_name = "";
        try {
            t_cate_name = this.jsonLangData["store"]["STORE_CATE_MAIN_"+arr_cate][p_lang.toLowerCase()];
        } catch(e) {
            console.error("ERROR LANG CATECODE : " + arr_cate);
        }
        return t_cate_name;
    }

    // TODO onClickInfoStore, onClickInfoStoreByStoreId 인천공항 예외처리
    onClickInfoStoreById(id, isIframe) {
        this.wayfindParam = "STORE";
        let storeRouteObj = this.storeRouteList.find(item => item.id == id);
        if(!storeRouteObj) {
            return;
        }
        let storeContentsObj = this.storeContentsList.find(item => item.id == storeRouteObj.id);
        this.onClickInfoStore(storeRouteObj, storeContentsObj, isIframe);
    }

    locationInfoById(id, type){
        let endObj = new Object();
        if(type == "STORE") {
            let storeObj = this.storeRouteList.find(store => store.id == id);
            endObj = {
                id : id,
                floor : storeObj.STORE_FLOOR.text,
                x: storeObj.STORE_FLOOR.pos_x,
                y: storeObj.STORE_FLOOR.pos_y,
                storeObj: storeObj
            }
        } else if(type == "PARK") {
            let parkObj = this.parkRouteList.find(park => park.id == id);
            endObj = {
                id : id,
                floor : parkObj.PARK_FLOOR.text,
                x: parkObj.PARK_FLOOR.pos_x,
                y: parkObj.PARK_FLOOR.pos_y,

            }
        }
        this.locationInfo(endObj);
    }

    wayfindById(id) {
        this.wayfindType = "STORE";
        this.wayfindId = id;
        this.wayfind(id, "STORE");
    }

    wayfindParkById(id) {
        this.wayfindType = "PARK";
        this.wayfindId = id;
        this.wayfind(id, "PARK");
    }

    // 초기 상점 아이콘 삭제
    storeIconRemove() {
        document.querySelectorAll('.store_info > img').forEach(el => {
            // el.style.display = 'none';
        })
    }

    // 카테고리 클릭시 해당 카테고리에 포함된 상점 아이콘 처리
    setStoreIconAllShow(catecories, floor) {
        this.storeIconRemove();
        let storeList = this.storeRouteList.filter(store => store.STORE_FLOOR.text === floor)
        catecories.forEach(cate => {
            storeList = storeList.filter(store => store.CATE_CODE.text === cate);
            storeList.forEach(store => {
                document.querySelectorAll('.store_info > img').forEach(el => {
                    let storeId = el.dataset.storeId;
                    if(storeId === store.id){
                        el.style.display = 'block';
                    }
                })
            })
        })
    }

    // TODO onClickInfoStore, onClickInfoStoreByStoreId 인천공항 예외처리 종료
    getStoreDistance(storeId) {

        let resultDestance = 0;
        let endObj = new Object();
        let storeObj = this.storeRouteList.find(store => store.id == storeId);
        endObj = {
            id : storeId,
            floor : storeObj.STORE_FLOOR.text,
            x: storeObj.GATE_POS_X,
            y: storeObj.GATE_POS_Y,
            storeObj: storeObj
        }

        const startFloorCode = this.header.KIOSK_FLOOR.text;
        const endFloorCode = endObj.floor;

        this.wayfindParam = {
            startFloor: startFloorCode,
            startPos: {x: Number(this.header.KIOSK_FLOOR.pos_x), y: Number(this.header.KIOSK_FLOOR.pos_y)},
            endFloor: endFloorCode,
            endPos: {x: Number(endObj.x), y: Number(endObj.y)},
            endObj: endObj,
            originStartFloor : startFloorCode,
            originEndFloor : endFloorCode
        }

        if (startFloorCode == endFloorCode) {  // 같은 층일 경우
            // TODO 키오스크가 일반구역에 있고, 목적지가 면세구역에 있으면 보안검색대 통과
            if(this.header.KIOSK_SECT == "A" && endObj.storeObj?.area_type == "T" && endFloorCode != "F3") {
                console.log('키오스크 일반구역, 목적지 면세구역');
            } else {
                this.wayFindPath(this.wayfindParam);
                resultDestance = this.getWayFindLength();
            }
        } else {  // 다른 층일 경우
            console.log('다른 층');
        }

        resultDestance = Math.round(resultDestance * this.metersPerPixel);
        return resultDestance;
    }
}
