#!/bin/bash

# 設置基本 URL
BASE_URL="http://localhost:5500/api/map/map-regions"
HEADER="Content-Type: application/json"

# 測試獲取所有地圖區域
echo "測試獲取所有地圖區域..."
curl -s -X GET -H "$HEADER" "$BASE_URL" | python3 -m json.tool

# 測試創建新的地圖區域
echo -e "\n創建新的地圖區域..."
curl -s -X POST -H "$HEADER" "$BASE_URL" -d '{
  "path_id": "path5678",
  "region_id": "A01",
  "country": "測試國家",
  "responsable": "負責人",
  "contact": "聯繫方式",
  "coordinates": [1.0, 2.0]
}' | python3 -m json.tool

# 測試獲取單個地圖區域
echo -e "\n獲取單個地圖區域 (path_id: path5678)..."
curl -s -X GET -H "$HEADER" "$BASE_URL/path5678" | python3 -m json.tool

# 測試更新地圖區域
echo -e "\n更新地圖區域 (path_id: path5678)..."
curl -s -X PUT -H "$HEADER" "$BASE_URL/path5678" -d '{
  "region_id": "A02",
  "country": "更新後的國家",
  "responsable": "更新後的負責人",
  "contact": "更新後的聯繫方式"
}' | python3 -m json.tool

# 測試刪除地圖區域
echo -e "\n刪除地圖區域 (path_id: path5678)..."
curl -s -X DELETE -H "$HEADER" "$BASE_URL/path5678" | python3 -m json.tool

# 獲取所有地圖區域以確認刪除
echo -e "\n確認刪除後獲取所有地圖區域..."
curl -s -X GET -H "$HEADER" "$BASE_URL" | python3 -m json.tool

echo -e "\n測試完成" 