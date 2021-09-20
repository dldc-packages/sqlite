-- original: where8.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a, b TEXT, c);
    CREATE INDEX i1 ON t1(a);
    CREATE INDEX i2 ON t1(b);

    INSERT INTO t1 VALUES(1,  'one',   'I');
    INSERT INTO t1 VALUES(2,  'two',   'II');
    INSERT INTO t1 VALUES(3,  'three', 'III');
    INSERT INTO t1 VALUES(4,  'four',  'IV');
    INSERT INTO t1 VALUES(5,  'five',  'V');
    INSERT INTO t1 VALUES(6,  'six',   'VI');
    INSERT INTO t1 VALUES(7,  'seven', 'VII');
    INSERT INTO t1 VALUES(8,  'eight', 'VIII');
    INSERT INTO t1 VALUES(9,  'nine',  'IX');
    INSERT INTO t1 VALUES(10, 'ten',   'X')
;CREATE VIRTUAL TABLE e1 USING echo(t1);
      SELECT b FROM e1
;SELECT c FROM e1 WHERE a=1 OR b='three'
;CREATE TABLE t2(d, e, f);
    CREATE INDEX i3 ON t2(d);
    CREATE INDEX i4 ON t2(e);

    INSERT INTO t2 VALUES(1,  NULL,         'I');
    INSERT INTO t2 VALUES(2,  'four',       'IV');
    INSERT INTO t2 VALUES(3,  NULL,         'IX');
    INSERT INTO t2 VALUES(4,  'sixteen',    'XVI');
    INSERT INTO t2 VALUES(5,  NULL,         'XXV');
    INSERT INTO t2 VALUES(6,  'thirtysix',  'XXXVI');
    INSERT INTO t2 VALUES(7,  'fortynine',  'XLIX');
    INSERT INTO t2 VALUES(8,  'sixtyeight', 'LXIV');
    INSERT INTO t2 VALUES(9,  'eightyone',  'LXXXIX');
    INSERT INTO t2 VALUES(10, NULL,         'C')
