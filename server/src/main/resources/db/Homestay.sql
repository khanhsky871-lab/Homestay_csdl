CREATE TABLE `Room` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `capacity` int NOT NULL DEFAULT 2,
  `description` text,
  `area` int,
  `created_at` datetime DEFAULT current_timestamp,
  `updated_at` datetime
);

CREATE TABLE `RoomStatusHistory` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` int,
  `status` varchar(255) NOT NULL,
  `changed_at` datetime DEFAULT current_timestamp
);

CREATE TABLE `RoomImage` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `room_id` int,
  `image_url` varchar(255) NOT NULL
);

CREATE TABLE `User` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) UNIQUE NOT NULL,
  `password_hash` varchar(255),
  `email` varchar(255) UNIQUE NOT NULL,
  `phone` varchar(15) NOT NULL,
  `identity_card` varchar(255) UNIQUE NOT NULL,
  `gender` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `address` varchar(255),
  `description` varchar(255),
  `role_id` int NOT NULL,
  `created_at` datetime DEFAULT current_timestamp
);

CREATE TABLE `Role` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255)
);

CREATE TABLE `Permission` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255)
);

CREATE TABLE `RolePermission` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL
);

CREATE TABLE `ServiceGroup` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL
);

CREATE TABLE `Service` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `group_id` int NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `is_active` boolean NOT NULL DEFAULT true,
  `description` varchar(255)
);

CREATE TABLE `Reservation` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `room_id` int NOT NULL,
  `booking_date` datetime NOT NULL,
  `check_in_date` datetime NOT NULL,
  `check_out_date` datetime NOT NULL,
  `nights` int NOT NULL,
  `num_guests` int NOT NULL DEFAULT 1,
  `room_price` decimal(15,2),
  `status` varchar(255) NOT NULL,
  `payment_status` varchar(255) NOT NULL,
  `payment_method` varchar(255),
  `total` decimal(15,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp,
  `updated_at` datetime
);

CREATE TABLE `ReservationService` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `reservation_id` int NOT NULL,
  `service_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` int NOT NULL,
  `total_price` decimal(15,2) NOT NULL
);

CREATE TABLE `ReservationGuest` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `reservation_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `identity_card` varchar(255)
);

CREATE TABLE `Bill` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reservation_id` int NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp,
  `updated_at` datetime
);

CREATE TABLE `BillDetail` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `service_id` int NOT NULL,
  `reservation_id` int,
  `quantity` int NOT NULL,
  `price` decimal(15,2) NOT NULL
);

CREATE TABLE `WorkSchedule` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `work_date` datetime NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `task` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `description` varchar(255)
);


ALTER TABLE `RoomImage` ADD FOREIGN KEY (`room_id`) REFERENCES `Room` (`id`);

ALTER TABLE `RoomStatusHistory` ADD FOREIGN KEY (`room_id`) REFERENCES `Room` (`id`);

ALTER TABLE `Reservation` ADD FOREIGN KEY (`room_id`) REFERENCES `Room` (`id`);

ALTER TABLE `Reservation` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`id`);


ALTER TABLE `ReservationGuest` ADD FOREIGN KEY (`reservation_id`) REFERENCES `Reservation` (`id`);

ALTER TABLE `Service` ADD FOREIGN KEY (`group_id`) REFERENCES `ServiceGroup` (`id`);

ALTER TABLE `Bill` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`id`);

ALTER TABLE `Bill` ADD FOREIGN KEY (`reservation_id`) REFERENCES `Reservation` (`id`);

ALTER TABLE `BillDetail` ADD FOREIGN KEY (`bill_id`) REFERENCES `Bill` (`id`);

ALTER TABLE `BillDetail` ADD FOREIGN KEY (`reservation_id`) REFERENCES `Reservation` (`id`);

ALTER TABLE `BillDetail` ADD FOREIGN KEY (`service_id`) REFERENCES `Service` (`id`);

ALTER TABLE `User` ADD FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`);

ALTER TABLE `RolePermission` ADD FOREIGN KEY (`role_id`) REFERENCES `Role` (`id`);

ALTER TABLE `RolePermission` ADD FOREIGN KEY (`permission_id`) REFERENCES `Permission` (`id`);

ALTER TABLE `WorkSchedule` ADD FOREIGN KEY (`employee_id`) REFERENCES `User` (`id`);

ALTER TABLE `ReservationService` ADD FOREIGN KEY (`service_id`) REFERENCES `Service` (`id`);

ALTER TABLE `ReservationService` ADD FOREIGN KEY (`reservation_id`) REFERENCES `Reservation` (`id`);