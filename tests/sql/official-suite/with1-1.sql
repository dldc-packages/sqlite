-- original: with1.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE t1(x INTEGER, y INTEGER);
  WITH x(a) AS ( SELECT * FROM t1) SELECT 10
;SELECT * FROM ( WITH x AS ( SELECT * FROM t1) SELECT 10 )
;WITH x(a) AS ( SELECT * FROM t1) INSERT INTO t1 VALUES(1,2)
;WITH x(a) AS ( SELECT * FROM t1) DELETE FROM t1
;WITH x(a) AS ( SELECT * FROM t1) UPDATE t1 SET x = y
;DROP TABLE IF EXISTS t1;
  CREATE TABLE t1(x);
  INSERT INTO t1 VALUES(1);
  INSERT INTO t1 VALUES(2);
  WITH tmp AS ( SELECT * FROM t1 ) SELECT x FROM tmp
;WITH tmp(a) AS ( SELECT * FROM t1 ) SELECT a FROM tmp
;SELECT * FROM (
    WITH tmp(a) AS ( SELECT * FROM t1 ) SELECT a FROM tmp
  )
;WITH tmp1(a) AS ( SELECT * FROM t1 ),
       tmp2(x) AS ( SELECT * FROM tmp1)
  SELECT * FROM tmp2
;WITH tmp2(x) AS ( SELECT * FROM tmp1),
       tmp1(a) AS ( SELECT * FROM t1 )
  SELECT * FROM tmp2
;CREATE TABLE t3(x);
  CREATE TABLE t4(x);

  INSERT INTO t3 VALUES('T3');
  INSERT INTO t4 VALUES('T4');

  WITH t3(a) AS (SELECT * FROM t4)
  SELECT * FROM t3
;WITH tmp  AS ( SELECT * FROM t3 ),
       tmp2 AS ( WITH tmp AS ( SELECT * FROM t4 ) SELECT * FROM tmp )
  SELECT * FROM tmp2
;WITH tmp  AS ( SELECT * FROM t3 ),
       tmp2 AS ( WITH xxxx AS ( SELECT * FROM t4 ) SELECT * FROM tmp )
  SELECT * FROM tmp2
;DROP TABLE IF EXISTS t1;
  CREATE TABLE t1(x);
  INSERT INTO t1 VALUES(1);
  INSERT INTO t1 VALUES(2);
  INSERT INTO t1 VALUES(3);
  INSERT INTO t1 VALUES(4);

  WITH dset AS ( SELECT 2 UNION ALL SELECT 4 )
  DELETE FROM t1 WHERE x IN dset;
  SELECT * FROM t1
;WITH iset AS ( SELECT 2 UNION ALL SELECT 4 )
  INSERT INTO t1 SELECT * FROM iset;
  SELECT * FROM t1
;WITH uset(a, b) AS ( SELECT 2, 8 UNION ALL SELECT 4, 9 )
  UPDATE t1 SET x = COALESCE( (SELECT b FROM uset WHERE a=x), x );
  SELECT * FROM t1
;WITH i(x) AS ( VALUES(1) UNION ALL SELECT x+1 FROM i)
  SELECT x FROM i LIMIT 10
;CREATE TABLE edge(xfrom, xto, seq, PRIMARY KEY(xfrom, xto)) WITHOUT ROWID;
  INSERT INTO edge VALUES(0, 1, 10);
  INSERT INTO edge VALUES(1, 2, 20);
  INSERT INTO edge VALUES(0, 3, 30);
  INSERT INTO edge VALUES(2, 4, 40);
  INSERT INTO edge VALUES(3, 4, 40);
  INSERT INTO edge VALUES(2, 5, 50);
  INSERT INTO edge VALUES(3, 6, 60);
  INSERT INTO edge VALUES(5, 7, 70);
  INSERT INTO edge VALUES(3, 7, 70);
  INSERT INTO edge VALUES(4, 8, 80);
  INSERT INTO edge VALUES(7, 8, 80);
  INSERT INTO edge VALUES(8, 9, 90);
  
  WITH RECURSIVE
    ancest(id, mtime) AS
      (VALUES(0, 0)
       UNION
       SELECT edge.xto, edge.seq FROM edge, ancest
        WHERE edge.xfrom=ancest.id
        ORDER BY 2
      )
  SELECT * FROM ancest
;WITH RECURSIVE
    ancest(id, mtime) AS
      (VALUES(0, 0)
       UNION ALL
       SELECT edge.xto, edge.seq FROM edge, ancest
        WHERE edge.xfrom=ancest.id
        ORDER BY 2
      )
  SELECT * FROM ancest
