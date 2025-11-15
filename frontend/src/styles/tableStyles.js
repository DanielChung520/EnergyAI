// 表格樣式配置
export const tableStyles = {
  // 表格容器樣式
  tableContainer: {
    borderRadius: 1,
    maxHeight: 'calc(100vh - 200px)',
    overflow: 'auto',
    '& .MuiTableCell-root': {
      borderColor: (theme) => theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)'
    }
  },

  // 表頭樣式
  tableHeader: (theme) => ({
    '& .MuiTableCell-head': {
      backgroundColor: theme.palette.mode === 'dark'
        ? theme.palette.warning.dark  // 深色模式使用黃色
        : theme.palette.primary.light,
      color: theme.palette.mode === 'dark'
        ? theme.palette.common.black  // 在黃色背景上使用黑色文字以提高可讀性
        : theme.palette.common.white,
      fontWeight: 600,
      fontSize: '0.95rem'
    }
  }),

  // 表格行樣式
  tableRow: (theme) => ({
    transition: 'background-color 0.2s ease',
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.02)'
    },
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1) !important'
        : 'rgba(0, 0, 0, 0.08) !important',
      cursor: 'pointer',
      '& .MuiTableCell-root': {
        color: theme.palette.mode === 'dark'
          ? theme.palette.warning.light  // 懸停時的文字顏色也改為黃色系
          : theme.palette.primary.dark
      }
    }
  }),

  // 網格懸停效果
  gridHover: {
    // 表頭列懸停效果
    headerCell: (theme, isHovered) => ({
      backgroundColor: isHovered
        ? theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)'
        : 'inherit'
    }),
    // 數據行懸停效果
    row: (theme, isHovered) => ({
      backgroundColor: isHovered
        ? theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.02)'
        : 'inherit'
    }),
    // 單元格懸停效果
    cell: (theme, { isRowHovered, isColHovered }) => ({
      backgroundColor: (isRowHovered || isColHovered)
        ? theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.04)'
        : 'inherit',
      transition: 'background-color 0.2s'
    })
  }
}; 