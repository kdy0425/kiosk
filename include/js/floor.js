/******************************************
 name :  floor.js
 auth :  ELTOV
 date :  2021.09.01
 desc :  층별안내 자바스크립트
 *******************************************/
var gl_main_conf = {
    lang: "KOR",
    name: "floor",
    curr_floor: "",
    map_load: ""
};

let requiredTime = [];
let gl_map_angle = 0;
let gl_floor_map = null;
let gl_conf_header = new Object();
let gl_jsop_lang_data = new Object();
let gl_arr_floor_list = new Array();
let gl_arr_store_list = new Array();
let gl_wayfind_bridge = [
    // ESC_T1 : F3 -> F4
    // ESC_T2, ESC_T3 / ELE_T2, ELE_T3 : F3 -> F2
    {
        "type": "MOVE",
        "p_floor": "F3",
        "t_b_code": "B02",
        "t_floor": "F2",
        "pub_code": "ESC_T2"
    },
    {
        "type": "MOVE",
        "p_floor": "F3",
        "t_b_code": "B02",
        "t_floor": "F2",
        "pub_code": "ESC_T3"
    },
    {
        "type": "MOVE",
        "p_floor": "F3",
        "t_b_code": "B02",
        "t_floor": "F2",
        "pub_code": "ELE_T2"
    },
    {
        "type": "MOVE",
        "p_floor": "F3",
        "t_b_code": "B02",
        "t_floor": "F2",
        "pub_code": "ELE_T3"
    },
    {
        "type": "MOVE",
        "p_floor": "F3",
        "t_b_code": "B02",
        "t_floor": "F4",
        "pub_code": "ESC_T1"
    },

];
let gl_floor_addon = [];
let gl_final_map_pos = {
    "TWOWAY": {
        "pos0": {
            "xx": -760,
            "yy": 0,
            "ss": 1
        },
        "pos1": {
            "xx": 750,
            "yy": 0,
            "ss": 1
        }
    },
    "THREEWAY": {
        "pos0": {
            "xx": -225,
            "yy": -375,
            "ss": 0.2
        },
        "pos1": {
            "xx": 225,
            "yy": -375,
            "ss": 0.2
        },
        "pos2": {
            "xx": 0,
            "yy": 300,
            "ss": 0.2
        }
    },
    "FOURWAY": {
        "pos0": {
            "xx": -225,
            "yy": -375,
            "ss": 0.2
        },
        "pos1": {
            "xx": 225,
            "yy": -375,
            "ss": 0.2
        },
        "pos2": {
            "xx": -225,
            "yy": 300,
            "ss": 0.2
        },
        "pos3": {
            "xx": 225,
            "yy": 300,
            "ss": 0.2
        }
    }
};

//추가
var gl_arr_mnu_main_code = new Array("floor", "store", "food", "event", "facility");

/////////////////////////////////////////////////
// 초기화 함수들


function setInitSettingLang(p_load_data) {
    gl_jsop_lang_data = p_load_data;
}

function setInitSetting(p_result) {

    if (p_result != "SUCC") {
        console.log("FAIL LOAD DATA/ROUTE");
        return;
    }

    $(".floor_btn .floor_title").click(function () {
        onClickFloorInfo(this);
    });

    $(".faci_btn").click(function () {
        onClickPubInfo(this);
    });

    $(".here_btn").click(function () {
        onClickHere(this);
    });

    console.log("LOCAL SETTING FLOOR");
    setInitConfig(gl_xml_conf.xml_data);
}

