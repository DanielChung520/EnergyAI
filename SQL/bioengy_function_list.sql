CREATE DATABASE  IF NOT EXISTS `bioengy` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bioengy`;
-- MySQL dump 10.13  Distrib 8.0.25, for macos11 (x86_64)
--
-- Host: localhost    Database: bioengy
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `function_list`
--

DROP TABLE IF EXISTS `function_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `function_list` (
  `uid` varchar(50) NOT NULL,
  `no` varchar(45) DEFAULT NULL,
  `module` varchar(255) DEFAULT NULL,
  `item_cn` varchar(255) DEFAULT NULL,
  `item_en` varchar(255) DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  `level` int DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `route` varchar(128) DEFAULT NULL,
  `create_at` varchar(45) DEFAULT NULL,
  `update_at` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `function_list`
--

LOCK TABLES `function_list` WRITE;
/*!40000 ALTER TABLE `function_list` DISABLE KEYS */;
INSERT INTO `function_list` VALUES ('08988557-fae0-4af8-abdd-a839b7a0e0a2','B.2.1','企業節能運營平台','每日耗能統計',NULL,'f',2,'EventAvailable',NULL,NULL,NULL),('0c47b472-efcb-4409-afa0-9949e03e4f72','A.2.3.1','能源管理營運平台','光伏設備詳細規格','','sf',3,'','energy/equipment/EquipmentSolarDetail',NULL,NULL),('14047cdd-8da0-4aa5-b68b-9c732b7cf6be','A.2.3.0','能源管理營運平台','設備基本資料維護','','sf',3,'','energy/equipment/EquipmentBasicSettings',NULL,NULL),('181da4d8-365a-4ffc-8c7d-93476c00e958','B.3.3','企業節能運營平台','碳額度統計分析',NULL,'f',2,'WaterfallChart',NULL,NULL,NULL),('1c3dffd5-6e54-4494-8721-f798d2eb2a72','B.3','企業節能運營平台','碳盤查與報告',NULL,'f',1,'playlist_add_check_circle',NULL,NULL,NULL),('2b5ae714-2bd3-4b7c-80f5-9a5f0ad3eccd','B.4','企業節能運營平台','基本資料維護',NULL,'f',1,'Lan',NULL,NULL,NULL),('42a5b20d-01c0-480d-9ce7-626826a516ad','A.1.2','能源管理運營平台','案場數據分析','Power Station Analysis','f',2,'Analytics','energy/site/SiteManagement',NULL,NULL),('4c21c387-f1b7-43dd-bcbd-3ff69bf9bc22','B.1.2','企業節能運營平台','廠區大樓節能管理',NULL,'f',2,'CorporateFare',NULL,NULL,NULL),('4de5ab2d-67d7-4d6f-b58a-7678449bb6ab','B.3.5','企業節能運營平台','購買碳額',NULL,'f',2,'Co2',NULL,NULL,NULL),('50b4ec3b-8592-4d25-a09e-2abba0906e16','A.2.2','能源管理運營平台','案場基本資料',NULL,'f',2,'MapsHomeWork',NULL,NULL,NULL),('591abd70-e569-492d-9364-74fd0252a782','B.4.5','企業節能運營平台','電錶/感應器',NULL,'f',2,'Calculate',NULL,NULL,NULL),('637e436f-eea3-477f-90e9-eef4602829c9','B.2.4','企業節能運營平台','生產碳足跡',NULL,'f',2,'TravelExplore',NULL,NULL,NULL),('64e80ccc-addd-403c-ab06-08852626e686','A.2','能源管理運營平台','資料維護','Data Maintenance','f',1,'Dataset',NULL,NULL,NULL),('65e3b3fc-91d6-4fa6-b008-1953be7d36a3','X.1.1','公用模組','賬戶管理',NULL,'f',2,'Person','system/Accounts',NULL,NULL),('678e76a4-a91b-4dc1-ac4c-61e246dd38ac','B.2.3','企業節能運營平台','員工碳足跡',NULL,'f',2,'People',NULL,NULL,NULL),('685d5fda-8800-4012-8fbb-db9d6ad2710b','B.3.4','企業節能運營平台','綠電/綠憑證',NULL,'f',2,'SolarPower',NULL,NULL,NULL),('69a6c17a-6e59-4ef0-bbad-cad017d2065c','X.1','公用模組','系統設置',NULL,'f',1,'Settings',NULL,NULL,NULL),('6c2cb4a1-b78a-4112-b332-36d5f0fad111','B.2','企業節能運營平台','碳足跡數據管理',NULL,'f',1,'Co2',NULL,NULL,NULL),('6efa728a-453d-434d-98a6-0849ecfa439e','A.2.1','能源管理運營平台','地圖區域維護',NULL,'f',2,'Map','Maps/Region',NULL,NULL),('7c8e19a0-bf01-42a3-8167-3f3a21b61a74','B.1','企業節能運營平台','經營看板',NULL,'f',1,'Dashboard',NULL,NULL,NULL),('828b9c49-d6de-45eb-b63d-116e66d5d8d5','A.1.9','能源管理運營平台','台灣地圖','','f',2,'','Maps/TwMap',NULL,NULL),('925a943f-f9a1-45d6-8fc8-29f6b25c5294','A.1.1.1','能源管理運營平台','全區地圖組件','','sf',3,'','Maps/CompMap',NULL,NULL),('948ab9cf-7d18-4128-9764-d463977046d6','B.4.2','企業節能運營平台','設備器具能耗、碳足跡維護',NULL,'f',2,'HomeRepairService',NULL,NULL,NULL),('97e83579-9f09-49fc-8f8a-b0fce2911695','B.4.1','企業節能運營平台','廠區、組織架構',NULL,'f',2,'CorporateFare',NULL,NULL,NULL),('9a41373e-bf0f-483d-aa3f-4f7b26c763d0','C.1.1','能源碳資產服務平台','開發中',NULL,'f',1,'PausePresentation',NULL,NULL,NULL),('9d7ab3d8-5869-41a9-a05b-131d4f7cdfda','B.3.6','企業節能運營平台','其他減排專案',NULL,'f',2,'WindPower',NULL,NULL,NULL),('a3d68368-5510-43d4-8b39-51c19db0bf4b','A.2.3.2','能源管理營運平台','風力發電設備詳細規格','','sf',3,'Apps','energy/equipment/EquipmentWindDetail',NULL,NULL),('a752dc0b-b2b8-4778-9888-ead0d5193a38','X.1.6','公用模組','系統服務管理',NULL,'f',2,'MiscellaneousServices','system/FunctionOperator',NULL,NULL),('a77753a2-7752-4c50-9f63-15d0255a736e','B.2.6','企業節能運營平台','產品',NULL,'f',2,'Inventory',NULL,NULL,NULL),('b1f74c83-dc86-42f0-b5a8-0ad8d88019e7','B.2.2','企業節能運營平台','採購來料碳足跡',NULL,'f',2,'ShoppingCart',NULL,NULL,NULL),('b2fac2cc-3b97-4f67-82ab-372216d9cb09','A.1','能源管理運營平台','案場戰情看板','Dashboard','f',1,'Apps','energy/Dashboard',NULL,NULL),('b3a163a7-2402-49a0-88ba-27f1beff975e','B.3.1','企業節能運營平台','一般性碳盤查',NULL,'f',2,'Description',NULL,NULL,NULL),('b46006d9-340d-4134-b176-6f6001baf4b9','A.1.2.1','能源管理運營平台','案場監控管理','Power Station Monitoring','sf',3,'Engineering','energy/site/SiteEquipmentList',NULL,NULL),('bae6a741-0717-4a91-b8ed-b7e966b51ffc','B.4.3','企業節能運營平台','能源來源碳指標',NULL,'f',2,'DragIndicator',NULL,NULL,NULL),('c29e2554-71ac-4e48-a408-e3c80ac97727','A.1.1','能源管理運營平台','全區案場分佈','Power Work Station Area','f',2,'Public','Maps/GlobalMaps',NULL,NULL),('ce50310f-3408-44a3-ad7a-ff5de1ddf29f','B.1.3','企業節能運營平台','設備節能監控',NULL,'f',2,'Camera',NULL,NULL,NULL),('ce5c13ab-1aaf-4bfb-bf7d-b6e22c038a0a','B.1.4','企業節能運營平台','每日進料碳排監控',NULL,'f',2,'ProductionQuantityLimits',NULL,NULL,NULL),('d3663f4c-a0c9-46a6-91b9-cec395539e90','A.1.5','能源管理運營平台','電力調度','Power Dispatch','f',2,'EvStation',NULL,NULL,NULL),('d36c4a7d-5517-446c-b190-abbc01c4447c','A.1.2.2','能源管理運營平台','案場基本資料','Field Base Information','sf',3,'Engineering','energy/site/SiteBasicSettings',NULL,NULL),('dde2f186-f738-459c-9afd-eae0a07b0d07','A.1.3','能源管理運營平台','風機運轉詳細資訊','Wind Running Detail','f',2,'PhotoCameraFront','energy/site/WindRunningDetail',NULL,NULL),('de3177a5-e826-4e29-8337-39d4eff55676','B.1.1','企業節能運營平台','碳足跡監控儀表盤',NULL,'f',2,'DataThresholding',NULL,NULL,NULL),('e442c81b-8ed3-447c-a76c-7d58ff9add02','A.1.6','能源管理運營平台','維修排配','Maintenance Plan','f',2,'Engineering',NULL,NULL,NULL),('e6656cee-50a8-49f2-9811-e20368361361','B.4.4','企業節能運營平台','專案碳指標',NULL,'f',2,'Category',NULL,NULL,NULL),('e86b0761-9c76-4790-94ab-5ef8bc10ca94','X.1.4','公用模組','授權管理',NULL,'f',2,'Security','system/RoleFunctions',NULL,NULL),('e8f35125-5ddc-423d-b615-3b713823dbea','A.2.3','能源管理運營平台','設備資料管理',NULL,'f',2,'PrecisionManufacturing','energy/equipment/EquipmentManagement',NULL,NULL),('e9bb85cc-4d02-4aff-bc96-ef6ae52a9ea3','X.1.5','公用模組','信息管理',NULL,'f',2,'Notifications',NULL,NULL,NULL),('f1672894-24a2-424a-85f1-5b92204cf489','A.1.4','能源管理運營平台','碳排指數分析','Carbon Indicator Analysis','f',2,'Co2',NULL,NULL,NULL),('f16e58ad-6730-4bb3-889e-9c0b50d6a248','A.2.4','能源管理運營平台','合約管理',NULL,'f',2,'Summarize',NULL,NULL,NULL),('f4624774-7132-405e-b56e-c8f50edf4c25','B.2.5','企業節能運營平台','專案碳足跡',NULL,'f',2,'AccountTree',NULL,NULL,NULL),('f58d149f-c6f1-4ac6-b560-af529bf636d3','X.1.3','公用模組','功能管理','Funcion List','f',2,'ListAlt','system/FunctionList',NULL,NULL),('f7127dff-4ca4-4ae5-924d-7f6d699b01fd','B.1.5','企業節能運營平台','異常管理',NULL,'f',2,'NearbyError',NULL,NULL,NULL),('f9a47437-14a9-4dbc-8abb-9523dd47ad22','X.1.2','公用模組','角色管理',NULL,'f',2,'Workspaces','system/Roles',NULL,NULL),('fd22a25b-98ea-46a3-902e-51cfea89cb5f','B.3.2','企業節能運營平台','專案碳盤查',NULL,'f',2,'Grading',NULL,NULL,NULL);
/*!40000 ALTER TABLE `function_list` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-01 17:14:07
