export const equipments = {
  // 案場ID作為key
  "site1": [
    {
      id: "equip1",
      model_no: "WT-2000",
      asset_no: "WTG-001",
      purchase_date: "2023-01-15",
      operat_date: "2023-03-01",
      location: "A1",
      backup: "n",
      status: "running",
      remark: "正常運轉中"
    },
    {
      id: "equip2",
      model_no: "WT-2000",
      asset_no: "WTG-002",
      purchase_date: "2023-01-15",
      operat_date: "2023-03-01",
      location: "A2",
      backup: "n",
      status: "warning",
      remark: "效能略低於預期"
    }
  ],
  "site2": [
    {
      id: "equip3",
      model_no: "PV-500",
      asset_no: "PV-001",
      purchase_date: "2023-02-20",
      operat_date: "2023-04-01",
      location: "B1",
      backup: "n",
      status: "installing",
      remark: "安裝調試階段"
    },
    {
      id: "equip4",
      model_no: "PV-500",
      asset_no: "PV-002",
      purchase_date: "2023-02-20",
      operat_date: "2023-04-01",
      location: "B2",
      backup: "y",
      status: "maintenance",
      remark: "定期維護中"
    }
  ]
}; 