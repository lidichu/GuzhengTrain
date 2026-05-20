document.addEventListener('DOMContentLoaded', function() {

    // --- 主導覽選單(桌機 + 手機共用一份 DOM) ---
    const menuIcon = document.querySelector('.menu-icon');
    const primaryNav = document.querySelector('.desktop-menu-container');

    if (menuIcon && primaryNav) {
        // 1. 漢堡按鈕 → 切換 .active(手機版才會顯示為全螢幕覆蓋)
        menuIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            primaryNav.classList.toggle('active');
            const isOpen = primaryNav.classList.contains('active');
            menuIcon.setAttribute('aria-expanded', String(isOpen));

            // 切換漢堡 / 叉叉圖示
            const icon = menuIcon.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !isOpen);
                icon.classList.toggle('fa-times', isOpen);
            }
        });

        // 2. 點選單連結(非下拉開關)後自動關閉手機選單
        primaryNav.querySelectorAll('a.nav-link, .dropdown-item').forEach(link => {
            link.addEventListener('click', () => {
                // 桌機 dropdown 主項本身只是展開用,不關閉整個選單
                if (link.classList.contains('dropdown-toggle')) return;

                primaryNav.classList.remove('active');
                menuIcon.setAttribute('aria-expanded', 'false');
                const icon = menuIcon.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                // 同步收合手機 dropdown
                const openDropdown = primaryNav.querySelector('.dropdown.open');
                if (openDropdown) openDropdown.classList.remove('open');
            });
        });

        // 3. 手機版「學習指南」下拉:點擊展開 / 收合
        const dropdownToggle = primaryNav.querySelector('.dropdown .dropdown-toggle');
        const dropdownParent = primaryNav.querySelector('.nav-item.dropdown');
        if (dropdownToggle && dropdownParent) {
            dropdownToggle.addEventListener('click', function(e) {
                // 僅在手機版接管;桌機版用 CSS hover 顯示
                if (window.innerWidth > 768) return;
                e.preventDefault();
                dropdownParent.classList.toggle('open');
            });
        }
    }

    // --- 視窗大小切換時重置狀態 ---
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (primaryNav) primaryNav.classList.remove('active');
            const openDropdown = primaryNav && primaryNav.querySelector('.dropdown.open');
            if (openDropdown) openDropdown.classList.remove('open');
            if (menuIcon) {
                menuIcon.setAttribute('aria-expanded', 'false');
                const icon = menuIcon.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
});
