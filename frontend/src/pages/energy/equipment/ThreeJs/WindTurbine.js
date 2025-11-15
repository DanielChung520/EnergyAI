import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js';

class WindTurbine {
  constructor(container, options = {}) {
    this.options = {
      rpm: options.rpm || 90,
      status: options.status || 'normal',
      direction: options.direction || 10,
      rotationDirection: options.rotationDirection || 1,
      pitchAngle: options.pitchAngle || 10,
      inverterStatus: options.inverterStatus || 'normal',
      dcStatus: options.dcStatus || 'normal',
      acStatus: options.acStatus || 'normal'
    };

    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.rotor = null;
    this.inverter = null;

    this.init();
  }

  // 根據狀態獲取圓錐體顏色
  getStatusColor(status) {
    switch(status) {
      case 'normal':
        return 0x00ff00;
      case 'alert':
        return 0xffff00;
      case 'error':
        return 0xff0000;
      default:
        return 0x00ff00;
    }
  }

  init() {
    // 創建場景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);

    // 創建相機
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 4, 0);

    // 創建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // 設置 OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.5;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
    this.controls.target.set(0, 4, 0);
    this.controls.update();

    // 創建場景內容
    this.createWindTurbine();
    this.setupLights();
    this.animate();
  }

  setupLights() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 15);
    light.castShadow = false;
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

  createWindTurbine() {
    // 創建一個總的場景群組
    const sceneGroup = new THREE.Group();

    // 創建並放置風機
    const turbineGroup = new THREE.Group();
    turbineGroup.name = 'turbineGroup';
    turbineGroup.add(this.createTower());
    turbineGroup.add(this.createNacelle());
    this.rotor = this.createRotor();
    turbineGroup.add(this.rotor);
    
    // 設置風機方向
    const directionRad = (this.options.direction * Math.PI) / 180;
    turbineGroup.rotation.y = directionRad;
    turbineGroup.position.x = -5; // 將風機從 -10 移到 -5

    // 創建並放置逆變器
    this.inverter = new InverterObject(
      this.options.inverterStatus,
      this.options.dcStatus,
      this.options.acStatus
    );
    this.inverter.position.set(0, 0, 0);

    // 創建並放置電線桿
    const electricPole = new ElectricPoleObject();
    electricPole.position.set(5, 0, 0); // 將電線桿從 10 移到 5

    // 將所有設備添加到場景群組
    sceneGroup.add(turbineGroup);
    sceneGroup.add(this.inverter);
    sceneGroup.add(electricPole);

    // 將整個場景群組添加到場景中
    this.scene.add(sceneGroup);
  }

  createTower() {
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xf0f0f0,
      metalness: 0.5,
      roughness: 0.4
    });

    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.28, 6.325, 32),
      material
    );
    tower.position.set(0, 3.16, -1);
    tower.castShadow = true;
    return tower;
  }

  createNacelle() {
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xf0f0f0,
      metalness: 0.5,
      roughness: 0.4
    });

    const nacelleGroup = new THREE.Group();

    // 機艙主體
    const nacelleMaterial = new THREE.MeshStandardMaterial({ 
      color: this.options.status === 'error' ? 0xff0000 : 0xf0f0f0,
      metalness: 0.5,
      roughness: 0.4
    });

    const nacelle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.26, 1.4, 32, 1, false),
      nacelleMaterial
    );
    nacelle.position.set(0, 6.325, -0.7);
    nacelle.rotation.x = Math.PI / 2;
    nacelle.castShadow = true;
    nacelleGroup.add(nacelle);

    // 藍色參考線
    const referenceLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 5, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0x0000ff,
        transparent: true,
        opacity: 0.8
      })
    );
    referenceLine.position.set(0, 6.325, 0.5);
    referenceLine.rotation.x = Math.PI / 2;
    nacelleGroup.add(referenceLine);

    // 機艙後端圓角
    const nacelleBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 46, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      material
    );
    nacelleBack.position.set(0, 6.325, -1.4);
    nacelleBack.rotation.x = -Math.PI / 2;
    nacelleBack.castShadow = true;
    nacelleGroup.add(nacelleBack);

    // 頂部圓錐體
    const nacelleTopGeometry = new THREE.CylinderGeometry(
      0.01,
      0.15,
      0.5,
      35,
      1,
      false
    );
    
    const coneMaterial = new THREE.MeshStandardMaterial({ 
      color: this.getStatusColor(this.options.status),
      metalness: 0.5,
      roughness: 0.4
    });

    const nacelleTop = new THREE.Mesh(nacelleTopGeometry, coneMaterial);
    nacelleTop.name = 'nacelleTop';
    nacelleTop.position.set(0, 6.325, 0.2);
    nacelleTop.rotation.x = Math.PI / 2;
    nacelleTop.castShadow = true;
    nacelleGroup.add(nacelleTop);

    // 添加紅色箭頭
    const arrowLength = 0.8;
    const arrowWidth = 0.12;
    const arrowHeight = 0.12;

    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, -arrowWidth/2);
    arrowShape.lineTo(arrowLength - arrowHeight, -arrowWidth/2);
    arrowShape.lineTo(arrowLength - arrowHeight, -arrowWidth);
    arrowShape.lineTo(arrowLength, 0);
    arrowShape.lineTo(arrowLength - arrowHeight, arrowWidth);
    arrowShape.lineTo(arrowLength - arrowHeight, arrowWidth/2);
    arrowShape.lineTo(0, arrowWidth/2);
    arrowShape.lineTo(0, -arrowWidth/2);

    const arrowExtrudeSettings = {
      steps: 1,
      depth: 0.02,
      bevelEnabled: false
    };

    const arrowGeometry = new THREE.ExtrudeGeometry(arrowShape, arrowExtrudeSettings);
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.5,
      roughness: 0.5
    });

    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 6.325, 1.2);
    arrow.rotation.set(0, -Math.PI/2, 0);
    arrow.castShadow = true;
    nacelleGroup.add(arrow);

    // 添加槳距角參考線（黃色）
    const pitchLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.2, 8),
      new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
      })
    );
    pitchLine.name = 'pitchLine';
    pitchLine.position.set(0, 6.4, 1);
    pitchLine.rotation.set(Math.PI/2 - (this.options.pitchAngle * Math.PI / 180), 0, 0);
    nacelleGroup.add(pitchLine);

    return nacelleGroup;
  }

  createRotor() {
    const bladeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    // 創建葉片形狀
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, -0.15);
    bladeShape.bezierCurveTo(
      -0.2, -0.1,
      -0.3, 1.0,
      -0.1, 3.0
    );
    bladeShape.bezierCurveTo(
      -0.05, 3.1,
      0.05, 3.1,
      0.1, 3.0
    );
    bladeShape.bezierCurveTo(
      0.3, 1.0,
      0.2, -0.1,
      0, -0.15
    );

    const extrudeSettings = {
      steps: 1,
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.006,
      bevelSegments: 2
    };

    const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    bladeGeometry.rotateX(Math.PI / 2);
    bladeGeometry.rotateY(Math.PI / 2);

    const rotor = new THREE.Group();
    rotor.position.set(0, 6.325, -0.1);

    // 創建三個葉片
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      const bladeGroup = new THREE.Group();
      
      bladeGroup.add(blade);
      bladeGroup.rotation.z = (i * (Math.PI * 2)) / 3;
      
      blade.position.x = 0.35;
      blade.rotation.x = Math.PI / 6;
      
      rotor.add(bladeGroup);
    }

    return rotor;
  }

  rpmToRotationSpeed(rpm, direction) {
    const rotationsPerSecond = rpm / 60;
    const radiansPerSecond = rotationsPerSecond * 2 * Math.PI;
    const radiansPerFrame = radiansPerSecond / 60;
    return direction === 1 ? -radiansPerFrame : radiansPerFrame;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // 更新 TWEEN
    TWEEN.update();

    // 更新控制器
    if (this.controls) {
      this.controls.update();
    }

    // 更新風機旋轉
    if (this.rotor) {
      const speed = this.rpmToRotationSpeed(
        this.options.rpm,
        this.options.rotationDirection
      );
      this.rotor.rotation.z += speed;
    }

    // 更新逆變器動畫
    if (this.inverter) {
      this.inverter.update(performance.now());
    }

    // 渲染場景
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    if (this.container && this.camera && this.renderer) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  // 修改清理方法
  dispose() {
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  updateOptions(newOptions) {
    console.log('Updating options:', newOptions); // 添加日誌

    // 更新選項
    this.options = { ...this.options, ...newOptions };

    // 更新風機狀態指示燈
    if (newOptions.status !== undefined) {
      const nacelleTop = this.scene.getObjectByName('nacelleTop');
      if (nacelleTop && nacelleTop.material) {
        nacelleTop.material.color.setHex(this.getStatusColor(this.options.status));
      }
    }

    // 更新風機方向
    if (newOptions.direction !== undefined) {
      const turbineGroup = this.scene.getObjectByName('turbineGroup');
      if (turbineGroup) {
        const directionRad = (this.options.direction * Math.PI) / 180;
        turbineGroup.rotation.y = directionRad;
      }
    }

    // 更新槳距角
    if (newOptions.pitchAngle !== undefined) {
      const pitchLine = this.scene.getObjectByName('pitchLine');
      if (pitchLine) {
        pitchLine.rotation.set(
          Math.PI/2 - (this.options.pitchAngle * Math.PI / 180),
          0,
          0
        );
      }
    }

    // 更新逆變器狀態
    if (this.inverter && (
      newOptions.inverterStatus !== undefined ||
      newOptions.dcStatus !== undefined ||
      newOptions.acStatus !== undefined
    )) {
      this.inverter.updateStatus(
        this.options.inverterStatus,
        this.options.dcStatus,
        this.options.acStatus
      );
    }

    // 強制更新控制器
    if (this.controls) {
      this.controls.update();
    }
  }

  // 修改相機控制方法
  resetCamera() {
    if (!this.camera || !this.controls) return;
    
    const targetPosition = new THREE.Vector3(0, 10, 20);
    const targetLookAt = new THREE.Vector3(0, 4, 0);
    
    // 使用 TWEEN 進行平滑過渡
    const currentPosition = this.camera.position.clone();
    const currentTarget = this.controls.target.clone();
    
    new TWEEN.Tween(currentPosition)
      .to(targetPosition, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.camera.position.copy(currentPosition);
      })
      .start();

    new TWEEN.Tween(currentTarget)
      .to(targetLookAt, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        this.controls.target.copy(currentTarget);
        this.controls.update();
      })
      .start();
  }

  // 修改環繞相機方法
  orbitCamera() {
    if (!this.camera) return;

    const radius = 20;
    const height = 10;
    let angle = 0;
    const center = new THREE.Vector3(0, 4, 0);
    const startTime = Date.now();
    const duration = 5000; // 5秒完成一圈

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        angle = progress * Math.PI * 2;
        const x = center.x + radius * Math.cos(angle);
        const z = center.z + radius * Math.sin(angle);
        
        this.camera.position.set(x, height, z);
        this.controls.target.copy(center);
        this.controls.update();
        
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  // 定義 InverterObject 類
  createInverter(status = 'normal') {
    return new InverterObject(status);
  }

  // 定義 ElectricPoleObject 類
  createElectricPole() {
    return new ElectricPoleObject();
  }
}

