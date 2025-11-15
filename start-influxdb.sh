#!/bin/bash

# 進入 InfluxDB 目錄
cd "$(dirname "$0")"/influxdb

# 檢查是否已經運行
if pgrep influxd > /dev/null; then
    echo "InfluxDB is already running"
    exit 0
fi

# 檢查並創建數據目錄
mkdir -p data/{meta,data,wal}
# 確保數據目錄存在並且有正確的權限
sudo chown -R influxdb:influxdb data

# 啟動 InfluxDB
nohup influxd > influxd.log 2>&1 &

echo "InfluxDB started (使用端口 8086)"
echo "連接命令: influx -host localhost -port 8086 -username admin -password findaniel" 