-- AlterTable
ALTER TABLE `Application` ADD COLUMN `rentTerm` ENUM('MONTHLY', 'ANNUALLY') NOT NULL DEFAULT 'MONTHLY',
    ADD COLUMN `proposedUnitId` VARCHAR(191) NULL,
    ADD COLUMN `proposedMoveInDate` DATETIME(3) NULL,
    ADD COLUMN `proposedRentTerm` ENUM('MONTHLY', 'ANNUALLY') NULL,
    ADD COLUMN `proposedMonthlyRent` DECIMAL(10, 2) NULL,
    ADD COLUMN `proposalStatus` ENUM('PENDING', 'CONFIRMED', 'REJECTED') NULL,
    ADD COLUMN `proposalNotes` TEXT NULL,
    ADD COLUMN `proposalToken` VARCHAR(191) NULL,
    ADD COLUMN `proposalTokenExpires` DATETIME(3) NULL,
    ADD COLUMN `guestConfirmedAt` DATETIME(3) NULL,
    ADD COLUMN `proposedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Application_proposalToken_key` ON `Application`(`proposalToken`);
CREATE INDEX `Application_proposedUnitId_idx` ON `Application`(`proposedUnitId`);

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_proposedUnitId_fkey` FOREIGN KEY (`proposedUnitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
