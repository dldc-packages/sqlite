-- original: tkt3121.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

PRAGMA encoding = 'utf16';

    CREATE TABLE r1(field);
    CREATE TABLE r2(col PRIMARY KEY, descr);

    INSERT INTO r1 VALUES('abcd');
    INSERT INTO r2 VALUES('abcd', 'A nice description');
    INSERT INTO r2 VALUES('efgh', 'Another description');

    CREATE VIRTUAL TABLE t1 USING echo(r1);
    CREATE VIRTUAL TABLE t2 USING echo(r2)
;select
      t1.field as Field,
      t2.descr as Descr
    from t1 inner join t2 on t1.field = t2.col order by t1.field;