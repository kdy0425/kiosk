/******************************************
 name :  xml.js
 auth :  ELTOV
 date :  2020.11.08
 desc :  xml파싱처리
 *******************************************/

 var gl_xml_conf = {
    url_data: severHost + "/user/xml/kiosk_contents.jsp?kiosk_code="+kiosk_code,
    url_route: severHost + "/t2/system/route/getRouteXml",
    // url_data: "xml/kiosk_contents.xml",
    // url_route: "xml/kiosk_route.xml",
    url_gate: "xml/kiosk_gate.xml",
    xml_data:new Object(),
    xml_gate:new Object(),
    xml_route:new Object()
}

// function setLoadDataGates(){
//     var xhr;
//     var str_ret = "";
//     var http;

//     if (window.XMLHttpRequest){ xhr = new XMLHttpRequest();
//     }else{ xhr = new ActiveXObject("Microsoft.XMLHTTP"); }

//     xhr.onreadystatechange = function(){
//         if (xhr.readyState != 4){ return; }
//         // 성공을 했다.
//         if(xhr.status == 200){
//             var xml_doc = xhr.responseXML;
//             console.log(xml_doc, 'docs!!!!!!!!!')
//             onReadXmlDataGates(xml_doc);
//         }
//     }

//     xhr.open("GET",gl_xml_conf.url_gate,true);
//     xhr.send();
// }

//////////////////////////////////////////////////////////
// 리턴할 페이지 불러오기
function setLoadDataContents(){
    var xhr;
    var str_ret = "";
    var http;

    if (window.XMLHttpRequest){ xhr = new XMLHttpRequest();
    }else{ xhr = new ActiveXObject("Microsoft.XMLHTTP"); }

    xhr.onreadystatechange = function(){
        if (xhr.readyState != 4){ return; }
        // 성공을 했다.
        if(xhr.status == 200){
            var xml_doc = xhr.responseXML;
            onReadXmlDataContents(xml_doc);
        }
    }

    xhr.open("GET",gl_xml_conf.url_data,true);
    xhr.send();
}

// function onReadXmlDataGates(p_xml_doc) {
//     console.log(p_xml_doc, 'p_xml_doc')
// }

