// 古箏能力測驗 JavaScript 功能 - 修復版
document.addEventListener('DOMContentLoaded', function() {
    // 測驗數據
    const quizData = [
        // 第一部分：基礎知識（1-5題）
        {
            section: "第一部分：基礎知識",
            question: "古箏標準的弦數通常是多少？",
            options: [
                "A. 13 根",
                "B. 18 根",
                "C. 21 根",
                "D. 25 根"
            ],
            answer: 2, // 索引從0開始，C選項
            explanation: "古箏標準的弦數通常是21根，這是現代古箏的標準配置。"
        },
        {
            section: "第一部分：基礎知識",
            question: "古箏的標準調弦為哪一種調式？",
            options: [
                "A. C 大調",
                "B. G 調",
                "C. D 調",
                "D. F 調"
            ],
            answer: 1, // B選項
            explanation: "古箏的標準調弦為G調，這是最常用的基本調式。"
        },
        {
            section: "第一部分：基礎知識",
            question: "以下哪一種不是古箏的基本指法？",
            options: [
                "A. 托",
                "B. 抹",
                "C. 挑",
                "D. 滑奏"
            ],
            answer: 3, // D選項
            explanation: "滑奏不是古箏的基本指法，而托、抹、挑都是古箏的基本指法。"
        },
        {
            section: "第一部分：基礎知識",
            question: "古箏的音律調整方式主要透過哪兩種方法？",
            options: [
                "A. 改變琴碼位置 & 調音軸",
                "B. 增加琴弦張力 & 改變手指力度",
                "C. 變換琴弦材質 & 調整演奏速度",
                "D. 用手按壓琴弦 & 使用特殊指甲"
            ],
            answer: 0, // A選項
            explanation: "古箏的音律調整主要透過改變琴碼位置和調整調音軸來實現。"
        },
        {
            section: "第一部分：基礎知識",
            question: "在演奏中，左手的作用通常包括？",
            options: [
                "A. 彈奏旋律",
                "B. 彈奏和聲",
                "C. 變化音高與表現音樂情感",
                "D. 只負責裝飾音"
            ],
            answer: 2, // C選項
            explanation: "在古箏演奏中，左手主要負責變化音高與表現音樂情感，如按弦、揉弦等技巧。"
        },
        
        // 第二部分：技術與演奏技巧（6-10題）
        {
            section: "第二部分：技術與演奏技巧",
            question: "古箏常用的右手指法「托劈」是用哪兩個手指交替進行？",
            options: [
                "A. 拇指與食指",
                "B. 拇指與中指",
                "C. 食指與中指",
                "D. 中指與無名指"
            ],
            answer: 0, // A選項
            explanation: "「托劈」是古箏常用的右手指法，使用拇指與食指交替進行。"
        },
        {
            section: "第二部分：技術與演奏技巧",
            question: "在快速演奏長串顫音時，通常會用哪種技巧？",
            options: [
                "A. 顫音",
                "B. 滑音",
                "C. 刮奏",
                "D. 泛音"
            ],
            answer: 0, // A選項
            explanation: "在快速演奏長串音符時，顫音技巧能夠有效地表現出連續快速的音符效果。"
        },
        {
            section: "第二部分：技術與演奏技巧",
            question: "「泛音」技巧是透過什麼方式產生的？",
            options: [
                "A. 用左手輕壓弦的特定位置，右手彈奏",
                "B. 以較大的力量撥動琴弦",
                "C. 透過快速的指法變化",
                "D. 只靠琴碼的擺放位置"
            ],
            answer: 0, // A選項
            explanation: "泛音技巧是通過左手輕壓弦的特定位置（如弦長的1/2、1/3等處），同時右手彈奏該弦產生的。"
        },
        {
            section: "第二部分：技術與演奏技巧",
            question: "在演奏《高山流水》時，為了模仿流水聲，常使用哪種技法？",
            options: [
                "A. 滑音",
                "B. 顫音",
                "C. 刮奏",
                "D. 撮奏"
            ],
            answer: 2, // C選項
            explanation: "在《高山流水》中，刮奏技法常被用來模仿流水的聲音，能夠產生連續流動的音響效果。"
        },
        {
            section: "第二部分：技術與演奏技巧",
            question: "古箏「輪指」的常見手指順序是？",
            options: [
                "A. 拇指—食指—中指—無名指",
                "B. 食指—無名指—小指—拇指",
                "C. 食指—中指—無名指—小指",
                "D. 拇指—中指—無名指—小指"
            ],
            answer: 0, // A選項
            explanation: "古箏「輪指」的常見手指順序是拇指—食指—中指—無名指，這種順序能夠產生流暢的連續音效。"
        },
        
        // 第三部分：樂曲詮釋與音樂表現（11-15題）
        {
            section: "第三部分：樂曲詮釋與音樂表現",
            question: "以下哪一首曲目屬於「現代創作」古箏曲？",
            options: [
                "A. 《漁舟唱晚》",
                "B. 《戰台風》",
                "C. 《瀏陽河》",
                "D. 《梅花三弄》"
            ],
            answer: 1, // B選項
            explanation: "《戰台風》是現代創作的古箏曲，創作於20世紀，具有鮮明的時代特色。"
        },
        {
            section: "第三部分：樂曲詮釋與音樂表現",
            question: "《漁舟唱晚》的風格屬於？",
            options: [
                "A. 戰爭題材",
                "B. 抒情文人音樂",
                "C. 西域風格",
                "D. 歌舞曲"
            ],
            answer: 1, // B選項
            explanation: "《漁舟唱晚》是一首抒情文人音樂，描繪了漁夫在黃昏時分歌唱的寧靜場景。"
        },
        {
            section: "第三部分：樂曲詮釋與音樂表現",
            question: "如何在慢板抒情曲目中表現出豐富的情感？",
            options: [
                "A. 利用力度變化與音色控制",
                "B. 盡量加快速度",
                "C. 使用過多的泛音技巧",
                "D. 只關注節奏準確"
            ],
            answer: 0, // A選項
            explanation: "在慢板抒情曲目中，通過力度變化與音色控制可以表現出豐富的情感層次，使音樂更具表現力。"
        },
        {
            section: "第三部分：樂曲詮釋與音樂表現",
            question: "如果想要讓音樂更加富有層次感，應該注重？",
            options: [
                "A. 音量與力度的對比",
                "B. 一律保持相同音量",
                "C. 速度越快越好",
                "D. 左手完全不參與"
            ],
            answer: 0, // A選項
            explanation: "音量與力度的對比是創造音樂層次感的重要方法，可以使音樂表現更加豐富多彩。"
        },
        {
            section: "第三部分：樂曲詮釋與音樂表現",
            question: "舞台表演時，除了演奏技巧，還需要注意？",
            options: [
                "A. 演奏姿勢與舞台表現",
                "B. 只專注技巧，不考慮觀眾",
                "C. 站著演奏，效果會更好",
                "D. 盡量避免看觀眾"
            ],
            answer: 0, // A選項
            explanation: "舞台表演時，良好的演奏姿勢與舞台表現同樣重要，能夠增強音樂的感染力和表現力。"
        },
        
        // 第四部分：音樂理論與綜合應用（16-20題）
        {
            section: "第四部分：音樂理論與綜合應用",
            question: "古箏的 G 調五聲音階包括哪些音？",
            options: [
                "A. G A B D E",
                "B. G A C D E",
                "C. G A B C D",
                "D. G A B D F"
            ],
            answer: 0, // A選項
            explanation: "古箏的G調五聲音階包括G、A、B、D、E這五個音，這是中國傳統音樂中常用的宮調式。"
        },
        {
            section: "第四部分：音樂理論與綜合應用",
            question: "如果在古箏 G 調的基礎上，要轉到 C 調，應該怎麼調整？",
            options: [
                "A. 調高所有琴弦的音高",
                "B. 移動琴碼並調整特定音高",
                "C. 只調音軸，不變換琴碼",
                "D. 直接開始演奏，不需調整"
            ],
            answer: 1, // B選項
            explanation: "從G調轉到C調，需要移動琴碼並調整特定音高，這樣才能確保所有音符都符合新調式的要求。"
        },
        {
            section: "第四部分：音樂理論與綜合應用",
            question: "古箏演奏中的「減字譜」主要記錄了什麼？",
            options: [
                "A. 音高和節奏",
                "B. 指法和節奏",
                "C. 只記錄音高",
                "D. 只記錄指法"
            ],
            answer: 1, // B選項
            explanation: "古箏的「減字譜」主要記錄了指法和節奏，是中國傳統樂器常用的記譜方式。"
        },
        {
            section: "第四部分：音樂理論與綜合應用",
            question: "古箏演奏中，「散音」指的是什麼？",
            options: [
                "A. 不用左手按弦的開放音",
                "B. 用左手按弦的音",
                "C. 特別響亮的音",
                "D. 特別輕柔的音"
            ],
            answer: 0, // A選項
            explanation: "在古箏演奏中，「散音」指的是不用左手按弦的開放音，直接彈奏琴弦原本的音高。"
        },
        {
            section: "第四部分：音樂理論與綜合應用",
            question: "古箏演奏中常用的「按音」技巧主要是用來？",
            options: [
                "A. 改變音高",
                "B. 增強音量",
                "C. 減弱音量",
                "D. 改變音色"
            ],
            answer: 0, // A選項
            explanation: "古箏演奏中的「按音」技巧主要是用來改變音高，通過左手按壓琴弦來產生不同於散音的音高。"
        }
    ];
    
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
    
    // 開始測驗 - 增加錯誤處理
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
                quizContent.style.display = 'block';
            }
            
            // 載入問題
            loadQuestion();
            
            // 添加動畫效果
            if (quizContent) {
                quizContent.classList.add('fade-in');
            }
            
            // 播放琴弦動畫
            playStringAnimation();
            
            console.log('測驗已開始');
        } catch (error) {
            console.error('開始測驗時發生錯誤:', error);
            // 嘗試恢復界面
            if (quizHeader) {
                quizHeader.style.display = 'block';
            }
            alert('開始測驗時發生錯誤，請刷新頁面後重試。');
        }
    }
    
    // 載入問題 - 增加錯誤處理
    function loadQuestion() {
        try {
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
            playNoteAnimation(index);
            
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
            
            // 生成答題詳情
            generateQuestionsReview();
            
            // 播放結果動畫
            playResultAnimation(score);
        } catch (error) {
            console.error('顯示結果時發生錯誤:', error);
            alert('顯示結果時發生錯誤，請刷新頁面後重試。');
        }
    }
    
    // 生成答題詳情 - 增加錯誤處理
    function generateQuestionsReview() {
        try {
            if (!questionsReview) {
                console.error('找不到答題詳情容器');
                return;
            }
            
            questionsReview.innerHTML = '';
            
            userAnswers.forEach((answer, index) => {
                const question = quizData[index];
                const isCorrect = answer === question.answer;
                
                const reviewItem = document.createElement('div');
                reviewItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
                
                reviewItem.innerHTML = `
                    <div class="review-question">
                        <span class="review-number">${index + 1}.</span>
                        <span class="review-text">${question.question}</span>
                        <span class="review-result ${isCorrect ? 'correct' : 'incorrect'}">
                            ${isCorrect ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
                        </span>
                    </div>
                    <div class="review-answer">
                        <div class="review-your-answer">
                            您的答案: ${answer >= 0 ? question.options[answer].substring(0, 1) : '未作答'}
                        </div>
                        <div class="review-correct-answer">
                            正確答案: ${question.options[question.answer].substring(0, 1)}
                        </div>
                    </div>
                    <div class="review-explanation">
                        ${question.explanation}
                    </div>
                `;
                
                questionsReview.appendChild(reviewItem);
            });
        } catch (error) {
            console.error('生成答題詳情時發生錯誤:', error);
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
            if (quizHeader) quizHeader.classList.add('fade-in');
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
                    copyToClipboard(shareText + ' ' + window.location.href);
                    alert('已複製分享內容到剪貼簿！');
                });
            } else {
                // 備用方案：複製到剪貼簿
                copyToClipboard(shareText + ' ' + window.location.href);
                alert('已複製分享內容到剪貼簿！');
            }
        } catch (error) {
            console.error('分享結果時發生錯誤:', error);
            alert('分享結果時發生錯誤，請稍後再試。');
        }
    }
    
    // 複製到剪貼簿 - 增加錯誤處理
    function copyToClipboard(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        } catch (error) {
            console.error('複製到剪貼簿時發生錯誤:', error);
            alert('複製到剪貼簿時發生錯誤，請手動複製。');
        }
    }
    
    // 播放琴弦動畫 - 增加錯誤處理
    function playStringAnimation() {
        try {
            const strings = document.querySelectorAll('.guzheng-string');
            if (strings && strings.length > 0) {
                strings.forEach((string, index) => {
                    setTimeout(() => {
                        string.classList.add('pluck');
                        setTimeout(() => {
                            string.classList.remove('pluck');
                        }, 1000);
                    }, index * 200);
                });
            }
        } catch (error) {
            console.error('播放琴弦動畫時發生錯誤:', error);
        }
    }
    
    // 播放音符動畫 - 增加錯誤處理
    function playNoteAnimation(noteIndex) {
        try {
            // 創建音符元素
            const note = document.createElement('div');
            note.className = 'music-note';
            note.innerHTML = '♪';
            note.style.left = `${20 + noteIndex * 15}%`;
            document.body.appendChild(note);
            
            // 設置動畫結束後移除元素
            setTimeout(() => {
                if (document.body.contains(note)) {
                    document.body.removeChild(note);
                }
            }, 2000);
            
            // 播放對應琴弦動畫
            const stringIndex = noteIndex % 5;
            const string = document.querySelector(`.string-${stringIndex + 1}`);
            if (string) {
                string.classList.add('pluck');
                setTimeout(() => {
                    string.classList.remove('pluck');
                }, 1000);
            }
        } catch (error) {
            console.error('播放音符動畫時發生錯誤:', error);
        }
    }
    
    // 播放結果動畫 - 增加錯誤處理
    function playResultAnimation(score) {
        try {
            // 根據分數決定動畫效果
            if (score >= 15) {
                // 高分動畫：煙花效果
                createFireworks();
            } else if (score >= 8) {
                // 中分動畫：音符飄落
                createFloatingNotes();
            } else {
                // 低分動畫：簡單的脈衝效果
                const scoreCircle = document.querySelector('.score-circle');
                if (scoreCircle) {
                    scoreCircle.classList.add('pulse-animation');
                    setTimeout(() => {
                        scoreCircle.classList.remove('pulse-animation');
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('播放結果動畫時發生錯誤:', error);
        }
    }
    
    // 創建煙花效果 - 增加錯誤處理
    function createFireworks() {
        try {
            const colors = ['#8B5A2B', '#D2B48C', '#A0522D', '#CD853F', '#DEB887'];
            
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const firework = document.createElement('div');
                    firework.className = 'firework';
                    firework.style.left = `${Math.random() * 100}%`;
                    firework.style.top = `${Math.random() * 100}%`;
                    firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    document.body.appendChild(firework);
                    
                    // 動畫結束後移除元素
                    setTimeout(() => {
                        if (document.body.contains(firework)) {
                            document.body.removeChild(firework);
                        }
                    }, 2000);
                }, i * 100);
            }
        } catch (error) {
            console.error('創建煙花效果時發生錯誤:', error);
        }
    }
    
    // 創建飄落音符 - 增加錯誤處理
    function createFloatingNotes() {
        try {
            const notes = ['♪', '♫', '♬', '♩', '♭', '♮'];
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const note = document.createElement('div');
                    note.className = 'floating-note';
                    note.textContent = notes[Math.floor(Math.random() * notes.length)];
                    note.style.left = `${Math.random() * 100}%`;
                    note.style.animationDuration = `${3 + Math.random() * 4}s`;
                    document.body.appendChild(note);
                    
                    // 動畫結束後移除元素
                    setTimeout(() => {
                        if (document.body.contains(note)) {
                            document.body.removeChild(note);
                        }
                    }, 7000);
                }, i * 300);
            }
        } catch (error) {
            console.error('創建飄落音符時發生錯誤:', error);
        }
    }
    
    // 獲取隨機顏色 - 增加錯誤處理
    function getRandomColor() {
        try {
            const colors = ['#8B5A2B', '#D2B48C', '#A0522D', '#CD853F', '#DEB887'];
            return colors[Math.floor(Math.random() * colors.length)];
        } catch (error) {
            console.error('獲取隨機顏色時發生錯誤:', error);
            return '#8B5A2B'; // 返回默認顏色
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
    
    // 添加瀏覽器兼容性檢查
    function checkBrowserCompatibility() {
        try {
            // 檢查基本DOM API
            if (!document.querySelector || !document.getElementById) {
                console.warn('瀏覽器可能不支持現代DOM API');
                alert('您的瀏覽器可能不完全支持此測驗的所有功能，建議使用最新版本的Chrome、Firefox或Safari。');
                return false;
            }
            
            // 檢查ES6特性
            try {
                new Function('const x = 1; let y = 2;')();
            } catch (e) {
                console.warn('瀏覽器可能不支持ES6語法');
                alert('您的瀏覽器可能不完全支持此測驗的所有功能，建議使用最新版本的Chrome、Firefox或Safari。');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('檢查瀏覽器兼容性時發生錯誤:', error);
            return false;
        }
    }
    
    // 執行兼容性檢查
    checkBrowserCompatibility();
});
