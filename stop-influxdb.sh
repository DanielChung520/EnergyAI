#!/bin/bash

# 停止 InfluxDB
if pgrep influxd > /dev/null; then
    echo "正在停止 InfluxDB..."
    sudo pkill influxd
    echo "InfluxDB 已停止"
else
    echo "InfluxDB 未在運行"
fi 