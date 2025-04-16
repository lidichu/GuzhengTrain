document.addEventListener('DOMContentLoaded', function() {
  console.log("導航加載腳本執行中...");
  
  // 直接在控制台顯示頁面路徑，協助調試
  console.log("當前頁面路徑:", window.location.pathname);
  
  // 檢查 includes 目錄位置
  function checkPath(path) {
    return fetch(path)
    .then(response => {
        if (response.ok) {
          console.log("找到導航文件:", path);
          return path;
      }
        throw new Error(`找不到路徑: ${path}`);
    })
    .catch(error => {
        console.log(error.message);
        return null;
      });
  }
  
  // 嘗試多種可能的路徑位置
  Promise.all([
    checkPath('../includes/nav.html'), 
    checkPath('../../includes/nav.html'),
    checkPath('../js/nav.html'),
    checkPath('includes/nav.html'),
    checkPath('/includes/nav.html')
  ])
  .then(results => {
    // 過濾出可用的路徑
    const validPath = results.filter(path => path !== null)[0];
    console.log("使用路徑:", validPath);
    
    if (validPath) {
      // 找到有效路徑，加載導航欄
      return fetch(validPath)
        .then(response => response.text())
        .then(data => {
      const navPlaceholder = document.getElementById('nav-placeholder');
      if (navPlaceholder) {
            navPlaceholder.innerHTML = data;
          } else {
            const bodyElement = document.body;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            bodyElement.insertBefore(tempDiv.firstChild, bodyElement.firstChild);
      }
          
          // 初始化導航欄的響應式行為
          const menuIcon = document.querySelector('.menu-icon');
          if (menuIcon) {
            menuIcon.addEventListener('click', function() {
              document.querySelector('.nav-menu').classList.toggle('active');
    });
          }
          
          console.log("導航欄加載成功!");
});
    } else {
      throw new Error("無法找到導航欄文件");
    }
  })
  .catch(error => {
    console.error("導航加載失敗:", error);
    document.getElementById('nav-placeholder').innerHTML = 
      '<div style="color: red; padding: 10px; background: #ffeeee; border: 1px solid #ff0000;">導航欄加載失敗: ' + error.message + '</div>';
  });
});