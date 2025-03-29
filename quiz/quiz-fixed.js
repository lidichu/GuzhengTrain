// 古箏能力測驗 JavaScript 功能 - 修復版
document.addEventListener('DOMContentLoaded', function() {
    // 測驗數據
    const quizData = quizDataArray;
    // 測驗狀態
    let currentQuestion = 0;
    let score = 0;
    let userAnswers = Array(quizData.length).fill(-1);
    
    // DOM 元素
    let startQuizBtn, quizHeader, quizContent, quizResult, questionText, optionsContainer, 
        currentQuestionEl, totalQuestionsEl, prevBtn, nextBtn, submitBtn, progressBar, 
        sectionIndicator, scoreValue, correctAnswers, levelText, levelIcon, levelDescription, 
        questionsReview, retryBtn, shareBtn;
    
    // 初始化測驗 - 增加錯誤處理
    function initQuiz() {
        try {
            console.log('初始化測驗...');
            // 獲取DOM元素並添加錯誤處理
            startQuizBtn = document.getElementById('start-quiz');
            quizHeader = document.getElementById('quiz-header');
            quizContent = document.getElementById('quiz-content');
            quizResult = document.getElementById('quiz-result');
            
            if (!startQuizBtn) {
                console.error('找不到開始測驗按鈕元素');
                return;
            }
            
            if (!quizHeader) {
                console.error('找不到測驗標題元素');
                return;
            }
            
            if (!quizContent) {
                console.error('找不到測驗內容元素');
                return;
            }
            
            if (!quizResult) {
                console.error('找不到測驗結果元素');
                return;
            }
            
            // 獲取其他DOM元素
            questionText = document.getElementById('question-text');
            optionsContainer = document.querySelector('.options-container');
            currentQuestionEl = document.getElementById('current-question');
            totalQuestionsEl = document.getElementById('total-questions');
            prevBtn = document.getElementById('prev-btn');
            nextBtn = document.getElementById('next-btn');
            submitBtn = document.getElementById('submit-btn');
            progressBar = document.querySelector('.quiz-progress-bar');
            sectionIndicator = document.querySelector('.quiz-section-indicator');
            scoreValue = document.getElementById('score-value');
            correctAnswers = document.getElementById('correct-answers');
            levelText = document.getElementById('level-text');
            levelIcon = document.getElementById('level-icon');
            levelDescription = document.getElementById('level-description');
            questionsReview = document.getElementById('questions-review');
            retryBtn = document.getElementById('retry-btn');
            shareBtn = document.getElementById('share-btn');
            
            // 設置總題數
            if (totalQuestionsEl) {
                totalQuestionsEl.textContent = quizData.length;
            }
            
            // 添加事件監聽器
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', startQuiz);
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', goToPreviousQuestion);
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', goToNextQuestion);
            }
            
            if (submitBtn) {
                submitBtn.addEventListener('click', submitQuiz);
            }
            
            if (retryBtn) {
                retryBtn.addEventListener('click', resetQuiz);
            }
            
            if (shareBtn) {
                shareBtn.addEventListener('click', shareResult);
            }
            
            console.log('測驗初始化完成');
        } catch (error) {
            console.error('初始化測驗時發生錯誤:', error);
        }
    }
    
    // 開始測驗 - 修復顯示問題
    function startQuiz() {
        try {
            console.log('開始測驗');
            
            if (!quizHeader || !quizContent) {
                console.error('找不到必要的DOM元素');
                return;
            }
            
            // 先確保元素存在，再修改樣式
            if (quizHeader) {
                quizHeader.style.display = 'none';
            }
            
            if (quizContent) {
                // 確保測驗內容可見
                quizContent.style.display = 'block';
                quizContent.style.visibility = 'visible';
                quizContent.style.opacity = '1';
                
                // 強制重新渲染
                quizContent.offsetHeight;
            }
            
            // 載入問題
            loadQuestion();
            
            // 添加動畫效果
            if (quizContent) {
                quizContent.classList.add('fade-in');
            }
            
            // 播放琴弦動畫
            quizUtils.playStringAnimation();
            
            console.log('測驗已開始，測驗內容顯示狀態:', quizContent.style.display);
        } catch (error) {
            console.error('開始測驗時發生錯誤:', error);
            // 嘗試恢復界面
            if (quizHeader) {
                quizHeader.style.display = 'block';
            }
            alert('開始測驗時發生錯誤，請刷新頁面後重試。');
        }
    }
    
    // 載入問題 - 增加錯誤處理和調試信息
    function loadQuestion() {
        try {
            console.log('載入問題', currentQuestion + 1);
            
            if (currentQuestion < 0 || currentQuestion >= quizData.length) {
                console.error('問題索引超出範圍');
                return;
            }
            
            const question = quizData[currentQuestion];
            
            if (!question) {
                console.error('找不到問題數據');
                return;
            }
            
            // 更新問題文本
            if (questionText) {
                questionText.textContent = `${currentQuestion + 1}. ${question.question}`;
                console.log('問題文本已更新:', questionText.textContent);
            } else {
                console.error('找不到問題文本元素');
            }
            
            // 更新部分指示器
            if (sectionIndicator) {
                sectionIndicator.textContent = question.section;
            }
            
            // 更新當前問題編號
            if (currentQuestionEl) {
                currentQuestionEl.textContent = currentQuestion + 1;
            }
            
            // 更新進度條
            if (progressBar) {
                const progress = ((currentQuestion + 1) / quizData.length) * 100;
                progressBar.style.width = `${progress}%`;
            }
            
            // 清空選項容器
            if (optionsContainer) {
                optionsContainer.innerHTML = '';
                
                // 添加選項
                question.options.forEach((option, index) => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'option';
                    
                    // 如果用戶已經選擇了答案，標記選中狀態
                    if (userAnswers[currentQuestion] === index) {
                        optionElement.classList.add('selected');
                    }
                    
                    optionElement.innerHTML = `
                        <div class="option-marker">${option.charAt(0)}</div>
                        <div class="option-text">${option.substring(3)}</div>
                    `;
                    
                    optionElement.addEventListener('click', () => selectOption(index));
                    optionsContainer.appendChild(optionElement);
                });
                
                console.log('選項已載入，數量:', question.options.length);
            } else {
                console.error('找不到選項容器元素');
            }
            
            // 更新按鈕狀態
            updateButtonStates();
            
        } catch (error) {
            console.error('載入問題時發生錯誤:', error);
        }
    }
    
    // 選擇選項 - 增加錯誤處理
    function selectOption(index) {
        try {
            userAnswers[currentQuestion] = index;
            
            // 更新選項樣式
            const options = document.querySelectorAll('.option');
            if (options && options.length > 0) {
                options.forEach((option, i) => {
                    if (i === index) {
                        option.classList.add('selected');
                    } else {
                        option.classList.remove('selected');
                    }
                });
                
                // 添加選擇動畫
                if (options[index]) {
                    options[index].classList.add('pulse-animation');
                    setTimeout(() => {
                        options[index].classList.remove('pulse-animation');
                    }, 500);
                }
            }
            
            // 播放琴弦音效動畫
            quizUtils.playNoteAnimation(index);
            
            // 更新按鈕狀態
            updateButtonStates();
            
        } catch (error) {
            console.error('選擇選項時發生錯誤:', error);
        }
    }
    
    // 更新按鈕狀態 - 增加錯誤處理
    function updateButtonStates() {
        try {
            if (prevBtn) {
                prevBtn.disabled = currentQuestion === 0;
            }
            
            // 如果是最後一題，顯示提交按鈕
            if (currentQuestion === quizData.length - 1) {
                if (nextBtn) nextBtn.style.display = 'none';
                if (submitBtn) submitBtn.style.display = 'block';
            } else {
                if (nextBtn) nextBtn.style.display = 'block';
                if (submitBtn) submitBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('更新按鈕狀態時發生錯誤:', error);
        }
    }
    
    // 前往上一題 - 增加錯誤處理
    function goToPreviousQuestion() {
        try {
            if (currentQuestion > 0) {
                currentQuestion--;
                loadQuestion();
                
                // 添加切換動畫
                if (quizContent) {
                    quizContent.classList.add('slide-right');
                    setTimeout(() => {
                        quizContent.classList.remove('slide-right');
                    }, 500);
                }
            }
        } catch (error) {
            console.error('前往上一題時發生錯誤:', error);
        }
    }
    
    // 前往下一題 - 增加錯誤處理
    function goToNextQuestion() {
        try {
            if (currentQuestion < quizData.length - 1) {
                currentQuestion++;
                loadQuestion();
                
                // 添加切換動畫
                if (quizContent) {
                    quizContent.classList.add('slide-left');
                    setTimeout(() => {
                        quizContent.classList.remove('slide-left');
                    }, 500);
                }
            }
        } catch (error) {
            console.error('前往下一題時發生錯誤:', error);
        }
    }
    
    // 提交測驗 - 增加錯誤處理
    function submitQuiz() {
        try {
            // 計算分數
            score = 0;
            userAnswers.forEach((answer, index) => {
                if (answer === quizData[index].answer) {
                    score++;
                }
            });
            
            // 顯示結果
            showResult();
        } catch (error) {
            console.error('提交測驗時發生錯誤:', error);
        }
    }
    
    // 顯示結果 - 增加錯誤處理
    function showResult() {
        try {
            if (!quizContent || !quizResult) {
                console.error('找不到必要的DOM元素');
                return;
            }
            
            quizContent.style.display = 'none';
            quizResult.style.display = 'block';
            
            // 添加動畫效果
            quizResult.classList.add('fade-in');
            
            // 更新分數
            if (scoreValue) scoreValue.textContent = score;
            if (correctAnswers) correctAnswers.textContent = score;
            
            // 更新等級
            let level, icon, description;
            if (score >= 15) {
                level = "高階";
                icon = "🎶";
                description = "您的古箏技巧與音樂表現能力已達高水準，可以挑戰更高難度的樂曲！";
            } else if (score >= 8) {
                level = "中階";
                icon = "🎼";
                description = "您已掌握許多技巧，建議進一步學習樂曲詮釋與舞台表現。";
            } else {
                level = "初階";
                icon = "🎵";
                description = "您對古箏有基本認識，建議多練習基本指法與樂理知識。";
            }
            
            if (levelText) levelText.textContent = level;
            if (levelIcon) levelIcon.textContent = icon;
            if (levelDescription) levelDescription.textContent = description;
            
            // 使用 quizUtils 中的函數生成答題詳情
            quizUtils.generateQuestionsReview(questionsReview, userAnswers, quizData);
            
            // 播放結果動畫
            quizUtils.playResultAnimation(score);
        } catch (error) {
            console.error('顯示結果時發生錯誤:', error);
            alert('顯示結果時發生錯誤，請刷新頁面後重試。');
        }
    }
    
    // 重置測驗 - 增加錯誤處理
    function resetQuiz() {
        try {
            currentQuestion = 0;
            score = 0;
            userAnswers = Array(quizData.length).fill(-1);
            
            if (quizResult) quizResult.style.display = 'none';
            if (quizHeader) quizHeader.style.display = 'block';
            
            // 添加動畫效果
            if (quizHeader) {
                quizHeader.classList.add('fade-in');
            }
        } catch (error) {
            console.error('重置測驗時發生錯誤:', error);
            alert('重置測驗時發生錯誤，請刷新頁面後重試。');
        }
    }
    
    // 分享結果 - 增加錯誤處理
    function shareResult() {
        try {
            // 獲取等級
            let level;
            if (score >= 15) {
                level = "高階";
            } else if (score >= 8) {
                level = "中階";
            } else {
                level = "初階";
            }
            
            // 創建分享文本
            const shareText = `我在新莊箏心古箏音樂教室的古箏能力測驗中獲得了${score}分，達到了${level}水平！來測試你的古箏能力吧！`;
            
            // 嘗試使用Web Share API
            if (navigator.share) {
                navigator.share({
                    title: '古箏能力測驗結果',
                    text: shareText,
                    url: window.location.href
                })
                .catch(error => {
                    console.log('分享失敗:', error);
                    // 備用方案：複製到剪貼簿
                    quizUtils.copyToClipboard(shareText + ' ' + window.location.href);
                    alert('已複製分享內容到剪貼簿！');
                });
            } else {
                // 備用方案：複製到剪貼簿
                quizUtils.copyToClipboard(shareText + ' ' + window.location.href);
                alert('已複製分享內容到剪貼簿！');
            }
        } catch (error) {
            console.error('分享結果時發生錯誤:', error);
            alert('分享結果時發生錯誤，請稍後再試。');
        }
    }
    
    // 初始化測驗
    console.log('DOM加載完成，準備初始化測驗');
    initQuiz();
    
    // 添加滾動事件監聽器 - 增加錯誤處理
    window.addEventListener('scroll', function() {
        try {
            const backToTopBtn = document.querySelector('.back-to-top');
            if (backToTopBtn) {
                if (window.scrollY > 300) {
                    backToTopBtn.style.display = 'block';
                } else {
                    backToTopBtn.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('滾動事件處理時發生錯誤:', error);
        }
    });
    
    // 返回頂部按鈕點擊事件 - 增加錯誤處理
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            try {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } catch (error) {
                console.error('返回頂部時發生錯誤:', error);
                // 備用方案
                window.scrollTo(0, 0);
            }
        });
    }
    
    // 執行兼容性檢查
    quizUtils.checkBrowserCompatibility();
});