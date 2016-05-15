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
		require_once './../plugins/phpmailer/PHPMailerAutoload.php';

		$mail = new PHPMailer;
		$mail->isSMTP();
		$mail->Host = $mailhost;
		$mail->SMTPAuth = true;
		$mail->Username = $mailuser;
		$mail->Password = $mailkey;
		$mail->SMTPSecure = 'tls';

		$mail->setFrom('foxfile@'.$_SERVER['HTTP_HOST'], 'FoxFile');
		$mail->addAddress($email);
		//$mail->isHTML(true);

		$mail->Subject = 'FoxFile email verification';
		$mail->msgHTML('Click link to verify your email:<br><a href="'.$link.'">'.$link.'</a>');
		$mail->AltBody = 'Copy/paste link into the address bar to verify your email: '.$link;

		if (!$mail->send()) {
			resp(500, "Failed to send mail: ".$mail->ErrorInfo);
		} else {
			resp(200, "Sent mail");
		}
	} else {
		resp(500, 'failed to fetch link');
	}
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
		$row = mysqli_fetch_object($result);
		$passToMatch = $row->password;
		$password = $_POST['userpass'];
		if (password_verify($password, $passToMatch)) {
			session_destroy();
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
			echo 0;
		} else {
			echo 1;
		}
	} else {
		echo 2;
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

	$bytes;
	if (function_exists('random_bytes'))
		$bytes = bin2hex(random_bytes(40));
	else 
		$bytes = bin2hex(openssl_random_pseudo_bytes(40));
	$_SESSION['foxfile_recovery_nonce'] = $bytes;

	$link = $_SERVER['HTTP_HOST']."/foxfile/passchange?key=".$bytes.'&from='.$email;
	require_once './../plugins/phpmailer/PHPMailerAutoload.php';

	$mail = new PHPMailer;
	$mail->isSMTP();
	$mail->Host = $mailhost;
	$mail->SMTPAuth = true;
	$mail->Username = $mailuser;
	$mail->Password = $mailkey;
	$mail->SMTPSecure = 'tls';
	$mail->SMTPDebug = 2;

	$mail->setFrom('foxfile@'.$_SERVER['HTTP_HOST'], 'FoxFile');
	$mail->addAddress($email);
	//$mail->isHTML(true);

	$mail->Subject = 'FoxFile password reset';
	$mail->msgHTML('Click link to reset your password:<br><a href="'.$link.'">'.$link.'</a>');
	$mail->AltBody = 'Copy/paste link into the address bar to reset your password: '.$link;

	if (!$mail->send()) {
		resp(500, "Failed to send mail: ".$mail->ErrorInfo);
	} else {
		resp(200, "Sent mail");
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
