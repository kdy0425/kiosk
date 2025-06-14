const langDefault = 'KO';
const skipPages = ["searching", "empty_wrap", "printing_wrap", "printed_wrap", "error_wrap"];
const screenTime = 180;
const apiCar = 'https://kanu2506.mycafe24.com/car_api.php?lotAreaNo=20';
let languageData = [];
let common_tts = new Object();
let slidePrevState = '이전 항목';
let slideNextState = '다음 항목';
var slideTimer;

const ControlState = {
  historyStack : ['screen_saver'],
  startStatus: false,
  lowScreen: false,
  contrast: false,
  language: 'KO',
  fontSize: '1',
  ttsVolume: '25',    // 0, 25, 50, 75, 100
  ttsSpeed: '1',     // 1, 2, 4, 8
  timeLeft: 0,
  intervalId: null,
  currentPageInfo: 'screen_saver',
  currentPopupInfo: null,
  currentStore: null,
  currentFacility: null,
  reset() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.historyStack = ['screen_saver'];
    this.startStatus = false;
    this.lowScreen = false;
    this.contrast = false;
    this.language = 'KO';
    this.fontSize = '1';
    this.ttsVolume = '25';
    this.ttsSpeed = '1';
    this.timeLeft = 0;
    this.currentPageInfo = 'screen_saver';
    this.currentPopupInfo = null;
    this.currentStore = null;
    this.currentFacility = null;
  }
};

