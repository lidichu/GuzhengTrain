// 額外的互動元素和動畫效果
document.addEventListener('DOMContentLoaded', function() {
    // 創建古箏背景裝飾
    createGuzhengBackground();
    
    // 創建音符裝飾
    createMusicNotesDecoration();
    
    // 增強選項選擇效果
    enhanceOptionSelection();
    
    // 添加頁面切換動畫
    addPageTransitionEffects();
    
    // 添加結果頁面特效
    enhanceResultPage();
    
    // 創建古箏背景裝飾
    function createGuzhengBackground() {
        const guzhengBg = document.createElement('div');
        guzhengBg.className = 'guzheng-bg';
        document.body.appendChild(guzhengBg);
    }
    
    // 創建音符裝飾
    function createMusicNotesDecoration() {
        const notesContainer = document.createElement('div');
        notesContainer.className = 'music-notes-decoration';
        
        const notes = ['♪', '♫', '♬', '♩', '♭', '♮'];
        const colors = ['#8B5A2B', '#D2B48C', '#A0522D', '#CD853F', '#DEB887'];
        
        // 創建20個隨機位置的音符
        for (let i = 0; i < 20; i++) {
            const note = document.createElement('div');
            note.className = 'music-note-bg';
            note.textContent = notes[Math.floor(Math.random() * notes.length)];
            note.style.color = colors[Math.floor(Math.random() * colors.length)];
            note.style.left = `${Math.random() * 100}%`;
            note.style.top = `${Math.random() * 100}%`;
            note.style.transform = `rotate(${Math.random() * 360}deg)`;
            notesContainer.appendChild(note);
        }
        
        document.body.appendChild(notesContainer);
    }
    
    // 增強選項選擇效果
    function enhanceOptionSelection() {
        // 監聽所有選項的點擊事件
        document.addEventListener('click', function(e) {
            const option = e.target.closest('.option');
            if (option) {
                // 添加點擊波紋效果
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                option.appendChild(ripple);
                
                const rect = option.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    }
    
    // 添加頁面切換動畫
    function addPageTransitionEffects() {
        // 開始測驗按鈕
        const startQuizBtn = document.getElementById('start-quiz');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', function() {
                document.getElementById('quiz-content').classList.add('page-transition');
            });
        }
        
        // 提交按鈕
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                document.getElementById('quiz-result').classList.add('page-transition');
            });
        }
        
        // 重試按鈕
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', function() {
                document.getElementById('quiz-header').classList.add('page-transition');
            });
        }
    }
    
    // 增強結果頁面
    function enhanceResultPage() {
        // 監聽提交按鈕，在結果頁面顯示時創建彩帶效果
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                setTimeout(createConfetti, 500);
            });
        }
    }
    
    // 創建彩帶效果
    function createConfetti() {
        const colors = ['#8B5A2B', '#D2B48C', '#A0522D', '#CD853F', '#DEB887'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.width = `${5 + Math.random() * 10}px`;
                confetti.style.height = `${10 + Math.random() * 15}px`;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = `${3 + Math.random() * 5}s`;
                
                document.body.appendChild(confetti);
                
                // 動畫結束後移除元素
                setTimeout(() => {
                    confetti.remove();
                }, 8000);
            }, i * 50);
        }
    }
    
    // 添加答題詳情的折疊/展開功能
    function setupReviewItemToggle() {
        const reviewItems = document.querySelectorAll('.review-item');
        
        reviewItems.forEach(item => {
            const questionPart = item.querySelector('.review-question');
            
            questionPart.addEventListener('click', () => {
                item.classList.toggle('collapsed');
            });
        });
    }
    
    // 在結果頁面顯示時設置答題詳情的折疊/展開功能
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            setTimeout(setupReviewItemToggle, 1000);
        });
    }
    
    // 添加琴弦自動播放效果
    function autoPlayStrings() {
        const strings = document.querySelectorAll('.guzheng-string');
        let currentIndex = 0;
        
        setInterval(() => {
            if (strings.length > 0) {
                // 移除之前的動畫
                strings.forEach(string => {
                    string.classList.remove('pluck');
                });
                
                // 添加新的動畫
                strings[currentIndex].classList.add('pluck');
                
                // 更新索引
                currentIndex = (currentIndex + 1) % strings.length;
            }
        }, 2000);
    }
    
    // 啟動琴弦自動播放
    setTimeout(autoPlayStrings, 3000);
    
    // 添加按鈕懸停音效
    function addButtonHoverSound() {
        const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary, .btn-success');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                playNoteSound();
            });
        });
    }
    
    // 播放音符聲音（模擬）
    function playNoteSound() {
        // 在實際應用中，這裡可以添加真實的音效播放
        // 由於這是一個模擬，我們只添加視覺效果
        const note = document.createElement('div');
        note.className = 'music-note';
        note.innerHTML = '♪';
        note.style.left = `${Math.random() * 100}%`;
        document.body.appendChild(note);
        
        setTimeout(() => {
            document.body.removeChild(note);
        }, 2000);
    }
    
    // 啟動按鈕懸停音效
    addButtonHoverSound();
    
    // 添加滾動時的視差效果
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const musicNotes = document.querySelectorAll('.music-note-bg');
        
        musicNotes.forEach((note, index) => {
            const speed = 0.05 + (index % 5) * 0.01;
            note.style.transform = `translateY(${scrollPosition * speed}px) rotate(${Math.random() * 360}deg)`;
        });
    });
});
