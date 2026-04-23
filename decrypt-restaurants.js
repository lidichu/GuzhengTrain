// 解密功能
function decryptRestaurantsData(encryptedData) {
    try {
        // Base64解碼
        const base64Decoded = atob(encryptedData);
        
        // 字符偏移還原 (凱薩密碼解密)
        const offset = 3;
        let originalString = '';
        for(let i = 0; i < base64Decoded.length; i++) {
            const charCode = base64Decoded.charCodeAt(i);
            originalString += String.fromCharCode(charCode - offset);
        }
        
        // 解析JSON
        return JSON.parse(originalString);
    } catch (error) {
        console.error('解密餐廳資料時發生錯誤:', error);
        return []; // 返回空數組以防止頁面崩潰
    }
}

// 加載並解密餐廳資料
function loadRestaurantsData() {
    // 確保ENCRYPTED_RESTAURANTS_DATA變量已定義(從encrypted-restaurants.js加載)
    if (typeof ENCRYPTED_RESTAURANTS_DATA !== 'undefined') {
        // 解密資料
        const decryptedData = decryptRestaurantsData(ENCRYPTED_RESTAURANTS_DATA);
        
        // 返回解密後的餐廳資料
        return decryptedData;
    } else {
        console.error('找不到加密的餐廳資料');
        return [];
    }
}