function setInitConfig(p_load_data) {
    let i = 0;
    let i_found = 0;

    gl_conf_header = p_load_data.header;
    let store_list = p_load_data.arr_store_list;

    let option = {
        url_data: severHost + "/user/xml/kiosk_contents.jsp?kiosk_code=" + kiosk_code,
        url_route: severHost + "/t2/system/route/getRouteXml",
        // url_data: "xml/kiosk_contents.xml",
        // url_route: "xml/kiosk_route.xml",
        font_name: "NotoSansCJKLIGHT",
        font_weight: "700",
        map_angle: 0,
        scale_init: 0.5,
        margin_height: 0,
        margin_top: 0,
        debug_line: "",
        debug_wayfind: "DEBUG",
        wayfind_bridge: gl_wayfind_bridge,
        addon_list: gl_floor_addon,
        wayfind_speed:2,
        final_map_type: gl_final_map_pos,
        map_scale: "auto",
        img_curr_type: {
            "url": "images/wayfind/floor_minimap_start.svg",
            "width": "40",
            height: "56"
        },
        img_target_type: {
            "url": "images/wayfind/floor_minimap_arrival.svg",
            "width": "60",
            height: "60"
        },
        // img_move_type: {
        //     "url": "images/wayfind/ico_m_point_human.png",
        //     "width": "48",
        //     height: "48"
        // },
        img_move_type: {
            "url": "images/wayfind/ico_m_point_human.svg",
            "width": "140",
            height: "140"
        },
        disp_background: "rgba(239, 239, 246, 0)"
    };

    for (let i = 0; i < gl_arr_floors.length; i++) {
        if (gl_arr_floors[i].code == gl_conf_header.KIOSK_FLOOR) {
            i_found = i;
            break;
        }
    }

    for (let i = 0; i < store_list.length && i < 1000; i++) {
        
        gl_arr_store_list.push(store_list[i]);
    }

    //맵의 회전 값
    switch(gl_conf_header.KIOSK_MAP){
        case 'E':
            gl_map_angle = option.map_angle = -90; 
            break;
        case 'W':
            gl_map_angle = option.map_angle = 90; 
            break;
        case 'N':
            gl_map_angle = option.map_angle = 0; 
            break;
        case 'S':
            gl_map_angle = option.map_angle = 180; 
            break;
        default:
            gl_map_angle = option.map_angle = 0; 
            break;
    }

    let main = document.getElementById("id_map_main");
    gl_floor_map = new Eltov2DMap(main, option);
    gl_floor_map.setInit();


    //현위치 층, 버튼에 표시
    // for(i = 0; i < gl_arr_floors.length; i++){
    //     if(gl_arr_floors[i].code == gl_conf_header.KIOSK_FLOOR){
    //         obj = $("#id_floor_title_"+i);
    //
    //         $("#id_floor_main_title").html(gl_arr_floors[i].name);
    //         var str_lang = gl_main_conf.lang.toLowerCase();
    //         console.log("gl_main_conf.name ", gl_main_conf.name)
    //         console.log("FLOOR_LEVEL_.name ", gl_arr_floors[i].code)
    //
    //         $("#id_floor_sub_title").html(gl_jsop_lang_data[gl_main_conf.name]["FLOOR_LEVEL_" + gl_arr_floors[i].code][str_lang]);
    //         // $("#id_floor_sub_title").html(gl_arr_floors[i].name);
    //
    //         // $(obj).css("border-radius","40px");
    //         $(obj).css("background","#DDDDDD");
    //         $(obj).addClass("active");
    //     }
    // }

    // FLOOR 이벤트 리스너
    document.addEventListener("eltov_map", function (evt) {
        onCallBackElovMap(evt);
    });

}

function setInitConfigLang(p_lang) {
    gl_jsop_lang_data = p_lang;
}

function setMainLang(p_type, p_lang) {
    if (p_type != "INIT" && gl_main_conf.lang == p_lang) { return; }

    gl_main_conf.lang = p_lang;

    switch(gl_main_conf.lang){
        case 'ko_KR':
            gl_main_conf.lang = 'KOR'
            break;
        case 'en_US':
            gl_main_conf.lang = 'ENG'
            break;
        case 'zh_CN':
            gl_main_conf.lang = 'CHN'
            break;
        case 'ja_JP':
            gl_main_conf.lang = 'JPN'
            break;
    }

    let str_attr = "";
    let str_lang = gl_main_conf.lang.toLowerCase();

    $(".lang_code_names").each(function (i) {
        str_attr = $(".lang_code_names").eq(i).attr("lang_code");
        // console.log(gl_jsop_lang_data, 'gl_jsop_lang_data')
        try {
            $(this).html(gl_jsop_lang_data["index"][str_attr][str_lang]);
        } catch (err) {
            console.log("ERROR LANG FLOOR1 : " + str_attr);
        }
    });

    $(".lang_code_names_fac").each(function (i) {
        str_attr = $(".lang_code_names_fac").eq(i).attr("lang_code");
        try {
            $(this).html(gl_jsop_lang_data["facility"][str_attr][str_lang]);
        } catch (err) {
            console.log("ERROR LANG FLOOR2 : " + str_attr);
        }
    });

    try {
        if (gl_main_conf.curr_floor != "") {
            // $("#id_floor_sub_title").html(gl_jsop_lang_data[gl_main_conf.name]["FLOOR_LEVEL_" + gl_main_conf.curr_floor][str_lang]);
        }
    } catch (err) {
        console.log("ERROR LANG SUB TITLE : ");
    }

    if (gl_main_conf.map_load == "SUCC") {
        let send_param = {
            "sect": "CMD",
            "type": "LANG",
            "code": gl_main_conf.lang
        };
        gl_floor_map.setCallWebToMap(send_param);
    }
}


