const parkingSearch = document.querySelector('.parking_search');
const hiddenInput = parkingSearch.querySelector('input[type="hidden"]');
const digitSpans = parkingSearch.querySelectorAll('.search_input span');
const keypadButtons = parkingSearch.querySelectorAll('.parking_keypad button');
const maxDigits = digitSpans.length;

function updateDisplay() {
    const value = hiddenInput.value;
    digitSpans.forEach((span, idx) => {
        span.textContent = value[idx] || '';
        span.classList.toggle('active', value[idx] != null && value[idx] !== '');
    });
}


async function handleSearch(value) {
    if (value.length != 4) {
      alert('차량 번호 4자리를 입력해 주세요.');
      return;
    }

    const url = new URL(`${apiCar}`);
    url.searchParams.set('carNo4Digit', value);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.status !== '200' || !json.data.success) {
        throw new Error(json.data.errorMessage || 'API 오류');
      }
      renderCarResults(json.data.carList);
    } catch (err) {
      console.error(err);
      alert('주차 정보 조회 중 오류가 발생했습니다.');
    }
}

function renderCarResults(carData) {
    console.log(carData);
    openPopup('parking_result');
    const listEl = document.querySelector('#parking_items');

    listEl.innerHTML = '';

    if (carData.length === 0) {
      document.querySelector('#parking_slide').classList.add('arrow_hidden');
      const li = document.createElement('li');
      li.className = 'splide__slide';
      li.innerHTML = `
          <div class="popup_empty">
          조회된 차량이 없습니다.
          </div>
      `;
      listEl.appendChild(li);
    }else{
      document.querySelector('#parking_slide').classList.remove('arrow_hidden');
      carData.forEach(car => {
        const li = document.createElement('li');
        li.className = 'splide__slide';

        const match = car.carNo.match(/^(\d+)([가-힣]+)(\d+)$/);
        const [ , numPart, hangulPart, tailNumber ] = match;
        const prefix = numPart + hangulPart;
        const suffix = tailNumber;

        li.innerHTML = `
          <div class="parking_item">
            <div class="thum" style="background-image: url('${car.carPicName || '/images/car_default.jpg'}');"></div>
            <div class="content">
              <div class="item">
          <div class="tit">차량번호</div>
          <div class="cnt">
            <span class="prefix">${prefix}</span>
            <span class="suffix">${suffix}</span>
          </div>
              </div>
              <div class="item">
          <div class="tit">주차층</div>
          <div class="cnt">${car.levelNo}</div>
              </div>
              <div class="item">
          <div class="tit">구역</div>
          <div class="cnt">${car.location}</div>
              </div>
            </div>
          </div>
        `;
        listEl.appendChild(li);
      });
    }

    slideStart('parking_slide');
  }
  

// 키패드 버튼 이벤트 연결
keypadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.dataset.rel;
        let val = hiddenInput.value;

        if (key === 'delete') {
            val = val.slice(0, -1);
        } else if (key === 'search') {
            handleSearch(val);
            return;
        } else {
            if (val.length < maxDigits) {
                val += key;
            }
        }

        hiddenInput.value = val;
        updateDisplay();
    });
});


/**
 * 시설안내 진입 함수
 */
function page_parking() {
    hiddenInput.value = '';
    updateDisplay();
}


