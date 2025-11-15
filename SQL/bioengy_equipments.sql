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
-- Table structure for table `equipments`
--

DROP TABLE IF EXISTS `equipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipments` (
  `id` varchar(36) NOT NULL,
  `model_no` varchar(50) NOT NULL,
  `desc_cn` text,
  `desc_en` text,
  `equ_type` varchar(20) NOT NULL,
  `power` decimal(10,2) NOT NULL,
  `voltage` decimal(10,2) NOT NULL,
  `useful_life` decimal(10,2) DEFAULT NULL,
  `iso14064` enum('y','n') DEFAULT NULL,
  `iso14001` enum('y','n') DEFAULT NULL,
  `remark` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipments`
--

LOCK TABLES `equipments` WRITE;
/*!40000 ALTER TABLE `equipments` DISABLE KEYS */;
INSERT INTO `equipments` VALUES ('078339df-888f-4640-8a7a-19b9c08f79c1','Win-150-004','明陽風機-04','Ming-Yang Wind-04','wind',5000.00,220.00,25.00,'y','y',''),('0b79b6b8-efd8-4aac-90eb-e64082aafb4f','PG-002','生質能發電機02','Biomass002','generator',500.00,220.00,10.00,'y','y',''),('0cad58bd-645a-46f6-94f7-08cd8ca40fe2','Win-170-001','明陽風機','Ming-Yang Wind-01','wind',6000.00,226.00,30.00,'y','y',''),('2ac92f21-1152-4b4d-bcd2-aefbbbaa8f64','Win-170-003','太陽能板003','Ming-Yang Wind-03','wind',3000.00,220.00,20.00,'n','y',''),('3a51f16a-4f50-480f-b86c-7ae4eec2a67a','SOL-004','太陽能板003','Solar-Board-003','pv',0.45,110.00,20.00,'y','y',''),('4760819e-ba00-41bd-90c2-1ac031d85445','Win-170-002','明陽風機-02','Ming-Yang Wind-02','wind',4000.00,220.00,20.00,'n','n',''),('796d8c31-8f4e-4285-a706-bd003d95883f','PG-001','生質能發電機','Biomass001','generator',200.00,220.00,10.00,'n','n',''),('ad73572e-7d0c-453e-853d-2bda1bb9b310','SOL-003','太陽能板003','Solar-Board-003','pv',0.60,110.00,120.00,'y','y',''),('ad84664c-80dd-4ebe-86a4-0eeb0d85221f','Win-170-005','明陽風機-05','Ming-Yang Wind-05','wind',7000.00,220.00,25.00,'y','y',''),('ad891365-6b1d-4a5f-b092-5935c33cb1fc','SOL-005','太陽能板005','Solar-Board-005','pv',0.70,110.00,30.00,'y','y',''),('c2bcfbbf-520c-4160-a63e-fcc61cbc4e89','DS-001','柴油發電機001','Disorder-001','generator',500.00,220.00,10.00,'n','n','dddddeeessss'),('ec8f85cc-b8bb-471d-9d77-9bf8a4d1fe2d','SOL-002','太陽能板002','Solar-Board-002','pv',0.40,110.00,20.00,'y','n','test\ntest\ntest\ntest\ntest\n'),('fe376ea7-c3e8-43f5-af71-0138d69d049e','SOL-001','太陽能板001','Solar-Board','pv',0.50,110.00,25.00,'y','n','');
/*!40000 ALTER TABLE `equipments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-01 17:14:08
