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
-- Table structure for table `wind_sites`
--

DROP TABLE IF EXISTS `wind_sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wind_sites` (
  `site_id` varchar(36) NOT NULL,
  `turbine_model` varchar(255) DEFAULT NULL,
  `height` decimal(10,2) DEFAULT NULL,
  `air_density` decimal(10,2) DEFAULT NULL,
  `avg_wind_speed` decimal(10,2) DEFAULT NULL,
  `spring_avg_wind_speed` decimal(10,2) DEFAULT NULL,
  `spring_wind_direction` varchar(50) DEFAULT NULL,
  `summer_avg_wind_speed` decimal(10,2) DEFAULT NULL,
  `summer_wind_direction` varchar(50) DEFAULT NULL,
  `autumn_avg_wind_speed` decimal(10,2) DEFAULT NULL,
  `autumn_wind_direction` varchar(50) DEFAULT NULL,
  `winter_avg_wind_speed` decimal(10,2) DEFAULT NULL,
  `winter_wind_direction` varchar(50) DEFAULT NULL,
  `remark` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wind_sites`
--

LOCK TABLES `wind_sites` WRITE;
/*!40000 ALTER TABLE `wind_sites` DISABLE KEYS */;
INSERT INTO `wind_sites` VALUES ('02bbb00f-7f46-45b0-8c23-82b05e37225c','Wind-001',170.00,30.00,12.00,10.00,'S',10.00,NULL,10.00,'SSW',10.00,NULL,'test1','2025-01-06 22:42:03','2025-01-20 10:03:04');
/*!40000 ALTER TABLE `wind_sites` ENABLE KEYS */;
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
