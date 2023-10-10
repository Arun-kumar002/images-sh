SELECT * 
            FROM (
                SELECT "hash_one","hash_two"
                FROM "pos_vs_srs_merge_transformed" as source
                 WHERE  source."date" >= '2023-01-01' AND source."date" <= '2023-01-15'
                GROUP BY "hash_one","hash_two"
            ) AS source
             LEFT JOIN pos_report_transformed source1 ON source."hash_one" = source1.hash LEFT JOIN srs_transformed source2 ON source."hash_two" = source1.hash
			 
-- //intersect select 
