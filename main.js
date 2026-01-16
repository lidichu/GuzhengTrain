document.addEventListener('DOMContentLoaded', function() {
    
    // --- 手機選單控制 ---
    const menuIcon = document.querySelector('.menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu'); // 明確指定手機選單

    if (menuIcon && mobileMenu) {
        // 1. 漢堡選單點擊事件
        menuIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 切換選單顯示/隱藏 (CSS transform)
            mobileMenu.classList.toggle('active');
            
            // 切換圖標 (三條線 <-> 叉叉)
            const icon = menuIcon.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // 2. 點擊選單連結後自動關閉選單
        const links = mobileMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                // 如果點的是下拉開關，不關閉選單
                if (link.closest('.mobile-dropdown-toggle')) return;
                
                mobileMenu.classList.remove('active');
                // 還原圖標
                const icon = menuIcon.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // --- 手機版「學習指南」下拉功能 ---
    const dropdownToggle = document.querySelector('.mobile-dropdown-toggle');
    const subMenu = document.querySelector('.mobile-sub-menu');

    if (dropdownToggle && subMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 切換子選單顯示
            subMenu.classList.toggle('show');
            // 切換箭頭旋轉
            this.classList.toggle('active');
        });
    }

    // --- 視窗大小改變時重置狀態 ---
    window.addEventListener('resize', function() {
        // 如果變回電腦版寬度，強制關閉手機選單
        if (window.innerWidth > 768) {
            if (mobileMenu) mobileMenu.classList.remove('active');
            if (subMenu) subMenu.classList.remove('show');
            if (dropdownToggle) dropdownToggle.classList.remove('active');
            
            const icon = menuIcon ? menuIcon.querySelector('i') : null;
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
});