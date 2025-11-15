#!/bin/bash

# 設置基本 URL
BASE_URL="http://localhost:5500/api/map"
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

echo -e "${GREEN}===== 測試區域清單 API =====${NC}"

# 1. 測試獲取所有區域定義
test_api "獲取區域清單" "curl -s -X GET -H \"$HEADER\" $BASE_URL/regions | python -m json.tool"

echo -e "${GREEN}===== 測試地圖區域 API =====${NC}"

# 2. 測試獲取所有地圖區域
test_api "獲取所有地圖區域" "curl -s -X GET -H \"$HEADER\" $BASE_URL/map-regions | python -m json.tool"

# 3. 測試獲取單個地圖區域
test_api "獲取單個地圖區域" "curl -s -X GET -H \"$HEADER\" $BASE_URL/map-regions/path6251 | python -m json.tool"

# 4. 測試更新地圖區域的區域歸屬
test_api "更新地圖區域的區域歸屬" "curl -s -X PUT -H \"$HEADER\" $BASE_URL/map-regions/path6251 \
-d '{
    \"region_id\": \"A01\",
    \"country\": \"中國\",
    \"responsable\": \"張三\",
    \"contact\": \"zhangsan@example.com\"
}' | python -m json.tool"

# 5. 測試批量更新地圖區域
test_api "批量更新地圖區域" "curl -s -X PUT -H \"$HEADER\" $BASE_URL/map-regions/batch \
-d '{
    \"updates\": [
        {
            \"path_id\": \"path6241\",
            \"region_id\": \"E01\",
            \"country\": \"紐西蘭\"
        },
        {
            \"path_id\": \"path6235\",
            \"region_id\": \"E01\",
            \"country\": \"澳洲\"
        }
    ]
}' | python -m json.tool"

# 6. 測試查詢特定區域的所有國家
test_api "查詢大洋洲的所有國家" "curl -s -X GET -H \"$HEADER\" $BASE_URL/map-regions/by-region/E01 | python -m json.tool"

# 7. 測試重置地圖區域的區域歸屬
test_api "重置地圖區域的區域歸屬" "curl -s -X PUT -H \"$HEADER\" $BASE_URL/map-regions/path6251/reset \
-d '{
    \"region_id\": \"\",
    \"country\": \"\"
}' | python -m json.tool"

echo -e "\n${GREEN}測試完成${NC}" 