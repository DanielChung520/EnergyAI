#!/bin/bash

# 獲取腳本所在目錄的絕對路徑
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 切換到 influxdb 目錄
cd "$SCRIPT_DIR"

# 檢查並創建數據目錄
mkdir -p data/{meta,data,wal}

# 檢查是否已經運行
if pgrep influxd > /dev/null; then
    echo "InfluxDB is already running"
    exit 0
fi

# 使用 2.x 專用參數啟動
nohup influxd > influxd.log 2>&1 &

echo "InfluxDB 2.x started (使用端口 8086)"
echo "連接命令: influx -host localhost -port 8086 -username admin -password findaniel" 