CREATE INDEX "discrepancindex" on "sb21_zomato_vs_hdfc_stmt_transformed" ("discrepancy")
CREATE INDEX "reconciledindex" on "sb21_zomato_vs_hdfc_stmt_transformed" ("reconciled")
CREATE INDEX "netAmount1index" on "sb21_zomato_vs_hdfc_stmt_transformed" ("netAmount1")
CREATE INDEX "finalAmountindex" on "sb21_zomato_vs_hdfc_stmt_transformed" ("finalAmount")
CREATE INDEX "_idindex" on "sb21_zomato_vs_hdfc_stmt_transformed" ("_id")



CREATE INDEX "_idindex1" on "sb_7_giftcardredemptionpos_transformed" ("_id")
CREATE INDEX "storeIdindex1" on "sb_7_giftcardredemptionpos_transformed" ("storeId")
CREATE INDEX "netReceivableindex1" on "sb_7_giftcardredemptionpos_transformed" ("netReceivable")
CREATE INDEX "invoiceDateindex1" on "sb_7_giftcardredemptionpos_transformed" ("invoiceDate")
CREATE INDEX "loadAmountindex1" on "sb7_pos_vs_customer_centria_transformed" ("loadAmount")
CREATE INDEX "discrepancyindex1" on "sb7_pos_vs_customer_centria_transformed" ("discrepancy")
CREATE INDEX "dateindex1" on "sb7_pos_vs_customer_centria_transformed" ("date")
CREATE INDEX "reconciledindex1" on "sb7_pos_vs_customer_centria_transformed" ("reconciled")
CREATE INDEX "netReceivable1index1" on "sb7_pos_vs_customer_centria_transformed" ("netReceivable")


CREATE INDEX "orderTotal1index1" on "sb7_pos_vs_customer_centria_transformed" ("orderTotal")
CREATE INDEX "orderSubTotal1index1" on "sb7_pos_vs_customer_centria_transformed" ("orderSubTotal")
CREATE INDEX "discountAmount1index1" on "sb7_pos_vs_customer_centria_transformed" ("discountAmount")
CREATE INDEX "packagingChargesTax1index1" on "sb7_pos_vs_customer_centria_transformed" ("packagingChargesTax")
CREATE INDEX "Remarks1index1" on "sb7_pos_vs_customer_centria_transformed" ("Remarks")
CREATE INDEX "Summary1index1" on "sb7_pos_vs_customer_centria_transformed" ("Summary")



CREATE INDEX "_id1index2" on "sb_40_axisbankchargeanalysis_transformed" ("_id")
CREATE INDEX "grossAmt1index2" on "sb_40_axisbankchargeanalysis_transformed" ("grossAmt")
CREATE INDEX "mdr1index2" on "sb_40_axisbankchargeanalysis_transformed" ("mdr")
CREATE INDEX "discrepancy1index2" on "sb_40_axisbankchargeanalysis_transformed" ("discrepancy")
CREATE INDEX "reconciled1index2" on "sb_40_axisbankchargeanalysis_transformed" ("reconciled")




await sequelize.query(SELECT COUNT(source."_id") AS "Count",SUM(source."grossAmt") AS "Gross Amount Total",SUM(source."mdr") AS "MDR Total", source."discrepancy" AS "Discrepancy"  FROM "sb_40_axisbankchargeanalysis_transformed" as source WHERE  source."processDate" >= '2023-04-15' AND source."processDate" <= '2023-10-15' AND  source."discrepancy" IS NOT NULL GROUP BY source."discrepancy", { logging: false }); {"component":"API","timestamp":"2023-10-15T14:51:10.923Z","uuid":"97107484-2c80-4221-a3e7-e4fcf4adb2b8"}