// 添加顏色常量
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

// 添加閃爍配置
const BLINK_CONFIGS = {
  normal: {
    onDuration: 2000,    // 亮 2 秒
    offDuration: 500     // 滅 0.5 秒
  },
  alert: {
    onDuration: 1000,    // 亮 1 秒
    offDuration: 500     // 滅 0.5 秒
  },
  error: {
    onDuration: 500,     // 亮 0.5 秒
    offDuration: 500     // 滅 0.5 秒
  }
};

class InverterObject extends THREE.Group {
  constructor(inverterStatus = 'normal', dcStatus = 'normal', acStatus = 'normal') {
    super();
    this.inverterStatus = inverterStatus;
    this.dcStatus = dcStatus;
    this.acStatus = acStatus;
    this.blinkAnimations = [];
    this.createInverter();
  }

  // 獲取對應狀態的顏色
  getStatusColor(status, isInverter = false) {
    if (isInverter) {
      return STATUS_COLORS[status]?.inverter || STATUS_COLORS.normal.inverter;
    }
    return STATUS_COLORS[status]?.default || STATUS_COLORS.normal.default;
  }

  // 創建閃爍動畫
  createBlinkAnimation(material, status) {
    const config = BLINK_CONFIGS[status];
    if (!config) return null;

    const originalColor = material.color.getHex();
    const darkColor = 0x000000; // 完全熄滅的顏色

    let isOn = true;
    let lastToggleTime = performance.now();

    return (currentTime) => {
      const timeSinceLastToggle = currentTime - lastToggleTime;
      const duration = isOn ? config.onDuration : config.offDuration;

      if (timeSinceLastToggle >= duration) {
        isOn = !isOn;
        material.color.setHex(isOn ? originalColor : darkColor);
        lastToggleTime = currentTime;
      }
    };
  }

