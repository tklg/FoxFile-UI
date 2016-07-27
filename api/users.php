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
//session_start();
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
date_default_timezone_set('America/New_York');

function sanitize($s) {
	global $db;
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
}

if (!isset($_SERVER['HTTP_X_FOXFILE_AUTH']) && !isset($_GET['api_key'])) {
	resp(401, 'missing auth key');
	$userDetailsFromKey = null;
} else {
	if (isset($_GET['api_key']))
		$userDetailsFromKey = getUserFromKey($_GET['api_key']);
	else 
		$userDetailsFromKey = getUserFromKey($_SERVER['HTTP_X_FOXFILE_AUTH']);
}
if ($userDetailsFromKey === null) {
	resp(404, 'auth key is invalid');
} else {
	$uid = sanitize($userDetailsFromKey->uid);
	$uhd = sanitize($userDetailsFromKey->root);
	$uem = sanitize($userDetailsFromKey->email);
	$maxstore = $userDetailsFromKey->total_storage;
	$verified = $userDetailsFromKey->status;
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
function getUserFromKey($key) {
	global $db;
	$ip = $_SERVER['REMOTE_ADDR'];
	$q = "SELECT * from users u join (SELECT owner_id from apikeys where api_key='$key' and active=1 and created_by='$ip' and (TIMESTAMPDIFF(WEEK, last_mod , CURRENT_TIMESTAMP()) < 1) LIMIT 1) k on k.owner_id=u.PID LIMIT 1";
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
if ($pageID == '' || $pageID == null) {
	resp(422, "must provide an action");
}
if ($pageID == 'info') {
	$r = $userDetailsFromKey;
	if ($r !== null) {
		echo json_encode($r);
		die();
	} else {
		resp(404, 'user does not exist');
	}
	
}
if ($pageID == 'account') {
	/*if (!isset($_POST['id']))
		resp(422, 'missing parameters');
	$id = sanitize($_POST['id']);
	if ($id == 'me') $id = $uhd;
	if ($id != $uhd) resp(403, "currently can only access /users for own account");*/
	//$q = "SELECT PID as foxid,firstname,lastname,email,root_folder as root,account_status as status,join_date as joindate,total_storage as s_total FROM users WHERE root_folder='$id' LIMIT 1";
	/*if (!isset($_SERVER['HTTP_X_FOXFILE_AUTH']))
		resp(401, 'missing auth key');
	$key = sanitize($_SERVER['HTTP_X_FOXFILE_AUTH']);
	$r = getUserFromKey($key);
	$uhd = $r->root;*/
	if (isset($_POST['part'])) {
		if ($_POST['part'] == 'quota') {
			$q = "SELECT total_storage from users where PID='$uid' and root_folder='$uhd' limit 1";
			if ($r = mysqli_query($db, $q)) {
				if (mysqli_num_rows($r) == 0) {
					resp(404, 'user not found');
				}
				$res = array(
					'total'=>(int) mysqli_fetch_object($r)->total_storage,
					'files'=>dirSize('./../files/'.$uhd)
					);
				echo json_encode($res);
				die();
			} else {
				resp(500, 'query failed'.mysqli_error($db));
			}
		}
	}
	$r = $userDetailsFromKey;
	/*if($r1 = mysqli_query($db, $q)) {
		$r = mysqli_fetch_array($r1);*/
	if ($r !== null) {
		$q = "SELECT *, IF (TIMESTAMPDIFF(WEEK, last_mod , CURRENT_TIMESTAMP()) < 1, 'good', 'expired') as status from apikeys where owner_id='$uid' order by last_mod desc limit 50";
		if ($res = mysqli_query($db, $q)) {
			if (mysqli_num_rows($res) > 50) { // ....
				$q = "DELETE from apikeys where ((TIMESTAMPDIFF(WEEK, last_mod , CURRENT_TIMESTAMP()) > 1) or active=0) and owner_id='$uid'";
				mysqli_query($db, $q);
			}
			$keys = array();
			while($ob = mysqli_fetch_object($res)) {
				/*$ob->current_key = ($_SERVER['HTTP_X_FOXFILE_AUTH'] == $ob->api_key || $_GET['api_key'] == $ob->api_key);
				unset($ob->api_key);*/
				$keys[] = $ob;
			}
			$total = (int) $r->total_storage;
			unset($r->total_storage);
			$r->quota = array(
				'total'=>$total,
				'files'=>dirSize('../files/'.$uhd)
				//'trash'=>$s_t
				);
			$r->keys = $keys;
			$f = array(
				'status'=>200,
				'content'=>$r
				);
			echo json_encode($f);
			die();	
		}
	} else {
		resp(500, 'failed to find user details');
	}
}
if ($pageID == 'update') {
	if ($uem == 'test@test.test') {
		resp(401, "Test user cannot change account information.");
	}
	/*if (!isset($_POST['id']))
		resp(422, 'missing parameters');
	$id = sanitize($_POST['id']);
	if ($id == 'me') $id = $uhd;
	if ($id != $uhd) resp(403, "currently can only access /users for own account");*/
	//echo json_encode($_POST);
	if (isset($_POST['firstname'])) {
		$val = sanitize($_POST['firstname']);
		/*$_SESSION['foxfile_firstname'] = $val;
		$_SESSION['foxfile_username'] = $val.' '.$_SESSION['foxfile_lastname'];*/
		$q = "UPDATE users SET firstname='$val' WHERE root_folder='$uhd' LIMIT 1";
	} else if (isset($_POST['lastname'])) {
		$val = sanitize($_POST['lastname']);
		/*$_SESSION['foxfile_lastname'] = $val;
		$_SESSION['foxfile_username'] = $_SESSION['foxfile_firstname'].' '.$val;*/
		$q = "UPDATE users SET lastname='$val' WHERE root_folder='$uhd' LIMIT 1";
	} else if (isset($_POST['email'])) {
		$val = sanitize($_POST['email']);
		if (!filter_var($val, FILTER_VALIDATE_EMAIL)) {
		  	resp(422, 'Invalid email format');
		}
		/*$_SESSION['foxfile_email'] = $val;
		$_SESSION['foxfile_user_md5'] = md5($val);*/
		$q = "UPDATE users SET email='$val' WHERE root_folder='$uhd' LIMIT 1";
	} else if (isset($_POST['pass'])) {
		$p = sanitize($_POST['pass']);
		$p2 = sanitize($_POST['pass2']);
		if ($p !== $p2) {
			resp(422, "passwords do not match");
		}
		if ($p == '') {
			resp(422, 'password cannot be blank');
		}
		$pass = password_hash($p, PASSWORD_BCRYPT);

		$q = "UPDATE users SET password='$pass' WHERE PID='$uid' LIMIT 1";
	}
	if (mysqli_query($db, $q)) {
		resp(200, 'updated '.$val);
	} else {
		resp(500, "failed to update user");
	}
}
if ($pageID == 'invalidate_key') {
	if (!isset($_POST['key'])) {
		resp(422, 'missing parameters');
	}
	$key = sanitize($_POST['key']);
	$q = "SELECT active from apikeys where api_key='$key' and owner_id='$uid' limit 1";
	if ($r = mysqli_query($db, $q)) {
		if (mysqli_num_rows($r) == 0) {
			resp(404, 'no matching key was found');
		}
		if (mysqli_fetch_object($r)->active == 0) {
			$q = "DELETE from apikeys where api_key='$key' and owner_id='$uid' limit 1";
			$m = 'removed key';
		} else {
			$q = "UPDATE apikeys set active=0 where api_key='$key' and owner_id='$uid' limit 1";
			$m = 'deactivated key';
		}
		if (mysqli_query($db, $q)) {
			resp(200, $m);
		} else {
			resp(500, 'query failed');
		}
	}
}
if ($pageID == 'remove') {
	if (!isset($_POST['pass'])) resp(422, 'missing parameters');
	if ($uem == 'test@test.test') {
		resp(401, "Test user cannot change account information.");
	}
	$pass = $_POST['pass'];

	$q = "SELECT password from users where PID='$uid' and root_folder='$uhd' limit 1";
	if ($r = mysqli_query($db, $q)) {
		if (mysqli_num_rows($r) == 0) resp(404, 'user not found');
		if (!password_verify($pass, mysqli_fetch_object($r)->password)) {
			resp(401, 'Incorrect password');
		} else {
			$q = "DELETE from apikeys where owner_id='$uid'";
			$q2 = "DELETE from files where owner_id='$uid'";
			$q3 = "DELETE from shared where owner_id='$uid'";
			$q4 = "DELETE from users where PID='$uid'";
			function deleteDir($path) {
				if (!isset($path) || !$path || $path == '' || $path == '/' || $path == '\\') die();
				foreach(glob("{$path}/*") as $file) {
			        if(is_dir($file)) { 
			            deleteDir($file);
			        } else {
			            unlink($file);
			        }
			    }
			    rmdir($path);
			}
			if (mysqli_query($db, $q) && mysqli_query($db, $q2) && mysqli_query($db, $q3) && mysqli_query($db, $q4)) {
				deleteDir('./../files/'.$uhd);
				resp(200, "Account removed");
			} else {
				resp(500, 'query failed');
			}
		}
	} else {
		resp(500, 'query failed');
	}
}

mysqli_close($db);