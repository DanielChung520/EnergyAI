import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, Typography } from '@mui/material';
import Waves from '@mui/icons-material/Waves';
import Air from '@mui/icons-material/Air';
import LensBlur from '@mui/icons-material/LensBlur';
import WaterDrop from '@mui/icons-material/WaterDrop';
import SolarPower from '@mui/icons-material/SolarPower';
import { useDynamicRoute } from '../../../components/DynamicRoute';

const SiteCompTable = () => {
    const navigate = useNavigate();
    const { navigateTo: navigateToEquipmentList } = useDynamicRoute('A.1.2.1'); // 移到组件内部

    // 获取当前年月的格式化字符串 (yyyy/mm)
    const getCurrentYearMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}/${month}`;
    };

    const [sites, setSites] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());

    useEffect(() => {
        const storedSites = JSON.parse(localStorage.getItem('sites')) || [];
        setSites(storedSites);
    }, []);

    const getIcon = (siteType) => {
        console.log(`Getting icon for siteType: ${siteType}`); // 调试信息
        switch (siteType) {
            case '水力':
                return <Waves />;
            case 'wind':
                return <Air />;
            case 'geothermal':
                return <LensBlur />;
            case 'biomass':
                return <WaterDrop />;
            case 'solar':
                return <SolarPower />;
            default:
                console.warn(`No icon found for siteType: ${siteType}`); // 警告信息
                return null;
        }
    };

    // 生成最近两年的月份
    const generateMonths = () => {
        const months = [];
        const currentDate = new Date();
        for (let year = currentDate.getFullYear(); year >= currentDate.getFullYear() - 1; year--) {
            for (let month = 0; month < 12; month++) {
                const monthString = `${year}/${String(month + 1).padStart(2, '0')}`; // 格式化为 yyyy/mm
                months.push(monthString);
            }
        }
        return months;
    };

    // 修改双击处理函数
    const handleDoubleClick = (site) => {
        navigateToEquipmentList({ 
            state: { 
                siteId: site.id,
                siteName: site.name,
                siteType: site.site_type
            } 
        });
    };

    return (
        <Box sx={{ position: 'absolute', top: 70, left: 25, zIndex: 1 ,boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'}}>
            <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                displayEmpty
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                    width: '100%',
                    '& .MuiSelect-icon': { color: 'white' },
                    mb: 0.2,
                    borderRadius: '6px 6px 0 0',
                    '& .MuiPaper-root': {
                        bgcolor: 'white'
                    }
                }}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            bgcolor: 'white',
                            '& .MuiMenuItem-root': {
                                color: 'black',
                                bgcolor: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                                },
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.main'
                                    }
                                }
                            }
                        }
                    }
                }}
            >
                {generateMonths().map((month) => (
                    <MenuItem
                        key={month}
                        value={month}
                    >
                        {month}
                    </MenuItem>
                ))}
            </Select>
            <TableContainer
                sx={{
                    maxHeight: 500,
                    borderBottomLeftRadius: '6px',
                    borderBottomRightRadius: '6px',
                    overflow: 'auto',
                    '& .MuiTable-root': {
                        borderBottomLeftRadius: '6px',
                        borderBottomRightRadius: '6px'
                    }
                }}
            >
                <Table sx={{
                    backgroundColor: 'white',
                    borderCollapse: 'separate',
                    borderSpacing: 0
                }}>
                    <TableHead sx={{ bgcolor: 'primary.main', padding: '6px' }}>
                        <TableRow>
                            <TableCell key="type" sx={{ color: 'white', fontSize: '0.875rem', padding: '6px' }}>类型</TableCell>
                            <TableCell key="name-province" sx={{ color: 'white', fontSize: '0.875rem', padding: '6px' }}>名称 / 省份</TableCell>
                            <TableCell key="output" sx={{ color: 'white', fontSize: '0.875rem', padding: '6px' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem' }}>本月产出</Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>(Mkw/h)</Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sites.map((site) => (
                            <TableRow 
                                key={site.id} 
                                onDoubleClick={() => handleDoubleClick(site)}
                                sx={{ 
                                    height: '32px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)', // 鼠标悬停时的背景色
                                        cursor: 'pointer' // 鼠标悬停时显示指针
                                    }
                                }}
                            >
                                <TableCell key={`icon-${site.id}`} sx={{ color: 'black', fontSize: '0.875rem', padding: '6px' }}>
                                    {getIcon(site.site_type)}
                                </TableCell>
                                <TableCell key={`info-${site.id}`} sx={{ color: 'black', fontSize: '0.875rem', padding: '6px' }}>
                                    <Box key={`box-${site.id}`}>
                                        <Typography key={`name-${site.id}`} sx={{ color: 'black', fontSize: '0.875rem' }}>
                                            {site.name}
                                        </Typography>
                                        <Typography key={`province-${site.id}`} variant="caption" sx={{ color: 'black', fontWeight: 'light' }}>
                                            {site.province}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell key={`output-${site.id}`} sx={{ color: 'black', fontSize: '0.875rem', padding: '6px', textAlign: 'right' }}>
                                    {Math.floor(Math.random() * 100)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default SiteCompTable;
