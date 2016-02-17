<?php
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

//connect to database  
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);

date_default_timezone_set('America/New_York');

function sanitize($s) {
	global $db;
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
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
			$_SESSION['foxfile_access_level'] = $row->access_level;
			$_SESSION['foxfile_uid'] = $row->PID;
			$_SESSION['foxfile_email'] = $useremail;
			$_SESSION['foxfile_uhd'] = $row->root_folder;
			$_SESSION['foxfile_firstname'] = $row->firstname;
			$_SESSION['foxfile_lastname'] = $row->lastname;
			$_SESSION['foxfile_username'] = $row->firstname.' '.$row->lastname;
			$_SESSION['foxfile_user_md5'] = md5($row->email);
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
			$result = mysqli_query($db, "SELECT 1 from users where email = '$email' LIMIT 1");  
			
			if(mysqli_num_rows($result) > 0){  
			    echo 2;
			    die();
			} else {  
				$upass = password_hash($_POST['userpass'], PASSWORD_BCRYPT);
				$userfirst = sanitize($_POST['userfirst']);
				$userlast = sanitize($_POST['userlast']);
				require '../plugins/hashids/Hashids.php';
				$sql = "REPLACE INTO IDGEN (stub) VALUES ('a')";
				if ($result = mysqli_query($db, $sql)) {
					$newIdObj = mysqli_insert_id($db);
					$hashids = new Hashids\Hashids('foxfilesaltisstillbestsalt', 12);
					$root_folder = $hashids->encode($newIdObj);
					$sql = "INSERT INTO users (firstname, lastname, email, password, access_level, root_folder, total_storage, account_status)
			                VALUES ('$userfirst',
			                '$userlast',
			                '$email',
			                '$upass',
			                '1',
			                '$root_folder',
			                '2000000000',
			                'unverified')";
					if (mysqli_query($db,$sql)) {
						mkdir('../files/'.$root_folder.'/');
						mkdir('../trashes/'.$root_folder.'/');
						echo 0;
						die();
			        } else {
			        	//echo mysqli_error($db);
			            echo 5;
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
if($pageID == 'newpass') {
	$passC = sanitize($_POST['checkpass']);
	$passN = sanitize($_POST['newpass']);
	$passNCrypt = password_hash($passN, PASSWORD_BCRYPT);

	$user = mysqli_query($db, "SELECT pass from $usertable where PID = '$uid'");
	$row = mysqli_fetch_array($user);
	$passToMatch = $row['pass'];

	if (password_verify($passC, $passToMatch)) {
		if (mysqli_query($db, "UPDATE $usertable SET pass = '$passNCrypt' WHERE PID = '$uid'")) {
			echo "Password changed.";
		} else {
			echo "Password change failed.";
		}
	} else {
		echo "Current password is incorrect.";
	}
}
mysqli_close($db);
