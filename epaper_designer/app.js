/**
 * E-Paper Designer Core Logic
 * Developed by purndal with Antigravity (Gemini)
 * Version: 0.1.4
 * License: MIT
 */

class Designer {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.elements = [];
        this.selectedId = null;
        this.editor = null;
        this.config = { rotate: 0, size: '250x128', customW: 250, customH: 128 }; // Default (2.13")

        // Available standard sizes (34 types)
        this.availableSizes = [
            { id: '128x128', w: 128, h: 128 }, { id: '144x200', w: 144, h: 200 },
            { id: '152x152', w: 152, h: 152 }, { id: '152x200', w: 152, h: 200 },
            { id: '160x80', w: 160, h: 80 }, { id: '200x200', w: 200, h: 200 },
            { id: '212x104', w: 212, h: 104 }, { id: '250x128', w: 250, h: 128 },
            { id: '250x136', w: 250, h: 136 }, { id: '256x128', w: 256, h: 128 },
            { id: '264x136', w: 264, h: 136 }, { id: '264x176', w: 264, h: 176 },
            { id: '296x128', w: 296, h: 128 }, { id: '296x152', w: 296, h: 152 },
            { id: '296x160', w: 296, h: 160 }, { id: '300x200', w: 300, h: 200 },
            { id: '320x172', w: 320, h: 172 }, { id: '360x184', w: 360, h: 184 },
            { id: '384x168', w: 384, h: 168 }, { id: '384x184', w: 384, h: 184 },
            { id: '400x300', w: 400, h: 300 }, { id: '480x176', w: 480, h: 176 },
            { id: '480x480', w: 480, h: 480 }, { id: '522x152', w: 522, h: 152 },
            { id: '600x448', w: 600, h: 448 }, { id: '640x384', w: 640, h: 384 },
            { id: '640x400', w: 640, h: 400 }, { id: '648x480', w: 648, h: 480 },
            { id: '720x256', w: 720, h: 256 }, { id: '792x272', w: 792, h: 272 },
            { id: '800x480', w: 800, h: 480 }, { id: '960x640', w: 960, h: 640 },
            { id: '960x672', w: 960, h: 672 }, { id: '960x768', w: 960, h: 768 }
        ];

        // Standard Colors from 참고.md
        this.colorList = [
            { id: 0, name: 'color_white', hex: '#ffffff' },
            { id: 1, name: 'color_black', hex: '#000000' },
            { id: 2, name: 'color_red', hex: '#ff0000' },
            { id: 3, name: 'color_yellow', hex: '#ffff00' },
            { id: 4, name: 'color_lightgray', hex: '#c0c0c0' },
            { id: 5, name: 'color_darkgray', hex: '#808080' },
            { id: 6, name: 'color_pink', hex: '#ffc0cb' },
            { id: 7, name: 'color_brown', hex: '#8b4513' },
            { id: 8, name: 'color_green', hex: '#008000' },
            { id: 9, name: 'color_blue', hex: '#0000ff' },
            { id: 10, name: 'color_orange', hex: '#ffa500' }
        ];

        // Font Metadata
        this.fonts = [
            { id: 'NanumSubset', ko: '나눔고딕', en: 'NanumGothic', path: 'fonts/NanumSubset.ttf' },
            { id: 'NanumBoldSubset', ko: '나눔고딕 Bold', en: 'NanumGothic Bold', path: 'fonts/NanumBoldSubset.ttf' },
            { id: 'Inter', ko: '인터 (Inter)', en: 'Inter', path: 'fonts/Inter.ttf' },
            { id: 'InterBold', ko: '인터 Bold (Inter Bold)', en: 'Inter Bold', path: 'fonts/Inter_bold.ttf' },
            { id: 'neodgm', ko: '둥근모꼴', en: 'Neodgm', path: 'fonts/neodgm.ttf' },
            { id: 'BlackHanSans', ko: '블랙한산스', en: 'Black Han Sans', path: 'fonts/BlackHanSans-Regular.ttf' },
            { id: 'Signika-SB', ko: '시그니카 SB', en: 'Signika SemiBold', path: 'fonts/Signika-SB.ttf' }
        ];

        // Interaction states
        this.isDragging = false;
        this.isResizing = false;
        this.dragTarget = null;
        this.resizeHandle = null; // 'nw', 'ne', 'sw', 'se' or 'p2' (for line)
        this.lastMousePos = { x: 0, y: 0 };

        // Snapping
        this.snapLines = { x: null, y: null };
        this.snapThreshold = 5;
        this.handleSize = 6;
        this.zoom = 2.0;

        // Clipboard for v0.0.2
        this.clipboard = null;

