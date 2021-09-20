-- original: in3.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a PRIMARY KEY, b);
    INSERT INTO t1 VALUES(1, 2);
    INSERT INTO t1 VALUES(3, 4);
    INSERT INTO t1 VALUES(5, 6)
;DROP TABLE IF EXISTS t1;
    CREATE TABLE t1(w int, x int, y int);
    CREATE TABLE t2(p int, q int, r int, s int)
;INSERT INTO t1 VALUES(sub_w,sub_x,sub_y)
;select max(y) from t1
;INSERT INTO t2 SELECT 101-w, x, sub_maxy+1-y, y FROM t1
;SELECT rowid 
    FROM t1 
    WHERE rowid IN (SELECT rowid FROM t1 WHERE rowid IN (1, 2))
;select rowid from t1 where rowid IN (-1,2,4)
;SELECT rowid FROM t1 WHERE rowid IN 
       (select rowid from t1 where rowid IN (-1,2,4))
;DROP TABLE t1;
    DROP TABLE t2
;CREATE TABLE t1(a BLOB, b NUMBER ,c TEXT);
    CREATE UNIQUE INDEX t1_i1 ON t1(a);        /* no affinity */
    CREATE UNIQUE INDEX t1_i2 ON t1(b);        /* numeric affinity */
    CREATE UNIQUE INDEX t1_i3 ON t1(c);        /* text affinity */

    CREATE TABLE t2(x BLOB, y NUMBER, z TEXT);
    CREATE UNIQUE INDEX t2_i1 ON t2(x);        /* no affinity */
    CREATE UNIQUE INDEX t2_i2 ON t2(y);        /* numeric affinity */
    CREATE UNIQUE INDEX t2_i3 ON t2(z);        /* text affinity */

    INSERT INTO t1 VALUES(1, 1, 1);
    INSERT INTO t2 VALUES('1', '1', '1')
;CREATE TABLE t3(a, b, c);
    CREATE UNIQUE INDEX t3_i ON t3(b, a)
;INSERT INTO t3 VALUES(1, 'numeric', 2);
    INSERT INTO t3 VALUES(2, 'text', 2);
    INSERT INTO t3 VALUES(3, 'real', 2);
    INSERT INTO t3 VALUES(4, 'none', 2)
;CREATE UNIQUE INDEX t3_i2 ON t3(b)
;DROP INDEX t3_i2
;CREATE TABLE Folders(
      folderid INTEGER PRIMARY KEY, 
      parentid INTEGER, 
      rootid INTEGER, 
      path VARCHAR(255)
    );