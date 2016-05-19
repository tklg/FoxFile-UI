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
                                                                  
    Foxfile : auth.php 
    Copyright (C) 2016 Theodore Kluge
    https://tkluge.net
*/
session_start();
require('../includes/user.php');
require('../includes/cfgvars.php');

// add ip limit too
if (!isset($_SESSION['reqnum'])) $_SESSION['reqnum'] = 0;
if ($_SESSION['reqnum'] == 15) die("reached max of 15 requests for this session");
$_SESSION['reqnum'] = (int) $_SESSION['reqnum'] + 1;
if (isset($_SESSION['lastreq']))
	if ((time() - $_SESSION['lastreq']) < 3) die('one request pre 3 second allowed');
$_SESSION['lastreq'] = time();

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

date_default_timezone_set('America/New_York');

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
function sanitize($s) {
	global $db;
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
}
function sendVerification($email) {
	global $db;
	require_once './../includes/mailconf.php';
	$q = "SELECT account_status FROM users WHERE email='$email' LIMIT 1";
	if ($res = mysqli_query($db, $q)) {

		$link = mysqli_fetch_object($res)->account_status;
		if ($link == 'verified') {
			resp(500, 'Your email is already verified');
		}

		//$cdir = 
		$link = $_SERVER['HTTP_HOST']."/foxfile/verify?key=".$link.'&from='.$email;
		$c = curl_init();
		curl_setopt($c, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($c, CURLOPT_USERPWD, 'api:'.$mailkey);
		curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);

	    curl_setopt($c, CURLOPT_CUSTOMREQUEST, 'POST');
	    curl_setopt($c, CURLOPT_URL, $mailapi);
	    curl_setopt($c, CURLOPT_POSTFIELDS, array(
	    	'from' => 'FoxFile <foxfile@'.$_SERVER['HTTP_HOST'].'>',
	        'to' => $email,
	        'subject' => 'Foxfile email verification',
	        'html' => 'Click link to verify your email:<br><a href="'.$link.'">'.$link.'</a>',
	        'text' => 'Copy/paste link into the address bar to verify your email: '.$link
	        )
	    );

	    curl_exec($c);
	    $info = curl_getinfo($c);


	    if ($info['http_code'] != 200)
	        resp(500, "Failed to send mail: curl gave ".$info['http_code']);

	    curl_close($c);
	    //resp(200, "Sent mail");
	} else {
		resp(500, 'failed to fetch link');
	}
}
function getOS() { 
    $user_agent = $_SERVER['HTTP_USER_AGENT'];
    $os_platform = "Unknown OS Platform";
    $os_array = array('/windows nt 10/i'=>'Windows 10', '/windows nt 6.3/i'=>'Windows 8.1', '/windows nt 6.2/i'=>'Windows 8', '/windows nt 6.1/i'=>'Windows 7', '/windows nt 6.0/i'=>'Windows Vista', '/windows nt 5.2/i'=>'Windows Server 2003/XP x64', '/windows nt 5.1/i'=>'Windows XP', '/windows xp/i'=>'Windows XP', '/windows nt 5.0/i'=>'Windows 2000', '/windows me/i'=>'Windows ME', '/win98/i'=>'Windows 98', '/win95/i'=>'Windows 95', '/win16/i'=>'Windows 3.11', '/macintosh|mac os x/i'=>'Mac OS X', '/mac_powerpc/i'=>'Mac OS 9', '/linux/i'=>'Linux', '/ubuntu/i'=>'Ubuntu', '/iphone/i'=>'iPhone', '/ipod/i'=>'iPod', '/ipad/i'=>'iPad', '/android/i'=>'Android', '/blackberry/i'=>'BlackBerry', '/webos/i'=>'Mobile'); foreach ($os_array as $regex => $value) {
        if (preg_match($regex, $user_agent)) {
            $os_platform = $value;
        }
    }   
    return $os_platform;
}
function getBrowser() {
	$user_agent = $_SERVER['HTTP_USER_AGENT'];
    $browser  = "Unknown Browser";
    $browser_array = array('/msie/i' => 'Internet Explorer', '/firefox/i' => 'Firefox', '/safari/i' => 'Safari', '/chrome/i' => 'Chrome', '/edge/i' => 'Edge', '/opera/i' => 'Opera', '/netscape/i' => 'Netscape', '/maxthon/i' => 'Maxthon', '/konqueror/i' => 'Konqueror', '/mobile/i' => 'Handheld Browser'); foreach ($browser_array as $regex => $value) {
        if (preg_match($regex, $user_agent)) {
            $browser = $value;
        }
    }
    return $browser;
}
if($pageID == 'userexists') {
	$useremail = sanitize($_POST['useremail']);
	$result = mysqli_query($db, "SELECT 1 from users where email = '$useremail' LIMIT 1");  
	if(mysqli_num_rows($result)>0){  
	    echo 0;  
	} else {  
	    echo 1;  
	}
}
if($pageID == 'login') {
	$useremail = sanitize($_POST['useremail']);
	$sql = "SELECT * from users where email = '$useremail' LIMIT 1";
	if ($result = mysqli_query($db, $sql)) {
		if (mysqli_num_rows($result) == 0) {
			resp(404, "user does not exist");
		}
		$row = mysqli_fetch_object($result);
		$passToMatch = $row->password;
		$password = $_POST['userpass'];
		if (password_verify($password, $passToMatch)) {

		    $ip = $_SERVER['REMOTE_ADDR'];
			$oid = $row->PID;
			//$ua = $_SERVER['HTTP_USER_AGENT'];
			$ua = get_browser();
			$userAgent = sanitize(getBrowser().' on '.getOS());
			$sql = "SELECT api_key from apikeys where owner_id='$oid' and created_by='$ip' and user_agent='$userAgent' limit 1";
			if ($res = mysqli_query($db, $sql)) {
				if (mysqli_num_rows($res) == 0) {
					//create a new token for this login
					$token = bin2hex(openssl_random_pseudo_bytes(24));
				    $sql2 = "INSERT INTO apikeys (owner_id, api_key, user_agent, created_by) VALUES ('$oid', '$token', '$userAgent', '$ip')";
				    if (mysqli_query($db, $sql2)) {
					    $r = array(
					    	'status'=>200,
					    	'key'=>$token
					    	);
					    echo json_encode($r);
					    die();
				    } else {
				    	resp(500, 'failed to create new token');
				    }
				} else {
					$token = mysqli_fetch_object($res)->api_key;
					$sql2 = "UPDATE apikeys SET last_mod=NOW() where api_key='$token' and owner_id='$oid'";
					if (mysqli_query($db, $sql2)) {
						$r = array(
					    	'status'=>200,
					    	'key'=>$token
					    	);
					    echo json_encode($r);
					    die();
					} else {
						resp(500, 'failed to update token');
					}

				}
			} else {
				resp(500, 'query failed');
			}
			/*session_destroy();
			foreach ($_SESSION as $value)
				$value = null;
			session_start();
			$_SESSION['foxfile_access_level'] = $row->access_level;
			$_SESSION['foxfile_uid'] = $row->PID;
			$_SESSION['foxfile_email'] = $useremail;
			$_SESSION['foxfile_uhd'] = $row->root_folder;
			$_SESSION['foxfile_firstname'] = $row->firstname;
			$_SESSION['foxfile_lastname'] = $row->lastname;
			$_SESSION['foxfile_username'] = $row->firstname.' '.$row->lastname;
			$_SESSION['foxfile_user_md5'] = md5($row->email);
			$_SESSION['foxfile_max_storage'] = $row->total_storage;
			$_SESSION['foxfile_verified_email'] = $row->account_status == 'verified' ? true : false;
			echo 0;*/
		} else {
			resp(401, 'incorrect password');
		}
	} else {
		resp(500, 'query failed');
	}
}