function onReadXmlDataContents(p_xml_doc){
    // console.log(p_xml_doc, 'p_xml_doc')
    var ret_code = "FAIL";

    gl_xml_conf.xml_data.header = new Object();
    gl_xml_conf.xml_data.arr_intro_bg_list = new Array();
    gl_xml_conf.xml_data.time_obj = new Object();
    gl_xml_conf.xml_data.arr_screen_list = new Array();
    gl_xml_conf.xml_data.arr_notice_list = new Array();
    gl_xml_conf.xml_data.arr_order_list = new Array();
    gl_xml_conf.xml_data.arr_event_list = new Array();
    gl_xml_conf.xml_data.arr_store_list = new Array();
    gl_xml_conf.xml_data.arr_pub_list = new Array();
    gl_xml_conf.xml_data.arr_map_list = new Array();
    gl_xml_conf.xml_data.arr_park_list = new Array();
    gl_xml_conf.xml_data.arr_building_list = new Array();
    // gl_xml_conf.xml_date.arr_gate_list = new Array();

    try{

        var root_node = p_xml_doc.getElementsByTagName("KIOSK")[0];
        // var gate_node = p_xml_doc.getElementsByTagName("GATE_LIST")[0]
        if(!root_node){
            setInitSetting("FAIL DATA");
            return;
        }

        var i = 0;
        var str_tmp = "";
        var child1 = root_node.firstChild;
        // let sub_child1 = gate_node.firstChild;
        var child2;
        var child3;

        while(child1 != null && child1.nodeType != 4){

            if(child1.nodeType == 1){
                // console.log(sub_child1.nodeName == "GATE_LIST", ';child1.nodeName == "HEADER"')
                if(child1.nodeName == "HEADER"){

                    child2 = child1.firstChild;

                    while(child2 != null && child2.nodeType != 4){

                        if(child2.nodeName == "RET_CODE") gl_xml_conf.xml_data.header.RET_CODE = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "BRN_CODE") gl_xml_conf.xml_data.header.BRN_CODE = getCvtXmlTag(child2.childNodes[0].nodeValue);
               
                        if(child2.nodeName == "KIOSK_ID") gl_xml_conf.xml_data.header.KIOSK_ID = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "KIOSK_CODE") gl_xml_conf.xml_data.header.KIOSK_CODE = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "KIOSK_AREA") gl_xml_conf.xml_data.header.KIOSK_AREA = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "KIOSK_SECT") gl_xml_conf.xml_data.header.KIOSK_SECT = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "KIOSK_MAP") gl_xml_conf.xml_data.header.KIOSK_MAP = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "KIOSK_TYPE") gl_xml_conf.xml_data.header.KIOSK_TYPE = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "URL_REPORT") gl_xml_conf.xml_data.header.URL_REPORT = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "URL_STATUS") gl_xml_conf.xml_data.header.URL_STATUS = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "WALK_SPEED") gl_xml_conf.xml_data.header.WALK_SPEED = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        //if(child2.nodeName == "URL_PARK") gl_xml_conf.xml_data.header.URL_PARK = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        //if(child2.nodeName == "URL_WAITING_LIST") gl_xml_conf.xml_data.header.URL_WAITING_LIST = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        //if(child2.nodeName == "URL_WAITING_INPUT") gl_xml_conf.xml_data.header.URL_WAITING_INPUT = getCvtXmlTag(child2.childNodes[0].nodeValue);
                        if(child2.nodeName == "KIOSK_FLOOR"){
                            gl_xml_conf.xml_data.header.KIOSK_FLOOR = getCvtXmlTag(child2.childNodes[0].nodeValue);
                            gl_xml_conf.xml_data.header.B_CODE = getCvtXmlTag(child2.getAttribute("b_code"));
                            gl_xml_conf.xml_data.header.POS_X = getCvtXmlTag(child2.getAttribute("pos_x"));
                            gl_xml_conf.xml_data.header.POS_Y = getCvtXmlTag(child2.getAttribute("pos_y"));

                            if(gl_xml_conf.xml_data.header.B_CODE==""){
                                gl_xml_conf.xml_data.header.B_CODE="B01";
                            }
                        }
                        if(child2.nodeName == "MAP_RESOLUTION"){
                            gl_xml_conf.xml_data.header.MAP_WIDTH = getCvtXmlTag(child2.getAttribute("width"));
                            gl_xml_conf.xml_data.header.MAP_HEIGHT = getCvtXmlTag(child2.getAttribute("height"));
                        }
                        child2 = child2.nextSibling;
                    }

                    ret_code = getCvtXmlTag(gl_xml_conf.xml_data.header.RET_CODE);
                    gl_xml_conf.xml_data.header.RET_CODE = getCvtXmlTag(gl_xml_conf.xml_data.header.RET_CODE);
                    gl_xml_conf.xml_data.header.BRN_CODE = getCvtXmlTag(gl_xml_conf.xml_data.header.BRN_CODE);
                    gl_xml_conf.xml_data.header.KIOSK_PASSWD = getCvtXmlTag(gl_xml_conf.xml_data.header.KIOSK_PASSWD);
                    gl_xml_conf.xml_data.header.KIOSK_ID = getCvtXmlTag(gl_xml_conf.xml_data.header.KIOSK_ID);
                    gl_xml_conf.xml_data.header.KIOSK_CODE = getCvtXmlTag(gl_xml_conf.xml_data.header.KIOSK_CODE);
                    gl_xml_conf.xml_data.header.KIOSK_SECT = getCvtXmlTag(gl_xml_conf.xml_data.header.KIOSK_SECT);
                    gl_xml_conf.xml_data.header.KIOSK_MAP = getCvtXmlTag(gl_xml_conf.xml_data.header.KIOSK_MAP);
                    gl_xml_conf.xml_data.header.KIOSK_TYPE = getCvtXmlTag(gl_xml_conf.xml_data.header.KIOSK_TYPE);

                    gl_xml_conf.xml_data.header.KIOSK_FLOOR = getCvtXmlTag(gl_xml_conf.xml_data.header.KIOSK_FLOOR);

                    gl_xml_conf.xml_data.header.B_CODE = getCvtXmlTag(gl_xml_conf.xml_data.header.B_CODE);
                    if(gl_xml_conf.xml_data.header == "") gl_xml_conf.xml_data.header = "B01";

                    gl_xml_conf.xml_data.header.POS_X = getCvtXmlTag(gl_xml_conf.xml_data.header.POS_X);
                    gl_xml_conf.xml_data.header.POS_Y = getCvtXmlTag(gl_xml_conf.xml_data.header.POS_Y);
                    gl_xml_conf.xml_data.header.URL_REPORT = getCvtXmlTag(gl_xml_conf.xml_data.header.URL_REPORT);
                    gl_xml_conf.xml_data.header.URL_STATUS = getCvtXmlTag(gl_xml_conf.xml_data.header.URL_STATUS);
                    gl_xml_conf.xml_data.header.WALK_SPEED = getCvtXmlTag(gl_xml_conf.xml_data.header.WALK_SPEED);
                    //gl_xml_conf.xml_data.header.URL_PARK = getCvtXmlTag(gl_xml_conf.xml_data.header.URL_PARK);
                    //gl_xml_conf.xml_data.header.URL_WAITING_LIST = getCvtXmlTag(gl_xml_conf.xml_data.header.URL_WAITING_LIST);
                    //gl_xml_conf.xml_data.header.URL_WAITING_INPUT = getCvtXmlTag(gl_xml_conf.xml_data.header.URL_WAITING_INPUT);

                }else if(child1.nodeName == "INTRO_BG_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "INTRO_BG_URL"){
                            if(child2.childNodes[0]!=undefined){
                                child3 = child2.firstChild;
                                gl_xml_conf.xml_data.arr_intro_bg_list = child2.childNodes[0].nodeValue.split(",");
                                //console.log(gl_xml_conf.xml_data.arr_intro_bg_list);
                                child3 = child3.nextSibling;
                            }
                        }
                        //gl_xml_conf.xml_data.arr_order_list = child2.childNodes[0].split(",");
                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "OPERATING_TIME"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "INTRO_LINE1"){
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE1_KOR = child2.getAttribute("kor");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE1_ENG = child2.getAttribute("eng");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE1_CHN = child2.getAttribute("chn");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE1_JPN = child2.getAttribute("jpn");
                        }
                        if(child2.nodeName == "INTRO_LINE2"){
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE2_KOR = child2.getAttribute("kor");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE2_ENG = child2.getAttribute("eng");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE2_CHN = child2.getAttribute("chn");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE2_JPN = child2.getAttribute("jpn");
                        }
                        if(child2.nodeName == "INTRO_LINE3"){
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE3_KOR = child2.getAttribute("kor");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE3_ENG = child2.getAttribute("eng");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE3_CHN = child2.getAttribute("chn");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE3_JPN = child2.getAttribute("jpn");
                        }
                        if(child2.nodeName == "INTRO_LINE4"){
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE4_KOR = child2.getAttribute("kor");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE4_ENG = child2.getAttribute("eng");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE4_CHN = child2.getAttribute("chn");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE4_JPN = child2.getAttribute("jpn");
                        }
                        if(child2.nodeName == "INTRO_LINE5"){
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE5_KOR = child2.getAttribute("kor");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE5_ENG = child2.getAttribute("eng");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE5_CHN = child2.getAttribute("chn");
                            gl_xml_conf.xml_data.time_obj.INTRO_LINE5_JPN = child2.getAttribute("jpn");
                        }
                        if(child2.nodeName == "FOOTER_LINE1"){
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE1_KOR = child2.getAttribute("kor");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE1_ENG = child2.getAttribute("eng");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE1_CHN = child2.getAttribute("chn");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE1_JPN = child2.getAttribute("jpn");
                        }
                        if(child2.nodeName == "FOOTER_LINE2"){
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE2_KOR = child2.getAttribute("kor");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE2_ENG = child2.getAttribute("eng");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE2_CHN = child2.getAttribute("chn");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE2_JPN = child2.getAttribute("jpn");
                        }
                        if(child2.nodeName == "FOOTER_LINE3"){
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE3_KOR = child2.getAttribute("kor");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE3_ENG = child2.getAttribute("eng");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE3_CHN = child2.getAttribute("chn");
                            gl_xml_conf.xml_data.time_obj.FOOTER_LINE3_JPN = child2.getAttribute("jpn");
                        }
                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "SCREEN_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "SCREEN_INFO"){

                            child3 = child2.firstChild;
                            var CObj = new Object();

                            CObj.ID = getCvtXmlTag(child2.getAttribute("id"));
                            CObj.TYPE = getCvtXmlTag(child2.getAttribute("type"));

                            while(child3 != null && child3.nodeType != 4){

                                if(child3.nodeName == "SCH_TYPE"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.SDAY = getCvtXmlTag(child3.getAttribute("sday"));
                                    CObj.EDAY = getCvtXmlTag(child3.getAttribute("eday"));
                                    CObj.STIME = getCvtXmlTag(child3.getAttribute("stime"));
                                    CObj.ETIME = getCvtXmlTag(child3.getAttribute("etime"));
                                }

                                if(child3.nodeName == "SCREEN_NAME") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "FILE_URL"){
                                    str_tmp = child3.childNodes[0].nodeValue + "";
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = str_tmp;
                                    CObj.PTIME = getCvtXmlTag(child3.getAttribute("ptime"));
                                }
                                child3 = child3.nextSibling;
                            }

                            CObj.ID = getCvtXmlTag(CObj.ID);
                            CObj.TYPE = getCvtXmlTag(CObj.TYPE);
                            CObj.SCREEN_NAME = getCvtXmlTag(CObj.SCREEN_NAME);

                            CObj.SCH_TYPE = getCvtXmlTag(CObj.SCH_TYPE);
                            CObj.SDAY = getCvtXmlTag(CObj.SDAY);
                            CObj.EDAY = getCvtXmlTag(CObj.EDAY);
                            CObj.STIME = getCvtXmlTag(CObj.STIME);
                            CObj.ETIME = getCvtXmlTag(CObj.ETIME);

                            CObj.FILE_URL = getCvtXmlTag(CObj.FILE_URL);
                            CObj.PTIME = getCvtXmlNum(CObj.PTIME,10);

                            if(CObj.FILE_URL != ""){
                                gl_xml_conf.xml_data.arr_screen_list.push(CObj);
                            }
                        }
                        child2 = child2.nextSibling;
                    }


                }else if(child1.nodeName == "NOTICE_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "NOTICE_INFO"){

                            child3 = child2.firstChild;
                            var CObj = new Object();

                            CObj.ID = getCvtXmlTag(child2.getAttribute("id"));
                            CObj.TYPE = getCvtXmlTag(child2.getAttribute("type"));

                            while(child3 != null && child3.nodeType != 4){

                                if(child3.nodeName == "SCH_TYPE"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.SDAY = getCvtXmlTag(child3.getAttribute("sday"));
                                    CObj.EDAY = getCvtXmlTag(child3.getAttribute("eday"));
                                    CObj.STIME = getCvtXmlTag(child3.getAttribute("stime"));
                                    CObj.ETIME = getCvtXmlTag(child3.getAttribute("etime"));
                                }

                                if(child3.nodeName == "NOTICE_NAME") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "FILE_URL"){
                                    str_tmp = child3.childNodes[0].nodeValue + "";
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = str_tmp;
                                    CObj.PTIME = getCvtXmlTag(child3.getAttribute("ptime"));
                                }
                                child3 = child3.nextSibling;
                            }

                            CObj.ID = getCvtXmlTag(CObj.ID);
                            CObj.TYPE = getCvtXmlTag(CObj.TYPE);
                            CObj.NOTICE_NAME = getCvtXmlTag(CObj.NOTICE_NAME);

                            CObj.SCH_TYPE = getCvtXmlTag(CObj.SCH_TYPE);
                            CObj.SDAY = getCvtXmlTag(CObj.SDAY);
                            CObj.EDAY = getCvtXmlTag(CObj.EDAY);
                            CObj.STIME = getCvtXmlTag(CObj.STIME);
                            CObj.ETIME = getCvtXmlTag(CObj.ETIME);

                            CObj.FILE_URL = getCvtXmlTag(CObj.FILE_URL);
                            CObj.PTIME = getCvtXmlNum(CObj.PTIME,10);

                            if(CObj.FILE_URL != ""){
                                gl_xml_conf.xml_data.arr_notice_list.push(CObj);
                            }
                        }
                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "ORDER_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "ORDER_INFO"){
                            if(child2.childNodes[0]!=undefined){
                                child3 = child2.firstChild;
                                gl_xml_conf.xml_data.arr_order_list = child2.childNodes[0].nodeValue.split(",");
                                console.log(gl_xml_conf.xml_data.arr_order_list);
                                child3 = child3.nextSibling;
                            }
                        }
                        //gl_xml_conf.xml_data.arr_order_list = child2.childNodes[0].split(",");
                        child2 = child2.nextSibling;
                    }
                    this.setConvNoticeOrder();


                }else if(child1.nodeName == "EVENT_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "EVENT_INFO"){
                            child3 = child2.firstChild;
                            var CObj = new Object();

                            CObj.ID = getCvtXmlTag(child2.getAttribute("id"));
                            CObj.TYPE = getCvtXmlTag(child2.getAttribute("type"));
                            while(child3 != null && child3.nodeType != 4){
                                if(child3.nodeName == "SCH_TYPE"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.SDAY = getCvtXmlTag(child3.getAttribute("sday"));
                                    CObj.EDAY = getCvtXmlTag(child3.getAttribute("eday"));
                                    CObj.STIME = getCvtXmlTag(child3.getAttribute("stime"));
                                    CObj.ETIME = getCvtXmlTag(child3.getAttribute("etime"));
                                }

                                if(child3.nodeName == "EVENT_NAME") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "FILE_URL"){
                                    str_tmp = child3.childNodes[0].nodeValue + "";
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = str_tmp;
                                }
                                child3 = child3.nextSibling;
                            }

                            CObj.NUM = 0;
                            CObj.ID = getCvtXmlTag(CObj.ID);
                            CObj.TYPE = getCvtXmlTag(CObj.TYPE);
                            CObj.EVENT_NAME = getCvtXmlTag(CObj.EVENT_NAME);

                            CObj.SCH_TYPE = getCvtXmlTag(CObj.SCH_TYPE);
                            CObj.SDAY = getCvtXmlTag(CObj.SDAY);
                            CObj.EDAY = getCvtXmlTag(CObj.EDAY);
                            CObj.STIME = getCvtXmlTag(CObj.STIME);
                            CObj.ETIME = getCvtXmlTag(CObj.ETIME);

                            CObj.FILE_URL = getCvtXmlTag(CObj.FILE_URL);
                            if(CObj.FILE_URL != ""){
                                gl_xml_conf.xml_data.arr_event_list.push(CObj);
                            }
                        }

                        child2 = child2.nextSibling;
                    }

                    // else if(child1.nodeName == 'GATE_INFO') {
                    //     child2 = child1.firstChild;
                    //     while(child2 != null && child2.nodeType != 4){
                    //         var CObj = new Object();

                    //         store_list.filter(list => list.id === child2.id){
                    //             child2.KOR_NAME = list.KOR_NAME;
                    //         }
                    //     }
                    // }

                    console.log(child1.nodeName == "GATE_LIST", 'child1.nodeName == "STORE_LIST"')

                }else if(child1.nodeName == "STORE_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "STORE_INFO"){
                            child3 = child2.firstChild;

                            var CObj = new Object();
                            var SubCObj = new Array();

                            CObj.ID = getCvtXmlTag(child2.getAttribute("id"));

                            CObj.TYPE = getCvtXmlTag(child2.getAttribute("type"));
                            CObj.DP_TYPE = getCvtXmlTag(child2.getAttribute("dp_type"));
                            CObj.SAERCH_TYPE = getCvtXmlTag(child2.getAttribute("search_type"));
                            CObj.CLICK = getCvtXmlTag(child2.getAttribute("click"));
                            CObj.AREA_TYPE = getCvtXmlTag(child2.getAttribute("area_type"));

                            while(child3 != null && child3.nodeType != 4){
                                if(child3.nodeName == "GATE_NO") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "CATE_CODE"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.CATE_SUB = getCvtXmlTag(child3.getAttribute("sub_cate"));
                                }
                                if(child3.nodeName == "STORE_NAME_KOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_NAME_ENG") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_NAME_CHN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_NAME_JPN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "STORE_DESC_KOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_DESC_ENG") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_DESC_CHN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_DESC_JPN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "STORE_ITEM_KOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_ITEM_ENG") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_ITEM_CHN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_ITEM_JPN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "STORE_SERVICETIME") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_ORDERTIME") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_BREAKTIME") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "STORE_FLOOR"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                }
                                if(child3.nodeName == "STORE_PHONE") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "WAITING_CODE") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "STORE_LOGO_URL"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue+"";
                                }
                                if(child3.nodeName == "STORE_MAIN_URL"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue+"";
                                }

                                if(child3.nodeName == "STORE_MENU1"){
                                    child4 = child3.firstChild;
                                    while(child4 != null && child4.nodeType != 4){
                                        if(child4.nodeName == "NAME_KOR") if(child4.childNodes[0]) CObj.STORE_MENU_01_NAME_KOR = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "NAME_ENG") if(child4.childNodes[0]) CObj.STORE_MENU_01_NAME_ENG = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "NAME_CHN") if(child4.childNodes[0]) CObj.STORE_MENU_01_NAME_CHN = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "NAME_JPN") if(child4.childNodes[0]) CObj.STORE_MENU_01_NAME_JPN = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "PRICE") if(child4.childNodes[0]) CObj.STORE_MENU_01_PRICE = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "FILE_URL") if(child4.childNodes[0]) CObj.STORE_MENU_01_URL = child4.childNodes[0].nodeValue;
                                        child4 = child4.nextSibling;
                                    }
                                }

                                if(child3.nodeName == "STORE_MENU2"){
                                    child4 = child3.firstChild;
                                    while(child4 != null && child4.nodeType != 4){
                                        if(child4.nodeName == "NAME_KOR") if(child4.childNodes[0]) CObj.STORE_MENU_02_NAME_KOR = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "NAME_ENG") if(child4.childNodes[0]) CObj.STORE_MENU_02_NAME_ENG_NAME_ENG = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "NAME_CHN") if(child4.childNodes[0]) CObj.STORE_MENU_02_NAME_CHN = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "NAME_JPN") if(child4.childNodes[0]) CObj.STORE_MENU_02_NAME_JPN = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "PRICE") if(child4.childNodes[0]) CObj.STORE_MENU_02_PRICE = child4.childNodes[0].nodeValue;
                                        if(child4.nodeName == "FILE_URL") if(child4.childNodes[0]) CObj.STORE_MENU_02_URL = child4.childNodes[0].nodeValue;
                                        child4 = child4.nextSibling;
                                    }
                                }
                                child3 = child3.nextSibling;
                            }

                            CObj.ID = getCvtXmlTag(CObj.ID);
                            CObj.PAGE = 0;
                            CObj.VIEW_SET = 0;
                            CObj.POS_X = 0;
                            CObj.POS_Y = 0;
                            CObj.TYPE = getCvtXmlTag(CObj.TYPE);
                            CObj.DP_TYPE = getCvtXmlTag(CObj.DP_TYPE);
                            CObj.SAERCH_TYPE = getCvtXmlTag(CObj.SAERCH_TYPE);
                            CObj.CLICK = getCvtXmlTag(CObj.CLICK);
                            CObj.GATE_NO = getCvtXmlTag(CObj.GATE_NO);

                            CObj.CATE_CODE = getCvtXmlTag(CObj.CATE_CODE);
                            CObj.CATE_SUB = getCvtXmlTag(CObj.CATE_SUB);
                            CObj.STORE_NAME_KOR = getCvtXmlTag(CObj.STORE_NAME_KOR);
                            CObj.STORE_NAME_ENG = getCvtXmlTag(CObj.STORE_NAME_ENG);
                            CObj.STORE_NAME_CHN = getCvtXmlTag(CObj.STORE_NAME_CHN);
                            CObj.STORE_NAME_JPN = getCvtXmlTag(CObj.STORE_NAME_JPN);

                            CObj.STORE_DESC_KOR = getCvtXmlTag(CObj.STORE_DESC_KOR);
                            CObj.STORE_DESC_ENG = getCvtXmlTag(CObj.STORE_DESC_ENG);
                            CObj.STORE_DESC_CHN = getCvtXmlTag(CObj.STORE_DESC_CHN);
                            CObj.STORE_DESC_JPN = getCvtXmlTag(CObj.STORE_DESC_JPN);

                            CObj.STORE_ITEM_KOR = getCvtXmlTag(CObj.STORE_ITEM_KOR);
                            CObj.STORE_ITEM_ENG = getCvtXmlTag(CObj.STORE_ITEM_ENG);
                            CObj.STORE_ITEM_CHN = getCvtXmlTag(CObj.STORE_ITEM_CHN);
                            CObj.STORE_ITEM_JPN = getCvtXmlTag(CObj.STORE_ITEM_JPN);

                            CObj.STORE_PHONE = getCvtXmlTag(CObj.STORE_PHONE);
                            CObj.WAITING_CODE = getCvtXmlTag(CObj.WAITING_CODE);
                            CObj.STORE_SERVICETIME = getCvtXmlTag(CObj.STORE_SERVICETIME);
                            CObj.STORE_ORDERTIME = getCvtXmlTag(CObj.STORE_ORDERTIME);
                            CObj.STORE_BREAKTIME = getCvtXmlTag(CObj.STORE_BREAKTIME);

                            CObj.STORE_FLOOR = getCvtXmlTag(CObj.STORE_FLOOR);

                            CObj.STORE_NAME_CHO = "";
                            CObj.STORE_SEARCH_ENG = "";

                            CObj.STORE_LOGO_URL = getCvtXmlTag(CObj.STORE_LOGO_URL);
                            CObj.STORE_MAIN_URL = getCvtXmlTag(CObj.STORE_MAIN_URL);
                            gl_xml_conf.xml_data.arr_store_list.push(CObj);
                            // pushFetchData();

                            
                        }
                        
                        // console.log(gl_xml_conf.xml_data.arr_store_list, 'gl_xml_conf.xml_data.arr_store_list')
                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "PUB_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "PUB_INFO"){
                            child3 = child2.firstChild;
                            var CObj = new Object();

                            CObj.ID = getCvtXmlTag(child2.getAttribute("id"));

                            while(child3 != null && child3.nodeType != 4){

                                if(child3.nodeName == "PUB_CODE") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_FLOOR"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.BUILDING = getCvtXmlTag(child3.getAttribute("building"));
                                }
                                if(child3.nodeName == "PUB_TIME") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_PHONE") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "PUB_NAME") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_NAME_ENG") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_NAME_CHN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_NAME_JPN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "PUB_DESC_KOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_DESC_ENG") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_DESC_CHN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_DESC_JPN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "OFFICE_HOURS_KOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "OFFICE_HOURS_ENG") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "OFFICE_HOURS_CHN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "OFFICE_HOURS_JPN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "DABEEO_POI_ID") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;


                                child3 = child3.nextSibling;
                            }

                            CObj.ID = getCvtXmlTag(CObj.ID);
                            CObj.PUB_CODE = getCvtXmlTag(CObj.PUB_CODE);
                            CObj.PUB_FLOOR = getCvtXmlTag(CObj.PUB_FLOOR);
                            CObj.BUILDING = getCvtXmlTag(CObj.BUILDING);
                            CObj.PUB_TIME = getCvtXmlTag(CObj.PUB_TIME);
                            CObj.PUB_PHONE = getCvtXmlTag(CObj.PUB_PHONE);

                            CObj.PUB_NAME = getCvtXmlTag(CObj.PUB_NAME);

                            gl_xml_conf.xml_data.arr_pub_list.push(CObj);
                        }

                        child2 = child2.nextSibling;
                    }




                }else if(child1.nodeName == "BUILDING_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "BUILDING_INFO"){
                            child3 = child2.firstChild;

                            while(child3 != null && child3.nodeType != 4){
                                if(child3.nodeName == "BUILDING_KOR"){
                                    gl_xml_conf.xml_data.arr_building_list.push(child3.childNodes[0].nodeValue+"");
                                }
                                else if(child3.nodeName == "BUILDING_ENG"){
                                    gl_xml_conf.xml_data.arr_building_list.push(child3.childNodes[0].nodeValue+"");
                                }
                                child3 = child3.nextSibling;
                            }
                        }
                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "MAP_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "MAP_INFO"){
                            child3 = child2.firstChild;
                            var CObj = new Object();

                            CObj.FLOOR = getCvtXmlTag(child2.getAttribute("floor"));

                            while(child3 != null && child3.nodeType != 4){

                                if(child3.nodeName == "MAIN_MAP_URL") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "MINI_MAP_URL") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                child3 = child3.nextSibling;
                            }

                            CObj.FLOOR = getCvtXmlTag(CObj.FLOOR);
                            CObj.MAIN_MAP_URL = getCvtXmlTag(CObj.MAIN_MAP_URL);
                            CObj.MINI_MAP_URL = getCvtXmlTag(CObj.MINI_MAP_URL);

                            gl_xml_conf.xml_data.arr_map_list.push(CObj);
                        }

                        child2 = child2.nextSibling;
                    }


                }
            }
            child1 = child1.nextSibling;
        }

    }catch(err){
        ret_code = "FAIL XML Data Error : " + err;
        console.log("XML Parse Error : " + err);
    }

    if(ret_code == "SUCC"){
        setLoadRouteContents();
    }else{
        setInitSetting(ret_code);
    }
}

