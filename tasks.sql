CREATE DATABASE `tasks`;
USE `tasks`;

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(45) DEFAULT NULL,
  `username` varchar(45) NOT NULL,
  `owner` varchar(24) NOT NULL,
  `createdAt` datetime NOT NULL,
  'checked' TINYINT(1) DEFAULT 0,
  'private' TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
