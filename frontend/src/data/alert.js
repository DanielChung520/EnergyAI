/**
 * Alert Definitions for Variable Ranges
 * 
 * This file defines alert conditions for different variables based on their value ranges:
 * 1. 警戒區域(紅色): Values less than lower alert threshold or greater than upper alert threshold
 * 2. 警告區域(黃色): Values less than standard lower limit but greater than lower alert threshold,
 *                   or greater than standard upper limit but less than upper alert threshold
 * 3. For variables without alert thresholds but with status values, use status-based coloring
 */

const alertDefinitions = {
  // Pattern 1: Standard range with upper alert (most common pattern)
  // 有標準下限和上限，以及上限警戒值
  "FD_WindSpeed_3s": {
    standardLowerLimit: 3,         // 標準值下限
    standardUpperLimit: 25,        // 標準值上限
    upperAlertThreshold: 70,       // 上限警戒值
    getAlertLevel: function(value) {
      if (value < this.standardLowerLimit || value > this.upperAlertThreshold) {
        return "red";      // 紅色警戒
      } else if (value > this.standardUpperLimit && value <= this.upperAlertThreshold) {
        return "yellow";   // 黃色警告
      }
      return "normal";     // 正常
    }
  },
  "FD_WindSpeed_5min": {
    standardLowerLimit: 0,
    standardUpperLimit: 25,
    upperAlertThreshold: 70,
    getAlertLevel: function(value) {
      if (value < this.standardLowerLimit || value > this.upperAlertThreshold) {
        return "red";
      } else if (value > this.standardUpperLimit && value <= this.upperAlertThreshold) {
        return "yellow";
      }
      return "normal";
    }
  },
  "FD_WGLoadVdc": {
    standardLowerLimit: 0,
    standardUpperLimit: 800,
    upperAlertThreshold: 810,
    getAlertLevel: function(value) {
      if (value < this.standardLowerLimit || value > this.upperAlertThreshold) {
        return "red";
      } else if (value > this.standardUpperLimit && value <= this.upperAlertThreshold) {
        return "yellow";
      }
      return "normal";
    }
  },
  "FD_WGLoadIdc": {
    standardLowerLimit: 0,
    standardUpperLimit: 100,
    upperAlertThreshold: 110,
    getAlertLevel: function(value) {
      if (value < this.standardLowerLimit || value > this.upperAlertThreshold) {
        return "red";
      } else if (value > this.standardUpperLimit && value <= this.upperAlertThreshold) {
        return "yellow";
      }
      return "normal";
    }
  },
  "FD_OutputPower": {
    standardLowerLimit: 0,
    standardUpperLimit: 36,
    upperAlertThreshold: 40,
    getAlertLevel: function(value) {
      if (value < this.standardLowerLimit || value > this.upperAlertThreshold) {
        return "red";
      } else if (value > this.standardUpperLimit && value <= this.upperAlertThreshold) {
        return "yellow";
      }
      return "normal";
    }
  },
  "FD_WGrpm": {
    standardLowerLimit: 0,
    standardUpperLimit: 69,
    upperAlertThreshold: 85,
    getAlertLevel: function(value) {
      if (value < this.standardLowerLimit || value > this.upperAlertThreshold) {
        return "red";
      } else if (value > this.standardUpperLimit && value <= this.upperAlertThreshold) {
        return "yellow";
      }
      return "normal";
    }
  },
  
  // Pattern 2: Only standard range without alert thresholds
  // 只有標準下限和上限
  "GridFeq": {
    standardLowerLimit: 50,
    standardUpperLimit: 60,
    getAlertLevel: function(value) {
      if (value < this.standardLowerLimit || value > this.standardUpperLimit) {
        return "yellow";   // 只有黃色警告，沒有紅色警戒
      }
      return "normal";
    }
  },
  
  // Pattern 3: Complete range with both lower and upper alert thresholds
  // 完整的範圍定義，包含下限警戒值、標準下限和上限、上限警戒值
  "UgAB": {
    lowerAlertThreshold: 390,     // 下線警戒值
    standardLowerLimit: 395,      // 標準值下限
    standardUpperLimit: 405,      // 標準值上限
    upperAlertThreshold: 410,     // 上限警戒值
    getAlertLevel: function(value) {
      if (value < this.lowerAlertThreshold || value > this.upperAlertThreshold) {
        return "red";      // 紅色警戒
      } else if ((value >= this.lowerAlertThreshold && value < this.standardLowerLimit) || 
                 (value > this.standardUpperLimit && value <= this.upperAlertThreshold)) {
        return "yellow";   // 黃色警告
      }
      return "normal";     // 正常
    }
  },
  "UgBC": {
    lowerAlertThreshold: 390,
    standardLowerLimit: 395,
    standardUpperLimit: 405,
    upperAlertThreshold: 410,
    getAlertLevel: function(value) {
      if (value < this.lowerAlertThreshold || value > this.upperAlertThreshold) {
        return "red";
      } else if ((value >= this.lowerAlertThreshold && value < this.standardLowerLimit) || 
                 (value > this.standardUpperLimit && value <= this.upperAlertThreshold)) {
        return "yellow";
      }
      return "normal";
    }
  },
  "UgCA": {
    lowerAlertThreshold: 390,
    standardLowerLimit: 395,
    standardUpperLimit: 405,
    upperAlertThreshold: 410,
    getAlertLevel: function(value) {
      if (value < this.lowerAlertThreshold || value > this.upperAlertThreshold) {
        return "red";
      } else if ((value >= this.lowerAlertThreshold && value < this.standardLowerLimit) || 
                 (value > this.standardUpperLimit && value <= this.upperAlertThreshold)) {
        return "yellow";
      }
      return "normal";
    }
  },
  
  // Pattern 4: Status-based alerts
  // 基於狀態值的警報 (x=:x)
  "IW_SystemCurrentRunMode": {
    yellowStates: [3],            // 黃色狀態值
    redStates: [1, 4],            // 紅色狀態值
    getAlertLevel: function(value) {
      if (this.redStates.includes(Number(value))) {
        return "red";
      } else if (this.yellowStates.includes(Number(value))) {
        return "yellow";
      }
      return "normal";
    }
  },
  "IW_SystemAlarmStatus": {
    yellowStates: [2],
    redStates: [3],
    getAlertLevel: function(value) {
      if (this.redStates.includes(Number(value))) {
        return "red";
      } else if (this.yellowStates.includes(Number(value))) {
        return "yellow";
      }
      return "normal";
    }
  },
  "IW_SysCurPitchAction": {
    yellowStates: [1],
    redStates: [],
    getAlertLevel: function(value) {
      if (this.redStates.includes(Number(value))) {
        return "red";
      } else if (this.yellowStates.includes(Number(value))) {
        return "yellow";
      }
      return "normal";
    }
  },
  "IW_SysCurHeatAction": {
    yellowStates: [1],
    redStates: [],
    getAlertLevel: function(value) {
      if (this.redStates.includes(Number(value))) {
        return "red";
      } else if (this.yellowStates.includes(Number(value))) {
        return "yellow";
      }
      return "normal";
    }
  }
};