(async () => {
  const loadingWrap  = document.querySelector('#page_loading');
  const loadingGauge = document.querySelector('#page_loading #gauge');
  function setGauge(pct) {
    loadingGauge.style.width = `${pct}%`;
  }

  // 데이터 로드
  await setLoadDataContents();
  console.log(gl_xml_conf)
  if (document.readyState === "loading") {
    await new Promise(resolve => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }
  setGauge(15);
  await setJsonData(); setGauge(20);


  //각페이지 랜더링
  await setRenderScreenSaver(); setGauge(25);
  await setRenderMap(); setGauge(30);
  await setRenderFacility(); setGauge(40);
  await setRenderEvent();setGauge(60);
  await setRenderStoreCates()
  await setRenderStore(); setGauge(75);
  await setRenderFoodCates()
  await setRenderFood(); setGauge(90);
  await initSearch();
  await cacheImagesSafelyWithCount();

  //슬라이드 시작
  await slideStart(); setGauge(100);

  setTimeout(() => {
    loadingWrap.classList.add('out');
  }, 500);
  setTimeout(() => {
      loadingWrap.remove();
  }, 1500);
})();


/**
 * gl_xml_conf.xml_data 안의 모든 이미지 URL을 모아서
 * caches.addAll 효과처럼 fetch+put을 하되,
 * 개별 성공/실패를 세어 로그를 남깁니다.
 */
async function cacheImagesSafelyWithCount() {
  if (!('caches' in window)) return { successCount: 0, failCount: 0 };

  // 1) xml_data 안의 이미지 URL 자동 수집
  const urls = new Set();
  (function recurse(val) {
    if (typeof val === 'string') {
      if (/\.(png|jpe?g|svg|webp|gif|bmp)(\?.*)?$/i.test(val)) {
        urls.add(val);
      }
    } else if (Array.isArray(val)) {
      val.forEach(recurse);
    } else if (val && typeof val === 'object') {
      Object.values(val).forEach(recurse);
    }
  })(gl_xml_conf.xml_data);
  const urlList = Array.from(urls);

  // 2) Cache 열기
  const cache = await caches.open('kiosk-images');
  let successCount = 0, failCount = 0;

  // 3) 모든 fetch를 병렬 실행, 결과를 settle 한 뒤 개별 put
  const results = await Promise.allSettled(urlList.map(u => fetch(u)));
  await Promise.all(results.map(async (res, i) => {
    const url = urlList[i];
    if (res.status === 'fulfilled' && res.value.ok) {
      await cache.put(url, res.value.clone());
      successCount++;
    } else {
      failCount++;
    }
  }));

  console.log(`✅ 이미지 캐시 성공: ${successCount}개, ❌ 실패: ${failCount}개`);
  return { successCount, failCount };
}

 
/**
 *
 * @param {string} targetPage - 이동할 페이지 ID
 */
const movePage = (targetPage, pageInfo = null) => {
  console.log('페이지 이동: ', targetPage);
  closePopup();
  stopAllVideos();

  const pageAll = document.querySelectorAll("#content .page_wrap");
  pageAll.forEach((page) => {
    page.style.display = "none";
  });
  document.querySelector(`#${targetPage}`).style.display = "flex";
  //document.querySelector(`#${targetPage} [data-tts-page]`).focus();
  if (ControlState.historyStack[ControlState.historyStack.length - 1] !== targetPage) {
    ControlState.historyStack.push(targetPage);
  }
  
  document.documentElement.className =   document.documentElement.className.replace(/\bpage_[^\s]*/g, "").trim();
  document.documentElement.classList.add(targetPage);
  ControlState.currentPageInfo = targetPage;
  initHtmlLanguage('page');// 언어팩에 있는 데이터로 변경

  //ttsPageIntro('page');
  //페이지 이동시 해당 페이지 세팅 함수 실행
  if (typeof window[targetPage] === "function") {
    window[targetPage](pageInfo);
  }
};


/**
 * 
 * @param {HTMLElement} btn 
 * @param {String} targetPage 
 * 메뉴 버튼 토클 & 페이지 이동
 */
function menuToggle(btn, targetPage) {
    activeRadio(btn);
    movePage(targetPage);
}

/**
 * json 데이터 세팅
 */
function setJsonData(){
  return new Promise((resolve) => {
    fetchLanguageData().then(data => {
      languageData = data;
      console.log(languageData)
      resolve();
    });
  });
}

async function fetchLanguageData() {
  const response = await fetch('./data/language.json');
  return await response.json();
}


// 커스텀 Json 정보 가져옴
function getJsonGroups(target) {
  const codeList = gl_xml_conf.xml_data.CODE_LIST.CODE_INFO;
  const infos = Array.isArray(codeList) ? codeList : [codeList];
  const floorInfo = infos.find(info => info.CODE_KEY === 'CUSTOMCODE');
  console.log(floorInfo,'categoryInfo')
  return floorInfo?.CODE_VALUE?.HDC?.[target] || [];
}

/**
 * 
 * @param {string} code 
 * @param {string} language 
 * 코드로  현재 언어를 찾아 반환
 */
function langCodeCheck(code, language) {
  const item = languageData.find(entry => entry.code === code);
  const langType = language ? language : ControlState.language;
  return item ? item[langType] : code;
}


/**
 * 
 * @param {string} type 
 * 선택언어로 변환 (공통 레이아웃, 현재 페이지, 현재 팝업)
 */
async function initHtmlLanguage(type) {
  const lang = ControlState.language;
  let containers;

  if (type === 'page') {
    containers = [`#${ControlState.currentPageInfo}`];
  } else if (type === 'popup') {
    containers = [`.popup_layer.lang_translating`];
  } else {
    containers = ['.bottom_area', `#${ControlState.currentPageInfo}`, `.popup_layer.show`];
  }

  const selector = containers
    .map(sel => `${sel} [data-lang-code], ${sel} [data-lang-${lang.toLowerCase()}]`)
    .join(', ');

  document.querySelectorAll(selector).forEach(el => {
    const dsKey = 'lang' + lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
    if (el.dataset[dsKey]) {
      el.innerHTML = el.dataset[dsKey];
      return;
    }
    const code = el.dataset.langCode;
    const msg  = languageData.find(m => m.code === code);
    if (msg && msg[lang]) {
      el.innerHTML = msg[lang];
    }
  });
}

/**
 * 
 * @param {string} text 
 * @param {string} language 
 * 공용좌석 -> 영문 변환
 */
function transformSeatingText(text, language) {
  const lang = language.toUpperCase();

  // 숫자 추출
  const seatMatch = text.match(/(\d+)\s*석?/);
  const seatNumber = seatMatch ? seatMatch[1] : '';

  const hasShared = text.includes('공용좌석');
  const sharedText = hasShared ? langCodeCheck('공용좌석', lang) : text;
  return seatNumber ? `${seatNumber} ${sharedText}` : sharedText;
}


/**
 * 
 * @param {HTMLElement} btn 
 * 동영상 재생
 */
function videoPlay(btn) {
    var container = btn.closest('.slide_video');
    var video = container.querySelector('video');
    var playBtn = btn;
    var pauseBtn = container.querySelector('.pause');
    stopAllVideos();
    video.play();
    playBtn.classList.add('active');
    pauseBtn.classList.remove('active');
    video.onended = function() {
      playBtn.classList.remove('active');
      pauseBtn.classList.remove('active');
    };
}

/**
 * 
 * @param {HTMLElement} btn 
 * 동영상 일시정지
 */
function videoPause(btn) {
    var container = btn.closest('.slide_video');
    var video = container.querySelector('video');
    var playBtn = container.querySelector('.play');
    var pauseBtn = btn;
  
    video.pause();
    pauseBtn.classList.add('active');
    playBtn.classList.remove('active');
    video.onended = null;
}
  
/**
 * 동영상 모두 정지
 */
function stopAllVideos() {
  document.querySelectorAll('.slide_video').forEach(container => {
    const video = container.querySelector('video');
    const playBtn = container.querySelector('.play');
    const pauseBtn = container.querySelector('.pause');
    if (!video) return;

    // 재생 중지 + 타임리셋
    video.pause();
    video.currentTime = 0;

    // 버튼 상태 리셋
    if (playBtn)  playBtn.classList.remove('active');
    if (pauseBtn) pauseBtn.classList.remove('active');

    // onended 핸들러 제거
    video.onended = null;
  });
}

/**
 * 
 * @param {HTMLElement} button  
 * 토글 클래스 RADIO 규칙
 */
function activeRadio(button){
    const item = button.closest('.item');
    let parent = null;
    if(item){
      parent = item.parentElement;
    }else{
      parent = button.closest('ul');
    }
    const buttons = parent.querySelectorAll('button');

    buttons.forEach((button) => {
        button.classList.remove('active');
    });
    button.classList.add('active');
}


/**
 * 잔여시간 카운트 관련
 */
function startInactivityTimer() {
  ControlState.timeLeft = screenTime;
  updateRemainingDisplay();
  if (ControlState.intervalId) clearInterval(ControlState.intervalId);
  ControlState.intervalId = setInterval(handleTimerTick, 1000);
}

function resetInactivityTimer() {
  ControlState.timeLeft = screenTime;
  updateRemainingDisplay();
  updateTimePopup(ControlState.timeLeft);
  if (ControlState.currentPopupInfo === 'time_popup') {
    closePopup(null, 'time_popup');
  }
}

function handleTimerTick() {
  ControlState.timeLeft--;
  updateRemainingDisplay();
  if (ControlState.timeLeft === 30) {
    updateTimePopup(ControlState.timeLeft);
    showPopup('time_popup');
  } else if (ControlState.timeLeft < 30 && ControlState.timeLeft >= 0) {
    updateTimePopup(ControlState.timeLeft);
  }
  if (ControlState.timeLeft <= 0) {
    clearInterval(ControlState.intervalId);
    ControlState.intervalId = null;
    returnToScreenSaver();
  }
}

function updateTimePopup(sec) {
  const txt = document.querySelector('#time_popup .time_count strong');
  if (txt) txt.textContent = sec;
}

function updateRemainingDisplay() {
  const el = document.querySelector('.reset_time .time');
  if (!el) return;
  const min = String(Math.floor(ControlState.timeLeft / 60)).padStart(2, '0');
  const sec = String(ControlState.timeLeft % 60).padStart(2, '0');
  el.textContent = `${min}:${sec}`;
}

function returnToScreenSaver() {
  closePopup(null, 'time_popup');
  ControlState.reset();
  ControlState.timeLeft = screenTime;
  updateRemainingDisplay();
  const screenSaver = document.querySelector('#page_screen_saver');
  if (screenSaver) {
    screenSaver.style.display = 'block';
    screenSaver.classList.remove('fade-out-down');
  }
  page_screen_saver();
}

['pointerdown','touchstart','click','keydown'].forEach(evt => {
  document.addEventListener(evt, () => {
    if (ControlState.startStatus) {
      resetInactivityTimer();
    }
  });
});