// 古箏能力測驗 - 結果顯示修補
document.addEventListener('DOMContentLoaded', function() {
    console.log('結果顯示修補已載入');
    
    // 等待原始 JS 加載完成
    window.addEventListener('load', function() {
        try {
            // 獲取結果區域
            const quizResult = document.getElementById('quiz-result');
            
            if (!quizResult) {
                console.error('找不到測驗結果區域');
                return;
            }
            
            // 創建一個 MutationObserver 來監視結果區域的顯示狀態
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && 
                        mutation.attributeName === 'style' && 
                        quizResult.style.display === 'block') {
                        
                        console.log('測驗結果區域已顯示，確保其保持可見');
                        
                        // 確保結果區域可見
                        setTimeout(function() {
                            quizResult.style.display = 'block';
                            quizResult.style.opacity = '1';
                            quizResult.style.visibility = 'visible';
                            quizResult.classList.add('fade-in');
                            
                            // 強制重新渲染
                            quizResult.offsetHeight;
                            
                            // 滾動到結果區域
                            quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            
                            // 再次確保結果區域可見（延遲執行）
                            setTimeout(function() {
                                quizResult.style.display = 'block';
                                quizResult.style.opacity = '1';
                                quizResult.style.visibility = 'visible';
                            }, 500);
                        }, 100);
                    }
                });
            });
            
            // 開始觀察
            observer.observe(quizResult, { attributes: true });
            
            console.log('結果顯示修補已設置');
        } catch (error) {
            console.error('設置結果顯示修補時發生錯誤:', error);
        }
    });
});