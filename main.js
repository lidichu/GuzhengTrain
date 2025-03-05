// 等待 DOM 完全載入後執行
document.addEventListener('DOMContentLoaded', function() {
	// 導航選單折疊功能
const menuIcon = document.querySelector('.menu-icon');
const navMenu = document.querySelector('.nav-menu');

if (menuIcon) {
    menuIcon.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // 切換圖標
        const icon = this.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // 點擊選單項目後自動收起選單
    document.querySelectorAll('.nav-menu a').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                const icon = menuIcon.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// 調整視窗大小時重置選單狀態
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const icon = menuIcon.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    }
});
    // 導航欄滾動效果
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    });

    // 平滑滾動到錨點
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 圖片延遲載入
    const lazyImages = document.querySelectorAll('.gallery-item img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            if (!img.dataset.src) {
                img.dataset.src = img.src;
            }
            imageObserver.observe(img);
        });
    }

    // 課程卡片動畫效果
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('card-hover');
        });
        card.addEventListener('mouseleave', function() {
            this.classList.remove('card-hover');
        });
    });

    // 返回頂部按鈕
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.display = 'none';
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 學生成果圖片輪播
    let currentGalleryIndex = 0;
    const galleryItems = document.querySelectorAll('.gallery-item');
    const totalGalleryItems = galleryItems.length;
    
    if (totalGalleryItems > 0 && window.innerWidth < 768) {
        // 在手機版顯示輪播控制
        const galleryContainer = document.querySelector('.gallery');
        const galleryControls = document.createElement('div');
        galleryControls.className = 'gallery-controls';
        galleryControls.innerHTML = `
            <button class="gallery-prev"><i class="fas fa-chevron-left"></i></button>
            <div class="gallery-indicators"></div>
            <button class="gallery-next"><i class="fas fa-chevron-right"></i></button>
        `;
        
        const galleryParent = galleryContainer.parentNode;
        galleryParent.insertBefore(galleryControls, galleryContainer.nextSibling);
        
        const indicators = document.querySelector('.gallery-indicators');
        for (let i = 0; i < totalGalleryItems; i++) {
            const indicator = document.createElement('span');
            indicator.className = i === 0 ? 'active' : '';
            indicators.appendChild(indicator);
        }
        
        // 隱藏除了第一張以外的所有圖片
        for (let i = 1; i < totalGalleryItems; i++) {
            galleryItems[i].style.display = 'none';
        }
        
        // 輪播控制功能
        document.querySelector('.gallery-prev').addEventListener('click', function() {
            showGalleryItem((currentGalleryIndex - 1 + totalGalleryItems) % totalGalleryItems);
        });
        
        document.querySelector('.gallery-next').addEventListener('click', function() {
            showGalleryItem((currentGalleryIndex + 1) % totalGalleryItems);
        });
        
        function showGalleryItem(index) {
            galleryItems[currentGalleryIndex].style.display = 'none';
            document.querySelectorAll('.gallery-indicators span')[currentGalleryIndex].classList.remove('active');
            
            currentGalleryIndex = index;
            
            galleryItems[currentGalleryIndex].style.display = 'block';
            document.querySelectorAll('.gallery-indicators span')[currentGalleryIndex].classList.add('active');
        }
    }

    // 音頻播放功能 - 為網站添加古箏音樂示範
    const audioPlayer = document.createElement('div');
    audioPlayer.className = 'audio-player';
    audioPlayer.innerHTML = `
        <div class="audio-player-inner">
            <div class="audio-info">
                <span class="audio-title">古箏示範曲</span>
                <div class="audio-controls">
                    <button class="audio-play-btn"><i class="fas fa-play"></i></button>
                    <div class="audio-progress">
                        <div class="audio-progress-bar"></div>
                    </div>
                    <span class="audio-time">00:00</span>
                </div>
            </div>
        </div>
    `;
    
    // 將音頻播放器添加到頁面
    //const aboutSection = document.getElementById('about');
    //if (aboutSection) {
    //    aboutSection.querySelector('.container').appendChild(audioPlayer);
    //}
    
    // 模擬音頻播放功能
    const audioPlayBtn = document.querySelector('.audio-play-btn');
    const audioProgressBar = document.querySelector('.audio-progress-bar');
    const audioTime = document.querySelector('.audio-time');
    let isPlaying = false;
    let audioInterval;
    
    audioPlayBtn.addEventListener('click', function() {
        if (isPlaying) {
            // 暫停
            clearInterval(audioInterval);
            audioPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        } else {
            // 播放
            let progress = 0;
            audioPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
            
            audioInterval = setInterval(() => {
                progress += 1;
                if (progress > 100) {
                    clearInterval(audioInterval);
                    audioPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                    isPlaying = false;
                    progress = 0;
                }
                
                const minutes = Math.floor(progress * 3 / 100 / 60);
                const seconds = Math.floor(progress * 3 / 100 % 60);
                audioTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                audioProgressBar.style.width = `${progress}%`;
            }, 300);
        }
    });
});
