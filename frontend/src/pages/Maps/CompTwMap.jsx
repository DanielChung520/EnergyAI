import { useState, useCallback, useEffect, useRef } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker
} from "react-simple-maps";
import { Box, Menu, MenuItem, List, ListItem, ListSubheader, Typography, useTheme, Tooltip } from '@mui/material';
import { geoMercator } from 'd3-geo';  // 引入 d3-geo
import twGeoJson from './tw.json';
import AllSitePerformance from '../energy/Card/AllSitePerformance';
import CoIndicator from '../energy/Card/CoIndicator';
import ThisYearPerformance from '../energy/Card/ThisYearPerformance';
import ThisMonthPerformance from '../energy/Card/ThisMonthPerformance';
import TodayPerformance from '../energy/Card/TodayPerformance';
import AllSiteBarChart from '../energy/Chart/AllSiteBarChart';
import AllSitePieChart from '../energy/Chart/AllSitePieChart';
import { colors } from '../../hooks/colors';


// 定義站點類型對應的顏色
const siteTypeColors = {
    wind: '#000000',        // 黑色
    biomass: '#FFA500',     // 橘色
    solar: '#FFD700',       // 黃色
    ocean: '#0000FF',       // 藍色
    geothermal: '#8B4513',  // 咖啡色
    hydro: '#FFFFFF',       // 白色
    'biomass-pyrolysis': '#FFA500',    // 橘色
    'biomass-biogas': '#FFA500',       // 橘色
    'biomass-combustion': '#FFA500',   // 橘色
    other: '#808080'        // 其他類型使用灰色
};

// 添加區域顏色映射，使用更柔和的顏色
const regionColors = {
    'TPE': '#E6194B', // 台北市 - 紅色
    'NTP': '#3CB44B', // 新北市 - 綠色
    'TYC': '#4363D8', // 桃園市 - 藍色
    'HSC': '#F58231', // 新竹市 - 橙色
    'HSH': '#911EB4', // 新竹縣 - 紫色
    'ILH': '#46F0F0', // 宜蘭縣 - 青色
    'TXG': '#F032E6', // 台中市 - 粉紅色
    'CWH': '#BCF60C', // 彰化縣 - 亮綠色
    'NTH': '#FABEBE', // 南投縣 - 淺紅色
    'YLH': '#008080', // 雲林縣 - 藍綠色
    'CYI': '#E6BEFF', // 嘉義市 - 淺紫色
    'CHH': '#9A6324', // 嘉義縣 - 棕色
    'TNN': '#FFFAC8', // 台南市 - 淺黃色
    'KHH': '#800000', // 高雄市 - 深紅色
    'IUH': '#AAF0D1', // 屏東縣 - 淺綠色
    'TTT': '#808000', // 台東縣 - 橄欖色
    'HWA': '#FFD8B1', // 花蓮縣 - 淺橙色
    'PEH': '#000075', // 澎湖縣 - 深藍色
    'KMN': '#808080', // 金門縣 - 灰色
    'LNN': '#FFFFFF'  // 連江縣 - 白色
};

