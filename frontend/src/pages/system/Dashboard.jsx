import { Grid, Box, Paper, FormControl, Select, MenuItem, InputLabel, Button } from '@mui/material';
import CardComp from '../../../components/CardComp';

function Dashboard() {
  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 88px)', // 减去顶部导航栏高度
        p: 2,
        display: 'flex',
        gap: 2,
        overflow: 'hidden' // 防止出现滚动条
      }}
    >
      {/* 左侧筛选区域 */}
      <Paper 
        sx={{ 
          width: 240,
          p: 2,
          overflow: 'auto' // 内容过多时可滚动
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 年份选择 */}
          <FormControl fullWidth size="small">
            <InputLabel>年份</InputLabel>
            <Select defaultValue="2023" label="年份">
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
            </Select>
          </FormControl>

          {/* 月份选择 */}
          <FormControl fullWidth size="small">
            <InputLabel>月份</InputLabel>
            <Select defaultValue="all" label="月份">
              <MenuItem value="all">全部</MenuItem>
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{i + 1}月</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 优先级 */}
          <FormControl fullWidth size="small">
            <InputLabel>优先级</InputLabel>
            <Select defaultValue="all" label="优先级">
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="high">高</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="low">低</MenuItem>
            </Select>
          </FormControl>

          {/* 严重程度 */}
          <FormControl fullWidth size="small">
            <InputLabel>严重程度</InputLabel>
            <Select defaultValue="all" label="严重程度">
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="critical">严重</MenuItem>
              <MenuItem value="major">重要</MenuItem>
              <MenuItem value="minor">次要</MenuItem>
            </Select>
          </FormControl>

          {/* 工作类型 */}
          <FormControl fullWidth size="small">
            <InputLabel>工作类型</InputLabel>
            <Select defaultValue="all" label="工作类型">
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="incident">故障</MenuItem>
              <MenuItem value="request">请求</MenuItem>
            </Select>
          </FormControl>

          {/* 请求类别 */}
          <FormControl fullWidth size="small">
            <InputLabel>请求类别</InputLabel>
            <Select defaultValue="all" label="请求类别">
              <MenuItem value="all">全部</MenuItem>
            </Select>
          </FormControl>

          {/* 重置按钮 */}
          <Button variant="contained" color="primary" fullWidth>
            重置筛选
          </Button>
        </Box>
      </Paper>

      {/* 右侧主要内容区域 */}
      <Box 
        sx={{ 
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 顶部统计卡片 */}
        <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
          <Grid item xs={3}>
            <CardComp
              title="工单创建"
              width="100%"
              height={100}
              contentText="26,935"
              headerWidth="50%"
              headerHeight={35}
            />
          </Grid>
          <Grid item xs={3}>
            <CardComp
              title="工单关闭"
              width="100%"
              height={100}
              contentText="26,860"
              headerWidth="50%"
              headerHeight={35}
            />
          </Grid>
          <Grid item xs={3}>
            <CardComp
              title="关闭率"
              width="100%"
              height={100}
              contentText="99.72%"
              headerWidth="50%"
              headerHeight={35}
            />
          </Grid>
          <Grid item xs={3}>
            <CardComp
              title="SLA达标"
              width="100%"
              height={100}
              contentText="19,539"
              headerWidth="50%"
              headerHeight={35}
            />
          </Grid>
        </Grid>

        {/* 中部图表卡片 */}
        <Grid container spacing={2} sx={{ mb: 2, flex: '1 0 auto' }}>
          <Grid item xs={4}>
            <CardComp
              title="工单优先级"
              width="100%"
              height="100%"
              contentText="优先级分布图表"
              headerWidth="50%"
              headerHeight={35}
            />
          </Grid>
          <Grid item xs={4}>
            <CardComp
              title="工单类别"
              width="100%"
              height="100%"
              contentText="类别分布图表"
              headerWidth="50%"
              headerHeight={35}
            />
          </Grid>
          <Grid item xs={4}>
            <CardComp
              title="工单严重程度"
              width="100%"
              height="100%"
              contentText="严重程度分布图表"
              headerWidth="50%"
              headerHeight={35}
            />
          </Grid>
        </Grid>

        {/* 底部图表卡片 */}
        <Grid container spacing={2} sx={{ flex: '1 0 auto' }}>
          <Grid item xs={8}>
            <CardComp
              title="工单趋势"
              width="100%"
              height="100%"
              contentText="工单趋势图表"
              headerWidth="30%"
              headerHeight={35}
            />
          </Grid>
          <Grid item xs={4}>
            <CardComp
              title="满意度评分"
              width="100%"
              height="100%"
              contentText="满意度评分统计"
              headerWidth="50%"
              headerHeight={35}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;