  createInverter() {
    // 創建機箱主體 - 縮小30%
    const boxGeometry = new THREE.BoxGeometry(
      3 * 0.7,  // 寬度縮小30%
      4 * 0.7,  // 高度縮小30%
      1 * 0.7   // 深度縮小30%
    );
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.y = (4 * 0.7) / 2; // 將底部對齊地面，上移半個高度
    this.add(box);

    // 創建顯示屏 - 縮小30%
    const screenGeometry = new THREE.PlaneGeometry(
      1.5 * 0.7, // 寬度縮小30%
      1 * 0.7    // 高度縮小30%
    );
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: this.getStatusColor(this.inverterStatus),
      emissive: this.getStatusColor(this.inverterStatus)
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = (1 * 0.7) / 2 + 0.01; // 略微突出於機箱表面
    screen.position.y = (4 * 0.7) / 2 + 0.2; // 調整顯示屏位置
    this.add(screen);

    // 創建閃電符號 - 縮小30%
    const lightningGeometry = new THREE.ShapeGeometry(
      new THREE.Shape([
        new THREE.Vector2(0, 0.2 * 0.7),
        new THREE.Vector2(-0.15 * 0.7, 0),
        new THREE.Vector2(0, 0),
        new THREE.Vector2(-0.2 * 0.7, -0.2 * 0.7),
        new THREE.Vector2(0.2 * 0.7, 0.05 * 0.7),
        new THREE.Vector2(0.02 * 0.7, 0.05 * 0.7),
        new THREE.Vector2(0.15 * 0.7, 0.2 * 0.7),
      ])
    );
    const lightningMaterial = new THREE.MeshBasicMaterial({ 
      color: this.getStatusColor(this.inverterStatus, true),
      side: THREE.DoubleSide
    });
    const lightning = new THREE.Mesh(lightningGeometry, lightningMaterial);
    lightning.position.z = (1 * 0.7) / 2 + 0.02; // 略微突出於顯示屏表面
    lightning.position.y = (4 * 0.7) / 2 + 0.2; // 調整閃電符號位置
    this.add(lightning);

    // 創建 DC 符號
    // 1. DC 橫線 - 位置往上移
    const dcLineGeometry = new THREE.PlaneGeometry(0.72 * 0.7, 0.072 * 0.7);
    const dcLineMaterial = new THREE.MeshBasicMaterial({ 
      color: this.getStatusColor(this.dcStatus),
      side: THREE.DoubleSide
    });
    const dcLine = new THREE.Mesh(dcLineGeometry, dcLineMaterial);
    dcLine.position.set(
      -0.8 * 0.7, 
      (4 * 0.7) / 2 - 0.8,  // y 位置從 -1.2 改為 -0.8
      (1 * 0.7) / 2 + 0.01
    );
    this.add(dcLine);
    
    // 2. DC 四個點 - 位置往上移
    const dotGeometry = new THREE.CircleGeometry(0.054 * 0.7, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ 
      color: this.getStatusColor(this.dcStatus),
      side: THREE.DoubleSide
    });
    
