import * as THREE from 'three';

// 定義顏色常量
const STATUS_COLORS = {
  normal: {
    inverter: 0xFFEB3B,  // 逆變器正常為黃色
    default: 0x00FF00    // DC和AC為綠色
  },
  alert: {
    inverter: 0xFFA500,  // 逆變器警告為橘色
    default: 0xFFA500    // DC和AC為橘色
  },
  error: {
    inverter: 0xFF0000,  // 逆變器錯誤為紅色
    default: 0xFF0000    // DC和AC為紅色
  }
};

export class InverterObject extends THREE.Group {
  constructor() {
    super();

    // 創建機箱主體
    const boxGeometry = new THREE.BoxGeometry(3, 4, 1);
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.add(box);

    // 創建顯示屏
    const screenGeometry = new THREE.PlaneGeometry(1.5, 1);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000066,
      emissive: 0x000033
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.51;
    screen.position.y = 0.5;
    this.add(screen);

    // 創建閃電符號
    const lightningGeometry = new THREE.ShapeGeometry(
      new THREE.Shape([
        new THREE.Vector2(0, 0.2),
        new THREE.Vector2(-0.15, 0),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(-0.2, -0.2),
        new THREE.Vector2(0.2, 0.05),
        new THREE.Vector2(0.02, 0.05),
        new THREE.Vector2(0.15, 0.2),
      ])
    );
    this.lightningMaterial = new THREE.MeshBasicMaterial({ 
      color: STATUS_COLORS.normal.inverter,
      side: THREE.DoubleSide
    });
    const lightning = new THREE.Mesh(lightningGeometry, this.lightningMaterial);
    lightning.position.set(0, 0.5, 0.52);
    this.add(lightning);

    // 創建 DC 符號
    this.createDCSymbol();

    // 創建 AC 符號
    this.createACSymbol();
  }

  createDCSymbol() {
    // DC 符號代碼...
  }

  createACSymbol() {
    // AC 符號代碼...
  }

  updateStatus(inverterStatus, dcStatus, acStatus) {
    // 更新狀態的方法...
  }
} 