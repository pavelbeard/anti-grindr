/*
  Warnings:

  - You are about to drop the `Gender` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GenderToProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('male', 'cismale', 'transmale', 'female', 'cisfemale', 'transfemale', 'nonbinary');

-- DropForeignKey
ALTER TABLE "_GenderToProfile" DROP CONSTRAINT "_GenderToProfile_A_fkey";

-- DropForeignKey
ALTER TABLE "_GenderToProfile" DROP CONSTRAINT "_GenderToProfile_B_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "gender" "GENDER";

-- DropTable
DROP TABLE "Gender";

-- DropTable
DROP TABLE "_GenderToProfile";
