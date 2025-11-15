import React from 'react';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  PowerSettingsNew as PowerIcon,
  Analytics as AnalyticsIcon,
  Co2 as Co2Icon,
  Factory as FactoryIcon,
  Speed as SpeedIcon,
  ListAlt as ListAltIcon,
  Calculate as CalculateIcon,
  Engineering as EngineeringIcon,
  History as HistoryIcon,
  VerifiedUser as VerifiedUserIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  Settings as SystemSettingsIcon,
} from '@mui/icons-material';

export const menuItems = [
  {
    id: 'dashboard',
    text: '儀表板',
    icon: <DashboardIcon />,
    path: '/app/dashboard',
    children: [
      { id: 'all-plants', text: '全區電廠狀態', icon: <FactoryIcon />, path: '/app/dashboard/all-plants' },
      { id: 'area-plants', text: '分區電廠狀態', icon: <PowerIcon />, path: '/app/dashboard/area-plants' },
      { id: 'equipment-status', text: '發電設備狀態', icon: <SpeedIcon />, path: '/app/dashboard/equipment-status' }
    ]
  },
  {
    id: 'analysis',
    text: '數據分析',
    icon: <AssessmentIcon />,
    children: [
      { id: 'operation-analysis', text: '電廠營運分析', icon: <AnalyticsIcon />, path: '/app/analysis/operation' },
      { id: 'carbon-analysis', text: '電廠碳排指數分析', icon: <Co2Icon />, path: '/app/analysis/carbon' }
    ]
  },
  {
    id: 'site-management',
    text: '案場管理',
    icon: <BusinessIcon />,
    path: '/app/site-management',
    children: [
      { id: 'site-list', text: '案場清單', icon: <ListAltIcon />, path: '/app/site-management/list' },
      { id: 'site-settings', text: '基本資料設置', icon: <SystemSettingsIcon />, path: '/app/site-management/settings' },
      { id: 'carbon-calculation', text: '碳指標計算', icon: <CalculateIcon />, path: '/app/site-management/carbon' }
    ]
  },
  {
    id: 'equipment-management',
    text: '設備管理',
    icon: <EngineeringIcon />,
    path: '/app/equipment-management',
    children: [
      { id: 'equipment-list', text: '設備清單', icon: <ListAltIcon />, path: '/app/equipment-management/list' },
      { id: 'equipment-info', text: '設備基本資料維護', icon: <DescriptionIcon />, path: '/app/equipment-management/settings' },
      { id: 'maintenance-history', text: '設備維修履歷', icon: <BuildIcon />, path: '/app/equipment-management/maintenance' },
      { id: 'operation-history', text: '設備運轉履歷', icon: <HistoryIcon />, path: '/app/equipment-management/operation' },
      { id: 'depreciation-history', text: '設備折舊履歷', icon: <HistoryIcon />, path: '/app/equipment-management/depreciation' },
      { id: 'equipment-certification', text: '設備認證', icon: <VerifiedUserIcon />, path: '/app/equipment-management/certification' }
    ]
  },
  {
    id: 'system-management',
    text: '系統管理',
    icon: <AdminIcon />,
    path: '/app/system',
    children: [
      { id: 'admin-settings', text: '系統管理員設置', icon: <AdminIcon />, path: '/app/admin-settings' },
      { id: 'system-settings', text: '系統基本資料設置', icon: <SystemSettingsIcon />, path: '/app/system-settings' },
      { id: 'auth-management', text: '系統授權管理', icon: <SecurityIcon />, path: '/app/system/auth-management' },
      { id: 'account-management', text: '賬號管理', icon: <AdminIcon />, path: '/app/account-management' },
      { id: 'role-list', text: '系統角色清單', icon: <AdminIcon />, path: '/app/role-list' },
      { id: 'role-feature-matrix', text: '角色與功能矩陣', icon: <AdminIcon />, path: '/app/role-feature-matrix' }
    ]
  }
]; 