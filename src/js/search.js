// search.js

let searchFilters = {
  keyword:'',
  floor:'',
  cate:'전체'
};
const INITIALS = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ',
  'ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
];
let searchValue = '';

function initSearch() {
    // 입력 처리
    document.querySelectorAll('.keypad_area').forEach(area => {
        area.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-rel')) {
                const char = e.target.getAttribute('data-rel');
                const inputAll = document.querySelectorAll('.keypad_input');
                inputAll.forEach(input => {
                    input.value += char;
                    input.value.length === 0 ? input.classList.add('empty') : input.classList.remove('empty');
                });
                if(e.target.closest('.search_form')){
                  searchFilters.keyword = inputAll[0]?.value || '';
                  window.dispatchEvent(new Event('search:updated'));
                }
            }
        });
    });

    // 삭제 처리
    document.querySelectorAll('.keypad_delete button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const inputAll = document.querySelectorAll('.keypad_input');
            inputAll.forEach(input => {
                input.value = input.value.slice(0, -1);
                input.value.length === 0 ? input.classList.add('empty') : input.classList.remove('empty');
            });
            if(e.target.closest('.search_form')){
              searchFilters.keyword = inputAll[0]?.value || '';
              window.dispatchEvent(new Event('search:updated'));
            }
        });
    });

    // 층별 필터 버튼
    document.querySelectorAll('.search_floor button[data-rel]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeRadio(btn);
            searchFilters.floor = btn.dataset.rel;
            window.dispatchEvent(new Event('search:updated'));
        });
    });

    // 카테고리 필터 버튼
    document.querySelectorAll('.search_cate button[data-rel]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeRadio(btn);
            searchFilters.cate = btn.dataset.rel;
            window.dispatchEvent(new Event('search:updated'));
        });
    });
    return Promise.resolve();
}


// 필터 적용
function applyCommonFilters(dataArray, floorFieldPath, cateType) {
    return dataArray.filter(function(item) {
    // 키워드 필터
    if (searchFilters.keyword) {
      // 모든 언어의 매장명 가져오기
      const namesKor = item.STORE_NAME_KOR || '';
      const namesEng = item.STORE_NAME_ENG || '';
      const namesChn = item.STORE_NAME_CHN || '';
      const namesJpn = item.STORE_NAME_JPN || '';

      const keyword = searchFilters.keyword;
      
      // 한글 검색의 경우 초성 검색
      const initials = getInitials(namesKor);
      
      // 영문 검색의 경우 대소문자 구분 없이
      const isEngMatch = namesEng.toLowerCase().includes(keyword.toLowerCase());
      
      // 다른 언어 검색
      const isChnMatch = namesChn.includes(keyword);
      const isJpnMatch = namesJpn.includes(keyword);
      
      // 어느 하나라도 일치하면 통과
      if (!initials.includes(keyword) && 
          !isEngMatch && 
          !isChnMatch && 
          !isJpnMatch) {
          return false;
      }
  }

    // 층 필터
    if (searchFilters.floor &&
        searchFilters.floor !== '전체' &&
        searchFilters.floor !== 'Current') {
      var raw = getByPath(item, floorFieldPath) || '';
      var floors = raw.split(',').map(function(x){ return x.trim(); });
      if (floors.indexOf(searchFilters.floor) === -1) {
        return false;
      }
    }

    // 카테고리 필터
    if (searchFilters.cate && searchFilters.cate !== '전체') {
      const storeGroupCode = item.CATE_CODE?.[cateType];
      if (storeGroupCode !== searchFilters.cate) {
        return false;
      }
    }

    return true;
  });
}

function getByPath(obj, path) {
  return path.split('.').reduce((o,key)=> (o||{})[key], obj);
}

/**
 * 문자열에서 한글 글자만 골라 초성으로 치환
 */
function getInitials(str) {
  var res = '';
  for (var ch of str) {
    var code = ch.charCodeAt(0) - 0xAC00;
    if (code >= 0 && code < 11172) {
      var lead = Math.floor(code / (21 * 28));
      res += INITIALS[lead];
    } else {
      res += ch;
    }
  }
  return res;
}

