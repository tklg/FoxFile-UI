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
if (strpos($pageID, '?') !== false) {
	$uri = explode('?', $pageID);
	$pageID = $uri[0];
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
$uem = $_SESSION['foxfile_email'];
$alvl = $_SESSION['foxfile_access_level'];
$uhd = $_SESSION['foxfile_uhd'];
date_default_timezone_set('America/New_York');

function sanitize($s) {
	global $db;
	return htmlentities(br2nl(mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
function br2nl($s) {
    return preg_replace('/\<br(\s*)?\/?\>/i', "\n", $s);
}
function resp($code, $message) {
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
	$sql = "REPLACE INTO IDGEN (stub) VALUES ('a')";
	if ($result = mysqli_query($db, $sql)) {
		$newIdObj = mysqli_insert_id($db);
		require '../plugins/hashids/Hashids.php';
		$hashids = new Hashids\Hashids('foxfilesaltisstillbestsalt', 12);
		return $hashids->encode($newIdObj);
	} else {
		return -1;
	}
}
function getPath($file) { // in theory, this function still works
	//echo 'finding path of '. $file;
	global $uhd, $db;
	if ($file == $uhd) return '../files/'.$file;
	$pointer = 0;
	//unset($path);
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
			$query = mysqli_query($db, "SELECT * FROM files WHERE hash='$file' LIMIT 1");
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
			resp(500, 'Failed to retrieve contents of folder '.$fileParent);
		}
	} else {
		resp(500, 'Failed to count contents of folder '.$fileParent);
	}
}
if ($pageID == 'get_file') {
	$self = sanitize($_POST['hash']);
	$sql = "SELECT * FROM FILES WHERE hash = '$self' AND owner_id = '$uid' LIMIT 1";
	if ($result = mysqli_query($db, $sql)) {
		$rows = mysqli_fetch_object($result);
		echo json_encode($rows);
	} else {
		resp(500, 'Failed to retrieve file details: '.$self);
	}
}
if ($pageID == 'get_file_info') {
	$self = sanitize($_POST['hash']);
	$sql = "SELECT name, hash, parent, is_folder FROM FILES WHERE hash = '$self' AND owner_id = '$uid' LIMIT 1";
	if ($result = mysqli_query($db, $sql)) {
		$rows = mysqli_fetch_object($result);
		echo json_encode($rows);
	} else {
		resp(500, 'Failed to retrieve file details: '.$self);
	}
}
function mkdbdirs($selfPath, $fileParentHash) {
	global $uem, $uid;
	$pos = strpos($selfPath, '/');
	/*if ($pos === false) {
		$fileName = $selfPath;
		$path = '';
	} else {
		$fileName = substr($selfPath, 0, $pos + 1); // get current base path
		$path = substr($selfPath, $pos + 1); // get rest of path
	}*/
	$parentPath = getPath($fileParentHash);

	/*
	if first in path (from root) does not exist in database, (it will exist because its the user root), then add it to the database

	cant use hashes because they dont exist yet, so will need to check for the folder names instead in the fs and db
	*/
	/*
	if first in path (of file) exists in filesystem, start from next in path
	or something... I dont know
	*/
	/*
	change this to be simpler and just store the files relative path as file names (not hashes) in the db
	then just find the folder with the matching path and use that as relative root
	*/

	if (strlen($path) > 0) {
		$folderList = explode($path, '/');
		$folderPath = $folderList[0];
		$fileParent = '';
		for ($i = 0; $i < sizeof($folderList) - 1; $i++) {
			// redo this to use recursion with indexes along the path
			$folderName = $folderList[i];
			$fileParent = $fileParentHash;
			$md5id = md5($folderName);
			$fileHash = getUniqId();

			$sql = "SELECT COUNT(*) as total from FILES WHERE name = '$folderName' AND owner_id = '$uid' LIMIT 1";
			if ($result = mysqli_query($db, $sql)) {
				$total = mysqli_fetch_array($result)['total'];
				if ($total > 0) { // exists in db already, so get its hash to use as parent
					$sql = "SELECT hash from FILES where name = '$folderName' AND owner_id = '$uid' LIMIT 1";
					if ($result = mysqli_query($db, $sql)) {
						$fileParent = mysqli_fetch_array($result)['hash'];
					}
				} else { // does not
					if (mkdir($parentPath.'/'.$folderPath, 0660, true)) { // create it
						// and create folder in db, giving it a name and generating a new hash for it
						$sql = "INSERT INTO FILES (owner_email, owner_id, is_folder, hash, md5id, parent, name) VALUES
							('$uem',
							'$uid',
							'1',
							'$fileHash',
							'$md5id',
							'$fileParent',
							'$fileName')";
						if (mysqli_query($db, $sql)) {
							$fileParent = $fileHash;
						} else {
							resp(500, 'SQL folder insert failed');
						}
					}
				}
			} else { // sql failed
				resp(500, 'SQL folder exists search failed');
			}
			$folderPath .= '/'.$folderList[$i + 1];
		}
		return $fileParent;
	} else {
		$sql = "SELECT COUNT(*) as total from FILES WHERE name = '$fileName' AND owner_id = '$uid' LIMIT 1";
		if ($result = mysqli_query($db, $sql)) {
			$total = mysqli_fetch_array($result)['total'];
				if ($total > 0) { // exists in db already, so get its hash to use as parent
				$sql = "SELECT hash from FILES where name = '$folderName' AND owner_id = '$uid' LIMIT 1";
				if ($result = mysqli_query($db, $sql)) {
					return mysqli_fetch_array($result)['hash'];
				}
			} else {
				if (mkdir($parentPath.'/'.$fileName, 0660)) {
					$fileHash = getUniqId();
					$md5id = md5($fileName);
					$fileParent = $fileParentHash;
					$sql = "INSERT INTO FILES (owner_email, owner_id, is_folder, hash, md5id, parent, name) VALUES
								('$uem',
								'$uid',
								'1',
								'$fileHash',
								'$md5id',
								'$fileParent',
								'$fileName')";
					if (mysqli_query($db, $sql)) {
						return $fileHash;
					} else {
						resp(500, 'SQL folder insert failed');
					}
				}
			}
		}
	}
}
if ($pageID == 'uniqid') {
	resp(200, getUniqId());
}
if ($pageID == 'new_file') {
	if (!isset($_FILES['file']) || !isset($_POST['parent']) || !isset($_POST['hash'])) 
		resp(422, "missing parameters");
	//$fileName = sanitize($_POST['name']);
	//$fPath = $_POST['filepath'];
	//$filePath = $fPath;
	$fileParent = sanitize($_POST['parent']);
	$fileHash = sanitize($_POST['hash']);
	$file = $_FILES['file'];
	$tFile = $_FILES['file']['tmp_name'];
	//$fExt = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
	$fName = $_FILES['file']['name'];
	$fType = $_FILES['file']['type'];
	$fSize = $_FILES['file']['size'];

	if ($fileParent == '' || !$file) resp(422, "missing parameters");

	//$parentPath = realpath(getPath($fileParent));
	//$selfPath = $filePath;
	//$dest = $parentPath.'/'.$selfPath;

	/*if (strpos($rPath, '/') === false) { // uploading a file

	} else { // uploading a folder, which needs folders to be created for it first
		if (!file_exists($dest)) {
			if (mkdir($dest, 0660, true)) {
				$dest = $parentPath.'/'.mkdbdirs($selfPath, $fileParent);
			}
		}
	}*/
	$dest = getPath($fileParent).'/'.$fileHash;
	//$md5id = md5($dest.'/'.$_FILES['file']['name']);
	/*$sql = "SELECT * from files WHERE name = '$fName' AND parent = '$fileParent' AND owner_id = '$uid' LIMIT 1";
	if ($result = mysqli_query($db, $sql)) {
		$total = mysqli_num_rows($result);
		if ($total == 0) {*/
			if (move_uploaded_file($tFile, $dest)) {
				$sql = "INSERT INTO files (owner_email, owner_id, is_folder, hash, parent, name, size) VALUES
					('$uem',
					'$uid',
					'0',
					'$fileHash',
					'$fileParent',
					'$fName',
					'$fSize')";
				if (mysqli_query($db, $sql)) {
					echo json_encode(array('status' => 200, 'hash' => $fileHash));
				} else {
					resp(500, 'SQL file insert failed');
				}
			} else {
				resp(500, 'File upload failed');
			}
		/*} else {
			$row = mysqli_fetch_object($result);
			$fileHash = $row->hash;
			unlink($dest.'/'.$fileHash);
			if (move_uploaded_file($tFile, $dest)) {
				$sql = "UPDATE files SET size = '$fSize', last_modified = '$lmdf' WHERE hash = '$fileHash'";
				if (mysqli_query($db, $sql)) {
					echo json_encode(array('status' => 200, 'hash' => $fileHash));
				} else {
					resp(500, 'SQL file update failed');
				}
			} else {
				resp(500, 'File update failed');
			}
		}
	}*/
}
if ($pageID == 'new_folder') {
	if (!isset($_POST['name']) || !isset($_POST['parent']) || !isset($_POST['hash'])) 
		resp(422, "missing parameters");

	$fileName = sanitize($_POST['name']);
	$fileParent = sanitize($_POST['parent']);
	$fileHash = sanitize($_POST['hash']);
	$tgtpath = getPath($fileParent);
	$realtgtpath = realpath($tgtpath);
	if (!is_dir($realtgtpath))
		resp(500, 'Parent folder does not exist');
	$realfilepath = $realtgtpath.'/'.$fileHash;
	//echo $realfilepath;
	if (mkdir($realfilepath)) {
		$sql = "SELECT * from files WHERE name = '$fileName' AND parent = '$fileParent' AND owner_id = '$uid' AND is_folder = 1 LIMIT 1";
		if ($result = mysqli_query($db, $sql)) {
			$total = mysqli_num_rows($result);
			if ($total == 0) {
				$sql = "INSERT INTO files (owner_email, owner_id, is_folder, hash, parent, name) VALUES
							('$uem',
							'$uid',
							'1',
							'$fileHash',
							'$fileParent',
							'$fileName')";
				if (mysqli_query($db, $sql)) {
					echo json_encode(array('status' => 200, 'hash' => $fileHash));
				} else {
					resp(500, 'SQL folder insert failed');
				}
			} else {
				$row = mysqli_fetch_object($result);
				$fileHash = $row->hash;
				echo json_encode(array('status' => 200, 'hash' => $fileHash));
			}
		} else {
			resp(500, "Folder preexistence check failed");
		}
	} else {
		resp(500, 'Folder creation failed');
	}
}
