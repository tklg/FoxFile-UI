<?php
session_start();
require('../includes/user.php');
//require('includes/cfgvars.php');

$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/') !== false) {
    $uri = explode('/', $uri);
    $pageID = $uri[sizeof($uri) - 1];
} else {
    $pageID = substr($uri, 1);
}

//connect to database  
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
if(!isset($_SESSION['foxfile_uid'])) {
	$_SESSION['foxfile_uid'] = 0;
}
if(!isset($_SESSION['foxfile_access_level'])) {
	$_SESSION['foxfile_access_level'] = 0;
}
$uid = $_SESSION['foxfile_uid'];
$alvl = $_SESSION['foxfile_access_level'];
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
	header('Location: login');
}
if($pageID =='new') {
	if ($useGroupPassword) {
		$gp = true;
		if ($_POST['group_password'] == $group_password) {
			$v = true;
		} else {
			$v = false;
			echo 'Invalid group password';
			die();
		}
	} else {
		$gp = false;
	}
		if (!$gp || $v) {
		/*$options = [
	        	'cost' => 11,
	        ];*/
	        
	        $username = sanitize($_POST['username']);  
			$result = mysqli_query($db, "SELECT name from $usertable where name = '$username'");  
			
			if(mysqli_num_rows($result) > 0){  
			    echo "Username is not available";
			} else {  
				$uname = sanitize($_POST['username']);
				$upass = password_hash(sanitize($_POST['password']), PASSWORD_BCRYPT/*, $options*/);
				$email = sanitize($_POST['email']);
				$date = date("F j, Y");
				$sql = "INSERT INTO $usertable (name, pass, email, access_level, root_folder, total_storage, join_date)
		                VALUES ('$uname', 
		                '$upass',
		                '$email',
		                '1',
		                '$uname',
		                '5000000000',
		                '$date')";
				if (mysqli_query($db,$sql)) {
					mkdir('shared/'.$uname);
		            //echo 'User \''. $uname .'\' created successfully';
		        } else {
		            echo 'MySQL Query failed: ' . mysqli_error($db);
		        }
		        echo 'valid';
		    }
		} else {
			echo 'Invalid group password,<br>or something is broken.';
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
