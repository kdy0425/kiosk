<%-- Created by IntelliJ IDEA. User: eltov Date: 2024-03-15 Time: 오후 1:33 To change this template use File | Settings |
  File Templates. --%>
  <%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <style>
      :root {
        --width: 100%;
        --height: 100%;
        --map-height: 1480px;
        --main-color: #456ADB;
        --main-txt-color: #000;
      }

      html,
      body {
        width: var(--width);
        font-family: "NanumSquareNeo", "NotoSansCJK", sans-serif !important;
        font-size: 62.5%;
        background-color: #ffffff;
        color: var(--main-txt-color);
        overflow: hidden;
        touch-action: none;
        font-weight: 500;
      }

      /* 폰트 */
      @font-face {
        font-family: 'NotoSansCJK';
        src: url(${tsctx}/resources/common/font/NotoSansCJKkr-Bold.woff2) format('woff2');
        font-weight: 700;
      }

      @font-face {
        font-family: 'NotoSansCJK';
        src: url(${tsctx}/resources/common/font/NotoSansCJKkr-Medium.woff2) format('woff2');
        font-weight: 500;
      }

      @font-face {
        font-family: 'NotoSansCJK';
        src: url(${tsctx}/resources/common/font/NotoSansCJKkr-Regular.woff2) format('woff2');
        font-weight: 400;
      }

      @font-face {
        font-family: 'NotoSansCJK';
        src: url(${tsctx}/resources/common/font/NotoSansCJKkr-Light.woff2) format('woff2');
        font-weight: 300;
      }

      @font-face {
        font-family: 'NotoSansCJK';
        src: url(${tsctx}/resources/common/font/NotoSansCJKkr-Light.woff2) format('woff2');
        font-weight: 200;
      }

      @font-face {
        font-family: 'NotoSansCJK';
        src: url(${tsctx}/resources/common/font/NotoSansCJKkr-Thin.woff2) format('woff2');
        font-weight: 100;
      }

      @font-face {
        font-family: 'NanumSquareNeo';
        src: url(${tsctx}/resources/common/font/NanumSquareNeoTTF-aLt.woff2) format('woff2');
        font-weight: 300;
      }

      @font-face {
        font-family: 'NanumSquareNeo';
        src: url(${tsctx}/resources/common/font/NanumSquareNeoTTF-bRg.woff2) format('woff2');
        font-weight: 400;
      }

      @font-face {
        font-family: 'NanumSquareNeo';
        src: url(${tsctx}/resources/common/font/NanumSquareNeoTTF-cBd.woff2) format('woff2');
        font-weight: 700;
      }

      @font-face {
        font-family: 'NanumSquareNeo';
        src: url(${tsctx}/resources/common/font/NanumSquareNeoTTF-dEb.woff2) format('woff2');
        font-weight: 800;
      }

      @font-face {
        font-family: 'NanumSquareNeo';
        src: url(${tsctx}/resources/common/font/NanumSquareNeoTTF-eHv.woff2) format('woff2');
        font-weight: 900;
      }

      #pop_map .hidden {
        display: none;
      }

      #pop_map button {
        background: none;
        border: none;
      }

      #pop_map .hidden {
        visibility: hidden;
      }

      #new_map_wrap {
        position: relative;
        width: 100%;
        height: 100%;
        background: rgb(34, 44, 54);
      }

      #pop_map section {
        width: 100%;
        height: var(--map-height);
      }

      #pop_map .map_wrap {
        position: relative;
        width: 100%;
        height: 1894px;
      }

      #pop_map .floor_title_area {
        position: absolute;
        top: 100px;
        left: 100px;
      }

      #pop_map .floor_title_area h2 {
        font-size: 15rem;
        line-height: 1;
        padding-bottom: 20px;
      }

      #pop_map .title span {
        font-size: 60px;
      }

      #pop_map .footer_box {
        position: relative;
        display: flex;
        justify-content: space-between;
        width: var(--width);
        height: 160px;
        bottom: -254px;
        background-color: #fff;
      }

      #pop_map .floor_lnb {
        position: relative;
        width: var(--width);
        height: 160px;
      }

      #pop_map .floor_lnb>div {
        width: 100%;
        padding: 0 5rem;
        border-top: 1px solid #DBDBDB;
        box-sizing: border-box;
        background: linear-gradient(to right, #0C142A 0%, #263156 45%, #0C142A 100%);
      }

      #pop_map .depth1 {
        height: 160px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      #pop_map .depth2 {
        height: 120px;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 160px;
      }

      #pop_map .depth3 {
        height: 120px;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 260px;
      }

      #pop_map .depth2 nav,
      #pop_map .depth3 nav {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        box-sizing: border-box;
      }

      #pop_map .depth2 nav ul,
      #pop_map .depth3 nav ul {
        display: flex;
        column-gap: 30px;
      }

      #pop_map .depth2 nav ul li button,
      #pop_map .depth3 nav ul li button {
        font-size: 3rem;
        height: 70px;
        padding: 0 20px;
        color: #7E9CF9;
        font-weight: 700;
        line-height: 1;

      }

      #pop_map .depth2 nav ul li button.active {
        padding: 0 20px;
        color: #fff;
        background: linear-gradient(135deg, #8298DE, #7D9CFC);
        border: 2px solid #fff;
        border-radius: 1000px;
        font-weight: 800;
      }

      #pop_map .depth3 nav ul li button {
        border-radius: 1000px;
      }

      #pop_map .depth3 nav ul li button.active {
        background-color: #1E2848;
        color: #fff;
        box-shadow: 0 0 20px rgba(0, 0, 0, .8);
        border: 2px solid #7E9CF9;
        font-weight: 800;
      }

      #pop_map #divZone,
      #pop_map #divFloor {
        font-size: 0;
      }

      #pop_map #divZone {
        padding-right: 50px;
      }

      #pop_map #divZone button {
        width: 200px;
        height: 80px;
        background-color: #2C3963;
        font-size: 3.4rem;
        font-weight: 700;
        color: #8892AE;
        border-radius: 1000px;
        border: 5px solid #3E4E80;
      }

      #pop_map #divZone button+button {
        margin-left: 20px;
      }

      #pop_map #divZone button.active {
        background-color: #fff;
        border-color: #7D9CFB;
        color: #7E9CF9;
      }

      #pop_map #divFloor {
        padding-left: 50px;
        border-left: 2px solid #31416E;
      }

      #pop_map #divFloor button {
        position: relative;
        display: inline-block;
        width: 120px;
        height: 120px;
        background: linear-gradient(135deg, #8298DE, #7D9CFC);
        border-radius: 50%;
      }

      #pop_map #divFloor button span {
        display: inline-block;
        width: 100px;
        height: 100px;
        line-height: 100px;
        background-color: #fff;
        border-radius: 50%;
        color: #456ADB;
        font-size: 3.4rem;
        font-weight: 900;
      }

      #pop_map #divFloor button+button {
        margin-left: 20px;
      }

      #pop_map #divFloor button.active {
        background: #fff;
      }

      #pop_map #divFloor button.active span {
        background: linear-gradient(135deg, #8298DE, #7D9CFC);
        color: #fff;
      }

      #pop_map .floor_category_area {
        position: absolute;
        width: 540px;
        height: 445px;
        top: 50px;
        right: 50px;
        background-color: #fff;
        border-radius: 50px;
        border: 3px solid #778093;
        box-sizing: border-box;
        overflow: hidden;
        z-index: 10;
      }

      #pop_map .floor_category_area .category_title_area {
        height: 100px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #ffffff;
        padding: 0 30px;
        border-bottom: 3px solid #778093;
        border-radius: 50px;
        box-sizing: border-box;
      }

      #pop_map .floor_category_area .category_title_area.open {}

      #pop_map .floor_category_area .category_title_area h3 {
        font-size: 4rem;
        font-weight: 900;
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      #pop_map .floor_category_area .category_title_area button {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 75px;
        height: 75px;
        font-weight: 700;
        box-shadow: 0 3px 5px rgba(0, 0, 0, .16);
        border-radius: 20px;
        border: 2.5px solid #E2E3E6;
      }

      #pop_map .floor_category_area .category_title_area button img {
        width: auto;
        display: block;
      }

      #pop_map .floor_category_area .category_title_area.open button img {
        transform: rotate(180deg);
      }

      #pop_map .floor_category_area .category_result {
        width: 100%;
        height: 350px;
        overflow-y: auto;
        background-color: #ffffff;
      }

      #pop_map .floor_category_area .category_result li {
        width: 100%;
        height: 87.5px;
        line-height: 87.5px;
        padding: 0 30px;
        box-sizing: border-box;
      }

      #pop_map .floor_category_area .category_result li+li {
        border-top: 1px solid #DBDBDB;
      }

      #pop_map .floor_category_area .category_result li button {
        width: 100%;
        height: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        text-align: left;
        font-size: 3rem;
        font-weight: 700;
        padding-right: 6rem;
        background-image: url('${tsctx}/resources/images/newmap/search.svg');
        background-position: right center;
        background-size: 40px;
        background-repeat: no-repeat;
      }

      #pop_map .floor_category_area .category_result li.active button {
        color: var(--main-color);
        background-image: url('${tsctx}/resources/images/newmap/search_active.svg');
      }

      #pop_map .aside_box .floor_pub_area {
        position: absolute;
        right: 50px;
        bottom: 420px;
        z-index: 10;
      }

      #pop_map .aside_box .floor_pub_area ul {
        width: 108px;
        border-radius: 40px;
        margin: 20px 0;
        overflow: hidden;
      }

      #pop_map .aside_box .floor_pub_area button {
        background-color: #374A81;
      }

      #pop_map .aside_box .floor_pub_area button.active {
        background: linear-gradient(135deg, #8298DE, #7D9CFC);
        color: #fff;
      }

      #pop_map .aside_box .floor_pub_area ul li:not(:last-child) {
        border-bottom: 1px solid #DBDBDB;
      }

      #pop_map .aside_box .floor_pub_area ul li button {
        width: 100%;
        padding: 25px 0;
      }

      #pop_map .aside_box .floor_pub_area ul li button img {
        width: 58px;
        height: 58px;
        display: block;
        margin: 0 auto;
        padding-bottom: 4px;
      }

      #pop_map .aside_box #storeListBtn,
      #pop_map .aside_box #currentBtn {
        width: 100%;
        height: 108px;
        border-radius: 40px;
      }

      #pop_map #storeListBtn {
        width: 110px;
        height: 120px;
        border-radius: 40px;
        background-color: #374A81;
      }
    </style>

    <div id="new_map_wrap" class="map_ko_KR">
      <section>
        <div class="map_wrap">
          <div class="floor_title_area">
          </div>
          <div id="map" style="width: 100%; height: 100%;">
            <iframe id="map-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              src="http://10.4.208.71/kiosk/floor.html?kiosk_code=${computerUsid}"
              style="width: 100%; height: 100%"></iframe>
          </div>
        </div>
      </section>

      <footer class="base_ui">
        <div class="footer_box">
          <div class="floor_lnb">
            <div class="depth1">
              <div class="area_list">
                <nav class="btn-list lang-change" id="divZone" data-type="area">
                  <button class="active" data-area="D" data-lang-ko="일반구역" data-lang-en="General" data-lang-ja="一般"
                    data-lang-zh="一般">
                    일반구역
                  </button>
                  <button data-area="F" data-lang-ko="면세구역" data-lang-en="Duty Free" data-lang-ja="免税"
                    data-lang-zh="免税">
                    면세구역</button>
                </nav>
              </div>
              <div class="floor_list">
                <nav id="divFloor" class="btn-list" data-type="floor">
                  <button data-id="P03B1D" data-floor="B1"><span>B1</span></button>
                  <button data-id="P03F1D" data-floor="F1"><span>1F</span></button>
                  <button data-id="P03F2D" data-floor="F2"><span>2F</span></button>
                  <button data-id="P03F3D" data-floor="F3"><span>3F</span></button>
                  <button data-id="P03F4D" data-floor="F4"><span>4F</span></button>
                  <button data-id="P03F5D" data-floor="F5"><span>5F</span></button>
                </nav>
              </div>
            </div>

            <div class="depth2">
              <nav class="big_cate_list" data-type="bigCate">
                <ul class="btn-list lang-change">
                </ul>
              </nav>
            </div>

            <div class="depth3">
              <nav class="mid_cate_list" data-type="midCate">
                <ul class="btn-list lang-change">
                </ul>
              </nav>
            </div>
          </div>

        </div>
        <div class="place_list"></div>
      </footer>

      <aside>
        <div class="aside_box">
          <div class="store_wrap">
            <div class="floor_category_area">
              <div class="category_title_area open">
                <h3 class="category_title"></h3>
                <button class="store_show"><img src="${tsctx}/resources/images/newmap/arrow_down.svg"
                    alt="숨김" /></button>
              </div>
              <div class="store_list">
                <ul class="category_result btn-list lang-change" data-type="store"></ul>
              </div>
            </div>
          </div>
          <div class="floor_pub_area">
            <button class="store_popup" id="storeListBtn">
              <img src="${tsctx}/resources/images/newmap/menu.svg" alt="펼쳐 보기">
            </button>

            <ul id="ulPub" class="facility">
              <li>
                <button data-id="0000H" data-mid="10902" data-type="aed">
                  <img src="${tsctx}/resources/images/newmap/pubIcon/aed.png" alt="AED">
                </button>
              </li>
              <li>
                <button data-id="0000Z" data-mid="10904" data-type="infant" data-lang-ko="유아휴게실"
                  data-lang-en="Infant&lt;br /&gt;lounge" data-lang-ja="幼児休憩室" data-lang-zh="母乳室">
                  <img src="${tsctx}/resources/images/newmap/pubIcon/nursery.png" alt="유아휴게실">
                </button>
              </li>
              <li>
                <button data-id="0000V" data-mid="10903" data-type="smoke" data-lang-ko="흡연실" data-lang-en="smoking"
                  data-lang-ja="喫煙室" data-lang-zh="吸烟室">
                  <img src="${tsctx}/resources/images/newmap/pubIcon/smoke.png" alt="흡연실">
                </button>
              </li>
              <li>
                <button data-id="0000U" data-mid="10901" data-type="toilet" data-lang-ko="화장실" data-lang-en="restroom"
                  data-lang-ja="トイレ" data-lang-zh="卫生间">
                  <img src="${tsctx}/resources/images/newmap/pubIcon/wc.png" alt="화장실">
                </button>
              </li>
            </ul>

            <div class="location">
              <button id="currentBtn" data-type="location">
                <img src="${tsctx}/resources/images/newmap/current.svg" alt="현재 위치">
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- <div id="new_map_wrap" class="map_ko_KR">
  <section>
    <div class="map_wrap">
      <div id="map" style="width: 100%; height: 100%">
        <iframe
          id="map-frame"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          src="http://10.4.208.71/kiosk/floor.html?kiosk_code=${computerUsid}"
          style="width: 100%; height: 100%"
        ></iframe>
      </div>
    </div>
  </section>

  <footer class="base_ui">
    <div class="footer_box">
      <div class="big_cate_list">
        <nav>
          <ul class="btn-list lang-change" data-type="bigCate">
          </ul>
        </nav>
      </div>
      <div class="mid_cate_list hidden">
        <nav>
          <ul class="btn-list lang-change" data-type="midCate">
          </ul>
        </nav>
      </div>
      <div class="f_bot">
        <div class="area_list">
          <ul id="divZone" class="btn-list lang-change" data-type="area">
            <li class="active">
              <button
                data-area="D"
                data-lang-ko="일반"
                data-lang-en="General"
                data-lang-ja="一般"
                data-lang-zh="一般"
              >
                일반
              </button>
            </li>
            <li>
              <button
                data-area="F"
                data-area="D"
                data-lang-ko="면세"
                data-lang-en="Duty Free"
                data-lang-ja="免税"
                data-lang-zh="免税"
              >
                면세
              </button>
            </li>
          </ul>
        </div>
        <div class="floor_list">
          <ul id="divFloor" class="btn-list" data-type="floor">
            <li>
              <button data-id="P03B1D" data-floor="B1">B1</button>
            </li>
            <li><button data-id="P03F1D" data-floor="F1">1F</button></li>
            <li><button data-id="P03F2D" data-floor="F2">2F</button></li>
            <li><button data-id="P03F3D" data-floor="F3">3F</button></li>
            <li><button data-id="P03F4D" data-floor="F4">4F</button></li>
            <li><button data-id="P03F5D" data-floor="F5">5F</button></li>
          </ul>
        </div>

        <div class="place_list hidden">
          <ul class="btn-list lang-change" data-type="place">
            <li class="active"><button data-place="P03">T2</button></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>

  <aside>
    <div class="aside_box">
      <div class="store_wrap">
        <div
          class="store_show btn-list lang-change hidden"
          data-type="storeShow"
        >
        <button>
          <img
                src="${tsctx}/resources/images/newmap/icon_list.png"
                alt="현재 위치"
              />

        </button>
        </div>
        <div class="store_wrap hidden">
          <div class="store_title open">
            <h3></h3>
            <button>
              <img
                src="${tsctx}/resources/images/newmap/arrow_down.svg"
                alt="숨김"
              />
            </button>
          </div>
          <div class="store_list">
            <ul class="btn-list lang-change" data-type="store">
            </ul>
          </div>
        </div>
      </div>
      <div class="btn_wrap">
        <div class="facility">
          <ul class="btn-list lang-change" data-type="facility">
            <li>
              <button data-id="0000H" data-type="aed">
                <img
                  src="${tsctx}/resources/images/newmap/pubIcon/aed.svg"
                  alt="AED"
                />
              </button>
            </li>
            <li>
              <button
                data-id="0000Z"
                data-type="infant"
                data-lang-ko="유아휴게실"
                data-lang-en="Infant<br />lounge"
                data-lang-ja="幼児休憩室"
                data-lang-zh="母乳室"
              >
                <img
                  src="${tsctx}/resources/images/newmap/pubIcon/nursery.svg"
                  alt="INFANT"
                />
              </button>
            </li>
            <li>
              <button
                data-id="0000V"
                data-type="smoke"
                data-lang-ko="흡연실"
                data-lang-en="smoking"
                data-lang-ja="喫煙室"
                data-lang-zh="吸烟室"
              >
                <img
                  src="${tsctx}/resources/images/newmap/pubIcon/smoke.svg"
                  alt="SMOKE"
                />
              </button>
            </li>
            <li>
              <button
                data-id="0000U"
                data-type="toilet"
                data-lang-ko="화장실"
                data-lang-en="restroom"
                data-lang-ja="トイレ"
                data-lang-zh="卫生间"
              >
                <img
                  src="${tsctx}/resources/images/newmap/pubIcon/wc.svg"
                  alt="TOILET"
                />
              </button>
            </li>
          </ul>
          <div class="location">
            <button id="currentLocation" data-type="location">
              <img
                src="${tsctx}/resources/images/newmap/pubIcon/location.png"
                alt="현재 위치"
              />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  </aside>