        this.init();
    }

    init() {
        this.setupCodeMirror();
        this.loadURLParams();
        this.attachEvents();
        this.updateCanvasSize(); // Ensure canvas size matches initial rotation
        this.setZoom(this.zoom);
        this.render();
    }

    loadURLParams() {
        const params = new URLSearchParams(window.location.search);
        const mac = params.get('mac');
        const url = params.get('url');
        if (mac) document.getElementById('target-mac').value = mac;
        if (url) document.getElementById('target-url').value = url;
    }

    updateCanvasSize() {
        const rotation = this.config.rotate;
        let baseWidth = this.config.customW || 250;
        let baseHeight = this.config.customH || 128;

        const sizeInfo = this.availableSizes.find(s => s.id === this.config.size);
        if (sizeInfo && this.config.size !== 'custom') {
            baseWidth = sizeInfo.w;
            baseHeight = sizeInfo.h;
            this.config.customW = baseWidth;
            this.config.customH = baseHeight;
        }

        if (rotation === 1 || rotation === 3) {
            this.canvas.width = baseHeight;
            this.canvas.height = baseWidth;
        } else {
            this.canvas.width = baseWidth;
            this.canvas.height = baseHeight;
        }

        this.elements.forEach(el => this.constrainElement(el));
    }

    setupCodeMirror() {
        const container = document.getElementById('codemirror-container');
        if (!container) return;

        this.editor = CodeMirror(container, {
            value: JSON.stringify(this.getEsp32Json(), null, 2),
            mode: 'application/json',
            theme: 'dracula',
            lineNumbers: true,
            tabSize: 2,
            viewportMargin: Infinity
        });

        // Real-time Validation with Debounce
        let validationTimeout;
        this.editor.on('change', () => {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => this.validateJson(), 300);
        });

        document.getElementById('apply-json').addEventListener('click', () => {
            try {
                const data = JSON.parse(this.editor.getValue());
                this.parseEsp32Json(data);
                this.render();
                this.updateLayerList();
                this.showToast(t('toast_update') || "Updated");
                this.validateJson(); // Clear error on successful apply
            } catch (e) {
                this.showToast("Invalid JSON", "error");
                console.error("JSON Parse Error:", e);
                this.validateJson(); // Ensure error is shown
            }
        });
    }

    validateJson() {
        const errorMsgBox = document.getElementById('json-error-msg');
        const wrapper = this.editor.getWrapperElement();
        try {
            JSON.parse(this.editor.getValue());
            wrapper.classList.remove('editor-error');
            errorMsgBox.classList.remove('visible');
            errorMsgBox.textContent = '';
        } catch (e) {
            wrapper.classList.add('editor-error');
            errorMsgBox.classList.add('visible');
            errorMsgBox.textContent = `Error: ${e.message}`;
        }
    }

    attachEvents() {
        document.getElementById('add-text').addEventListener('click', () => this.addElement('text'));
        document.getElementById('add-rect').addEventListener('click', () => this.addElement('rect'));
        document.getElementById('add-tri').addEventListener('click', () => this.addElement('tri'));
        document.getElementById('add-line').addEventListener('click', () => this.addElement('line'));

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());

        document.getElementById('export-btn').addEventListener('click', () => this.exportDesign());
        document.getElementById('import-btn').addEventListener('click', () => this.importDesign());
        document.getElementById('send-btn').addEventListener('click', () => this.sendData());

        // Keyboard Shortcuts for v0.0.2
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        const langSelect = document.getElementById('lang-select');
        langSelect.value = currentLang;
        langSelect.onchange = (e) => {
            currentLang = e.target.value;
            setLanguage(currentLang);
            this.updateLayerList();
            this.updatePropEditor();
        };

        // MAC/URL Sync to URL
        const syncInputs = ['target-mac', 'target-url'];
        syncInputs.forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateURLParams());
        });

        translatePage();
    }

    /**
     * Update URL Parameters with MAC, URL and a random v value (requested for cache-busting/history)
     */
    updateURLParams() {
        const mac = document.getElementById('target-mac').value;
        const url = document.getElementById('target-url').value;
        const params = new URLSearchParams(window.location.search);
        if (mac) params.set('mac', mac); else params.delete('mac');
        if (url) params.set('url', url); else params.delete('url');
        params.delete('v'); // v 값 제거

        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }

    addElement(type) {
        const id = Date.now();
        let element = { id, type, x: 20, y: 20, visible: true, color: 'black' };

        if (type === 'text') {
            element = { ...element, text: 'New Text', size: 16, font: 'NanumSubset', align: 'left' };
        } else if (type === 'rect') {
            element = { ...element, w: 50, h: 30, filled: 'none' };
        } else if (type === 'tri') {
            element = { ...element, w: 40, h: 40, filled: 'none' };
        } else if (type === 'line') {
            element = { ...element, x2: 60, y2: 60 };
        }

        this.elements.push(element);
        this.selectedId = id;
        this.updateEditor();
        this.updateLayerList();
        this.updatePropEditor();
        this.render();
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / this.zoom;
        const mouseY = (e.clientY - rect.top) / this.zoom;

        // 1. Check Resize Handles if something is selected
        if (this.selectedId) {
            const el = this.elements.find(e => e.id === this.selectedId);
            const handle = this.getHitHandle(el, mouseX, mouseY);
            if (handle) {
                this.isResizing = true;
                this.resizeHandle = handle;
                this.dragTarget = el;
                this.lastMousePos = { x: mouseX, y: mouseY };
                return;
            }
        }

        // 2. Select Element
        const target = [...this.elements].reverse().find(el => this.isMouseInElement(el, mouseX, mouseY));
        if (target) {
            this.selectedId = target.id;
            this.isDragging = true;
            this.dragTarget = target;
            this.dragOffset = { x: mouseX - target.x, y: mouseY - target.y };
            if (target.type === 'line') {
                this.dragOffset2 = { x: mouseX - target.x2, y: mouseY - target.y2 };
            }
            this.lastMousePos = { x: mouseX, y: mouseY };
        } else {
            this.selectedId = null;
        }

        this.updatePropEditor();
        this.updateLayerList();
        this.render();
    }

    getHitHandle(el, mx, my) {
        if (el.type === 'line') {
            if (this.hitTestCircle(mx, my, el.x, el.y, this.handleSize)) return 'p1';
            if (this.hitTestCircle(mx, my, el.x2, el.y2, this.handleSize)) return 'p2';
            return null;
        }

        const b = this.getElementBounds(el);
        if (this.hitTestCircle(mx, my, b.x, b.y, this.handleSize)) return 'nw';
        if (this.hitTestCircle(mx, my, b.x + b.w, b.y, this.handleSize)) return 'ne';
        if (this.hitTestCircle(mx, my, b.x, b.y + b.h, this.handleSize)) return 'sw';
        if (this.hitTestCircle(mx, my, b.x + b.w, b.y + b.h, this.handleSize)) return 'se';
        return null;
    }

    hitTestCircle(mx, my, cx, cy, radius) {
        return Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2) <= radius + 2;
    }

    isMouseInElement(el, mx, my) {
        if (el.type === 'line') {
            const dist = this.distToSegment({ x: mx, y: my }, { x: el.x, y: el.y }, { x: el.x2, y: el.y2 });
            return dist < 5;
        }
        const b = this.getElementBounds(el);
        return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
    }

    distToSegment(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 == 0) return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt((p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2);
    }

    getElementBounds(el) {
        if (el.type === 'text') {
            this.ctx.font = `${el.size}px "${el.font || 'Inter'}"`;
            const metrics = this.ctx.measureText(el.text);
            const w = metrics.width;
            const h = el.size;
            let x = el.x;
            if (el.align === 'center') x -= w / 2;
            else if (el.align === 'right') x -= w;
            return { x, y: el.y, w, h }; // Baseline is top now
        } else if (el.type === 'line') {
            return { x: Math.min(el.x, el.x2), y: Math.min(el.y, el.y2), w: Math.abs(el.x - el.x2), h: Math.abs(el.y - el.y2) };
        }
        return { x: el.x, y: el.y, w: el.w, h: el.h };
    }

    constrainElement(el) {
        if (el.type === 'line') {
            el.x = Math.max(0, Math.min(this.canvas.width, el.x));
            el.y = Math.max(0, Math.min(this.canvas.height, el.y));
            el.x2 = Math.max(0, Math.min(this.canvas.width, el.x2));
            el.y2 = Math.max(0, Math.min(this.canvas.height, el.y2));
            return;
        }

        const b = this.getElementBounds(el);
        if (b.x < 0) el.x = Math.round(el.x - b.x);
        if (b.y < 0) el.y = Math.round(el.y - b.y);
        if (b.x + b.w > this.canvas.width) el.x = Math.round(el.x - (b.x + b.w - this.canvas.width));
        if (b.y + b.h > this.canvas.height) el.y = Math.round(el.y - (b.y + b.h - this.canvas.height));

        // For shapes, ensure width/height don't exceed canvas
        if (el.type !== 'text') {
            if (el.w > this.canvas.width) el.w = this.canvas.width;
            if (el.h > this.canvas.height) el.h = this.canvas.height;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = Math.round(Math.max(0, Math.min(this.canvas.width, (e.clientX - rect.left) / this.zoom)));
        const mouseY = Math.round(Math.max(0, Math.min(this.canvas.height, (e.clientY - rect.top) / this.zoom)));

        if (this.isResizing && this.dragTarget) {
            this.performResize(mouseX, mouseY);
        } else if (this.isDragging && this.dragTarget) {
            this.performMove(mouseX, mouseY);
        }

        this.lastMousePos = { x: mouseX, y: mouseY };
        this.render();
    }

    performResize(mx, my) {
        const el = this.dragTarget;
        if (el.type === 'line') {
            let nextX = Math.round(mx);
            let nextY = Math.round(my);

            // Horizontal/Vertical Snap
            const threshold = 5;
            if (this.resizeHandle === 'p1') {
                if (Math.abs(nextX - el.x2) < threshold) nextX = el.x2;
                if (Math.abs(nextY - el.y2) < threshold) nextY = el.y2;
                el.x = nextX; el.y = nextY;
            } else {
                if (Math.abs(nextX - el.x) < threshold) nextX = el.x;
                if (Math.abs(nextY - el.y) < threshold) nextY = el.y;
                el.x2 = nextX; el.y2 = nextY;
            }
        } else {
            const dx = mx - this.lastMousePos.x;
            const dy = my - this.lastMousePos.y;

            // Temporary new values
            let nextX = el.x;
            let nextY = el.y;
            let nextW = el.w;
            let nextH = el.h;

            if (this.resizeHandle.includes('e')) nextW += dx;
            if (this.resizeHandle.includes('w')) { nextX += dx; nextW -= dx; }
            if (this.resizeHandle.includes('s')) nextH += dy;
            if (this.resizeHandle.includes('n')) { nextY += dy; nextH -= dy; }

            // Min size floor
            if (nextW < 5) {
                if (this.resizeHandle.includes('w')) nextX -= (5 - nextW);
                nextW = 5;
            }
            if (nextH < 5) {
                if (this.resizeHandle.includes('n')) nextY -= (5 - nextH);
                nextH = 5;
            }

            // Apply with boundary checks
            if (nextX < 0) { nextW += nextX; nextX = 0; }
            if (nextY < 0) { nextH += nextY; nextY = 0; }
            if (nextX + nextW > this.canvas.width) nextW = this.canvas.width - nextX;
            if (nextY + nextH > this.canvas.height) nextH = this.canvas.height - nextY;

            el.x = Math.round(nextX);
            el.y = Math.round(nextY);
            el.w = Math.round(nextW);
            el.h = Math.round(nextH);
        }
        this.constrainElement(el);
        this.updatePropEditor();
    }

    performMove(mx, my) {
        const el = this.dragTarget;
        let newX = mx - this.dragOffset.x;
        let newY = my - this.dragOffset.y;

        // Snap Logic
        this.snapLines = { x: null, y: null };
        const canvasMidX = this.canvas.width / 2;
        const canvasMidY = this.canvas.height / 2;

        if (el.type !== 'line') {
            const b = this.getElementBounds({ ...el, x: newX, y: newY });
            if (Math.abs(b.x + b.w / 2 - canvasMidX) < this.snapThreshold) {
                newX += (canvasMidX - (b.x + b.w / 2));
                this.snapLines.x = canvasMidX;
            }
            if (Math.abs(b.y + b.h / 2 - canvasMidY) < this.snapThreshold) {
                newY += (canvasMidY - (b.y + b.h / 2));
                this.snapLines.y = canvasMidY;
            }
        }

        if (el.type === 'line') {
            el.x = Math.round(newX);
            el.y = Math.round(newY);
            el.x2 = Math.round(mx - this.dragOffset2.x);
            el.y2 = Math.round(my - this.dragOffset2.y);
        } else {
            el.x = Math.round(newX);
            el.y = Math.round(newY);
        }
        this.constrainElement(el);

        this.updatePropEditor();
    }

    handleMouseUp() {
        if (this.isDragging || this.isResizing) {
            this.isDragging = false;
            this.isResizing = false;
            this.dragTarget = null;
            this.snapLines = { x: null, y: null };
            this.updateEditor();
            this.render();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Guids
        this.drawGuides();

        this.elements.forEach(el => {
            if (!el.visible) return;
            this.ctx.save();
            this.ctx.strokeStyle = this.getColorHex(el.color);
            this.ctx.fillStyle = el.filled === 'none' ? 'transparent' : this.getColorHex(el.filled || el.color);
            this.ctx.lineWidth = 1;

            if (el.type === 'rect') {
                if (el.filled && el.filled !== 'none') {
                    this.ctx.fillRect(el.x, el.y, el.w, el.h);
                }
                this.ctx.strokeRect(el.x, el.y, el.w, el.h);
            } else if (el.type === 'tri') {
                this.ctx.beginPath();
                this.ctx.moveTo(el.x + el.w / 2, el.y);
                this.ctx.lineTo(el.x, el.y + el.h);
                this.ctx.lineTo(el.x + el.w, el.y + el.h);
                this.ctx.closePath();
                if (el.filled && el.filled !== 'none') this.ctx.fill();
                this.ctx.stroke();
            } else if (el.type === 'text') {
                this.ctx.fillStyle = this.getColorHex(el.color);
                this.ctx.font = `${el.size}px "${el.font}"`;
                this.ctx.textAlign = el.align;
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(el.text, el.x, el.y);
            } else if (el.type === 'line') {
                this.ctx.beginPath();
                this.ctx.moveTo(el.x, el.y);
                this.ctx.lineTo(el.x2, el.y2);
                this.ctx.stroke();
            }

            // Draw selection box & Handles
            if (el.id === this.selectedId) {
                this.ctx.strokeStyle = '#38bdf8';
                this.ctx.fillStyle = '#38bdf8';
                this.ctx.lineWidth = 1;

                if (el.type === 'line') {
                    this.fillCircle(el.x, el.y, 5);
                    this.fillCircle(el.x2, el.y2, 5);
                    // Add thin stroke to handles for better visibility on dark elements
                    this.ctx.strokeStyle = 'white';
                    this.ctx.stroke();
                } else {
                    const b = this.getElementBounds(el);
                    // Selection Outline
                    this.ctx.setLineDash([2, 2]);
                    this.ctx.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
                    this.ctx.setLineDash([]);

                    // Corners (Squares for shapes, but user said circles or squares - let's use slightly rounded squares or circles)
                    this.ctx.fillStyle = '#38bdf8';
                    const hs = 6; // Handle size
                    this.ctx.fillRect(b.x - hs / 2, b.y - hs / 2, hs, hs);
                    this.ctx.fillRect(b.x + b.w - hs / 2, b.y - hs / 2, hs, hs);
                    this.ctx.fillRect(b.x - hs / 2, b.y + b.h - hs / 2, hs, hs);
                    this.ctx.fillRect(b.x + b.w - hs / 2, b.y + b.h - hs / 2, hs, hs);

                    // Add white borders to handles
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(b.x - hs / 2, b.y - hs / 2, hs, hs);
                    this.ctx.strokeRect(b.x + b.w - hs / 2, b.y - hs / 2, hs, hs);
                    this.ctx.strokeRect(b.x - hs / 2, b.y + b.h - hs / 2, hs, hs);
                    this.ctx.strokeRect(b.x + b.w - hs / 2, b.y + b.h - hs / 2, hs, hs);
                }
            }
            this.ctx.restore();
        });
    }

    getColorHex(color) {
        if (typeof color === 'number') {
            const found = this.colorList.find(c => c.id === color);
            return found ? found.hex : '#000000';
        }
        const named = this.colorList.find(c => c.name.split('_')[1] === color);
        if (named) return named.hex;
        return typeof color === 'string' && color.startsWith('#') ? color : '#000000';
    }

    drawGuides() {
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        if (this.snapLines.x) {
            this.ctx.beginPath(); this.ctx.moveTo(this.snapLines.x, 0); this.ctx.lineTo(this.snapLines.x, this.canvas.height); this.ctx.stroke();
        }
        if (this.snapLines.y) {
            this.ctx.beginPath(); this.ctx.moveTo(0, this.snapLines.y); this.ctx.lineTo(this.canvas.width, this.snapLines.y); this.ctx.stroke();
        }
        this.ctx.setLineDash([]);
    }

    drawSelection(el) {
        this.ctx.lineWidth = 1;
        const b = this.getElementBounds(el);
        this.ctx.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);

        // Draw Handles
        this.ctx.fillStyle = '#38bdf8';
        if (el.type === 'line') {
            this.fillCircle(el.x, el.y, 4);
            this.fillCircle(el.x2, el.y2, 4);
        } else {
            this.fillCircle(b.x, b.y, 4);
            this.fillCircle(b.x + b.w, b.y, 4);
            this.fillCircle(b.x, b.y + b.h, 4);
            this.fillCircle(b.x + b.w, b.y + b.h, 4);
        }
    }

    fillCircle(x, y, r) {
        this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, Math.PI * 2); this.ctx.fill();
    }

    updateEditor() {
        if (this.editor) {
            const esp32Data = this.getEsp32Json();
            // Format JSON to show each item on a single line for better readability
            const formattedJson = "[\n" + esp32Data.map(item => "  " + JSON.stringify(item)).join(",\n") + "\n]";
            this.editor.setValue(formattedJson);
        }
    }

    setZoom(value) {
        this.zoom = Math.max(0.5, Math.min(5.0, value));
        const holder = document.getElementById('canvas-holder');
        if (holder) {
            holder.style.transform = `scale(${this.zoom})`;
        }
        const zoomText = document.getElementById('zoom-level');
        if (zoomText) {
            zoomText.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }

    updateLayerList() {
        const list = document.getElementById('layer-list');
        list.innerHTML = '';
        [...this.elements].reverse().forEach((el, idx) => {
            const actualIdx = this.elements.length - 1 - idx;
            const li = document.createElement('li');
            li.className = `layer-item ${el.id === this.selectedId ? 'selected' : ''}`;
            li.draggable = true;

            let layerLabel = t('type_' + el.type);
            if (el.type === 'text') {
                const previewText = el.text.length > 20 ? el.text.substring(0, 20) + '...' : el.text;
                layerLabel = previewText;
            }

            li.innerHTML = `
                <span class="layer-name" title="${el.type === 'text' ? el.text : ''}">${layerLabel}</span>
                <div class="layer-controls">
                    <button onclick="app.moveLayer(${actualIdx}, 1)" title="${t('layer_up')}"><i class="material-icons">arrow_drop_up</i></button>
                    <button onclick="app.moveLayer(${actualIdx}, -1)" title="${t('layer_down')}"><i class="material-icons">arrow_drop_down</i></button>
                    <button class="del-btn" onclick="app.deleteElement(${el.id})"><i class="material-icons">clear</i></button>
                </div>
            `;

            // Selection
            li.onclick = (e) => {
                if (e.target.closest('button')) return;
                this.selectedId = el.id;
                this.updatePropEditor();
                this.updateLayerList();
                this.render();
            };

            // Drag & Drop
            li.ondragstart = (e) => {
                e.dataTransfer.setData('text/plain', actualIdx);
                li.classList.add('dragging');
            };
            li.ondragend = () => li.classList.remove('dragging');
            li.ondragover = (e) => {
                e.preventDefault();
                li.classList.add('drag-over');
            };
            li.ondragleave = () => li.classList.remove('drag-over');
            li.ondrop = (e) => {
                e.preventDefault();
                li.classList.remove('drag-over');
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                const toIdx = actualIdx;
                if (fromIdx !== toIdx) {
                    const item = this.elements.splice(fromIdx, 1)[0];
                    this.elements.splice(toIdx, 0, item);
                    this.render();
                    this.updateLayerList();
                }
            };

            list.appendChild(li);
        });
    }

    moveLayer(idx, dir) {
        const newIdx = idx + dir;
        if (newIdx >= 0 && newIdx < this.elements.length) {
            const temp = this.elements[idx];
            this.elements[idx] = this.elements[newIdx];
            this.elements[newIdx] = temp;
            this.updateLayerList();
            this.updateEditor();
            this.render();
        }
    }

    deleteElement(id) {
        if (!id) return;
        this.elements = this.elements.filter(el => el.id !== id);
        if (this.selectedId === id) this.selectedId = null;
        this.updateEditor(); this.updateLayerList(); this.updatePropEditor(); this.render();
    }

    handleKeyDown(e) {
        // Prevent interfering with Monaco Editor or Input fields
        const activeTag = document.activeElement.tagName.toLowerCase();
        const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
        const isMonaco = document.activeElement.closest('.monaco-editor');

        if (isInput || isMonaco) return;

        if (e.key === 'Delete') {
            if (this.selectedId) {
                this.deleteElement(this.selectedId);
                e.preventDefault();
            }
        } else if (e.ctrlKey && e.key === 'c') {
            this.copyElement();
            e.preventDefault();
        } else if (e.ctrlKey && e.key === 'v') {
            this.pasteElement();
            e.preventDefault();
        }
    }

    copyElement() {
        const el = this.elements.find(e => e.id === this.selectedId);
        if (el) {
            // Deep copy using JSON stringify/parse
            this.clipboard = JSON.parse(JSON.stringify(el));
            this.showToast(t('toast_copy') || "Copied");
        }
    }

    pasteElement() {
        if (!this.clipboard) return;

        // Create new element from clipboard
        const newEl = JSON.parse(JSON.stringify(this.clipboard));
        newEl.id = Date.now();
        newEl.x += 10;
        newEl.y += 10;
        if (newEl.type === 'line') {
            newEl.x2 += 10;
            newEl.y2 += 10;
        }

        this.elements.push(newEl);
        this.selectedId = newEl.id;

        // Update clipboard for subsequent pastes
        this.clipboard = JSON.parse(JSON.stringify(newEl));

        this.updateEditor();
        this.updateLayerList();
        this.updatePropEditor();
        this.render();
        this.showToast(t('toast_paste') || "Pasted");
    }

    updatePropEditor() {
        const container = document.getElementById('prop-editor');

        // --- Global Config Section ---
        let globalHtml = `
            <div class="prop-section">
                <div class="prop-group">
                    <label>${t('label_rotate')}</label>
                    <select onchange="app.config.rotate = parseInt(this.value); app.updateCanvasSize(); app.updateEditor(); app.render(); app.updatePropEditor();">
                        <option value="0" ${this.config.rotate === 0 ? 'selected' : ''}>${t('rotate_0')}</option>
                        <option value="1" ${this.config.rotate === 1 ? 'selected' : ''}>${t('rotate_90')}</option>
                        <option value="2" ${this.config.rotate === 2 ? 'selected' : ''}>${t('rotate_180')}</option>
                        <option value="3" ${this.config.rotate === 3 ? 'selected' : ''}>${t('rotate_270')}</option>
                    </select>
                </div>
                <div class="prop-group">
                    <label>${t('label_canvas_size')}</label>
                    <select onchange="app.config.size = this.value; app.updateCanvasSize(); app.updateEditor(); app.render(); app.updatePropEditor();">
                        <option value="custom" ${this.config.size === 'custom' ? 'selected' : ''}>${t('size_custom')}</option>
                        ${this.availableSizes.map(s => `
                            <option value="${s.id}" ${this.config.size === s.id ? 'selected' : ''}>${s.id}</option>
                        `).join('')}
                    </select>
                </div>
                <!-- Custom Dimensions Row -->
                <div class="prop-row">
                    <div class="prop-group">
                        <label>${t('label_width')}</label>
                        <input type="number" value="${this.config.customW}" oninput="app.setCustomSize('w', this.value)">
                    </div>
                    <div class="prop-group">
                        <label>${t('label_height')}</label>
                        <input type="number" value="${this.config.customH}" oninput="app.setCustomSize('h', this.value)">
                    </div>
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0;">
        `;

        const el = this.elements.find(e => e.id === this.selectedId);
        if (!el) {
            container.className = 'prop-editor-empty';
            container.innerHTML = globalHtml + `<p>${t('select-element')}</p>`;
            return;
        }

        container.className = 'prop-editor-content';
        let html = globalHtml;

        // Position Row (X / Y)
        html += `<div class="prop-row">
                    <div class="prop-group"><label>X</label><input type="number" value="${Math.round(el.x)}" oninput="app.updateProp('x', this.value)"></div>
                    <div class="prop-group"><label>Y</label><input type="number" value="${Math.round(el.y)}" oninput="app.updateProp('y', this.value)"></div>
                 </div>`;

        if (el.type === 'line') {
            html += `<div class="prop-row">
                        <div class="prop-group"><label>X2</label><input type="number" value="${Math.round(el.x2)}" oninput="app.updateProp('x2', this.value)"></div>
                        <div class="prop-group"><label>Y2</label><input type="number" value="${Math.round(el.y2)}" oninput="app.updateProp('y2', this.value)"></div>
                     </div>`;
        } else if (el.type !== 'text') {
            // Dimension Row (W / H)
            html += `<div class="prop-row">
                        <div class="prop-group"><label>${t('label_w')}</label><input type="number" value="${Math.round(el.w)}" oninput="app.updateProp('w', this.value)"></div>
                        <div class="prop-group"><label>${t('label_h')}</label><input type="number" value="${Math.round(el.h)}" oninput="app.updateProp('h', this.value)"></div>
                     </div>`;
        }

        if (el.type === 'text') {
            html += `<div class="prop-group"><label>${t('label_text')}</label><input type="text" value="${el.text}" oninput="app.updateProp('text', this.value)"></div>
                     <div class="prop-row">
                        <div class="prop-group"><label>${t('label_size')}</label><input type="number" value="${el.size}" oninput="app.updateProp('size', this.value)"></div>
                        <div class="prop-group"><label>${t('label_align')}</label><select onchange="app.updateProp('align', this.value)">
                            <option value="left" ${el.align === 'left' ? 'selected' : ''}>${t('align_left')}</option>
                            <option value="center" ${el.align === 'center' ? 'selected' : ''}>${t('align_center')}</option>
                            <option value="right" ${el.align === 'right' ? 'selected' : ''}>${t('align_right')}</option>
                        </select></div>
                     </div>
                     <div class="prop-group"><label>${t('label_font')}</label><select onchange="app.updateProp('font', this.value)">
                        ${this.fonts.map(f => `
                            <option value="${f.id}" ${el.font === f.id ? 'selected' : ''}>${currentLang === 'ko' ? f.ko : f.en}</option>
                        `).join('')}
                      </select></div>`;
        }

        // Color & Fill
        html += `<div class="prop-group"><label>${t('label_color')}</label><select onchange="app.updateProp('color', this.value)">
                    ${this.colorList.map(c => `
                        <option value="${c.name.split('_')[1]}" ${el.color === c.name.split('_')[1] ? 'selected' : ''}>${t(c.name)}</option>
                    `).join('')}
                 </select></div>`;

        if (el.type === 'rect' || el.type === 'tri') {
            html += `<div class="prop-group"><label>${t('label_fill')}</label>
                     <select onchange="app.updateProp('filled', this.value)">
                        <option value="none" ${el.filled === 'none' ? 'selected' : ''}>${t('fill_none')}</option>
                        ${this.colorList.map(c => `
                            <option value="${c.name.split('_')[1]}" ${el.filled === c.name.split('_')[1] ? 'selected' : ''}>${t(c.name)}</option>
                        `).join('')}
                     </select></div>`;
        }

        container.innerHTML = html;
    }

    setCustomSize(axis, value) {
        const val = parseInt(value) || 0;
        if (axis === 'w') this.config.customW = val;
        else this.config.customH = val;

        // Check if matches standard size
        const match = this.availableSizes.find(s => s.w === this.config.customW && s.h === this.config.customH);
        if (match) this.config.size = match.id;
        else this.config.size = 'custom';

        this.updateCanvasSize();
        this.updateEditor();
        this.render();
        // Delay updatePropEditor to avoid focus ping-pong while typing, but user might need it
        clearTimeout(this.sizeTimeout);
        this.sizeTimeout = setTimeout(() => this.updatePropEditor(), 1000);
    }

    updateProp(key, value) {
        const el = this.elements.find(e => e.id === this.selectedId);
        if (el) {
            if (['text', 'font', 'align', 'color'].includes(key)) el[key] = value;
            else if (key === 'filled') el[key] = value;
            else el[key] = Math.round(parseFloat(value)) || 0;

            this.constrainElement(el);
            this.render();
            clearTimeout(this.timeout); this.timeout = setTimeout(() => this.updateEditor(), 500);

            // If capped by constraint, update UI again
            if (!['text', 'font', 'align', 'color', 'filled'].includes(key)) {
                this.updatePropEditor();
            }
        }
    }

    exportDesign() {
        const data = "[\n" + this.elements.map(el => "  " + JSON.stringify(el)).join(",\n") + "\n]";
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `design_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("JSON Exported");
    }

    importDesign() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.elements = data;
                    this.selectedId = null;
                    this.render();
                    this.updateEditor();
                    this.updateLayerList();
                    this.updatePropEditor();
                    this.showToast(t('toast_update'));
                } catch (err) {
                    this.showToast("Invalid JSON File", "error");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    showToast(msg, type = 'success') {
        const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.textContent = msg;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    getEsp32Json() {
        const getColorId = (name) => {
            const found = this.colorList.find(c => c.name.split('_')[1] === name);
            return found ? found.id : 1;
        };
        const alignMap = { 'left': 0, 'center': 1, 'right': 2 };

        const items = this.elements.filter(el => el.visible).map(el => {
            if (el.type === 'text') {
                const fontInfo = this.fonts.find(f => f.id === el.font) || this.fonts.find(f => f.id === 'Inter');
                let fontPath = fontInfo.path;

                return { "text": [el.x, el.y, el.text, fontPath, getColorId(el.color), alignMap[el.align] !== undefined ? alignMap[el.align] : 0, el.size || 16] };
            } else if (el.type === 'rect') {
                const fillVal = el.filled === 'none' ? -1 : getColorId(el.filled || el.color);
                return { "box": [el.x, el.y, el.w, el.h, getColorId(el.color), fillVal] };
            } else if (el.type === 'tri') {
                const fillVal = el.filled === 'none' ? -1 : getColorId(el.filled || el.color);
                return { "triangle": [el.x + el.w / 2, el.y, el.x, el.y + el.h, el.x + el.w, el.y + el.h, getColorId(el.color), fillVal] };
            } else if (el.type === 'line') {
                return { "line": [el.x, el.y, el.x2, el.y2, getColorId(el.color)] };
            }
        }).filter(item => item !== null);

        // Prepend rotation config if not default
        if (this.config.rotate !== 0) {
            items.unshift({ "rotate": this.config.rotate });
        }
        return items;
    }

    parseEsp32Json(data) {
        if (!Array.isArray(data)) return;

        const getColorName = (id) => {
            const found = this.colorList.find(c => c.id === id);
            return found ? found.name.split('_')[1] : 'black';
        };
        const reverseAlignMap = { 0: 'left', 1: 'center', 2: 'right' };

        // Reset config
        this.config.rotate = 0;

        this.elements = data.map((item, index) => {
            const id = Date.now() + index;
            if (item.rotate !== undefined) {
                this.config.rotate = item.rotate;
                this.updateCanvasSize();
                return null;
            }
            if (item.text) {
                const [x, y, text, fontPath, color, align, size] = item.text;
                const fontInfo = this.fonts.find(f => fontPath.includes(f.path.split('/').pop())) || this.fonts.find(f => f.id === 'Inter');
                let font = fontInfo.id;

                return { id, type: 'text', x, y, text, font, visible: true, color: getColorName(color), align: reverseAlignMap[align] || 'left', size: size || 16 };
            } else if (item.box) {
                const [x, y, w, h, color, fillIndex] = item.box;
                const filled = (fillIndex === undefined || fillIndex === -1) ? 'none' : getColorName(fillIndex);
                return { id, type: 'rect', x, y, w, h, visible: true, color: getColorName(color), filled: filled };
            } else if (item.triangle) {
                const arr = item.triangle;
                const [x1, y1, x2, y2, x3, y3, color] = arr;
                const fillIndex = arr[7];
                const filled = (fillIndex === undefined || fillIndex === -1) ? 'none' : getColorName(fillIndex);

                // Simplified back-conversion for triangle bounds
                const x = Math.min(x1, x2, x3);
                const y = Math.min(y1, y2, y3);
                const w = Math.max(x1, x2, x3) - x;
                const h = Math.max(y1, y2, y3) - y;
                return { id, type: 'tri', x, y, w, h, visible: true, color: getColorName(color), filled: filled };
            } else if (item.line) {
                const [x, y, x2, y2, color] = item.line;
                return { id, type: 'line', x, y, x2, y2, visible: true, color: getColorName(color) };
            }
            return null;
        }).filter(el => el !== null);
    }

    async sendData() {
        const mac = document.getElementById('target-mac').value.trim();
        const url = document.getElementById('target-url').value.trim();
        const jsonData = JSON.stringify(this.getEsp32Json());

        if (!mac || !url) {
            this.showToast("MAC and URL are required", "error");
            return;
        }

        const formData = new URLSearchParams();
        formData.append('mac', mac);
        formData.append('json', jsonData);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (response.ok) {
                this.showToast(t('toast_send_success'));
            } else {
                console.error("Server Error:", response.status, response.statusText);
                this.showToast(t('toast_send_fail') + " (" + response.status + ")", "error");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            this.showToast(t('toast_send_fail'), "error");
        }
    }
}

window.app = new Designer();
