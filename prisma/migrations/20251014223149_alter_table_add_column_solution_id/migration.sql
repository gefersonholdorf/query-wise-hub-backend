/*
  Warnings:

  - Added the required column `solutionId` to the `stock_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `stock_history` ADD COLUMN `solutionId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `stock_history` ADD CONSTRAINT `stock_history_solutionId_fkey` FOREIGN KEY (`solutionId`) REFERENCES `solutions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
