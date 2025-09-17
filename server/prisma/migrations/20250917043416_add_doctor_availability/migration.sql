-- AlterTable
ALTER TABLE "public"."Doctor" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."Call" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Call" ADD CONSTRAINT "Call_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Call" ADD CONSTRAINT "Call_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
