import { useTranslation } from 'react-i18next';
import { MenuItem, Select } from '@mui/material';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleLanguageChange}
      size="small"
      sx={{ 
        color: 'white',
        '& .MuiSelect-icon': { color: 'white' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
      }}
    >
      <MenuItem value="zh-TW">中文</MenuItem>
      <MenuItem value="en-US">English</MenuItem>
    </Select>
  );
}

export default LanguageSelector; 