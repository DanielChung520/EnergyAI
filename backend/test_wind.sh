#!/bin/bash
# 基礎配置
BASE_URL="http://localhost:5500/api/wind"
TEMP_SECRET="wind_test_only_123"

# 獲取測試用JWT Token (需先有註冊用戶)
USER_ID="testuser"
TOKEN=$(python3 -c "import jwt; print(jwt.encode({'userid': '$USER_ID'}, '$TEMP_SECRET', algorithm='HS256'))")

# 測試1: 正常獲取小時級數據
echo -e "\n\033[34m測試1: 正常小時級數據請求\033[0m"
curl -X GET "${BASE_URL}/81f6d637-b345-43dd-a8a3-0baea391bdd7/hour" \
-H "Authorization: Bearer $TOKEN" \
-w "\n狀態碼: %{http_code}\n"

# 測試2: 無效週期類型
echo -e "\n\033[34m測試2: 無效週期類型\033[0m"
curl -X GET "${BASE_URL}/81f6d637-b345-43dd-a8a3-0baea391bdd7/invalid" \
-H "Authorization: Bearer $TOKEN" \
-w "\n狀態碼: %{http_code}\n"

# 測試3: 批量查詢多設備
echo -e "\n\033[34m測試3: 批量查詢多設備\033[0m"
curl -X POST "${BASE_URL}/batch" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "device_ids": ["device1", "device2"],
  "period_type": "day"
}' \
-w "\n狀態碼: %{http_code}\n"

# 測試4: 無Token訪問
echo -e "\n\033[34m測試4: 未授權訪問\033[0m"
curl -X GET "${BASE_URL}/81f6d637-b345-43dd-a8a3-0baea391bdd7/hour" \
-w "\n狀態碼: %{http_code}\n"

# 測試5: 錯誤的設備ID格式
echo -e "\n\033[34m測試5: 錯誤設備ID格式\033[0m"
curl -X GET "${BASE_URL}/invalid-device-id/hour" \
-H "Authorization: Bearer $TOKEN" \
-w "\n狀態碼: %{http_code}\n"

# 測試6: 複雜批量查詢
echo -e "\n\033[34m測試6: 複雜批量查詢\033[0m"
curl -X POST "${BASE_URL}/batch" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "device_ids": ["81f6d637-b345-43dd-a8a3-0baea391bdd7", "another-device-123"],
  "period_type": "week"
}' \
-w "\n狀態碼: %{http_code}\n"

# 測試7: 邊界值測試-最大數據量
echo -e "\n\033[34m測試7: 最大數據量測試\033[0m"
curl -X GET "${BASE_URL}/81f6d637-b345-43dd-a8a3-0baea391bdd7/min" \
-H "Authorization: Bearer $TOKEN" \
-w "\n狀態碼: %{http_code}\n"

# 測試8: 空設備ID列表
echo -e "\n\033[34m測試8: 空設備ID列表\033[0m"
curl -X POST "${BASE_URL}/batch" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{"device_ids": [], "period_type": "hour"}' \
-w "\n狀態碼: %{http_code}\n"

# 修改测试脚本使用固定token
TOKEN="wind_test_only_123"

curl -X GET "${BASE_URL}/81f6d637-b345-43dd-a8a3-0baea391bdd7/hour" \
-H "Authorization: Bearer $TOKEN" \
-w "\n狀態碼: %{http_code}\n"