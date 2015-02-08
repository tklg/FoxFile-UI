<?php
/*
* dbquery.php - FoxFile
* (c) Theodore Kluge 2015
* http://kluge.ninja
*/
session_start();
require('includes/user.php');
require('includes/config.php');
if(!isset($_SESSION['uid'])) {
	$_SESSION['uid'] = 0;
}
if(!isset($_SESSION['access_level'])) {
	$_SESSION['access_level'] = 0;
}
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
function getOwner($c) {
			global $db;
			$c = mysqli_real_escape_string($db, $c);
			$result = mysqli_query($db, "SELECT * from $filetable where PID = '$c'");
			$row = mysqli_fetch_array($result);
			return $row['owner'];
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
if(isset($_POST['fullNameFromID'])) {
	$id = sanitize($_POST['fullNameFromID']);
	$res = mysqli_query($db, "SELECT display_name from $usertable WHERE PID = '$id'");
	if (mysqli_num_rows($res) > 0) {
		while($row = mysqli_fetch_array($res)) {
			echo $row['display_name'];
		}
	}
}
//GET FILES FROM DATABASE INSTEAD OF FILESYSTEM BECAUSE REDUNDANCY AND STUFF
if(isset($_GET['dir'])) {
	$dir = sanitize($_GET['dir']);
	$type = sanitize($_GET['type']);
	if ($type === 'folder') {
		$dirOwner = mysqli_query($db, "SELECT owner from $filetable WHERE file_parent='$dir'");
		$resultDir = mysqli_query($db, "SELECT * from $filetable WHERE file_parent='$dir'");
		$giveResult = false;
		if (mysqli_num_rows($resultDir) > 0) {
			while($row = mysqli_fetch_array($dirOwner)) {
				if ($row['owner'] === $uid) {
					$giveResult = true;
				}
			}
		}

		if(mysqli_num_rows($resultDir) > 0) {
				$r = array();
				while($row = mysqli_fetch_assoc($resultDir)) {
					$r[] = $row;
				}
				if ($giveResult) {
					echo json_encode($r);
				} else {
					//echo '[{"PID": "0","owner":"0","file_name":"File Access Denied","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":""}]';
					echo json_encode($r);
				}
		} else {  
		    echo '[{"PID": "0","owner":"0","file_name":"Folder is Empty","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":""}]';  
		}
	} else {
		$dirOwner = mysqli_query($db, "SELECT owner from $filetable WHERE file_self='$dir'");
		$resultFileData = mysqli_query($db, "SELECT * from $filetable WHERE file_self='$dir'");
		$giveResult = false;
		if (mysqli_num_rows($resultFileData) > 0) {
			while($row = mysqli_fetch_array($dirOwner)) {
				if ($row['owner'] === $uid) {
					$giveResult = true;
				}
			}
		}
		if(mysqli_num_rows($resultFileData) > 0) {
				$r = array();
				while($row = mysqli_fetch_assoc($resultFileData)) {
					$r[] = $row;
				}
				if ($giveResult) {
					echo json_encode($r);
				} else {
					//echo '[{"PID": "0","owner":"0","file_name":"File Access Denied","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":""}]';
					echo json_encode($r);
				}
		} else {  
		   	echo '[{"PID": "0","owner":"0","file_name":"File Does Not Exist","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":""}]';
		}
	}
}
mysqli_close($db);
