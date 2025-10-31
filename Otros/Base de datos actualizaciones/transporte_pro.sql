-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-09-2025 a las 03:56:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `transporte_pro`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `AprobarGasto` (IN `gasto_id` INT, IN `supervisor_id` INT)   BEGIN
    UPDATE gastos 
    SET estado = 'aprobado', 
        aprobado_por = supervisor_id, 
        fecha_aprobacion = NOW()
    WHERE id = gasto_id;
END$$

--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `TotalGastosPeriodo` (`fecha_inicio` DATE, `fecha_fin` DATE, `usuario_id` INT) RETURNS DECIMAL(10,2) DETERMINISTIC READS SQL DATA BEGIN
    DECLARE total DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(monto), 0) INTO total
    FROM gastos 
    WHERE fecha BETWEEN fecha_inicio AND fecha_fin
    AND (usuario_id IS NULL OR gastos.usuario_id = usuario_id)
    AND estado = 'aprobado';
    
    RETURN total;
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
