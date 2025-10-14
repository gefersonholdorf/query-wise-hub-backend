-- AlterTable
ALTER TABLE `stock_history` MODIFY `status` ENUM('PENDING', 'APPROVED', 'DENIED') NULL;
