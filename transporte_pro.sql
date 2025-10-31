-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 31-10-2025 a las 08:24:29
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos`
--

CREATE TABLE `gastos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `tipo` enum('combustible','mantenimiento','peaje','multa','hospedaje','comida','otros') NOT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `kilometraje` int(11) DEFAULT NULL,
  `litros` decimal(8,2) DEFAULT NULL,
  `numero_factura` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `recibo_imagen` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `aprobado_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `viaje_id` int(11) DEFAULT NULL COMMENT 'ID del viaje asociado al gasto (opcional)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gastos`
--

INSERT INTO `gastos` (`id`, `usuario_id`, `vehiculo_id`, `tipo`, `fecha`, `monto`, `kilometraje`, `litros`, `numero_factura`, `descripcion`, `recibo_imagen`, `estado`, `fecha_registro`, `aprobado_por`, `fecha_aprobacion`, `viaje_id`) VALUES
(8, 1, 4, 'combustible', '2025-09-29', 3500.00, 123, 140.00, 'dqwqw121212', 'JIJIJI', 'recibo_8_68da4b7a767f1.jpg', 'aprobado', '2025-09-29 09:03:54', NULL, NULL, NULL),
(14, 1, 6, 'hospedaje', '2025-10-03', 1500.00, 32, 0.00, 'FAsasq1212', '', NULL, 'rechazado', '2025-10-03 04:17:51', NULL, NULL, NULL),
(20, 1, 6, 'peaje', '2025-10-17', 122.00, 23, 323.00, 'dqwqw12121221', '', NULL, 'rechazado', '2025-10-17 04:03:33', NULL, NULL, NULL),
(39, 1, 6, 'combustible', '2025-08-30', 9000.00, 66, 764.00, 'DSDSDSW2', '', NULL, 'rechazado', '2025-10-20 07:32:42', NULL, NULL, NULL),
(43, 1, 6, 'otros', '2025-07-23', 1000.00, 76, 0.00, 'ytyt5445', '', NULL, 'rechazado', '2025-10-20 07:36:49', NULL, NULL, NULL),
(44, 1, 6, 'mantenimiento', '2025-07-24', 3500.00, 67, 0.00, 'oiiui677', '', NULL, 'rechazado', '2025-10-20 07:37:21', NULL, NULL, NULL),
(45, 1, 6, 'hospedaje', '2025-08-13', 4000.00, 65, 0.00, 'wq2121323', '', NULL, 'aprobado', '2025-10-20 07:38:07', NULL, NULL, NULL),
(50, 19, 9, 'combustible', '2025-10-24', 1000.00, 55, 40.00, 'sdsd231212', '', NULL, 'aprobado', '2025-10-24 08:50:49', NULL, NULL, 14),
(51, 19, 9, 'peaje', '2025-10-24', 200.00, 66, 0.00, 'swqwq21212', '', NULL, 'pendiente', '2025-10-24 09:01:50', NULL, NULL, 14),
(52, 19, 9, 'combustible', '2025-10-28', 4000.00, 55, 52.00, 'swqwdvcxd121', 'sasas', NULL, 'pendiente', '2025-10-28 05:31:18', NULL, NULL, 14),
(53, 20, 9, 'combustible', '2025-10-29', 1000.00, 23, 40.00, 'qwqwqw21213', 'dssdsdsdw', NULL, 'pendiente', '2025-10-29 01:29:47', NULL, NULL, 15),
(54, 20, 9, 'mantenimiento', '2025-10-29', 2303.00, 44, 0.00, 'ewewewe21', 'sdsdsd', 'recibo_54_6901759422325.png', 'pendiente', '2025-10-29 02:01:56', NULL, NULL, 15),
(55, 20, 9, 'combustible', '2025-10-29', 1000.00, 46, 40.00, 'eeqwqwqwq12', '', 'recibo_55_6901949f1cc3a.png', 'pendiente', '2025-10-29 04:14:23', NULL, NULL, 15);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimientos`
--

CREATE TABLE `mantenimientos` (
  `id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `tipo_mantenimiento` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_mantenimiento` date NOT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `kilometraje_actual` int(11) DEFAULT NULL,
  `proximo_mantenimiento_km` int(11) DEFAULT NULL,
  `taller` varchar(100) DEFAULT NULL,
  `estado` enum('programado','en_proceso','completado') DEFAULT 'programado',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mantenimientos`
--

