<?php
/* 
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                                  
    Foxfile : api/shared.php
    Copyright (C) 2016 Theodore Kluge
    https://tkluge.net
*/
session_start();
require('../includes/user.php');
//require('../includes/cfgvars.php');

$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/') !== false) {
    $uri = explode('/', $uri);
    $pageID = $uri[sizeof($uri) - 1];
} else {
    $pageID = substr($uri, 1);
}
if (strpos($pageID, '?') !== false) {
	$uri = explode('?', $pageID);
	$pageID = $uri[0];
}

//connect to database  
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
if (isset($_SESSION['foxfile_uid'])) {
  $uid = $_SESSION['foxfile_uid'];
  $uem = $_SESSION['foxfile_email'];
  $alvl = $_SESSION['foxfile_access_level'];
  $uhd = $_SESSION['foxfile_uhd'];
  $logged_in = true;
} else {
  $logged_in = false;
}
date_default_timezone_set('America/New_York');

function sanitize($s) {
	global $db;
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
}
function resp($code, $message) {
	http_response_code($code);
	$res = array(
		'status' => $code,
		'message' => $message
	);
	echo json_encode($res);
	die();
}