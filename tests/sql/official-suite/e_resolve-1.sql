-- original: e_resolve.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

SELECT * FROM n1
;SELECT * FROM n2
;SELECT * FROM n3
;SELECT * FROM n4
;SELECT * FROM main.n1
;SELECT * FROM temp.n1
;SELECT * FROM at1.n1
;SELECT * FROM at2.n1
;SELECT * FROM MAIN.n1
;SELECT * FROM tEmP.n1
;SELECT * FROM aT1.n1
;SELECT * FROM At2.n1
;SELECT * FROM n3
;SELECT * FROM n4
;ATTACH 'file.db' AS aux;
  CREATE TABLE t1(x, y);
  CREATE TEMP TABLE t1(x, y);
  CREATE TABLE aux.t1(x, y)
;DROP TABLE t1
;DROP TABLE t1
;DROP TABLE t1;