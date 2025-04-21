import feedparser
from datetime import datetime
import os

# Google Alerts RSS URL
FEED_URL = "https://www.google.com.tw/alerts/feeds/13775840034613881700/10460128705551238020"

def fetch_alerts():
    try:
        feed = feedparser.parse(FEED_URL)
        
        # 建立基本的 HTML 結構
        html = """
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Alerts 更新</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .alert-list { list-style-type: none; padding: 0; }
        .alert-item { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
        .date { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h2>最新 Google Alerts 更新</h2>
    <p>最後更新時間：{update_time}</p>
    <ul class="alert-list">
""".format(update_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        # 添加每個 alert 項目
        for entry in feed.entries[:10]:  # 顯示最新的10條
            published = datetime(*entry.published_parsed[:6]).strftime("%Y-%m-%d")
            html += f"""
    <li class="alert-item">
        <a href="{entry.link}" target="_blank">{entry.title}</a>
        <div class="date">{published}</div>
    </li>"""

        html += """
    </ul>
</body>
</html>
"""

        # 寫入檔案
        with open("alerts.html", "w", encoding="utf-8") as f:
            f.write(html)
        
        print("成功更新 alerts.html")
        return True
    
    except Exception as e:
        print(f"發生錯誤: {str(e)}")
        return False

if __name__ == "__main__":
    fetch_alerts()
