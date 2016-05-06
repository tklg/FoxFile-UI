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
                                                                  
    Foxfile : users.php
    Copyright (C) 2016 Theodore Kluge
    https://tkluge.net
*/
session_start();
require('../includes/user.php');

$uri = $_SERVER['REQUEST_URI'];
$pageID = null;
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
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
if(!isset($_SESSION['foxfile_uid'])) {
	resp(401, "You must be logged in to access the users API");
}
if(!isset($_SESSION['foxfile_access_level'])) {
	resp(401, "You must be logged in to access the users API");
}
$uid = $_SESSION['foxfile_uid'];
$uem = $_SESSION['foxfile_email'];
$alvl = $_SESSION['foxfile_access_level'];
$uhd = $_SESSION['foxfile_uhd'];
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
function dirSize($path){
    $bytestotal = 0;
    $path = realpath($path);
    if($path !== false){
        foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)) as $object){
            $bytestotal += $object->getSize();
        }
    }
    return $bytestotal;
}
if ($pageID == '' || $pageID == null) {
	resp(422, "must provide an action");
}
if ($pageID == 'account') {
	if (!isset($_POST['id']))
		resp(422, 'missing parameters');
	$id = sanitize($_POST['id']);
	if ($id == 'me') $id = $uhd;
	if ($id != $uhd) resp(403, "currently can only access /users for own account");
	$q = "SELECT PID as foxid,firstname,lastname,email,root_folder as root,account_status as status,join_date as joindate,total_storage as s_total FROM users WHERE root_folder='$id' LIMIT 1";
	//$q2 = "SELECT size as s_files FROM files WHERE owner_id='$uid' AND is_trashed=0";
	//$q3 = "SELECT size as s_trash FROM files WHERE owner_id='$uid' AND is_trashed=1";
	if($r1 = mysqli_query($db, $q)) {
		//$r2 = mysqli_query($db, $q2) ;
		//$r3 = mysqli_query($db, $q3);
		$r = mysqli_fetch_array($r1);
		/*$s_f = 0;
		$s_t = 0;
		while ($sf = mysqli_fetch_object($r2)) {
			$s_f += (int) $sf->s_files;
		}*/
		/*while($st = mysqli_fetch_object($r3)) {
			$s_t += (int) $st->s_trash;
		}*/
		$total = (int) $r['s_total'];
		unset($r['s_total']);
		$r['quota'] = array(
			'total'=>$total,
			'files'=>dirSize('../files/'.$uhd)
			//'trash'=>$s_t
			);
		$f = array(
			'status'=>200,
			'content'=>$r
			);
		echo json_encode($f);
		die();
	} else {
		resp(500, 'failed to find user details');
	}
}
if ($pageID == 'update') {
	if (!isset($_POST['id']))
		resp(422, 'missing parameters');
	$id = sanitize($_POST['id']);
	if ($id == 'me') $id = $uhd;
	if ($id != $uhd) resp(403, "currently can only access /users for own account");
	//echo json_encode($_POST);
	if (isset($_POST['firstname'])) {
		$val = sanitize($_POST['firstname']);
		$_SESSION['foxfile_firstname'] = $val;
		$_SESSION['foxfile_username'] = $val.' '.$_SESSION['foxfile_lastname'];
		$q = "UPDATE users SET firstname='$val' WHERE root_folder='$id' LIMIT 1";
	} else if (isset($_POST['lastname'])) {
		$val = sanitize($_POST['lastname']);
		$_SESSION['foxfile_lastname'] = $val;
		$_SESSION['foxfile_username'] = $_SESSION['foxfile_firstname'].' '.$val;
		$q = "UPDATE users SET lastname='$val' WHERE root_folder='$id' LIMIT 1";
	} else if (isset($_POST['email'])) {
		$val = sanitize($_POST['email']);
		if (!filter_var($val, FILTER_VALIDATE_EMAIL)) {
		  	resp(422, 'Invalid email format');
		}
		$_SESSION['foxfile_email'] = $val;
		$_SESSION['foxfile_user_md5'] = md5($val);
		$q = "UPDATE users SET email='$val' WHERE root_folder='$id' LIMIT 1";
	}
	if (mysqli_query($db, $q)) {
		resp(200, 'updated '.$val);
	} else {
		resp(500, "failed to update user");
	}
}

mysqli_close($db);