const CompTwMap = ({ onRegionEdit, focusPathId }) => {
    // 初始縮放狀態
    const [position, setPosition] = useState({ coordinates: [121, 23.5], zoom: 4 });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [markerPositions, setMarkerPositions] = useState([]); // 用于存储圆点位置
    const [sites, setSites] = useState([]);
    const [hoveredSite, setHoveredSite] = useState(null); // 用於懸停效果
    const [tooltipOpen, setTooltipOpen] = useState(false); // 用於顯示提示
    const [selectedSite, setSelectedSite] = useState(null); // 用於顯示選中的站點
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 }); // 用於提示框位置

    const theme = useTheme(); // 获取 MUI 主题

    // 創建一個 ref 來存儲地圖容器
    const mapRef = useRef(null);

    // 從 LocalStorage 獲取站點數據
    useEffect(() => {
        const storedSites = localStorage.getItem('sites');
        if (storedSites) {
            setSites(JSON.parse(storedSites));
        }
    }, []);

    // 處理縮放和平移
    const handleMoveEnd = useCallback((position) => {
        setPosition(position);
    }, []);

    // 地圖點擊事件處理
    const handleClick = useCallback((geo, event) => {
        if (geo && event.button === 2) {
            event.preventDefault();
            setSelectedRegion(geo);

            const mapContainer = event.currentTarget;
            const rect = mapContainer.getBoundingClientRect();

            // 計算點擊位置相對於地圖容器的比例
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            // 台灣經緯度範圍
            const lonRange = [120, 122]; // 經度範圍
            const latRange = [22, 25];   // 緯度範圍

            // 將點擊位置轉換為經緯度
            const longitude = lonRange[0] + (lonRange[1] - lonRange[0]) * x;
            const latitude = latRange[1] - (latRange[1] - latRange[0]) * y;

            setAnchorEl({
                top: event.clientY,
                left: event.clientX,
                mapCoordinates: [longitude, latitude]
            });
        }
    }, []);

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedRegion(null);
    };

    const open = Boolean(anchorEl);

    const handleSetFavorite = () => {
        if (anchorEl) {
            // 使用 anchorEl 中已经计算好的地理坐标
            const mouseCoordinates = anchorEl.mapCoordinates;

            // 获取地图容器
            const mapContainer = document.querySelector('.rsm-svg');
            const rect = mapContainer.getBoundingClientRect();

            // 计算页面中心位置相对于地图容器的比例
            const centerX = (window.innerWidth / 2 - rect.left) / rect.width;
            const centerY = (window.innerHeight / 2 - rect.top) / rect.height;

            // 将页面中心位置转换为地理坐标
            const lonRange = [120, 122]; // 经度范围
            const latRange = [22, 25];   // 纬度范围
            const centerLongitude = lonRange[0] + (lonRange[1] - lonRange[0]) * centerX;
            const centerLatitude = latRange[1] - (latRange[1] - latRange[0]) * centerY;

            // 设置圆点位置（使用地理坐标）
            setMarkerPositions([
                { coordinates: mouseCoordinates, color: 'red' }, // 鼠标位置
                { coordinates: [centerLongitude, centerLatitude], color: 'blue' }, // 页面中心位置
            ]);

            console.log("Mouse Coordinates:", mouseCoordinates);
            console.log("Center Coordinates:", [centerLongitude, centerLatitude]);
        } else {
            alert("未选择任何区域");
        }
        handleClose();
    };

    const handleEditRegion = () => {
        // 處理編輯區域資訊的邏輯
        console.log(`編輯 ${selectedRegion.properties.name} 的資訊`);
        handleClose();
    };

    // 修改懸停事件處理函數
    const handleMarkerHover = (site, event) => {
        setHoveredSite(site);
        setSelectedSite(site);
        setTooltipPosition({
            top: event.clientY,
            left: event.clientX - 220 // 向左偏移
        });
        setTooltipOpen(true);
    };

    const handleMarkerLeave = () => {
        setHoveredSite(null);
        setSelectedSite(null);
        setTooltipOpen(false);
    };

    return (
        <Box 
            ref={mapRef}
            sx={{
                width: '100%',
                height: '76%',
                position: 'relative',
                backgroundColor: '#B0E0E6',
                opacity: 0.8
            }}
        >
            {/* 卡片容器 */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '20px',
                    left: '300px',  // 從左側 400px 開始
                    right: '20px',  // 預留右側邊距
                    display: 'flex',
                    gap: 2,
                    zIndex: 1000,
                    justifyContent: 'space-between'  // 平均分配空間
                }}
            >
                <Box sx={{ flex: 1, minWidth: 180, maxWidth: 200 }}>
                    <CoIndicator />
                </Box>
                <Box sx={{ flex: 1, minWidth: 180, maxWidth: 200 }}>
                    <ThisYearPerformance />
                </Box>
                <Box sx={{ flex: 1, minWidth: 180, maxWidth: 200 }}>
                    <ThisMonthPerformance />
                </Box>
                <Box sx={{ flex: 1, minWidth: 180, maxWidth: 200 }}>
                    <TodayPerformance />
                </Box>
                <Box sx={{ flex: 1, minWidth: 180, maxWidth: 200 }}>
                    <AllSitePerformance />
                </Box>
            </Box>

            {/* 柱狀圖容器 */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '550px',
                    height: '300px',
                    zIndex: 1000
                }}
            >
                <AllSiteBarChart />
            </Box>

            {/* 餅圖容器 */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    width: '300px',
                    height: '300px',
                    zIndex: 1000
                }}
            >
                <AllSitePieChart />
            </Box>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 1000,
                    center: [121, 23.5]
                }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                    minZoom={1}
                    maxZoom={16}
                    onClick={handleClose} // 點擊地圖時隱藏 tooltip
                >
                    <Geographies geography={twGeoJson}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.properties.id}
                                    geography={geo}
                                    onClick={(event) => handleClick(geo, event)}
                                    onContextMenu={(event) => handleClick(geo, event)}
                                    style={{
                                        default: {
                                            fill: geo.properties.color || '#627BC1',  // 使用 JSON 中定義的顏色
                                            stroke: "#000000",
                                            strokeWidth: 0.1,
                                            outline: "none",
                                            opacity: 0.6
                                        },
                                        hover: {
                                            fill: theme.palette.primary.light,
                                            stroke: theme.palette.primary.light,
                                            strokeWidth: 0.1,
                                            outline: "none",
                                            opacity: 0.8
                                        },
                                        pressed: {
                                            fill: "#627BC1",
                                            stroke: "#000000",
                                            strokeWidth: 0.1,
                                            outline: "none",
                                            opacity: 0.5
                                        }
                                    }}
                                />
                            ))
                        }
                    </Geographies>
                    {/* 绘制圆点 */}
                    {markerPositions
                        .filter(marker => marker.color !== 'green')
                        .map((marker, index) => (
                            <Marker key={index} coordinates={marker.coordinates}>
                                {/* 首先定义滤镜 */}
                                <defs>
                                    <filter id={`glow-${index}`}>
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle 
                                    r={2} 
                                    fill={marker.color}
                                    stroke="#FFFFFF"
                                    strokeWidth={1}
                                    filter={marker.color === 'red' ? `url(#glow-${index})` : 'none'}
                                />
                            </Marker>
                        ))}

                    {/* 根據站點類型繪製不同顏色的圓點 */}
                    {sites.map((site) => (
                        site.latitude && site.longitude ? (
                            <Marker 
                                key={site.id}
                                coordinates={[parseFloat(site.longitude), parseFloat(site.latitude)]}
                                onMouseEnter={(event) => handleMarkerHover(site, event)}
                                onMouseLeave={handleMarkerLeave}
                            >
                                <Tooltip
                                    open={tooltipOpen && selectedSite?.id === site.id}
                                    title={
                                        <div>
                                            <div>{site.company}</div>
                                            <div>{site.name}</div>
                                            <div>{site.site_type}</div>
                                        </div>
                                    }
                                    placement="left"
                                    arrow
                                    sx={{
                                        '& .MuiTooltip-tooltip': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            color: 'white',
                                            fontSize: '14px',
                                            padding: '12px 12px',
                                            maxWidth: 'none',
                                            '& div': {
                                                marginBottom: '4px',
                                                '&:last-child': {
                                                    marginBottom: 0
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <g>
                                        {/* 使用 filter 來實現陰影效果 */}
                                        <defs>
                                            <filter id={`glow-${site.id}`} x="-50%" y="-50%" width="200%" height="200%">
                                                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <circle
                                            r={hoveredSite === site ? 1 : 0.5}
                                            fill={siteTypeColors[site.site_type] || siteTypeColors.other}
                                            stroke="#FFFFFF"
                                            strokeWidth={0.2}
                                            filter={hoveredSite === site ? `url(#glow-${site.id})` : undefined}
                                        />
                                    </g>
                                </Tooltip>
                            </Marker>
                        ) : null
                    ))}
                </ZoomableGroup>
            </ComposableMap>

            {/* 使用 MUI 的 Menu 组件 */}
            <Menu
                anchorReference="anchorPosition" // 使用锚点位置
                anchorPosition={anchorEl ? { top: anchorEl.top, left: anchorEl.left } : undefined} // 设置菜单位置
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleSetFavorite}>設置我的最愛</MenuItem>
                <MenuItem onClick={handleEditRegion}>編輯區域資訊</MenuItem>
            </Menu>

            {/* 添加圖例 */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 150,
                    right: 20,
                    backgroundColor: 'white',
                    padding: 1,
                    borderRadius: 1,
                    boxShadow: 1
                }}
            >
                <Typography variant="subtitle2">站點類型</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: siteTypeColors.wind, border: '1px solid black' }} />
                        <Typography variant="caption">風能</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: siteTypeColors.biomass, border: '1px solid black' }} />
                        <Typography variant="caption">生質能</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: siteTypeColors.solar, border: '1px solid black' }} />
                        <Typography variant="caption">太陽能</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: siteTypeColors.ocean, border: '1px solid black' }} />
                        <Typography variant="caption">海洋能</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: siteTypeColors.geothermal, border: '1px solid black' }} />
                        <Typography variant="caption">地熱能</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: siteTypeColors.hydro, border: '1px solid black' }} />
                        <Typography variant="caption">水力</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CompTwMap;
