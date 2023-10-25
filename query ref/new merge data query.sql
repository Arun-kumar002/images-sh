SELECT pvst.*, pr.*, srs.*
FROM (
    SELECT hash_x, hash_y
    FROM pos_vs_srs_merge_transformed
    GROUP BY hash_x, hash_y
    LIMIT 100 OFFSET 100
) AS pvst
LEFT JOIN pos_report_transformed pr ON pvst.hash_x = pr.hash
LEFT JOIN srs_transformed  srs ON pvst.hash_y = srs.hash;


SELECT pvst.*, pr.*, srs.*
FROM pos_vs_srs_merge_transformed pvst
LEFT JOIN pos_report_transformed pr ON pvst.hash_x = pr.hash_x
LEFT JOIN srs_transformed srs ON pvst.hash_y = srs.hash_y;



	SELECT pvst.*, pr.*, srs.*,pr1.*
FROM (
    SELECT hash_one AS hash_x, hash_two AS hash_y,hash_three AS hash_z
    FROM pos_vs_srs_test_transformed
    GROUP BY hash_one, hash_two,hash_three
    LIMIT 100 OFFSET 100
) AS pvst
LEFT JOIN pos_report_transformed pr ON pvst.hash_x = pr.hash
LEFT JOIN srs_transformed  srs ON pvst.hash_y = srs.hash
LEFT JOIN "pos_report_transformed1" AS pr1 ON pvst.hash_z = pr1.hash





SELECT ROUND(SUM(source."posTotalSales"::numeric),2) AS "POS Total Sales" ,COUNT(source."_id") AS "SRS Store Code" ,ROUND(SUM(source."srsTotalSales"::numeric),2) AS "SRS Total Sales" ,ROUND(SUM(source."variance"::numeric),2) AS "Actual Variance" FROM "pos_vs_srs_merge_transformed" as source WHERE  source."date" >= '2023-01-01' AND source."date" <= '2023-01-10'   

SELECT
    ROUND(SUM(pvst."POS Total Sales"::numeric), 2) AS "POS Total Sales",
    COUNT(pvst."SRS Store Code") AS "SRS Store Code",
    ROUND(SUM(pvst."SRS Total Sales"::numeric), 2) AS "SRS Total Sales"
FROM (
    SELECT
        hash_x AS hash_x,
        hash_y AS hash_y,
        hash_z AS hash_z,
        date As "date"
        ROUND(SUM(pr."posTotalSales"::numeric), 2) AS "POS Total Sales",
        COUNT(srs."srsStoreCode") AS "SRS Store Code",
        ROUND(SUM(srs."srsTotalSales"::numeric), 2) AS "SRS Total Sales"
      
    FROM (
        SELECT hash_one AS hash_x, hash_two AS hash_y, hash_three AS hash_z
        FROM pos_vs_srs_test_transformed
        
        GROUP BY hash_one, hash_two, hash_three
    ) AS pvst
    LEFT JOIN pos_report_transformed pr ON pvst.hash_x = pr.hash
    LEFT JOIN srs_transformed srs ON pvst.hash_y = srs.hash
    LEFT JOIN "pos_report_transformed1" AS pr1 ON pvst.hash_z = pr1.hash
    WHERE pr."posSystemDate" >= '2023-01-01' AND pr."posSystemDate" <= '2023-01-10'
    GROUP BY pvst.hash_x, pvst.hash_y, pvst.hash_z
) AS pvst;