function setMainStart(p_obj) {
    $(".faci_btn").removeClass("active");

    let is_wayfind = false;

    console.log("FLOOR ==== setMainStart");
    $("#id_page_wayfind_left").hide();
    setFloorInfo("INIT", gl_conf_header.B_CODE, gl_conf_header.KIOSK_FLOOR);


    if (p_obj != null && p_obj.sect != undefined) {

        // console.log(p_obj, 'pdpdpdpdpdp')
        if (p_obj.sect == "LOCATION") {
            if (p_obj.type == "STORE" || p_obj.type == "PARK" || p_obj.type == "FLIGHT") {
                if (gl_main_conf.map_load == "SUCC") {
                    is_wayfind = true;
                    var send_param = {
                        "sect": "WAYFIND",
                        "type": p_obj.type,
                        "id": p_obj.id,
                        "way_type": "LOCATION"
                    };
                    console.log(send_param, 1111111111111)
                    gl_floor_map.setCallWebToMap(send_param);
                }
            } else {
                is_wayfind = true;
                if (gl_main_conf.map_load == "SUCC") {
                    var send_param = {
                        "sect": "WAYFIND",
                        "type": "PUB",
                        "id": p_obj.id
                    };
                    gl_floor_map.setCallWebToMap(send_param);
                }
            }
        } else if (p_obj.sect == "WAYFIND") {
            if (p_obj.type == "STORE") {
                if (gl_main_conf.map_load == "SUCC") {
                    is_wayfind = true;
                    var send_param = {
                        "sect": "WAYFIND",
                        "type": "STORE",
                        "id": p_obj.id,
                        "way_type": "WAYFIND",
                        "move_type": getChkNull(p_obj.move_type, "")
                    };
                    gl_floor_map.setCallWebToMap(send_param);
                }
            } else if (p_obj.type == "PARK") {
                if (gl_main_conf.map_load == "SUCC") {
                    is_wayfind = true;
                    var send_param = {
                        "sect": "WAYFIND",
                        "type": "PARK",
                        "id": p_obj.id,
                        "way_type": "WAYFIND",
                        "near_type": "TARGET",
                        "move_type": getChkNull(p_obj.move_type, "")
                    };
                    gl_floor_map.setCallWebToMap(send_param);
                }
            } else if (p_obj.type == "FLIGHT") {
                if (gl_main_conf.map_load == "SUCC") {
                    is_wayfind = true;
                    var send_param = {
                        "sect": "WAYFIND",
                        "type": "FLIGHT",
                        "id": p_obj.id,
                        "way_type": "WAYFIND",
                        "move_type": getChkNull(p_obj.move_type, "")
                    };
                    gl_floor_map.setCallWebToMap(send_param);
                }
            }else if (p_obj.type == "PUB") {
                // if(gl_main_conf.map_load == "SUCC"){
                //     is_wayfind = true;
                //     var send_param = {"sect":"WAYFIND","type":"PUB","id":p_obj.id,"way_type":"WAYFIND","move_type": getChkNull(p_obj.move_type,"")};
                //     gl_floor_map.setCallWebToMap(send_param);
                // }
            }
        }
    }

    if (is_wayfind == false) {
        $("#id_pop_floor_guide").show();

        this.m_util = new EltovWayUtil();
        let map_width = Number(gl_conf_header.MAP_WIDTH);
        let map_height = Number(gl_conf_header.MAP_HEIGHT);
        let chg_in_pos = {
            c_x: (map_width / 2),
            c_y: (map_height / 2),
            rad: (gl_map_angle) * Math.PI / 180,
            p_x: 0,
            p_y: 0
        };
        chg_in_pos.p_x = Number(gl_conf_header.POS_X);
        chg_in_pos.p_y = Number(gl_conf_header.POS_Y);
        let t_pos = this.m_util.getChgAnglePos(chg_in_pos);
        // var send_param = {"sect":"CMD","type":"MOVE","x":0-t_pos.x,"y":0-t_pos.y,"scale":0.6};
        let send_param = {
            "sect": "CMD",
            "type": "MOVE",
            "x": 750,
            "y": 0 - t_pos.y,
            "scale": 0.6
        };
        gl_floor_map.setCallWebToMap(send_param);
        setTimeout(setMainStartEnd, 4000);
    }

}

function setMainStartEnd() {
    $("#id_pop_floor_guide").fadeOut();
}

function setMainStop() {

    if (PAGEACTIVEYN == false) {
        return;
    }

    PAGEACTIVEYN = false;
}

/////////////////////////////////////////////////
// FUNCTION

