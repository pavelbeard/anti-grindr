/*
  Warnings:

  - Changed the type of `name` on the `Pronoun` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PRONOUN" AS ENUM ('he_him_his', 'she_her_hers', 'they_them_theirs', 'ze_hir_hirs', 'ze_zir_zirs', 'use_my_name', 'ask_me');

-- DropIndex
DROP INDEX "Pronoun_name_key";

-- AlterTable
ALTER TABLE "Pronoun" DROP COLUMN "name",
ADD COLUMN     "name" "PRONOUN" NOT NULL;
