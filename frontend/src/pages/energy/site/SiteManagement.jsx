import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TableSortLabel,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Grid,
  Chip,
  Alert,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  Slider,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Build as BuildIcon,
  Air as AirIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../../components/PageContainer';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SitePerformanceChart from './SitePerformanceChart';
import { visuallyHidden } from '@mui/utils';
import { useDynamicRoute } from '../../../components/DynamicRoute';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { MdWindPower } from "react-icons/md";
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import zhTW from 'date-fns/locale/zh-TW';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import moment from 'moment';
import 'moment/locale/zh-tw';
import RefreshIcon from '@mui/icons-material/Refresh';
import WindPowerChart from '../../../components/Charts/WindPowerChart';
import { translateWeatherDescription, processWeatherData } from '@/data/weather';

// 狀態配置
const STATUS_CONFIG = {
  running: { label: '運轉中', color: '#4CAF50' },
  installing: { label: '安裝中', color: '#FFC107' },
  exception: { label: '警告', color: '#FF9800' },
  trouble: { label: '故障', color: '#F44336' },
  maintenance: { label: '維修', color: '#9E9E9E' }
};

// 狀態標籤轉換
const getStatusLabel = (status) => {
  const statusMap = {
    running: '運行中',
    maintenance: '維護中',
    installing: '安裝中',
    stopped: '停止',
    fault: '故障'
  };
  return statusMap[status] || status;
};

// 在组件外部添加常量定义
const TIME_MARKS = [
  { value: 0, label: '分', interval: 1, periodType: 'min' },
  { value: 33, label: '時', interval: 10, periodType: 'hr' },
  { value: 66, label: '天', interval: 60, periodType: 'day' },
  { value: 100, label: '月', interval: 720, periodType: 'mon' }
];

// 在 SiteManagement 組件中添加一個常量來控制默認週期
const DEFAULT_STAT_PERIOD = 'month';

