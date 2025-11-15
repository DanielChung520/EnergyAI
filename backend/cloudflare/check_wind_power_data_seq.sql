WITH time_diff AS (
  SELECT 
    device_id,
    record_time,
    -- 計算與上一筆記錄的時間差（秒）
    TIMESTAMPDIFF(
      SECOND,
      LAG(record_time) OVER (
        PARTITION BY device_id 
        ORDER BY record_time
      ),
      record_time
    ) as seconds_diff
  FROM wind_power_data
  WHERE device_id = '048ca70d-becf-4e21-9c04-078a39d79bde'  -- 直接填入設備ID
  ORDER BY record_time
)
SELECT 
  device_id,
  record_time,
  seconds_diff,
  CASE 
    WHEN seconds_diff > 1 THEN '間隔過大'
    WHEN seconds_diff < 1 THEN '間隔過小'
    WHEN seconds_diff IS NULL THEN '首筆數據'
    ELSE '正常'
  END as status
FROM time_diff
WHERE seconds_diff != 1  -- 只顯示異常記錄
ORDER BY record_time;

MySQL 版本的缺失時間段查詢
WITH RECURSIVE time_series AS (
  -- 生成預期的時間序列
  SELECT 
    MIN(record_time) as expected_time
  FROM wind_power_data
  WHERE device_id = '048ca70d-becf-4e21-9c04-078a39d79bde'
  
  UNION ALL
  
  SELECT 
    DATE_ADD(expected_time, INTERVAL 1 SECOND)
  FROM time_series
  WHERE expected_time < (
    SELECT MAX(record_time) 
    FROM wind_power_data 
    WHERE device_id = '048ca70d-becf-4e21-9c04-078a39d79bde'
  )
),
actual_data AS (
  -- 實際數據
  SELECT record_time
  FROM wind_power_data
  WHERE device_id = '048ca70d-becf-4e21-9c04-078a39d79bde'
),
missing_data AS (
  -- 找出缺失的時間點
  SELECT 
    expected_time as missing_time,
    COUNT(*) OVER (
      ORDER BY expected_time
      ROWS BETWEEN CURRENT ROW AND 59 FOLLOWING
    ) as consecutive_missing
  FROM time_series
  LEFT JOIN actual_data ON time_series.expected_time = actual_data.record_time
  WHERE actual_data.record_time IS NULL
)
-- 篩選連續缺失超過60秒的段落
SELECT 
  missing_time,
  consecutive_missing
FROM missing_data
WHERE consecutive_missing >= 60
ORDER BY missing_time;