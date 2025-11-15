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
-- Table structure for table `sites`
--

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sites` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `site_type` varchar(50) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `capacity_params` varchar(50) DEFAULT NULL,
  `approval_number` varchar(50) DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `area` int DEFAULT NULL,
  `construction_date` date DEFAULT NULL,
  `operation_date` date DEFAULT NULL,
  `siteType` varchar(50) DEFAULT NULL,
  `capacityParams` varchar(50) DEFAULT NULL,
  `approvalNumber` varchar(50) DEFAULT NULL,
  `approvalDate` datetime DEFAULT NULL,
  `constructionDate` datetime DEFAULT NULL,
  `operationDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sites`
--

LOCK TABLES `sites` WRITE;
/*!40000 ALTER TABLE `sites` DISABLE KEYS */;
INSERT INTO `sites` VALUES ('02bbb00f-7f46-45b0-8c23-82b05e37225c','桃園龍潭Win-001','Finconn','台灣','桃園市平鎮區','延平路一段168號',24.94575220,121.21835940,'wind',20,'85%','100000200','2024-12-25',20000,'2022-12-31','2024-12-17','wind','85%','100000200','2024-12-25 00:00:00','2022-12-31 00:00:00','2024-12-17 00:00:00'),('19b48f78-e8e2-4858-a248-b4250c940b64','楊梅SL-1001','Finconn','台灣','桃園市 — 楊梅','326桃園市楊梅區楊新北路321巷30號',24.91435220,121.14650720,'solar',50,'85','100000200-3','2024-12-25',200000,'2024-12-09','2024-12-17',NULL,NULL,NULL,NULL,NULL,NULL),('42d5e858-14b5-4078-81fa-cf788669e3ed','楊梅SL-1002','Finconn','台灣','新竹市','300新竹市東區',24.80663330,120.96868330,'geothermal',30,'85%','100000200-4','2024-12-05',233300,'2024-12-12','2024-12-25',NULL,NULL,NULL,NULL,NULL,NULL),('6cada76c-6457-44a1-ad47-15226ed1bf59','update Name','新公司名稱','台灣','桃園市','新地址',45.22000000,123.70000000,'wind',30,'85%','100000200-2','2023-01-01',30000,'2023-01-04','2024-12-17',NULL,NULL,NULL,NULL,NULL,NULL),('b3ddfe7e-fd62-4031-a2b4-a39e4556eb14','桃園龍潭win-002','Finconn','台灣','桃園市 — 龍潭區','中正路上華段112',45.22000000,123.70000000,'wind',30,'85%','100000200-2','2023-01-01',30000,'2023-01-04','2024-12-17',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sites` ENABLE KEYS */;
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