// pushFetchData();

function setConvNoticeOrder(){
    var n_list = gl_xml_conf.xml_data.arr_notice_list;
    var o_list = gl_xml_conf.xml_data.arr_order_list;
    var t_list = [];

    for(var i=0;i<o_list.length;i+=1){
        for(var j=0;j<n_list.length;j+=1){
            if(o_list[i] == n_list[j].ID){
                //console.log(n_list[j].FILE_URL);
                t_list.push(n_list[j]);
            }
        }
    }
    gl_xml_conf.xml_data.arr_notice_list = t_list;
}

function setLoadRouteContents(){
    var xhr;
    var m_this = this;

    if (window.XMLHttpRequest){ xhr = new XMLHttpRequest();
    }else{ xhr = new ActiveXObject("Microsoft.XMLHTTP"); }

    xhr.onreadystatechange = function(){
        if (xhr.readyState != 4){ return; }
        // 성공을 했다.
        if(xhr.status == 200){
            var xml_doc = xhr.responseXML;
            onReadXmlRouteContents(xml_doc);
        }else{

        }
    };
    xhr.open("GET",gl_xml_conf.url_route,true);
    xhr.send();
}

function onReadXmlRouteContents(p_xml_doc){
    var ret_code = "FAIL";

    gl_xml_conf.xml_route.header = new Object();
    gl_xml_conf.xml_route.arr_node_list = new Array();
    gl_xml_conf.xml_route.arr_store_list = new Array();
    gl_xml_conf.xml_route.arr_pub_list = new Array();
    gl_xml_conf.xml_route.arr_shape_list = new Array();
    gl_xml_conf.xml_route.arr_park_list = new Array();

    try{

        var root_node = p_xml_doc.getElementsByTagName("KIOSK")[0];
        if(!root_node){
            setInitSetting("FAIL ROUTE");
            return;
        }

        var i = 0;
        var str_tmp = "";
        var child1 = root_node.firstChild;
        var child2;
        var child3;

        while(child1 != null && child1.nodeType != 4){

            if(child1.nodeType == 1){

                if(child1.nodeName == "HEADER"){

                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "RET_CODE"){
                            ret_code = this.getCvtXmlTag(child2.childNodes[0].nodeValue);
                        }
                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "STORE_LIST"){

                    child2 = child1.firstChild;

                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "STORE_INFO"){
                            child3 = child2.firstChild;

                            var CObj = new Object();
                            CObj.ID = this.getCvtXmlTag(child2.getAttribute("id"));
                            CObj.AREA_TYPE = this.getCvtXmlTag(child2.getAttribute("area_type"));
                            while(child3 != null && child3.nodeType != 4){

                                if(child3.nodeName == "CATE_CODE"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.CATE_SUB = getCvtXmlTag(child3.getAttribute("sub_cate"));
                                }

                                if(child3.nodeName == "STORE_NAME_KOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_NAME_ENG") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_NAME_CHN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "STORE_NAME_JPN") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "FONT_COLOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "FONT_SIZE") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "STORE_FLOOR"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.POS_X = this.getCvtXmlTag(child3.getAttribute("pos_x"));
                                    CObj.POS_Y = this.getCvtXmlTag(child3.getAttribute("pos_y"));
                                }
                                if(child3.nodeName == "GATE_POS_X") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "GATE_POS_Y") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                
                                if(child3.nodeName == "GATE_NO") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                // if(child3.nodeName == "AREA_TYPE") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                child3 = child3.nextSibling;
                            }

                            CObj.ID = this.getCvtXmlTag(CObj.ID);
                            CObj.CATE_CODE = getCvtXmlTag(CObj.CATE_CODE);
                            CObj.CATE_SUB = getCvtXmlTag(CObj.CATE_SUB);

                            CObj.STORE_NAME_KOR = this.getCvtXmlTag(CObj.STORE_NAME_KOR);
                            CObj.STORE_NAME_ENG = this.getCvtXmlTag(CObj.STORE_NAME_ENG);
                            CObj.STORE_NAME_CHN = this.getCvtXmlTag(CObj.STORE_NAME_CHN);
                            CObj.STORE_NAME_JPN = this.getCvtXmlTag(CObj.STORE_NAME_JPN);
                            CObj.FONT_COLOR = this.getCvtXmlTag(CObj.FONT_COLOR);
                            CObj.FONT_SIZE = this.getCvtXmlNum(CObj.FONT_SIZE,30);
                            CObj.STORE_FLOOR = this.getCvtXmlTag(CObj.STORE_FLOOR);
                            CObj.POS_X = this.getCvtXmlNum(CObj.POS_X,0);
                            CObj.POS_Y = this.getCvtXmlNum(CObj.POS_Y,0);
                            CObj.GATE_POS_X = this.getCvtXmlTag(CObj.GATE_POS_X);
                            CObj.GATE_POS_Y = this.getCvtXmlTag(CObj.GATE_POS_Y);
                            
                            CObj.GATE_NO = this.getCvtXmlTag(CObj.GATE_NO);
                            CObj.AREA_TYPE = this.getCvtXmlTag(CObj.AREA_TYPE);

                            gl_xml_conf.xml_route.arr_store_list.push(CObj);
                        }

                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "PUB_LIST"){

                    child2 = child1.firstChild;

                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "PUB_INFO"){
                            child3 = child2.firstChild;

                            var CObj = new Object();

                            CObj.ID = this.getCvtXmlTag(child2.getAttribute("id"));
                            CObj.STATUS = this.getCvtXmlTag(child2.getAttribute("status"));
                            CObj.AREA = this.getCvtXmlTag(child2.getAttribute("area"));
                            CObj.SECT = this.getCvtXmlTag(child2.getAttribute("sect"));
                            CObj.MOVE_FLOOR = this.getCvtXmlTag(child2.getAttribute("floor"));

                            while(child3 != null && child3.nodeType != 4){
                                if(child3.nodeName == "PUB_ID") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "PUB_CODE") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "PUB_FLOOR"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.POS_X = this.getCvtXmlTag(child3.getAttribute("pos_x"));
                                    CObj.POS_Y = this.getCvtXmlTag(child3.getAttribute("pos_y"));
                                }
                                child3 = child3.nextSibling;
                            }

                            CObj.ID = this.getCvtXmlTag(CObj.ID);
                            CObj.STATUS = this.getCvtXmlTag(CObj.STATUS);
                            CObj.AREA = this.getCvtXmlTag(CObj.AREA);
                            CObj.SECT = this.getCvtXmlTag(CObj.SECT);
                            CObj.MOVE_FLOOR = this.getCvtXmlTag(CObj.MOVE_FLOOR);

                            CObj.PUB_ID = this.getCvtXmlTag(CObj.PUB_ID);
                            CObj.B_CODE = this.getCvtXmlTag(CObj.B_CODE);
                            CObj.PUB_FLOOR = this.getCvtXmlTag(CObj.PUB_FLOOR);
                            CObj.POS_X = this.getCvtXmlNum(CObj.POS_X,0);
                            CObj.POS_Y = this.getCvtXmlNum(CObj.POS_Y,0);

                            if(CObj.POS_X != 0 && CObj.POS_Y != 0){
                                gl_xml_conf.xml_route.arr_pub_list.push(CObj);
                            }
                        }
                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "SHAPE_LIST"){

                    child2 = child1.firstChild;

                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "SHAPE_INFO"){
                            child3 = child2.firstChild;

                            var CObj = new Object();

                            CObj.ID = this.getCvtXmlTag(child2.getAttribute("id"));
                            CObj.TYPE = this.getCvtXmlTag(child2.getAttribute("type"));

                            while(child3 != null && child3.nodeType != 4){
                                if(child3.nodeName == "POINTS_X") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "POINTS_Y") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "IMG_URL") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "FILL_COLOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "LINE_COLOR") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                if(child3.nodeName == "LINE_THICK") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "SHAPE_TEXT"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.ALIGN = this.getCvtXmlTag(child3.getAttribute("align"));
                                    CObj.FONT_SIZE = this.getCvtXmlTag(child3.getAttribute("font_size"));
                                }

                                if(child3.nodeName == "SHAPE_FLOOR"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.POS_X = this.getCvtXmlTag(child3.getAttribute("pos_x"));
                                    CObj.POS_Y = this.getCvtXmlTag(child3.getAttribute("pos_y"));
                                    CObj.WIDTH = this.getCvtXmlTag(child3.getAttribute("width"));
                                    CObj.HEIGHT = this.getCvtXmlTag(child3.getAttribute("height"));
                                    CObj.ANGLE = this.getCvtXmlTag(child3.getAttribute("angle"));
                                }
                                child3 = child3.nextSibling;
                            }


                            CObj.ID = this.getCvtXmlTag(CObj.ID);
                            CObj.TYPE = this.getCvtXmlTag(CObj.TYPE);
                            CObj.POINTS_X = this.getCvtXmlTag(CObj.POINTS_X);
                            CObj.POINTS_Y = this.getCvtXmlTag(CObj.POINTS_Y);
                            CObj.IMG_URL = this.getCvtXmlTag(CObj.IMG_URL);

                            CObj.FILL_COLOR = this.getCvtXmlTag(CObj.FILL_COLOR);
                            CObj.LINE_COLOR = this.getCvtXmlTag(CObj.LINE_COLOR);
                            CObj.LINE_THICK = this.getCvtXmlTag(CObj.LINE_THICK);

                            CObj.SHAPE_TEXT = this.getCvtXmlTag(CObj.SHAPE_TEXT);
                            CObj.ALIGN = this.getCvtXmlTag(CObj.ALIGN);
                            CObj.FONT_SIZE = this.getCvtXmlTag(CObj.FONT_SIZE);

                            CObj.SHAPE_FLOOR = this.getCvtXmlTag(CObj.SHAPE_FLOOR);
                            CObj.POS_X = this.getCvtXmlNum(CObj.POS_X,0);
                            CObj.POS_Y = this.getCvtXmlNum(CObj.POS_Y,0);
                            CObj.WIDTH = this.getCvtXmlNum(CObj.WIDTH,0);
                            CObj.HEIGHT = this.getCvtXmlNum(CObj.HEIGHT,0);
                            CObj.ANGLE = this.getCvtXmlNum(CObj.ANGLE,0);

                            gl_xml_conf.xml_route.arr_shape_list.push(CObj);
                        }

                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "NODE_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "NODE_INFO"){
                            child3 = child2.firstChild;
                            var CObj = new Object();
                            CObj.FLOOR = this.getCvtXmlTag(child2.getAttribute("floor"));
                            CObj.POS_X1 = this.getCvtXmlNum(child2.getAttribute("x1"),0);
                            CObj.POS_X2 = this.getCvtXmlNum(child2.getAttribute("x2"),0);
                            CObj.POS_Y1 = this.getCvtXmlNum(child2.getAttribute("y1"),0);
                            CObj.POS_Y2 = this.getCvtXmlNum(child2.getAttribute("y2"),0);
                            CObj.DIRECTION = this.getCvtXmlTag(child2.getAttribute("direction"));
                            CObj.WEIGHT = this.getCvtXmlNum(child2.getAttribute("weight"));
                            CObj.STIME = this.getCvtXmlTag(child2.getAttribute("stime"));
                            CObj.ETIME = this.getCvtXmlTag(child2.getAttribute("etime"));

                            CObj.POS_X1 = this.getCvtXmlNum(CObj.POS_X1,-1);
                            CObj.POS_X2 = this.getCvtXmlNum(CObj.POS_X2,-1);
                            CObj.POS_Y1 = this.getCvtXmlNum(CObj.POS_Y1,-1);
                            CObj.POS_Y2 = this.getCvtXmlNum(CObj.POS_Y2,-1);

                            gl_xml_conf.xml_route.arr_node_list.push(CObj);
                        }

                        child2 = child2.nextSibling;
                    }

                }else if(child1.nodeName == "PARK_LIST"){
                    child2 = child1.firstChild;
                    while(child2 != null && child2.nodeType != 4){
                        if(child2.nodeName == "PARK_INFO"){

                            child3 = child2.firstChild;

                            var CObj = new Object();

                            CObj.ID = this.getCvtXmlTag(child2.getAttribute("id"));

                            while(child3 != null && child3.nodeType != 4){

                                if(child3.nodeName == "PARK_CODE") if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;

                                if(child3.nodeName == "PARK_FLOOR"){
                                    if(child3.childNodes[0]) CObj[child3.nodeName] = child3.childNodes[0].nodeValue;
                                    CObj.POS_X = this.getCvtXmlTag(child3.getAttribute("pos_x"));
                                    CObj.POS_Y = this.getCvtXmlTag(child3.getAttribute("pos_y"));
                                }

                                child3 = child3.nextSibling;
                            }

                            CObj.PARK_CODE = this.getCvtXmlTag(CObj.PARK_CODE);
                            CObj.PARK_FLOOR = this.getCvtXmlTag(CObj.PARK_FLOOR);

                            CObj.POS_X = this.getCvtXmlNum(CObj.POS_X,0);
                            CObj.POS_Y = this.getCvtXmlNum(CObj.POS_Y,0);

                            gl_xml_conf.xml_route.arr_park_list.push(CObj);
                        }

                        child2 = child2.nextSibling;
                    }

                }  // END LIST
            }

            child1 = child1.nextSibling;
        }
    }catch(err){
        ret_code = "FAIL XML ROUTE ERROR : " + err;
    }

    setInitSetting(ret_code);
}