    // 創建四個點並設置新位置
    const dotPositions = [
      [-1.07, -0.95],
      [-0.89, -0.95],
      [-0.71, -0.95],
      [-0.53, -0.95]
    ];
    
    this.dots = dotPositions.map(([x, y]) => {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone());
      dot.position.set(
        x * 0.7, 
        (4 * 0.7) / 2 - 0.95,  // y 位置從 -1.4 改為 -0.95
        (1 * 0.7) / 2 + 0.01
      );
      this.add(dot);
      return dot;
    });

    // 修改 AC 符號的創建方式
    this.createACSymbol();

    // 創建閃爍動畫
    this.blinkAnimations = [
      this.createBlinkAnimation(lightningMaterial, this.inverterStatus),
      this.createBlinkAnimation(dcLineMaterial, this.dcStatus)
    ];

    // 為 DC 點添加動畫
    this.dots.forEach(dot => {
      this.blinkAnimations.push(
        this.createBlinkAnimation(dot.material, this.dcStatus)
      );
    });
  }

  createACSymbol() {
    // 創建 AC 符號的形狀
    const acShape = new THREE.Shape();
    
    // 先畫橫線
    acShape.moveTo(-0.36 * 0.7, 0.036 * 0.7);  // 左上角
    acShape.lineTo(0.36 * 0.7, 0.036 * 0.7);   // 右上角
    acShape.lineTo(0.36 * 0.7, -0.036 * 0.7);  // 右下角
    acShape.lineTo(-0.36 * 0.7, -0.036 * 0.7); // 左下角
    acShape.lineTo(-0.36 * 0.7, 0.036 * 0.7);  // 回到起點
    
    // 移動到波浪線起點
    acShape.moveTo(-0.36 * 0.7, -0.15 * 0.7);
    
    // 創建波浪線路徑
    const waveSegments = 32;
    for (let i = 0; i <= waveSegments; i++) {
      const t = (i / waveSegments) * Math.PI * 2;
      const x = ((i / waveSegments) * 0.72 - 0.36) * 0.7;
      const y = Math.sin(t * 1.5) * 0.054 * 0.7 - 0.15 * 0.7;
      if (i === 0) {
        acShape.moveTo(x, y);
      } else {
        acShape.lineTo(x, y);
      }
    }

    // 創建幾何體
    const acGeometry = new THREE.ShapeGeometry(acShape);
    const acMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFEB3B,
      side: THREE.DoubleSide
    });
    
    // 創建網格
    const acSymbol = new THREE.Mesh(acGeometry, acMaterial);
    
    // 設置位置
    acSymbol.position.set(
      0.8 * 0.7,                     // x 位置
      (4 * 0.7) / 2 - 0.8,          // y 位置
      (1 * 0.7) / 2 + 0.01          // z 位置
    );
    
    this.add(acSymbol);
    
    // 保存材質以供動畫使用
    this.acMaterial = acMaterial;
  }

  // 更新狀態方法
  updateStatus(inverterStatus, dcStatus, acStatus) {
    this.inverterStatus = inverterStatus;
    this.dcStatus = dcStatus;
    this.acStatus = acStatus;
    
    // 清除現有元素
    this.clear();
    // 重新創建所有元素
    this.createInverter();
  }

  // 更新動畫
  update(time) {
    this.blinkAnimations.forEach(animation => {
      if (animation) animation(time);
    });
  }
}

