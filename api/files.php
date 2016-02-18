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
if(!isset($_SESSION['foxfile_uid'])) {
	die();
}
if(!isset($_SESSION['foxfile_access_level'])) {
	die();
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
if ($pageID == 'list_files') {
	$fileParent = sanitize($_POST['hash']);
	$offset = (int) $_POST['offset'];
	$limit = (int) $_POST['limit'];
	$sql = "SELECT COUNT(*) as total from FILES WHERE parent = '$fileParent' AND owner_id = '$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$total = mysqli_fetch_array($result)['total'];
		$total -= $offset * $limit;
		$remaining = $total - $limit;
		$more = false;
		if ($remaining > 0) $more = true;
		$sql = "SELECT * FROM FILES WHERE parent = '$fileParent' AND owner_id = '$uid' LIMIT $limit OFFSET $offset";
		if ($result = mysqli_query($db, $sql)) {
			$rows = array();
			while ($row = mysqli_fetch_object($result)) {
				$rows[] = $row;
			}
			$final = array(
				'total_rows' => $total,
				'more' => $more,
				'remaining' => $remaining > 0 ? $remaining : 0,
				'results' => $rows
			);
			echo json_encode($final);
		} else {
			http_response_code(500);
			$res = array(
				'status' => '500',
				'message' => 'Failed to retrieve contents of folder '.$fileParent
			);
			echo json_encode($res);
			die();
		}
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to count contents of folder '.$fileParent
		);
		echo json_encode($res);
		die();
	}
}
if ($pageID == 'get_file') {
	$self = sanitize($_POST['hash']);
	$sql = "SELECT * FROM FILES WHERE hash = '$self' AND owner_id = '$uid' LIMIT 1";
	if ($result = mysqli_query($db, $sql)) {
		$rows = mysqli_fetch_object($result);
		echo json_encode($rows);
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve file details '.$fileParent
		);
		echo json_encode($res);
		die();
	}
}
if ($pageID == 'get_file_info') {
	$self = sanitize($_POST['hash']);
	$sql = "SELECT name, hash, parent, is_folder FROM FILES WHERE hash = '$self' AND owner_id = '$uid' LIMIT 1";
	if ($result = mysqli_query($db, $sql)) {
		$rows = mysqli_fetch_object($result);
		echo json_encode($rows);
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve file details '.$fileParent
		);
		echo json_encode($res);
		die();
	}
}
if ($pageID == 'new') {
	$fileName = $_POST['name'];
	$filePath = $_POST['path'];
	$file = $_FILES['file'];
	echo $filePath.$fileName;
}