;WITH RECURSIVE
    ancest(id, mtime) AS
      (VALUES(0, 0)
       UNION ALL
       SELECT edge.xto, edge.seq FROM edge, ancest
        WHERE edge.xfrom=ancest.id
        ORDER BY 2 LIMIT 4 OFFSET 2
      )
  SELECT * FROM ancest
;WITH i(x) AS ( VALUES(1) UNION ALL SELECT (x+1)%10 FROM i)
  SELECT x FROM i LIMIT 20
;WITH i(x) AS ( VALUES(1) UNION SELECT (x+1)%10 FROM i)
  SELECT x FROM i LIMIT 20
;CREATE TABLE f(
      id INTEGER PRIMARY KEY, parentid REFERENCES f, name TEXT
  );

  INSERT INTO f VALUES(0, NULL, '');
  INSERT INTO f VALUES(1, 0, 'bin');
    INSERT INTO f VALUES(2, 1, 'true');
    INSERT INTO f VALUES(3, 1, 'false');
    INSERT INTO f VALUES(4, 1, 'ls');
    INSERT INTO f VALUES(5, 1, 'grep');
  INSERT INTO f VALUES(6, 0, 'etc');
    INSERT INTO f VALUES(7, 6, 'rc.d');
      INSERT INTO f VALUES(8, 7, 'rc.apache');
      INSERT INTO f VALUES(9, 7, 'rc.samba');
  INSERT INTO f VALUES(10, 0, 'home');
    INSERT INTO f VALUES(11, 10, 'dan');
      INSERT INTO f VALUES(12, 11, 'public_html');
        INSERT INTO f VALUES(13, 12, 'index.html');
          INSERT INTO f VALUES(14, 13, 'logo.gif')
;WITH flat(fid, fpath) AS (
    SELECT id, '' FROM f WHERE parentid IS NULL
    UNION ALL
    SELECT id, fpath || '/' || name FROM f, flat WHERE parentid=fid
  )
  SELECT fpath FROM flat WHERE fpath!='' ORDER BY 1
;WITH flat(fid, fpath) AS (
    SELECT id, '' FROM f WHERE parentid IS NULL
    UNION ALL
    SELECT id, fpath || '/' || name FROM f, flat WHERE parentid=fid
  )
  SELECT count(*) FROM flat
;WITH x(i) AS (
    SELECT 1
    UNION ALL
    SELECT i+1 FROM x WHERE i<10
  )
  SELECT count(*) FROM x
;CREATE TABLE tree(i, p);
  INSERT INTO tree VALUES(1, NULL);
  INSERT INTO tree VALUES(2, 1);
  INSERT INTO tree VALUES(3, 1);
  INSERT INTO tree VALUES(4, 2);
  INSERT INTO tree VALUES(5, 4)
;WITH t(id, path) AS (
    SELECT i, '' FROM tree WHERE p IS NULL
    UNION ALL
    SELECT i, path || '/' || i FROM tree, t WHERE p = id
  ) 
  SELECT path FROM t
;WITH t(id) AS (
    VALUES(2)
    UNION ALL
    SELECT i FROM tree, t WHERE p = id
  ) 
  SELECT id FROM t
;WITH RECURSIVE
    xaxis(x) AS (VALUES(-2.0) UNION ALL SELECT x+0.05 FROM xaxis WHERE x<1.2),
    yaxis(y) AS (VALUES(-1.0) UNION ALL SELECT y+0.1 FROM yaxis WHERE y<1.0),
    m(iter, cx, cy, x, y) AS (
      SELECT 0, x, y, 0.0, 0.0 FROM xaxis, yaxis
      UNION ALL
      SELECT iter+1, cx, cy, x*x-y*y +cx, 2.0*x*y +cy FROM m 
       WHERE (x*x +y*y) < 4.0 AND iter<28
    ),
    m2(iter, cx, cy) AS (
      SELECT max(iter), cx, cy FROM m GROUP BY cx, cy
    ),
    a(t) AS (
      SELECT group_concat( substr(' .+*#', 1+min(iter/7,4), 1), '') 
      FROM m2 GROUP BY cy
    )
  SELECT group_concat(rtrim(t),x'0a') FROM a
