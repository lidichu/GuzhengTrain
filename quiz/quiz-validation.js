// 古箏能力測驗 - 表單驗證
document.addEventListener('DOMContentLoaded', function() {
    console.log('測驗驗證模組已載入');
    
    // 全局變量
    let nextBtn, submitBtn, userAnswers;
    
    // 初始化驗證
    function initValidation() {
        try {
            console.log('初始化表單驗證');
            
            // 獲取按鈕元素
            nextBtn = document.getElementById('next-btn');
            submitBtn = document.getElementById('submit-btn');
            
            // 如果找不到按鈕，則退出
            if (!nextBtn) {
                console.error('找不到下一題按鈕');
                return;
            }
            
            if (!submitBtn) {
                console.error('找不到提交按鈕');
                return;
            }
            
            // 覆蓋原有的點擊事件
            nextBtn.addEventListener('click', validateBeforeNext);
            submitBtn.addEventListener('click', validateBeforeSubmit);
            
            // 監聽測驗開始事件
            const startQuizBtn = document.getElementById('start-quiz');
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', function() {
                    // 等待測驗內容加載完成後再初始化驗證
                    setTimeout(setupValidation, 500);
                });
            }
            
            console.log('表單驗證初始化完成');
        } catch (error) {
            console.error('初始化表單驗證時發生錯誤:', error);
        }
    }
    
    // 設置驗證
    function setupValidation() {
        try {
            console.log('設置表單驗證');
            
            // 獲取用戶答案數組
            // 注意：這裡我們需要訪問 quiz-fixed.js 中的 userAnswers 變量
            // 由於變量作用域的限制，我們需要一個間接方法來獲取或追蹤用戶答案
            
            // 初始化用戶答案追蹤
            userAnswers = [];
            
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
            
            // 初始狀態下禁用下一題按鈕
            updateButtonState(false);
            
            console.log('表單驗證設置完成');
        } catch (error) {
            console.error('設置表單驗證時發生錯誤:', error);
        }
    }
    
    // 更新按鈕狀態
    function updateButtonState(hasAnswer) {
        try {
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
            
            if (submitBtn && submitBtn.style.display !== 'none') {
                if (hasAnswer) {
                    // 啟用按鈕
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('disabled');
                    submitBtn.title = "提交答案";
                } else {
                    // 禁用按鈕
                    submitBtn.disabled = true;
                    submitBtn.classList.add('disabled');
                    submitBtn.title = "請先選擇一個答案";
                }
            }
        } catch (error) {
            console.error('更新按鈕狀態時發生錯誤:', error);
        }
    }
    
    // 驗證後再進入下一題
    function validateBeforeNext(e) {
        try {
            // 檢查是否有選擇答案
            const selectedOption = document.querySelector('.option.selected');
            
            if (!selectedOption) {
                // 阻止默認行為
                e.preventDefault();
                e.stopPropagation();
                
                // 顯示提示
                showValidationMessage();
                
                return false;
            }
            
            // 有選擇答案，允許進入下一題
            // 這裡我們不阻止默認行為，讓原來的 goToNextQuestion 函數執行
            
            // 在進入下一題後，重置按鈕狀態
            setTimeout(function() {
                updateButtonState(false);
            }, 100);
            
        } catch (error) {
            console.error('驗證下一題時發生錯誤:', error);
        }
    }
    
    // 驗證後再提交
    function validateBeforeSubmit(e) {
        try {
            // 檢查是否有選擇答案
            const selectedOption = document.querySelector('.option.selected');
            
            if (!selectedOption) {
                // 阻止默認行為
                e.preventDefault();
                e.stopPropagation();
                
                // 顯示提示
                showValidationMessage();
                
                return false;
            }
            
            // 有選擇答案，允許提交
            // 這裡我們不阻止默認行為，讓原來的 submitQuiz 函數執行
            
        } catch (error) {
            console.error('驗證提交時發生錯誤:', error);
        }
    }
    
    // 顯示驗證提示消息
    // function showValidationMessage() {
    //     try {
    //         // 檢查是否已存在提示消息
    //         let validationMsg = document.querySelector('.validation-message');
            
    //         if (!validationMsg) {
    //             // 創建提示消息
    //             validationMsg = document.createElement('div');
    //             validationMsg.className = 'validation-message';
    //             validationMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> 請選擇一個答案後再繼續';
                
    //             // 添加到問題容器中
    //             const questionContainer = document.querySelector('.quiz-question-container');
    //             if (questionContainer) {
    //                 questionContainer.appendChild(validationMsg);
    //             }
                
    //             // 添加動畫效果
    //             validationMsg.classList.add('shake-animation');
                
    //             // 3秒後自動消失
    //             setTimeout(function() {
    //                 if (validationMsg.parentNode) {
    //                     validationMsg.parentNode.removeChild(validationMsg);
    //                 }
    //             }, 3000);
    //         } else {
    //             // 重新添加動畫效果
    //             validationMsg.classList.remove('shake-animation');
    //             void validationMsg.offsetWidth; // 觸發重繪
    //             validationMsg.classList.add('shake-animation');
                
    //             // 重置消失計時器
    //             setTimeout(function() {
    //                 if (validationMsg.parentNode) {
    //                     validationMsg.parentNode.removeChild(validationMsg);
    //                 }
    //             }, 3000);
    //         }
            
    //     } catch (error) {
    //         console.error('顯示驗證提示時發生錯誤:', error);
    //     }
    // }
    
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
    
    // 初始化驗證
    initValidation();
    
    // 監聽問題變化
    listenForQuestionChanges();
    
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
    
    // 添加樣式
    addStyles();
    
    // 公開接口
    window.quizValidation = {
        updateButtonState: updateButtonState
    };
});

// 修改 quiz-fixed.js 中的選項選擇函數
// 由於我們不能直接修改 quiz-fixed.js，所以我們使用一個技巧來增強其功能
(function() {
    // 等待原始函數加載完成
    window.addEventListener('load', function() {
        try {
            // 監聽選項點擊事件
            document.addEventListener('click', function(e) {
                const option = e.target.closest('.option');
                if (option) {
                    // 用戶選擇了選項，更新按鈕狀態
                    if (window.quizValidation && window.quizValidation.updateButtonState) {
                        window.quizValidation.updateButtonState(true);
                    }
                }
            });
            
            // 監聽問題變化
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.target.id === 'question-text') {
                        // 問題已變化，檢查是否有選中的選項
                        setTimeout(function() {
                            const selectedOption = document.querySelector('.option.selected');
                            if (window.quizValidation && window.quizValidation.updateButtonState) {
                                window.quizValidation.updateButtonState(!!selectedOption);
                            }
                        }, 100);
                    }
                });
            });
            
            const questionText = document.getElementById('question-text');
            if (questionText) {
                observer.observe(questionText, { childList: true });
            }
            
            console.log('選項選擇增強功能已加載');
        } catch (error) {
            console.error('增強選項選擇功能時發生錯誤:', error);
        }
    });
})();