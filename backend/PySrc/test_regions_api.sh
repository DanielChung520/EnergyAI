#!/bin/bash

# 設置基本 URL
BASE_URL="http://localhost:5500/api/map/regions"
HEADER="Content-Type: application/json"

# 測試獲取所有區域
echo "測試獲取所有區域..."
curl -s -X GET -H "$HEADER" "$BASE_URL"

# 測試創建新的區域
echo -e "\n創建新的區域..."
curl -s -X POST -H "$HEADER" "$BASE_URL" -d '{
  "id": "B02",
  "name": "中歐",
  "division": "CE",
  "sort_no": 8
}'

# 測試獲取單個區域
echo -e "\n獲取單個區域 (id: B02)..."
curl -s -X GET -H "$HEADER" "$BASE_URL/B02"

# 測試更新區域
echo -e "\n更新區域 (id: B02)..."
curl -s -X PUT -H "$HEADER" "$BASE_URL/B02" -d '{
  "name": "更新後的中歐",
  "division": "CE",
  "sort_no": 9
}'

# 測試刪除區域
echo -e "\n刪除區域 (id: B02)..."
curl -s -X DELETE -H "$HEADER" "$BASE_URL/B02"

# 獲取所有區域以確認刪除
echo -e "\n確認刪除後獲取所有區域..."
curl -s -X GET -H "$HEADER" "$BASE_URL"

echo -e "\n測試完成" 