</div> -->

    <script type="text/javascript">
      console.log('#pop_map');
      const frameMapLoader = {
        iframe: document.getElementById("map-frame").contentWindow,
        selector: {
          baseUI: $("#pop_map .base_ui"),
          storeHide: $("#pop_map .category_title"),
          storeShow: $("#pop_map .store_show"),
          store: $("#pop_map .store_list"),
          facility: $("#pop_map .facility li"),
          location: $("#pop_map .location"),
          place: $("#pop_map .place_list"),
          area: $("#pop_map .area_list"),
          floor: $("#pop_map .floor_list"),
          // div > ul > li -> div > nav > button 
          bigCate: $("#pop_map .big_cate_list"),
          // div > nav > ul -> div > nav > ul
          midCate: $("#pop_map .mid_cate_list"),
          // div > nav > ul -> div > nav > ul
        },
        baseUIData: [],
        cateList: [],
        storeList: [],
        noStoreMidCate: ["0000H", "0000Z", "0000V", "0000U"],
        lang: {
          type: ["ko_KR", "en_US", "ja_JP", "zh_CN"],
          num: 0,
          storeNms: ["nameKr", "nameEn", "nameJp", "nameCn"],
        },
        current: {
          place: "P03",
          area: "",
          floor: "",
          baseUIDataIndex: 0,
          baseUIFloorId: "",
          floorCate: [],
          bigCateIndex: -1,
          midCate: [],
        },
        init: function () {
          let deviceInfo = apg.intro.data.deviceInfo;

          this.baseUIData = [];
          this.cateList = [];
          this.storeList = [];

          this.current.place = deviceInfo.terminalId;
          this.current.area = deviceInfo.location;
          this.current.floor = deviceInfo.floor;
          this.current.baseUIDataIndex = 0;
          this.current.baseUIFloorId = "";
          this.current.floorCate = [];
          this.current.bigCateIndex = -1;
          this.current.midCate = [];

          $("#pop_map .store_wrap").css('display', 'none');
          $("#pop_map .store_popup").css('display', 'none');

          this.event();
          this.langCheck();
          this.dataLoad();

          if ($("#introLoadingPopup").length > 0) {
            $("#introLoadingPopup").css("display", "none");
            $("#introLoadingPopup").hide();
          }
        },
        openReady: function () {
          // $("#pop_map .store_show").addClass("hidden");
          $("#pop_map .store_wrap").css('display', 'none');

          this.langCheck();
        },
        reSetUI: function () {
          console.info("### reSetUI ###");

          let deviceInfo = apg.intro.data.deviceInfo;
          let current = this.current;

          current.place = deviceInfo.terminalId;
          current.area = deviceInfo.location;
          current.floor = deviceInfo.floor;
          current.baseUIDataIndex = 0;
          current.baseUIFloorId = "";
          current.floorCate = [];
          current.bigCateIndex = -1;
          current.midCate = [];

          $("#pop_map .store_wrap").css('display', 'none');
          $("#pop_map .store_popup").css('display', 'none');
          this.uiRender("area");
        },
        langCheck: function () {
          if (this.lang.num === this.lang.type.indexOf("nowLang")) {
            // TODO : 원본
            return;
          }

          let frm = this.iframe;
          // MAP 언어설정
          frm.postMessage(
            {
              sect: "LANG",
              type: nowLang, // TODO : 원본
            },
            "*"
          );

          this.lang.num = this.lang.type.indexOf(nowLang);

          let langKind = "ko";
          try {
            langKind = nowLang.split("_")[0];
          } catch (e) { }
          let eleType = "";
          let langData = "";

          $("#pop_map .btn-list.lang-change button").each(function () {
            eleType = $(this).closest(".btn-list").attr("data-type");
            langData = $(this).attr("data-lang-" + langKind);
            if (langData) {
              if (["facility", "storeShow"].indexOf(eleType) > -1) {
                $(this).find("span").html(langData);
              } else {
                $(this).html($(this).attr("data-lang-" + langKind));
              }
            }
          });
          let storeMidCateTitle = $("#pop_map .category_title");
          storeMidCateTitle.text(storeMidCateTitle.data("lang-" + langKind));
        },
        dataLoad: function () {
          let _this = this;

          let deviceTerminalId = apg.intro.data.deviceInfo.terminalId;
          let storeUrl = "";
          // let storeTmIds = ['P01', 'P02'];
          // let baseUINm = 'T1';
          let storeTmIds = [];
          let baseUINm = "";
          if (deviceTerminalId === "P03") {
            storeTmIds = ["P03"];
            baseUINm = "T2";
          }

          // ** 기본 UI 데이터 로드 ( 장소, 구역, 층 )
          $.getJSON("${tsctx}/resources/data/tsMapBaseUIData.json", function (res) {
            console.info("### Base UI 데이터 로드 success ###");
            _this.baseUIData = res[baseUINm];
          })
            .fail(function (err) {
              console.error(err.responseText);
            })
            .complete(function () {
              console.info("### Base UI 데이터 로드 complete ###");
              console.info(_this.baseUIData);

              // ** 카테고리 데이터 로드
              $.getJSON(
                "${tsctx}/resources/data/tsMapCategory.json",
                function (res) {
                  console.info("### 카테고리 데이터 로드 success ###");
                  _this.cateList = res;
                }
              )
                .fail(function (err) {
                  console.error(
                    "### 카테고리 데이터 로드 error ### : " + err.status
                  );
                })
                .complete(function () {
                  console.info("### 카테고리 데이터 로드 complete ###");
                  console.info(_this.cateList);

                  // ** 상점 데이터 로드
                  for (let id of storeTmIds) {
                    storeUrl = "/apg/ws/facility/getFacilities2?terminalId=" + id;

                    $.getJSON(storeUrl, function (res) {
                      console.info("### " + id + " 상점 데이터 로드 success ###");

                      if (_this.storeList.length > 0) {
                        _this.storeList.push(...res);
                      } else {
                        _this.storeList = res;
                      }
                    })
                      .fail(function (err) {
                        console.error(
                          "### " +
                          id +
                          " 상점 데이터 로드 error ### : " +
                          err.status
                        );
                      })
                      .complete(function () {
                        console.info(
                          "### " + id + " 상점 데이터 로드 complete ###"
                        );
                        console.info(_this.storeList);
                        _this.uiRender("area");
                      });
                  }
                });
            });
        },
        uiRender: function (k, v) {
          let deviceInfo = apg.intro.data.deviceInfo;

          let current = this.current;
          let selector = this.selector;
          let lang = this.lang;
          let storeList = this.storeList;
          let langNum = lang.num;
          let html, row, btnList;

          if (k !== "area") {
            btnList = selector[k].find(".btn-list");
            btnList.empty();
          }

          // ** 건물(장소) 랜더링 ( 최초 1번 동작 )
          if (k === "place") {
            // for (let i = 0; i < this.baseUIData.length; i++) {
            //   row = this.baseUIData[i];
            //   if (row.area !== "T") {
            //     html = "<li>";
            //     html += "   <button>제 2여객 터미널</button>";
            //     html += "</li>";

            //     btnList.append(html);
            //     btnList.find("li:last button").attr({
            //       "data-index": i,
            //       "data-id": row.place + row.area,
            //       "data-place": row.place,
            //       "data-area": row.area,
            //       "data-lang-ko": row.title[0],
            //       "data-lang-en": row.title[1],
            //       "data-lang-ja": row.title[2],
            //       "data-lang-zh": row.title[3],
            //     });
            //   }
            // }

            // * 현재 디스플레이 장소 및 구역 자동 선택
            var nowPlaceId = current.place + current.area;
            if (current.place !== "P02" || current.area !== "T") {
              nowPlaceId = current.place;
            }

            selector.place
              .find("button[data-id=" + nowPlaceId + "]")
              .trigger(tscommonUi.getDefaultTriggerEvent());

            // this.uiRender();
            return;
          }
          // ** 구역(일반/면세) 랜더링
          else if (k === "area") {
            //* 구역(일반/면세) 션택 숨김
            //* 교통센터(T) 및 탑승동(F)가 고정되어 구역선택 불필요
            if (current.area) {
              selector.area.find(".btn-list").addClass("hidden");
              this.uiRender("floor");
              // return;
            }

            //* 구역(일반/면세) 션택 활성
            //* 현재 디스플레이 구역 자동 선택
            selector.area.find(".btn-list").removeClass("hidden");
            selector.area
              .find("button[data-area=" + deviceInfo.location + "]")
              .trigger(tscommonUi.getDefaultTriggerEvent());
          }
          // ** 층 랜더링
          else if (k === "floor") {
            // var floorsData = this.baseUIData.floors[current.area];
            // lsj 수정
            var floorsData = this.baseUIData[1].floors[current.area];
            let deviceId = deviceInfo.terminalId + deviceInfo.floor
            var deviceFloorId = deviceId + deviceInfo.location;
            var selectedFloorId = "";

            for (let i = 0; i < floorsData.length; i++) {
              row = floorsData[i];

              if (i === 0 || row.id === deviceFloorId) {
                selectedFloorId = row.id;
              }

              html = "<button><span>" + row.title + "</span></button>"

              // html = "<li>";
              // html += "   <button>" + row.title + "</button>";
              // html += "</li>";
              // lsj 수정

              btnList.append(html);
              btnList.find("button:last").attr({
                "data-id": row.id,
                "data-floor": row.floor,
              });
            }

            console.info('selector.floor', selector.floor, 'selectedFloorId', selectedFloorId)

            selector.floor
              .find("button[data-id=" + selectedFloorId + "]")
              .trigger(tscommonUi.getDefaultTriggerEvent());
          }
          // ** 빅카테고리 랜더링
          else if (k === "bigCate") {
            for (let i = 0; i < current.floorCate.length; i++) {
              row = current.floorCate[i];

              html = "<li>";
              html += "   <button>" + row.localedValues[langNum] + "</button>";
              html += "</li>";


              btnList.append(html);

              // btnList.append(html);
              btnList.find("li:last button").attr({
                "data-index": i,
                "data-id": row.bigCategory,
                "data-lang-ko": row.localedValues[0],
                "data-lang-en": row.localedValues[1],
                "data-lang-ja": row.localedValues[2],
                "data-lang-zh": row.localedValues[3],
              });

              // lsj 수정 btnList 구조 확인
            }
            if (selector.bigCate.find("button").length > 0) {
              // selector.bigCate
              //   .find("button:eq(0)")
              //   .trigger(tscommonUi.getDefaultTriggerEvent());
            } else {
              current.bigCateIndex = -1;

              selector.midCate.find("ul.btn-list").empty();
              selector.store.find("ul.btn-list").empty();
              selector.store.closest(".store_wrap").css('display', 'none');
            }
          }
          // ** 미들카테고리 랜더링
          else if (k === "midCate") {
            console.info(current.floorCate[current.bigCateIndex], 'current.floorCate[current.bigCateIndex]'
            )
            var midCateList =
              current.floorCate[current.bigCateIndex].midCategoryies;
            var storeCnt = 0;
            var midCateDiff = [];
            var jrow;

            for (let i = 0; i < midCateList.length; i++) {
              row = midCateList[i];

              storeCnt = 0;
              for (let j = 0; j < storeList.length; j++) {
                jrow = storeList[j];
                midCateDiff = row.category.filter((x) =>
                  jrow.midCategories.includes(x)
                );
                if (
                  current.place === jrow.terminalId &&
                  current.floor === jrow.floor &&
                  current.area === jrow.locationId &&
                  midCateDiff.length > 0 &&
                  jrow.mapId
                ) {
                  storeCnt++;
                }
              }
              if (storeCnt > 0) {
                html = "<li>";
                html += "   <button>" + row.localedValues[langNum] + "</button>";
                html += "</li>";

                btnList.append(html);
                btnList.find("li:last button").attr({
                  "data-index": i,
                  "data-id": row.category,
                  "data-lang-ko": row.localedValues[0],
                  "data-lang-en": row.localedValues[1],
                  "data-lang-ja": row.localedValues[2],
                  "data-lang-zh": row.localedValues[3],
                });
              }
            }

            if (selector.midCate.find("button").length > 0) {
              // selector.midCate
              //   .find("button:eq(0)")
              //   .trigger(tscommonUi.getDefaultTriggerEvent());
            } else {
              current.midCate = [];

              selector.store.find("ul.category_result").empty();
              selector.store.closest(".store_wrap").css('display', 'none');
            }
          }
          // ** 상점리스트 랜더링
          else if (k === "store") {
            var storeTitle = "";
            // 상점목록 제외 (화장실, 심장제세동기, 유아휴계실, 흡연실)
            var noStoreMidCate = this.noStoreMidCate;
            var storeMidCateDiff = [];
            var nameKr, nameEn, nameCn, nameJp;

            for (let i = 0; i < storeList.length; i++) {
              row = storeList[i];
              storeMidCateDiff = row.midCategories.filter((x) =>
                current.midCate.includes(x)
              );
              if (
                current.place === row.terminalId &&
                current.floor === row.floor &&
                current.area === row.locationId &&
                storeMidCateDiff.length > 0 &&
                row.mapId &&
                noStoreMidCate.indexOf(row.repMidCategoryCode) === -1
              ) {
                storeTitle = row[lang.storeNms[langNum]];
                nameKr = row.nameKr;
                nameEn = row.nameEn;
                nameCn = row.nameCn;
                nameJp = row.nameJp;
                if (row.description && row.nameKr !== row.description) {
                  storeTitle += row.description;
                  nameKr += row.description;
                  nameEn += row.description;
                  nameCn += row.description;
                  nameJp += row.description;
                }
                html = "<li>";
                html += "   <button>" + storeTitle + "</button>";
                html += "</li>";

                btnList.append(html);
                btnList.find("li:last button").attr({
                  "data-id": row.actualFacilityId,
                  "data-lang-ko": nameKr,
                  "data-lang-en": nameEn,
                  "data-lang-ja": nameJp,
                  "data-lang-zh": nameCn,
                });
              }
            }
          }
        },
        event: function () {
          let _this = this;
          let selector = this.selector;
          let frm = this.iframe;
          let current = this.current;
          let deviceInfo = apg.intro.data.deviceInfo;

          // ### 하단(메인) UI 클릭 이벤트 ###
          selector.baseUI.on(tscommonUi.defaultEventType, "button", function () {
            $(this).closest('nav').find('button').removeClass('active');
            $(this).closest('button').addClass('active');

            var type = $(this).closest('nav').data('type');
            var frmSendData = null;
            var nextUIRender = null;

            // *** Place(장소) ( 교통센터, T1~2, 탑승동 )
            if (type === "place") {
              current.place = $(this).data("place");
              current.area = $(this).data("area");
              current.baseUIDataIndex = 1; // $(this).data('index');

              nextUIRender = "area";

              // frmSendData = {
              //   sect: "TERMINAL",
              //   type: current.place,
              // };
            }
            // *** Area(구역) 클릭 ( 일반, 면세 )
            else if (type === "area") {
              current.area = $(this).data("area");

              nextUIRender = "floor";

              frmSendData = {
                sect: "AREA",
                type: current.area,
              };
            }
            // *** Floor(층) ( B1,1F,2F,3F,4F,5F )
            else if (type === "floor") {
              current.floor = $(this).data("floor");
              current.baseUIFloorId = $(this).data("id");


              current.floorCate = [];
              for (let i = 0; i < _this.cateList.length; i++) {
                row = _this.cateList[i];
                if (row.floor.indexOf(current.baseUIFloorId) > -1) {
                  current.floorCate = row.list;
                  break;
                }
              }

              nextUIRender = "bigCate";

              selector.midCate.addClass("hidden");
              if ($('#pop_map .store_wrap').css('display') === 'block') {
                $('#pop_map .store_wrap').css('display', 'none');
              }

              $('#pop_map .depth2').show();
              $('#pop_map .depth3').hide();

              frmSendData = {
                sect: "FLOOR",
                type: current.floor,
              };
            }
            // Big category ( 음식, 쇼핑, 편의시설, 공공시설 ... )
            else if (type === "bigCate") {
              current.bigCateIndex = $(this).data("index");
              current.bigCate = $(this).data('id').toString().split(',');


              nextUIRender = "midCate";

              selector.midCate.removeClass("hidden");

              frmSendData = {
                sect: 'BIGCATEGORY',
                terminalId: current.place,
                locationId: current.area,
                floor: current.floor,
                bigCategory: current.bigCate,
                midCategory: current.midCate
              };

              $('#pop_map .depth3').show();
              $('#pop_map .store_wrap').hide();

            }
            // *** Middle category ( 한식, 양식, 아시안푸드 ... )
            else if (type === "midCate") {
              let noStoreMidCateCheck = false;
              let noStoreDifference = [];
              current.midCate = [];
              try {
                current.midCate = $(this).data("id").toString().split(",");
                noStoreDifference = _this.noStoreMidCate.filter((x) =>
                  current.midCate.includes(x)
                );

                if (noStoreDifference.length > 0) {
                  noStoreMidCateCheck = true;
                }
              } catch (e) {
                console.error(e);
              }

              if (noStoreMidCateCheck) {
                selector.store.closest(".store_wrap").css('display', 'none');

                selector.facility
                  .find("button[data-id=" + current.midCate + "]")
                  .trigger(tscommonUi.getDefaultTriggerEvent());
                return;
              } else {
                $('#pop_map .category_title')
                  .attr({
                    // XXX : 레이아웃 변경으로 인해 코드 수정
                    'data-lang-ko': $(this).data('lang-ko'),
                    'data-lang-en': $(this).data('lang-en'),
                    'data-lang-ja': $(this).data('lang-ja'),
                    'data-lang-zh': $(this).data('lang-zh'),
                  })
                  .text($(this).text());

                document.querySelector('.category_title_area > button').addEventListener('click', e => {
                  const storeWrap = selector.store.closest('.store_wrap');
                  const storePopup = $('.store_popup');

                  storeWrap.css('display', 'none');
                  storePopup.css('display', 'block');
                })
                selector.store.closest(".store_wrap").css('display', 'block');
                $('.store_popup').css('display', 'none');
              }

              nextUIRender = "store";

              frmSendData = {
                sect: 'MIDCATEGORY',
                terminalId: current.place,
                locationId: current.area,
                floor: current.floor,
                bigCategory: current.bigCate,
                midCategory: current.midCate
              };
            }

            // *** UI 랜더링
            if (nextUIRender) {
              _this.uiRender(nextUIRender);
            }
            // *** 프레임에 메세지 전달
            if (frmSendData) {
              frm.postMessage(frmSendData, "*");
            }

            // lsj 수정 팝업 확인
          });

          // STORE 상세보기 클릭 이벤트
          $('.store_popup').on('click', function () {
            selector.store.closest('.store_wrap').css('display', 'block');
            $('.store_popup').css('display', 'none');
          })

          // ### 시설(상점) 목록 클릭 이벤트 ###
          selector.store.on(tscommonUi.defaultEventType, "button", function () {
            var storeId = $(this).data("id");

            frm.postMessage(
              {
                sect: "STOREPOPUP",
                type: "STORE",
                id: storeId,
              },
              "*"
            );
          });

          // ### 시설(상점) 목록 숨김 이벤트 ###
          selector.storeHide.on(tscommonUi.defaultEventType, function () {
            $(this).closest(".store_wrap").addClass("hidden");
            selector.storeShow.removeClass("hidden");
          });

          // ### 시설(상점) 목록 보기 이벤트 ###
          selector.storeShow.on(tscommonUi.defaultEventType, "button", function () {
            $(this).closest(".store_show").addClass("hidden");
            selector.storeHide.closest(".store_wrap").removeClass("hidden");
          });

          // ### 편의시설(사이드) UI 클릭 이벤트 ( AED, 유아휴게실, 흡연실, 화장실 ) ###
          selector.facility.on(tscommonUi.defaultEventType, "button", function () {
            var type = $(this).data('type');
            var midCate = $(this).data('mid') + "";
            var bigCate = midCate.slice(0, 3) + "";

            for (let i = 0; i < selector.facility.length; i++) {
              if (selector.facility[i].querySelector('button').classList.contains('active')) {
                selector.facility[i].querySelector('button').classList.remove('active');
              }
            }

            $(this).addClass('active');

            frm.postMessage(
              {
                sect: 'FACILITY',
                type: type,
                floor: current.floor,
                bigCategory: bigCate,
                midCategory: midCate
              },
              "*"
            );
          });

          // ### 현재위치(사이드) 클릭 이벤트 ###
          selector.location.on(tscommonUi.defaultEventType, "button", function () {
            var type = $(this).data("type");

            _this.reSetUI();

            for (let i = 0; i < selector.facility.length; i++) {
              if (selector.facility[i].querySelector('button').classList.contains('active')) {
                selector.facility[i].querySelector('button').classList.remove('active');
              }
            }

            selector.floor
              .find("button[data-id=" + current.floor + "]")
              .trigger(tscommonUi.getDefaultTriggerEvent());

            frm.postMessage(
              {
                sect: "MYLOCATION",
              },
              "*"
            );
          });
        },
      };
    </script>