;BEGIN;
    CREATE TABLE t3(a INTEGER, b REAL, c TEXT);
    CREATE TABLE t4(f INTEGER, g REAL, h TEXT);
    INSERT INTO t3 VALUES('hills', NULL, 1415926535);
    INSERT INTO t3 VALUES('and', 'of', NULL);
    INSERT INTO t3 VALUES('have', 'towering', 53594.08128);
    INSERT INTO t3 VALUES(NULL, 45.64856692, 'Not');
    INSERT INTO t3 VALUES('same', 5028841971, NULL);
    INSERT INTO t3 VALUES('onlookers', 'in', 8214808651);
    INSERT INTO t3 VALUES(346.0348610, 2643383279, NULL);
    INSERT INTO t3 VALUES(1415926535, 'of', 'are');
    INSERT INTO t3 VALUES(NULL, 0.4811174502, 'snapshots');
    INSERT INTO t3 VALUES('over', 'the', 8628034825);
    INSERT INTO t3 VALUES(8628034825, 66.59334461, 2847564.823);
    INSERT INTO t3 VALUES('onlookers', 'same', 'and');
    INSERT INTO t3 VALUES(NULL, 'light', 6939937510);
    INSERT INTO t3 VALUES('from', 'their', 'viewed');
    INSERT INTO t3 VALUES('from', 'Alpine', 'snapshots');
    INSERT INTO t3 VALUES('from', 'sometimes', 'unalike');
    INSERT INTO t3 VALUES(1339.360726, 'light', 'have');
    INSERT INTO t3 VALUES(6939937510, 3282306647, 'other');
    INSERT INTO t3 VALUES('paintings', 8628034825, 'all');
    INSERT INTO t3 VALUES('paintings', NULL, 'same');
    INSERT INTO t3 VALUES('Alpine', 378678316.5, 'unalike');
    INSERT INTO t3 VALUES('Alpine', NULL, 'same');
    INSERT INTO t3 VALUES(1339.360726, 2847564.823, 'over');
    INSERT INTO t3 VALUES('villages', 'their', 'have');
    INSERT INTO t3 VALUES('unalike', 'remarkably', 'in');
    INSERT INTO t3 VALUES('and', 8979323846, 'and');
    INSERT INTO t3 VALUES(NULL, 1415926535, 'an');
    INSERT INTO t3 VALUES(271.2019091, 8628034825, 0.4811174502);
    INSERT INTO t3 VALUES('all', 3421170679, 'the');
    INSERT INTO t3 VALUES('Not', 'and', 1415926535);
    INSERT INTO t3 VALUES('of', 'other', 'light');
    INSERT INTO t3 VALUES(NULL, 'towering', 'Not');
    INSERT INTO t3 VALUES(346.0348610, NULL, 'other');
    INSERT INTO t3 VALUES('Not', 378678316.5, NULL);
    INSERT INTO t3 VALUES('snapshots', 8628034825, 'of');
    INSERT INTO t3 VALUES(3282306647, 271.2019091, 'and');
    INSERT INTO t3 VALUES(50.58223172, 378678316.5, 5028841971);
    INSERT INTO t3 VALUES(50.58223172, 2643383279, 'snapshots');
    INSERT INTO t3 VALUES('writings', 8979323846, 8979323846);
    INSERT INTO t3 VALUES('onlookers', 'his', 'in');
    INSERT INTO t3 VALUES('unalike', 8628034825, 1339.360726);
    INSERT INTO t3 VALUES('of', 'Alpine', 'and');
    INSERT INTO t3 VALUES('onlookers', NULL, 'from');
    INSERT INTO t3 VALUES('writings', 'it', 1339.360726);
    INSERT INTO t3 VALUES('it', 'and', 'villages');
    INSERT INTO t3 VALUES('an', 'the', 'villages');
    INSERT INTO t3 VALUES(8214808651, 8214808651, 'same');
    INSERT INTO t3 VALUES(346.0348610, 'light', 1415926535);
    INSERT INTO t3 VALUES(NULL, 8979323846, 'and');
    INSERT INTO t3 VALUES(NULL, 'same', 1339.360726);
    INSERT INTO t4 VALUES('his', 'from', 'an');
    INSERT INTO t4 VALUES('snapshots', 'or', NULL);
    INSERT INTO t4 VALUES('Alpine', 'have', 'it');
    INSERT INTO t4 VALUES('have', 'peak', 'remarkably');
    INSERT INTO t4 VALUES('hills', NULL, 'Not');
    INSERT INTO t4 VALUES('same', 'from', 2643383279);
    INSERT INTO t4 VALUES('have', 'angle', 8628034825);
    INSERT INTO t4 VALUES('sometimes', 'it', 2847564.823);
    INSERT INTO t4 VALUES(0938446095, 'peak', 'of');
    INSERT INTO t4 VALUES(8628034825, 'and', 'same');
    INSERT INTO t4 VALUES('and', 271.2019091, 'their');
    INSERT INTO t4 VALUES('the', 'of', 'remarkably');
    INSERT INTO t4 VALUES('and', 3421170679, 1415926535);
    INSERT INTO t4 VALUES('and', 'in', 'all');
    INSERT INTO t4 VALUES(378678316.5, 0.4811174502, 'snapshots');
    INSERT INTO t4 VALUES('it', 'are', 'have');
    INSERT INTO t4 VALUES('angle', 'snapshots', 378678316.5);
    INSERT INTO t4 VALUES('from', 1415926535, 8628034825);
    INSERT INTO t4 VALUES('snapshots', 'angle', 'have');
    INSERT INTO t4 VALUES(3421170679, 0938446095, 'Not');
    INSERT INTO t4 VALUES('peak', NULL, 0.4811174502);
    INSERT INTO t4 VALUES('same', 'have', 'Alpine');
    INSERT INTO t4 VALUES(271.2019091, 66.59334461, 0938446095);
    INSERT INTO t4 VALUES(8979323846, 'his', 'an');
    INSERT INTO t4 VALUES(NULL, 'and', 3282306647);
    INSERT INTO t4 VALUES('remarkably', NULL, 'Not');
    INSERT INTO t4 VALUES('villages', 4543.266482, 'his');
    INSERT INTO t4 VALUES(2643383279, 'paintings', 'onlookers');
    INSERT INTO t4 VALUES(1339.360726, 'of', 'the');
    INSERT INTO t4 VALUES('peak', 'other', 'peak');
    INSERT INTO t4 VALUES('it', 'or', 8979323846);
    INSERT INTO t4 VALUES('onlookers', 'Not', 'towering');
    INSERT INTO t4 VALUES(NULL, 'peak', 'Not');
    INSERT INTO t4 VALUES('of', 'have', 6939937510);
    INSERT INTO t4 VALUES('light', 'hills', 0.4811174502);
    INSERT INTO t4 VALUES(5028841971, 'Not', 'it');
    INSERT INTO t4 VALUES('and', 'Not', NULL);
    INSERT INTO t4 VALUES(346.0348610, 'villages', NULL);
    INSERT INTO t4 VALUES(8979323846, NULL, 6939937510);
    INSERT INTO t4 VALUES('an', 'light', 'peak');
    INSERT INTO t4 VALUES(5028841971, 6939937510, 'light');
    INSERT INTO t4 VALUES('sometimes', 'peak', 'peak');
    INSERT INTO t4 VALUES(378678316.5, 5028841971, 'an');
    INSERT INTO t4 VALUES(378678316.5, 'his', 'Alpine');
    INSERT INTO t4 VALUES('from', 'of', 'all');
    INSERT INTO t4 VALUES(0938446095, 'same', NULL);
    INSERT INTO t4 VALUES(0938446095, 'Alpine', NULL);
    INSERT INTO t4 VALUES('his', 'of', 378678316.5);
    INSERT INTO t4 VALUES(271.2019091, 'viewed', 3282306647);
    INSERT INTO t4 VALUES('hills', 'all', 'peak');
    CREATE TABLE t5(s);
    INSERT INTO t5 VALUES('tab-t5');
    CREATE TABLE t6(t);
    INSERT INTO t6 VALUES(123456);
    COMMIT
