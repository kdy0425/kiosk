
// 포커스 기능정리
// 공통사항 이전 focus , 다음 focus가 display:none이거나 상위 element들에 display:none이여서 안보이면 그 이전 혹은 다음 focus-group으로 건너뜀 
// 키보드 좌 : 이전 focus로  만약 focus-group의 첫번째 아이템이면 이전 focus-group의 마지막 아이템으로 이동함. 만약 첫번째focus-group의 첫번째 focus아이템이면 그냥 그대로 둠
// 키보드 우: focus가 없으면 처음부터 focus시작함. 다음 focus로 이동. 만약 focus-group의 마지막 focus아이템이면 다음 focus-group의 첫번째 focus가능한 아이템으로  만약 마지막 focus-group의 마지막 아이템이면 첫번쨰 focus-group의 첫번째 아이템으로
// 키보드 아래: 다음 focus-group 의 첫번째 focus가능한 아이템으로 focus
// 키보드 위 : 이전 focus-group의 첫번째 focus가능한 아이템으로 focus
// 팝업 안에서의 focus면 팝업 안에서만 focus가 돌아야함. 팝업 열린 상태로 focus잃으면 상하좌우 방향키 누르면 팝업의 첫번째 아이템 선택
document.addEventListener('keydown', (e) => {
  const key = e.key;
  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"], .focus_text)';
  //initLeftTime();

  //시간연장 팝업이 열린상태에서 키패드 입력 들어오면 닫음
  //document.querySelector('#id_popup_timer').style.display = 'none';

  // 로딩중 팝업이 떠있으면 그냥 리턴
  // if (getComputedStyle(document.querySelector('#popup_loading')).display == '') {
  //     console.log('로딩중');
  //     return;
  // }

  const isVisible = (el) => {
      return !!el && el.offsetParent !== null &&
          window.getComputedStyle(el).display !== 'none' &&
          !el.closest('[aria-hidden="true"], [style*="display: none"]');
  };

  const getAllFocusGroups = (scope = document) => {
      const groups = [];

      if (scope.matches?.('[focus-group]') && isVisible(scope)) {
          groups.push(scope);
      }

      const innerGroups = Array.from(scope.querySelectorAll('[focus-group]')).filter(isVisible);
      return groups.concat(innerGroups);
  };

  const getVisibleFocusable = (group) => {
      return Array.from(group.querySelectorAll(focusableSelector)).filter(el => {
          if (!isVisible(el)) return false;

          // 제외 조건: .floating_top 내의 .select_btns 내부에 있는 버튼
          // const inFloatingTop = group.closest('.floating_top');
          // if (inFloatingTop && el.closest('.select_btns')) {
          //     return false;
          // }

          return true;
      });
  };

  const getPopup = () => document.querySelector('.popup_wrap.show');
  const getControl = () =>
      Array.from(document.querySelectorAll('.select_btns')).find(el => {
          return window.getComputedStyle(el).display !== 'none';
      });

  const getScope = () => {
      const popup = getPopup();
      if (popup && popup.contains(document.activeElement)) return popup;
      const control = getControl();
      if (control && control.contains(document.activeElement)) return control;

      return document;
  };

  const moveFocusTo = (el, groupFlag) => {
      console.log('moveFocusTo', el)
      if (!el) return;

      const targetScope = getScope();
      const allGroups = getAllFocusGroups(targetScope);
      const allFocusable = allGroups.flatMap(getVisibleFocusable);
      // const isFirst = el === allFocusable[0];
      // const isLast = el === allFocusable[allFocusable.length - 1];

      el.focus();

      let ttsScript = '';
      // if (groupFlag) ttsScript += getTTSText(el.closest('[focus-group]'));
      // ttsScript += getTTSText(el);

      // if (isFirst) {
      //     ttsScript += targetScope === document ? ", 화면의 첫 요소입니다" : ", 팝업의 첫 요소입니다";    // control 내부에서는 ? 
      // } else if (isLast) {
      //     ttsScript += targetScope === document ? ", 화면의 마지막 요소입니다" : ", 팝업의 마지막 요소입니다";
      // }
      //handleText(ttsScript);
  };

  const findNextGroupIndex = (groups, startIndex, step) => {
      let index = startIndex + step;
      while (index >= 0 && index < groups.length) {
          if (getVisibleFocusable(groups[index]).length > 0) return index;
          index += step;
      }
      return -1;
  };

  const activeEl = document.activeElement;
  const popup = getPopup();
  const scope = getScope();
  // const control = getControl();
  const groups = getAllFocusGroups(scope);
  if (groups.length === 0) return;

  const currentGroup = groups.find(group => group.contains(activeEl));
  const currentGroupIndex = groups.indexOf(currentGroup);
  const currentItems = currentGroup ? getVisibleFocusable(currentGroup) : [];

  const handleFocusLostInPopup = () => {
      if (popup && !popup.contains(activeEl)) {
          const firstGroup = getAllFocusGroups(popup)[0];
          const firstItem = firstGroup && getVisibleFocusable(firstGroup)[0];
          if (firstItem) {
              e.preventDefault();
              moveFocusTo(firstItem);
          }
          return true;
      }
      return false;
  };

  if (handleFocusLostInPopup()) return;

  const handleLeft = () => {
      if (!currentGroup) return;

      const index = currentItems.indexOf(activeEl);
      if (index > 0) {
          moveFocusTo(currentItems[index - 1]);
      } else {
          // 그룹 내에서 루프: 맨 앞이면 맨 뒤로
          moveFocusTo(currentItems[currentItems.length - 1]);
      }
  };

  const handleRight = () => {
      if (!currentGroup) return;

      const index = currentItems.indexOf(activeEl);
      if (index < currentItems.length - 1) {
          moveFocusTo(currentItems[index + 1]);
      } else {
          // 그룹 내에서 루프: 맨 뒤면 맨 앞으로
          moveFocusTo(currentItems[0]);
      }
  };

  const handleDown = () => {
      const nextGroupIndex = findNextGroupIndex(groups, currentGroupIndex, 1);
      if (nextGroupIndex >= 0) {
          const nextItems = getVisibleFocusable(groups[nextGroupIndex]);
          moveFocusTo(nextItems[0], true);
      }
  };

  const handleUp = () => {
      const prevGroupIndex = findNextGroupIndex(groups, currentGroupIndex, -1);
      if (prevGroupIndex >= 0) {
          const prevItems = getVisibleFocusable(groups[prevGroupIndex]);
          moveFocusTo(prevItems[0], true);
      }
  };

  const handleBack = () => {
      if (document.querySelector('.floating_top .item.active')) closeControlItem();
      else if (document.querySelector('.popup_wrap.show')) closePopup();
      else loadPreviousStep();
  }

  switch (key) {
      case 'ArrowLeft':
          e.preventDefault();
          handleLeft();
          break;
      case 'ArrowRight':
          e.preventDefault();
          handleRight();
          break;
      case 'ArrowDown':
          e.preventDefault();
          handleDown();
          break;
      case 'ArrowUp':
          e.preventDefault();
          handleUp();
          break;
      // case 'Enter':
      //     e.preventDefault();
      //     const isCutomEnterTTS = e.target.closest('.floating_top') || e.target.closest('.floating_bottom') || e.target.closest('.select_cate') || e.target.closest('#order_confirm.disabled') || e.target.closest('#order_clear.disabled') || e.target.closest('#menu_slide') || (e.target.id == 'confirm_payment' && e.target.classList.contains('disabled'));
      //     if (!isCutomEnterTTS) {
      //         if (e.target.type === 'checkbox' || e.target.classList.contains('item_box'))
      //             handleText('선택됨');
      //         else
      //             handleText('확인');
      //     }
      //     if(document.activeElement.id == 'phoneNumber'){
      //         document.querySelector('#btn_confirm').click();
      //     }else{
      //         e.target.dataset.trigger = 'key';
      //         e.target.click();
      //     }
      //     break;
      // case 'Backspace':
      //     e.preventDefault();
      //     playBeapAudio();
      //     handleBack();
      //     break;
      // case '*':
      //     e.preventDefault();
      //     handleText(ttsTextData['common_use']);
      //     break;
      // case '#':
      //     e.preventDefault();
      //     replayText();
      //     break;
      // case 'Home':
      //     e.preventDefault();
      //     onClickReturnHome();
      //     playBeapAudio();
      //     break;
      // case '0':
      // case '1':
      // case '2':
      // case '3':
      // case '4':
      // case '5':
      // case '6':
      // case '7':
      // case '8':
      // case '9':
      //     e.preventDefault();
      //     const currentPopup = document.querySelector('#order_info_wrap');
      //     if(currentPopup.classList.contains('show') && currentPopup.querySelector('.keypad')){
      //         currentPopup.querySelector('.keypad [data-val="'+ e.key+'"]').click();
      //         currentPopup.querySelector('#phoneNumber').focus();
      //         handleText(e.key);
      //     }            
      //     break;
  }
});