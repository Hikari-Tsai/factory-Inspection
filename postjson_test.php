<?php
  //$server_output = file_get_contents("php://input");
  //$server_output=<<<EOF
  //{"BTMAC": "123", "WiFiMAC": "3c:7c:3f:49:a4:ff", "HM10": "OK", "WiFi": "OK", "MIC": "OK", "DHT11": "OK", "GPIO": {"KeyUp": "OK", "KeyMid": "OK", "KeyDn": "OK", "KeyLeft": "OK", "KeyRight": "OK"}, "APA102C": {"Red": "OK", "Green": "OK", "Blue": "OK", "White": "OK"}, "SPK": "OK"}
  //EOF;

  $ourFileName = "./temp/temp_test.txt";
  $ourFileHandle = fopen($ourFileName, 'r') or die("can't open file");
  $WriteResponse=fread($ourFileHandle,$server_output);
  $server_output = fread($ourFileHandle,filesize($ourFileName));
  fclose($ourFileHandle);
  $curloutput = json_decode($server_output,true);


  $curloutput["TRACKING"]="0123";
  //$GPIO=var_dump($curloutput["GPIO"]);//str(json_encode($curloutput["GPIO"]));
  $APA102C=json_encode(array($curloutput["APA102C"]["Red"],$curloutput["APA102C"]["Green"],$curloutput["APA102C"]["Blue"],$curloutput["APA102C"]["White"]));//str(json_encode($curloutput["APA102C"]));
  $GPIO=json_encode(array($curloutput["GPIO"]["KeyUp"],$curloutput["GPIO"]["KeyMid"],$curloutput["GPIO"]["KeyDn"],$curloutput["GPIO"]["KeyLeft"],$curloutput["GPIO"]["KeyRight"]));
  $TRACKING =$curloutput['TRACKING'];
  $BTMAC    =$curloutput['BTMAC'];
  $WiFiMAC  =$curloutput['WiFiMAC'];
  $HM10     =$curloutput['HM10'];
  $WiFi     =$curloutput['WiFi'];
  $MIC      =$curloutput['MIC'];
  $DHT11    =$curloutput['DHT11'];
  $SPK      =$curloutput['SPK'];
  $NOTE     ="";
  $curloutput['MESSAGE']="";
class MyDB extends SQLite3
{
   function __construct()
   {
      $this->open('./db/factory_log.db');
   }
}
$db = new MyDB();
if(!$db){
   //echo $db->lastErrorMsg();
   $curloutput['DB']=$db->lastErrorMsg();
} else {
   $curloutput['MESSAGE'].="Opened database successfully\n";
}
/*
$sql =<<<EOF
   INSERT INTO COMPANY (ID,TRACKING,BTMAC,WiFiMAC,HM10,WiFi,MIC,DHT11,GPIO,APA102C,SPK,NOTE)
   VALUES ("","$curloutput['TRACKING']",$curloutput['BTMAC'],$curloutput['WiFiMAC'],$curloutput['HM10'],$curloutput['WiFi'],$curloutput['MIC'],$curloutput['DHT11'],$GPIO,$APA102C,$curloutput['SPK'],$NOTE)
EOF;
*/


$sql =<<<EOF
   INSERT INTO log (TRACKING,BTMAC,WiFiMAC,HM10,WiFi,MIC,DHT11,GPIO,APA102C,SPK,NOTE)
   VALUES ('$TRACKING','$BTMAC','$WiFiMAC','$HM10','$WiFi','$MIC','$DHT11','$GPIO','$APA102C','$SPK','$NOTE');
EOF;

$ret = $db->exec($sql);
if(!$ret){
  $curloutput['DB']=$db->lastErrorMsg();
  //echo $db->lastErrorMsg();
} else {
    $curloutput['MESSAGE'].="Records created successfully\n";
   //echo $server_output;
   echo json_encode($curloutput);
}
$db->close();
echo "OKOK";
?>