function setFloorInfo(p_type, p_b_code, p_floor) {
    document.getElementById('resultTime').innerHTML = '';

    const currentTitle = document.getElementById('id_map_title');
    currentTitle.innerHTML = '';

    if (p_type != "") { $("#id_bottom_main").show(); }
    $("#id_floor_name_area").show();
    $("#id_page_wayfind_left").hide();
    $("#id_page_wayfind_left2").hide();

    // if (p_b_code == undefined) {p_b_code = "T2";}
    let b02Arr = ['F4', 'F5']; 
    
    if(p_type === 'WAYFIND' && !p_b_code){
        b02Arr.includes(p_floor) ? p_b_code = 'B02' : p_b_code = 'B01';
    }

    for (let i = 0; i < gl_arr_floors.length; i++) {
        let obj = $("#id_floor_title_" + i);

        if (gl_arr_floors[i].b_code == p_b_code && gl_arr_floors[i].code == p_floor) {
            $("#id_floor_main_title").html(gl_arr_floors[i].name);

            // let subLocation = p_floor === 'F3' ? '면세구역' : '일반구역';
            let curLocation = `<h2>${gl_arr_floors[i].name}</h2>`

            currentTitle.innerHTML = curLocation;
            currentTitle.style.display = 'block';

            $(obj).addClass("active");
            $(obj).css("background", "#DDDDDD");

            gl_main_conf.curr_floor = p_floor;

            if (p_type == "INIT" || p_type == "LOCATION") {
                $(".fac_box .list_fac li").removeClass("active");
                if (gl_main_conf.map_load == "SUCC") {
                    var send_param = {
                        "sect": "CMD",
                        "type": "FLOOR",
                        "b_code": p_b_code,
                        "floor": p_floor,
                        "move_type": p_type
                    };
                    console.log("send_param", send_param);
                    gl_floor_map.setCallWebToMap(send_param);

                }
            }
        } else {
            $(obj).removeClass("active");
        }
    }

    try {
        var str_lang = gl_main_conf.lang.toLowerCase();
        // $("#id_floor_sub_title").html(gl_jsop_lang_data[gl_main_conf.name]["FLOOR_LEVEL_" + p_floor][str_lang]);
    } catch (err) {
        console.log("ERROR LANG FLOOR23 : " + str_lang);
    }

}

/////////////////////////////////////////////////
// CALL BACK

