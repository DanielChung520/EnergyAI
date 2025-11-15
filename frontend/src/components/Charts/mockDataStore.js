// 创建一个模拟数据存储类
class PowerDataStore {
  constructor() {
    this.dataStore = new Map();
    this.initializeData();
  }

  // 初始化24小时的分钟级数据
  initializeData() {
    const now = new Date();
    // 生成过去24小时的数据
    for (let i = 24 * 60 - 1; i >= 0; i--) {
      const time = new Date(now - i * 60000);
      const timeKey = this.getTimeKey(time);
      
      this.dataStore.set(timeKey, {
        time: timeKey,
        power: Math.floor(Math.random() * 1000),
        timestamp: time.getTime()
      });
    }
  }

  // 获取时间键
  getTimeKey(date) {
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  // 添加新数据
  addNewData() {
    const now = new Date();
    const timeKey = this.getTimeKey(now);
    const newData = {
      time: timeKey,
      power: Math.floor(Math.random() * 1000),
      timestamp: now.getTime()
    };
    this.dataStore.set(timeKey, newData);
    return newData;
  }

  // 获取指定时间范围的数据
  getData(minutes) {
    const now = new Date();
    const result = [];
    let acc = 0;

    // 获取指定分钟数的数据
    for (let i = minutes - 1; i >= 0; i--) {
      const time = new Date(now - i * 60000);
      const timeKey = this.getTimeKey(time);
      const data = this.dataStore.get(timeKey) || {
        time: timeKey,
        power: 0,
        timestamp: time.getTime()
      };
      
      acc += data.power;
      result.push({
        ...data,
        accumulated: acc
      });
    }

    return result;
  }
}

export const powerDataStore = new PowerDataStore(); 