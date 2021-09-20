-- original: fts4content.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(a, b, c);
  INSERT INTO t1 VALUES('w x', 'x y', 'y z');
  CREATE VIRTUAL TABLE ft1 USING fts4(content=t1)
;PRAGMA table_info(ft1)
;SELECT *, rowid FROM ft1
;SELECT a, c FROM ft1 WHERE rowid=1
;INSERT INTO ft1(ft1) VALUES('rebuild')
;SELECT rowid FROM ft1 WHERE ft1 MATCH 'x'
;SELECT rowid FROM ft1 WHERE ft1 MATCH 'a'
;DROP TABLE ft1;
  CREATE VIRTUAL TABLE ft1 USING fts4(content=t1, b);
  PRAGMA table_info(ft1)
;SELECT *, rowid FROM ft1
;CREATE TABLE t2(x);
  INSERT INTO t2 VALUES('O S W W F U C R Q I C N P Z Y Y E Y Y E');  -- 1
  INSERT INTO t2 VALUES('Y X U V L B E H Y J C Y A I A P V F V K');  -- 2
  INSERT INTO t2 VALUES('P W I N J H I I N I F B K D U Q B Z S F');  -- 3
  INSERT INTO t2 VALUES('N R O R H J R H G M D I U U B O M P A U');  -- 4
  INSERT INTO t2 VALUES('Y O V O G T P N G T N F I V B U M J M G');  -- 5
  INSERT INTO t2 VALUES('J O B N K N E C H Z R K J O U G M K L S');  -- 6
  INSERT INTO t2 VALUES('S Z S R I Q U A P W R X H K C Z U L S P');  -- 7
  INSERT INTO t2 VALUES('J C H N R C K R V N M O F Z M Z A I H W');  -- 8
  INSERT INTO t2 VALUES('O Y G I S J U U W O D Z F J K N R P R L');  -- 9
  INSERT INTO t2 VALUES('B G L K U R U P V X Z I H V R W C Q A S');  -- 10
  INSERT INTO t2 VALUES('T F T J F F Y V F W N X K Q A Y L X W G');  -- 11
  INSERT INTO t2 VALUES('C J U H B Q X L C M M Y E G V F W V Z C');  -- 12
  INSERT INTO t2 VALUES('B W L T F S G X D P H N G M R I O A X I');  -- 13
  INSERT INTO t2 VALUES('N G Y O K Q K Z N M H U J E D H U W R K');  -- 14
  INSERT INTO t2 VALUES('U D T R U Y F J D S J X E H Q G V A S Z');  -- 15
  INSERT INTO t2 VALUES('M I W P J S H R J D Q I C G P C T P H R');  -- 16
  INSERT INTO t2 VALUES('J M N I S L X Q C A B F C B Y D H V R J');  -- 17
  INSERT INTO t2 VALUES('F V Z W J Q L P X Y E W B U Q N H X K T');  -- 18
  INSERT INTO t2 VALUES('R F S R Y O F Q E I E G H C B H R X Y N');  -- 19
  INSERT INTO t2 VALUES('U Q Q Q T E P D M F X P J G H X C Q D L');  -- 20
;CREATE VIRTUAL TABLE ft2 USING fts4(content=t2);
  INSERT INTO ft2(ft2) VALUES('rebuild');

  -- Modify the backing table a bit: Row 17 is missing and the contents 
  -- of row 20 do not match the FTS index contents. 
  DELETE FROM t2 WHERE rowid = 17;
  UPDATE t2 SET x = 'a b c d e f g h i j' WHERE rowid = 20
;CREATE TABLE t3(x, y);
  CREATE VIRTUAL TABLE ft3 USING fts4(content=t3)
;INSERT INTO ft3(docid, x, y) VALUES(21, 'a b c', 'd e f');
  SELECT rowid FROM ft3 WHERE ft3 MATCH '"a b c"'
;SELECT * FROM t3
;DELETE FROM ft3;
  SELECT rowid FROM ft3 WHERE ft3 MATCH '"a b c"'
;INSERT INTO t3(rowid, x, y) VALUES(21, 'a b c', 'd e f');
  DELETE FROM ft3;
  SELECT rowid FROM ft3 WHERE ft3 MATCH '"a b c"'
