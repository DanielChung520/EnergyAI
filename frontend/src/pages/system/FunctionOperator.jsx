import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, FormControlLabel, RadioGroup, Radio, Box, InputAdornment, IconButton, Chip } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const FunctionOperator = ({ open, onClose, functionData, onSave, existingFunctions }) => {
  const [formData, setFormData] = useState({
    no: '',
    module: '',
    item_cn: '',
    item_en: '',
    type: 'f', // 默認為功能
    level: 1,
    icon: '',
    route: '',
  });

  const [errors, setErrors] = useState({}); // 用於存儲錯誤信息

  useEffect(() => {
    if (functionData) {
      setFormData(functionData); // 當編輯時，設置原始資料
    } else {
      setFormData({
        no: '',
        module: '',
        item_cn: '',
        item_en: '',
        type: 'f', // 默認為功能
        level: 1,
        icon: '',
        route: '',
      });
    }
  }, [functionData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateForm({ ...formData, [name]: value }); // 每次輸入時進行驗證
  };

  const handleTypeChange = (e) => {
    setFormData({ ...formData, type: e.target.value }); // 切換功能類型
  };

  const handleLevelChange = (increment) => {
    setFormData((prevData) => ({
      ...prevData,
      level: Math.max(1, prevData.level + increment), // 確保層級不小於1
    }));
  };

  const validateForm = (data) => {
    const newErrors = {};
    const existingNos = existingFunctions.map(func => func.no.toString());
    const existingNames = existingFunctions.filter(func => func.module === data.module);

    // 檢查編號是否重複
    if (existingNos.includes(data.no.toString()) && (!functionData || functionData.no !== data.no)) {
      newErrors.no = '編號不能重複';
    }

    // 檢查同模組中中英文名稱是否相同
    if (existingNames.some(func => func.item_cn === data.item_cn && func.item_en === data.item_en && func.uid !== data.uid)) {
      newErrors.names = '同模組中中文和英文名稱不能相同';
    }

    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    if (Object.keys(errors).length === 0) {
      try {
        const isEdit = !!functionData;
        const url = isEdit 
          ? `/api/system/function/${functionData.uid}` 
          : '/api/system/function';

        const response = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${isEdit ? 'update' : 'create'} function`);
        }

        const result = await response.json();

        // 獲取完整的功能列表
        const functionResponse = await fetch('/api/system/function');
        if (!functionResponse.ok) {
          throw new Error('Failed to fetch updated function list');
        }

        const updatedFunctionList = await functionResponse.json();
        
        // 更新 LocalStorage 中的完整列表
        if (Array.isArray(updatedFunctionList)) {
          localStorage.setItem('functionList', JSON.stringify(updatedFunctionList));
          console.log('LocalStorage updated with full function list');
        }

        onSave(result); // 通知 FunctionList 更新
        onClose(); // 關閉對話框
      } catch (error) {
        console.error('Error processing function:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{functionData ? '編輯功能' : '新增功能'}</DialogTitle>
      <DialogContent>
        <TextField
          label="編號"
          name="no"
          value={formData.no}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.no}
          helperText={errors.no}
        />
        <TextField
          label="模組"
          name="module"
          value={formData.module}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="名稱-中文"
          name="item_cn"
          value={formData.item_cn}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="名稱-英文"
          name="item_en"
          value={formData.item_en}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <RadioGroup
          row
          name="type"
          value={formData.type}
          onChange={handleTypeChange}
        >
          <FormControlLabel value="f" control={<Radio />} label="功能 (f)" />
          <FormControlLabel value="sf" control={<Radio />} label="附屬功能 (sf)" />
        </RadioGroup>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <TextField
            label="功能層級"
            name="level"
            value={formData.level}
            onChange={handleChange}
            margin="normal"
            sx={{ width: '50%', mx: 1 }}
            inputProps={{ readOnly: true }} // 使其為只讀
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleLevelChange(-1)}>
                    <ArrowDropDownIcon fontSize="large" />
                  </IconButton>
                  <IconButton onClick={() => handleLevelChange(1)}>
                    <ArrowDropUpIcon fontSize="large" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <TextField
            label="圖標"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            href="https://fonts.google.com/icons"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ ml: 1 }} // 添加左邊距以使其與文本框靠近
          >
            搜尋
          </Button>
        </Box>
        <TextField
          label="路由"
          name="route"
          value={formData.route}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {errors.names && <Typography color="error">{errors.names}</Typography>} {/* 顯示名稱錯誤 */}
      </DialogContent>
      <DialogActions>
        <Chip label="取消" onClick={onClose} color="secondary" sx={{ cursor: 'pointer', mr: 1 }} />
        <Chip label="保存" onClick={handleSubmit} color="primary" sx={{ cursor: 'pointer' }} />
      </DialogActions>
    </Dialog>
  );
};

export default FunctionOperator;
