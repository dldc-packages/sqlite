-- original: autoindex4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a,b);
  INSERT INTO t1 VALUES(123,'abc'),(234,'def'),(234,'ghi'),(345,'jkl');
  CREATE TABLE t2(x,y);
  INSERT INTO t2 VALUES(987,'zyx'),(654,'wvu'),(987,'rqp');

  SELECT *, '|' FROM t1, t2 WHERE a=234 AND x=987 ORDER BY +b
;SELECT *, '|' FROM t1, t2 WHERE a=234 AND x=555
;SELECT *, '|' FROM t1 LEFT JOIN t2 ON a=234 AND x=555
;SELECT *, '|' FROM t1 LEFT JOIN t2 ON x=555 WHERE a=234
;SELECT *, '|' FROM t1 LEFT JOIN t2 WHERE a=234 AND x=555
;CREATE TABLE t3(e,f);
  INSERT INTO t3 VALUES(123,654),(555,444),(234,987);

  SELECT (SELECT count(*) FROM t1, t2 WHERE a=e AND x=f), e, f, '|'
    FROM t3
   ORDER BY rowid
;CREATE TABLE A(Name text);
  CREATE TABLE Items(ItemName text , Name text);
  INSERT INTO Items VALUES('Item1','Parent');
  INSERT INTO Items VALUES('Item2','Parent');
  CREATE TABLE B(Name text);
  
  SELECT Items.ItemName
    FROM Items
      LEFT JOIN A ON (A.Name = Items.ItemName and Items.ItemName = 'dummy')
      LEFT JOIN B ON (B.Name = Items.ItemName)
    WHERE Items.Name = 'Parent'
    ORDER BY Items.ItemName
;CREATE INDEX Items_x1 ON Items(ItemName,Name) WHERE ItemName = 'dummy';
  
  SELECT Items.ItemName
    FROM Items
      LEFT JOIN A ON (A.Name = Items.ItemName and Items.ItemName = 'dummy')
      LEFT JOIN B ON (B.Name = Items.ItemName)
    WHERE Items.Name = 'Parent'
    ORDER BY Items.ItemName;