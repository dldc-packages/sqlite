-- original: insert5.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE MAIN(Id INTEGER, Id1 INTEGER); 
    CREATE TABLE B(Id INTEGER, Id1 INTEGER); 
    CREATE VIEW v1 AS SELECT * FROM B;
    CREATE VIEW v2 AS SELECT * FROM MAIN;
    INSERT INTO MAIN(Id,Id1) VALUES(2,3); 
    INSERT INTO B(Id,Id1) VALUES(2,3)
;INSERT INTO B 
        SELECT * FROM B UNION ALL 
        SELECT * FROM MAIN WHERE exists (select * FROM B WHERE B.Id = MAIN.Id);
      SELECT * FROM B
;INSERT INTO B SELECT * FROM B;
      INSERT INTO B
        SELECT * FROM MAIN WHERE exists (select * FROM B WHERE B.Id = MAIN.Id);
      SELECT * FROM B;