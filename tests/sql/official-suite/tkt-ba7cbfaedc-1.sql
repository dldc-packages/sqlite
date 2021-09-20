-- original: tkt-ba7cbfaedc.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1 (x, y);
  INSERT INTO t1 VALUES (3, 'a');
  INSERT INTO t1 VALUES (1, 'a'); 
  INSERT INTO t1 VALUES (2, 'b');
  INSERT INTO t1 VALUES (2, 'a');
  INSERT INTO t1 VALUES (3, 'b');
  INSERT INTO t1 VALUES (1, 'b')
;CREATE INDEX i1 ON t1(x, y)
;drop table if exists t1;
  create table t1(id int);
  insert into t1(id) values(1),(2),(3),(4),(5);
  create index t1_idx_id on t1(id asc);
  select * from t1 group by id order by id;
  select * from t1 group by id order by id asc;
  select * from t1 group by id order by id desc;