;WITH RECURSIVE
    input(sud) AS (
      VALUES('53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79')
    ),
  
    /* A table filled with digits 1..9, inclusive. */
    digits(z, lp) AS (
      VALUES('1', 1)
      UNION ALL SELECT
      CAST(lp+1 AS TEXT), lp+1 FROM digits WHERE lp<9
    ),
  
    /* The tricky bit. */
    x(s, ind) AS (
      SELECT sud, instr(sud, '.') FROM input
      UNION ALL
      SELECT
        substr(s, 1, ind-1) || z || substr(s, ind+1),
        instr( substr(s, 1, ind-1) || z || substr(s, ind+1), '.' )
       FROM x, digits AS z
      WHERE ind>0
        AND NOT EXISTS (
              SELECT 1
                FROM digits AS lp
               WHERE z.z = substr(s, ((ind-1)/9)*9 +lp, 1)
                  OR z.z = substr(s, ((ind-1)%9) +(lp-1)*9 + 1, 1)
                  OR z.z = substr(s, (((ind-1)/3) % 3) * 3
                          +((ind-1)/27) * 27 +lp
                          +((lp-1) / 3) * 6, 1)
           )
    )
  SELECT s FROM x WHERE ind=0
;DROP TABLE IF EXISTS tree;
  CREATE TABLE tree(id INTEGER PRIMARY KEY, parentid, payload)
;DELETE FROM tree
;INSERT INTO tree VALUES(NULL, sub_parentid, sub_seg)
;WITH flat(fid, p) AS (
    SELECT id, '/' || payload FROM tree WHERE parentid IS NULL
    UNION ALL
    SELECT id, p || '/' || payload FROM flat, tree WHERE parentid=fid
  )
  SELECT p FROM flat ORDER BY p
;WITH t(a) AS (
    SELECT 1 AS b UNION ALL SELECT a+1 AS c FROM t WHERE a<5 ORDER BY b
  ) 
  SELECT * FROM t
;WITH t(a) AS (
    SELECT 1 AS b UNION ALL SELECT a+1 AS c FROM t WHERE a<5 ORDER BY c
  ) 
  SELECT * FROM t
;WITH flat(fid, depth, p) AS (
    SELECT id, 1, '/' || payload FROM tree WHERE parentid IS NULL
    UNION ALL
    SELECT id, depth+1, p||'/'||payload FROM flat, tree WHERE parentid=fid
    ORDER BY 2, 3 COLLATE nocase
  )
  SELECT p FROM flat
;WITH flat(fid, depth, p) AS (
      SELECT id, 1, ('/' || payload) COLLATE nocase 
      FROM tree WHERE parentid IS NULL
    UNION ALL
      SELECT id, depth+1, (p||'/'||payload)
      FROM flat, tree WHERE parentid=fid
    ORDER BY 2, 3
  )
  SELECT p FROM flat
;WITH flat(fid, depth, p) AS (
      SELECT id, 1, ('/' || payload)
      FROM tree WHERE parentid IS NULL
    UNION ALL
      SELECT id, depth+1, (p||'/'||payload) COLLATE nocase 
      FROM flat, tree WHERE parentid=fid
    ORDER BY 2, 3
  )
  SELECT p FROM flat
;CREATE TABLE tst(a,b);
  INSERT INTO tst VALUES('a', 'A');
  INSERT INTO tst VALUES('b', 'B');
  INSERT INTO tst VALUES('c', 'C');
  SELECT a COLLATE nocase FROM tst UNION ALL SELECT b FROM tst ORDER BY 1
;SELECT a FROM tst UNION ALL SELECT b COLLATE nocase FROM tst ORDER BY 1
;SELECT a||'' FROM tst UNION ALL SELECT b COLLATE nocase FROM tst ORDER BY 1
;CREATE TABLE org(
    name TEXT PRIMARY KEY,
    boss TEXT REFERENCES org
  ) WITHOUT ROWID;
  INSERT INTO org VALUES('Alice',NULL);
  INSERT INTO org VALUES('Bob','Alice');
  INSERT INTO org VALUES('Cindy','Alice');
  INSERT INTO org VALUES('Dave','Bob');
  INSERT INTO org VALUES('Emma','Bob');
  INSERT INTO org VALUES('Fred','Cindy');
  INSERT INTO org VALUES('Gail','Cindy');
  INSERT INTO org VALUES('Harry','Dave');
  INSERT INTO org VALUES('Ingrid','Dave');
  INSERT INTO org VALUES('Jim','Emma');
  INSERT INTO org VALUES('Kate','Emma');
  INSERT INTO org VALUES('Lanny','Fred');
  INSERT INTO org VALUES('Mary','Fred');
  INSERT INTO org VALUES('Noland','Gail');
  INSERT INTO org VALUES('Olivia','Gail');
  -- The above are all under Alice.  Add a few more records for people
  -- not in Alice's group, just to prove that they won't be selected.
  INSERT INTO org VALUES('Xaviar',NULL);
  INSERT INTO org VALUES('Xia','Xaviar');
  INSERT INTO org VALUES('Xerxes','Xaviar');
  INSERT INTO org VALUES('Xena','Xia');
  -- Find all members of Alice's group, breath-first order  
  WITH RECURSIVE
    under_alice(name,level) AS (
       VALUES('Alice','0')
       UNION ALL
       SELECT org.name, under_alice.level+1
         FROM org, under_alice
        WHERE org.boss=under_alice.name
        ORDER BY 2
    )
  SELECT group_concat(substr('...............',1,level*3) || name,x'0a')
    FROM under_alice
