-- AlterTable
ALTER TABLE `Lease` ADD COLUMN `signedAt` DATETIME(3) NULL,
    ADD COLUMN `signedByName` VARCHAR(191) NULL,
    ADD COLUMN `signedIp` VARCHAR(191) NULL,
    ADD COLUMN `leaseDocumentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PaymentRecord` ADD COLUMN `leaseId` VARCHAR(191) NULL,
    ADD COLUMN `stripeCheckoutSessionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Document` ADD COLUMN `fileName` VARCHAR(191) NOT NULL DEFAULT 'document',
    ADD COLUMN `mimeType` VARCHAR(191) NOT NULL DEFAULT 'application/octet-stream',
    ADD COLUMN `fileSize` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `category` ENUM('LEASE', 'ADDENDUM', 'RULES', 'RECEIPT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    ADD COLUMN `leaseId` VARCHAR(191) NULL,
    ADD COLUMN `uploadedById` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `Lease_leaseDocumentId_key` ON `Lease`(`leaseDocumentId`);

-- CreateIndex
CREATE UNIQUE INDEX `PaymentRecord_stripeCheckoutSessionId_key` ON `PaymentRecord`(`stripeCheckoutSessionId`);

-- CreateIndex
CREATE INDEX `PaymentRecord_leaseId_idx` ON `PaymentRecord`(`leaseId`);

-- CreateIndex
CREATE INDEX `Document_leaseId_idx` ON `Document`(`leaseId`);

-- CreateIndex
CREATE INDEX `Document_uploadedById_idx` ON `Document`(`uploadedById`);

-- AddForeignKey
ALTER TABLE `Lease` ADD CONSTRAINT `Lease_leaseDocumentId_fkey` FOREIGN KEY (`leaseDocumentId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentRecord` ADD CONSTRAINT `PaymentRecord_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `Lease`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
