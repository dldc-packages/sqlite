-- original: tkt3630.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TEMP TABLE temp1(a,b,c);
    SELECT * FROM sqlite_temp_master WHERE sql GLOB '*TEMP*'
;CREATE TABLE main1(a,b,c);
    CREATE TEMP TABLE temp2 AS SELECT * FROM main1;
    SELECT * FROM sqlite_temp_master WHERE sql GLOB '*TEMP*'
;ALTER TABLE temp2 ADD COLUMN d;
      ALTER TABLE temp2 RENAME TO temp2rn;
      SELECT name FROM sqlite_temp_master WHERE name LIKE 'temp2%';