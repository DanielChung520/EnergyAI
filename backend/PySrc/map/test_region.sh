#!/bin/bash

echo "測試獲取區域清單..."
curl -s -X GET \
     -H "Content-Type: application/json" \
     http://localhost:5500/api/map/regions | python -m json.tool 