INSERT INTO `mantenimientos` (`id`, `vehiculo_id`, `tipo_mantenimiento`, `descripcion`, `fecha_mantenimiento`, `costo`, `kilometraje_actual`, `proximo_mantenimiento_km`, `taller`, `estado`, `fecha_registro`) VALUES
(1, 1, 'Cambio de aceite', 'Cambio de aceite y filtro de motor', '2025-01-01', 450.00, 45000, 50000, 'Taller Volvo Oficial', 'completado', '2025-09-29 08:53:47'),
(2, 2, 'Revisión general', 'Revisión completa del sistema de frenos', '2025-01-15', 1200.00, 67500, 75000, 'Taller Kenworth', 'programado', '2025-09-29 08:53:47'),
(3, 4, 'Reparación motor', 'Reparación de falla en motor', '2025-01-10', 3500.00, 89000, 95000, 'Taller Ford', 'en_proceso', '2025-09-29 08:53:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `licencia` varchar(50) DEFAULT NULL,
  `rol` enum('admin','supervisor','transportista') NOT NULL DEFAULT 'transportista',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_acceso` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `telefono`, `licencia`, `rol`, `activo`, `fecha_registro`, `ultimo_acceso`) VALUES
(1, 'Administrador Principal', 'admin@transporte.com', 'admin123', '+52 55 1234-5678', NULL, 'admin', 1, '2025-09-29 08:53:47', '2025-10-31 04:28:44'),
(2, 'Supervisor General', 'supervisor@transporte.com', 'super123', '+52 33 7777-6666', NULL, 'supervisor', 1, '2025-09-29 08:53:47', '2025-10-24 06:20:04'),
(6, 'Melany', 'mel@gmail.com', '$2y$10$VHrSt13.rMbPb0wXKsRkq.VEqq3L6QajnNJnEne7kdf7xJKr33RLW', '+52 55 8888-9999', 'Lic1232-1232', 'supervisor', 1, '2025-09-29 09:04:58', '2025-10-24 07:05:30'),
(8, 'Melanyaaaa', 'asa@gmail.com', '$2y$10$BHnHt/vc4RFPHdtJ3Cm/SOvU90WWCN8UlcchdVKprwFVnZB8fCdJu', '+52 5454444433', '2343fdf332', 'admin', 1, '2025-10-07 09:43:05', NULL),
(15, 'Juan P', 'juan@translogix.com', '$2y$10$KTyDZovJOEBp5LMLmUkut.OXi.nAaYYKvCDTWF1n3YRica9xvXSLC', '+57 5550001434', 'LIC001', 'transportista', 1, '2025-10-24 06:20:29', NULL),
(16, 'María González', 'maria@translogix.com', '$2y$10$Pi0ON/hAeDztYtTiTjgvY.KSSyjfKTioKelpDCQ/z1UT1OgJ0LDGy', '+86 55500023434', 'LIC002', 'transportista', 0, '2025-10-24 06:20:29', NULL),
(17, 'Carlos López', 'carlos@translogix.com', '$2y$10$0FumlOyZmiS1QgCxoWgKEeqvt1o3ygdP./Sp90qQKPMayWuN/.Odq', '+34 555000343', 'LIC003', 'transportista', 1, '2025-10-24 06:20:29', NULL),
(18, 'Ana Martínez', 'ana@translogix.com', '$2y$10$hM14ueB0lFnkfxBmhiuKT.poeSo0yQmUZxhZ1p/zRdxlzhmn.Sbcy', '+49 55500043434', 'LIC004', 'transportista', 1, '2025-10-24 06:20:29', NULL),
(19, 'Melany2', 'sjeffersonguka@gmail.com', '$2y$10$Eo22q/rxpGjYrpxLu/98leFVDHjC44GEfAfmhe4uWd9MRlgyaXD5.', '+52 5453423231', 'CDL-A-2024', 'transportista', 1, '2025-10-24 07:06:21', '2025-10-31 04:21:47'),
(20, 'Mark', 'estorrelol@gmail.com', '$2y$10$653lq1OOKKWRHq6.egAJsOrpVyqqmDahSrtlS8uCa1YC6KrrOEWPO', '+52 3232343434', 'CDL-A-2025', 'transportista', 1, '2025-10-24 07:06:37', '2025-10-29 07:35:09'),
(21, 'Carlos', '123@gmail.com', '12345', '+52 0000000000', 'CDL-A-2022', 'transportista', 1, '2025-10-24 07:06:48', '2025-10-31 04:28:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL,
  `placa` varchar(20) NOT NULL,
  `tipo` enum('camion','van','pickup','trailer') NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `año` int(11) NOT NULL,
  `kilometraje` int(11) DEFAULT 0,
  `estado` enum('operativo','mantenimiento','fuera_servicio','disponible') DEFAULT 'disponible',
  `usuario_asignado` int(11) DEFAULT NULL,
  `ultimo_servicio` date DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`id`, `placa`, `tipo`, `marca`, `modelo`, `año`, `kilometraje`, `estado`, `usuario_asignado`, `ultimo_servicio`, `fecha_registro`) VALUES
(1, 'ABC-123', 'camion', 'Volvo', 'FH16', 2022, 45230, 'disponible', NULL, NULL, '2025-09-29 08:53:47'),
(2, 'DEF-456', 'camion', 'Kenworth', 'T680', 2021, 67890, 'fuera_servicio', NULL, NULL, '2025-09-29 08:53:47'),
(4, 'JKL-012', 'pickup', 'Ford', 'F-150', 2020, 89000, 'mantenimiento', NULL, NULL, '2025-09-29 08:53:47'),
(6, 'JBL-112', 'camion', 'Audi', 'Qr8', 2025, 12, 'disponible', NULL, NULL, '2025-10-01 02:38:43'),
(7, 'SA1-234', 'camion', 'Lamorgini', 'Urus', 2024, 134, 'operativo', NULL, NULL, '2025-10-01 02:39:18'),
(8, 'MAO-742', 'camion', 'Mercedes', 'FD23', 2025, 10, 'disponible', NULL, NULL, '2025-10-08 07:29:33'),
(9, 'kks2-12', 'pickup', 'Mercedes', 'CLE3', 2025, 12, 'disponible', NULL, NULL, '2025-10-10 08:21:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `viajes`
--

CREATE TABLE `viajes` (
  `id` int(11) NOT NULL,
  `numero_viaje` varchar(20) NOT NULL,
  `origen_estado` varchar(100) NOT NULL,
  `origen_municipio` varchar(100) NOT NULL,
  `origen_direccion` text DEFAULT NULL,
  `destino_estado` varchar(100) NOT NULL,
  `destino_municipio` varchar(100) NOT NULL,
  `destino_direccion` text DEFAULT NULL,
  `transportista_id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `cliente` varchar(200) DEFAULT NULL,
  `carga_tipo` varchar(100) DEFAULT NULL,
  `carga_peso` decimal(10,2) DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_programada` time NOT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_completado` datetime DEFAULT NULL,
  `estado` enum('pendiente','en_ruta','completado','cancelado') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `motivo_rechazo_finalizacion` text DEFAULT NULL COMMENT 'Motivo del rechazo de finalización del viaje'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `viajes`
--

INSERT INTO `viajes` (`id`, `numero_viaje`, `origen_estado`, `origen_municipio`, `origen_direccion`, `destino_estado`, `destino_municipio`, `destino_direccion`, `transportista_id`, `vehiculo_id`, `cliente`, `carga_tipo`, `carga_peso`, `fecha_programada`, `hora_programada`, `fecha_inicio`, `fecha_completado`, `estado`, `observaciones`, `created_at`, `updated_at`, `motivo_rechazo_finalizacion`) VALUES
(13, 'VJ-001', 'Estado de México', 'Huehuetoca1', NULL, 'Ciudad de México', 'Ixtalapa', NULL, 19, 6, NULL, NULL, NULL, '2025-10-24', '01:51:00', NULL, NULL, 'pendiente', 'asasq', '2025-10-24 07:51:07', '2025-10-28 22:30:32', NULL),
(14, 'VJ-002', 'Campeche', 'asas', NULL, 'Baja California Sur', 'asas', NULL, 19, 9, NULL, NULL, NULL, '2025-10-25', '02:15:00', NULL, NULL, 'completado', 'asasas', '2025-10-24 08:15:23', '2025-10-28 22:29:10', NULL),
(15, 'VJ-003', 'Ciudad de México', 'sdsd', NULL, 'Chiapas', 'sdsd', NULL, 20, 9, NULL, NULL, NULL, '2025-10-26', '02:36:00', NULL, NULL, 'en_ruta', 'dsdsds', '2025-10-24 08:36:52', '2025-10-28 22:34:28', NULL),
(16, 'VJ-004', 'Ciudad de México', 'sasas', NULL, 'Coahuila', 'sasas', NULL, 20, 8, NULL, NULL, NULL, '2025-10-27', '23:13:00', NULL, NULL, 'cancelado', 'asasas', '2025-10-28 05:13:52', '2025-10-28 22:33:30', NULL),
(17, 'VJ-005', 'Estado de México', 'izcalli', NULL, 'Estado de México', 'huehuetoca', NULL, 21, 1, NULL, NULL, NULL, '2025-10-27', '23:58:00', NULL, NULL, 'pendiente', 'gfgfg', '2025-10-28 05:58:34', '2025-10-28 06:06:22', NULL),
(18, 'VJ-006', 'Baja California Sur', 'dsdsd', NULL, 'Campeche', 'dsdsd', NULL, 20, 8, NULL, NULL, NULL, '2025-10-28', '16:49:00', NULL, NULL, 'pendiente', 'dsdsd', '2025-10-28 22:50:02', '2025-10-28 22:50:02', NULL),
(19, 'VJ-007', 'Baja California Sur', 'dsdsd', NULL, 'Estado de México', 'eyyjhjhj', NULL, 20, 8, NULL, NULL, NULL, '2025-11-15', '16:49:00', NULL, NULL, 'pendiente', 'weqwqwa', '2025-10-28 22:50:38', '2025-10-28 22:50:38', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `viaje_ubicaciones`
--

CREATE TABLE `viaje_ubicaciones` (
  `id` int(11) NOT NULL,
  `viaje_id` int(11) NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT current_timestamp(),
  `observacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_gastos_resumen`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_gastos_resumen` (
`id` int(11)
,`fecha` date
,`tipo` enum('combustible','mantenimiento','peaje','multa','hospedaje','comida','otros')
,`monto` decimal(10,2)
,`estado` enum('pendiente','aprobado','rechazado')
,`numero_factura` varchar(50)
,`transportista` varchar(100)
,`placa` varchar(20)
,`marca` varchar(50)
,`modelo` varchar(50)
,`aprobado_por_nombre` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_vehiculos_estado`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_vehiculos_estado` (
`id` int(11)
,`placa` varchar(20)
,`tipo` enum('camion','van','pickup','trailer')
,`marca` varchar(50)
,`modelo` varchar(50)
,`año` int(11)
,`kilometraje` int(11)
,`estado` enum('operativo','mantenimiento','fuera_servicio','disponible')
,`ultimo_servicio` date
,`conductor_asignado` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_viajes_resumen`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_viajes_resumen` (
`id` int(11)
,`numero_viaje` varchar(20)
,`origen_estado` varchar(100)
,`origen_municipio` varchar(100)
,`destino_estado` varchar(100)
,`destino_municipio` varchar(100)
,`cliente` varchar(200)
,`carga_tipo` varchar(100)
,`carga_peso` decimal(10,2)
,`fecha_programada` date
,`hora_programada` time
,`estado` enum('pendiente','en_ruta','completado','cancelado')
,`transportista` varchar(100)
,`placa` varchar(20)
,`marca` varchar(50)
,`modelo` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_gastos_resumen`
--
DROP TABLE IF EXISTS `vista_gastos_resumen`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_gastos_resumen`  AS SELECT `g`.`id` AS `id`, `g`.`fecha` AS `fecha`, `g`.`tipo` AS `tipo`, `g`.`monto` AS `monto`, `g`.`estado` AS `estado`, `g`.`numero_factura` AS `numero_factura`, `u`.`nombre` AS `transportista`, `v`.`placa` AS `placa`, `v`.`marca` AS `marca`, `v`.`modelo` AS `modelo`, CASE WHEN `g`.`aprobado_por` is not null THEN (select `usuarios`.`nombre` from `usuarios` where `usuarios`.`id` = `g`.`aprobado_por`) ELSE NULL END AS `aprobado_por_nombre` FROM ((`gastos` `g` join `usuarios` `u` on(`g`.`usuario_id` = `u`.`id`)) join `vehiculos` `v` on(`g`.`vehiculo_id` = `v`.`id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_vehiculos_estado`
--
DROP TABLE IF EXISTS `vista_vehiculos_estado`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_vehiculos_estado`  AS SELECT `v`.`id` AS `id`, `v`.`placa` AS `placa`, `v`.`tipo` AS `tipo`, `v`.`marca` AS `marca`, `v`.`modelo` AS `modelo`, `v`.`año` AS `año`, `v`.`kilometraje` AS `kilometraje`, `v`.`estado` AS `estado`, `v`.`ultimo_servicio` AS `ultimo_servicio`, CASE WHEN `v`.`usuario_asignado` is not null THEN (select `usuarios`.`nombre` from `usuarios` where `usuarios`.`id` = `v`.`usuario_asignado`) ELSE 'Sin asignar' END AS `conductor_asignado` FROM `vehiculos` AS `v` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_viajes_resumen`
--
DROP TABLE IF EXISTS `vista_viajes_resumen`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_viajes_resumen`  AS SELECT `v`.`id` AS `id`, `v`.`numero_viaje` AS `numero_viaje`, `v`.`origen_estado` AS `origen_estado`, `v`.`origen_municipio` AS `origen_municipio`, `v`.`destino_estado` AS `destino_estado`, `v`.`destino_municipio` AS `destino_municipio`, `v`.`cliente` AS `cliente`, `v`.`carga_tipo` AS `carga_tipo`, `v`.`carga_peso` AS `carga_peso`, `v`.`fecha_programada` AS `fecha_programada`, `v`.`hora_programada` AS `hora_programada`, `v`.`estado` AS `estado`, `u`.`nombre` AS `transportista`, `vh`.`placa` AS `placa`, `vh`.`marca` AS `marca`, `vh`.`modelo` AS `modelo` FROM ((`viajes` `v` join `usuarios` `u` on(`v`.`transportista_id` = `u`.`id`)) join `vehiculos` `vh` on(`v`.`vehiculo_id` = `vh`.`id`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aprobado_por` (`aprobado_por`),
  ADD KEY `idx_gastos_fecha` (`fecha`),
  ADD KEY `idx_gastos_usuario` (`usuario_id`),
  ADD KEY `idx_gastos_vehiculo` (`vehiculo_id`),
  ADD KEY `idx_gastos_tipo` (`tipo`),
  ADD KEY `idx_gastos_estado` (`estado`),
  ADD KEY `idx_gastos_usuario_fecha` (`usuario_id`,`fecha`),
  ADD KEY `idx_gastos_fecha_estado` (`fecha`,`estado`),
  ADD KEY `idx_gastos_viaje_id` (`viaje_id`),
  ADD KEY `idx_gastos_usuario_viaje` (`usuario_id`,`viaje_id`);

--
-- Indices de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehiculo_id` (`vehiculo_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_usuarios_rol` (`rol`),
  ADD KEY `idx_usuarios_activo` (`activo`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `placa` (`placa`),
  ADD KEY `usuario_asignado` (`usuario_asignado`),
  ADD KEY `idx_vehiculos_estado` (`estado`),
  ADD KEY `idx_vehiculos_placa` (`placa`);

--
-- Indices de la tabla `viajes`
--
ALTER TABLE `viajes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_viaje` (`numero_viaje`),
  ADD KEY `idx_viajes_estado` (`estado`),
  ADD KEY `idx_viajes_fecha` (`fecha_programada`),
  ADD KEY `idx_viajes_transportista` (`transportista_id`),
  ADD KEY `idx_viajes_vehiculo` (`vehiculo_id`),
  ADD KEY `idx_viajes_fecha_estado` (`fecha_programada`,`estado`);

--
-- Indices de la tabla `viaje_ubicaciones`
--
ALTER TABLE `viaje_ubicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `viaje_id` (`viaje_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `gastos`
--
ALTER TABLE `gastos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `viajes`
--
ALTER TABLE `viajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `viaje_ubicaciones`
--
ALTER TABLE `viaje_ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD CONSTRAINT `fk_gastos_viaje` FOREIGN KEY (`viaje_id`) REFERENCES `viajes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gastos_ibfk_2` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `gastos_ibfk_3` FOREIGN KEY (`aprobado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD CONSTRAINT `mantenimientos_ibfk_1` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`usuario_asignado`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `viajes`
--
ALTER TABLE `viajes`
  ADD CONSTRAINT `viajes_ibfk_1` FOREIGN KEY (`transportista_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `viajes_ibfk_2` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `viaje_ubicaciones`
--
ALTER TABLE `viaje_ubicaciones`
  ADD CONSTRAINT `viaje_ubicaciones_ibfk_1` FOREIGN KEY (`viaje_id`) REFERENCES `viajes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