if($pageID == 'logout') {
	session_destroy();
	foreach ($_SESSION as $value) {
		$value = null;
	}
	header('Location: ./');
}
if($pageID == 'new') {
	$gp = false;
	if ($foxfile_require_access_code) {
		$gp = true;
		if ($_POST['gpass'] == $foxfile_access_code) { //change this to use password_verify
			$v = true;
		} else {
			$v = false;
			echo 4;
			die();
		}
	} else {
		$gp = false;
	}
		if (!$gp || $v) {

	        $email = sanitize($_POST['useremail']);  
			$result = mysqli_query($db, "SELECT PID from users where email = '$email' LIMIT 1");  
			
			if(mysqli_num_rows($result) > 0){  
			    echo 2;
			    die();
			} else {  
				$upass = password_hash($_POST['userpass'], PASSWORD_BCRYPT);
				$userfirst = sanitize($_POST['userfirst']);
				$userlast = sanitize($_POST['userlast']);
				require '../plugins/hashids/Hashids.php';
				$sql = "REPLACE INTO idgen (hashes) VALUES ('a')";
				if ($result = mysqli_query($db, $sql)) {
					$newIdObj = mysqli_insert_id($db);
					$hashids = new Hashids\Hashids('foxfilesaltisstillbestsalt', 12);
					$root_folder = $hashids->encode($newIdObj);
					$bytes;
					if (function_exists('random_bytes'))
						$bytes = bin2hex(random_bytes(20));
					else 
						$bytes = bin2hex(openssl_random_pseudo_bytes(20));

					$sql = "INSERT INTO users (firstname, lastname, email, password, access_level, root_folder, total_storage, account_status)
			                VALUES ('$userfirst',
			                '$userlast',
			                '$email',
			                '$upass',
			                '1',
			                '$root_folder',
			                2147483648,
			                '$bytes')";
					if (mysqli_query($db,$sql)) {
						mkdir('../files/'.$root_folder.'/');
						sendVerification($email);
						//mkdir('../trashes/'.$root_folder.'/');
						echo 0;
						die();
			        } else {
			        	//echo mysqli_error($db);
			            echo 6;
			            die();
			        }
			    } else {
			    	echo 5;
			    	die();
			    }
		    }
		} else {
			echo 4;
		}
}
if ($pageID == 'send_verification') {
	if (!isset($_POST['email']) || !isset($_POST['extra'])) {
		resp(422, 'email address required');
	}
	$email = sanitize($_POST['email']);
	sendVerification($email);
}
if ($pageID == 'send_recovery') {
	require_once './../includes/mailconf.php';
	if (!isset($_POST['email']) || !isset($_POST['extra'])) {
		resp(422, 'email address required');
	}
	$email = sanitize($_POST['email']);

	$q = "SELECT email FROM users WHERE email='$email' LIMIT 1";
	if ($r = mysqli_query($db, $q)) {
		if (mysqli_num_rows($r) == 0) {
			resp(401, "No account was found with that email");
		} else {
			$bytes;
			if (function_exists('random_bytes'))
				$bytes = bin2hex(random_bytes(40));
			else 
				$bytes = bin2hex(openssl_random_pseudo_bytes(40));
			$_SESSION['foxfile_recovery_nonce'] = $bytes;

			$link = $_SERVER['HTTP_HOST']."/foxfile/passchange?key=".$bytes.'&from='.$email;
			$c = curl_init();
			curl_setopt($c, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
			curl_setopt($c, CURLOPT_USERPWD, 'api:'.$mailkey);
			curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);

			curl_setopt($c, CURLOPT_CUSTOMREQUEST, 'POST');
			curl_setopt($c, CURLOPT_URL, $mailapi);
			curl_setopt($c, CURLOPT_POSTFIELDS, array(
				'from' => 'foxfile@'.$_SERVER['HTTP_HOST'],
			    'to' => $email,
			    'subject' => 'Foxfile password reset',
			    'html' => 'Click link to reset your password:<br><a href="'.$link.'">'.$link.'</a>',
			    'text' => 'Copy/paste link into the address bar to reset your password: '.$link
			    )
			);
			curl_exec($c);
			$info = curl_getinfo($c);

			if ($info['http_code'] != 200)
				resp(500, "Failed to send mail: curl gave ".$info['http_code']);

			curl_close($c);
			resp(200, "Sent mail");
		}
	} else {
		resp(500, 'email query failed');
	}
}
if ($pageID == 'verify') {
	if (!isset($_GET['key']) || !isset($_GET['from'])) {
		resp(422, 'missing parameters');
	}
	$key = sanitize($_GET['key']);
	$email = sanitize($_GET['from']);

	$q = "SELECT account_status FROM users WHERE email='$email' LIMIT 1";
	if ($res = mysqli_query($db, $q)) {
		if (mysqli_num_rows($res) == 0) {
			resp(400, "Verification failed - invalid email");
		}
		if (mysqli_fetch_object($res)->account_status == $key) {
			$q = "UPDATE users SET account_status='verified' WHERE email='$email' LIMIT 1";
			if (mysqli_query($db, $q)) {
				if (isset($_SESSION['foxfile_uid'])) $loc = 'account';
				else $loc = 'login';

				header('Location: '.$loc);
			}
		} else {
			resp(400, "Verification failed - invalid key");
		}
	} else {
		resp(500, "Verification failed - database error");
	}
}
if ($pageID == 'recover') {
	if (!isset($_POST['key']) || !isset($_POST['from']) || !isset($_POST['pass']) || !isset($_POST['pass2'])) {
		resp(422, 'missing parameters');
	}
	$key = sanitize($_POST['key']);
	$email = sanitize($_POST['from']);

	if (!isset($_SESSION['foxfile_recovery_nonce']) || $key !== $_SESSION['foxfile_recovery_nonce']) resp(400, "Invalid key");
	unset($_SESSION['foxfile_recovery_nonce']);

	$pass = sanitize($_POST['pass']);
	$pass2 = sanitize($_POST['pass2']);
	if ($pass == '') resp(400, 'password cannot be blank');
	if ($pass !== $pass2) resp(400, "passwords do not match");

	$pass = password_hash($pass, PASSWORD_BCRYPT);

	$q = "UPDATE users SET password='$pass' WHERE email='$email' LIMIT 1";
	if (mysqli_query($db, $q)) {
		header("Location: ./../../logout");
	} else {
		resp(500, 'Failed to change password');
	}

}
mysqli_close($db);
