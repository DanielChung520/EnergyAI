// worker.js
export interface Env {
    DB: D1Database;
    WIND_QUEUE: Queue;
  }
  
  // 主要的 Worker 邏輯
  export default {
    // 每分鐘觸發一次，創建60個排隊任務
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
      try {
        // 為接下來的60秒各創建一個任務
        for (let i = 0; i < 60; i++) {
          await env.WIND_QUEUE.send({
            timestamp: Date.now() + i * 1000,
            deviceIds: ['device1', 'device2'] // 您的設備列表
          }, {
            delay: i // 延遲i秒
          });
        }
      } catch (error) {
        console.error('Error scheduling tasks:', error);
      }
    },
  
    // 處理隊列消息
    async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
      for (const message of batch.messages) {
        const { deviceIds, timestamp } = message.body;
        
        for (const deviceId of deviceIds) {
          try {
            const windData = await fetchWindData(deviceId);
            // 添加時間戳
            windData.record_time = new Date(timestamp).toISOString();
            await insertWindData(env.DB, windData);
            console.log(`Collected data for device ${deviceId} at ${windData.record_time}`);
          } catch (error) {
            console.error(`Error collecting data for device ${deviceId}:`, error);
          }
        }
      }
    }
  };
  
  // 從API獲取數據的函數
  async function fetchWindData(deviceId: string) {
    const response = await fetch(`${API_BASE_URL}/wind/latest/${deviceId}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
  
    return await response.json();
  }
  
  // 插入數據到D1的函數
  async function insertWindData(db: D1Database, data: any) {
    const sql = `
      INSERT INTO wind_power_data (
        name, device_id, record_time, 
        fd_wind_speed_3s, fd_wind_speed_5min,
        // ... 其他欄位
      ) VALUES (?, ?, ?, ?, ?, /* ... */)
    `;
  
    const values = [
      data.name || null,
      data.device_id,
      data.record_time,
      // ... 其他值
    ];
  
    try {
      await db.prepare(sql).bind(...values).run();
      return true;
    } catch (error) {
      console.error('Error inserting data:', error);
      return false;
    }
  }