-- original: crash4.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE a(id INTEGER, name CHAR(50))
;INSERT INTO a(id,name) VALUES(1,'one')
;INSERT INTO a(id,name) VALUES(2,'two')
;INSERT INTO a(id,name) VALUES(3,'three')
;INSERT INTO a(id,name) VALUES(4,'four')
;INSERT INTO a(id,name) VALUES(5,'five')
;INSERT INTO a(id,name) VALUES(6,'six')
;INSERT INTO a(id,name) VALUES(7,'seven')
;INSERT INTO a(id,name) VALUES(8,'eight')
;INSERT INTO a(id,name) VALUES(9,'nine')
;INSERT INTO a(id,name) VALUES(10,'ten')
;UPDATE A SET name='new text for row 3' WHERE id=3;