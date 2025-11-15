import * as THREE from 'three';

const STATUS_COLORS = {
  normal: 0x00FF00,
  alert: 0xFFA500,
  error: 0xFF0000,
  off: 0xCCCCCC
};

export class ElectricPoleObject extends THREE.Group {
  constructor() {
    super();
    
    // 創建電線桿主體
    const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 12, 32);
    const poleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xCCCCCC,
      shininess: 30
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 6;
    this.add(pole);

    // 創建橫桿
    this.createCrossbars();

    // 創建警示帶
    this.createWarningBand();
  }

  createCrossbars() {
    const crossbarGeometry = new THREE.BoxGeometry(4, 0.2, 0.2);
    this.upperCrossbarMaterial = new THREE.MeshPhongMaterial({ color: STATUS_COLORS.normal });
    this.lowerCrossbarMaterial = new THREE.MeshPhongMaterial({ color: STATUS_COLORS.normal });

    const upperCrossbar = new THREE.Mesh(crossbarGeometry, this.upperCrossbarMaterial);
    const lowerCrossbar = new THREE.Mesh(crossbarGeometry, this.lowerCrossbarMaterial);

    upperCrossbar.position.y = 8;
    lowerCrossbar.position.y = 7;

    this.add(upperCrossbar);
    this.add(lowerCrossbar);
  }

  createWarningBand() {
    const warningBandGeometry = new THREE.CylinderGeometry(0.32, 0.32, 1, 32);
    const warningBandMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFEB3B,
      shininess: 50
    });
    const warningBand = new THREE.Mesh(warningBandGeometry, warningBandMaterial);
    warningBand.position.y = 2;
    this.add(warningBand);
  }

  // 可以添加更新狀態的方法
  updateStatus(upperStatus, lowerStatus) {
    // 更新狀態相關的顯示
  }
} 