// 定義 ElectricPoleObject 類
class ElectricPoleObject extends THREE.Group {
  constructor() {
    super();
    
    // 創建電線桿主體 - 縮小50%
    const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 6, 32); // 半徑和高度都縮小一半
    const poleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xCCCCCC,
      shininess: 30
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 3; // 高度位置也要調整一半
    this.add(pole);

    // 創建橫桿
    this.createCrossbars();

    // 創建警示帶
    this.createWarningBand();
  }

  createCrossbars() {
    // 橫桿也縮小50%
    const crossbarGeometry = new THREE.BoxGeometry(2, 0.1, 0.1);
    this.upperCrossbarMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
    this.lowerCrossbarMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00 });

    const upperCrossbar = new THREE.Mesh(crossbarGeometry, this.upperCrossbarMaterial);
    const lowerCrossbar = new THREE.Mesh(crossbarGeometry, this.lowerCrossbarMaterial);

    // 調整橫桿位置到頂部
    upperCrossbar.position.y = 5.5; // 從 4 改為 5.5，接近頂部
    lowerCrossbar.position.y = 5;   // 從 3.5 改為 5，在上面的橫桿下方

    this.add(upperCrossbar);
    this.add(lowerCrossbar);
  }

  createWarningBand() {
    // 警示帶也縮小50%
    const warningBandGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.5, 32); // 尺寸縮小一半
    const warningBandMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFEB3B,
      shininess: 50
    });
    const warningBand = new THREE.Mesh(warningBandGeometry, warningBandMaterial);
    warningBand.position.y = 1; // 位置調整為原來的一半
    this.add(warningBand);
  }
}

export default WindTurbine;