;WITH RECURSIVE
    under_alice(name,level) AS (
       VALUES('Alice','0')
       UNION ALL
       SELECT org.name, under_alice.level+1
         FROM org, under_alice
        WHERE org.boss=under_alice.name
        ORDER BY 2 DESC
    )
  SELECT group_concat(substr('...............',1,level*3) || name,x'0a')
    FROM under_alice
;WITH RECURSIVE
    under_alice(name,level) AS (
       VALUES('Alice','0')
       UNION ALL
       SELECT org.name, under_alice.level+1
         FROM org, under_alice
        WHERE org.boss=under_alice.name
    )
  SELECT group_concat(substr('...............',1,level*3) || name,x'0a')
    FROM under_alice
;WITH RECURSIVE
  t1(x) AS (VALUES(2) UNION ALL SELECT x+2 FROM t1 WHERE x<20),
  t2(y) AS (VALUES(3) UNION ALL SELECT y+3 FROM t2 WHERE y<20)
SELECT x FROM t1 EXCEPT SELECT y FROM t2 ORDER BY 1
;WITH x AS (SELECT * FROM t) SELECT 0 EXCEPT SELECT 0 ORDER BY 1 COLLATE binary
;WITH x(a) AS (
    WITH y(b) AS (SELECT 10)
    SELECT 9 UNION ALL SELECT * FROM y
  )
  SELECT * FROM x
;WITH x AS (
    WITH y(b) AS (SELECT 10)
    SELECT * FROM y UNION ALL SELECT * FROM y
  )
  SELECT * FROM x
;WITH x AS (
        WITH y(b) AS (SELECT 10)
        SELECT * FROM y UNION ALL SELECT * FROM y
    )
    SELECT * FROM x
;WITH 
  x1 AS (SELECT 10),
  x2 AS (SELECT * FROM x1),
  x3 AS (
    WITH x1 AS (SELECT 11)
    SELECT * FROM x2 UNION ALL SELECT * FROM x2
  )
  SELECT * FROM x3
;WITH 
  x1 AS (SELECT 10),
  x2 AS (SELECT * FROM x1),
  x3 AS (
    WITH x1 AS (SELECT 11)
    SELECT * FROM x2 UNION ALL SELECT * FROM x1
  )
  SELECT * FROM x3
;WITH 
  x1 AS (SELECT 10),
  x2 AS (SELECT * FROM x1),
  x3 AS (
    WITH 
      x1 AS ( SELECT 11 ),
      x4 AS ( SELECT * FROM x2 )
    SELECT * FROM x4 UNION ALL SELECT * FROM x1
  )
  SELECT * FROM x3
;WITH 
  x1 AS (SELECT 10),
  x2 AS (SELECT * FROM x1),
  x3 AS (
    WITH 
      x1 AS ( SELECT 11 ),
      x4 AS ( SELECT * FROM x2 )
    SELECT * FROM x4 UNION ALL SELECT * FROM x1
  )
  SELECT * FROM x3
;WITH 
  x1 AS (SELECT 10),
  x2 AS (SELECT 11),
  x3 AS (
    SELECT * FROM x1 UNION ALL SELECT * FROM x2
  ),
  x4 AS (
    WITH 
    x1 AS (SELECT 12),
    x2 AS (SELECT 13)
    SELECT * FROM x3
  )
  SELECT * FROM x4
;WITH xyz(x) AS (VALUES(NULL) UNION SELECT round(1<x) FROM xyz ORDER BY 1)
  SELECT quote(x) FROM xyz
;WITH xyz(x) AS (
    SELECT printf('%d', 5) * NULL
    UNION SELECT round(1<1+x) 
    FROM xyz ORDER BY 1
  )
  SELECT 1 FROM xyz;