// function setLoadContents(p_url)
function setLoadLanguage(p_url){
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState != 4){
            return;
        }
        //데이터가 확실하게 들어왔을 때 데이터 바인딩 시작
        if(xhr.status == 200) {

            var xml_doc = JSON.parse(this.response);
            // var xml_doc = this.response;
            if(typeof gl_jsop_lang_data !== 'undefined'){
                console.log("setLoadLanguage OK");
                var json_obj = xml_doc;

                if( typeof(setInitSettingLang) == 'function'){
                    setInitSettingLang(json_obj);
                }
            }
        }else{
            console.log("fail");
        }
    }
    xhr.open("GET", p_url,true);
    xhr.send();
}

// function pushFetchData() {
//     let url = 'xml/kiosk_flight.json';
//     let store_list = gl_xml_conf.xml_data.arr_store_list;

//     fetch(url)
//         .then(response => response.json())
//         .then(jsonData => {
//             let flight = jsonData.gate_list.gate_info;
            
//             store_list.forEach(store => {
//                 flight.forEach(gate => {
//                     if(store.ID === gate.id) {
//                         store.GATE_NO = gate.no;
//                     }
//                 })
//             })
//             // gl_xml_conf.xml_data.arr_store_list.push(gateNo);
//             // console.log(gl_xml_conf.xml_data.arr_store_list, 'gl_xml_conf.xml_data.arr_store_list')
//         })

//         .catch(error => console.error('Error fetching data:', error));
// }