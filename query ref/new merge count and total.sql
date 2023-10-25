
-- SELECT
--     ROUND(SUM(pvst."POS Total Sales"::numeric), 2) AS "POS Total Sales",
--     COUNT(pvst."SRS Store Code") AS "SRS Store Code",
--     ROUND(SUM(pvst."SRS Total Sales"::numeric), 2) AS "SRS Total Sales"
-- FROM (
    SELECT
        ROUND(SUM(pr."posTotalSales"::numeric), 2) AS "POS Total Sales",
        COUNT(srs."srsStoreCode") AS "SRS Store Code",
        ROUND(SUM(srs."srsTotalSales"::numeric), 2) AS "SRS Total Sales"
      
    FROM (
        SELECT hash_one AS hash_x, hash_two AS hash_y
        FROM pos_vs_srs_merge_transformed as pvs
        where pvs."date" >= '2023-01-01' AND pvs."date" <= '2023-01-10'
        GROUP BY hash_one, hash_two
    ) AS pvst
    LEFT JOIN pos_report_transformed pr ON pvst.hash_x = pr.hash
    LEFT JOIN srs_transformed srs ON pvst.hash_y = srs.hash
-- ) AS pvst;




	select count (pvst."ref")
	FROM (
	 SELECT count(*) As "ref"
        FROM pos_vs_srs_merge_transformed as pvs
        where pvs."date" >= '2023-01-01' AND pvs."date" <= '2023-01-10'
        GROUP BY hash_one, hash_two
	) AS "pvst"


    -- count missmatch 


             SELECT COUNT(source."_id") AS "Remarks" ,ROUND(SUM(source."posTotalSales"::numeric),2) AS "POS Total Sales" ,COUNT(source."_id") AS "SRS Store Code" ,ROUND(SUM(source."srsTotalSales"::numeric),2) AS "SRS Total Sales" ,ROUND(SUM(source."variance"::numeric),2) AS "Actual Variance" 
              FROM (
                SELECT "hash_two","hash_one"
                FROM pos_vs_srs_merge_transformed 
                WHERE  source."date" >= '2023-01-01' AND source."date" <= '2023-01-10'       
                GROUP BY "hash_two","hash_one"
            ) AS source
             LEFT JOIN pos_report_transformed pr ON source.hash_one = pr.hash 
             LEFT JOIN srs_transformed srs ON source.hash_two = srs.hash