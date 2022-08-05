<?php
   class MyDB extends SQLite3
   {
      function __construct()
      {
         $this->open('./db/factory_log.db');
      }
   }
   $db = new MyDB();
   if(!$db){
      echo $db->lastErrorMsg();
   } else {
      echo "Opened database successfully\n";
   }

   $sql =<<<EOF
      CREATE TABLE log
      (
      ID INTEGER PRIMARY KEY     AUTOINCREMENT,
      TRACKING       TEXT    NOT NULL,
      BTMAC          TEXT    NOT NULL,
      WiFiMAC        TEXT    NOT NULL,
      HM10           TEXT    NOT NULL,
      WiFi           TEXT    NOT NULL,
      MIC            TEXT    NOT NULL,
      DHT11          TEXT    NOT NULL,
      GPIO           TEXT    NOT NULL,
      APA102C        TEXT    NOT NULL,
      SPK            TEXT    NOT NULL,
      NOTE           TEXT,
      inspection_time INTEGER NOT NULL,
      date_add       DATETIME NOT NULL
    );
EOF;

   $ret = $db->exec($sql);
   if(!$ret){
      echo $db->lastErrorMsg();
   } else {
      echo "Table created successfully\n";
   }
   $db->close();

   $results = shell_exec('sudo chmod 777 ./db/factory_log.db');
   echo $results;
?>
