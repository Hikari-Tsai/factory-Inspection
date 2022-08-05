<?php
#system("bash play.sh");
#$out = shell_exec('sudo bash play.sh');
$out = shell_exec('sudo play_test.py');
var_dump($out);
header('Content-type: application/json');
?>