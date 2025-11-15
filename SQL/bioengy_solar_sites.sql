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
-- Table structure for table `solar_sites`
--

DROP TABLE IF EXISTS `solar_sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solar_sites` (
  `site_id` varchar(36) NOT NULL,
  `module_type` varchar(255) DEFAULT NULL,
  `bracket_height` decimal(10,2) DEFAULT NULL,
  `annual_sunlight` decimal(10,2) DEFAULT NULL,
  `output_voltage` decimal(10,2) DEFAULT NULL,
  `inverter_output` decimal(10,2) DEFAULT NULL,
  `ground_direction` varchar(50) DEFAULT NULL,
  `sunlight_direction` varchar(50) DEFAULT NULL,
  `avg_temperature` decimal(5,2) DEFAULT NULL,
  `avg_rainfall` decimal(10,2) DEFAULT NULL,
  `avg_wind_speed` decimal(10,2) DEFAULT NULL,
  `remark` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solar_sites`
--

LOCK TABLES `solar_sites` WRITE;
/*!40000 ALTER TABLE `solar_sites` DISABLE KEYS */;
INSERT INTO `solar_sites` VALUES ('example-site-id-1','Type A',1.50,1200.00,220.00,5.00,'North','South',25.00,100.00,3.00,'No remarks','2025-01-22 00:11:33','2025-01-22 00:11:33'),('example-site-id-2','Type B',2.00,1500.00,230.00,6.00,'East','West',26.00,110.00,4.00,'No remarks','2025-01-22 00:11:33','2025-01-22 00:11:33');
/*!40000 ALTER TABLE `solar_sites` ENABLE KEYS */;
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
