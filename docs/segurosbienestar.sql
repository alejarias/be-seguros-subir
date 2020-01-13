-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema segurosbienestar
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema segurosbienestar
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `segurosbienestar` DEFAULT CHARACTER SET utf8 ;
USE `segurosbienestar` ;

-- -----------------------------------------------------
-- Table `segurosbienestar`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `segurosbienestar`.`users` (
  `id` CHAR(36) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` CHAR(255) NOT NULL,
  `gender` TINYINT(1) NOT NULL,
  `dob` DATE NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(10) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `born_in` VARCHAR(100) NOT NULL,
  `user_status` TINYINT(1) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `segurosbienestar`.`policies`, oeD
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `segurosbienestar`.`policies` (
  `id` CHAR(36) NOT NULL,
  `policy_number` CHAR(10) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `policy_type` TINYINT(1) NOT NULL,
  `policy_price` DECIMAL(10,2) NOT NULL,
  `policy_period` VARCHAR(10) NOT NULL,
  `eoi_url` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  `finished_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_policies_user_id_user_id_idx` (`user_id` ASC),
  CONSTRAINT `fk_policies_user_id_user_id`
  FOREIGN KEY (`user_id`)
  REFERENCES `segurosbienestar`.`users` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION)
  ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;


-- -----------------------------------------------------
-- Table `segurosbienestar`.`services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `segurosbienestar`.`services` (
  `id` CHAR(36) NOT NULL,
  `request_state` CHAR(1) NOT NULL,
  `content` TEXT NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  `finished_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_services_users1_idx` (`user_id` ASC),
  CONSTRAINT `fk_services_user_id_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `segurosbienestar`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;

