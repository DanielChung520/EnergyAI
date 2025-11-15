import React, { useState, useEffect, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import './CompMap.css';
import { colors } from '../../hooks/colors';
import { markers as getMarkers, countryMarkers as getCountryMarkers } from '../../data/wwwMarkers.js';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { useTheme } from '@mui/material/styles';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MemoryIcon from '@mui/icons-material/Memory';
//import { countryMarkers } from '../../public/data/wwwMarkers';

// 使用本地地图数据
const geoUrl = "/src/data/world-countries.json";

const CompMap = ({ selectedCountry, sx = {}, onRegionEdit, focusPathId, center, zoom, siteEquipments = [], onEquipmentClick }) => {
  const mapRef = useRef(null);
  const [position, setPosition] = useState({ coordinates: center || [0, 0], zoom: zoom || 1 });
  const [tooltip, setTooltip] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [countryData, setCountryData] = useState([]); // 新增狀態以存儲國家數據
  const [countryMarkersArray, setCountryMarkersArray] = useState([]); // 新增狀態以存儲國家標記
  const [selectedSite, setSelectedSite] = useState(null);
  const [equipmentMenu, setEquipmentMenu] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    equipments: []
  });
  const theme = useTheme();

  useEffect(() => {
    // 從 localStorage 獲取 country_data
    const data = JSON.parse(localStorage.getItem('country_data') || '{"countries": []}');
    setCountryData(data.countries || []);

    // 使用定義好的國家標記並初始化
    const countryMarkers = getCountryMarkers(colors);
    console.log('Loaded country markers:', countryMarkers);

    // 在設置國家標記前先檢查每一個國家標記的坐標是否正確
    const validCountryMarkers = countryMarkers.filter(marker => 
      marker && 
      Array.isArray(marker.coordinates) && 
      marker.coordinates.length === 2 && 
      !isNaN(marker.coordinates[0]) && 
      !isNaN(marker.coordinates[1])
    );

    console.log('Valid country markers:', validCountryMarkers);
    setCountryMarkersArray(validCountryMarkers);

    // 獲取站點數據
    const fetchSites = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/sites`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // 只處理有效的經緯度數據
        const validSites = data.filter(site => 
          site.latitude && site.longitude && 
          !isNaN(parseFloat(site.latitude)) && 
          !isNaN(parseFloat(site.longitude))
        );
        
        // 創建站點標記
        const siteMarkers = validSites.map(site => {
          // 確保經緯度是有效的數字
          const longitude = parseFloat(site.longitude);
          const latitude = parseFloat(site.latitude);
          
          // 檢查是否為有效數字且不是NaN
          if (!isNaN(longitude) && !isNaN(latitude)) {
            return {
              name: site.site_name || site.name,
              coordinates: [longitude, latitude],
              color: colors.primary.green
            };
          }
          return null;
        }).filter(marker => marker !== null); // 過濾掉無效的標記
        
        console.log('Site markers created:', siteMarkers);
        
        // 將站點標記添加到標記數組
        setCountryMarkersArray(prevMarkers => [
          ...prevMarkers, // 保留原有的國家標記
          ...siteMarkers  // 添加站點標記
        ]);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
  }, [colors]);

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  const handleMarkerClick = (marker, event) => {
    // 阻止事件冒泡，以防触发 map-wrapper 的点击事件
    event.stopPropagation();
    
    // 设置工具提示
    setTooltip(marker.name);
    
    // 如果当前选中的就是这个站点，则关闭菜单
    if (selectedSite === marker.name) {
      handleCloseEquipmentMenu();
      return;
    }
    
    // 查找该案场的设备
    if (siteEquipments && siteEquipments.length > 0) {
      const siteEquips = findSiteEquipments(marker.name);
      if (siteEquips.length > 0) {
        setSelectedSite(marker.name);
        setEquipmentMenu({
          visible: true,
          position: { x: event.clientX, y: event.clientY },
          equipments: siteEquips
        });
      }
    }
  };

  // 查找案场设备的辅助函数
  const findSiteEquipments = (siteName) => {
    return siteEquipments.filter(equip => equip.site_name === siteName);
  };

  // 关闭设备菜单
  const handleCloseEquipmentMenu = () => {
    setEquipmentMenu({
      visible: false,
      position: { x: 0, y: 0 },
      equipments: []
    });
    setSelectedSite(null);
  };

  const handleMouseMove = (event) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleZoomChange = (event) => {
    const newZoom = parseFloat(event.target.value);
    setPosition((prev) => ({ ...prev, zoom: newZoom }));
  };

  // 重置地图到初始状态
  const handleResetMap = () => {
    setPosition({ coordinates: center || [0, 0], zoom: zoom || 1 });
  };

  // 使用颜色调色板生成标记点和国家标记
  const markers = getMarkers(colors);

  const handleCountryMouseEnter = (countryName) => {
    setHoveredCountry(countryName);
    setTooltip(countryName);
  };

  const handleCountryMouseLeave = () => {
    setHoveredCountry(null);
    setTooltip("");
  };

  // 獲取國家填充顏色
  const getFillColor = (geo) => {
    const countryName = geo.properties.name;
    
    // 先從 wwwMarkers.js 定義的國家標記中查找
    const predefinedMarkers = getCountryMarkers(colors);
    const predefinedCountry = predefinedMarkers.find(marker => marker.name === countryName);
    
    if (predefinedCountry && predefinedCountry.color) {
      // 如果在預定義的國家標記中找到，使用其顏色
      return predefinedCountry.color;
    }
    
    // 如果在預定義國家標記中未找到，則使用默認灰色
    return 'rgba(128, 128, 128, 0.5)';
  };

  // 添加觸摸事件處理函數
  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    handleMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  };

  // 添加处理地图背景点击的函数，用于关闭设备菜单
  const handleMapClick = () => {
    if (equipmentMenu.visible) {
      handleCloseEquipmentMenu();
    }
  };

  return (
    <Box 
      ref={mapRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: colors.primary.main,
        opacity: 0.8,
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
        ...sx
      }}
      onTouchMove={handleTouchMove}
    >
      {/* 背景圖片 */}
      <Box className="background-image" />
      <div 
        className="map-wrapper" 
        onMouseMove={handleMouseMove}
        onClick={handleMapClick} // 添加点击事件处理器
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: center || [0, 0]
          }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            maxZoom={10}
            minZoom={0.5}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getFillColor(geo)} // 使用 getFillColor 函數設置填充顏色
                      stroke="#D6D6DA"
                      style={{
                        default: {
                          outline: "none",
                          strokeWidth: 0.2,
                        },
                        hover: {
                          fill: colors.primary.orange,
                          outline: "none",
                          strokeWidth: 0.3,
                        },
                        pressed: {
                          outline: "none",
                          strokeWidth: 0.5,
                        },
                      }}
                      onMouseEnter={() => handleCountryMouseEnter(countryName)}
                      onMouseLeave={handleCountryMouseLeave}
                    />
                  );
                })
              }
            </Geographies>

            {countryMarkersArray.filter(marker => 
              marker && 
              Array.isArray(marker.coordinates) && 
              marker.coordinates.length === 2
            ).map((marker) => (
              <Marker
                key={marker.name}
                coordinates={marker.coordinates}
                onClick={(event) => handleMarkerClick(marker, event)}
              >
                <circle 
                  r={1} 
                  fill={selectedSite === marker.name ? colors.primary.yellow : marker.color} 
                  stroke="#fff" 
                  strokeWidth={0.5} 
                />
                <text
                  textAnchor="middle"
                  y={-4}
                  style={{ 
                    fontSize: "2px",
                    fontWeight: selectedSite === marker.name ? "bold" : "normal"
                  }}
                >
                  {marker.name}
                </text>
              </Marker>
            ))}

            {markers.map((marker) => (
              <Marker
                key={marker.name}
                coordinates={marker.coordinates}
                onClick={(event) => handleMarkerClick(marker, event)}
              >
                <circle r={1} fill={marker.color} stroke="#fff" strokeWidth={0.2} />
                <text
                  textAnchor="middle"
                  y={-4}
                  style={{ fontSize: "2px" }}
                >
                  {marker.name}
                </text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* 设备浮动菜单 */}
      {equipmentMenu.visible && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            left: `${equipmentMenu.position.x}px`,
            top: `${equipmentMenu.position.y}px`,
            width: '200px',
            maxHeight: '300px',
            overflow: 'auto',
            zIndex: 1200,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(5px)',
            p: 0,
            borderRadius: '8px',
          }}
          onClick={(e) => e.stopPropagation()} // 防止点击菜单时关闭自身
        >
          {equipmentMenu.equipments.length > 0 ? (
            <List dense sx={{ pt: 1 }}>
              {equipmentMenu.equipments.map((equip) => (
                <ListItem 
                  key={equip.equip_id} 
                  sx={{ 
                    py: 0.1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px',
                    mx: 0.5,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.2)',
                      transform: 'translateX(3px)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => {
                    // 当点击设备项时调用传入的函数
                    if (onEquipmentClick) {
                      // 创建一个与 TreeItem 中设备格式相同的对象
                      const equipItem = {
                        nodeId: `equip-${equip.equip_id}`,
                        name: equip.asset_no,
                        modelNo: equip.model_no,
                        status: equip.status
                      };
                      onEquipmentClick(equipItem);
                    }
                  }}
                >
                  <ListItemText 
                    secondary={equip.asset_no}
                    secondaryTypographyProps={{ 
                      sx: { 
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: '#1976d2'
                        }
                      } 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" sx={{ py: 1, textAlign: 'center', color: 'text.secondary', fontWeight: 700 }}>
              沒有設備數據
            </Typography>
          )}
        </Paper>
      )}

      {tooltip && mousePosition.x > 0 && !equipmentMenu.visible && (
        <div 
          className="tooltip"
          style={{
            position: 'fixed',
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {tooltip}
        </div>
      )}
      <div className="zoom-slider">
        <label htmlFor="zoom">Zoom: {position.zoom.toFixed(1)}x</label>
        <input
          id="zoom"
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          value={position.zoom}
          onChange={handleZoomChange}
        />
      </div>
      <div className="reset-button">
        <button onClick={handleResetMap}>
          <RotateLeftIcon />
        </button>
      </div>
    </Box>
  );
};

export default CompMap;