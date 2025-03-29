// 古箏能力測驗 - 輔助函數

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

// 檢查瀏覽器兼容性
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

// 生成答題詳情 - 增加錯誤處理
function generateQuestionsReview(questionsReview, userAnswers, quizData) {
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

// 導出函數供主檔案使用
const quizUtils = {
    copyToClipboard,
    playStringAnimation,
    playNoteAnimation,
    playResultAnimation,
    createFireworks,
    createFloatingNotes,
    getRandomColor,
    checkBrowserCompatibility,
    generateQuestionsReview
};

// 確保在瀏覽器和 Node.js 環境下都能正常工作
if (typeof window !== 'undefined') {
    window.quizUtils = quizUtils;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = quizUtils;
}