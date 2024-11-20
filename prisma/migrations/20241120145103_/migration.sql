-- CreateTable
CREATE TABLE "fxql_statements" (
    "EntryId" SERIAL NOT NULL,
    "SourceCurrency" TEXT NOT NULL,
    "DestinationCurrency" TEXT NOT NULL,
    "SellPrice" DECIMAL(10,4) NOT NULL,
    "BuyPrice" DECIMAL(10,4) NOT NULL,
    "CapAmount" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "fxql_statements_pkey" PRIMARY KEY ("EntryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "fxql_statements_SourceCurrency_DestinationCurrency_key" ON "fxql_statements"("SourceCurrency", "DestinationCurrency");
