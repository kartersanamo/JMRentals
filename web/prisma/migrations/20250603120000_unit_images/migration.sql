-- AlterTable
ALTER TABLE `Unit` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- Default images for seeded floor plans
UPDATE `Unit` SET `imageUrl` = '/images/Inside6.jpg' WHERE `name` = 'Studio Retreat' AND `imageUrl` IS NULL;
UPDATE `Unit` SET `imageUrl` = '/images/Inside2.jpg' WHERE `name` = 'One Bedroom Classic' AND `imageUrl` IS NULL;
UPDATE `Unit` SET `imageUrl` = '/images/Inside4.jpg' WHERE `name` = 'Two Bedroom Home' AND `imageUrl` IS NULL;
