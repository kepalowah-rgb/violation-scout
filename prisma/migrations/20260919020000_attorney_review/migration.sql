-- Attorney-review connection: timestamp recording when the subscriber
-- requested the configured attorney to review a contract draft.

-- AlterTable
ALTER TABLE "ContractDraft" ADD COLUMN "reviewRequestedAt" TIMESTAMP(3);
