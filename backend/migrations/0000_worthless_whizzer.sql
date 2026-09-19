CREATE TABLE `favorites` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`city_name` varchar(100) NOT NULL,
	`country` varchar(100) NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_favorite_location_unique` UNIQUE(`latitude`,`longitude`)
);
