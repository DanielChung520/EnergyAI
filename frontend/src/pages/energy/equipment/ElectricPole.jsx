import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';

// 定義顏色常量
const STATUS_COLORS = {
  normal: 0x00FF00,    // 綠色
  alert: 0xFFA500,     // 橘色
  error: 0xFF0000,     // 紅色
  off: 0xCCCCCC        // 熄滅時的灰色
};

// 定義閃爍配置
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

const ElectricPole = ({ upperStatus = 'normal', lowerStatus = 'normal' }) => {
  const mountRef = useRef(null);

  // 修改閃爍動畫函數
  const createBlinkAnimation = (material, status) => {
    const config = BLINK_CONFIGS[status];
    if (!config) return;

    const originalColor = STATUS_COLORS[status];
    const offColor = STATUS_COLORS.off;  // 使用灰色作為熄滅顏色

    let isOn = true;
    let lastToggleTime = performance.now();

    return (currentTime) => {
      const timeSinceLastToggle = currentTime - lastToggleTime;
      const duration = isOn ? config.onDuration : config.offDuration;

      if (timeSinceLastToggle >= duration) {
        isOn = !isOn;
        material.color.setHex(isOn ? originalColor : offColor);  // 切換為灰色而不是黑色
        lastToggleTime = currentTime;
      }
    };
  };

  useEffect(() => {
    // 創建場景
    const scene = new THREE.Scene();
    
    // 創建相機
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 0;

    // 創建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 添加 OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 創建電線桿主體（圓柱體）
    const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 12, 32);
    const poleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xCCCCCC,  // 淺灰色
      shininess: 30
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 3;

    // 創建黃色警示帶
    const warningBandGeometry = new THREE.CylinderGeometry(0.32, 0.32, 1, 32);
    const warningBandMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFEB3B,  // 黃色
      shininess: 50
    });
    const warningBand = new THREE.Mesh(warningBandGeometry, warningBandMaterial);
    warningBand.position.y = -1;

    // 修改橫桿材質
    const upperCrossbarMaterial = new THREE.MeshPhongMaterial({ 
      color: STATUS_COLORS[upperStatus]
    });
    const lowerCrossbarMaterial = new THREE.MeshPhongMaterial({ 
      color: STATUS_COLORS[lowerStatus]
    });

    // 創建橫桿
    const crossbarGeometry = new THREE.BoxGeometry(4, 0.2, 0.2);
    const upperCrossbar = new THREE.Mesh(crossbarGeometry, upperCrossbarMaterial);
    const lowerCrossbar = new THREE.Mesh(crossbarGeometry, lowerCrossbarMaterial);
    
    upperCrossbar.position.y = 8;
    lowerCrossbar.position.y = 7;

    // 創建絕緣子（小圓柱）
    const insulatorGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16);
    const insulatorMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    
    // 添加上層絕緣子
    const upperInsulators = [];
    for (let i = -1.5; i <= 1.5; i += 1.5) {
      const insulator = new THREE.Mesh(insulatorGeometry, insulatorMaterial);
      insulator.position.set(i, 8, 0);
      upperInsulators.push(insulator);
    }

    // 添加下層絕緣子
    const lowerInsulators = [];
    for (let i = -1.5; i <= 1.5; i += 1.5) {
      const insulator = new THREE.Mesh(insulatorGeometry, insulatorMaterial);
      insulator.position.set(i, 7, 0);
      lowerInsulators.push(insulator);
    }

    // 創建閃爍動畫
    const blinkAnimations = [
      createBlinkAnimation(upperCrossbarMaterial, upperStatus),
      createBlinkAnimation(lowerCrossbarMaterial, lowerStatus)
    ];

    // 添加到場景
    scene.add(pole);
    scene.add(warningBand);
    scene.add(upperCrossbar);
    scene.add(lowerCrossbar);
    upperInsulators.forEach(insulator => scene.add(insulator));
    lowerInsulators.forEach(insulator => scene.add(insulator));

    // 添加光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // 修改動畫循環
    const animate = () => {
      const currentTime = performance.now();
      
      // 執行閃爍動畫
      blinkAnimations.forEach(animation => animation?.(currentTime));
      
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 處理視窗大小變化
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
      controls.dispose();
    };
  }, [upperStatus, lowerStatus]); // 添加狀態依賴

  return <div ref={mountRef} />;
};

// 添加 PropTypes 驗證
ElectricPole.propTypes = {
  upperStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  lowerStatus: PropTypes.oneOf(['normal', 'alert', 'error'])
};

export default ElectricPole;
