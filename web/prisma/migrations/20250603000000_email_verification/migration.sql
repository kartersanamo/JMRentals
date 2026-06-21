-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `emailVerifyCodeHash` VARCHAR(191) NULL,
    ADD COLUMN `emailVerifyExpires` DATETIME(3) NULL;

-- Existing accounts are treated as already verified
UPDATE `User` SET `emailVerifiedAt` = CURRENT_TIMESTAMP(3) WHERE `emailVerifiedAt` IS NULL;