;SELECT rowid FROM t3
;INSERT INTO ft3(rowid, x, y) VALUES(0, 'R T M S M', 'A F O K H');
  INSERT INTO ft3(rowid, x, y) VALUES(1, 'C Z J O X', 'U S Q D K');
  INSERT INTO ft3(rowid, x, y) VALUES(2, 'N G H P O', 'N O P O C');
  INSERT INTO ft3(rowid, x, y) VALUES(3, 'V H S D R', 'K N G E C');
  INSERT INTO ft3(rowid, x, y) VALUES(4, 'J T R V U', 'U X S L C');
  INSERT INTO ft3(rowid, x, y) VALUES(5, 'N A Y N G', 'X D G P Y');
  INSERT INTO ft3(rowid, x, y) VALUES(6, 'I Q I S P', 'D R O Q B');
  INSERT INTO ft3(rowid, x, y) VALUES(7, 'T K T Z J', 'B W D G O');
  INSERT INTO ft3(rowid, x, y) VALUES(8, 'Y K F X T', 'D F G V G');
  INSERT INTO ft3(rowid, x, y) VALUES(9, 'E L E T L', 'P W N F Z');
  INSERT INTO ft3(rowid, x, y) VALUES(10, 'O G J G X', 'G J F E P');
  INSERT INTO ft3(rowid, x, y) VALUES(11, 'O L N N Z', 'K E Z F D');
  INSERT INTO ft3(rowid, x, y) VALUES(12, 'R Z M R J', 'X G I M Z');
  INSERT INTO ft3(rowid, x, y) VALUES(13, 'L X N N X', 'R R N S T');
  INSERT INTO ft3(rowid, x, y) VALUES(14, 'F L B J H', 'K W F L C');
  INSERT INTO ft3(rowid, x, y) VALUES(15, 'P E B M V', 'E A A B U');
  INSERT INTO ft3(rowid, x, y) VALUES(16, 'V E C F P', 'L U T V K');
  INSERT INTO ft3(rowid, x, y) VALUES(17, 'T N O Z N', 'T P Q X N');
  INSERT INTO ft3(rowid, x, y) VALUES(18, 'V W U W R', 'H O A A V');
  INSERT INTO ft3(rowid, x, y) VALUES(19, 'A H N L F', 'I G H B O')
;INSERT INTO t3(rowid, x, y) VALUES(0, 'R T M S M', 'A F O K H');
  INSERT INTO t3(rowid, x, y) VALUES(1, 'C Z J O X', 'U S Q D K');
  INSERT INTO t3(rowid, x, y) VALUES(2, 'N G H P O', 'N O P O C');
  INSERT INTO t3(rowid, x, y) VALUES(3, 'V H S D R', 'K N G E C');
  INSERT INTO t3(rowid, x, y) VALUES(4, 'J T R V U', 'U X S L C');
  INSERT INTO t3(rowid, x, y) VALUES(5, 'N A Y N G', 'X D G P Y');
  UPDATE ft3 SET x = y, y = x;
  DELETE FROM t3
;INSERT INTO t3(rowid, x, y) VALUES(15, 'P E B M V', 'E A A B U');
  INSERT INTO t3(rowid, x, y) VALUES(16, 'V E C F P', 'L U T V K');
  INSERT INTO t3(rowid, x, y) VALUES(17, 'T N O Z N', 'T P Q X N');
  INSERT INTO t3(rowid, x, y) VALUES(18, 'V W U W R', 'H O A A V');
  INSERT INTO t3(rowid, x, y) VALUES(19, 'A H N L F', 'I G H B O');
  DELETE FROM ft3
;CREATE TABLE t4(x);
  CREATE VIRTUAL TABLE ft4 USING fts4(content=t4);
  CREATE VIRTUAL TABLE ft4x USING fts4(x)
;INSERT INTO ft4x(ft4x) VALUES('rebuild');
  INSERT INTO ft4(ft4) VALUES('rebuild')
;SELECT id, quote(value) FROM ft4_stat
;SELECT id, quote(value) FROM ft4x_stat
;INSERT INTO ft4x VALUES('M G M F T');
  INSERT INTO ft4x VALUES('Z Q C A U');
  INSERT INTO ft4x VALUES('N L L V');
  INSERT INTO ft4x VALUES('T F D X D');
  INSERT INTO ft4x VALUES('Z H I S D');

  SELECT id, quote(value) FROM ft4x_stat
;INSERT INTO ft4(rowid, x) SELECT rowid, * FROM ft4x;
  SELECT id, quote(value) FROM ft4_stat
;SELECT docid, quote(size) FROM ft4_docsize
;INSERT INTO ft4x(ft4x) VALUES('rebuild');
  SELECT id, quote(value) FROM ft4x_stat;
  SELECT docid, quote(size) FROM ft4x_docsize
;INSERT INTO ft4(ft4) VALUES('rebuild');
  SELECT id, quote(value) FROM ft4_stat;
  SELECT docid, quote(size) FROM ft4_docsize
;INSERT INTO t4(rowid, x) SELECT rowid, x FROM ft4x;
  INSERT INTO ft4(ft4) VALUES('rebuild');
  SELECT id, quote(value) FROM ft4_stat;
  SELECT docid, quote(size) FROM ft4_docsize
;CREATE TABLE t5(a, b, c, d);
  CREATE VIRTUAL TABLE ft5 USING fts4(content=t5);
  SELECT name FROM sqlite_master WHERE name LIKE '%t5%'
;ALTER TABLE ft5 RENAME TO ft6;
  SELECT name FROM sqlite_master WHERE name LIKE '%t5%'
