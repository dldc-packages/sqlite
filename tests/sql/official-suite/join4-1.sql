-- original: join4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

create temp table t1(a integer, b varchar(10));
      insert into t1 values(1,'one');
      insert into t1 values(2,'two');
      insert into t1 values(3,'three');
      insert into t1 values(4,'four');
  
      create temp table t2(x integer, y varchar(10), z varchar(10));
      insert into t2 values(2,'niban','ok');
      insert into t2 values(4,'yonban','err')
;select * from t1 left outer join t2 on t1.a=t2.x where t2.z='ok'
;create table t1(a integer, b varchar(10));
      insert into t1 values(1,'one');
      insert into t1 values(2,'two');
      insert into t1 values(3,'three');
      insert into t1 values(4,'four');
  
      create table t2(x integer, y varchar(10), z varchar(10));
      insert into t2 values(2,'niban','ok');
      insert into t2 values(4,'yonban','err')
;select * from t1 left outer join t2 on t1.a=t2.x where t2.z='ok'
;select * from t1 left outer join t2 on t1.a=t2.x and t2.z='ok'
;create index i2 on t2(z)
;select * from t1 left outer join t2 on t1.a=t2.x where t2.z='ok'
;select * from t1 left outer join t2 on t1.a=t2.x and t2.z='ok'
;select * from t1 left outer join t2 on t1.a=t2.x where t2.z>='ok'
;select * from t1 left outer join t2 on t1.a=t2.x and t2.z>='ok'
;select * from t1 left outer join t2 on t1.a=t2.x where t2.z IN ('ok')
;select * from t1 left outer join t2 on t1.a=t2.x and t2.z IN ('ok');