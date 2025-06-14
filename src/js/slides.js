// 공통 옵션
const sharedOptions = {
    autoplay:         false,
    pauseOnHover:     false,
    pauseOnFocus:     false,
    pagination:       false,
    flickMaxPages:    0.3,
    flickPower:       400,
    dragMinThreshold: { mouse: 100, touch: 100 },
};

const slidesConfig = [
    {
        id: 'screen_saver_slide',
        overrides: {
        default:     { type: 'loop', perPage: 1, perMove: 1, arrows: false, fixedHeight:'100%' },
        lowPosition: { type: 'loop', perPage: 3, perMove: 3, arrows: false, fixedHeight:'100%' },
        },
    },
    {
        id: 'map_slide',
        overrides: {
        default:     { perPage: 1, perMove: 1, drag: false },
        lowPosition: { perPage: 1, perMove: 1, drag: false },
        },
    },
    {
        id: 'event_slide',
        overrides: {
        default:     { perPage: 1, perMove: 1, grid: {rows: 1, cols: 1} },
        lowPosition: { perPage: 1, perMove: 1, grid: {rows: 1, cols: 3} },
        },
        grid:'grid'
    },
    {
        id: 'facility_slide',
        overrides: {
        default:     { perPage: 1, perMove: 1, grid: {rows: 3, cols: 3} },
        lowPosition: { perPage: 1, perMove: 1, grid: {rows: 2, cols: 3} },
        },
        grid:'grid'
    },
    {
        id: 'store_slide',
        overrides: {
        default:     { perPage: 1, perMove: 1, grid: {rows: 4, cols: 2} },
        lowPosition: { perPage: 1, perMove: 1, grid: {rows: 2, cols: 2} },
        },
        grid:'grid'
    },
    {
        id: 'food_slide',
        overrides: {
        default:     { perPage: 1, perMove: 1, grid: {rows: 4, cols: 2} },
        lowPosition: { perPage: 1, perMove: 1, grid: {rows: 2, cols: 2} },
        },
        grid:'grid'
    },
    {
        id: 'store_cate_slide',
        overrides: {
        default:     { perPage: 1, perMove: 1, grid: {rows: 1, cols: 100}, drag: false },
        lowPosition: { perPage: 1, perMove: 1, grid: {rows: 1, cols: 5} },
        },
        grid:'grid'
    },
    {
        id: 'parking_slide',
        templete: true,
        overrides: {
        default:     { perPage: 1, perMove: 1, grid: {rows: 2, cols: 1}},
        lowPosition: { perPage: 1, perMove: 1, grid: {rows: 2, cols: 1} },
        },
        grid:'grid'
    }
];

const slideInstances = {};

/**
 * 
 * @param {String} target - 개별작동 타겟
 * 전체 슬라이드 시작
 */
function slideStart(target) {
    slidesConfig.forEach(cfg => {
        if(!target && cfg.templete) return;//전체 작동이면 템플릿은 제외
        if(target && (cfg.id !== target)){
            return;
        }
        const opts = { ...sharedOptions, ...cfg.overrides.default };
        const splide = new Splide(`#${cfg.id}`, opts);
        if (cfg.grid) {
            splide.mount( window.splide.Extensions );
        } else {
            splide.mount();
        }
        slideInstances[cfg.id] = splide;
        initCounter(splide, `#${cfg.id} .slide-counter`);
        if (cfg.id === 'screen_saver_slide') {
            initScreenSaverTimer(splide);
        }else{
            initEventSlideControls(splide);
        }
    });
    return Promise.resolve();
}

// 카운터
function initCounter(splide, selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    function update() {
        const total = splide.length > 0 ? splide.length : 1;
        const current = splide.index + 1;
        container.innerHTML = `${current} / <strong>${total}</strong>`;
    }
    splide.on('mounted moved refresh updated', update);
    update();
}
  

// 스크린세이버 전용 타이머 함수
function initScreenSaverTimer(splide) {
    let slideTimer;

    function startTimer(idx) {
        // 모든 비디오 리셋
        splide.Components.Elements.slides.forEach(slide => {
        const v = slide.querySelector('video');
        if (v) { v.pause(); v.currentTime = 0; }
        });

        // 현재 슬라이드 가져와서 time-data 읽기
        const curr     = splide.Components.Elements.slides[idx];
        const timeout  = (parseInt(curr.dataset.slideTime, 10) || 5) * 1000;
        const videoTag = curr.querySelector('video');

        // 비디오 있으면 재생 & onended 처리
        if (videoTag) {
        videoTag.play();
        videoTag.onended = () => {
            clearTimeout(slideTimer);
            splide.go('>');
        };
        }
        clearTimeout(slideTimer);
        slideTimer = setTimeout(() => splide.go('>'), timeout);
    }
    splide.on('mounted moved', () => startTimer(splide.index));
    startTimer(splide.index);
}

// 행사안내 컨트롤
function initEventSlideControls(splide) {
    // video 리셋 함수
    function resetVideos() {
        document
        .querySelectorAll('#event_slide .slide_video')
        .forEach(container => {
            const v = container.querySelector('video');
            if (v) { v.pause(); v.currentTime = 0; }
            container.querySelector('.play').classList.remove('active');
            container.querySelector('.pause').classList.remove('active');
        });
    }

    // Splide 이동 시 리셋
    splide.on('mounted moved', () => {
        resetVideos();
    });
}

// 저자세 모드 모든 슬라이드 perPage/perMove 변경
function applyLowScreen(isLow) {
    slidesConfig.forEach(cfg => {
        if(cfg.templete) return;//전체 작동이면 템플릿은 제외
        const splide   = slideInstances[cfg.id];
        const override = isLow
        ? cfg.overrides.lowPosition
        : cfg.overrides.default;

        splide.options = {
        ...sharedOptions,
        ...override,
        };
        splide.refresh();
    });
}
