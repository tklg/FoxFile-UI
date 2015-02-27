<?php
session_start();
require('includes/user.php');
require('includes/config.php');
//connect to database  
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
$usertable = $database['TABLE_USERS'];
$filetable = $database['TABLE_FILES'];
$uid = $_SESSION['uid'];
$alvl = $_SESSION['access_level'];
date_default_timezone_set('America/New_York');

function striptagattr( $str, 
		    $allowedTags = array('<a>','<b>','<blockquote>','<br>','<cite>','<code>','<del>','<div>','<em>','<ul>','<ol>','<li>','<dl>','<dt>','<dd>','<img>','<video>','<iframe>','<ins>','<u>','<q>','<h3>','<h4>','<h5>','<h6>','<samp>','<strong>','<sub>','<sup>','<p>','<table>','<tr>','<td>','<th>','<pre>','<span>'), 
		    $disabledEvents = array('onclick','ondblclick','onkeydown','onkeypress','onkeyup','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','onunload') )
		{       
		    if( empty($disabledEvents) ) {
		        return strip_tags($str, implode('', $allowedTags));
		    }
		    return preg_replace('/<(.*?)>/ies', "'<' . preg_replace(array('/javascript:[^\"\']*/i', '/(" . implode('|', $disabledEvents) . ")=[\"\'][^\"\']*[\"\']/i', '/\s+/'), array('', '', ' '), stripslashes('\\1')) . '>'", strip_tags($str, implode('', $allowedTags)));
		}
function sanitize($s) {
	global $db;
	// return htmlentities(br2nl(addslashes(mysqli_real_escape_string($db, $s))), ENT_QUOTES);
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function msqle($s) {
	global $db;
	return mysqli_real_escape_string($db, $s);
}
function htmlencode($s) {
	return br2nl(htmlentities($s, ENT_QUOTES));
}
function desanitize($s) {
	//return nlTobr(html_entity_decode($s));
	return nlTobr($s);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
}
function nlTobr($s) {
	return str_replace( "\n", '<br>', $s);
}
function validate_username($s) {

  $allowed = array(".", "-", "_");

  if (ctype_alnum( str_replace($allowed, '', $s))) {
    return true;
  } else {
    return false;
  }
}
if(isset($_POST['check_username'])) {

	$username = sanitize($_POST['username']);  
	 
	$result = mysqli_query($db, "SELECT name from $usertable where name = '". $username . "'");  
	  
	//if number of rows fields is bigger them 0 that means it's NOT available '  
	if(mysqli_num_rows($result)>0){  
	    echo 0;  
	} else {  
	    echo 1;  
	}
}

if(isset($_POST['login'])) {
	$username = sanitize($_POST['username']);
	$user = mysqli_query($db, "SELECT * from $usertable where name = '". $username . "'");
	$row = mysqli_fetch_array($user);
	$password = sanitize($_POST['password']);
	$passToMatch = $row['pass'];

	if (password_verify($password, $passToMatch)) {
		$access_level = $row['access_level'];
		$_SESSION['uid'] = $row['PID'];
		$_SESSION['access_level'] = $access_level;
		$_SESSION['username'] = $username;
		$_SESSION['uhd'] = $row['root_folder'];
		echo 'valid';
	} else {
		echo 'Invalid username or password';
	}
}

if(isset($_GET['logout'])) {
	session_destroy();
	$access_level = 0;
	header('Location: login.php');
}
if(isset($_POST['register'])) {
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
	if (validate_username($_POST['username'])) {
		if (!$gp || $v) {
		/*$options = [
	        	'cost' => 11,
	        ];*/
	        
	        $username = sanitize($_POST['username']);  
			$result = mysqli_query($db, "SELECT name from $usertable where name = '$username'");  
			//if number of rows fields is bigger them 0 that means it's NOT available '  
			if(mysqli_num_rows($result) > 0){  
			    echo "Username is not available";
			} else {  
				$uname = sanitize($_POST['username']);
				$upass = password_hash(sanitize($_POST['password']), PASSWORD_BCRYPT/*, $options*/);
				$email = sanitize($_POST['email']);
				$sql = "INSERT INTO $usertable (name, pass, email, access_level, root_folder)
		                VALUES ('$uname', 
		                '$upass',
		                '$email',
		                '1',
		                '$uname')";
				if (mysqli_query($db,$sql)) {
		            //echo 'User \''. $uname .'\' created successfully';
		        } else {
		            echo 'MySQL Query failed: ' . mysqli_error($db);
		        }
		        echo 'valid';
		    }
		} else {
			echo 'Invalid group password,<br>or something is broken.';
		}
	} else {
		echo "Username can only contain alphanumeric characters.";
	}
}
if(isset($_POST['checkpass'])) {
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
