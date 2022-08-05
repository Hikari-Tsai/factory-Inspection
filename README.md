# factory-Inspection
IoT裝置，線上自動檢測記錄系統

# 建議系統
主機：Raspberry Pi 4 2G
作業系統：Debian
必要套件：Apache

# 說明
於 http://127.0.0.1 本地端打開網頁，可由藍牙條碼槍輸入生產序號，並由IoT裝置進行讀取
IoT裝置post回相關參數與生產序號記錄於SQLite，路徑./db/factory_log.db
SQL寫入規則與相關參數修改： CreateTable.php
