-- Create syntax for '(null)'

-- Create syntax for TABLE 'mfo'
CREATE TABLE `mfo` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `name_full` varchar(255) NOT NULL DEFAULT '',
  `code` varchar(255) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `trademark_mfo` varchar(255) DEFAULT NULL,
  `certificate` varchar(255) NOT NULL DEFAULT '',
  `url` varchar(255) DEFAULT NULL,
  `region_id` int(3) NOT NULL,
  `address` text NOT NULL,
  `chief_name` varchar(255) DEFAULT NULL,
  `chief_position` varchar(255) DEFAULT NULL,
  `name_genitive` varchar(255) NOT NULL DEFAULT '',
  `name_prepositional` varchar(255) NOT NULL DEFAULT '',
  `additional_information` text,
  `preview_text` text,
  `detail_text` text,
  `comments` text,
  `order_pos` tinyint(1) NOT NULL DEFAULT '0',
  `created` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- Create syntax for TABLE 'users'
CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL DEFAULT '',
  `photo` varchar(255) DEFAULT NULL,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
