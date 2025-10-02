-- CreateTable
CREATE TABLE `solutions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solution` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'DENIED') NOT NULL DEFAULT 'PENDING',
    `approved_at` DATETIME(3) NULL,
    `approved_by` VARCHAR(191) NULL,
    `denied_at` DATETIME(3) NULL,
    `denied_by` VARCHAR(191) NULL,
    `observation` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
