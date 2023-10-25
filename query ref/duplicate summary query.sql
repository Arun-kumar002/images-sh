SELECT
    COUNT(*) AS "Count",
    SUM("netReceivable") AS "POS Total",
    SUM("loadAmount") AS "Customer Centria Total",
    'Duplicate' AS "Discrepancy"
FROM
    "sb7_pos_vs_customer_centria_transformed" AS source
WHERE
    source."date" >= '2023-04-12' AND
    source."date" <= '2023-10-12' AND
    source."hash_one" IN (
        SELECT "hash_one"
        FROM "sb7_pos_vs_customer_centria_transformed"
        GROUP BY "hash_one"
        HAVING COUNT(*) > 1
    )
