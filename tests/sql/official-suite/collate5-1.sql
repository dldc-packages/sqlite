-- original: collate5.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE collate5t1(a COLLATE nocase, b COLLATE text);

    INSERT INTO collate5t1 VALUES('a', 'apple');
    INSERT INTO collate5t1 VALUES('A', 'Apple');
    INSERT INTO collate5t1 VALUES('b', 'banana');
    INSERT INTO collate5t1 VALUES('B', 'banana');
    INSERT INTO collate5t1 VALUES('n', NULL);
    INSERT INTO collate5t1 VALUES('N', NULL)
;SELECT DISTINCT a FROM collate5t1
;SELECT DISTINCT b FROM collate5t1
;SELECT DISTINCT a, b FROM collate5t1
;CREATE TABLE tkt3376(a COLLATE nocase PRIMARY KEY);
    INSERT INTO tkt3376 VALUES('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
    INSERT INTO tkt3376 VALUES('ABXYZ012234567890123456789ABXYZ012234567890123456789ABXYZ012234567890123456789ABXYZ012234567890123456789ABXYZ012234567890123456789ABXYZ012234567890123456789ABXYZ012234567890123456789');
    SELECT DISTINCT a FROM tkt3376
;PRAGMA encoding=UTF16le;
    CREATE TABLE tkt3376(a COLLATE nocase PRIMARY KEY);
    INSERT INTO tkt3376 VALUES('abc');
    INSERT INTO tkt3376 VALUES('ABX');
    SELECT DISTINCT a FROM tkt3376
;CREATE TABLE collate5t2(a COLLATE text, b COLLATE nocase);

    INSERT INTO collate5t2 VALUES('a', 'apple');
    INSERT INTO collate5t2 VALUES('A', 'apple');
    INSERT INTO collate5t2 VALUES('b', 'banana');
    INSERT INTO collate5t2 VALUES('B', 'Banana')
;SELECT a FROM collate5t1 UNION select a FROM collate5t2
;SELECT a FROM collate5t2 UNION select a FROM collate5t1
;SELECT a, b FROM collate5t1 UNION select a, b FROM collate5t2
;SELECT a, b FROM collate5t2 UNION select a, b FROM collate5t1
;SELECT a FROM collate5t1 EXCEPT select a FROM collate5t2
;SELECT a FROM collate5t2 EXCEPT select a FROM collate5t1 WHERE a != 'a'
;SELECT a, b FROM collate5t1 EXCEPT select a, b FROM collate5t2
;SELECT a, b FROM collate5t2 EXCEPT select a, b FROM collate5t1 
      where a != 'a'
;SELECT a FROM collate5t1 INTERSECT select a FROM collate5t2
;SELECT a FROM collate5t2 INTERSECT select a FROM collate5t1 WHERE a != 'a'
;SELECT a, b FROM collate5t1 INTERSECT select a, b FROM collate5t2
;SELECT a, b FROM collate5t2 INTERSECT select a, b FROM collate5t1
;BEGIN;
    CREATE TABLE collate5t3(a, b)
;COMMIT;
    SELECT * FROM collate5t3 UNION SELECT * FROM collate5t3
;DROP TABLE collate5t3
;SELECT a FROM collate5t1 UNION ALL SELECT a FROM collate5t2 ORDER BY 1
;SELECT a FROM collate5t2 UNION ALL SELECT a FROM collate5t1 ORDER BY 1
;SELECT a FROM collate5t1 UNION ALL SELECT a FROM collate5t2 
      ORDER BY 1 COLLATE TEXT
;CREATE TABLE collate5t_cn(a COLLATE NUMERIC);
    CREATE TABLE collate5t_ct(a COLLATE TEXT);
    INSERT INTO collate5t_cn VALUES('1');
    INSERT INTO collate5t_cn VALUES('11');
    INSERT INTO collate5t_cn VALUES('101');
    INSERT INTO collate5t_ct SELECT * FROM collate5t_cn
;SELECT a FROM collate5t_cn INTERSECT SELECT a FROM collate5t_ct ORDER BY 1
;SELECT a FROM collate5t_ct INTERSECT SELECT a FROM collate5t_cn ORDER BY 1
;DROP TABLE collate5t_cn;
    DROP TABLE collate5t_ct;
    DROP TABLE collate5t1;
    DROP TABLE collate5t2
;CREATE TABLE collate5t1(a COLLATE NOCASE, b COLLATE NUMERIC); 
    INSERT INTO collate5t1 VALUES('a', '1');
    INSERT INTO collate5t1 VALUES('A', '1.0');
    INSERT INTO collate5t1 VALUES('b', '2');
    INSERT INTO collate5t1 VALUES('B', '3')
;SELECT a, count(*) FROM collate5t1 GROUP BY a
;SELECT a, b, count(*) FROM collate5t1 GROUP BY a, b ORDER BY a, b
;DROP TABLE collate5t1;