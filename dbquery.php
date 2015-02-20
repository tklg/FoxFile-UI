<?php
/*
* dbquery.php - FoxFile
* (c) Theodore Kluge 2015
* http://kluge.ninja
*/
session_start();
require('includes/user.php');
require('includes/config.php');
/*ini_set('upload_max_filesize', '40M');
ini_set('post_max_size', '40M');*/
if(!isset($_SESSION['uid'])) {
	$_SESSION['uid'] = 0;
}
if(!isset($_SESSION['access_level'])) {
	$_SESSION['access_level'] = 0;
}
ini_set('display_errors',1);
error_reporting(E_ALL);
//connect to database  
$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
$usertable = $database['TABLE_USERS'];
$filetable = $database['TABLE_FILES'];
$file_root = $files['ROOT'];
$file_prefix = $files['PREFIX'];
$uid = $_SESSION['uid'];
$alvl = $_SESSION['access_level'];
$uhd = $_SESSION['uhd'];
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
if(isset($_GET['getpath'])) {
	 echo getPath($_GET['getpath']);
}
if(isset($_POST['getpath'])) {
	 echo getPath($_POST['getpath']);
}
if (isset($_GET['phpinfo'])) {
	phpinfo();
	die();
}
function getPath($file) {
	global $file_root, $file_prefix, $uhd, $file_root;
	$pointer = 0;
	$path = array();
	function recursivePath($file) {
		global $db, $filetable, $pointer, $path;
		$curPos = array();
		$query = mysqli_query($db, "SELECT * FROM $filetable WHERE file_self='$file'");
		while($row = mysqli_fetch_array($query)) {
			$path[] = $row['file_parent'];
			$curPos[] = $row['file_parent'];
		}
		foreach ($curPos as $key => $value) {
			$pointer++;
			recursivePath($value);
		}
		return $path;
	}
	if ($file === $uhd) {
		return $file_root . '/' .  $file;
	}
	$pointer = 1;
	$files = array_reverse(recursivePath($file));
	$path = $file_root;
	foreach ($files as $key => $value) {
		if ($pointer !== sizeof($files)) {
			$path .= '/' . $value;
		} else {
			$path .= '/' . $value . '/' . $file;
		}
		$pointer++;
	}
	//echo $path;
	return $path;
}
function deleteDir($path) {
	foreach(glob("{$path}/*") as $file) {
        if(is_dir($file)) { 
            deleteDir($file);
        } else {
            unlink($file);
            //echo 'removing ' . $file . '<br>';
        }
    }
    rmdir($path);
    //echo 'removing ' . $path . '<br>';
}
function createFolder($file) {
	$path = getPath($file);
	if (mkdir($path, 0777, true)) return true;
}
function createFile($filePath) {
	return true;
}
function deleteFolder($folder) {
	$path = getPath($folder);
	deleteDir($path);
}
function deleteFile($file) {
	$path = getPath($file);
	unlink($path);
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
	if ($alvl > 0) {
		$dir = sanitize($_GET['dir']);
		$type = sanitize($_GET['type']);
		if ($type === 'folder') {
			$dirOwner = mysqli_query($db, "SELECT owner from $filetable WHERE file_parent='$dir'");
			$resultDir = mysqli_query($db, "SELECT * from $filetable WHERE file_parent='$dir' AND owner='$uid' ORDER BY file_type");
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
						echo '[{"PID": "0","owner":"0","file_name":"File Access Denied","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":""}]';
						//echo json_encode($r);
					}
			} else {  
			    echo '[{"PID": "0","owner":"0","file_name":"Folder is Empty","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":""}]';  
			}
		} else {
			$dirOwner = mysqli_query($db, "SELECT owner from $filetable WHERE file_self='$dir'");
			$resultFileData = mysqli_query($db, "SELECT * from $filetable WHERE file_self='$dir' AND owner='$uid'");
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
						echo '[{"PID": "0","owner":"0","file_name":"File Access Denied","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":""}]';
						//echo json_encode($r);
					}
			} else {  
			   	echo '[{"PID": "0","owner":"0","file_name":"File Does Not Exist","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":""}]';
			}
		}
	}
}
if (isset($_POST['new_folder'])) {
	if ($alvl > 0) {
		$folder_name = sanitize($_POST['title']);
		$parent_id = sanitize($_POST['file_id']);
		$fileType = 'folder';
		$date = [
			'last_modified' => date("F j, Y, g:i a"),
			'today' => date("Y-m-d H:i:s")
		];
		$self_hash = md5($folder_name . $date['today']);
		$lmdf = $date['last_modified'];

		$sql = "INSERT INTO $filetable (owner, file_name, file_type, file_self, file_parent, last_modified) VALUES
				('$uid', '$folder_name', '$fileType', '$self_hash', '$parent_id', '$lmdf')";

		if (mysqli_query($db, $sql) && createFolder($self_hash)) {
			//create actual folder here
			echo 'success';
		} else {
			echo 0;
		}
	}
}
if(isset($_POST['delete'])) {
	if ($alvl > 0) {
		$hash_self = sanitize($_POST['file_id']);
		if ($hash_self == $uhd) {
			echo 'Cannot delete the home directory!';
		} else {
			$delItems = '';
			$type = '';
			$query = mysqli_query($db, "SELECT file_type FROM $filetable WHERE file_self='$hash_self'");
			while($row = mysqli_fetch_array($query)) {
				$type = $row['file_type'];
			}
			$delTree = [$hash_self];
			$pointer = 0;
			$isOwner = true;
			function recursiveDelete($self) {
				global $db, $filetable, $delTree, $pointer, $isOwner, $uid;
				$curPos = array();
				$query = mysqli_query($db, "SELECT * FROM $filetable WHERE file_parent='$self'");

				while($row = mysqli_fetch_array($query)) {
					$delTree[] = $row['file_self']; //get self ids from all files within target
					$curPos[] = $row['file_self'];
					if ($row['owner'] !== $uid) {
						$isOwner = false;
					}
				}

				foreach ($curPos as $key => $value) {
					recursiveDelete($value);
					//echo $pointer . ' - ' . $value . '<br>';
					$pointer++;
				}
			}
			recursiveDelete($hash_self);
			//echo '<br>';
			$pointer = 0;
			foreach ($delTree as $key => $value) {
				//echo 'deleting - ' . $value . '<br>';
				if ($pointer != sizeof($delTree) - 1) {
					$delItems .= '\'' . $value . '\', ';
				} else {
					$delItems .= '\'' . $value . '\'';
				}
				$pointer++;
			}
			//echo 'with src directory - ' . $hash_self . '<br>';
			//echo $delItems . '<br>';
			if ($isOwner) {
				if ($type == 'folder') {
					deleteFolder($hash_self);
				} else {
					deleteFile($hash_self);
				}
				if(mysqli_query($db, "DELETE FROM $filetable WHERE file_self IN ($delItems)")) {
					echo 1;
				} else {
					echo "Deletion failed!";
				}
			} else {
				echo "You do not own this file.";
			}
		}
	}
}
if (isset($_POST['rename'])) {
	$hash_self = sanitize($_POST['file_id']);
	$newName = sanitize($_POST['name']);
	if ($hash_self == $uhd) {
		echo 'Cannot rename the home directory!';
	} else {
		$date = date("F j, Y, g:i a");
		$isOwner = true;

		$query = mysqli_query($db, "SELECT * FROM $filetable WHERE file_self='$hash_self'");

		while($row = mysqli_fetch_array($query)) {
			if ($row['owner'] !== $uid) {
				$isOwner = false;
			}
		}

		if ($isOwner) {
			if(mysqli_query($db, "UPDATE $filetable SET file_name = '$newName', last_modified = '$date' WHERE file_self = '$hash_self'")) {
				echo 1;
			} else {
				echo "Rename failed!";
			}
		} else {
			echo "You do not own this file.";
		}
	}
}
if(isset($_GET['upload_target'])) {
	$target = sanitize($_GET['upload_target']);
	$path = getPath($target);
	//echo $path;

	//no security at all! :D
	if (!empty($_FILES)) {
		$tFile = $_FILES['file']['tmp_name'];
		$fExt = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
		$fName = $_FILES['file']['name']; //this file will be replaced if a matching file is uploaded
		$self_hash = md5($uhd . $_FILES['file']['name']) . '.' . $fExt; //this file will be replaced if a matching file is uploaded
		$targetPath = $path . '/' . $self_hash;; //this file will be replaced if a matching file is uploaded
		$fType = $_FILES['file']['type'];
		$fSize = $_FILES['file']['size'];
		$date = [
			'last_modified' => date("F j, Y, g:i a"),
			'today' => date("Y-m-d H:i:s")
		];
		$lmdf = $date['last_modified'];

		if (move_uploaded_file($tFile, $targetPath)) {
			$sql = "INSERT INTO $filetable (owner, file_name, file_size, file_type, file_self, file_parent, last_modified) VALUES
				('$uid', '$fName', '$fSize', '$fType', '$self_hash', '$target', '$lmdf')";

			if (mysqli_query($db, $sql)) {
				echo 1;
			} else {
				echo 'SQL Failed';
			}
		} else {
			echo 'Upload failed';
		}
	}
}
if(isset($_GET['download'])){
	$fileName = sanitize($_GET['file_id']);
	$n = sanitize($_GET['file_name']);

	$filePath = getPath($fileName);

    if(is_readable($filePath)) {
        $fileSize = filesize($filePath);

        header('Content-Description: File Transfer');
	    header('Content-Type: application/octet-stream');
	    header('Content-Disposition: attachment; filename='.$n);
	    header('Expires: 0');
	    header('Cache-Control: must-revalidate');
	    header('Pragma: public');
	    header('Content-Length: ' . filesize($filePath));
	    readfile($filePath);

        exit();
    }
    else {
        echo ('The provided file path is not valid.');
    }
}

mysqli_close($db);
