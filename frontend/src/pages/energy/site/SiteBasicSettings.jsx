import { 
  Box, 
  TextField, 
  Grid, 
  Typography, 
  MenuItem, 
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { useState, useEffect } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import zhTW from 'date-fns/locale/zh-TW';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDynamicRoute } from '../../../components/DynamicRoute';
import GeoInfo from '../../../components/GeoInfo';

// 案場類型選項
const siteTypes = [
  { value: 'wind', label: '風能' },
  { value: 'solar', label: '太陽能' },
  { value: 'hydro', label: '水力' },
  { value: 'geothermal', label: '地熱' },
  { value: 'ocean', label: '海洋' },
  { value: 'biomass-pyrolysis', label: '生質能-熱解' },
  { value: 'biomass-biogas', label: '生質能-沼氣' },
  { value: 'biomass-combustion', label: '生質能-燃燒' },
  { value: 'other', label: '其他' }
];

function SiteBasicSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isEdit = location.state?.isEdit;  // 獲取編輯模式標記
  const siteId = location.state?.siteId;  // 獲取站點 ID
  const { navigateTo: navigateToSiteManagement } = useDynamicRoute('A.1.2'); // 使用正確的功能編號

  // 添加日誌輸出
  console.log('SiteBasicSettings - Mode:', isEdit ? 'Edit' : 'Add');
  console.log('SiteBasicSettings - siteId:', siteId);
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    country: '',
    province: '',
    address: '',
    latitude: '',
    longitude: '',
    siteType: '',
    capacity: '',
    capacityParams: '',
    approvalNumber: '',
    approvalDate: null,
    area: '',
    constructionDate: null,
    operationDate: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 修改 useEffect，添加更多日誌輸出
  useEffect(() => {
    const fetchSiteData = async () => {
      if (!siteId) {
        console.log('No siteId provided');
        return;
      }

      try {
        console.log('Fetching site data for siteId:', siteId);
        const baseUrl = import.meta.env.VITE_API_URL;
        const apiPath = import.meta.env.VITE_SITE_API_URL;
        const url = `${baseUrl}${apiPath}/${siteId}`;  // 使用一致的 URL 格式
        console.log('Fetch URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const siteData = await response.json();
        console.log('Fetched site data:', siteData);

        // 更新表單數據
        setFormData({
          name: siteData.name || '',
          company: siteData.company || '',
          country: siteData.country || '',
          province: siteData.province || '',
          address: siteData.address || '',
          latitude: siteData.latitude || '',
          longitude: siteData.longitude || '',
          siteType: siteData.site_type || '',
          capacity: siteData.capacity || '',
          capacityParams: siteData.capacity_params || '',
          approvalNumber: siteData.approval_number || '',
          approvalDate: siteData.approval_date ? new Date(siteData.approval_date) : null,
          area: siteData.area || '',
          constructionDate: siteData.construction_date ? new Date(siteData.construction_date) : null,
          operationDate: siteData.operation_date ? new Date(siteData.operation_date) : null
        });
      } catch (error) {
        console.error('Error fetching site data:', error);
      }
    };

    fetchSiteData();
  }, [siteId]); // 依賴於 siteId

  // 添加另一個 useEffect 來監視 formData 的變化
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理地址轉換
  const handleAddressConvert = async () => {
    if (!formData.country || !formData.province || !formData.address) {
      alert('請先填寫完整的地址信息');
      return;
    }

    // 準備多種地址格式，從最簡單到最詳細
    const addressFormats = [
      `${formData.province}`,
      `${formData.province}${formData.address.split('號')[0]}`,
      `${formData.country}${formData.province}${formData.address}`.trim()
    ];

    console.log('Trying address formats:', addressFormats);
    
    for (const address of addressFormats) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SITE_API_URL}/geocode?address=${encodeURIComponent(address)}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        console.log(`Geocoding response for ${address}:`, data);

        if (Array.isArray(data) && data.length > 0) {
          const { lat, lon } = data[0];
          console.log('Found coordinates:', { lat, lon });
          
          // 直接更新 formData 的緯度和經度
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon
          }));

          // 更新輸入欄位值
          const latitudeInput = document.querySelector('input[name="latitude"]');
          const longitudeInput = document.querySelector('input[name="longitude"]');
          
          if (latitudeInput && longitudeInput) {
            latitudeInput.value = lat;
            longitudeInput.value = lon;
            
            // 觸發 change 事件
            latitudeInput.dispatchEvent(new Event('change', { bubbles: true }));
            longitudeInput.dispatchEvent(new Event('change', { bubbles: true }));
          }

          // 找到座標後就退出
          return;
        }
      } catch (error) {
        console.error(`Error with address format ${address}:`, error);
        continue;
      }
    }

    // 如果所有格式都失敗，才顯示錯誤
    alert(`無法獲取經緯度座標，請檢查地址是否正確：\n\n${formData.address}`);
  };

  // 在 handleSave 函數開始添加數據驗證
  const validateFormData = () => {
    if (!formData.name || !formData.company) {
      throw new Error('案場名稱和公司為必填項');
    }
    if (!formData.siteType) {
      throw new Error('請選擇案場類型');
    }
    if (formData.capacity && isNaN(parseFloat(formData.capacity))) {
      throw new Error('裝機容量必須為數字');
    }
    if (formData.area && isNaN(parseFloat(formData.area))) {
      throw new Error('佔地面積必須為數字');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 添加數據驗證
      validateFormData();
      
      const baseUrl = import.meta.env.VITE_API_URL;
      
      // 根據 isEdit 決定 URL 和方法
      const url = isEdit 
        ? `${baseUrl}/api/sites/${siteId}`  // 編輯現有案場
        : `${baseUrl}/api/sites`;           // 新增案場
      
      const method = isEdit ? 'PUT' : 'POST';

      // 轉換數據格式為後端期望的格式，與 Site 模型對應
      const submitData = {
        name: formData.name,                // 使用 name 而不是 site_name
        company: formData.company,          // 使用 company 而不是 company_name
        country: formData.country,
        province: formData.province,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        site_type: formData.siteType,
        capacity: parseFloat(formData.capacity) || 0,
        capacity_params: formData.capacityParams,
        approval_number: formData.approvalNumber,
        approval_date: formData.approvalDate ? formData.approvalDate.toISOString().split('T')[0] : null,
        area: parseFloat(formData.area) || 0,
        construction_date: formData.constructionDate ? formData.constructionDate.toISOString().split('T')[0] : null,
        operation_date: formData.operationDate ? formData.operationDate.toISOString().split('T')[0] : null
      };
      
      console.log('Saving site with:', {
        mode: isEdit ? 'Edit' : 'Add',
        url,
        method,
        data: submitData
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // 成功後導航回列表頁面
      navigateToSiteManagement();
      
    } catch (error) {
      console.error('保存失敗:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto', my: 5 }}>
      <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigateToSiteManagement()}
        >
          {t('site.management.actions.back', '返回案場列表')}
        </Button>
        <Typography variant="h6">
          {isEdit ? t('site.basic.title.edit', '編輯案場') : t('site.basic.title.add', '新增案場')}
        </Typography>
      </Box>
      
      <Box component="form" onSubmit={handleSave}>
        <Grid container spacing={3}>
          {/* 基本信息 */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('site.basic.fields.name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('site.basic.fields.company')}
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* 地理位置信息 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {t('site.basic.fields.location.title')}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('site.basic.fields.location.country')}
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="省市"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="詳細地址"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <Button
                variant="contained"
                onClick={handleAddressConvert}
                sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
              >
                轉換座標
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="緯度"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              type="number"
              inputProps={{ step: "any" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="經度"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              type="number"
              inputProps={{ step: "any" }}
            />
          </Grid>

          {/* 案場類型 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>案場類型</InputLabel>
              <Select
                name="siteType"
                value={formData.siteType}
                onChange={handleChange}
                label="案場類型"
              >
                {siteTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {formData.siteType === 'other' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="其他類型說明"
                name="otherSiteType"
                value={formData.otherSiteType}
                onChange={handleChange}
                required
              />
            </Grid>
          )}

          {/* 容量信息 */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="總裝機容量 (MW)"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              type="number"
              inputProps={{ step: "0.01" }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="容量參數"
              name="capacityParams"
              value={formData.capacityParams}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          {/* 能源備案信息 */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="能源備案編號"
              name="approvalNumber"
              value={formData.approvalNumber}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
              <DatePicker
                label="核准日期"
                value={formData.approvalDate}
                onChange={(newValue) => handleDateChange('approvalDate', newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* 其他信息 */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="總佔地面積 (平方米)"
              name="area"
              value={formData.area}
              onChange={handleChange}
              type="number"
              inputProps={{ step: "0.01" }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
              <DatePicker
                label="建設日期"
                value={formData.constructionDate}
                onChange={(newValue) => handleDateChange('constructionDate', newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
              <DatePicker
                label="商轉日期"
                value={formData.operationDate}
                onChange={(newValue) => handleDateChange('operationDate', newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        {/* 提交按鈕 */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigateToSiteManagement()}
            disabled={loading}
          >
            {t('common.actions.cancel', '取消')}
          </Button>
          <Button 
            variant="contained" 
            type="submit"
            disabled={loading}
          >
            {loading 
              ? t('common.actions.saving', '儲存中...') 
              : (isEdit 
                  ? t('common.actions.update', '更新') 
                  : t('common.actions.save', '儲存')
                )
            }
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default SiteBasicSettings; 