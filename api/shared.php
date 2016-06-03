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
//session_start();
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
$uid = -1;
$uhd = 'demo';
/*function getUserFromKey($key) {
	global $db;
	$q = "SELECT * from users u join (SELECT owner_id from apikeys where api_key='$key' and active=1 and (TIMESTAMPDIFF(WEEK, last_mod , CURRENT_TIMESTAMP()) < 1) LIMIT 1) k on k.owner_id=u.PID LIMIT 1";
	if ($res = mysqli_query($db, $q)) {
		if (mysqli_num_rows($res) == 0) {
			return null;
		}
		$r = mysqli_fetch_object($res);
		unset($r->password);
		unset($r->access_level);
		//$o = new stdClass();
		$o = $r;
		// what a mess
		$o->uid = $r->PID;
		unset($o->PID);
		$o->root = $r->root_folder;
		unset($o->root_folder);
		$o->username = $r->firstname.' '.$r->lastname;
		$o->md5 = md5($r->email);
		$o->joindate = $r->join_date;
		unset($o->join_date);
		$o->status = $r->account_status == 'verified' ? 'verified' : 'unverified';
		unset($o->account_status);
		return $o;
	} else {
		resp(500, 'getUserFromKey failed');
	}
}	
if (isset($_GET['api_key']))
	$userDetailsFromKey = getUserFromKey($_GET['api_key']);
else 
	$userDetailsFromKey = getUserFromKey($_SERVER['HTTP_X_FOXFILE_AUTH']);
if ($userDetailsFromKey !== null) {
	$uid = $userDetailsFromKey->uid;
	$uhd = $userDetailsFromKey->root;
	$maxstore = $userDetailsFromKey->total_storage;
	$verified = $userDetailsFromKey->status;
}*/
date_default_timezone_set('America/New_York');

function sanitize($s) {
	global $db;
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
}
function resp($code, $message) {
	header('Content-Type: application/json');
	http_response_code($code);
	$res = array(
		'status' => $code,
		'message' => $message
	);
	echo json_encode($res);
	die();
}
function getUniqId() {
	global $db;
	$sql = "REPLACE INTO idgen (hashes) VALUES ('a')";
	if ($result = mysqli_query($db, $sql)) {
		$newIdObj = mysqli_insert_id($db);
		require '../plugins/hashids/Hashids.php';
		$hashids = new Hashids\Hashids('foxfilesaltisstillbestsalt', 12);
		return $hashids->encode($newIdObj);
	} else {
		return -1;
	}
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
function hasSpaceLeft() {
	return dirSize('./../files/'.$uhd) < $maxstore;
}
function getPath($file) {
	global $uhd, $db;
	$file = sanitize($file);
	if ($file == $uhd) return '../files/'.$file;
	$pointer = 0;

	$path = array();
	$root = 'files';

	$finalPathArray = array();
	$isFirstTime = true;
	if (!function_exists('recursivePath')) {
		function recursivePath($file, $isFirstTime) {
			global $db, $uhd, $pointer, $path, $finalPathArray;
			if ($isFirstTime) {
				$path = array();
			}
			$curPos = '';
			$query = mysqli_query($db, "SELECT parent FROM files WHERE hash='$file' LIMIT 1");
			if (mysqli_num_rows($query) == 0) resp(422, "Invalid file hash provided");
			while($row = mysqli_fetch_array($query)) {
				$path[] = $row['parent'];
				$curPos = $row['parent'];
			}
			$finalPathArray = array();
			$hasSet = false;
				if ($curPos !== $uhd) {
					return recursivePath($curPos, false);
				} else {
					$ret = array();
					$finalPathArray = $path;
					return $finalPathArray;
				}
		}
	}
	if ($file === $uhd) {
		return $root . $file;
	}
	$fileArray = array();
	$finalPathArray = recursivePath($file, $isFirstTime);
	$fileArray = $finalPathArray;
	$files = array_reverse($fileArray);
	$pointer = 1;
	foreach ($files as $value) {
		if ($pointer < sizeof($files)) {
			$root .= '/' . $value;
		} else {
			$root .= '/' . $value . '/' . $file;
			return '../'.$root;
		}
		$pointer++;
	}
}
function recurse_copy($src,$dst) { 
    $dir = opendir($src); 
		if (!file_exists($dst))
			if (mkdir($dst, 0770, true))
				//echo "<font color='red'>Folder " . $dst . ' did not exist, creating</font><br>';
    while(false !== ( $file = readdir($dir)) ) { 
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) { 
                recurse_copy($src . '/' . $file,$dst . '/' . $file); 
            } 
            else { 
                copy($src . '/' . $file,$dst . '/' . $file); 
            } 
        } 
    } 
    closedir($dir); 
}
if ($pageID == 'fetch') {
	if (!isset($_POST['hash']))
		resp(422, "missing parameters");

	$hash = sanitize($_POST['hash']);
	$q = "SELECT points_to FROM shared WHERE hash='$hash'";
	if ($result = mysqli_query($db, $q)) {
		$res = array();
		$num = mysqli_num_rows($result);
		while ($r = mysqli_fetch_object($result)) {
			$res[] = $r->points_to;
		}
		$res = '\''.implode('\',\'',$res).'\'';
		$q2 = "SELECT name,hash,is_folder as type FROM files WHERE hash IN ($res) AND is_public=1";
		if ($result2 = mysqli_query($db, $q2)) {
			$res2 = array();
			while ($r2 = mysqli_fetch_object($result2)) {
				$res2[] = $r2;
			}
			$repl = array(
				'status'=>200,
				'num_results'=>$num,
				'response'=>$res2
			);
			echo json_encode($repl);
			die();
		} else {
			resp(500, "failed to associate shared file");
		}
	} else {
		resp(500, "failed to fetch shared file");
	}
}
if ($pageID == 'copy') {
	if (!isset($_POST['hashlist']))
		resp(422, "missing parameters");
	$hashlist = sanitize($_POST['hashlist']);

	$hashes = explode(',', $hashlist);
	/*foreach ($hashes as $hash) {
		$hash = sanitize($hash);
		recurse_copy(getPath($hash), './../'.$uhd);

		$q = "SELECT is_folder FROM files WHERE hash='$hash' LIMIT 1";
		$res = mysqli_query($db, $q);
		$isFolder = mysqli_fetch_object($res)->is_folder;

		$q = "INSERT INTO files (owner_id, is_folder, hash, parent, name, size) VALUES
			('$uid',
			'$isFolder',
			'$hash',
			'$uhd',
			'$fName',
			'$fSize')";
		if (mysqli_query($db, $sql)) {	// put some sort of versioning systen instead of just displaying every version as a separate file
			echo json_encode(array('status' => 200, 'hash' => $fileHash));
		} else {
			resp(500, 'SQL file insert failed');
		}

	}*/
	// dont want to add this
	resp(500, 'unimplemented');

}