/*
  Warnings:

  - Added the required column `name` to the `Investment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "name" TEXT NOT NULL;