function onCallBackElovMap(p_evt) {
    // console.log(123123123123, p_evt)

    var i = 0;
    var detail = p_evt.detail;
    console.log("<<< onCallBackElovMap");
    // alert(JSON.stringify(detail), "<<<");
    
    if (detail.sect == "INIT") {
        
        if (detail.result == "SUCC") {
            loadingScreen.style.display = 'none';          
            gl_main_conf.map_load = "SUCC";
            
            var cmd_obj = {
                sect: "FLOOR",
                type: "DONE"
            };
            setParentCmd(cmd_obj)
        } else {
            var cmd_obj = {
                sect: "FLOOR",
                type: "DONE"
            };
            setParentCmd(cmd_obj)
            $("#id_pop_floor_error").show();
        }
    } else if (detail.sect == "STORE") {

        var cmd_obj = {
            sect: "POPUP",
            type: "STORE_INFO",
            id: detail.id,
            code: ""
        };
        // if(parent.MAINPARENTCUSTOMCODE){ parent.setParentCmd(cmd_obj); }
        setParentCmd(cmd_obj)
    } else if (detail.sect == "PUB") {


    } else if (detail.sect == "WAYFIND") {

        if (detail.result == "NOWAY") { // 길이 없음
            var cmd_obj = {
                sect: "POPUP",
                type: "ERROR",
                msg: "길을 찾을 수가 없습니다"
            };
            // if(parent.MAINPARENTCUSTOMCODE){ parent.setParentCmd(cmd_obj); }
        } else if (detail.result == "NONE") { // 정보를 찾을수 없음
            var cmd_obj = {
                sect: "POPUP",
                type: "ERROR",
                msg: "정보가 없습니다."
            };
            // if(parent.MAINPARENTCUSTOMCODE){ parent.setParentCmd(cmd_obj); }

        } else if (detail.result == "WAYTYPE") { // 길안내 선택
            if (detail.type == "STORE") {
                var cmd_obj = {
                    sect: "POPUP",
                    type: "STORE_WAYTYPE",
                    id: detail.id,
                    target_floor: detail.target_floor,
                    target_x: detail.target_x,
                    target_y: detail.target_y
                };
                setParentCmd(cmd_obj);
            } else if (detail.type == "PARK") {
                var cmd_obj = {
                    sect: "POPUP",
                    type: "PARK_WAYTYPE",
                    id: detail.id,
                    target_floor: detail.target_floor,
                    target_x: detail.target_x,
                    target_y: detail.target_y
                };
                setParentCmd(cmd_obj);
            }
        } else if (detail.result == "WAYFLOOR") { // 층이동

            setFloorInfo("WAYFIND", detail.b_code, detail.floor);

        } else if (detail.result == "WAYFLOORCHANGE") { // 길안내시 층이동 재혁추가

            setFloorInfo("", detail.b_code, detail.floor);

        } else if (detail.result == "WAYSTART") { // 길안내 시작
            if (detail.mode == "TWOWAY") {
                let i_my = 0;
                let i_target = 0;
                let str_updown = "";

                for (i = 0; i < gl_arr_floors.length; i++) {
                    if (gl_arr_floors[i].code == detail.start_floor) i_my = i;
                    if (gl_arr_floors[i].code == detail.target_floor) i_target = i;
                }

                let str_lang = gl_main_conf.lang.toLowerCase();
                let str_start_title = gl_jsop_lang_data.floor["WAYFIND_SUB_START_TITLE"][str_lang];
                let str_target_title = gl_jsop_lang_data.floor["WAYFIND_SUB_TARGET_TITLE"][str_lang];

                // console.log(str_start_title, str_target_title)
                $("#id_page_wayfind_left .start_title").html(str_start_title)
                $("#id_page_wayfind_left .target_title").html(str_target_title)

                $("#id_page_wayfind_left .start_floor").html(getFloorName(detail.start_floor, gl_main_conf.lang));
                $("#id_page_wayfind_left .target_floor").html(getFloorName(detail.target_floor, gl_main_conf.lang));

                $("#id_bottom_main").hide();
            } else if (detail.mode == "THREEWAY") {

                var i_my = 0;
                var i_target = 0;
                var str_updown = "";

                for (i = 0; i < gl_arr_floors.length; i++) {
                    if (gl_arr_floors[i].code == detail.start_floor) i_my = i;
                    if (gl_arr_floors[i].code == detail.target_floor) i_target = i;
                }

                var str_lang = gl_main_conf.lang.toLowerCase();
                var str_start_title = gl_jsop_lang_data.floor["FLOOR_LEVEL_" + detail.start_floor][str_lang];
                var str_mid_title = gl_jsop_lang_data.floor["FLOOR_LEVEL_F6"][str_lang];
                var str_target_title = gl_jsop_lang_data.floor["FLOOR_LEVEL_" + detail.target_floor][str_lang];

                $("#id_page_wayfind_left2 .sub_start_title").html(str_start_title);
                $("#id_page_wayfind_left2 .sub_mid_title").html(str_mid_title);
                $("#id_page_wayfind_left2 .sub_target_title").html(str_target_title);

                $("#id_page_wayfind_left2 .start_floor").html(getFloorName(detail.start_floor, gl_main_conf.lang));
                $("#id_page_wayfind_left2 .mid_floor").html(getFloorName("6F", gl_main_conf.lang));
                $("#id_page_wayfind_left2 .target_floor").html(getFloorName(detail.target_floor, gl_main_conf.lang));

                $("#id_bottom_main").hide();
            }

        } else if (detail.result == "WAYEND") { // 길안내 종료

            if (detail.mode == "TWOWAY") {
                //다른층 길찾기시 설명창 활성화
                $("#id_floor_name_area").hide();
                $("#id_page_wayfind_left").fadeIn();
            } else if (detail.mode == "THREEWAY") {
                $("#id_floor_name_area").hide();
                $("#id_page_wayfind_left2").fadeIn();
            }

            let xx = (0 - $(".here_btn").width / 2);
            let yy = (0 - $(".here_btn").height / 2);
            let tw = TweenMax.fromTo($(".here_btn"), 0.5, {
                x: xx,
                y: yy,
                scale: 2.5
            }, {
                x: xx,
                y: yy,
                scale: 8.0,
                yoyo: true,
                repeat: 9
            });

            // const sum = requiredTime.reduce((acc, cur) => {return acc + cur;}, 0)

            // document.removeEventListener('click', onClickHere);

            const sum = requiredTime.reduce((acc, cur) => {
                return acc + cur;
            }, 0)

            let resultTimeHtml = '';
            resultTimeHtml = `<div>`

            if(detail.type === 'PARK'){
                let parkIdArr = detail.park_id.split('');
                let firstPart = detail.park_id.slice(0, 3);
                let secondPart = detail.park_id.slice(-3);
                if(parkIdArr[0] === '1'){
                    resultTimeHtml += `<span>주차위치 : 서편 ${firstPart}구역</span>`
                } else {
                    resultTimeHtml += `<span>주차위치 : 동편 ${firstPart}구역</span>`

                }
               
            }
            sum >= 1000 
                ? resultTimeHtml += `<span>이동거리 : ${(parseInt(sum)/1000).toFixed(1)}KM</span>`
                : resultTimeHtml += `<span>이동거리 : ${sum}M</span>`;

            // 1분에 84m 걷는다는 가정. -> 시간 = 거리 / 속력
            resultTimeHtml += `<span>예상시간 : ${(Math.trunc(parseInt(sum)/parseInt(gl_conf_header.WALK_SPEED)))}분</span>`;
            resultTimeHtml += `</div>`

            document.getElementById('resultTime').innerHTML = resultTimeHtml;
            detail.mode !== 'ONEWAY' ? document.getElementById('id_map_title').style.display = 'none' : null;
            
            requiredTime = [];
            document.querySelectorAll('.humanIcon').forEach(item => {
                if(item.style.display !== 'none'){
                    item.style.display = 'none';
                }
            })
            // document.addEventListener('click', onClickHere); 

            // 다른 버튼 클릭시 길찾기 초기화

            // 5초후 현재위치 버튼 클릭 함수 호출
            // setTimeout(function() {
            //     onClickHere();
            // }, 5000);
            console.log(resultTimeHtml)
        }
    }
    // alert(JSON.stringify(p_evt))

}

