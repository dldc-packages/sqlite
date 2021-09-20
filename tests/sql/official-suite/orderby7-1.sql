-- original: orderby7.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE fts USING fts3(content TEXT);
  INSERT INTO fts(rowid,content)
     VALUES(1,'this is a test of the fts3 virtual'),
           (2,'table used as part of a join together'),
           (3,'with the DISTINCT keyword.  There was'),
           (4,'a bug at one time (2013-06 through 2014-04)'),
           (5,'that prevented this from working correctly.'),
           (11,'a row that occurs twice'),
           (12,'a row that occurs twice');
 
  CREATE TABLE t1(x TEXT PRIMARY KEY, y);
  INSERT OR IGNORE INTO t1 SELECT content, rowid+100 FROM fts
;SELECT DISTINCT fts.rowid, t1.y
    FROM fts, t1
   WHERE fts MATCH 'that twice'
     AND content=x
   ORDER BY y
;SELECT DISTINCT fts.rowid, t1.x
    FROM fts, t1
   WHERE fts MATCH 'that twice'
     AND content=x
   ORDER BY 1
;SELECT DISTINCT t1.x
    FROM fts, t1
   WHERE fts MATCH 'that twice'
     AND content=x
   ORDER BY 1
;SELECT t1.x
    FROM fts, t1
   WHERE fts MATCH 'that twice'
     AND content=x
   ORDER BY 1
;SELECT DISTINCT t1.x
    FROM fts, t1
   WHERE fts MATCH 'that twice'
     AND content=x
;SELECT t1.x
    FROM fts, t1
   WHERE fts MATCH 'that twice'
     AND content=x
;SELECT DISTINCT t1.x
    FROM fts, t1
   WHERE fts.rowid=11
     AND content=x
   ORDER BY fts.rowid
;SELECT DISTINCT t1.*
    FROM fts, t1
   WHERE fts.rowid=11
     AND content=x
   ORDER BY fts.rowid
;SELECT DISTINCT t1.*
    FROM fts, t1
   WHERE fts.rowid=11
     AND content=x
   ORDER BY t1.y;