function SiteManagement() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const { navigateTo: navigateToEquipmentList } = useDynamicRoute('A.1.2.1'); // SiteEquipmentList
  const { navigateTo: navigateToBasicSettings } = useDynamicRoute('A.1.2.2'); // SiteBasicSettings
  const { navigateTo: navigateToWindPowerGenerator } = useDynamicRoute('A.1.5'); // WindPowerGenerator
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [fileUploadKey, setFileUploadKey] = useState(Date.now());
  const [formData, setFormData] = useState({
    equip_id: '',
    name: '',
    model_no: '',
    asset_no: '',
    purchase_date: null,
    operat_date: null,
    location: '',
    backup: 'n',
    status: 'installing',
    remark: ''
  });
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState({});  // 存儲設備狀態信息
  const [pollingInterval, setPollingInterval] = useState(null);
  const [equipmentAnchorEl, setEquipmentAnchorEl] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [showChart, setShowChart] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [chartEquipment, setChartEquipment] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [powerType, setPowerType] = useState('pac'); // 默认使用併網產電
  const [sliderValue, setSliderValue] = useState(() => {
    // 从本地存储中获取之前的设置，或使用默认值25（对应小时）
    const saved = localStorage.getItem('site-chart-slider');
    return saved ? JSON.parse(saved) : 25; // 默认25对应小时
  });

  // 新增：天气信息状态
  const [weatherData, setWeatherData] = useState(null);

  // 新增狀態來管理選中的選項卡和單選按鈕
  const [selectedTab, setSelectedTab] = useState(DEFAULT_STAT_PERIOD); // 改為 'month'
  const [selectedRadio, setSelectedRadio] = useState('powerOutput');

  // 新增状态来管理选中的日期
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 添加統計相關的狀態
  const [selectedStatType, setSelectedStatType] = useState('power');
  const [refreshChart, setRefreshChart] = useState(0);

  // 定義默認週期常量
  const DEFAULT_PERIOD = 'day';
  
  // 使用默認週期初始化狀態
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [statType, setStatType] = useState('power');
  
  // 處理統計區域的 tab 切換
  const handleStatPeriodChange = useCallback((event, newValue) => {
    console.log('切換統計週期，舊值:', statType, '新值:', newValue);
    setStatType(newValue);
  }, [statType]);

  // 處理統計類型切換
  const handleStatTypeChange = (event) => {
    setStatType(event.target.value);
  };

  useEffect(() => {
    console.log('=== Translation Debug ===');
    console.log('Current language:', i18n.language);
    console.log('Translation test:', {
      title: t('site.management.list.title', '案場管理'),
      addButton: t('site.management.actions.add', '新增案場'),
      name: t('site.basic.fields.name', '名稱'),
      province: t('site.basic.fields.location.province', '省份'),
      type: t('site.basic.fields.type.label', '案場類型'),
      company: t('site.basic.fields.company', '公司組織'),
      capacity: t('site.basic.fields.capacity.total', '總裝機容量'),
      actions: t('common.actions', '操作')
    });
    console.log('Translation resources:', i18n.options.resources);
    console.log('=====================');
  }, [i18n.language]);

  // 將 fetchSites 函數移到 useEffect 外部
  const fetchSites = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL;
      console.log('Attempting to fetch from URL:', `${baseUrl}/api/sites`);
      
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
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched sites:', data);
      setSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 在 useEffect 中調用 fetchSites
  useEffect(() => {
    fetchSites();
  }, []);

  // 添加新的 useEffect 来自动选择第一个站点
  useEffect(() => {
    // 当站点数据加载完成且有数据，并且没有已选择的站点时，自动选择第一个站点
    if (sites.length > 0 && !selectedSite) {
      console.log('自动选择第一个站点:', sites[0]);
      handleRowClick(sites[0]);
    }
  }, [sites, selectedSite]); // 依赖于 sites 和 selectedSite

  // 修改獲取站點詳細的函數
  const fetchSiteDetails = async (siteId, siteType) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      console.log('Fetching site details:', `${baseUrl}/api/sites/${siteId}/${siteType}-details`);
      
      const response = await fetch(`${baseUrl}/api/sites/${siteId}/${siteType}-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching ${siteType} details:`, err);
      return null;
    }
  };

  // 新增獲取設備列表方法
  const fetchEquipments = async (siteId) => {
    try {
      setEquipmentLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/sites/${siteId}/equipments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('獲取設備失敗');
      const data = await response.json();
      setEquipments(data);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      setError(error.message);
    } finally {
      setEquipmentLoading(false);
    }
  };

  // 修改點擊處理函數，確保使用當前選中的站點和設備
  const handleRowClick = async (site) => {
    console.log('選擇站點:', site);
    
    // 更新选中的站点
    setSelectedSite(site);
    // 清空之前的设备列表
    setEquipments([]);
    
    // 獲取設備列表
    if (site?.site_id || site?.id) {
      try {
        setEquipmentLoading(true);
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/sites/${site.site_id || site.id}/equipments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) throw new Error('獲取設備失敗');
        const data = await response.json();
        
        // 设置设备数据
        setEquipments(data);
        console.log('獲取到的設備:', data);
        
        // 在設備數據更新後立即查詢設備狀態
        setTimeout(() => {
          fetchEquipmentStatus(data);
        }, 100);

        // 修改这里：如果有设备，自动选择第一个设备并显示图表
        if (data.length > 0) {
          const firstEquipment = data[0];
          setChartEquipment(firstEquipment);
          setShowChart(true);
          setSelectedPeriod('min'); // 默认显示分钟数据
          setSliderValue(0); // 设置滑块到"分"的位置
          setRefreshFlag(prev => prev + 1); // 触发图表刷新
        } else {
          // 如果没有设备，清空图表
          setChartEquipment(null);
          setShowChart(false);
        }

        // 新增：获取天气信息
        if (site.latitude && site.longitude) {
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${site.latitude}&lon=${site.longitude}&appid=ffc7fea93c88b05ee42c86af26b602a2&units=metric`;
          const weatherResponse = await fetch(weatherUrl);
          if (!weatherResponse.ok) throw new Error('獲取天氣信息失敗');
          const weatherInfo = await weatherResponse.json();
          setWeatherData(processWeatherData(weatherInfo));
        }
      } catch (error) {
        console.error('Error fetching equipments or weather data:', error);
        setError(error.message);
      } finally {
        setEquipmentLoading(false);
      }
    }
  };

  // 單獨的展開處理函數 - 阻止事件冒泡
  const handleExpandToggle = (e, siteId) => {
    e.stopPropagation(); // 防止觸發行點擊
    setExpandedRow(expandedRow === siteId ? null : siteId);
  };

  // 處理選單開關
  const handleMenuClick = (event, siteId) => {
    setAnchorEl(event.currentTarget);
    setSelectedSiteId(siteId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSiteId(null);
  };

  // 新增案場按鈕點擊處理
  const handleAddSite = () => {
    navigateToBasicSettings({
      state: {
        isEdit: false  // 明確標記為新增模式
      }
    });
  };

  // 處理編輯
  const handleEdit = (site) => {
    handleMenuClose();
    console.log('Editing site:', site);
    navigateToBasicSettings({ 
      state: { 
        siteId: site.id || site.site_id,  // 確保使用正確的 ID
        isEdit: true  // 明確標記為編輯模式
      } 
    });
  };

  // 處理設備清單
  const handleEquipmentList = (site) => {
    handleMenuClose();
    navigateToEquipmentList({ 
      state: { 
        siteId: site.site_id || site.id
      } 
    });
  };

  // 處理刪除按鈕點擊
  const handleDeleteClick = (site) => {
    handleMenuClose();
    setSiteToDelete(site);
    setDeleteDialogOpen(true);
  };

  // 處理確認刪除
  const handleDeleteConfirm = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiPath = import.meta.env.VITE_SITE_API_URL;
      const response = await fetch(`${baseUrl}${apiPath}/${siteToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 現在可以直接調用 fetchSites
      await fetchSites();
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('刪除案場失敗');
    }
  };

  // 添加排序處理函數
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // 排序邏輯
  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  // 修改表頭定義
  const headCells = [
    {
      id: 'expand',
      label: '',
      width: 60,
      sortable: false
    },
    { 
      id: 'name', 
      label: t('site.basic.fields.name', '名稱'), 
      width: 200  // 恢復原始寬度
    },
    { 
      id: 'province', 
      label: t('site.basic.fields.location.province', '省份'), 
      width: 150  // 恢復原始寬度
    },
    { 
      id: 'site_type', 
      label: t('site.basic.fields.type.label', '案場類型'), 
      width: 150  // 恢復原始寬度
    },
    { 
      id: 'company', 
      label: t('site.basic.fields.company', '公司組織'), 
      width: 200  // 恢復原始寬度
    },
    { 
      id: 'actions', 
      label: t('common.actions', '操作'), 
      width: 150,  // 稍微增加寬度
      sortable: false 
    }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 這裡添加文件處理邏輯
    console.log('Selected file:', file);
    
    // 重置input以便重複上傳
    setFileUploadKey(Date.now());
  };

  // 新增表單處理函數
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 優化獲取設備型號的函數
  const fetchEquipmentTypes = async () => {
    try {
      // 獲取正確的 API URL
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('開始獲取設備型號，URL:', `${baseUrl}/api/equipments/`);
      
      // 嘗試移除 credentials，如果後端未設置 CORS 支援
      const response = await fetch(`${baseUrl}/api/equipments/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // 如果後端未配置CORS credentials支援，請移除或改為 'same-origin'
        credentials: 'same-origin' 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('獲取到的設備資料:', data);
      
      // 提取唯一型號 - 根據實際API響應調整字段名
      const uniqueTypes = [...new Set(
        Array.isArray(data) 
          ? data.filter(item => item && item.model_no).map(item => item.model_no)
          : []
      )];
      
      console.log('提取的唯一設備型號:', uniqueTypes);
      setEquipmentTypes(uniqueTypes.length > 0 ? uniqueTypes : ['暫無設備型號']);
      
    } catch (error) {
      console.error('獲取設備型號錯誤:', error);
      setEquipmentTypes(['獲取失敗，請重試']);
    }
  };

  // 確保在對話框打開時獲取設備型號
  const handleOpenEquipmentDialog = () => {
    console.log('打開設備對話框，開始獲取設備型號');
    setEquipmentDialogOpen(true); // 先打開對話框
    fetchEquipmentTypes(); // 然後獲取設備型號
  };

  // 修改新增設備對話框的處理函數
  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    console.log('提交設備表單數據:', formData);
    console.log('當前選擇的站點:', selectedSite);

    // 檢查必要資訊是否完整
    if (!formData.model_no || !formData.name || !formData.asset_no || !formData.location) {
      setError('請填寫所有必要欄位');
      return;
    }

    // 檢查站點是否選擇
    if (!selectedSite || (!selectedSite.id && !selectedSite.site_id)) {
      setError('請先選擇一個站點');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const siteId = selectedSite.site_id || selectedSite.id;
      
      // 格式化日期為 'YYYY-MM-DD' 格式
      const formatDate = (date) => {
        if (!date) return null;
        
        // 如果是Date對象，格式化為YYYY-MM-DD
        if (date instanceof Date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        
        return date;
      };

      // 創建包含格式化日期的提交數據
      const submitData = {
        ...formData,
        site_id: siteId,
        purchase_date: formatDate(formData.purchase_date),
        operat_date: formatDate(formData.operat_date)
      };
      
      console.log('格式化後的提交數據:', submitData);
      
      const response = await fetch(`${baseUrl}/api/sites/${siteId}/equipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      console.log('API 響應狀態:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 錯誤響應:', errorText);
        throw new Error(`新增設備失敗: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('成功新增設備:', data);
      
      // 更新設備列表
      setEquipments(prev => [...prev, data]);
      
      // 關閉對話框
      setEquipmentDialogOpen(false);
      
      // 重置表單
      setFormData({
        equip_id: '',
        name: '',
        model_no: '',
        asset_no: '',
        purchase_date: null,
        operat_date: null,
        location: '',
        backup: 'n',
        status: 'installing',
        remark: ''
      });
      
    } catch (error) {
      console.error('新增設備錯誤:', error);
      // 顯示錯誤提示
      setError(`新增設備失敗: ${error.message}`);
    }
  };

  // 同時需要添加日期處理函數
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // 修改獲取設備狀態的函數，接收設備數據作為參數
  const fetchEquipmentStatus = async (equipmentList) => {
    try {
      // 使用傳入的設備列表或當前狀態中的設備列表
      const equipmentsToCheck = equipmentList || equipments;
      
      // 確認有設備可查詢
      if (!equipmentsToCheck || equipmentsToCheck.length === 0) {
        console.warn('沒有設備可以查詢狀態');
        return;
      }
      
      console.log('開始查詢設備狀態，設備數量:', equipmentsToCheck.length);
      
      // 建立狀態映射
      const statusMap = {};
      
      // 對每個設備調用 API 獲取最新狀態
      for (const equipment of equipmentsToCheck) {
        // 使用 equip_id 而不是 device_id 或 id
        const deviceId = equipment.equip_id;
        
        if (!deviceId) {
          console.warn(`設備缺少 equip_id:`, equipment);
          continue;
        }
        
        const baseUrl = import.meta.env.VITE_API_URL;
        console.log(`查詢設備狀態，設備ID(equip_id): ${deviceId}`);
        
        const response = await fetch(`${baseUrl}/api/wind/latest/${deviceId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer wind_test_only_123'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          // 使用 equip_id 作為狀態映射的鍵
          statusMap[equipment.equip_id] = data;
          console.log(`設備 ${deviceId} 狀態查詢成功:`, data);
          console.log(`server_status: ${data.server_status} (類型: ${typeof data.server_status})`);
          console.log(`iw_op_sys_run_status: ${data.iw_op_sys_run_status} (類型: ${typeof data.iw_op_sys_run_status})`);
        } else {
          console.error(`設備 ${deviceId} 狀態查詢失敗:`, response.status);
        }
      }
      
      console.log('所有設備狀態更新完成:', statusMap);
      setEquipmentStatus(statusMap);
      
    } catch (error) {
      console.error('獲取設備狀態錯誤:', error);
    }
  };

  // 修改獲取設備顏色的函數，確保正確處理數據類型
  const getEquipmentColor = (equipment) => {
    // 使用 equip_id 而不是 device_id 或 id
    const status = equipmentStatus[equipment.equip_id];
    
    // 調試輸出
    if (status) {
      console.log(`設備 ${equipment.equip_id} 的狀態:`, status);
      console.log(`server_status: ${status.server_status} (${typeof status.server_status})`);
    }
    
    // 如果沒有狀態數據，則為灰色
    if (!status) {
      return "#9E9E9E"; // 灰色 - 無數據
    }
    
    // 強制將server_status轉為數字進行比較
    const serverStatus = Number(status.server_status);
    console.log(`設備 ${equipment.equip_id} 的數字化server_status:`, serverStatus);
    
    // 如果 server_status 為 0，則為灰色
    if (serverStatus === 0) {
      return "#9E9E9E"; // 灰色 - 離線狀態
    }
    
    // 檢查運行狀態，先將字符串轉為數字
    const runStatus = parseInt(status.iw_op_sys_run_status, 10);
    if (runStatus === 1 || runStatus === 2) {
      return "#4CAF50"; // 綠色 - 正常狀態
    } else {
      return "#FF9800"; // 橘色 - 異常狀態
    }
  };

  // 修改檢查是否需要顯示警報標記的函數
  const shouldShowAlarmBadge = (equipment) => {
    // 使用 equip_id 作為鍵
    const status = equipmentStatus[equipment.equip_id];
    
    // 如果沒有狀態數據或 server_status 為 0，則不顯示badge
    if (!status || status.server_status === 0) {
      return false;
    }
    
    // 檢查運行狀態 - 只有當不為1或2時才顯示badge
    const runStatus = parseInt(status.iw_op_sys_run_status, 10);
    return runStatus !== 1 && runStatus !== 2;
  };

  // 添加運行狀態文字轉換函數
  const getOpStatusText = (status) => {
    // 確保轉換為數字
    const statusNum = parseInt(status, 10);
    
    switch (statusNum) {
      case 1: return "啟動";
      case 2: return "運行";
      case 3: return "暫停";
      case 4: return "無風";
      case 5: return "急停";
      case 6: return "限電";
      case 7: return "未知";
      default: return "未知";
    }
  };

  // 修改顯示狀態的函數
  const getAlarmStatus = (equipment) => {
    // 使用 equip_id 作為鍵
    const status = equipmentStatus[equipment.equip_id];
    
    if (!status) return "";
    
    // 返回運行狀態文字
    return getOpStatusText(status.iw_op_sys_run_status);
  };

  // 添加輪巡效果
  useEffect(() => {
    // 只有當選擇了站點且有設備時才開始輪巡
    if (selectedSite && equipments.length > 0) {
      console.log('開始設備狀態輪巡');
      
      // 設置一個每分鐘執行一次的定時器
      const timer = setInterval(() => {
        console.log('執行設備狀態輪巡...');
        fetchEquipmentStatus();
      }, 60000); // 每60秒輪巡一次
      
      // 保存定時器引用以便清除
      setPollingInterval(timer);
      
      // 組件卸載或依賴變化時清除定時器
      return () => {
        console.log('清除設備狀態輪巡');
        if (timer) clearInterval(timer);
      };
    }
    
    // 如果沒有選擇站點或沒有設備，確保清除任何現有定時器
    return () => {
      if (pollingInterval) {
        console.log('由於站點或設備變化，清除現有輪巡');
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [selectedSite, equipments.length]); // 依賴於選擇的站點和設備列表

  // 修改設備點擊導航函數，顯示浮動菜單
  const handleEquipmentClick = (event, equipment) => {
    event.stopPropagation(); // 阻止事件冒泡
    
    if (!equipment || !equipment.equip_id) {
      console.warn('設備缺少equip_id，無法導航到風機監控頁面');
      return;
    }
    
    // 設置選中的設備和菜單錨點
    setSelectedEquipment(equipment);
    setEquipmentAnchorEl(event.currentTarget);
  };

  // 添加菜單關閉函數
  const handleEquipmentMenuClose = () => {
    setEquipmentAnchorEl(null);
    setSelectedEquipment(null);
  };

  // 添加即時監控導航處理函數
  const handleViewMonitoring = () => {
    if (!selectedEquipment || !selectedEquipment.equip_id) {
      console.warn('設備缺少equip_id，無法導航到風機監控頁面');
      return;
    }
    
    console.log('點擊設備，導航到WindPowerGenerator，設備ID:', selectedEquipment.equip_id);
    
    // 使用 navigateToWindPowerGenerator 並確保參數格式正確
    navigateToWindPowerGenerator({ 
      state: { 
        deviceId: selectedEquipment.equip_id  // 確保使用 deviceId 作為鍵名
      },
      search: `deviceId=${selectedEquipment.equip_id}`  // 使用 search 而非 query
    });
    
    // 關閉菜單
    handleEquipmentMenuClose();
  };

  // 修改 handleViewStatistics 函数
  const handleViewStatistics = () => {
    if (!selectedEquipment || !selectedEquipment.equip_id) {
      console.warn('設備缺少equip_id，無法查看統計數據');
      return;
    }
    
    console.log('查看設備統計圖表:', selectedEquipment.equip_id);
    
    // 設置當前圖表設備
    setChartEquipment(selectedEquipment);
    
    // 直接显示图表，不再调用 fetchEquipmentHistoryData
    setShowChart(true);
    
    // 設置默认周期为小时
    setSelectedPeriod('hour');
    
    // 触发图表刷新
    setRefreshFlag(prev => prev + 1);
    
    // 關閉菜單
    handleEquipmentMenuClose();
  };

  // 添加刷新图表的函数
  const handleRefreshChart = () => {
    setRefreshFlag(prev => prev + 1);
  };

  // 修改处理滑块变化的函数
  const handleSliderChange = (_, newValue) => {
    const selectedMark = TIME_MARKS.find(m => m.value === newValue);
    const newPeriodType = selectedMark?.periodType || 'min';
    
    setSliderValue(newValue);
    setSelectedPeriod(newPeriodType);
    localStorage.setItem('site-chart-slider', newValue);
    
    setRefreshFlag(prev => prev + 1);
  };

  // 修改 handleTabChange 的實現
  const handleTabChange = (event, newValue) => {
    console.log('Tab changing:', { 
      from: statType, 
      to: newValue,
      selectedSite: selectedSite 
    });
    setStatType(newValue);
  };

  // 處理單選按鈕選擇
  const handleRadioChange = (event) => {
    setSelectedRadio(event.target.value);
  };

  // 處理週期切換
  const handlePeriodChange = useCallback((event, newValue) => {
    console.log('切換統計週期，舊值:', period, '新值:', newValue);
    if (['day', 'month', 'year'].includes(newValue)) {
      setPeriod(newValue);
    }
  }, [period]);

  return (
    <PageContainer>
      <Box sx={{ 
        display: 'flex', 
        gap: 1,
        height: 'calc(100vh - 58px)',  // 减去 Header 的高度 (64px)
        width: '100%',
        backgroundColor: '#bbdefb',
        p: 2,
        overflow: 'hidden'  // 防止出现滚动条
      }}>
        {/* 左側區域 - 可展開列表 */}
        <Box sx={{ 
          flex: 7, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1,
          minWidth: 0,
          height: '100%',
          fontSize: '0.875rem', // 將左側區域的字體大小設置為14px
        }}>
          {/* 上部分 - 可展开案场列表 (自动响应高度) */}
          <Box sx={{ 
            flex: 1,  // 自动占据剩余空间
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,  // 确保 flex 子项可以收缩
            fontSize: '0.875rem', // 將上部分的字體大小設置為14px
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 0,
              px: 1
            }}>
              <Typography variant="h6">{t('site.management.list.title', '案場管理')}</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddSite}  // 使用新的處理函數
              >
                {t('site.management.actions.add', '新增案場')}
              </Button>
            </Box>
            
            <TableContainer sx={{ 
              flex: 1, 
              overflow: 'auto',
              '& .MuiTableCell-root': {
                boxSizing: 'border-box', // 确保padding计算在宽度内
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.875rem', // 將表格內的字體大小設置為14px
              },
              '& .MuiTable-root': {
                tableLayout: 'auto' // 修改为自动布局模式
              },
              '& .MuiTableCell-head': {
                backgroundColor: '#1976d2',
                color: '#fff',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                zIndex: 1,
                '& .MuiTableSortLabel-root': {
                  color: '#fff',
                  '&:hover': {
                    color: '#e3f2fd',
                  },
                  '&.Mui-active': {
                    color: '#fff',
                    '& .MuiTableSortLabel-icon': {
                      color: '#fff',
                    }
                  }
                },
                fontSize: '0.875rem', // 將表頭的字體大小設置為14px
              }
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        sx={{
                          width: headCell.width,
                          minWidth: headCell.width,
                          maxWidth: headCell.width
                        }}
                        sortDirection={orderBy === headCell.id ? order : false}
                      >
                        {headCell.sortable !== false ? (
                          <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={() => handleRequestSort(headCell.id)}
                          >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                              <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? t('site.management.list.sort.desc') : t('site.management.list.sort.asc')}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        ) : (
                          headCell.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ color: 'error.main' }}>
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : sites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        {t('site.management.list.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sites
                      .slice()
                      .sort(getComparator(order, orderBy))
                      .map((site) => {
                        const isExpanded = expandedRow === (site.site_id || site.id);
                        return (
                          <React.Fragment key={site.site_id || site.id}>
                            <TableRow 
                              key={site.site_id || site.id}
                              hover
                              selected={selectedSite?.site_id === site.site_id || selectedSite?.id === site.id}
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleRowClick(site)}
                            >
                              <TableCell sx={{ width: 60 }}>
                                <IconButton 
                                  size="small"
                                  onClick={(e) => handleExpandToggle(e, site.site_id || site.id)}
                                >
                                  {isExpanded ? 
                                    <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                              </TableCell>
                              <TableCell>{site.site_name || site.name}</TableCell>
                              <TableCell>{site.province}</TableCell>
                              <TableCell>
                                {t(`site.basic.fields.type.${site.site_type}`, site.site_type)}
                              </TableCell>
                              <TableCell>{site.company_name || site.company}</TableCell>
                              <TableCell align="center" sx={{ width: 180 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title={t('site.management.actions.edit')}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(site);
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title={t('site.management.actions.equipment')}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEquipmentList(site);
                                      }}
                                    >
                                      <MdWindPower fontSize="16px" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title={t('site.management.actions.delete')}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(site);
                                      }}
                                      color="error"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>

                            {/* 展开详情行 */}
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={7} sx={{
                                  backgroundColor: '#fafafa',
                                  p: 1,
                                  borderBottom: '1px solid rgba(224, 224, 224, 0.5)'
                                }}>
                                  <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.2fr 0.8fr 0.5fr',
                                    gap: 1,
                                    fontSize: '0.75rem'
                                  }}>
                                    {/* 第一栏 - 加宽 */}
                                    <Box sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 1,
                                      pr: 1
                                    }}>

                                      <DetailItem
                                        label={t('site.basic.fields.coordinates', '經緯度')}
                                        value={
                                          selectedSite.latitude && selectedSite.longitude
                                            ? `${Number(selectedSite.latitude).toFixed(2)}，  ${Number(selectedSite.longitude).toFixed(2)}`
                                            : '－'
                                        }
                                      />
                                      <DetailItem
                                        label={t('site.basic.fields.location.label', '坐落位置')}
                                        value={`${selectedSite.province}${selectedSite.address || ''}`}
                                      />
                                    </Box>

                                    {/* 第二栏 */}
                                    <Box sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 1
                                    }}>
                                      <DetailItem
                                        label={t('site.basic.fields.capacity.total', '總裝機容量')}
                                        value={`${selectedSite.capacity || 0} ${t('site.basic.fields.capacity.unit', 'MW')}`}
                                      />
                                      <DetailItem
                                        label={t('site.basic.fields.area.label', '總佔地面積')}
                                        value={selectedSite.area ? `${selectedSite.area} ${t('site.basic.fields.area.unit', '公頃')}` : '－'}
                                      />
                                    </Box>

                                    {/* 第三栏 - 缩小 */}
                                    <Box sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 1,
                                      pl: 0
                                    }}>
                                      <DetailItem
                                        label={t('site.basic.fields.approvalDate', '核准日期')}
                                        value={selectedSite.approval_date || '－'}
                                      />
                                      <DetailItem
                                        label={t('site.basic.fields.constructionDate', '建設日期')}
                                        value={selectedSite.construction_date || '－'}
                                      />
                                      <DetailItem
                                        label={t('site.basic.fields.operationDate', '商轉日期')}
                                        value={selectedSite.operation_date || '－'}
                                      />
                                    </Box>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          {/* 下部分 - 案场营运统计 (固定高度) */}
          <Box sx={{ 
            height: '420px',  // 固定高度
            flex: '0 0 auto',  // 不伸缩
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 0,  // 移除整體 padding
            overflow: 'hidden', // 改為 hidden 以防止滾動條
            fontSize: '0.875rem',
          }}>
            {/* 頂部控制區 */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              bgcolor: '#303030',
              borderRadius: '6px 6px 0 0',
              pt: 1,
              px: 2,
              pb: 0,
              mb:-1 
            }}>
              {/* 週期切換 Tabs */}
              <Tabs 
                value={period}
                onChange={handlePeriodChange}
                aria-label="site statistics tabs"
                sx={{ 
                  minHeight: 'auto',
                  '& .MuiTabs-indicator': { 
                    display: 'none'
                  },
                  '& .MuiTab-root': {
                    minHeight: 'auto',
                    width: '80px',
                    padding: '6px 6px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    marginBottom: '0px', // 添加這行以消除間隙
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                      borderRadius: '6px 6px 0 0'
                    },
                    '&.Mui-selected': {
                      color: 'text.primary',
                      backgroundColor: 'background.paper',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '1px' // 添加這行以消除間隙
                    }
                  }
                }}
              >
                <Tab value="day" label="日統計" />
                <Tab value="month" label="月統計" />
                <Tab value="year" label="年統計" />
              </Tabs>

              {/* 統計類型選擇 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1 
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                  統計：
                </Typography>
                <RadioGroup 
                  row 
                  value={statType}
                  onChange={handleStatTypeChange}
                  aria-label="statistics type" 
                  name="statisticsType" 
                >
                  <FormControlLabel 
                    value="power" 
                    control={<Radio />} 
                    label="發電量" 
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        color: 'white',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                  <FormControlLabel 
                    value="carbon" 
                    control={<Radio />} 
                    label="碳減排" 
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        color: 'white',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                  <FormControlLabel 
                    value="income" 
                    control={<Radio />} 
                    label="收益" 
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        color: 'white',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </RadioGroup>
              </Box>
            </Box>

            {/* 內容區域 */}
            <Box sx={{ 
              height: 'calc(100% - 48px)',
              bgcolor: 'background.paper',
              borderRadius: '0 0 4px 4px',
              p: 2,
              overflow: 'auto'
            }}>
              {/* 日期選擇器 */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mb: 1
              }}>
                
              </Box>
              {/* 圖表組件 */}
              {selectedSite && (
                <SitePerformanceChart 
                  key={`${selectedSite.id}-${period}-${statType}-${selectedDate.getTime()}`}
                  siteId={selectedSite.id}
                  period={period}
                  statType={statType}
                  hideTitle={true}
                />
              )}
            </Box>
          </Box>
        </Box>
        
        {/* 右側區域 - 案場設備 */}
        <Box sx={{ 
          flex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minWidth: 300,
          maxWidth: 600,
          fontSize: '0.8rem', // 將右側區域的字體大小設置為14px
        }}>
          {/* 上部分 - 氣象資訊 (自动响应高度的一部分) */}
          <Box sx={{ 
            flex: '0 0 auto',  // 不伸缩但仍保持原始高度
            height: '80px',  // 固定适当的高度
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 1,
            overflow: 'auto',
            fontSize: '0.7rem', // 將氣象資訊的字體大小設置為14px
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center', 
              gap: 3,
              height: '100%',
              justifyContent: 'space-between'
            }}>
              {/* 風速 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                flex: 1,
                justifyContent: 'center'
              }}>
                <AirIcon sx={{ 
                  fontSize: '2rem', 
                  color: 'primary.main',
                  transform: 'rotate(180deg)' 
                }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">風速</Typography>
                  <Typography variant="h6">
                    {weatherData ? `${weatherData.windSpeed} m/s` : '－'}
                  </Typography>
                </Box>
              </Box>

              {/* 天氣狀態 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                flex: 1,
                justifyContent: 'center'
              }}>
                {weatherData ? (
                  <img 
                    src={`https://openweathermap.org/img/wn/${weatherData.weatherIcon}@2x.png`} 
                    alt="Weather Icon" 
                    style={{ 
                      width: '2rem', 
                      height: '2rem' 
                    }} 
                  />
                ) : (
                  <WbSunnyIcon sx={{ 
                    fontSize: '2rem', 
                    color: 'warning.main' 
                  }} />
                )}
                <Box>
                  <Typography variant="body2" color="text.secondary">天氣</Typography>
                  <Typography variant="h6">
                    {weatherData ? weatherData.weatherDescription : '－'}
                  </Typography>
                </Box>
              </Box>

              {/* 氣溫 */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                flex: 1,
                justifyContent: 'center'
              }}>
                <ThermostatIcon sx={{ 
                  fontSize: '2rem', 
                  color: 'error.main' 
                }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">氣溫</Typography>
                  <Typography variant="h6">
                    {weatherData ? `${weatherData.temperature}°C` : '－'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 中部分 - 設備列表 (自动响应高度) */}
          <Box sx={{
            flex: 1,  // 自动占据剩余空间
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 2,
            overflow: 'auto',
            minHeight: 0,  // 确保 flex 子项可以收缩
            fontSize: '0.7rem', // 將設備列表的字體大小設置為14px
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* <Typography variant="h6">設備列表</Typography> */}
                
                {/* 案場名稱膠囊 */}
                {selectedSite && (
                  <Chip 
                    label={selectedSite?.site_name || selectedSite?.name} 
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      ml: 1,
                      height: '24px',
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.85rem'
                      }
                    }}
                  />
                )}
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  {equipments.length} 台設備
                </Typography>
                
                {/* 導入清單按鈕 */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudDownloadIcon fontSize="small" />}
                  component="label"
                  sx={{ 
                    minWidth: 'auto',
                    px: 1.5,
                    '& .MuiButton-startIcon': {
                      marginRight: 0.5
                    }
                  }}
                >
                  導入
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                </Button>

                {/* 新增設備按鈕 */}
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon fontSize="small" />}
                  onClick={handleOpenEquipmentDialog}
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                    '& .MuiButton-startIcon': {
                      marginRight: 0.5
                    }
                  }}
                >
                  新增
                </Button>
              </Box>
            </Box>

            {equipmentLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                <CircularProgress size={24} />
                </Box>
            ) : error ? (
              <Alert severity="error" sx={{ my: 1 }}>{error}</Alert>
            ) : (
              <Grid container spacing={1}>
                {equipments.map((equipment) => (
                  <Grid item xs={4} key={equipment.id}>
                    <Paper 
                      sx={{
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: getEquipmentColor(equipment),
                        color: 'white',
                        borderRadius: 10,
                        height: 48,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                          cursor: 'pointer'
                        }
                      }}
                      onClick={(event) => handleEquipmentClick(event, equipment)}
                    >
                      {/* 警報標記 - 橢圓形膠囊 */}
                      {shouldShowAlarmBadge(equipment) && (
                        <Box 
                          sx={{
                            position: 'absolute',
                            top: -8,
                            left: -10,
                            bgcolor: '#F44336',
                            color: 'white',
                            borderRadius: '12px',
                            width: 'auto',
                            minWidth: '28px',
                            height: '20px',
                            padding: '0 6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            boxShadow: 1,
                            zIndex: 1
                          }}
                        >
                          {getAlarmStatus(equipment)}
                        </Box>
                      )}
                      
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 'bold', 
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                        whiteSpace: 'nowrap'
                      }}>
                        {equipment.asset_no}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* 下部分 - 案場詳細資料/统计图表 (固定高度) */}
          <Box sx={{ 
            height: '420px',  // 固定高度，与左侧下方区域一致
            flex: '0 0 auto',  // 不伸缩
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 2,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            fontSize: '0.7rem', // 將下部分的字體大小設置為14px
          }}>
            {showChart && chartEquipment ? (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={chartEquipment.asset_no} 
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        ml: 1,
                        height: '24px',
                        '& .MuiChip-label': {
                          px: 1,
                          fontSize: '0.85rem'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>風機</Typography>
                      <Switch
                        checked={powerType === 'pac'}
                        onChange={(e) => setPowerType(e.target.checked ? 'pac' : 'eqp')}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>併網</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: '200px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '8px',
                        padding: '0 8px',
                        marginRight: '10px'
                      }}>
                        <Slider
                          value={sliderValue}
                          onChange={handleSliderChange}
                          step={null}
                          marks={TIME_MARKS}
                          sx={{
                            '& .MuiSlider-markLabel': {
                              fontSize: '10px',
                              transform: 'translateY(-10px)'
                            },
                            padding: '8px 0'
                          }}
                        />
                      </Box>
                      <IconButton size="small" onClick={handleRefreshChart}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ height: '300px', width: '100%', position: 'relative' }}>
                  <WindPowerChart 
                    deviceId={chartEquipment.equip_id}
                    periodType={selectedPeriod}
                    updateFrequency={TIME_MARKS.find(m => m.periodType === selectedPeriod)?.interval || 5}
                    refreshFlag={refreshFlag}
                    powerType={powerType}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="body1" color="text.secondary">
                  點擊設備並選擇「查看統計圖表」來顯示數據
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* 選單 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedSiteId)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('site.management.actions.edit')} />
        </MenuItem>
        <MenuItem onClick={() => handleEquipmentList(selectedSiteId)}>
          <ListItemIcon>
            <BuildIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('site.management.actions.equipment')} />
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedSiteId)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={t('site.management.actions.delete')} />
        </MenuItem>
      </Menu>

      {/* 添加刪除確認對話框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            確定要刪除案場 "{siteToDelete?.name}" 嗎？此操作無法撤銷。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            確認刪除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 新增設備對話框 */}
      <Dialog 
        open={equipmentDialogOpen}
        onClose={() => setEquipmentDialogOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>新增設備</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, my: 2 }}>
              <Grid container spacing={2}>
                {/* 設備型號 - 改為Select */}
                <Grid item xs={12}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="設備型號"
                    name="model_no"
                    value={formData.model_no}
                    onChange={handleChange}
                  >
                    {equipmentTypes.length > 0 ? (
                      equipmentTypes.map((type, index) => (
                        <MenuItem key={index} value={type}>
                          {type}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        加載設備型號中...
                      </MenuItem>
                    )}
                  </TextField>
                </Grid>
                
                {/* 設備名稱 */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="設備名稱"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                
                {/* 設備原始ID */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="設備原始ID"
                    name="equip_id"
                    value={formData.equip_id}
                    onChange={handleChange}
                  />
                </Grid>
                
                {/* 資產編號 */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="資產編號"
                    name="asset_no"
                    value={formData.asset_no}
                    onChange={handleChange}
                  />
                </Grid>
                
                {/* 採購日期 */}
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="採購日期"
                    value={formData.purchase_date}
                    onChange={(date) => handleDateChange('purchase_date', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                
                {/* 商轉日期 */}
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="商轉日期"
                    value={formData.operat_date}
                    onChange={(date) => handleDateChange('operat_date', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                
                {/* 區位坐標 */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="區位坐標"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </Grid>
                
                {/* 備援設備 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="備援設備"
                    name="backup"
                    value={formData.backup}
                    onChange={handleChange}
                  >
                    <MenuItem value="n">否</MenuItem>
                    <MenuItem value="y">是</MenuItem>
                  </TextField>
                </Grid>
                
                {/* 運行狀態 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="運行狀態"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <MenuItem value="installing">安裝調試</MenuItem>
                    <MenuItem value="running">運轉中</MenuItem>
                    <MenuItem value="maintenance">維修</MenuItem>
                    <MenuItem value="exception">警告</MenuItem>
                    <MenuItem value="trouble">故障</MenuItem>
                  </TextField>
                </Grid>
                
                {/* 備註 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="備註"
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEquipmentDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.model_no || !formData.name || !formData.asset_no || !formData.location}
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>

      {/* 在對話框中添加錯誤提示顯示 */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* 設備浮動菜單 */}
      <Menu
        anchorEl={equipmentAnchorEl}
        open={Boolean(equipmentAnchorEl)}
        onClose={handleEquipmentMenuClose}
      >
        <MenuItem onClick={handleViewMonitoring}>
          <ListItemIcon>
            <AirIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="查看即時監控" />
        </MenuItem>
        <MenuItem onClick={handleViewStatistics}>
          <ListItemIcon>
            <ShowChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="查看統計圖表" />
        </MenuItem>
      </Menu>

      {/* 統計圖表區域 */}
      <Box sx={{ 
        height: 'calc(100% - 48px)',
        bgcolor: 'background.paper',
        borderRadius: '0 0 4px 4px',
        p: 2,
        overflow: 'auto'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 1
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
            <DatePicker
              label="選擇日期"
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              slotProps={{ 
                textField: { 
                  size: 'small'
                }
              }}
            />
          </LocalizationProvider>
        </Box>

      </Box>
    </PageContainer>
  );
}

// 修改 DetailItem 组件字体大小
const DetailItem = ({ label, value }) => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'space-between',
    gap: 1,
    fontSize: '0.75rem',
    lineHeight: 1.6,
    '&:not(:last-child)': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      pb: 0.5
    }
  }}>
    <Typography
      variant="body2"
      sx={{
        fontSize: 'inherit',
        color: 'text.secondary',
        flex: '0 0 45%',
        textAlign: 'right',
        pr: 1,
        '&::after': {
          content: '"："',
          marginLeft: '0.2em'
        }
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontSize: 'inherit',
        color: 'text.primary',
        flex: '1 1 55%',
        textAlign: 'left',
        pl: 1
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default SiteManagement; 