/////////////////////////////////////////////////
// CLICK EVENT
/////////////////////////////////////////////////

function onClickFloorInfo(p_obj) {
    let str_code = $(p_obj).attr("code");
    let b_code = $(p_obj).attr("b_code");
    $("#id_page_wayfind_left").hide();
    $("#id_page_wayfind_left2").hide();
    $("#id_floor_name_area").show();
    setFloorInfo("LOCATION", b_code, str_code);
}

function onClickHere(p_obj) {
    onClickCurrLocation();
}

function onClickPubInfo(str_code) {

    setFloorInfo("LOCATION", gl_conf_header.B_CODE, gl_conf_header.KIOSK_FLOOR);

    // var str_code = $(p_obj).attr("code");
    // $(".faci_btn").removeClass("active");
    // $(p_obj).addClass("active");

    //if(gl_main_conf.map_load == "SUCC"){
    var send_param = {
        "sect": "WAYFIND",
        "type": "PUB",
        "way_type": "NEARLOCATION",
        "id": str_code
    };
    gl_floor_map.setCallWebToMap(send_param);
    //}


    var statics_obj = {
        "sect": "PUBLIC",
        "code": str_code
    };
    var cmd_obj = {
        sect: "STATICS",
        type: "",
        id: "",
        code: statics_obj.code,
        obj: {
            sect: "PUBLIC",
            code: statics_obj.code
        }
    };
    setParentCmd(cmd_obj);
}

function onClickCurrLocation() {

    setFloorInfo("LOCATION", gl_conf_header.B_CODE, gl_conf_header.KIOSK_FLOOR);

    $("#id_page_wayfind_left").hide();

    this.m_util = new EltovWayUtil();
    let map_width = Number(gl_conf_header.MAP_WIDTH);
    let map_height = Number(gl_conf_header.MAP_HEIGHT);
    let chg_in_pos = {
        c_x: (map_width / 2),
        c_y: (map_height / 2),
        rad: (gl_map_angle) * Math.PI / 180,
        p_x: 0,
        p_y: 0
    };
    chg_in_pos.p_x = Number(gl_conf_header.POS_X);
    chg_in_pos.p_y = Number(gl_conf_header.POS_Y);

    let t_pos = this.m_util.getChgAnglePos(chg_in_pos);

    setFloorInfo("INIT", gl_conf_header.B_CODE, gl_conf_header.KIOSK_FLOOR);
    console.log(t_pos);
    let send_param = {
        "sect": "CMD",
        "type": "MOVE",
        "x": 0 - t_pos.x,
        "y": 0 - t_pos.y,
        "scale": 2.5
    };
    gl_floor_map.setCallWebToMap(send_param);

}


/////////////////////////////////////////////////
// DEBUG
function onClickDebugLang(p_lang) {
    setMainLang("CLICK", p_lang);
}

function onClickDebug01(p_type) {
    setStoreSearch("");
}

function onClickDebugInit(p_type) {
    if (p_type == "START") {
        setMainStart(null);
    } else {
        setMainStop();
    }
}

function onClickDebugWay(p_id) {
    if (gl_main_conf.map_load == "SUCC") {
        for (let i = 0; i < gl_arr_store_list.length; i++) {
            let obj = gl_arr_store_list[i];
            if (obj.ID == p_id) {
                console.log(obj);
                var send_param = {
                    "sect": "WAYFIND",
                    "type": "STORE",
                    "id": p_id,
                    "way_type": "WAYFIND",
                    "move_type": "ESC"
                };
                gl_floor_map.setCallWebToMap(send_param);
                break;
            }
        }
    }
}

function onClickDebugPark(p_id) {
    if (gl_main_conf.map_load == "SUCC") {
        let send_param = {
            "sect": "WAYFIND",
            "type": "PARK",
            "id": p_id,
            "way_type": "WAYFIND",
            "move_type": "ELE"
        };
        gl_floor_map.setCallWebToMap(send_param);
    }
}

function onClickDebugLoc(p_id) {
    if (gl_main_conf.map_load == "SUCC") {
        var send_param = {
            "sect": "WAYFIND",
            "type": "STORE",
            "store_id": p_id,
            "way_type": "LOCATION",
            "move_type": "ELE"
        };
        gl_floor_map.setCallWebToMap(send_param);
    }
}

