// 餐廳資料列表
const restaurantsOriginalData = [
    {name: "一碗豆腐", city: "屏東", address: "屏東縣屏東市民族路180號", lat: 22.6720, lng: 120.4880, award: "1碗", category: "豆腐"},
    {name: "大社牛肉麵", city: "屏東", address: "屏東縣屏東市自由路500號", lat: 22.6705, lng: 120.4875, award: "1碗", category: "牛肉麵"},
    {name: "水底寮無名小吃店", city: "屏東", address: "屏東縣屏東市水底寮路50號", lat: 22.6750, lng: 120.4900, award: "1碗", category: "台灣小吃"},
    {name: "永和豆漿大王", city: "屏東", address: "屏東縣屏東市自由路503號", lat: 22.6705, lng: 120.4875, award: "1碗", category: "豆漿"},
    {name: "光華鴨肉專賣店", city: "屏東", address: "屏東縣屏東市光華路100號", lat: 22.6720, lng: 120.4880, award: "1碗", category: "鴨肉"},
    {name: "李家肉圓", city: "屏東", address: "屏東縣屏東市民族路190號", lat: 22.6720, lng: 120.4880, award: "1碗", category: "肉圓"},
    {name: "東港正宗肉丸", city: "屏東", address: "屏東縣東港鎮新生三路108號", lat: 22.4650, lng: 120.4490, award: "1碗", category: "肉丸"},
    {name: "東港肉包大王", city: "屏東", address: "屏東縣東港鎮新生三路110號", lat: 22.4650, lng: 120.4490, award: "1碗", category: "肉包"},
    {name: "東勢老麵店", city: "屏東", address: "屏東縣東港鎮東勢路50號", lat: 22.4670, lng: 120.4510, award: "1碗", category: "粄條"}
];

// 這裡使用簡單的加密方法 (Base64 + 簡單偏移)
function encryptData(data) {
    // 轉換為JSON字符串
    const jsonString = JSON.stringify(data);
    
    // 簡單字符偏移 (凱薩密碼)
    const offset = 3;
    let shiftedString = '';
    for(let i = 0; i < jsonString.length; i++) {
        const charCode = jsonString.charCodeAt(i);
        shiftedString += String.fromCharCode(charCode + offset);
    }
    
    // Base64 編碼
    return btoa(shiftedString);
}

// 加密資料並導出
const encryptedData = encryptData(restaurantsOriginalData);
console.log("資料已加密存儲");