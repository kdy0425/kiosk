class PinchZoom {
    constructor(element) {
        this.element = element;
        this.initScale = 1;
        this.currentScale = 1;
        this.lastTouches = [];
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentX = 0;
        this.currentY = 0;

        this.minMapScale = 0.3;
        this.maxMapScale = 2.0;

        // 추가 사항 아이콘 스케일값에 따른 크기 변화 20240910 lsj

        // 상점 아이콘 최소/최대 사이즈
        this.minStoreIconWidth = 60;
        this.maxStoreIconWidth = 100;
        
        // 편의시설 아이콘 최소/최대 사이즈
        this.minPubIconWidth = 40;
        this.maxPubIconWidth = 80;

        this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
        this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
        this.element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
        this.element.addEventListener('mousedown', this.onMouseDown.bind(this), { passive: true });
        this.element.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
        this.element.addEventListener('mouseup', this.onMouseUp.bind(this), { passive: true });
        this.element.addEventListener('wheel', this.onWheel.bind(this), { passive: true });
    }

    onTouchStart(event) {
        if (event.touches.length === 2) {
            this.initScale = this.currentScale;
            this.lastTouches = [...event.touches];
        } else if (event.touches.length === 1) {
            this.isDragging = true;
            const touch = event.touches[0];
            this.lastX = touch.clientX - this.currentX;
            this.lastY = touch.clientY - this.currentY;
        }
    }

    onTouchMove(event) {
        this.currentScale = this.getCurrentScale(this.element);
        if (event.touches.length === 2) {
            const dist1 = this.getDistance(this.lastTouches[0], this.lastTouches[1]);
            const dist2 = this.getDistance(event.touches[0], event.touches[1]);
            const scale = (dist2 - dist1) * 0.002;
            this.currentScale += scale;
            this.currentScale = Math.min(Math.max(this.minMapScale, this.currentScale), this.maxMapScale);
            this.element.querySelector(".divCenter").style.transform = `scale(${this.currentScale}) translate(${this.currentX}px, ${this.currentY}px)`;
            this.lastTouches = [...event.touches];
        } else if (this.isDragging && event.touches.length === 1) {
            const touch = event.touches[0];
            this.currentX = touch.clientX - this.lastX;
            this.currentY = touch.clientY - this.lastY;

            this.element.querySelector(".divCenter").style.transform = `scale(${this.currentScale}) translate(${this.currentX}px, ${this.currentY}px)`;
        }
    }


    onTouchEnd(event) {
        this.currentScale = this.getCurrentScale(this.element);
        if (event.touches.length < 2) {
            this.initScale = this.currentScale;
            this.isDragging = false;
        }
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.lastX = event.clientX - this.currentX;
        this.lastY = event.clientY - this.currentY;
    }

    onMouseMove(event) {
        if (this.isDragging) {
            this.currentX = event.clientX - this.lastX;
            this.currentY = event.clientY - this.lastY;
            this.element.querySelector(".divCenter").style.transform = `scale(${this.currentScale}) translate(${this.currentX}px, ${this.currentY}px)`;
        }
    }

    onMouseUp(event) {
        this.isDragging = false;
    }

    onWheel(event) {
        this.currentScale = this.getCurrentScale(this.element);
        const scaleAmount = -event.deltaY * 0.001;

        this.currentScale += scaleAmount;
        this.currentScale = Math.min(Math.max(this.minMapScale, this.currentScale), this.maxMapScale); // Limit scale between 0.5 and 4
        this.element.querySelector(".divCenter").style.transform = `scale(${this.currentScale}) translate(${this.currentX}px, ${this.currentY}px)`;

        this.getIconScale(this.element.querySelector(".divCenter"));
    }

    getDistance(touch1, touch2) {
        return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
    }

    getCurrentScale(element) {
        let currentScale = "1";
        let divCenter = element.querySelector(".divCenter");
        let style = window.getComputedStyle(divCenter);
        let transform = style.transform;

        if (transform && transform !== 'none') {
            // transform 값에서 matrix 또는 matrix3d 형태의 값을 얻습니다.
            let matrix = transform.match(/matrix.*\((.+)\)/)[1].split(', ');

            // 2D transform에서는 scaleX 값이 matrix[0]이고, scaleY 값이 matrix[3]에 위치합니다.
            let scaleX = parseFloat(matrix[0]);
            currentScale = scaleX;

            return currentScale;
        }
        return currentScale;
    }

    // 추가 사항 아이콘 스케일값에 따른 크기 변화 20240910 lsj
    getIconScale (target, isMovePinch = false) {
        let currentScale = parseFloat(this.currentScale.toFixed(1));
        let targetStoreArr = target.querySelectorAll('.store_info');
        let targetPubArr = target.querySelectorAll('.pub_info');

        const setIconScale = (item, min, max) => {
            let imgElement = item.querySelector('.img_bg');
            

            if (imgElement) {
                let originalWidth = imgElement.naturalWidth;
    
                let desiredWidth = originalWidth * currentScale;
                let scaleFactor = 1;
                
                if (desiredWidth < min) {
                    scaleFactor = min / desiredWidth;
                } else if (desiredWidth > max) {
                    scaleFactor = max / desiredWidth;
                }
                
                if(!isMovePinch){
                    imgElement.style.scale = scaleFactor !== 1 ? `${scaleFactor}` : 'none';
                } else {
                    imgElement.style.scale = 0.8;
                }

            } 
        }

        targetStoreArr.forEach(v => { setIconScale(v, this.minStoreIconWidth, this.maxStoreIconWidth); });
        targetPubArr.forEach(v => { setIconScale(v, this.minPubIconWidth, this.maxPubIconWidth); });
    }
}