;DROP INDEX IF EXISTS i5;
    DROP INDEX IF EXISTS i6;
    DROP INDEX IF EXISTS i7;
    DROP INDEX IF EXISTS i8
;CREATE TABLE tA(
      a, b, c, d, e, f, g, h, 
      i, j, k, l, m, n, o, p
    )
;SELECT * FROM tA WHERE
      a=1 AND b=2 AND c=3 AND d=4 AND e=5 AND f=6 AND g=7 AND h=8 AND
      i=1 AND j=2 AND k=3 AND l=4 AND m=5 AND n=6 AND o=7 AND
      (p = 1 OR p = 2 OR p = 3)
;SELECT * FROM tA WHERE
      a=1 AND b=2 AND c=3 AND d=4 AND e=5 AND f=6 AND g=7 AND h=8 AND
      i=1 AND j=2 AND k=3 AND l=4 AND m=5 AND
      (p = 1 OR p = 2 OR p = 3) AND n=6 AND o=7
;INSERT INTO tA VALUES(1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8); 
    CREATE UNIQUE INDEX tAI ON tA(p);
    CREATE TABLE tB(x);
    INSERT INTO tB VALUES('x')
;SELECT a, x FROM tA LEFT JOIN tB ON (
      a=1 AND b=2 AND c=3 AND d=4 AND e=5 AND f=6 AND g=7 AND h=8 AND
      i=1 AND j=2 AND k=3 AND l=4 AND m=5 AND n=6 AND o=7 AND
      (p = 1 OR p = 2 OR p = 3)
    )
;CREATE TABLE t600(a PRIMARY KEY, b) WITHOUT rowid;
  CREATE INDEX t600b ON t600(b);
  INSERT INTO t600 VALUES('state','screen'),('exact','dolphin'),('green','mercury');
  SELECT a, b, '|' FROM t600 WHERE a=='state' OR b='mercury' ORDER BY +a;