window.addEventListener('search:updated', () => {
    const page = ControlState.currentPageInfo;
    if (page === 'page_store') {
      setRenderStore(true);
    } else if (page === 'page_food') {
      setRenderFood(true);
    }
});



/**
 * 
 * @param {string} type 
 * 키패드 타입 변경
 */
function keypadType(btn, type){
    const keypadWrap = btn.closest('.search_keypad');
    const typeBtnAll = keypadWrap.querySelectorAll('.keypad_type button');
    const selectedTypeBtnAll = keypadWrap.querySelectorAll(`.keypad_type button.${type}`);
    const typeKeypadAll = keypadWrap.querySelectorAll('.keypad_area .keypad');
    const selectedTypeKeypadAll = keypadWrap.querySelectorAll(`.keypad_area .keypad.${type}`);
   
    typeBtnAll.forEach((btn) => btn.classList.remove('active'));
    typeKeypadAll.forEach((pad) => pad.classList.remove('active'));
    selectedTypeBtnAll.forEach((btn) => btn.classList.add('active'));
    selectedTypeKeypadAll.forEach((pad) => pad.classList.add('active'));
}


/**
 * 
 * @param {HTMLElement} btn 
 * @param {String} type 
 * 매장/식음료 검색 타입 탭
 */
function searchType(btn, type){
  const searchForm = btn.closest('.search_form');
  const contents = searchForm.querySelectorAll('.search_content');

  //검색 타입 변경 시  저자세 전용 통합검색 버튼 토글
  if(type != 'search_keyword'){
    document.querySelector(`#${ControlState.currentPageInfo} .search_form_low`).classList.add('hidden');
  }else{
    document.querySelector(`#${ControlState.currentPageInfo} .search_form_low`).classList.remove('hidden');
  }

  activeRadio(btn);
  contents.forEach(content => content.classList.remove('active'));
  const target = searchForm.querySelector(`.search_content.${type}`);
  target.classList.add('active');

  searchFilterReset(target);
}

/**
 * 검색필터 초기화
 * @param {HTMLElement} container
 */
function searchFilterReset(container = false){
    const currentPage = document.getElementById(ControlState.currentPageInfo);
    searchFilters = { keyword: '', floor: '', cate: '전체' };

    currentPage.querySelector('.keypad_input').value = '';
    currentPage.querySelector('.keypad_input').classList.add('empty');
     
    if(container){
        const floorBtns = container.querySelectorAll('.search_floor button');
        floorBtns.forEach(btn => btn.classList.remove('active'));
        if (floorBtns.length) {
            floorBtns[0].classList.add('active');
            searchFilters.floor = floorBtns[0].dataset.rel || '';
        }

        const cateBtns = container.querySelectorAll('.search_cate button');
        cateBtns.forEach(btn => btn.classList.remove('active'));
        if (cateBtns.length) {
            cateBtns[0].classList.add('active');
            searchFilters.cate = cateBtns[0].dataset.rel || '전체';
        }
    }else{
        currentPage.querySelectorAll('.search_type .item button').forEach(btn => btn.classList.remove('active'));
        currentPage.querySelector('.search_type .item:first-child button').classList.add('active');
        currentPage.querySelectorAll('.search_content').forEach(content => content.classList.remove('active'));
        currentPage.querySelector('.search_keyword').classList.add('active');
    }

    window.dispatchEvent(new Event('search:updated'));
}


/**
 * 팝업 검색 확인
 */
function searchSubmit(){
    searchFilters.keyword = document.querySelector('#search_popup .keypad_input').value || '';
    window.dispatchEvent(new Event('search:updated'));
    closePopup('', 'search_popup');
}

/**
 * 팝업 검색 닫기
 */
function searchCancel(){
  document.querySelector('#search_popup .keypad_input').value = searchValue;
  closePopup('', 'search_popup');
}


function searchOpen(){
  const controlStateElement = document.querySelector(`#${ControlState.currentPageInfo} .keypad_input`);
  searchValue = controlStateElement.value;
  showPopup('search_popup');
}