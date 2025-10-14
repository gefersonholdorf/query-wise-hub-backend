-- CreateTable
CREATE TABLE `stock_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` TEXT NOT NULL,
    `date_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'APPROVED', 'DENIED') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
