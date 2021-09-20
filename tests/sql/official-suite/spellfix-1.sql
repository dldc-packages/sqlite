-- original: spellfix.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE VIRTUAL TABLE t1 USING spellfix1
;INSERT INTO t1(word) VALUES(sub_word)
;CREATE TABLE vocab(w TEXT PRIMARY KEY);
    INSERT INTO vocab SELECT word FROM t1
;SELECT next_char('re','vocab','w')
;SELECT next_char('re','(SELECT w AS x FROM vocab)','x')
;SELECT next_char('r','vocab','w')
;SELECT next_char('','vocab','w')
;CREATE TABLE vocab2(w TEXT);
  CREATE INDEX vocab2w ON vocab2(w COLLATE nocase);
  INSERT INTO vocab2 VALUES('abc'), ('ABD'), ('aBe'), ('AbF');
  SELECT next_char('ab', 'vocab2', 'w', null, 'nocase')
;SELECT next_char('ab','vocab2','w',null,null)
;SELECT next_char('AB','vocab2','w',null,'NOCASE')
;SELECT next_char('ab','vocab2','w',null,'binary')
;SELECT rowid FROM t1 WHERE word='rabbit'
;UPDATE t1 SET rowid=2000 WHERE word='rabbit';
  SELECT rowid FROM t1 WHERE word='rabbit'
;INSERT INTO t1(rowid, word) VALUES(3000,'melody');
  SELECT rowid, word, matchlen FROM t1 WHERE word MATCH 'melotti'
   ORDER BY score LIMIT 3
;CREATE VIRTUAL TABLE t2 USING spellfix1;
  INSERT INTO t2 (word, soundslike) VALUES('school', 'skuul');
  INSERT INTO t2 (word, soundslike) VALUES('psalm', 'sarm');
  SELECT word, matchlen FROM t2 WHERE word MATCH 'sar*' LIMIT 5
;SELECT word, matchlen FROM t2 WHERE word MATCH 'skol*' LIMIT 5
;CREATE TABLE costs(iLang, cFrom, cTo, iCost);
  INSERT INTO costs VALUES(0, 'a', 'e', 1);
  INSERT INTO costs VALUES(0, 'e', 'i', 1);
  INSERT INTO costs VALUES(0, 'i', 'o', 1);
  INSERT INTO costs VALUES(0, 'o', 'u', 1);
  INSERT INTO costs VALUES(0, 'u', 'a', 1);
  CREATE VIRTUAL TABLE t3 USING spellfix1(edit_cost_table=costs)
;INSERT INTO t3(word) VALUES(sub_w)
;INSERT INTO t3(command) VALUES('edit_cost_table=NULL')
;CREATE TABLE costs2(iLang, cFrom, cTo, iCost);
  INSERT INTO costs2 VALUES(0, 'a', 'o', 1);
  INSERT INTO costs2 VALUES(0, 'e', 'o', 4);
  INSERT INTO costs2 VALUES(0, 'i', 'o', 8);
  INSERT INTO costs2 VALUES(0, 'u', 'o', 16);
  INSERT INTO t3(command) VALUES('edit_cost_table="costs2"')
;SELECT word FROM t3 WHERE rowid = 10
;SELECT word, distance FROM t3 WHERE rowid = 10
;SELECT word, distance FROM t3 WHERE rowid = 10 AND word MATCH 'kiiner'
;CREATE VIRTUAL TABLE t4 USING spellfix1;
  PRAGMA table_info = t4
;INSERT INTO t4(rowid, word) VALUES(1, 'Archilles');
  INSERT INTO t4(rowid, word) VALUES(2, 'Pluto');
  INSERT INTO t4(rowid, word) VALUES(3, 'Atrides');
  INSERT OR REPLACE INTO t4(rowid, word) VALUES(2, 'Apollo');
  SELECT rowid, word FROM t4
;INSERT OR IGNORE INTO t4(rowid, word) VALUES(3, 'Zeus');
  SELECT rowid, word FROM t4
;UPDATE OR REPLACE t4 SET rowid=3 WHERE rowid=1;
  SELECT rowid, word FROM t4
;UPDATE OR IGNORE t4 SET rowid=3 WHERE rowid=2;
  SELECT rowid, word FROM t4
;DELETE FROM t4;
  INSERT INTO t4(rowid, word) VALUES(10, 'Agamemnon');
  INSERT INTO t4(rowid, word) VALUES(20, 'Patroclus');
  INSERT INTO t4(rowid, word) VALUES(30, 'Chryses');

  CREATE TABLE t5(i, w);
  INSERT INTO t5 VALUES(5,  'Poseidon');
  INSERT INTO t5 VALUES(20, 'Chronos');
  INSERT INTO t5 VALUES(30, 'Hera');