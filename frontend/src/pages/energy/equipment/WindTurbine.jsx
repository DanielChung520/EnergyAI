import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CardHeader from '../../../components/CardHeader';

const WindTurbine = ({ 
  rpm = 30,
  status = 'normal',
  direction = 0,
  rotationDirection = 1,
  pitchAngle = 60,
  inverterStatus = 'normal',
  dcStatus = 'normal',
  acStatus = 'normal',
  name = '風機狀態'
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

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // 調整相機視角和位置
    const camera = new THREE.PerspectiveCamera(
      30, 
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.5, 
      1000  // 增加最大視距
    );
    camera.position.set(25, 15, 25);  // 將相機位置往後拉

    // 調整渲染器尺寸為容器尺寸
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 15);
    light.castShadow = false;
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ 
        color: 0x228B22, 
        roughness: 1 
      })
    );
    ground.position.y = 0;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Wind turbine components
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xf0f0f0,  // 從 0xaaaaaa 改為更亮的灰白色
      metalness: 0.5,    // 降低金屬感
      roughness: 0.4     // 調整粗糙度
    });

    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.28, 6.325, 32), 
      material
    );
    tower.position.set(0, 3.16, -1);
    tower.castShadow = true;
    scene.add(tower);

    // 機艙主體
    const nacelleMaterial = new THREE.MeshStandardMaterial({ 
      color: status === 'error' ? 0xff0000 : 0xf0f0f0, // 只在error時顯示紅色
      metalness: 0.5,
      roughness: 0.4
    });

    const nacelle = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.15,   
        0.26,   
        1.4, 
        32, 
        1, 
        false
      ),
      nacelleMaterial
    );
    nacelle.position.set(0, 6.325, -0.7);
    nacelle.rotation.x = Math.PI / 2;
    nacelle.castShadow = true;
    scene.add(nacelle);

    // 修改藍色參考線
    const referenceLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 5, 8), // 細長的圓柱體
      new THREE.MeshBasicMaterial({ 
        color: 0x0000ff,
        transparent: true,
        opacity: 0.8
      })
    );
    
    referenceLine.position.set(0, 3.16, 0.5); // 將 y 座標從 6.325 改為 3.16
    referenceLine.rotation.x = Math.PI / 2;
    scene.add(referenceLine);

    // 添加機艙後端的圓角
    const nacelleBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 46, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      material
    );
    nacelleBack.position.set(0, 6.325, -1.4); // 位置設在機艙後端
    nacelleBack.rotation.x = -Math.PI / 2; // 旋轉半球體使其朝向正確方向
    nacelleBack.castShadow = true;
    scene.add(nacelleBack);

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
    scene.add(nacelleTop);

    // 在創建葉片之前定義葉片材質
    const bladeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,  // 葉片顏色為灰白色
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
    scene.add(rotor);

    // 創建一個包含需要旋轉的風機組件的群組
    const turbineGroup = new THREE.Group();

    // 將所有需要旋轉的組件添加到群組中
    turbineGroup.add(tower);
    turbineGroup.add(nacelle);
    turbineGroup.add(nacelleBack);
    turbineGroup.add(nacelleTop);
    turbineGroup.add(rotor);
    turbineGroup.add(referenceLine);

    // 設置群組的旋轉中心點
    turbineGroup.position.set(0, 0, 1);
    
    // 將方向角度轉換為弧度並應用旋轉
    const directionRad = (direction * Math.PI) / 180;
    turbineGroup.rotation.y = directionRad;

    // 將群組添加到場景
    scene.add(turbineGroup);

    // 修改風機外圍的圓環
    const circleRadius = 3; // 圓環外半徑

    // 外層黃色圓環
    const circleGeometry = new THREE.RingGeometry(
      circleRadius - 0.3,  // 內半徑
      circleRadius,        // 外半徑
      32                   // 分段數
    );
    const circleMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFEB3B,    // 黃色
      transparent: true,
      opacity: 0.5,
      metalness: 0.3,
      roughness: 0.7,
      side: THREE.DoubleSide
    });

    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = Math.PI / 2;
    circle.position.y = 3.16;
    scene.add(circle);

    // 添加內層橘色圓環
    const innerCircleGeometry = new THREE.RingGeometry(
      circleRadius - 0.7,  // 內半徑
      circleRadius - 0.4,  // 外半徑
      32                   // 分段數
    );
    const innerCircleMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFA500,    // 改為橘色
      transparent: true,
      opacity: 0.5,
      metalness: 0.3,
      roughness: 0.7,
      side: THREE.DoubleSide
    });

    const innerCircle = new THREE.Mesh(innerCircleGeometry, innerCircleMaterial);
    innerCircle.rotation.x = Math.PI / 2;
    innerCircle.position.y = 3.16;
    scene.add(innerCircle);

    // 添加三角形標記
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, -0.4);          // 三角形頂點（指向圓心）
    triangleShape.lineTo(-0.2, 0.2);        // 左上角
    triangleShape.lineTo(0.2, 0.2);         // 右上角
    triangleShape.lineTo(0, -0.4);          // 回到頂點

    const triangleGeometry = new THREE.ShapeGeometry(triangleShape);
    const triangleMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFEB3B,    // 與圓環相同的黃色
      side: THREE.DoubleSide
    });

    const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
    triangle.position.set(0, 3.16, circleRadius); // 放置在圓環前方
    triangle.rotation.x = Math.PI / 2;            // 使三角形平行於地面

    scene.add(triangle);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.minDistance = 10;  // 添加最小距離限制
    controls.maxDistance = 50;  // 添加最大距離限制

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
      rotor.rotation.z += currentSpeed; // 使用 += 來統一控制方向
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };z

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, [rpm, status, direction, rotationDirection, pitchAngle]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100vh',
        backgroundColor: 'rgb(3, 39, 67)',
        overflow: 'hidden'
      }}
    >
      <CardHeader
        title={name}
        showExpand={false}
        headerWidth="400px"
        headerHeight={40}
        bgColor="grey.900"  // 使用 MUI 的深灰色，這是一個近似的深色
      />
    </div>
  );
};

// 更新 PropTypes 驗證
WindTurbine.propTypes = {
  rpm: PropTypes.number,
  status: PropTypes.oneOf(['normal', 'alert', 'error']),
  direction: PropTypes.number,
  rotationDirection: PropTypes.number,
  pitchAngle: PropTypes.number,
  inverterStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  dcStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  acStatus: PropTypes.oneOf(['normal', 'alert', 'error']),
  name: PropTypes.string,
};

export default WindTurbine;
