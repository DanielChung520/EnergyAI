import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';

// 添加 Inverter 和 ElectricPole 的顏色常量
const STATUS_COLORS = {
  normal: {
    inverter: 0xFFEB3B,
    default: 0x00FF00
  },
  alert: {
    inverter: 0xFFA500,
    default: 0xFFA500
  },
  error: {
    inverter: 0xFF0000,
    default: 0xFF0000
  }
};

const BLINK_CONFIGS = {
  normal: {
    onDuration: 2000,
    offDuration: 500
  },
  alert: {
    onDuration: 1000,
    offDuration: 500
  },
  error: {
    onDuration: 500,
    offDuration: 500
  }
};

const WindTurbine = ({ 
  // 風機參數
  rpm = 60,
  status = 'normal',
  direction = 10,
  rotationDirection = 1,
  pitchAngle = 30,
  // 逆變器參數
  inverterStatus = 'normal',
  dcStatus = 'normal',
  acStatus = 'normal',
  // 電線桿參數
  upperStatus = 'normal',
  lowerStatus = 'normal'
}) => {
  const mountRef = useRef(null);

  // 根據狀態獲取圓錐體顏色
  const getStatusColor = (status) => {
    switch(status) {
      case 'normal':
        return 0x00ff00; // 綠色
      case 'alert':
        return 0xffff00; // 黃色
      case 'error':
        return 0xff0000; // 紅色
      default:
        return 0x00ff00;
    }
  };

  // 添加 Inverter 和 ElectricPole 的閃爍動畫函數
  const createBlinkAnimation = (material, status) => {
    const config = BLINK_CONFIGS[status];
    if (!config) return;

    const originalColor = material.color.getHex();
    const offColor = 0xCCCCCC;  // 改為灰色，而不是黑色 0x000000

    let isOn = true;
    let lastToggleTime = performance.now();

    return (currentTime) => {
      const timeSinceLastToggle = currentTime - lastToggleTime;
      const duration = isOn ? config.onDuration : config.offDuration;

      if (timeSinceLastToggle >= duration) {
        isOn = !isOn;
        material.color.setHex(isOn ? originalColor : offColor);  // 使用灰色作為熄滅顏色
        lastToggleTime = currentTime;
      }
    };
  };

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // 設置天空藍色背景
    
    // 調整相機位置和視角
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(-15, 15, 35); // 將相機位置往左移動，保持高度和距離

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // 創建三個組
    const windTurbineGroup = new THREE.Group();
    const inverterGroup = new THREE.Group();
    const electricPoleGroup = new THREE.Group();

    // 調整三個物件的位置，整體往左移動
    windTurbineGroup.position.set(-20, 0, 0);     // 風機在最左
    inverterGroup.position.set(-12, 0, 0);        // 逆變器在中間
    electricPoleGroup.position.set(-4, 0, 0);     // 電線桿在右邊

    // 添加光源 - 同時調整光源位置
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 10, 15); // 光源也要相應調整
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Ground - 擴大地面尺寸以覆蓋所有物件
    // const ground = new THREE.Mesh(
    //   new THREE.PlaneGeometry(60, 60), // 從 30,30 改為 60,60
    //   new THREE.MeshStandardMaterial({ 
    //     color: 0x228B22, 
    //     roughness: 1 
    //   })
    // );
    // ground.position.y = 0;
    // ground.rotation.x = -Math.PI / 2;
    // ground.receiveShadow = true;
    // scene.add(ground); // 地面保持在 scene 中

    // Wind turbine components
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
    windTurbineGroup.add(tower); // 改為添加到 windTurbineGroup

    // 機艙主體
    const nacelleMaterial = new THREE.MeshStandardMaterial({ 
      color: status === 'error' ? 0xff0000 : 0xf0f0f0,
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
    windTurbineGroup.add(nacelle); // 改為添加到 windTurbineGroup

    // 修改藍色參考線
    const referenceLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 5, 8), // 將長度從3增加到5
      new THREE.MeshBasicMaterial({ 
        color: 0x0000ff,
        transparent: true,
        opacity: 0.8
      })
    );
    
    referenceLine.position.set(0, 6.325, 0.5); // z軸位置改為正值，使線條向前延伸
    referenceLine.rotation.x = Math.PI / 2;
    windTurbineGroup.add(referenceLine); // 改為添加到 windTurbineGroup

    // 添加機艙後端的圓角
    const nacelleBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 46, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      material
    );
    nacelleBack.position.set(0, 6.325, -1.4); // 位置設在機艙後端
    nacelleBack.rotation.x = -Math.PI / 2; // 旋轉半球體使其朝向正確方向
    nacelleBack.castShadow = true;
    windTurbineGroup.add(nacelleBack); // 改為添加到 windTurbineGroup

    // 將圓錐體也相應縮小
    const nacelleTopGeometry = new THREE.CylinderGeometry(
      0.01,    // 保持頂部半徑不變，因為已經很小了
      0.15,    // 底部半徑從 0.2 減少20%
      0.5,     // 保持高度不變
      35,
      1,
      false
    );
    
    const coneMaterial = new THREE.MeshStandardMaterial({ 
      color: getStatusColor(status),
      metalness: 0.5,
      roughness: 0.4
    });

    const nacelleTop = new THREE.Mesh(
      nacelleTopGeometry,
      coneMaterial // 使用新的狀態顏色材質
    );
    nacelleTop.position.set(0, 6.325, 0.2);
    nacelleTop.rotation.x = Math.PI / 2;
    nacelleTop.castShadow = true;
    windTurbineGroup.add(nacelleTop); // 改為添加到 windTurbineGroup

    // 在 nacelleTop 之後添加箭頭
    const arrowLength = 0.8;    // 從 0.4 增加到 0.8
    const arrowWidth = 0.12;    // 從 0.08 增加到 0.12，保持比例
    const arrowHeight = 0.12;   // 從 0.08 增加到 0.12，保持比例

    // 創建箭頭形狀，修改為水平方向
    const arrowShape = new THREE.Shape();
    // 箭頭主體，改為水平方向（指向X軸）
    arrowShape.moveTo(0, -arrowWidth/2);          // 起點在左側
    arrowShape.lineTo(arrowLength - arrowHeight, -arrowWidth/2);  // 底部直線
    arrowShape.lineTo(arrowLength - arrowHeight, -arrowWidth);    // 箭翼底部
    arrowShape.lineTo(arrowLength, 0);                           // 箭頭尖端
    arrowShape.lineTo(arrowLength - arrowHeight, arrowWidth);    // 箭翼頂部
    arrowShape.lineTo(arrowLength - arrowHeight, arrowWidth/2);  // 回到主體
    arrowShape.lineTo(0, arrowWidth/2);                         // 頂部直線
    arrowShape.lineTo(0, -arrowWidth/2);                        // 封閉形狀

    // 箭頭的擠出設置
    const arrowExtrudeSettings = {
      steps: 1,
      depth: 0.02,
      bevelEnabled: false
    };

    // 創建箭頭幾何體
    const arrowGeometry = new THREE.ExtrudeGeometry(arrowShape, arrowExtrudeSettings);
    
    // 創建箭頭材質，改為紅色
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000, // 改為紅色
      metalness: 0.5,
      roughness: 0.5
    });

    // 創建箭頭網格
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 6.325, 1.2); // 位置在風機前方
    arrow.rotation.set(0, -Math.PI/2, 0); // 將 Math.PI/2 改為 -Math.PI/2，使箭頭指向前方
    arrow.castShadow = true;
    windTurbineGroup.add(arrow); // 箭頭也要加入到組中

    const bladeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,  // 葉片顏色改為略微不同的灰白色
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    // 創建自定義葉片形狀
    function createBladeShape() {
      const shape = new THREE.Shape();
      
      // 起始點（葉片根部）
      shape.moveTo(0, -0.15);
      
      // 葉片左側曲線
      shape.bezierCurveTo(
        -0.2, -0.1,    // 控制點1
        -0.3, 1.0,     // 控制點2
        -0.1, 3.0      // 終點
      );
      
      // 葉片尖端
      shape.bezierCurveTo(
        -0.05, 3.1,    // 控制點1
        0.05, 3.1,     // 控制點2
        0.1, 3.0       // 終點
      );
      
      // 葉片右側曲線
      shape.bezierCurveTo(
        0.3, 1.0,      // 控制點1
        0.2, -0.1,     // 控制點2
        0, -0.15       // 回到起始點
      );

      return shape;
    }

    // 創建葉片的擠出設置
    const extrudeSettings = {
      steps: 1,
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.006,
      bevelSegments:2
    };

    // 創建葉片幾何體
    const bladeShape = createBladeShape();
    const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    
    // 調整葉片的基本方向
    bladeGeometry.rotateX(Math.PI / 2);
    bladeGeometry.rotateY(Math.PI / 2); // 改為 Math.PI / 4，正好是45度角
    
    const blades = [];
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      const bladeGroup = new THREE.Group();
      
      bladeGroup.add(blade);
      bladeGroup.rotation.z = (i * (Math.PI * 2)) / 3;
      
      // 調整葉片位置和角度
      blade.position.x = 0.35;
      blade.rotation.x = Math.PI / 6;
      
      blades.push(bladeGroup);
    }

    const rotor = new THREE.Group();
    rotor.position.set(0, 6.325, -0.1);
    blades.forEach((b) => rotor.add(b));
    windTurbineGroup.add(rotor); // 改為添加到 windTurbineGroup

    // 創建一個包含需要旋轉的風機組件的群組
    const turbineGroup = new THREE.Group();

    // 添加槳距角參考線（黃色）
    const pitchLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.2, 8), // 細長的圓柱體
      new THREE.MeshBasicMaterial({ 
        color: 0xffff00,  // 黃色
        transparent: true,
        opacity: 0.8
      })
    );
    
    // 設置參考線位置和旋轉
    pitchLine.position.set(0, 6.4, 1); // 與機艙軸心同位置
    pitchLine.rotation.set(Math.PI/2 - (pitchAngle * Math.PI / 180), 0, 0); // 設置傾斜角度

    // 將風機相關組件添加到 windTurbineGroup 而不是 scene
    turbineGroup.add(tower);
    turbineGroup.add(nacelle);
    turbineGroup.add(nacelleBack);
    turbineGroup.add(nacelleTop);
    turbineGroup.add(rotor);
    turbineGroup.add(referenceLine);
    turbineGroup.add(pitchLine);
    turbineGroup.add(arrow); // 箭頭也要加入到組中

    // 設置群組的旋轉中心點
    turbineGroup.position.set(0, 0, 0);
    
    // 將方向角度轉換為弧度並應用旋轉
    const directionRad = (direction * Math.PI) / 180;
    turbineGroup.rotation.y = directionRad;

    // 將群組添加到場景
    scene.add(turbineGroup);

    // === 逆變器組件 ===
    // 創建機箱主體 - 縮小 50%
    const boxGeometry = new THREE.BoxGeometry(
      3 * 0.5,  // 寬度縮小 50%
      4 * 0.5,  // 高度縮小 50%
      1 * 0.5   // 深度縮小 50%
    );
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const inverterBox = new THREE.Mesh(boxGeometry, boxMaterial);
    // 將機箱底部移到地面
    inverterBox.position.y = (4 * 0.5) / 2; // 將機箱移到地面，y位置為機箱高度的一半
    inverterGroup.add(inverterBox);

    // 創建顯示屏 - 縮小 50%
    const screenGeometry = new THREE.PlaneGeometry(1.5 * 0.5, 1 * 0.5);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000066,
      emissive: 0x000033
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.51 * 0.5;
    screen.position.y = (4 * 0.5) / 2 + 0.5 * 0.5; // 調整顯示屏位置
    inverterGroup.add(screen);

    // 創建閃電符號 - 縮小 50%
    const lightningMaterial = new THREE.MeshBasicMaterial({ 
      color: STATUS_COLORS[inverterStatus].inverter,
      side: THREE.DoubleSide
    });

    const lightning = new THREE.Mesh(
      new THREE.ShapeGeometry(
        new THREE.Shape([
          new THREE.Vector2(0, 0.2 * 0.5),
          new THREE.Vector2(-0.15 * 0.5, 0),
          new THREE.Vector2(0, 0),
          new THREE.Vector2(-0.2 * 0.5, -0.2 * 0.5),
          new THREE.Vector2(0.2 * 0.5, 0.05 * 0.5),
          new THREE.Vector2(0.02 * 0.5, 0.05 * 0.5),
          new THREE.Vector2(0.15 * 0.5, 0.2 * 0.5),
        ])
      ),
      lightningMaterial
    );
    lightning.position.z = 0.52 * 0.5;
    lightning.position.y = (4 * 0.5) / 2 + 0.5 * 0.5; // 調整閃電符號位置
    inverterGroup.add(lightning);

    // 創建 DC 符號 - 縮小 50%
    const dcLineGeometry = new THREE.PlaneGeometry(0.72 * 0.5, 0.072 * 0.5);
    const dcLineMaterial = new THREE.MeshBasicMaterial({ 
      color: STATUS_COLORS[dcStatus].default,
      side: THREE.DoubleSide
    });
    const dcLine = new THREE.Mesh(dcLineGeometry, dcLineMaterial);
    dcLine.position.set(-0.8 * 0.5, (4 * 0.5) / 2 - 0.8 * 0.5, 0.51 * 0.5);
    inverterGroup.add(dcLine);

    // DC 點 - 縮小 50%
    const dotGeometry = new THREE.CircleGeometry(0.054 * 0.5, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ 
      color: STATUS_COLORS[dcStatus].default,
      side: THREE.DoubleSide
    });
    
    const dots = [];
    for(let i = 0; i < 4; i++) {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone());
      dot.position.set(
        (-1.07 + (i * 0.18)) * 0.5, 
        (4 * 0.5) / 2 - 0.95 * 0.5, 
        0.51 * 0.5
      );
      inverterGroup.add(dot);
      dots.push(dot);
    }

    // 創建 AC 符號 - 縮小 50%
    const acLineGeometry = new THREE.PlaneGeometry(0.72 * 0.5, 0.072 * 0.5);
    const acLineMaterial = new THREE.MeshBasicMaterial({ 
      color: STATUS_COLORS[acStatus].default,
      side: THREE.DoubleSide
    });
    const acLine = new THREE.Mesh(acLineGeometry, acLineMaterial);
    acLine.position.set(0.8 * 0.5, (4 * 0.5) / 2 - 0.8 * 0.5, 0.51 * 0.5);
    inverterGroup.add(acLine);

    // AC 波浪線 - 縮小 50%
    const wavePoints = [];
    const waveSegments = 32;
    for (let i = 0; i <= waveSegments; i++) {
      const t = (i / waveSegments) * Math.PI * 2;
      wavePoints.push(
        new THREE.Vector3(
          (i / waveSegments) * 0.72 * 0.5 - 0.36 * 0.5,
          Math.sin(t * 1.5) * 0.054 * 0.5,
          0
        )
      );
    }
    
    const waveCurve = new THREE.CatmullRomCurve3(wavePoints);
    const waveGeometry = new THREE.TubeGeometry(waveCurve, 64, 0.027 * 0.5, 8, false);
    const waveMaterial = new THREE.MeshBasicMaterial({ 
      color: STATUS_COLORS[acStatus].default
    });
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);
    wave.position.set(0.8 * 0.5, (4 * 0.5) / 2 - 0.95 * 0.5, 0.51 * 0.5);
    inverterGroup.add(wave);

    // 調整整個逆變器組的位置
    // inverterGroup.position.set(-2, 0, 0); // 這行覆蓋了之前的設置

    // === 電線桿組件 ===
    // 主桿 - 總共縮小 51%
    const poleGeometry = new THREE.CylinderGeometry(
      0.3 * 0.49,  // 半徑縮小 51%
      0.3 * 0.49,  
      12 * 0.49,   // 高度縮小 51%
      32
    );
    const poleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xCCCCCC,
      shininess: 30 
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 6 * 0.49;  // 位置也要相應調整
    electricPoleGroup.add(pole);

    // 添加黃色警示帶 - 也要縮小 51%
    const warningBandGeometry = new THREE.CylinderGeometry(
      0.32 * 0.49,  // 半徑略大於主桿
      0.32 * 0.49,
      1 * 0.49,     // 高度縮小 51%
      32
    );
    const warningBandMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFEB3B,  // 黃色
      shininess: 50
    });
    const warningBand = new THREE.Mesh(warningBandGeometry, warningBandMaterial);
    warningBand.position.y = 1 * 0.49; // 位置也要相應調整
    electricPoleGroup.add(warningBand);

    // 創建橫桿 - 總共縮小 51%
    const crossbarGeometry = new THREE.BoxGeometry(
      4 * 0.49,    // 長度縮小 51%
      0.2 * 0.49,  // 高度縮小 51%
      0.2 * 0.49   // 深度縮小 51%
    );
    const upperCrossbarMaterial = new THREE.MeshPhongMaterial({ 
      color: STATUS_COLORS[upperStatus].default
    });
    const lowerCrossbarMaterial = new THREE.MeshPhongMaterial({ 
      color: STATUS_COLORS[lowerStatus].default
    });

    // 上層橫桿
    const upperCrossbar = new THREE.Mesh(crossbarGeometry, upperCrossbarMaterial);
    upperCrossbar.position.y = 11 * 0.49;  // 位置調整
    electricPoleGroup.add(upperCrossbar);

    // 下層橫桿
    const lowerCrossbar = new THREE.Mesh(crossbarGeometry, lowerCrossbarMaterial);
    lowerCrossbar.position.y = 10 * 0.49;  // 位置調整
    electricPoleGroup.add(lowerCrossbar);

    // 創建絕緣子 - 總共縮小 51%
    const insulatorGeometry = new THREE.CylinderGeometry(
      0.1 * 0.49,  // 半徑縮小 51%
      0.1 * 0.49,
      0.3 * 0.49,  // 高度縮小 51%
      16
    );
    const insulatorMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    
    // 添加上層絕緣子
    for (let i = -1.5; i <= 1.5; i += 1.5) {
      const insulator = new THREE.Mesh(insulatorGeometry, insulatorMaterial);
      insulator.position.set(
        i * 0.49,         // X 位置縮小 51%
        11 * 0.49,        // Y 位置縮小 51%
        0
      );
      electricPoleGroup.add(insulator);
    }

    // 添加下層絕緣子
    for (let i = -1.5; i <= 1.5; i += 1.5) {
      const insulator = new THREE.Mesh(insulatorGeometry, insulatorMaterial);
      insulator.position.set(
        i * 0.49,         // X 位置縮小 51%
        10 * 0.49,        // Y 位置縮小 51%
        0
      );
      electricPoleGroup.add(insulator);
    }

    // 添加閃爍動畫
    const blinkAnimations = [
      createBlinkAnimation(lightningMaterial, inverterStatus),
      createBlinkAnimation(dcLineMaterial, dcStatus),
      createBlinkAnimation(acLineMaterial, acStatus),
      createBlinkAnimation(waveMaterial, acStatus),
      createBlinkAnimation(upperCrossbarMaterial, upperStatus),
      createBlinkAnimation(lowerCrossbarMaterial, lowerStatus)
    ];

    // 添加 DC 點的閃爍動畫
    dots.forEach(dot => {
      blinkAnimations.push(createBlinkAnimation(dot.material, dcStatus));
    });

    // 將三個組添加到場景
    scene.add(windTurbineGroup);
    scene.add(inverterGroup);
    scene.add(electricPoleGroup);

    // Controls - 調整控制器目標點到物件群的新中心
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(-12, 4, 0); // 設置到三個物件的新中心位置

    // 可選：調整控制器限制
    controls.maxPolarAngle = Math.PI / 2;    // 限制相機垂直角度
    controls.minDistance = 20;                // 限制最小縮放距離
    controls.maxDistance = 50;                // 限制最大縮放距離

    // 修改轉速計算，加入方向判斷
    const rpmToRotationSpeed = (rpm, direction) => {
      const rotationsPerSecond = rpm / 60;
      const radiansPerSecond = rotationsPerSecond * 2 * Math.PI;
      const radiansPerFrame = radiansPerSecond / 60;
      // 根據方向返回正負值
      return direction === 1 ? -radiansPerFrame : radiansPerFrame;
    };

    // 計算實際的旋轉速度，加入方向參數
    const currentSpeed = rpmToRotationSpeed(rpm, rotationDirection);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      const currentTime = performance.now();
      
      // 執行風機旋轉
      rotor.rotation.z += currentSpeed;
      
      // 執行所有閃爍動畫
      blinkAnimations.forEach(animation => animation?.(currentTime));
      
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, [rpm, status, direction, rotationDirection, pitchAngle, 
      inverterStatus, dcStatus, acStatus, 
      upperStatus, lowerStatus]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

// 更新 PropTypes
WindTurbine.propTypes = {
  // 風機屬性
  rpm: PropTypes.number,
  status: PropTypes.oneOf(['normal', 'alert', 'error']),
  direction: PropTypes.number,
  rotationDirection: PropTypes.oneOf([1, 2]),
  pitchAngle: PropTypes.number,
  // 逆變器屬性
  inverterStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  dcStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  acStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  // 電線桿屬性
  upperStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  lowerStatus: PropTypes.oneOf(['normal', 'alert', 'error'])
};

export default WindTurbine;
