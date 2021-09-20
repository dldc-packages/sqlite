-- original: collate2.test
-- credit:   http://www.sqlite.org/src/tree?ci=trunk&name=test

CREATE TABLE collate2t1(
      a COLLATE BINARY, 
      b COLLATE NOCASE, 
      c COLLATE BACKWARDS
    );
    INSERT INTO collate2t1 VALUES( NULL, NULL, NULL );

    INSERT INTO collate2t1 VALUES( 'aa', 'aa', 'aa' );
    INSERT INTO collate2t1 VALUES( 'ab', 'ab', 'ab' );
    INSERT INTO collate2t1 VALUES( 'ba', 'ba', 'ba' );
    INSERT INTO collate2t1 VALUES( 'bb', 'bb', 'bb' );

    INSERT INTO collate2t1 VALUES( 'aA', 'aA', 'aA' );
    INSERT INTO collate2t1 VALUES( 'aB', 'aB', 'aB' );
    INSERT INTO collate2t1 VALUES( 'bA', 'bA', 'bA' );
    INSERT INTO collate2t1 VALUES( 'bB', 'bB', 'bB' );

    INSERT INTO collate2t1 VALUES( 'Aa', 'Aa', 'Aa' );
    INSERT INTO collate2t1 VALUES( 'Ab', 'Ab', 'Ab' );
    INSERT INTO collate2t1 VALUES( 'Ba', 'Ba', 'Ba' );
    INSERT INTO collate2t1 VALUES( 'Bb', 'Bb', 'Bb' );

    INSERT INTO collate2t1 VALUES( 'AA', 'AA', 'AA' );
    INSERT INTO collate2t1 VALUES( 'AB', 'AB', 'AB' );
    INSERT INTO collate2t1 VALUES( 'BA', 'BA', 'BA' );
    INSERT INTO collate2t1 VALUES( 'BB', 'BB', 'BB' )
;CREATE INDEX collate2t1_i1 ON collate2t1(a);
      CREATE INDEX collate2t1_i2 ON collate2t1(b);
      CREATE INDEX collate2t1_i3 ON collate2t1(c)
;SELECT a FROM collate2t1 WHERE a > 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE a COLLATE binary > 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE b COLLATE binary > 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE c COLLATE binary > 'aa' ORDER BY 1
;SELECT b FROM collate2t1 WHERE b > 'aa' ORDER BY 1, oid
;SELECT b FROM collate2t1 WHERE a COLLATE nocase > 'aa'
     ORDER BY 1, oid
;SELECT b FROM collate2t1 WHERE b COLLATE nocase > 'aa'
     ORDER BY 1, oid
;SELECT b FROM collate2t1 WHERE c COLLATE nocase > 'aa'
     ORDER BY 1, oid
;SELECT b FROM collate2t1 WHERE b > 'aa' ORDER BY +b
;SELECT b FROM collate2t1 WHERE a COLLATE nocase > 'aa' ORDER BY +b
;SELECT b FROM collate2t1 WHERE b COLLATE nocase > 'aa' ORDER BY +b
;SELECT b FROM collate2t1 WHERE c COLLATE nocase > 'aa' ORDER BY +b
;SELECT c FROM collate2t1 WHERE c > 'aa' ORDER BY 1
;SELECT c FROM collate2t1 WHERE a COLLATE backwards > 'aa'
    ORDER BY 1
;SELECT c FROM collate2t1 WHERE b COLLATE backwards > 'aa'
    ORDER BY 1
;SELECT c FROM collate2t1 WHERE c COLLATE backwards > 'aa'
    ORDER BY 1
;SELECT a FROM collate2t1 WHERE a < 'aa' ORDER BY 1
;SELECT b FROM collate2t1 WHERE b < 'aa' ORDER BY 1, oid
;SELECT b FROM collate2t1 WHERE b < 'aa' ORDER BY +b
;SELECT c FROM collate2t1 WHERE c < 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE a = 'aa'
;SELECT b FROM collate2t1 WHERE b = 'aa' ORDER BY oid
;SELECT c FROM collate2t1 WHERE c = 'aa'
;SELECT a FROM collate2t1 WHERE a >= 'aa' ORDER BY 1
;SELECT b FROM collate2t1 WHERE b >= 'aa' ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE c >= 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE a <= 'aa' ORDER BY 1
;SELECT b FROM collate2t1 WHERE b <= 'aa' ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE c <= 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE a BETWEEN 'Aa' AND 'Bb' ORDER BY 1
;SELECT b FROM collate2t1 WHERE b BETWEEN 'Aa' AND 'Bb' ORDER BY 1, oid
;SELECT b FROM collate2t1 WHERE b BETWEEN 'Aa' AND 'Bb' ORDER BY +b
;SELECT c FROM collate2t1 WHERE c BETWEEN 'Aa' AND 'Bb' ORDER BY 1
;SELECT a FROM collate2t1 WHERE 
      CASE a WHEN 'aa' THEN 1 ELSE 0 END
        ORDER BY 1, oid
