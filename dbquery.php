<?php
/*
* dbquery.php - FoxFile
* (c) Theodore Kluge 2015
* http://kluge.ninja
*/
session_start();
require('includes/user.php');
require('includes/config.php');
ini_set('upload_max_filesize', $ini_max_upload . 'M');
ini_set('post_max_size', $ini_max_upload . 'M');
if(!isset($_SESSION['uid'])) $_SESSION['uid'] = 0;
if(!isset($_SESSION['access_level'])) $_SESSION['access_level'] = 0;
if(!isset($_SESSION['uhd'])) $_SESSION['uhd'] = 0;
if(!isset($_SESSION['access_level'])) $_SESSION['access_level'] = 0;
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
function getOwner($f) {
			global $db, $filetable;
			$c = sanitize($f);
			$result = mysqli_query($db, "SELECT owner from $filetable where file_self = '$c'");
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
	 echo '<br>'.getPath($_GET['getpath']);
}
if(isset($_POST['getpath'])) {
	 echo getPath($_POST['getpath']);
}
if(isset($_GET['getpaths'])) {
	echo $_GET['getpaths'];
	$paths = explode(',', $_GET['getpaths']);
	foreach ($paths as $value) {
		echo'<br>'.getPath($value);
	}
}
if(isset($_GET['getowner'])) {
	 echo getOwner($_GET['getowner']);
}
if(isset($_GET['readable'])) {
	echo is_readable(getPath($_GET['readable']));
}
if (isset($_GET['phpinfo'])) {
	phpinfo();
	die();
}
function getPath($file) { //this function was evil
	global $file_root, $file_prefix, $uhd, $db, $filetable;
	$pointer = 0;
	unset($path);
	$path = array();
	$root = $file_root;

	$finalPathArray = array();
	$isFirstTime = true;
	//echo 'function recursivePath();';
	if (!function_exists('recursivePath')) {
		//$recursivePath = function($file) use ($db, $filetable, $pointer, $path, $isFirstTime) {
		function recursivePath($file, $isFirstTime) {
			global $db, $filetable, $uhd, $pointer, $path, $finalPathArray;
			//if ($isFirstTime) unset($path);
			//echo '<br>original value of $path: '; print_r($path);
			if ($isFirstTime) {
				//echo '<br> is first time - ';
				$path = array();
				//echo '<br>value of $path after reset: '; print_r($path);
			}
			$curPos = '';
			$query = mysqli_query($db, "SELECT * FROM $filetable WHERE file_self='$file'");
			while($row = mysqli_fetch_array($query)) {
				$path[] = $row['file_parent'];
				$curPos = $row['file_parent'];
				//echo '<br>curPos: '; print_r($curPos);
				//echo '<br>$path: '; print_r($path);echo'<br>';
			}
			/*foreach(mysqli_fetch_array($query) as $row) {
				$path[] = $row['file_parent'];
				$curPos[] = $row['file_parent'];
				echo '<br>curPos: ' . $row['file_parent'].'';
				echo '<br>$path: '; print_r($path);
			}*/
			$finalPathArray = array();
			$hasSet = false;
			/*foreach ($curPos as $value) {
				$pointer++;*/
				//echo '<br>curpos: ' . $curPos;
				if ($curPos !== $uhd) {
					//echo '<br>recursing...';
					//echo '<br>path: ';print_r($path);
					//$notdone = recursivePath($curPos, false);
					//$finalPathArray = recursivePath($curPos, $path, false);
					//$finalPathArray = $path;
					//return 'notdone';
					return recursivePath($curPos, false);
				} else {
					//echo '<br>setting final array...';
					$ret = array();
					$finalPathArray = $path;
					//echo '<br>final path: ';print_r($finalPathArray);
					return $finalPathArray;
				}
				/*if ($hasSet === false) {
					$ret = $finalPathArray;
					echo '<br>set ret to: ';print_r($ret);
				}
				$hasSet = true;
			}*/
			//echo '<br>pointerPre: '.$pointer;
			//echo '<br>path: ';print_r($path);
			//echo '<br>finalpatharray: ';print_r($finalPathArray);
			//echo '<br>ret: ';print_r($ret);echo '<br>';
			/*if ($pointer < sizeof($curPos)) {
				$pointer++;
				echo '<br>pointer: '.$pointer;
				echo '<br>curpos: '.sizeof($curPos);
				echo '<br>recursivePath in foreach: value ' .$curPos[$pointer];
				return recursivePath($curPos[$pointer], $path, false, $pointer);
			} else {
				echo '<br>new value of $path: '; print_r($path);
				return $path;
			}*/
			//unset($curPos);
			
			//return $path;
			//return $ret;
			//return $finalPathArray;
		}
	}
	if ($file === $uhd) {
		return $file_root . '/' .  $file;
	}
	//unset($files);
	$fileArray = array();
	$finalPathArray = recursivePath($file, $isFirstTime);
	//fileArray = recursivePath($file, $path, $isFirstTime);
	$fileArray = $finalPathArray;
	//echo '<br>final-finalpatharray: ';print_r($fileArray);
	//echo '<br>fileArray: ';print_r($fileArray);
	$files = array_reverse($fileArray);
	//echo '<br>unsetting $path: '; //unset $path after getting the returned filepath
	//unset($path);
	//$path = array();
	//echo '<br>files: ';print_r($files);
	//$root = $file_root;
	$pointer = 1;
	foreach ($files as $value) {
		//echo 'a '. $value.'<br>';
		//echo '<br>filelistsize: ' . sizeof($files);
		//echo '<br>';print_r($files);
		//echo '<br>preroot: '.$root;
		if ($pointer < sizeof($files)) {
			$root .= '/' . $value;
			//echo '<br>-'.$root;
		} else {
			$root .= '/' . $value . '/' . $file;
			//echo '<br>-'.$root;
			//echo '<br>';
			return $root;
		}
		$pointer++;
	}
	//$pointer = 0;
	//echo $path;
	$rootret = $root;
	$root = null;
	//return $rootret;
}
function getUsedStorage($user) {

	global $db, $filetable, $usertable;
	$user = sanitize($user);
	$usedstorage = 0;
	$totalstorage = 0;
	$result = mysqli_query($db, "SELECT file_size from $filetable where owner = '$user'");
	while ($row = mysqli_fetch_array($result)) {
		$usedstorage += $row['file_size'];
	}
	$result = mysqli_query($db, "SELECT total_storage from $usertable where PID = '$user'");
	$row = mysqli_fetch_array($result);
	$totalstorage += $row['total_storage'];

	return array($usedstorage, $totalstorage);
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
if(isset($_GET['dir'])) {
	if ($alvl > 0) {
		$dir = sanitize($_GET['dir']);
		$type = sanitize($_GET['type']);
		if ($type === 'folder') {
			$dirOwner = mysqli_query($db, "SELECT owner from $filetable WHERE file_parent='$dir'");
			$resultDir = mysqli_query($db, "SELECT * from $filetable WHERE file_parent='$dir' AND owner='$uid' ORDER BY file_type"); //also order by file_type or file_name or last_modified
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
			    echo '[{"PID": "0","owner":"0","file_name":"Folder is Empty","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":"","last_modified":"' . date("F j, Y, g:i a") . '"}]';  
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
			   	echo '[{"PID": "0","owner":"0","file_name":"File Does Not Exist","file_size":"0","file_type":"text","file_self":"test_hash","file_parent":"home_dir","file_child":"","last_modified":"' . date("F j, Y, g:i a") . '"}]'; 
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
//100% efficient not bad function that definitely doesnt pass 1 query per file to delete in the group
if(isset($_POST['multi_delete'])) {
	if ($alvl > 0) {
		$hash_self_array = sanitize($_POST['file_multi']);
		//echo 'hash '.$hash_self_array . '<br>';
		if (strpos($hash_self_array, $uhd) !== false) { 
			echo 'Cannot delete the home directory!';
		} else {
			foreach (explode(',', $hash_self_array) as $value) {
				$hash_self = $value;
				//echo 'foreach '.$hash_self.'<br>';
				$delItems = '';
				$type = '';
				$query = mysqli_query($db, "SELECT file_type FROM $filetable WHERE file_self='$hash_self'");
				while($row = mysqli_fetch_array($query)) {
					$type = $row['file_type'];
				}
				$delTree = [$hash_self];
				$pointer = 0;
				$isOwner = true;
				if (!function_exists('recursiveDelete')) { //only declare the function once
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
						//echo 'deleting folder ' . $hash_self.'<br>';
						deleteFolder($hash_self);
					} else {
						//echo 'deleting file ' . $hash_self.'<br>';
						deleteFile($hash_self);
					}
					$success = true;
					$fails = 0;
					if(mysqli_query($db, "DELETE FROM $filetable WHERE file_self IN ($delItems)")) {
						
					} else {
						$success = false;
						$fails++;
					}
						if ($success) echo '';
						else echo "Failed to delete " . $fails . ' items.';
				} else {
					echo "You do not own this file.";
				}
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
if (isset($_POST['move'])) {
	$file_multi = sanitize($_POST['file_multi']);
	$target = sanitize($_POST['file_target']);
	$file_multi_array = explode(',', $file_multi);
	$file_target_path = getPath($target);

	$isOwner = true;
	$query = mysqli_query($db, "SELECT * FROM $filetable WHERE file_self IN ('$file_multi')");
	while($row = mysqli_fetch_array($query)) {
		if ($row['owner'] !== $uid) {
			$isOwner = false;
		}
	}

	foreach ($file_multi_array as $hash_self) {
		if ($hash_self == $uhd) {
			echo 'Cannot move the home directory!';
		} else if (strpos(getPath($hash_self), $target) !== false) {
			echo 'Cannot move a folder into itself!';
		} else {
			$date = date("F j, Y, g:i a");

			if ($isOwner) {
				if (rename(getPath($hash_self), $file_target_path . '/' . $hash_self)) {
					if(mysqli_query($db, "UPDATE $filetable SET file_parent = '$target', last_modified = '$date' WHERE file_self='$hash_self'")) {
						echo '';
					} else {
						echo "DB move failed!";
					}
				} else {
					echo 'Move failed!';
				}
			} else {
				echo "You do not own this file.";
			}
		}
	}
}
if(isset($_GET['upload_target'])) {
	$target = sanitize($_GET['upload_target']);
	$path = getPath($target);
	//echo $path;

	//no security at all! :D
	$storage = getUsedStorage($uid);

	if ($storage[0] < $storage[1]) {
		if (!empty($_FILES)) {
			$tFile = $_FILES['file']['tmp_name'];
			$fExt = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
			$fName = $_FILES['file']['name']; //this file will be replaced if a matching file is uploaded
			$self_hash = md5($uhd . $path . $_FILES['file']['name']) . '.' . $fExt; //this file will be replaced if a matching file is uploaded
			$targetPath = $path . '/' . $self_hash;; //this file will be replaced if a matching file is uploaded
			$fType = $_FILES['file']['type'];
			$fSize = $_FILES['file']['size'];
			$date = [
				'last_modified' => date("F j, Y, g:i a"),
				'today' => date("Y-m-d H:i:s")
			];
			$lmdf = $date['last_modified'];

			echo $targetPath;

			if (!file_exists($targetPath)) {
				if (move_uploaded_file($tFile, $targetPath)) {
					$sql = "INSERT INTO $filetable (owner, file_name, file_size, file_type, file_self, file_parent, last_modified) VALUES
						('$uid', '$fName', '$fSize', '$fType', '$self_hash', '$target', '$lmdf')";

					if (mysqli_query($db, $sql)) {
						echo 1;
					} else {
						echo 'SQL Insert Failed';
					}
				} else {
					echo 'Upload failed';
				}
			} else {
				unlink($targetPath);
				if (move_uploaded_file($tFile, $targetPath)) {
					$sql = "UPDATE $filetable SET file_name = '$fName', file_size = '$fSize', file_type = '$fType', last_modified = '$lmdf' WHERE file_self = '$self_hash'";

					if (mysqli_query($db, $sql)) {
						echo 1;
					} else {
						echo 'SQL Update Failed';
					}
				} else {
					echo 'Update failed';
				}
			}
		}
	} else {
		echo "You have reached your storage quota!";
	}
}
if(isset($_POST['read_file'])) {
	$fileName = sanitize($_POST['read_file']);
	$filePath = getPath($fileName);
	if (getOwner($fileName) == $uid) {
		if (is_readable($filePath)) {
			echo str_replace('<', '&lt;', str_replace('>', '&gt;', file_get_contents($filePath)));
		} else {
			echo 'File not readable.';
		}
	} else {
		echo 'No permissions.';
	}
}
if(isset($_GET['preview'])) {
	$fileName = sanitize($_GET['preview']);
	$filePath = getPath($fileName);

	if (!extension_loaded('fileinfo')) {
		if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
	        dl('php_fileinfo.dll');
	    } else {
	        dl('fileinfo.so');
	    }
	}

	if (is_readable($filePath)) {
		if(getOwner($fileName) == $uid) {
			$finfo = finfo_open(FILEINFO_MIME_TYPE);
			$fileType = finfo_file($finfo, $filePath);
			finfo_close($finfo);

			header('Content-Type: ' . $fileType);
			readfile($filePath);
			exit();
		} else {
			header("HTTP/1.0 404 Not Found");
		}
	} else {
		echo 'Invalid file path.';
	}
}
if(isset($_GET['download'])) {
	$fileName = sanitize($_GET['file_id']);
	$n = sanitize($_GET['file_name']);

	$filePath = getPath($fileName);

	if (getOwner($fileName) == $uid) {

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
	} else {
		header("Location: error?404");
	}
}
if(isset($_POST['getContent'])) {
	$cType = sanitize($_POST['getContent']);

	$result = mysqli_query($db, "SELECT * from $usertable where PID = '$uid'");
	$row = mysqli_fetch_array($result);
	$userName = $row['display_name'];
	$userEmail = $row['email'];
	$userID = $row['PID'];
	$userJoin = $row['join_date'];
	$gtarhash = md5($userEmail) . '?r=' . $grav_rating . '&d=' . $grav_default;
	$storage = getUsedStorage($uid);
	if ($storage[1] != 0) {
		$storage_percent = number_format((($storage[0] / $storage[1]) * 100), 2, '.', '');
	} else {
		$storage_percent = '0.00';
	}
	$title = sanitize($title);
	$name = sanitize($name);
	//$sr = array($allowsharing, $showfooter, $showpageloadtime, $show_debug, $show_errors);
	$se = array();
	if ($allowsharing) { $se['allow_sharing'] = 'checked="checked"'; $se['allow_sharing2'] = ''; } else { $se['allow_sharing'] = ''; $se['allow_sharing2'] = 'checked="checked"'; }
	if ($showfooter) { $se['show_footer'] = 'checked="checked"'; $se['show_footer2'] = ''; } else { $se['show_footer'] = ''; $se['show_footer2'] = 'checked="checked"'; }
	if ($showpageloadtime) { $se['show_pageload'] = 'checked="checked"'; $se['show_pageload2'] = ''; } else { $se['show_pageload'] = ''; $se['show_pageload2'] = 'checked="checked"'; }
	if ($show_debug) { $se['show_debug'] = 'checked="checked"'; $se['show_debug2'] = ''; } else { $se['show_debug'] = ''; $se['show_debug2'] = 'checked="checked"'; }
	if ($show_errors) { $se['show_errors'] = 'checked="checked"'; $se['show_errors2'] = ''; } else { $se['show_errors'] = ''; $se['show_errors2'] = 'checked="checked"'; }

	if ($cType == 'profile' && $alvl >= $alvl_user) {
		$echo = str_replace("{{gravatar-avatar-hash}}", $gtarhash, str_replace("{{user-email}}", $userEmail, str_replace("{{user-name}}", $userName, file_get_contents('includes/profilepage.php'))));
		$echo = str_replace("{{percent-storage-amount}}", $storage_percent, str_replace("{{total-storage-amount}}", number_format($storage[1]/1000000000, 2, '.', ''), str_replace("{{used-storage-amount}}", number_format($storage[0]/1000000000, 2, '.', ''), $echo)));
		echo str_replace("{{join-date}}", $userJoin, str_replace("{{user-id}}", $userID, $echo));
	} else if ($cType == 'settings' && $alvl >= $alvl_admin) {
		$echo = str_replace('\\', '', str_replace("{{site-title}}", $title, str_replace("{{site-name}}", $name, str_replace("{{group-password}}", $group_password, file_get_contents('includes/settingspage.php')))));
		$echo = str_replace('{{sharing-false}}', $se['allow_sharing2'], str_replace("{{sharing-true}}", $se['allow_sharing'], str_replace("{{site-version}}", $ver, $echo)));
		$echo = str_replace('{{pageloadtime-false}}', $se['show_pageload2'], str_replace('{{pageloadtime-true}}', $se['show_pageload'], str_replace('{{footer-false}}', $se['show_footer2'], str_replace('{{footer-true}}', $se['show_footer'], $echo))));
		$echo = str_replace('{{errors-false}}', $se['show_errors2'], str_replace('{{errors-true}}', $se['show_errors'], str_replace('{{debug-false}}', $se['show_debug2'], str_replace('{{debug-true}}', $se['show_debug'], $echo))));
		echo str_replace('{{ini-max-upload}}', $ini_max_upload, str_replace('{{gravatar-rating}}', $grav_rating, str_replace('{{gravatar-default}}', $grav_default, $echo)));
	} else {
		//echo stuff for the fileviewer
	}
}
if(isset($_POST['newname'])) {
	$newName = sanitize($_POST['newname']);

	if (mysqli_query($db, "UPDATE $usertable SET display_name = '$newName' WHERE PID = '$uid'")) {
		echo "Display name changed.";
	} else {
		echo "Display name change failed.";
	}
}
if(isset($_POST['newemail'])) {
	$newEmail = sanitize($_POST['newemail']);

	if (mysqli_query($db, "UPDATE $usertable SET email = '$newEmail' WHERE PID = '$uid'")) {
		echo "Email address changed.";
	} else {
		echo "Email address change failed.";
	}
}
mysqli_close($db);
