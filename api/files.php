<?php
session_start();
require('../includes/user.php');
//require('../includes/cfgvars.php');

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
function deleteDir($path) {
	foreach(glob("{$path}/*") as $file) {
        if(is_dir($file)) { 
            deleteDir($file);
        } else {
            unlink($file);
        }
    }
    rmdir($path);
}
function deleteFolder($folder) {
	$path = getPath($folder);
	deleteDir($path);
}
function deleteFile($file) {
	$path = getPath($file);
	unlink($path);
}
function Zip($source, $destination, $sharedl = false) {
	global $uhd;
	if (!$sharedl) {
	    if (is_string($source)) {
	    	$source_arr = array(getPath($source)); // convert it to array
	    	$source = array($source);
	    	//echo "Source was string, making array<br>";
	    } else {
	    	$fileList = array();
			foreach($source as $file) {
				$fileList[] = getPath($file);
			}
	    	$source_arr = $fileList;
	    }
	} else { //zipping from the shared folder
		if (is_string($source)) {
	    	$source_arr = array('shared/'.$source); // convert it to array
	    	$source = array($source);
	    	//echo "Source was string, making array<br>";
	    } else {
	    	$fileList = array();
			foreach($source as $file) {
				$fileList[] = 'shared/'.$file;
			}
	    	$source_arr = $fileList;
	    }
	}
    if (!extension_loaded('zip')) {
        return false;
    }

    $zip = new ZipArchive();
    if (file_exists($destination)) {
    	if ($zip->open($destination, ZIPARCHIVE::OVERWRITE)) {
	        //echo "Created zip file: ".$destination.'<br>';
	    } else {
	    	return false;
	    }
    } else {
    	if ($zip->open($destination, ZIPARCHIVE::CREATE)) {
	        //echo "Created zip file: ".$destination.'<br>';
	    } else {
	    	return false;
	    }
    }
    $files = array();
    $dest = str_replace('.', '', $destination) . '/'; //makes a normal folder called *zip :D
    //copy over folders
    foreach ($source_arr as $source) {
        if (!file_exists($source)) continue;
		$source = str_replace('\\', '/', realpath($source));
        //echo "Source: " . $source . '<br>';
        $oTarget = str_replace('shared', 'downloads', str_replace('files', 'downloads', $source));
        //echo "Target: " . $oTarget . '<br><hr>';
		if (is_dir($source)) {
			$iterator = new RecursiveDirectoryIterator($source);
			$iterator->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);
		    $files = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::SELF_FIRST);

		    foreach ($files as $file) {
		        $file = str_replace('\\', '/', realpath($file));
		        $target = str_replace('shared', 'downloads', str_replace('files', 'downloads', $file));
		        $tartmp = str_replace('/'.basename($target), '', $target);
		        if (!file_exists($tartmp)) {
		        	//if (is_dir($tartmp)) {
		        		mkdir($tartmp, 0777, true);
		        		//echo "<font color='red'>Folder " . $tartmp . ' did not exist, creating</font><br>';
		        	//}
		        }
		        if (is_dir($file)) {
		            recurse_copy($file, $target);
		            //echo '<hr>';
		        }
		        else if (is_file($file)) {
		            copy($file, $target);
		            //echo '<hr>';
		        }
		    }
		}
		else if (is_file($source)) {
			$target = str_replace('shared', 'downloads', str_replace('files', 'downloads', $file));
		    //$zip->addFromString(basename($source), file_get_contents($source));
		    //copy(str_replace('downloads', 'files', $file), $dest . str_replace($source . '/', '', $file));
		    copy($file, $target);
		}

    }
    //loop through folder renaming files because folders cant be renamed in a zip
    //echo "<b>looping through files and folders</b><hr>";
    $source = $oTarget;
    //echo $source . '<br>';
    if (is_dir($source)) {
		$iterator = new RecursiveDirectoryIterator($source);
		$iterator->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);
	    $files = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::CHILD_FIRST);
	    $i = 0;
	    //echo 'items: ' . sizeof($files).'<br>';
	    foreach ($files as $file) {
	    	//echo 'current index: ' . $i . '<br>';
	        $file = str_replace('\\', '/', realpath($file));

	        if (is_dir($file)) {
	            //echo "Folder: " . $file . '<br>';
	            //echo 'Renaming to: ' . getName(basename($file));
	            chmod($file, 0777);
	            rename($file, str_replace(basename($file), getName(basename($file)), $file));
		        //echo '<hr>';
        	} else if (is_file($file)) {
	        }
	        $i++;
	    }
	}
	else if (is_file($source)) {

	}

    //zip created folder
        if (!file_exists($source)) continue;
		$source = $oTarget;
		//echo '<hr><b>creating zip</b><hr>';
        //echo "Source: " . $source . '<br>';
        $oTarget = str_replace('shared', 'downloads', str_replace('files', 'downloads', $source));
        //echo "Target: " . $oTarget . '<br><hr>';
		if (is_dir($source)) {
			$iterator = new RecursiveDirectoryIterator($source);
			$iterator->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);
		    $files = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::SELF_FIRST);

		    foreach ($files as $file) {
		        $file = str_replace('\\', '/', realpath($file));
		        if (is_dir($file)) {
		            $zip->addEmptyDir(str_replace($source . '/', '', $file . '/'));
		        }
		        else if (is_file($file)) {
		            $zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
		        }
		    }
		}
		else if (is_file($source)) {
		    $zip->addFromString(basename($source), file_get_contents($source));
		    //echo 'file: ' . str_replace('downloads', 'files', $file) . '<hr>';
		    //copy(str_replace('downloads', 'files', $file), $dest . str_replace($source . '/', '', $file));
		}

    //loop through zip renaming files
    //echo "looping through files<br>";
    for($i = 0; $i < $zip->numFiles; $i++) {
    	$s = $zip->statIndex($i);
    	$f = $s['name'];
    	$t = $s['size'];
    	if ($t !== 0) {
	    	$p = pathinfo($f, PATHINFO_DIRNAME);
	    	$fIndex = $zip->locateName(basename($f), ZipArchive::FL_NOCASE|ZipArchive::FL_NODIR);
	    	//echo "got index: " . $fIndex . ' of file: ' . basename($f) . '<br>';
	    	$name = getName(basename($f));
	    	if ($p != '.' && $p != '') {
	    		$name = $p . '/' . $name;
	    	}
	    	$zip->renameIndex($fIndex, $name);
	    	//echo "renaming to: " . $name . '<br>';
	    }
    }
    //echo 'deleting ' . $source;
    deleteDir($source);
    //echo 'a';
    return $zip->close();

}
if ($pageID == 'list_files') {
	$fileParent = sanitize($_POST['hash']);
	$offset = (int) $_POST['offset'];
	$limit = (int) $_POST['limit'];
	$sortBy = 'is_folder DESC, name, lastmod DESC';
	if (isset($_POST['sortby'])) $sortBy = $_POST['sortby'];
	$sql = "SELECT COUNT(*) as total from FILES WHERE parent = '$fileParent' AND owner_id = '$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$total = mysqli_fetch_array($result)['total'];
		$total -= $offset * $limit;
		$remaining = $total - $limit;
		$more = false;
		if ($remaining > 0) $more = true;
		//$sql = "SELECT hash, max(lastmod) as last_modified FROM (SELECT * FROM FILES WHERE parent = '$fileParent' AND owner_id = '$uid' group by name LIMIT $limit OFFSET $offset) as sub INNER JOIN FILES as f on f.hash = sub.hash and f.lastmod = sub.last_modified ORDER BY $sortBy";
		//$sql = "SELECT * FROM FILES WHERE parent = '$fileParent' AND owner_id = '$uid' ORDER BY $sortBy LIMIT $limit OFFSET $offset";
		$sql = "SELECT is_folder, hash, parent, name, size, is_shared, is_public, max(lastmod) as lastmod FROM FILES WHERE parent = '$fileParent' AND owner_id = '$uid' AND is_trashed=0 GROUP BY name ORDER BY $sortBy LIMIT $limit OFFSET $offset";
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
if ($pageID == 'uniqid') {
	resp(200, getUniqId());
}
if ($pageID == 'new_file') {
	if (!isset($_FILES['file']) || !isset($_POST['parent']) || !isset($_POST['hash'])) 
		resp(422, "missing parameters");

	$fileParent = sanitize($_POST['parent']);
	$fileHash = sanitize($_POST['hash']);
	$file = $_FILES['file'];
	$tFile = $_FILES['file']['tmp_name'];
	//$fExt = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
	$fName = $_FILES['file']['name'];
	$fType = $_FILES['file']['type'];
	$fSize = $_FILES['file']['size'];

	if ($fileParent == '' || !$file) resp(422, "missing parameters");

	$parentPath = getPath($fileParent);
	if (!is_dir($parentPath)) mkdir($parentPath, 0770, true);
	$dest = $parentPath.'/'.$fileHash;
	/*$sql = "SELECT * from files WHERE name = '$fName' AND parent = '$fileParent' AND owner_id = '$uid' LIMIT 1";
	if ($result = mysqli_query($db, $sql)) {
		$total = mysqli_num_rows($result);
		if ($total == 0) {*/
			if (move_uploaded_file($tFile, $dest)) {
				$sql = "INSERT INTO files (owner_id, is_folder, hash, parent, name, size) VALUES
					('$uid',
					'0',
					'$fileHash',
					'$fileParent',
					'$fName',
					'$fSize')";
				if (mysqli_query($db, $sql)) {	// put some sort of versioning systen instead of just displaying every version as a separate file
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
				$sql = "INSERT INTO files ( owner_id, is_folder, hash, parent, name) VALUES
							('$uid',
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
if ($pageID == 'list_trash') {
	$fileParent = sanitize($_POST['hash']);
	$offset = (int) $_POST['offset'];
	$limit = (int) $_POST['limit'];
	$sortBy = 'is_folder DESC, name';
	if (isset($_POST['sortby'])) $sortBy = $_POST['sortby'];
	$sql = "SELECT COUNT(*) as total from FILES WHERE parent = '$fileParent' AND owner_id = '$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$total = mysqli_fetch_array($result)['total'];
		$total -= $offset * $limit;
		$remaining = $total - $limit;
		$more = false;
		if ($remaining > 0) $more = true;
		$sql = "SELECT is_folder, hash, parent, name, size, is_shared, is_public, max(lastmod) as lastmod FROM FILES WHERE owner_id = '$uid' AND is_trashed=1 GROUP BY name ORDER BY $sortBy LIMIT $limit OFFSET $offset";
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
if ($pageID == 'rename') {
	$hash = sanitize($_POST['hash']);
	$newName = sanitize($_POST['name']);
	if ($hash == $uhd) {
		resp(400, 'Cannot rename the home directory!');
	} else {
		/*$isOwner = true;

		$query = mysqli_query($db, "SELECT * FROM files WHERE hash='$hash' LIMIT 1");

		while($row = mysqli_fetch_array($query)) {
			if ($row['owner'] !== $uid) {
				$isOwner = false;
			}
		}*/

		if(mysqli_query($db, "UPDATE files SET name = '$newName', lastmod = NOW() WHERE owner_id = '$uid' AND hash = '$hash' LIMIT 1")) {
			resp(200, 'Renamed file or folder');
		} else {
			resp(500, "Failed to rename file or folder");
		}
	}
}
if($pageID == 'trash') {
	$hashlist = sanitize($_POST['hashlist']);
	if (strpos($hashlist, $uhd) !== false) {
		resp(400, 'Cannot delete the home directory!');
	} else {
		foreach (explode(',', $hashlist) as $hash) {
			if ($name = mysqli_query($db, "SELECT name FROM files WHERE hash='$hash' LIMIT 1")) {
				$name = mysqli_fetch_object($name)->name;
				//if (mysqli_query($db, "UPDATE files SET is_trashed=1 WHERE name=(SELECT name FROM files WHERE hash='$hash' LIMIT 1) AND owner_id = '$uid'"))
				if (mysqli_query($db, "UPDATE files SET is_trashed=1 WHERE name='$name' AND owner_id = '$uid'"))
					resp(200, 'moved files to trash');
				else
					resp(500, 'failed to delete files');
			} else {
				resp(500, 'failed to delete files');
			}
		}
	}
}
if($pageID == 'delete') {
		$hash = sanitize($_POST['file_id']);
		if ($hash == $uhd) {
			resp(400, 'Cannot delete the home directory!');
		} else {
			$delItems = '';
			$type = '';
			$query = mysqli_query($db, "SELECT type FROM files WHERE hash='$hash'");
			while($row = mysqli_fetch_array($query)) {
				$type = $row['type'];
			}
			$delTree = [$hash];
			$pointer = 0;
			$isOwner = true;
			function recursiveDelete($self) {
				global $db, $filetable, $delTree, $pointer, $isOwner, $uid;
				$curPos = array();
				$query = mysqli_query($db, "SELECT * FROM files WHERE parent='$self' AND owner_id='$uid'");
					while($row = mysqli_fetch_array($query)) {
					$delTree[] = $row['hash']; //get self ids from all files within target
					$curPos[] = $row['hash'];
					if ($row['owner_id'] !== $uid) {
						$isOwner = false;
					}
				}
					foreach ($curPos as $key => $value) {
					recursiveDelete($value);
					//echo $pointer . ' - ' . $value . '<br>';
					$pointer++;
				}
			}
			recursiveDelete($hash);
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
					deleteFolder($hash);
				} else {
					deleteFile($hash);
				}
				if(mysqli_query($db, "DELETE FROM $filetable WHERE hash IN ($delItems)")) {
					resp(200, 'Deleted file or folder');
				} else {
					resp(500, 'failed to delete file or folder');
				}
			} else {
				resp(401, "you do not own this file or folder");
			}
		}
}
//100% efficient not bad function that definitely doesnt pass 1 query per file to delete in the group
// use this instead of the single delete function because it should wokr for everything
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
		//} else if (strpos(getPath($hash_self), $target) !== false) {
			//echo 'Cannot move a folder into itself!';
		} else {
			if (sizeof(explode('/', $file_target_path)) > sizeof(explode('/', getPath($hash_self)))) { //doesnt actually work, but the rename() will prevent this anyway
				if (strpos(getPath($hash_self), $target) !== false) {
					echo 'Cannot move a folder into itself!';
					die();
				}
			}
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
		if(getOwner($fileName) == $uid || isShared($fileName) == 1) {
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
	$isShared = isShared($fileName);

	if (getOwner($fileName) == $uid || $isShared) {

		if ($isShared) {
			$filePath = 'shared/'.$fileName;
		} else {
			$filePath = getPath($fileName);
		}

	    if(is_readable($filePath)) {
	        $fileSize = filesize($filePath);

	        header('Content-Description: File Transfer');
		    header('Content-Type: application/octet-stream');
		    header('Content-Disposition: attachment; filename='.$n);
		    header('Expires: 0');
		    header('Cache-Control: must-revalidate');
		    header('Pragma: public');
		    header('Content-Length: ' . filesize($filePath));
		    ob_end_flush();
		    readfile($filePath);

	        exit();
	    }
	    else {
	        echo ('The provided file path is not valid.');
	    }
	} else {
		header("HTTP/1.1 403 Access Denied");
		header("Location: error?404");
	}
}
if(isset($_GET['multi_download'])) {
	$fileName = sanitize($_GET['file_id']);
	$n = sanitize($_GET['file_name']);
	$type = sanitize($_GET['file_type']); //folder or group of files
	if (!file_exists('downloads')) mkdir('downloads');
	if (!file_exists('downloads/' . $uhd)) mkdir('downloads/' . $uhd);
	$destination = 'downloads/' . $uhd . '/' . $n . '.zip';
	//echo 'ID: ' . $fileName.'<br>';
	//echo 'Name: ' . $n.'<br>';
	//echo 'Type: ' . $type.'<br>';
	//echo 'Dest: ' . $destination.'<br>';
	//if files to dl is > 1, use file zip
	//else use folder zip
	if ($type == 'file') { //if file name contains , is multiple files
		$files = explode(',', $fileName);
		//echo 'Type = File<br>';
	} else {
		$files = $fileName;
		//echo 'Type = Folder<br>';
	}
	if ($type === 'folder') {
		$isShared = isShared($files);
		if (getOwner($files) == $uid || $isShared) {
			if ($isShared) {
				if (!Zip($files, $destination, true)) echo "Failed to zip files.";
			} else {
				//echo 'Zipping folder<br>';
				if (!Zip($files, $destination)) echo "Failed to zip files.";
			}
		} else {
			//echo "You do not have access to these files.";
		}
	} else if ($type === 'file') {
		//$files will be a CSV split into an array
		$fil = $files[0];
		$isShared = isShared($files[0]);
		if (getOwner($files[0]) == $uid || $isShared) {
			if ($isShared) {
				if (!Zip($files, $destination, true)) echo "Failed to zip files.";
			} else {
				//echo 'Zipping files<br>';
				if (!Zip($files, $destination)) echo "Failed to zip files.";
			}
		} else {
			//echo "You do not have access to these files.";
		}
	}
	if(file_exists($destination)) {
		//echo $destination;
	    header('Pragma: public');
	    header('Expires: 0');
	    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	    header('Content-Type: application/octet-stream');
	    header("Content-Description: File Transfer");
	    header('Content-Disposition: attachment; filename="'.$n.'.zip"');
	    header('Content-Length: ' . filesize($destination));
	    header("Content-Transfer-Encoding: binary");
	    ob_clean();
		flush();
	    readfile($destination);
	    //sleep(1);
	    //file should stay until it finishes downloading, then poof by itself
	    //echo '<br>deleting ' . $destination . '<br>';
	    if (unlink($destination))
			echo "Cleared user downloads folder";
	    exit();
	} else {
		echo 'Could not find file: ' . $destination;
	}
}

mysqli_close($db);