;SELECT b FROM collate2t1 WHERE 
      CASE b WHEN 'aa' THEN 1 ELSE 0 END
        ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE 
      CASE c WHEN 'aa' THEN 1 ELSE 0 END
        ORDER BY 1, oid
;SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb') ORDER BY 1, oid
;SELECT b FROM collate2t1 WHERE b IN ('aa', 'bb') ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE c IN ('aa', 'bb') ORDER BY 1, oid
;SELECT a FROM collate2t1 
        WHERE a IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb'))
;SELECT b FROM collate2t1 
        WHERE b IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb'))
;SELECT c FROM collate2t1 
        WHERE c IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb'))
;SELECT a FROM collate2t1 WHERE NOT a > 'aa' ORDER BY 1
;SELECT b FROM collate2t1 WHERE NOT b > 'aa' ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE NOT c > 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE NOT a < 'aa' ORDER BY 1
;SELECT b FROM collate2t1 WHERE NOT b < 'aa' ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE NOT c < 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE NOT a = 'aa'
;SELECT b FROM collate2t1 WHERE NOT b = 'aa'
;SELECT c FROM collate2t1 WHERE NOT c = 'aa'
;SELECT a FROM collate2t1 WHERE NOT a >= 'aa' ORDER BY 1
;SELECT b FROM collate2t1 WHERE NOT b >= 'aa' ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE NOT c >= 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE NOT a <= 'aa' ORDER BY 1
;SELECT b FROM collate2t1 WHERE NOT b <= 'aa' ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE NOT c <= 'aa' ORDER BY 1
;SELECT a FROM collate2t1 WHERE a NOT BETWEEN 'Aa' AND 'Bb' ORDER BY 1
;SELECT b FROM collate2t1 WHERE b NOT BETWEEN 'Aa' AND 'Bb' ORDER BY 1, oid
;SELECT c FROM collate2t1 WHERE c NOT BETWEEN 'Aa' AND 'Bb' ORDER BY 1
;SELECT a FROM collate2t1 WHERE NOT CASE a WHEN 'aa' THEN 1 ELSE 0 END
;SELECT b FROM collate2t1 WHERE NOT CASE b WHEN 'aa' THEN 1 ELSE 0 END
;SELECT c FROM collate2t1 WHERE NOT CASE c WHEN 'aa' THEN 1 ELSE 0 END
;SELECT a FROM collate2t1 WHERE NOT a IN ('aa', 'bb')
;SELECT b FROM collate2t1 WHERE NOT b IN ('aa', 'bb')
;SELECT c FROM collate2t1 WHERE NOT c IN ('aa', 'bb')
;SELECT a FROM collate2t1 
        WHERE NOT a IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb'))
;SELECT b FROM collate2t1 
        WHERE NOT b IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb'))
;SELECT c FROM collate2t1 
        WHERE NOT c IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb'))
;SELECT a > 'aa' FROM collate2t1
;SELECT b > 'aa' FROM collate2t1
;SELECT c > 'aa' FROM collate2t1
;SELECT a < 'aa' FROM collate2t1
;SELECT b < 'aa' FROM collate2t1
;SELECT c < 'aa' FROM collate2t1
;SELECT a = 'aa' FROM collate2t1
;SELECT b = 'aa' FROM collate2t1
;SELECT c = 'aa' FROM collate2t1
;SELECT a <= 'aa' FROM collate2t1
;SELECT b <= 'aa' FROM collate2t1
;SELECT c <= 'aa' FROM collate2t1
;SELECT a >= 'aa' FROM collate2t1
;SELECT b >= 'aa' FROM collate2t1
;SELECT c >= 'aa' FROM collate2t1
;SELECT a BETWEEN 'Aa' AND 'Bb' FROM collate2t1
;SELECT b BETWEEN 'Aa' AND 'Bb' FROM collate2t1
;SELECT c BETWEEN 'Aa' AND 'Bb' FROM collate2t1
;SELECT CASE a WHEN 'aa' THEN 1 ELSE 0 END FROM collate2t1
;SELECT CASE b WHEN 'aa' THEN 1 ELSE 0 END FROM collate2t1
;SELECT CASE c WHEN 'aa' THEN 1 ELSE 0 END FROM collate2t1
;SELECT a IN ('aa', 'bb') FROM collate2t1
;SELECT b IN ('aa', 'bb') FROM collate2t1
;SELECT c IN ('aa', 'bb') FROM collate2t1
;SELECT a IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb')) 
        FROM collate2t1
;SELECT b IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb')) 
        FROM collate2t1
;SELECT c IN (SELECT a FROM collate2t1 WHERE a IN ('aa', 'bb')) 
        FROM collate2t1
;CREATE TABLE collate2t2(b COLLATE binary);
    CREATE TABLE collate2t3(b text);
    INSERT INTO collate2t2 VALUES('aa');
    INSERT INTO collate2t3 VALUES('aa')
;SELECT collate2t1.a FROM collate2t1, collate2t2 
      WHERE collate2t1.b = collate2t2.b;