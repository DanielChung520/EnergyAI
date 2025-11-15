import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';

// 修改顏色常量定義
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

// 在文件頂部添加閃爍配置
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

const Inverter = ({ 
  inverterStatus = 'error',
  dcStatus = 'normal',
  acStatus = 'normal'
}) => {
  const mountRef = useRef(null);

  // 獲取對應狀態的顏色
  const getStatusColor = (status, isInverter = false) => {
    if (isInverter) {
      return STATUS_COLORS[status]?.inverter || STATUS_COLORS.normal.inverter;
    }
    return STATUS_COLORS[status]?.default || STATUS_COLORS[status] || STATUS_COLORS.normal.default;
  };

  // 添加閃爍動畫函數
  const createBlinkAnimation = (material, status) => {
    const config = BLINK_CONFIGS[status];
    if (!config) return;

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
  };

  useEffect(() => {
    // 創建場景
    const scene = new THREE.Scene();
    
    // 創建相機
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 創建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 添加 OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 添加慣性
    controls.dampingFactor = 0.05; // 慣性系數
    controls.enableZoom = true;    // 允許縮放
    controls.enablePan = true;     // 允許平移
    controls.enableRotate = true;  // 允許旋轉

    // 創建機箱主體
    const boxGeometry = new THREE.BoxGeometry(3, 4, 1);
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);

    // 創建顯示屏
    const screenGeometry = new THREE.PlaneGeometry(1.5, 1);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000066,
      emissive: 0x000033
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.51;
    screen.position.y = 0.5;

    // 創建閃電符號時直接使用變量存儲材質
    const lightningMaterial = new THREE.MeshBasicMaterial({ 
      color: getStatusColor(inverterStatus, true),
      side: THREE.DoubleSide
    });

    // 使用已定義的材質
    const lightning = new THREE.Mesh(
      new THREE.ShapeGeometry(
        new THREE.Shape([
          // 從頂部中間開始，按照 SVG 路徑繪製
          new THREE.Vector2(0, 0.2),      // 頂部中點
          new THREE.Vector2(-0.15, 0),    // 左上部分
          new THREE.Vector2(0, 0),        // 中上凹點
          new THREE.Vector2(-0.2, -0.2),  // 左下部分
          new THREE.Vector2(0.2, 0.05),   // 右下部分
          new THREE.Vector2(0.02, 0.05),  // 右中凹點
          new THREE.Vector2(0.15, 0.2),   // 回到頂部
        ])
      ),
      lightningMaterial  // 使用已定義的材質
    );

    // 創建白色外框效果
    const lightningOutline = new THREE.Mesh(
      new THREE.ShapeGeometry(
        new THREE.Shape([
          new THREE.Vector2(0, 0.22),     // 外框稍大一些
          new THREE.Vector2(-0.17, 0),
          new THREE.Vector2(0, 0),
          new THREE.Vector2(-0.22, -0.22),
          new THREE.Vector2(0.22, 0.07),
          new THREE.Vector2(0.02, 0.07),
          new THREE.Vector2(0.17, 0.22),
        ])
      ),
      new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide
      })
    );

    // 設置位置
    lightningOutline.position.z = 0.52;
    lightningOutline.position.y = 0.5;
    lightning.position.z = 0.521;  // 稍微在外框前面
    lightning.position.y = 0.5;

    // 創建直流符號
    // 1. 橫線尺寸增加 80%
    const dcLineGeometry = new THREE.PlaneGeometry(0.72, 0.072); // 0.4 * 1.8 = 0.72, 0.04 * 1.8 = 0.072
    const dcLineMaterial = new THREE.MeshBasicMaterial({ 
      color: getStatusColor(dcStatus),
      side: THREE.DoubleSide
    });
    const dcLine = new THREE.Mesh(dcLineGeometry, dcLineMaterial);
    
    // 2. 點的尺寸增加 80%
    const dotGeometry = new THREE.CircleGeometry(0.054, 32); // 0.03 * 1.8 = 0.054
    const dotMaterial = new THREE.MeshBasicMaterial({ 
      color: getStatusColor(dcStatus),
      side: THREE.DoubleSide
    });
    
    const dot1 = new THREE.Mesh(dotGeometry, dotMaterial.clone());
    const dot2 = new THREE.Mesh(dotGeometry, dotMaterial.clone());
    const dot3 = new THREE.Mesh(dotGeometry, dotMaterial.clone());
    const dot4 = new THREE.Mesh(dotGeometry, dotMaterial.clone());
    
    // 調整直流符號位置 - 向上移動
    dcLine.position.set(-0.8, -0.8, 0.51);   // y 從 -1.2 改為 -0.8
    
    // 調整四個點的位置 - 相應向上移動
    dot1.position.set(-1.07, -0.95, 0.51);   // y 從 -1.35 改為 -0.95
    dot2.position.set(-0.89, -0.95, 0.51);   // y 從 -1.35 改為 -0.95
    dot3.position.set(-0.71, -0.95, 0.51);   // y 從 -1.35 改為 -0.95
    dot4.position.set(-0.53, -0.95, 0.51);   // y 從 -1.35 改為 -0.95
    
    // 創建交流符號
    // 1. 橫線尺寸增加 80%
    const acLineGeometry = new THREE.PlaneGeometry(0.72, 0.072);
    const acLineMaterial = new THREE.MeshBasicMaterial({ 
      color: getStatusColor(acStatus),
      side: THREE.DoubleSide
    });
    const acLine = new THREE.Mesh(acLineGeometry, acLineMaterial);
    
    // 2. 波浪線尺寸增加 80%
    const wavePoints = [];
    const waveSegments = 32;
    for (let i = 0; i <= waveSegments; i++) {
      const t = (i / waveSegments) * Math.PI * 2;
      wavePoints.push(
        new THREE.Vector3(
          (i / waveSegments) * 0.72 - 0.36,  // x 範圍增加 80%
          Math.sin(t * 1.5) * 0.054,         // y 振幅增加 80%
          0
        )
      );
    }
    
    const waveCurve = new THREE.CatmullRomCurve3(wavePoints);
    const waveGeometry = new THREE.TubeGeometry(waveCurve, 64, 0.027, 8, false); // 管道半徑增加 80%
    const waveMaterial = new THREE.MeshBasicMaterial({ 
      color: getStatusColor(acStatus)
    });
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);

    // 調整交流符號位置 - 向上移動
    acLine.position.set(0.8, -0.8, 0.51);    // y 從 -1.2 改為 -0.8
    wave.position.set(0.8, -0.95, 0.51);     // y 從 -1.35 改為 -0.95

    // 添加到場景
    scene.add(box);
    scene.add(screen);
    scene.add(lightningOutline);
    scene.add(lightning);
    scene.add(dcLine);
    scene.add(dot1);
    scene.add(dot2);
    scene.add(dot3);
    scene.add(dot4);
    scene.add(acLine);
    scene.add(wave);

    // 添加光源
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 2);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // 創建閃爍動畫時使用正確的材質引用
    const blinkAnimations = [
      createBlinkAnimation(lightningMaterial, inverterStatus),        // 使用閃電符號的材質
      createBlinkAnimation(dcLineMaterial, dcStatus),                 // DC 橫線
      createBlinkAnimation(dotMaterial.clone(), dcStatus),            // DC 點
      createBlinkAnimation(acLineMaterial, acStatus),                 // AC 橫線
      createBlinkAnimation(waveMaterial, acStatus)                    // AC 波浪線
    ];

    // 將所有點的材質加入閃爍動畫
    [dot1, dot2, dot3, dot4].forEach(dot => {
      blinkAnimations.push(createBlinkAnimation(dot.material, dcStatus));
    });

    // 修改動畫循環
    const animate = () => {
      const currentTime = performance.now();
      
      // 執行所有閃爍動畫
      blinkAnimations.forEach(animation => animation?.(currentTime));
      
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 添加視窗大小調整處理
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清理函數
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      controls.dispose(); // 清理控制器
    };
  }, [inverterStatus, dcStatus, acStatus]);

  return <div ref={mountRef} />;
};

// 添加 PropTypes 驗證
Inverter.propTypes = {
  inverterStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  dcStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  acStatus: PropTypes.oneOf(['normal', 'alert', 'error'])
};

export default Inverter;