/**
 * Get alert level for a variable
 * @param {string} variableName - The code variable name
 * @param {number|string} value - The current value
 * @returns {string} - Alert level: "red", "yellow", or "normal"
 */
function getAlertLevel(variableName, value) {
  // Check if the variable has defined alert conditions
  if (alertDefinitions[variableName]) {
    return alertDefinitions[variableName].getAlertLevel(value);
  }
  
  // Default: no alert
  return "normal";
}

/**
 * Check if value is in alert range
 * @param {string} variableName - The code variable name
 * @param {number|string} value - The current value
 * @returns {boolean} - True if in any alert range (red or yellow)
 */
function isInAlertRange(variableName, value) {
  const alertLevel = getAlertLevel(variableName, value);
  return alertLevel === "red" || alertLevel === "yellow";
}

/**
 * Get alert color for a variable's value
 * @param {string} variableName - The code variable name
 * @param {number|string} value - The current value
 * @returns {string} - Color code: "red", "yellow", or "" (normal)
 */
function getAlertColor(variableName, value) {
  const alertLevel = getAlertLevel(variableName, value);
  switch (alertLevel) {
    case "red":
      return "#FF0000"; // Red color
    case "yellow":
      return "#FFFF00"; // Yellow color
    default:
      return "";        // No color (normal)
  }
}

// Export the functions
export {
  alertDefinitions,
  getAlertLevel,
  isInAlertRange,
  getAlertColor
};
