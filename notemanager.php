<?php
//print_r($_FILES); //this will print out the received name, temp name, type, size, etc.

//SQL------------
#mysql_connect("localhost","root","quantum123");
#mysql_select_db("babycry");
#mysql_query("set names utf8");
//---------------------

//$type=$_FILES['audio_data']['type'];
//$size = $_FILES['audio_data']['size']; //the size in bytes
//$input = $_FILES['audio_data']['tmp_name']; //temporary name that PHP gave to the uploaded file
//$timerec = $_FILES['audio_data']['name']; //. $file; //letting the client control the filename is a rather bad idea
//$timeupload = date("Y:m:d H:i:s",time()+0); //UTC+8
//$timeupload2 = date('YmdHis',time()+0); //待測試
$Barcode = $_POST['author'];
#$note = $_POST['note'];
//$gender = $_POST['gender'];
//$platform = $_POST['platform'];
//$age = $_POST['age'];
//$label = $_POST['label'];
//$weight = $_POST['weight'];

//$path = 'uploads/' . $label . '/';

// 網路端存檔作者名可能會有中文問題，後續需要再注意

//Cookies設定區(改到app.js執行)
//setcookie('platform',$platform,time()+10800); //30天有效
//setcookie('author',$author,time()+10800); //30天有效

$response = array();
//move the file from temp name to local folder using $output name

	if(True){
		/*
			$sqlresult = mysql_query("
				SELECT `note`
				FROM `babycry`
				WHERE filename ='$author'
			");
			$sqlquery=mysql_fetch_row($sqlresult);
			//$sqlquery = mysqli_fetch_all($sqlresult,MYSQLI_ASSOC);
			//echo $sqlquery[0];
			$writedata=$sqlquery[0] . ", " . $note ;
			mysql_query("
				UPDATE `babycry`
				SET note='$writedata'
				WHERE filename ='$author'
			");
			$response['save'] =1;
			*/
			$ourFileName = "./temp/temp.txt";
			$ourFileHandle = fopen($ourFileName, 'w') or die("can't open file");
			fwrite($ourFileHandle,$Barcode);
			fclose($ourFileHandle);



		  } else {
		    //echo "create file " . $output . " failed";
		    $response['save'] =0;
		  }
		 //echo json_encode($_POST);
		 //echo json_encode($_FILES['audio_data']);
		  echo json_encode($response);




?>
