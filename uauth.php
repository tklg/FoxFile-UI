<?php
session_start();
require('includes/user.php');
require('includes/config.php');
//connect to database  
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
date_default_timezone_set('America/New_York');

function strip_tags_attributes( $str, 
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
if(isset($_POST['check_username'])) {

	$username = addslashes(strip_tags_attributes($_POST['username']));  
	 
	$result = mysqli_query($db, "SELECT UNAME from USERS where UNAME = '". $username . "'");  
	  
	//if number of rows fields is bigger them 0 that means it's NOT available '  
	if(mysqli_num_rows($result)>0){  
	    echo 0;  
	} else {  
	    echo 1;  
	}
}

if(isset($_POST['login'])) {
	$username = addslashes(strip_tags_attributes($_POST['username']));
	$user = mysqli_query($db, "SELECT * from USERS where UNAME = '". $username . "'");
	$row = mysqli_fetch_array($user);
	$password = addslashes(strip_tags_attributes($_POST['password']));
	$passToMatch = $row['pass'];

	if (password_verify($password, $passToMatch)) {
		$uidToSet = $row['PID'];
		$access_level = $row['access_level'];
		if ($access_level == 0) {
			$_SESSION['mode'] = 'guest';
		} else if ($access_level == 1) {
			$_SESSION['mode'] = 'user';
		} else if ($access_level == 2) {
			$_SESSION['mode'] = 'admin';
		} else {
			$_SESSION['mode'] = 'INVALID_ACCESS_LEVEL';
		}
		$_SESSION['uid'] = $uidToSet;
		$_SESSION['access_level'] = $access_level;
		$_SESSION['username'] = $username; //try not to use this, instead query for UID to get username in case uname changes
		echo 'valid';
	} else {
		echo 'Invalid username or password';
	}
}

if(isset($_GET['logout'])) {
	session_destroy();
	header('Location: index.php');
}

if(isset($_POST['register'])) {
	if ($_POST['group_password'] == $group_password) {
		$options = [
                'cost' => 11,
            ];
		$uname = $_POST['username'];
		$upass = password_hash(addslashes($_POST['password']), PASSWORD_BCRYPT, $options);
		$sql = "INSERT INTO Users (uName, pass, access_level)
                    VALUES ('$uname', 
                    '$upass',
                    '1')";
		if (mysqli_query($db,$sql)) {
              //echo 'User \''. $uname .'\' created successfully';
        } else {
              echo 'MySQL Query failed: ' . mysqli_error($db);
        }
        echo 'valid';
	} else {
		echo 'Invalid group password';
	}
}
