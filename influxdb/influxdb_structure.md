# InfluxDB 數據結構說明

## 變更記錄與需求

### 待處理需求
在此記錄需要變更的需求：
```
格式：
[日期] 需求描述
- 變更內容
- 預期結果
- 優先級
```

### 變更歷史
記錄已完成的變更：
```
格式：
[日期] 變更描述
- 變更內容
- 執行人
- 驗證結果
```

## 基本信息

- 數據庫位置：`/home/daniel/project/EnergyAi/influxdb/data`
- 配置文件：`/home/daniel/project/EnergyAi/influxdb/config`
- 日誌文件：`/home/daniel/project/EnergyAi/influxdb/influxd.log`

## 數據結構

### 時序數據表

1. 設備運行數據
   - 表名：`equipment_data`
   - 時間戳：`time`
   - 標籤（Tags）：
     - `equipment_id`: 設備ID
     - `site_id`: 站點ID
   - 字段（Fields）：
     - `power`: 功率 (kW)
     - `voltage`: 電壓 (V)
     - `rpm`: 轉速 (RPM)
     - `wind_speed`: 風速 (m/s)

### 數據保留策略

默認保留策略：永久保存

### 數據採集頻率

- 採樣間隔：1分鐘
- 存儲精度：秒級

## 查詢示例

1. 查詢特定設備最近一小時的數據：
```flux
from(bucket: "equipment_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["equipment_id"] == "設備ID")
```

2. 查詢特定站點所有設備的平均功率：
```flux
from(bucket: "equipment_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["site_id"] == "站點ID")
  |> mean(column: "power")
```

## 注意事項

1. 數據備份：建議定期備份 data 目錄
2. 日誌監控：監控 influxd.log 文件以排查問題
3. 數據清理：根據業務需求設置適當的數據保留策略 




{
        "user": {
                "links": {
                        "self": "/api/v2/users/0e8b9653a7b20000"
                },
                "id": "0e8b9653a7b20000",
                "name": "admin",
                "status": "active"
        },
        "bucket": {
                "id": "7fb90bcc25084f93",
                "orgID": "d35bb549ecacee4d",
                "type": "user",
                "name": "power-plant-data",
                "retentionRules": [
                        {
                                "type": "expire",
                                "everySeconds": 0,
                                "shardGroupDurationSeconds": 604800
                        }
                ],
                "createdAt": "2025-03-10T04:41:48.352519Z",
                "updatedAt": "2025-03-10T04:41:48.352519Z",
                "links": {
                        "labels": "/api/v2/buckets/7fb90bcc25084f93/labels",
                        "members": "/api/v2/buckets/7fb90bcc25084f93/members",
                        "org": "/api/v2/orgs/d35bb549ecacee4d",
                        "owners": "/api/v2/buckets/7fb90bcc25084f93/owners",
                        "self": "/api/v2/buckets/7fb90bcc25084f93",
                        "write": "/api/v2/write?org=d35bb549ecacee4d\u0026bucket=7fb90bcc25084f93"
                },
                "labels": []
        },
        "org": {
                "links": {
                        "buckets": "/api/v2/buckets?org=energy-ai",
                        "dashboards": "/api/v2/dashboards?org=energy-ai",
                        "labels": "/api/v2/orgs/d35bb549ecacee4d/labels",
                        "logs": "/api/v2/orgs/d35bb549ecacee4d/logs",
                        "members": "/api/v2/orgs/d35bb549ecacee4d/members",
                        "owners": "/api/v2/orgs/d35bb549ecacee4d/owners",
                        "secrets": "/api/v2/orgs/d35bb549ecacee4d/secrets",
                        "self": "/api/v2/orgs/d35bb549ecacee4d",
                        "tasks": "/api/v2/tasks?org=energy-ai"
                },
                "id": "d35bb549ecacee4d",
                "name": "energy-ai",
                "description": "",
                "createdAt": "2025-03-10T04:41:48.077413Z",
                "updatedAt": "2025-03-10T04:41:48.077413Z"
        },
        "auth": {
                "id": "0e8b965424720000",
                "token": "HQBPVrtG6S_1CgIosxVZ8I2S7T8mZi3rQcoVElurOH8SeQ-B7FE-jAxURsOizPjMJ_ffe-hLoqdLYv35pgpCuQ==",
                "status": "active",
                "description": "admin's Token",
                "orgID": "d35bb549ecacee4d",
                "userID": "0e8b9653a7b20000",
                "permissions": [
                        {
                                "action": "read",
                                "resource": {
                                        "type": "authorizations"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "authorizations"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "buckets"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "buckets"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "dashboards"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "dashboards"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "orgs"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "orgs"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "sources"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "sources"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "tasks"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "tasks"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "telegrafs"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "telegrafs"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "users"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "users"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "variables"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "variables"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "scrapers"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "scrapers"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "secrets"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "secrets"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "labels"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "labels"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "views"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "views"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "documents"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "documents"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "notificationRules"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "notificationRules"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "notificationEndpoints"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "notificationEndpoints"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "checks"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "checks"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "dbrp"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "dbrp"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "notebooks"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "notebooks"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "annotations"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "annotations"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "remotes"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "remotes"
                                }
                        },
                        {
                                "action": "read",
                                "resource": {
                                        "type": "replications"
                                }
                        },
                        {
                                "action": "write",
                                "resource": {
                                        "type": "replications"
                                }
                        }
                ],
                "createdAt": "2025-03-10T12:41:48.433551+08:00",
                "updatedAt": "2025-03-10T12:41:48.433551+08:00",
                "links": {
                        "self": "/api/v2/authorizations/0e8b965424720000",
                        "user": "/api/v2/users/0e8b9653a7b20000"
                }
        }
}%                    



========
# InfluxDB 安裝與設置指南

## 1. 安裝 InfluxDB
在 MacOS 上使用 Homebrew 安裝 InfluxDB：
安裝 InfluxDB
brew install influxdb
安裝 InfluxDB CLI
brew install influxdb-cli


停止服務
brew services stop influxdb
清理配置和數據
rm -rf ~/.influxdbv2/
rm -rf /usr/local/var/influxdb/
創建必要的目錄
mkdir -p ~/.influxdbv2
mkdir -p /usr/local/var/influxdb

啟動服務
brew services start influxdb
等待服務完全啟動（約 5-10 秒）
sleep 10
檢查服務狀態
curl http://localhost:8086/health

執行初始化設置
curl -XPOST http://localhost:8086/api/v2/setup \
-H 'Content-Type: application/json' \
-d '{
"username": "admin",
"password": "findaniel",
"org": "energy-ai",
"bucket": "power-plant-data",
"force": true
}'