function onClickDebugPub(p_code) {
    if (gl_main_conf.map_load == "SUCC") {
        if (p_code == "P24") {
            var send_param = {
                "sect": "WAYFIND",
                "type": "PUB",
                "way_type": "NEARLOCATION",
                "id": p_code
            };
            gl_floor_map.setCallWebToMap(send_param);
        } else {
            var send_param = {
                "sect": "WAYFIND",
                "type": "PUB",
                "way_type": "NEARLOCATION",
                "id": p_code
            };
            gl_floor_map.setCallWebToMap(send_param);
        }
    }
}

function onClickDebugTwoWay() {
    if (gl_main_conf.map_load == "SUCC") {
        var send_param = {
            "sect": "DEBUG",
            "type": "TWOWAY"
        };
        gl_floor_map.setCallWebToMap(send_param);
    }
}

function onClickDebugMove(p_type) {
    if (gl_main_conf.map_load == "SUCC") {
        if (p_type == "A") {
            var xx = (0 - 340);
            var yy = (0 - 1140);
            var send_param = {
                "sect": "CMD",
                "type": "MOVE",
                "x": xx,
                "y": yy
            };
            gl_floor_map.setCallWebToMap(send_param);
        } else {
            var send_param = {
                "sect": "CMD",
                "type": "MOVE",
                "x": 1300,
                "y": 700
            };
            gl_floor_map.setCallWebToMap(send_param);
        }
    }
}

function onClickDebugScale(p_type) {
    if (gl_main_conf.map_load == "SUCC") {
        if (p_type == "PLUS") {
            var send_param = {
                "sect": "CMD",
                "type": "SCALE",
                "scale": "IN"
            };
            gl_floor_map.setCallWebToMap(send_param);
        } else {
            var send_param = {
                "sect": "CMD",
                "type": "SCALE",
                "scale": "OUT"
            };
            gl_floor_map.setCallWebToMap(send_param);
        }
    }
}

function onClickDebugLine() {
    var send_param = {
        "sect": "DEBUG",
        "type": "LINE"
    };
    gl_floor_map.setCallWebToMap(send_param);
}


////추가

function setParentCmd(p_obj) {
    var str_html = "";

    if (p_obj.sect == "POPUP") {

        if (p_obj.type == "STORE_INFO") {
            setMakeInfoPopUpStore(p_obj);
        } else if (p_obj.type == "FACILITY_INFO") {
            setMakeInfoPopUpFacility(p_obj);
        } else if (p_obj.type == "WAITING") {
            setMakeInfoPopUpWaiting(p_obj);
        } else if (p_obj.type == "STORE_WAYTYPE") {
            gl_main_conf.way_type = "STORE";
            gl_main_conf.pop_store_id = p_obj.id + "";
            gl_main_conf.pop_target_floor = getChkNull(p_obj.target_floor, "");
            gl_main_conf.pop_target_x = getChkNull(p_obj.target_x, "");
            gl_main_conf.pop_target_y = getChkNull(p_obj.target_y, "");

            $("#id_popup_waytype").fadeIn(200);
        } else if (p_obj.type == "PARK_WAYTYPE") {
            gl_main_conf.way_type = "PARK";
            gl_main_conf.pop_store_id = p_obj.id + "";
            gl_main_conf.pop_target_floor = getChkNull(p_obj.target_floor, "");
            gl_main_conf.pop_target_x = getChkNull(p_obj.target_x, "");
            gl_main_conf.pop_target_y = getChkNull(p_obj.target_y, "");

            $("#id_popup_waytype").fadeIn(200);
        } else if (p_obj.type == "ERROR") {
            setMakeInfoPopUpError(p_obj);
        }
    } else if (p_obj.sect == "FLOOR") {
        if (p_obj.type == "DONE") { // 지도 로딩 끝
            // setTimeout(setInitSettingEnd04, 1000);
        }

    } else if (p_obj.sect == "WAYFIND" || p_obj.sect == "LOCATION") {
        alert("sdf")
        var way_obj = {
            sect: p_obj.sect,
            type: p_obj.type,
            "id": p_obj.id,
            "code": getChkNull(p_obj.code, ""),
            "move_type": getChkNull(p_obj.move_type, ""),
            "target_floor": getChkNull(p_obj.target_floor, ""),
            "target_x": getChkNull(p_obj.target_x, ""),
            "target_y": getChkNull(p_obj.target_y, "")
        };
        setMainViewOpen("floor", way_obj);

    } else if (p_obj.sect == "STATICS") {
        // setStatisSend(p_obj.obj);
    } else if (p_obj.sect == "HIDE") {
        str_html = p_obj.type;
        str_html = str_html.toLowerCase();
        $("#id_main_frame_" + str_html).hide();
    } else if (p_obj.sect == "MENU") {
        setMainViewOpen(p_obj.code, p_obj);
    }
}

