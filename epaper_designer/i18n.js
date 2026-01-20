var i18n = {
    ko: {
        title: 'E-Paper Designer',
        tools: '도구',
        add_text: '텍스트',
        add_rect: '사각형',
        add_tri: '삼각형',
        add_line: '라인',
        layers: '레이어',
        properties: '속성',
        'select-element': '요소를 선택하여 속성을 편집하세요.',
        label_mac: 'MAC 주소',
        label_url: '전송 URL',
        label_text: '내용',
        label_size: '크기',
        label_font: '폰트',
        label_align: '정렬',
        label_color: '색상',
        label_fill: '채우기',
        label_w: '너비 (W)',
        label_h: '높이 (H)',
        label_rotate: '화면 회전',
        align_left: '왼쪽',
        align_center: '중앙',
        align_right: '오른쪽',
        fill_none: '없음',
        color_white: '흰색 (White)',
        color_black: '검정색 (Black)',
        color_red: '빨간색 (Red)',
        color_yellow: '노란색 (Yellow)',
        color_lightgray: '연회색 (L-Gray)',
        color_darkgray: '진회색 (D-Gray)',
        color_pink: '분홍색 (Pink)',
        color_brown: '갈색 (Brown)',
        color_green: '초록색 (Green)',
        color_blue: '파란색 (Blue)',
        color_orange: '오렌지색 (Orange)',
        rotate_0: '기본 (0°)',
        rotate_90: '90° 회전',
        rotate_180: '180° 회전',
        rotate_270: '270° 회전',
        label_canvas_size: '캔버스 크기',
        size_custom: '커스텀 (Custom)',
        label_width: '가로 (W)',
        label_height: '세로 (H)',
        btn_send: '전송하기',
        toast_send_success: '서버로 전송되었습니다.',
        toast_send_fail: '전송에 실패했습니다.',
        toast_copy: '요소가 복사되었습니다.',
        toast_paste: '요소가 붙여넣기 되었습니다.',
    },
    en: {
        title: 'E-Paper Designer',
        tools: 'Tools',
        add_text: 'Text',
        add_rect: 'Rect',
        add_tri: 'Triangle',
        add_line: 'Line',
        layers: 'Layers',
        properties: 'Properties',
        'select-element': 'Select an element to edit properties.',
        label_mac: 'MAC Address',
        label_url: 'Server URL',
        label_text: 'Content',
        label_size: 'Size',
        label_font: 'Font',
        label_align: 'Alignment',
        label_color: 'Color',
        label_fill: 'Fill',
        label_w: 'Width (W)',
        label_h: 'Height (H)',
        label_rotate: 'Rotation',
        align_left: 'Left',
        align_center: 'Center',
        align_right: 'Right',
        fill_none: 'None',
        color_white: 'White',
        color_black: 'Black',
        color_red: 'Red',
        color_yellow: 'Yellow',
        color_lightgray: 'Light Gray',
        color_darkgray: 'Dark Gray',
        color_pink: 'Pink',
        color_brown: 'Brown',
        color_green: 'Green',
        color_blue: 'Blue',
        color_orange: 'Orange',
        rotate_0: 'Default (0°)',
        rotate_90: '90° Rotate',
        rotate_180: '180° Rotate',
        rotate_270: '270° Rotate',
        label_canvas_size: 'Canvas Size',
        size_custom: 'Custom',
        label_width: 'Width (W)',
        label_height: 'Height (H)',
        btn_send: 'Send Design',
        toast_send_success: 'Design sent to server.',
        toast_send_fail: 'Failed to send design.',
        toast_copy: 'Element copied.',
        toast_paste: 'Element pasted.',
    }
};

var currentLang = (navigator.language || navigator.userLanguage).startsWith('ko') ? 'ko' : 'en';

// Ensure the language selector reflects the detected language
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lang-select').value = currentLang;
    translatePage();
});

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });
}

function t(key) {
    return i18n[currentLang][key] || key;
}

document.getElementById('lang-select').addEventListener('change', (e) => {
    currentLang = e.target.value;
    translatePage();
    if (window.app) {
        app.updateLayerList();
        app.updatePropEditor();
    }
});