;SELECT name FROM sqlite_master WHERE name LIKE '%t6%'
;INSERT INTO t5 VALUES('a', 'b', 'c', 'd');
  INSERT INTO ft6(ft6) VALUES('rebuild');
  SELECT rowid FROM ft6 WHERE ft6 MATCH 'b'
;DROP TABLE ft6;
  SELECT * FROM t5
;SELECT name FROM sqlite_master WHERE name LIKE '%t6%'
;CREATE VIRTUAL TABLE ft5 USING fts4(content=t5);
  CREATE TABLE t5_content(a, b);
  DROP TABLE ft5;
  SELECT name FROM sqlite_master WHERE name LIKE '%t5%'
;CREATE TABLE t7(one, two);
  CREATE VIRTUAL TABLE ft7 USING fts4(content=t7);
  INSERT INTO t7 VALUES('A B', 'B A');
  INSERT INTO t7 VALUES('C D', 'A A');
  SELECT * FROM ft7
;SELECT name FROM sqlite_master WHERE name LIKE '%t7%'
;CREATE TABLE t7(x, y);
  INSERT INTO t7 VALUES('A B', 'B A');
  INSERT INTO t7 VALUES('C D', 'A A');
  SELECT * FROM ft7
;INSERT INTO ft7(ft7) VALUES('rebuild');
  SELECT rowid FROM ft7 WHERE ft7 MATCH '"A A"'
;DROP TABLE t7;
  CREATE TABLE t7(x)
;CREATE VIRTUAL TABLE ft8 USING fts4(content=nosuchtable, x);
  INSERT INTO ft8(docid, x) VALUES(13, 'U O N X G');
  INSERT INTO ft8(docid, x) VALUES(14, 'C J J U B');
  INSERT INTO ft8(docid, x) VALUES(15, 'N J Y G X');
  INSERT INTO ft8(docid, x) VALUES(16, 'R Y D O R');
  INSERT INTO ft8(docid, x) VALUES(17, 'I Y T Q O')
;SELECT docid FROM ft8 WHERE ft8 MATCH 'N'
;SELECT docid FROM ft9 WHERE ft9 MATCH 'N'
;SELECT name FROM sqlite_master WHERE name LIKE 'ft9_%'
;CREATE TABLE t10(a, b);
  INSERT INTO t10 VALUES(
      'abasia abasic abask', 'Abassin abastardize abatable');
  INSERT INTO t10 VALUES(
      'abate abatement abater', 'abatis abatised abaton');
  INSERT INTO t10 VALUES(
      'abator abattoir Abatua', 'abature abave abaxial');

  CREATE VIRTUAL TABLE ft10 USING fts4(content=t10, prefix="2,4", a, b)
;SELECT * FROM ft10 WHERE a MATCH 'ab*'
;INSERT INTO ft10(ft10) VALUES('rebuild')
;SELECT rowid FROM ft10 WHERE a MATCH 'ab*'
;SELECT rowid FROM ft10 WHERE b MATCH 'abav*'
;SELECT rowid FROM ft10 WHERE ft10 MATCH 'abas*'
;CREATE TABLE tbl1(a, b);
  INSERT INTO tbl1 VALUES('a b', 'c d');
  INSERT INTO tbl1 VALUES('e f', 'a b');
  CREATE VIRTUAL TABLE e1 USING echo(tbl1);
  CREATE VIRTUAL TABLE ft1 USING fts4(content=e1);
  INSERT INTO ft1(ft1) VALUES('rebuild')
;SELECT rowid, * FROM ft1 WHERE ft1 MATCH 'e'
;SELECT rowid, * FROM ft1 WHERE ft1 MATCH 'a'
;DELETE FROM ft1 WHERE docid=1
;SELECT rowid, * FROM ft1 WHERE ft1 MATCH 'a'
;INSERT INTO ft1(ft1) VALUES('rebuild');
  SELECT rowid, * FROM ft1 WHERE ft1 MATCH 'a'
;CREATE TABLE idx(id INTEGER PRIMARY KEY, path TEXT);
  INSERT INTO idx VALUES (1, 't1.txt');
  INSERT INTO idx VALUES (2, 't2.txt');
  INSERT INTO idx VALUES (3, 't3.txt');

  CREATE VIRTUAL TABLE vt USING fs(idx);
  SELECT path, data FROM vt
;SELECT path, data FROM vt WHERE rowid = 2
;CREATE VIRTUAL TABLE ft USING fts4(content=vt);
  INSERT INTO ft(ft) VALUES('rebuild')
;SELECT snippet(ft, '[', ']', '...', -1, 5) FROM ft WHERE ft MATCH 'e'
;SELECT snippet(ft, '[', ']', '...', -1, 5) FROM ft WHERE ft MATCH 't'
;DELETE FROM ft WHERE docid=2
;SELECT snippet(ft, '[', ']', '...', -1, 5) FROM ft WHERE ft MATCH 'e';