function setStatisSend(p_obj) {

    var str_statics = "";
    if (p_obj.code == undefined) {
        return;
    }

    if (p_obj.sect == "MENU") {
        str_statics = "MENU|" + p_obj.code;
    } else if (p_obj.sect == "STORE") {
        str_statics = "STORE|" + p_obj.code;
    } else if (p_obj.sect == "EVENT") {
        str_statics = "EVENT|" + p_obj.code;
    } else if (p_obj.sect == "PUBLIC") {
        str_statics = "PUBLIC|" + p_obj.code;
    }
    console.log("str_statics : " + str_statics);
    // setCallWebToApp("BIG_DATA",str_statics);
}


function onClickPopupWayType(p_type) {

    if (gl_main_conf.way_type == "STORE") {
        var way_obj = {
            sect: "WAYFIND",
            type: "STORE",
            "id": gl_main_conf.pop_store_id,
            "move_type": p_type,
            "target_floor": gl_main_conf.pop_target_floor,
            "target_x": gl_main_conf.pop_target_x,
            "target_y": gl_main_conf.pop_target_y
        };
        setMainViewOpen("floor", way_obj);
    } else if (gl_main_conf.way_type == "PARK") {
        var way_obj = {
            sect: "WAYFIND",
            type: "PARK",
            "id": gl_main_conf.pop_store_id,
            "move_type": p_type,
            "target_floor": gl_main_conf.pop_target_floor,
            "target_x": gl_main_conf.pop_target_x,
            "target_y": gl_main_conf.pop_target_y
        };
        setMainViewOpen("floor", way_obj);
    }
    onClickPopupClose("WAYTYPE");
}

///////////////////////////////////////////////
//  POPUP
// 상점정보
function setMakeInfoPopUpStore(p_obj) {
    var i = 0,
        i_found = 0;
    var obj;
    var str_img = "",
        str_name = "",
        str_desc = "";
    gl_main_conf.pop_store_id = "";

    for (i = 0; i < gl_arr_store_list.length && i < 3000; i++) {
        obj = gl_arr_store_list[i];
        obj_store = gl_xml_conf.xml_route.arr_store_list[i]
        if (p_obj.id === obj_store.ID) {
            console.log(gl_xml_conf.xml_data.arr_store_list[i])

            // 보안구역일때 길안내 버튼 숨김
            if(gl_xml_conf.xml_data.header.KIOSK_SECT === 'T' && obj_store.AREA_TYPE !== 'T'){ // 보안구역에서 다른 구역갈 때길안내 버튼 숨김
                document.querySelector('.btn_way').style.display = 'none';
                document.querySelector('.btn_wayfind').style.translate = '-50%';
            } else {
                document.querySelector('.btn_way').style.display = 'block';
                document.querySelector('.btn_wayfind').style.translate = 0;
            }

            str_img = obj.STORE_MAIN_URL;
            if (str_img === "" || str_img === undefined) {
                str_img = "<p class=\"lang_name_thumb\">" + str_name + "</p>";
            } else {
                str_img = "<img src=\"" + str_img + "\" draggable=false>";
            }
            console.log(str_img);
            $("#id_pop_store_thumb").html(str_img);
            $("#id_pop_store_title").html(str_name);

            // $("#id_pop_store_floor").html(getFloorName(obj.STORE_FLOOR, gl_main_conf.lang));
            $("#id_pop_store_name").html(obj_store["STORE_NAME_" + gl_main_conf.lang]);
            $("#id_pop_store_floor").html(obj_store["STORE_ITEM_" + gl_main_conf.lang]);
            $("#id_pop_desc").html(obj_store["STORE_DESC_" + gl_main_conf.lang]);


            $("#id_pop_store_category").html(getCateName(obj_store.CATE_CODE, gl_main_conf.lang));
            // $("#id_pop_store_desc").html(str_desc);
            $("#id_pop_store_time").html(obj.STORE_SERVICETIME);
            $("#id_pop_store_phone").html(obj.STORE_PHONE);

            gl_main_conf.pop_store_id = p_obj.id + "";

            i_found = 1;
            break;
        }
    }

    if (i_found === 1) {

        var statics_obj = {
            "sect": "STORE",
            "code": p_obj.id
        }
        setStatisSend(statics_obj);
        $("#id_popup_store").fadeIn();

    }
}

///////////////////////////////////////////////
// 화면전환
function setMainViewOpen(p_mnu, p_obj) {
    console.log(' ====================== ELTOV setMainViewOpen ========================')
    var str_code = p_mnu;
    console.log("setMainViewOpen >> " + str_code);
    var t_num = gl_arr_mnu_main_code.indexOf(str_code);
    $(".bottom_menu .bottom_btn_li .bottom_btn").removeClass("active");
    $($(".bottom_menu .bottom_btn_li .bottom_btn")[t_num]).addClass("active");
    setMainStart(p_obj);
}