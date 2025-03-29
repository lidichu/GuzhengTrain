// 古箏能力測驗 - 下一題驗證
document.addEventListener('DOMContentLoaded', function() {
    console.log('下一題驗證模組已載入');
    
    // 全局變量
    let nextBtn, submitBtn;
    let validationEnabled = false;
    
    // 初始化驗證
    function initValidation() {
        try {
            console.log('初始化下一題驗證');
            
            // 獲取按鈕元素
            nextBtn = document.getElementById('next-btn');
            submitBtn = document.getElementById('submit-btn');
            
            // 如果找不到按鈕，則退出
            if (!nextBtn) {
                console.error('找不到下一題按鈕');
                return;
            }
            
            // 監聽測驗開始事件
            const startQuizBtn = document.getElementById('start-quiz');
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', function() {
                    // 等待測驗內容加載完成後再初始化驗證
                    setTimeout(setupValidation, 500);
                });
            }
            
            console.log('下一題驗證初始化完成');
        } catch (error) {
            console.error('初始化下一題驗證時發生錯誤:', error);
        }
    }
    
    // 設置驗證
    function setupValidation() {
        try {
            console.log('設置下一題驗證');
            
            // 監聽選項點擊事件
            const optionsContainer = document.querySelector('.options-container');
            if (optionsContainer) {
                optionsContainer.addEventListener('click', function(e) {
                    const option = e.target.closest('.option');
                    if (option) {
                        // 用戶選擇了選項，更新按鈕狀態
                        updateButtonState(true);
                    }
                });
            }
            
            // 覆蓋原有的點擊事件
            if (nextBtn) {
                // 保存原始的點擊處理函數
                const originalClickHandler = nextBtn.onclick;
                
                // 設置新的點擊處理函數
                nextBtn.onclick = function(e) {
                    // 檢查是否有選擇答案
                    if (!validateSelection()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    
                    // 有選擇答案，調用原始處理函數
                    if (typeof originalClickHandler === 'function') {
                        originalClickHandler.call(this, e);
                    }
                    
                    // 在進入下一題後，重置按鈕狀態
                    setTimeout(function() {
                        updateButtonState(false);
                    }, 100);
                };
            }
            
            // 初始狀態下禁用下一題按鈕
            updateButtonState(false);
            validationEnabled = true;
            
            console.log('下一題驗證設置完成');
        } catch (error) {
            console.error('設置下一題驗證時發生錯誤:', error);
        }
    }
    
    // 驗證是否已選擇答案
    function validateSelection() {
        // 如果驗證未啟用，則始終返回 true
        if (!validationEnabled) return true;
        
        // 檢查是否有選擇答案
        const selectedOption = document.querySelector('.option.selected');
        
        if (!selectedOption) {
            // 顯示提示
            showValidationMessage();
            return false;
        }
        
        return true;
    }
    
    // 更新按鈕狀態
    function updateButtonState(hasAnswer) {
        try {
            if (!validationEnabled) return;
            
            if (nextBtn) {
                if (hasAnswer) {
                    // 啟用按鈕
                    nextBtn.disabled = false;
                    nextBtn.classList.remove('disabled');
                    nextBtn.title = "前往下一題";
                } else {
                    // 禁用按鈕
                    nextBtn.disabled = true;
                    nextBtn.classList.add('disabled');
                    nextBtn.title = "請先選擇一個答案";
                }
            }
        } catch (error) {
            console.error('更新按鈕狀態時發生錯誤:', error);
        }
    }
    
   
    
    // 監聽問題變化事件
    function listenForQuestionChanges() {
        try {
            // 使用 MutationObserver 監聽問題容器的變化
            const questionText = document.getElementById('question-text');
            if (questionText) {
                const observer = new MutationObserver(function(mutations) {
                    // 問題發生變化，重置按鈕狀態
                    setTimeout(function() {
                        // 檢查是否已有選擇
                        const selectedOption = document.querySelector('.option.selected');
                        updateButtonState(!!selectedOption);
                    }, 100);
                });
                
                observer.observe(questionText, { childList: true, characterData: true, subtree: true });
            }
            
        } catch (error) {
            console.error('監聽問題變化時發生錯誤:', error);
        }
    }
    
    // 添加 CSS 樣式
    function addStyles() {
        try {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .validation-message {
                    background-color: #ffebee;
                    color: #f44336;
                    padding: 10px 15px;
                    border-radius: 5px;
                    margin-top: 15px;
                    display: flex;
                    align-items: center;
                    font-size: 0.9rem;
                    border-left: 3px solid #f44336;
                }
                
                .validation-message i {
                    margin-right: 8px;
                    font-size: 1.1rem;
                }
                
                .shake-animation {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                .disabled {
                    opacity: 0.6;
                    cursor: not-allowed !important;
                }
            `;
            document.head.appendChild(styleElement);
        } catch (error) {
            console.error('添加樣式時發生錯誤:', error);
        }
    }
    
    // 初始化驗證
    initValidation();
    
    // 監聽問題變化
    listenForQuestionChanges();
    
    // 添加樣式
    addStyles();
    
    // 監聽提交按鈕，但不阻止其原始功能
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            // 只檢查是否有選擇答案，但不阻止事件
            if (!validateSelection()) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // 允許原始提交功能繼續執行
            console.log('提交答案');
            // 禁用驗證，避免干擾結果頁面
            validationEnabled = false;
        });
    }
    
    // 監聽結果頁面顯示
    document.addEventListener('DOMNodeInserted', function(e) {
        if (e.target.id === 'quiz-result' || 
            (e.target.nodeType === 1 && e.target.querySelector('#quiz-result'))) {
            console.log('測驗結果頁面已顯示');
            // 禁用驗證，避免干擾結果頁面
            validationEnabled = false;
        }
    });
});