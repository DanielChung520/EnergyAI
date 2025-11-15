#!/bin/bash

# 設置基本 URL
BASE_URL="http://localhost:5500/api/map/regions"
HEADER="Content-Type: application/json"

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 測試函數
test_api() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
    eval $2
    echo
}

# 1. 測試獲取所有區域
test_api "獲取所有區域" "curl -s -X GET -H \"$HEADER\" $BASE_URL | python -m json.tool"

# 2. 測試創建新的區域
test_api "創建新的區域" "curl -s -X POST -H \"$HEADER\" $BASE_URL \
-d '{
    \"id\": \"B02\",
    \"name\": \"中歐\",
    \"division\": \"CE\",
    \"sort_no\": 8
}' | python -m json.tool"

# 3. 測試獲取單個區域
test_api "獲取單個區域 (id: B02)" "curl -s -X GET -H \"$HEADER\" $BASE_URL/B02 | python -m json.tool"

# 4. 測試更新區域
test_api "更新區域 (id: B02)" "curl -s -X PUT -H \"$HEADER\" $BASE_URL/B02 \
-d '{
    \"name\": \"更新後的中歐\",
    \"division\": \"CE\",
    \"sort_no\": 9
}' | python -m json.tool"

# 5. 測試刪除區域
test_api "刪除區域 (id: B02)" "curl -s -X DELETE -H \"$HEADER\" $BASE_URL/B02 | python -m json.tool"

# 6. 確認刪除結果
test_api "確認刪除後獲取所有區域" "curl -s -X GET -H \"$HEADER\" $BASE_URL | python -m json.tool"

echo -e "\n${GREEN}測試完成${NC}" 