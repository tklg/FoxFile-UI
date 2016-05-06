<?php
/* 
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                                  
    Foxfile : files.php
    Copyright (C) 2016 Theodore Kluge
    https://tkluge.net
*/
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
	resp(401, "You must be logged in to access the files API");
}
if(!isset($_SESSION['foxfile_access_level'])) {
	resp(401, "You must be logged in to access the files API");
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
	$sql = "REPLACE INTO IDGEN (hashes) VALUES ('a')";
	if ($result = mysqli_query($db, $sql)) {
		$newIdObj = mysqli_insert_id($db);
		require '../plugins/hashids/Hashids.php';
		$hashids = new Hashids\Hashids('foxfilesaltisstillbestsalt', 12);
		return $hashids->encode($newIdObj);
	} else {
		return -1;
	}
}
function getUniqLink() {
	global $db;
	$sql = "REPLACE INTO LINKGEN (hashes) VALUES ('a')";
	if ($result = mysqli_query($db, $sql)) {
		$newIdObj = mysqli_insert_id($db);
		require '../plugins/hashids/Hashids.php';
		$hashids = new Hashids\Hashids('foxsaltisbestsalt', 12);
		return $hashids->encode($newIdObj);
	} else {
		return -1;
	}
}
function getName($file) {
	global $uid, $db;
	$result = mysqli_query($db, "SELECT name from files where hash = '$file' AND owner_id='$uid' LIMIT 1");
	$res = mysqli_fetch_object($result);
	return $res->name;
}
function dirSize($path){
    $bytestotal = 0;
    $path = realpath($path);
    if($path !== false){
        foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)) as $object){
            $bytestotal += $object->getSize();
        }
    }
    return $bytestotal;
}
function getPath($file) { // in theory, this function still works
	//echo 'finding path of '. $file;
	global $uhd, $db;
	$file = sanitize($file);
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
			$query = mysqli_query($db, "SELECT parent FROM files WHERE hash='$file' LIMIT 1");
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
	if (!isset($path) || !$path || $path == '' || $path == '/' || $path == '\\') die("THIS MUST NEVER HAPPEN AGAIN");
	foreach(glob("{$path}/*") as $file) {
        if(is_dir($file)) { 
            deleteDir($file);
        } else {
            //echo 'removing file: '.$file.'<br>';
            unlink($file);
        }
    }
    //echo 'removing dir: '.$path.'<br>';
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
function recurse_copy($src,$dst) { 
    $dir = opendir($src); 
		if (!file_exists($dst))
			if (mkdir($dst, 0770, true))
				//echo "<font color='red'>Folder " . $dst . ' did not exist, creating</font><br>';
    while(false !== ( $file = readdir($dir)) ) { 
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) { 
                recurse_copy($src . '/' . $file,$dst . '/' . $file); 
            } 
            else { 
                copy($src . '/' . $file,$dst . '/' . $file); 
            } 
        } 
    } 
    closedir($dir); 
}
function Zip($src, $destination, $zipname, $sharedl = false) {
	/*echo 'ZIP: ';
	echo 'src: '.$src.'<br>';
	echo 'destination: '.$destination.'<br>';
	echo 'zipname: '.$zipname.'<br>';*/
	if (!is_dir($destination)) mkdir($destination, 0770, true);
	global $uhd;
	if (!$sharedl) {
	    if (is_string($src)) {
	    	$source_arr = array(getPath($src)); // convert it to array
	    	$src = array($src);
	    	//echo "Source was string, making array<br>";
	    } else {
	    	$fileList = array();
			foreach($src as $file) {
				$fileList[] = getPath($file);
			}
	    	$source_arr = $fileList;
	    }
	} else { //zipping from the shared folder
		if (is_string($src)) {
	    	$source_arr = array('shared/'.$src); // convert it to array
	    	$src = array($src);
	    	//echo "Source was string, making array<br>";
	    } else {
	    	$fileList = array();
			foreach($src as $file) {
				$fileList[] = 'shared/'.$file;
			}
	    	$source_arr = $fileList;
	    }
	}
    if (!extension_loaded('zip')) {
        return false;
    }

    $files = array();
    //$dest = './../'.str_replace('.', '', str_replace('./../', '', $destination)) . '/'; //makes a normal folder
    //echo $dest.'<br>';
    $oTarget = $destination;
    //copy over folders
    foreach ($source_arr as $source) {
    	//echo 'src: '.$source.'<br>';
        if (!file_exists($source)) continue;
		$source = str_replace('\\', '/', realpath($source));
        //echo "Source: " . $source . '<br>';
        //echo "Target: " . $oTarget . '<br><hr>';
        //$oTarget = str_replace('files', 'temp', $source);
		if (is_dir($source)) {
			$iterator = new RecursiveDirectoryIterator($source);
			$iterator->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);
		    $files = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::SELF_FIRST);
		    //echo 'folder: <br>';
		    foreach ($files as $file) {
		        //$target = str_replace('files', 'temp', $file);
		        $file = str_replace('\\', '/', realpath($file));
		        $tmp = str_replace('./../temp/'.$uhd.'/', '', $destination);
		        $target = str_replace('files/'.$uhd, 'temp/'.$uhd.'/'.$tmp, $file);
		        //echo 'exp: '.explode('/', $target)[array_search($tmp, explode('/',$target)) + 1].'<br>';
		        $target = str_replace(explode('/', $target)[array_search($tmp, explode('/',$target)) + 1].'/', '', $target);

		       /* echo 'file: '.$file.'<br>';
		        echo 'dest: '.$destination.'<br>';
		        echo 'tmp: '.$tmp.'<br>';
		        echo 'target: '.$target.'<br><br>';*/
		        //$tartmp = $target;
		        $tartmp = str_replace('/'.basename($target), '', $target);
		        if (!file_exists($tartmp)) {
		        	//if (is_dir($tartmp)) {
		        		mkdir($tartmp, 0770, true);
		        		//echo "<font color='red'>Folder " . $tartmp . ' did not exist, creating</font><br>';
		        	//}
		        }
		        if (is_dir($file)) {
		            recurse_copy($file, $target);
		            //echo '<hr>';
		        } else if (is_file($file)) {
/*		        	echo 'copying:<br>';
		        	echo 'file: '.$file.'<br>';
		        	echo 'tgt: '.$target.'<br>';*/
		            copy($file, $target);
		            //echo '<hr>';
		        }
		    }
		} else if (is_file($source)) {
			$file = str_replace('\\', '/', realpath($source));
			$tmp = str_replace('./../temp/'.$uhd.'/', '', $destination);
		    $target = str_replace('files/'.$uhd, 'temp/'.$uhd.'/'.$tmp, $file);
		    $tartmp = str_replace('/'.basename($target), '', $target);
		    $target = $destination.'/'.basename($file);
		    //$zip->addFromString(basename($source), file_get_contents($source));
		    //copy(str_replace('downloads', 'files', $file), $dest . str_replace($source . '/', '', $file));
		    /*echo 'file: '.$file.'<br>';
		    echo 'dest: '.$destination.'<br>';
		    echo 'tmp: '.$tmp.'<br>';
		    echo 'target: '.$target.'<br>';
		    echo 'tartmp: '.$tartmp.'<br><br>';*/
		    //if(!is_dir($tartmp)) mkdir($tartmp, 0770, true);
		    copy($file, $target);
		}

    }
    //loop through folder renaming files because folders cant be renamed in a zip
    //echo "<b>looping through files and folders</b><hr>";
    $source = $oTarget;
    //echo 'renaming folders in: '.$source.'<br>';
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
	            //echo 'Renaming to: ' . getName(basename($file)).'<br>';
	            chmod($file, 0770);
	            rename($file, str_replace(basename($file), getName(basename($file)), $file));
		        //echo '<hr>';
        	} else if (is_file($file)) {
        		//renamed inside the zip
	        }
	        $i++;
	    }
	}
	$zip = new ZipArchive();
    if (file_exists($zipname)) {
    	if ($zip->open($zipname, ZIPARCHIVE::OVERWRITE)) {
	    } else {
	    	return false;
	    }
    } else {
    	if ($zip->open($zipname, ZIPARCHIVE::CREATE)) {
	    } else {
	    	return false;
	    	//psh cleanup
	    }
    }
    //zip created folder
        //if (!file_exists($source)) continue;
		$source = str_replace('\\', '/', realpath($oTarget));;
		//echo 'zipping: '.$source.'<br>';
		//echo '<hr><b>creating zip</b><br>';
        //echo "Source: " . $source . '<br>';
        //$oTarget = str_replace('files', 'temp', $source);
        //echo "Target: " . $oTarget . '<br><hr>';
		if (is_dir($source)) {
			$iterator = new RecursiveDirectoryIterator($source);
			$iterator->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);
		    $files = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::SELF_FIRST);

		    foreach ($files as $file) {
		        $file = str_replace('\\', '/', realpath($file));
		        //echo 'file: '.$file.'<br>';
		        if (is_dir($file)) {
		        	//echo 'adding dir: '.str_replace($source, '', $file).'<br>';
		            $zip->addEmptyDir(str_replace($source, '', $file));
		        }
		        else if (is_file($file)) {
		        	//echo 'adding file: '.str_replace($source . '/', '', $file).'<br>';
		            $zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
		        }
		        //echo '<br>';
		    }
		} else if (is_file($source)) {
			echo '<strong>this should never happen</strong><br>';
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
function getOwner($f) {
	global $db, $filetable;
	$c = sanitize($f);
	$result = mysqli_query($db, "SELECT owner_id from files where hash = '$c' LIMIT 1");
	$row = mysqli_fetch_array($result);
	return $row['owner_id'];
}
function isShared($file) {
	global $db, $filetable;
	$file = sanitize($file);
	$result = mysqli_query($db, "SELECT is_shared from files where hash = '$file' LIMIT 1");
	$row = mysqli_fetch_array($result);
	return $row['is_shared'] === '1';
}
if ($pageID == 'list_files') {
	$fileParent = sanitize($_POST['hash']);
	$offset = intval((int) $_POST['offset']);
	$limit = intval((int) $_POST['limit']);
	//echo 'limit: '.$offset;
	$sortBy = 'f.is_folder DESC, f.name, f.lastmod DESC';
	if (isset($_POST['sortby'])) {
		$sortBy = '';
		if ($_POST['sortby'] == 'name') $sortBy .= 'name';
		if ($_POST['sortby_direction'] == 'asc') $sortBy .= ' ASC';
	}
	//$sql = "SELECT COUNT(*) AS total FROM files WHERE parent = '$fileParent' AND owner_id = '$uid' GROUP BY name";
	$sql = "SELECT COUNT(DISTINCT name) AS total FROM files WHERE parent = '$fileParent' AND owner_id = '$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$total = mysqli_fetch_object($result)->total;
		$total = (int) $total;
		$total -= ($offset * $limit);
		$remaining = $total - $limit;
		$more = false;
		if ($remaining > 0) $more = true;
		//$sql = "SELECT hash, max(lastmod) as last_modified FROM (SELECT * FROM FILES WHERE parent = '$fileParent' AND owner_id = '$uid' group by name LIMIT $limit OFFSET $offset) as sub INNER JOIN FILES as f on f.hash = sub.hash and f.lastmod = sub.last_modified ORDER BY $sortBy";
		//$sql = "SELECT is_folder, hash, parent, name, size, is_shared, is_public, lastmod FROM files WHERE hash IN (SELECT max(lastmod), hash FROM files WHERE parent = '$fileParent' AND owner_id = '$uid' AND is_trashed=0 GROUP BY name ORDER BY $sortBy LIMIT $limit OFFSET $offset)";
		//$sql = "SELECT is_folder, hash, parent, name, size, is_shared, is_public, max(lastmod) as lastmod FROM FILES WHERE parent = '$fileParent' AND owner_id = '$uid' AND is_trashed=0 GROUP BY name ORDER BY $sortBy LIMIT $limit OFFSET $offset";
		$sql = "SELECT f.* FROM FILES f JOIN (SELECT name, max(lastmod) as latest FROM files WHERE parent = '$fileParent' AND owner_id = '$uid' AND is_trashed=0 GROUP BY name) f2 ON f.lastmod = f2.latest and f.name = f2.name ORDER BY $sortBy LIMIT $limit OFFSET $offset";
		if ($result = mysqli_query($db, $sql)) {
			$rows = array();
			while ($row = mysqli_fetch_object($result)) {
				$rows[] = $row;
			}
			$final = array(
				'total_rows' => $total,
				'offset' => $offset,
				'limit' => $limit,
				'more' => $more,
				'remaining' => $remaining/* > 0 ? $remaining : 0*/,
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
if ($pageID == 'list_folders') {
	$fileParent = sanitize($_POST['hash']);
	$offset = intval((int) $_POST['offset']);
	$limit = intval((int) $_POST['limit']);
	//echo 'limit: '.$offset;
	$sortBy = 'f.is_folder DESC, f.name, f.lastmod DESC';
	if (isset($_POST['sortby'])) {
		$sortBy = '';
		if ($_POST['sortby'] == 'name') $sortBy .= 'name';
		if ($_POST['sortby_direction'] == 'asc') $sortBy .= ' ASC';
	}
	//$sql = "SELECT COUNT(*) AS total FROM files WHERE parent = '$fileParent' AND owner_id = '$uid' GROUP BY name";
	$sql = "SELECT COUNT(DISTINCT name) AS total FROM files WHERE parent = '$fileParent' AND owner_id = '$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$total = mysqli_fetch_object($result)->total;
		$total = (int) $total;
		$total -= ($offset * $limit);
		$remaining = $total - $limit;
		$more = false;
		if ($remaining > 0) $more = true;
		$sql = "SELECT f.* FROM FILES f JOIN (SELECT name, max(lastmod) as latest FROM files WHERE parent = '$fileParent' AND owner_id = '$uid' AND is_trashed=0 AND is_folder=1 GROUP BY name) f2 ON f.lastmod = f2.latest and f.name = f2.name ORDER BY $sortBy LIMIT $limit OFFSET $offset";
		if ($result = mysqli_query($db, $sql)) {
			$rows = array();
			while ($row = mysqli_fetch_object($result)) {
				$rows[] = $row;
			}
			$final = array(
				'total_rows' => $total,
				'offset' => $offset,
				'limit' => $limit,
				'more' => $more,
				'remaining' => $remaining/* > 0 ? $remaining : 0*/,
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
	//pass this a name and parent hash too so merging uploaded folders becomes possible
	if (isset($_POST['name']) && isset($_POST['parent'])) {
		$name = sanitize($_POST['name']);
		$parent = sanitize($_POST['parent']);
		$q = "SELECT hash FROM files WHERE name='$name' AND parent='$parent' AND owner_id='$uid' LIMIT 1";
		if ($result = mysqli_query($db, $q)) {
			if (mysqli_num_rows($result) > 0) {
				$r = mysqli_fetch_object($result)->hash;
				resp(200, $r);
			} else {
				resp(200, getUniqId());
			}
		}
	} else {
		resp(200, getUniqId());
	}
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

	if ($fileParent == '' || !$file) resp(422, "missing parameters, or file chunk is too big");

	$parentPath = getPath($fileParent);
	if (!is_dir($parentPath)) mkdir($parentPath, 0770, true);
	$dest = $parentPath.'/'.$fileHash;
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
}
if ($pageID == 'new_folder') {
	if (!isset($_POST['name']) || !isset($_POST['parent']))
		resp(422, "missing parameters");

	$fileName = sanitize($_POST['name']);
	$fileParent = sanitize($_POST['parent']);
	if (isset($_POST['hash'])) {
		$fileHash = $_POST['hash'];
	} else {
		$q = "SELECT hash FROM files WHERE name='$fileName' AND parent='$fileParent' AND owner_id='$uid' LIMIT 1";
		if ($result = mysqli_query($db, $q)) {
			if (mysqli_num_rows($result) > 0) {
				$r = mysqli_fetch_object($result)->hash;
				$fileHash = $r;
			} else {
				$fileHash = getUniqId();
			}
		}
	}	
	$tgtpath = getPath($fileParent);
	$realtgtpath = realpath($tgtpath);
	if (!is_dir($realtgtpath))
		resp(500, 'Parent folder does not exist');
	$realfilepath = $realtgtpath.'/'.$fileHash;
	//echo $realfilepath;
	if (is_dir($realfilepath)) {
		echo json_encode(array('status' => 200, 'hash' => $fileHash));
		die();
	}
	if (mkdir($realfilepath)) {
		/*$sql = "SELECT * from files WHERE name = '$fileName' AND parent = '$fileParent' AND owner_id = '$uid' AND is_folder = 1 LIMIT 1";
		if ($result = mysqli_query($db, $sql)) {
			$total = mysqli_num_rows($result);
			if ($total == 0) {*/
				$sql = "INSERT INTO files (owner_id, is_folder, hash, parent, name) VALUES
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
			/*} else {
				$row = mysqli_fetch_object($result);
				$fileHash = $row->hash;
				echo json_encode(array('status' => 200, 'hash' => $fileHash));
			}
		} else {
			resp(500, "Folder preexistence check failed");
		}*/
	} else {
		resp(500, 'Folder creation failed');
	}
}
if ($pageID == 'list_trash') {
	if (!isset($_POST['offset']) || !isset($_POST['limit']))
		resp(422, "missing parameters");
	$offset = intval((int) $_POST['offset']);
	$limit = intval((int) $_POST['limit']);
	$sortBy = 'f.is_folder DESC, f.name';
	if (isset($_POST['sortby'])) {
		$sortBy = '';
		if ($_POST['sortby'] == 'name') $sortBy .= 'name';
		if ($_POST['sortby_direction'] == 'asc') $sortBy .= ' ASC';
	}
	$sql = "SELECT COUNT(*) as total from FILES WHERE is_trashed=1 AND owner_id = '$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$total = mysqli_fetch_array($result)['total'];
		$total -= $offset * $limit;
		$remaining = $total - $limit;
		$more = false;
		if ($remaining > 0) $more = true;
		//$sql = "SELECT is_folder, hash, parent, name, size, is_shared, is_public, max(lastmod) as lastmod FROM FILES WHERE owner_id = '$uid' AND is_trashed=1 GROUP BY name ORDER BY $sortBy";
		$sql = "SELECT f.* FROM FILES f JOIN (SELECT name, max(lastmod) as latest FROM files WHERE owner_id = '$uid' AND is_trashed=1 GROUP BY name) f2 ON f.lastmod = f2.latest and f.name = f2.name ORDER BY $sortBy LIMIT $limit OFFSET $offset";
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
if ($pageID == 'list_shared') {
	if (!isset($_POST['offset']) || !isset($_POST['limit']))
		resp(422, "missing parameters");
	$offset = intval((int) $_POST['offset']);
	$limit = intval((int) $_POST['limit']);
	$sortBy = 'is_folder DESC, name';
	if (isset($_POST['sortby'])) {
		$sortBy = '';
		if ($_POST['sortby'] == 'name') $sortBy .= 'name';
		if ($_POST['sortby_direction'] == 'asc') $sortBy .= ' ASC';
	}
	$final = array(
				'total_rows' => 0,
				'more' => 0,
				'remaining' => 0,
				'results' => []
			);
			echo json_encode($final);
}
if ($pageID == 'list_versions') {
	if (!isset($_POST['hash']))
		resp(422, "missing parameters");
	$hash = sanitize($_POST['hash']);
	$res = mysqli_query($db, "SELECT name, parent FROM files WHERE hash='$hash' AND is_trashed=0 AND owner_id='$uid' LIMIT 1");
	$res = mysqli_fetch_object($res);
	$name = $res->name;
	$parent = $res->parent;
	$sql = "SELECT is_folder, hash, parent, name, size, is_shared, is_public, lastmod FROM FILES WHERE owner_id = '$uid' AND name='$name' AND parent='$parent' AND is_trashed=0 ORDER BY lastmod DESC";
	if ($result = mysqli_query($db, $sql)) {
		$rows = array();
		while ($row = mysqli_fetch_object($result)) {
			$rows[] = $row;
		}
		echo json_encode($rows);
	} else {
		resp(500, 'Failed to retrieve versions of '.$hash);
	}
}
if ($pageID == 'touch') {
	if (!isset($_POST['hash']))
		resp(422, "missing parameters");
	$hash = sanitize($_POST['hash']);
	if(mysqli_query($db, "UPDATE files SET lastmod=NOW() WHERE hash='$hash' AND owner_id='$uid' LIMIT 1")) {
		resp(200, 'Gave '.$hash.' a poke');
	} else {	
		resp(500, 'Failed to give '.$hash.' a poke');
	}
}
if ($pageID == 'rename') {
	if (!isset($_POST['name']) || !isset($_POST['hash']))
		resp(422, "missing parameters");
	$hash = sanitize($_POST['hash']);
	$newName = sanitize($_POST['name']);
	if ($hash == $uhd) {
		resp(400, 'Cannot rename the home directory!');
	} else {
		if(mysqli_query($db, "UPDATE files SET name = '$newName', lastmod = NOW() WHERE owner_id = '$uid' AND hash = '$hash' LIMIT 1")) {
			resp(200, 'Renamed file or folder');
		} else {
			resp(500, "Failed to rename file or folder");
		}
	}
}
if($pageID == 'trash') {
	if (!isset($_POST['hashlist']))
		resp(422, "missing parameters");
	$hashlist = sanitize($_POST['hashlist']);
	if (strpos($hashlist, $uhd) !== false) {
		resp(400, 'Cannot delete the home directory!');
	} else {
		$fails = 0;
		foreach (explode(',', $hashlist) as $hash) {
			if ($res = mysqli_query($db, "SELECT name, parent FROM files WHERE hash='$hash' AND owner_id='$uid' LIMIT 1")) {
				$res = mysqli_fetch_object($res);
				$name = $res->name;
				$parent = $res->parent;
				if (mysqli_query($db, "UPDATE files SET is_trashed=1, is_shared=0, is_public=0 WHERE name='$name' AND parent='$parent' AND owner_id = '$uid'")) {
					//ok
				} else
					$fails++;
			} else {
				$fails++;
			}
		}
		if ($fails == 0)
			resp(200, 'moved files to trash');
		else
			resp(500, 'failed to delete '.$fails.' files');
	}
}
if($pageID == 'restore') {
	if (!isset($_POST['hashlist']))
		resp(422, "missing parameters");
	$hashlist = sanitize($_POST['hashlist']);
	if (strpos($hashlist, $uhd) !== false) {
		resp(400, 'Cannot undelete the home directory! You cant delete it either, so why are you trying this?');
	} else {
		$fails = 0;
		foreach (explode(',', $hashlist) as $hash) {
			if ($name = mysqli_query($db, "SELECT name, parent FROM files WHERE hash='$hash' LIMIT 1")) {
				$res = mysqli_fetch_object($name);
				$name = $res->name;
				$parent = $res->parent;
				if (mysqli_query($db, "UPDATE files SET is_trashed=0 WHERE name='$name' AND parent='$parent' AND owner_id = '$uid'")) {
					//ok
				} else
					$fails++;
			} else {
				$fails++;
			}
		}
		if ($fails == 0)
			resp(200, 'removed files from trash');
		else
			resp(500, 'failed to remove '.$fails.' files from trash');
	}
}
if($pageID == 'delete') {
	if (!isset($_POST['hashlist']))
		resp(422, "missing parameters");
		$hashlist = sanitize($_POST['hashlist']);
		//echo 'hash '.$hash_self_array . '<br>';
		if (strpos($hashlist, $uhd) !== false) { 
			resp(400, 'Cannot delete the home directory!');
		} else {
			$success = true;
			$fails = 0;
			foreach (explode(',', $hashlist) as $mainhash) {
				//echo 'foreach '.$hash.'<br>';
				/*$delItems = '';
				$delTree = [$hash];
				$pointer = 0;*/
				$isOwner = true;
				$type = '';
				$query = mysqli_query($db, "SELECT is_folder, parent, name FROM files WHERE hash='$mainhash' AND owner_id='$uid' AND is_trashed='1' LIMIT 1");
				$res = mysqli_fetch_object($query);
				$type = $res->is_folder == 1 ? 'folder' : 'file';

				// repeat this for all older versions of the files with the same name and parent as this one
				$name = $res->name;
				$parent = $res->parent;
				$others = mysqli_query($db, "SELECT hash FROM files WHERE parent='$parent' AND name='$name' AND owner_id='$uid' AND is_trashed='1'");
				$otherHashes = array();
				while($res = mysqli_fetch_object($others)) {
					$otherHashes[] = $res->hash;
				}
				foreach($otherHashes as $hash) {
					$delItems = '';
					$delTree = [$hash];
					$pointer = 0;
					if (!function_exists('recursiveDelete')) { //only declare the function once
						function recursiveDelete($self) {
							global $db, $delTree, $pointer, $isOwner, $uid;
							$curPos = array();
							$query = mysqli_query($db, "SELECT hash, owner_id FROM files WHERE parent='$self' AND owner_id='$uid'");
							while($row = mysqli_fetch_array($query)) {
								$delTree[] = $row['hash'];
								$curPos[] = $row['hash'];
								if ($row['owner_id'] !== $uid) {
									$isOwner = false;
								}
							}
							foreach ($curPos as $key => $value) {
								recursiveDelete($value);
								$pointer++;
							}
						}
					}
					if ($type == 'folder') {
						recursiveDelete($hash);
					}
					$pointer = 0;
					foreach ($delTree as $key => $value) {
						if ($pointer != sizeof($delTree) - 1) {
							$delItems .= '\'' . $value . '\', ';
						} else {
							$delItems .= '\'' . $value . '\'';
						}
						$pointer++;
					}
					if ($isOwner) {
						if ($type == 'folder') {
							deleteFolder($hash);
						} else {
							deleteFile($hash);
						}
						if(mysqli_query($db, "DELETE FROM files WHERE hash IN ($delItems) AND owner_id='$uid'")) {
							
						} else {
							$success = false;
							$fails++;
						}

					} else {
						resp(401, "You do not own this file.");
					}
				}
			}
			if ($success) resp(200, 'deleted files and folders');
			else resp(500, "Failed to delete " . $fails . ' items.');

		}
}
if($pageID == 'delete_single') {
	if (!isset($_POST['hash']))
		resp(422, "missing parameters");
	$hash = sanitize($_POST['hash']);
	if ($hash == $uhd) {
		resp(400, 'Cannot delete the home directory!');
	} else {
		if (mysqli_query($db, "UPDATE files SET is_trashed=1, is_shared=0, is_public=0 WHERE hash='$hash' AND owner_id = '$uid'")) {
			resp(200, 'moved files to trash');
		} else {
			resp(500, 'failed to delete '.$fails.' files');
		}
	}
}
if($pageID == 'view') {
	if (!isset($_GET['id']))
		resp(422, "missing parameters");
	$fileName = sanitize($_GET['id']);
	$filePath = getPath($fileName);

	if (!extension_loaded('fileinfo')) {
		if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
	        dl('php_fileinfo.dll');
	    } else {
	        dl('fileinfo.so');
	    }
	}

	if (is_readable($filePath)) {
		if(getOwner($fileName) == $uid || isShared($fileName)) {
			$finfo = finfo_open(FILEINFO_MIME_TYPE);
			$fileType = finfo_file($finfo, $filePath);
			finfo_close($finfo);


			// filter out files that the client wont be able to preview, like .exe and similar


			header('Content-Type: ' . $fileType);
			readfile($filePath);
			exit();
		} else {
			resp(404, "Could not find the requested file");
		}
	} else {
		res(404, "Invalid file path provided");
	}
}
if ($pageID == 'move') {
	$file_multi = sanitize($_POST['file_multi']);
	$target = sanitize($_POST['file_target']);
	$file_multi_array = explode(',', $file_multi);
	$file_target_path = getPath($target);

	$isOwner = true;
	$query = mysqli_query($db, "SELECT * FROM files WHERE hash IN ('$file_multi')");
	while($row = mysqli_fetch_array($query)) {
		if ($row['owner_id'] !== $uid) {
			$isOwner = false;
		}
	}
	$fails = 0;
	foreach ($file_multi_array as $hash_self) {
		if ($hash_self == $uhd) {
			resp(500, 'Cannot move the home directory!');
		//} else if (strpos(getPath($hash_self), $target) !== false) {
			//echo 'Cannot move a folder into itself!';
		} else {
			if (sizeof(explode('/', $file_target_path)) > sizeof(explode('/', getPath($hash_self)))) { //doesnt actually work, but the rename() will prevent this anyway
				if (strpos(getPath($hash_self), $target) !== false) {
					resp(500, 'Cannot move a folder into itself!');
					die();
				}
			}
			$query = mysqli_query($db, "SELECT is_folder, parent, name FROM files WHERE hash='$hash_self' AND owner_id='$uid' AND is_trashed='0' LIMIT 1");
			$res = mysqli_fetch_object($query);
			$type = $res->is_folder == 1 ? 'folder' : 'file';

			// repeat this for all older versions of the files with the same name and parent as this one
			$name = $res->name;
			$parent = $res->parent;
			$others = mysqli_query($db, "SELECT hash FROM files WHERE parent='$parent' AND name='$name' AND owner_id='$uid'");
			$otherHashes = array();
			while($res = mysqli_fetch_object($others)) {
				$otherHashes[] = $res->hash;
			}
			foreach($otherHashes as $hash) {
				if ($isOwner) {
					if (rename(getPath($hash), $file_target_path . '/' . $hash)) {
						if(mysqli_query($db, "UPDATE files SET parent = '$target', lastmod = NOW() WHERE hash='$hash' LIMIT 1")) {
							
						} else {
							resp(500, "DB move failed!");
						}
					} else {
						resp(500, 'Move failed!');
					}
				} else {
					resp(403, "You do not own this file.");
				}
			}
		}
	}
	if ($fails == 0) {
		resp(200, 'moved files');
	}
}
if ($pageID == 'search') {
	if (!isset($_POST['name']))
		resp(422, "missing parameters");
	$name = sanitize($_POST['name']);
	$sortBy = 'f.is_folder DESC, f.name';
	if ($name == 'in:trash') { // is clicking on the 'trash' tab really that hard?
		$q = "SELECT f.* FROM FILES f JOIN (SELECT name, max(lastmod) as latest FROM files WHERE owner_id = '$uid' AND is_trashed=1 GROUP BY name) f2 ON f.lastmod = f2.latest and f.name = f2.name ORDER BY $sortBy";
	} else {
		$q = "SELECT f.* FROM FILES f JOIN (SELECT name, max(lastmod) as latest FROM files WHERE owner_id = '$uid' AND name COLLATE UTF8_GENERAL_CI LIKE '%$name%' GROUP BY name) f2 ON f.lastmod = f2.latest and f.name = f2.name ORDER BY $sortBy";
	}
	if ($result = mysqli_query($db, $q)) {
		$res = array();
		while ($r = mysqli_fetch_object($result)) {
			$res[] = $r;
		}
		echo json_encode($res);
	} else {
		resp(500, "failed to load search results");
	}
}
if ($pageID == 'share') {
	$action = null;
	if (isset($_POST['remove'])) {
		$action = 'remove';
		$hash = sanitize($_POST['remove']);
	}
	if (isset($_POST['hash'])) {
		$action = 'add';
		$hash = sanitize($_POST['hash']);
	}
	if (!$action)
		resp(422, "missing parameters");

	if ($action === 'add') {
		$q = "SELECT hash FROM shared WHERE points_to='$hash' AND owner_id='$uid'";
		if ($result = mysqli_query($db, $q)) {
			if (mysqli_num_rows($result) > 0) {
				$r = mysqli_fetch_object($result)->hash;
				resp(200, $r);
			} else {
				$newid = getUniqLink();
				$q = "INSERT INTO shared (owner_id,hash,points_to,is_public,shared_with) VALUES ('$uid','$newid','$hash','0','')";
				$q2 = "UPDATE files SET is_shared=1 WHERE hash='$hash' AND owner_id='$uid'";
				if (mysqli_query($db, $q)) {
					if (mysqli_query($db, $q2)) {
						resp(200, $newid);
					} else {
						resp(500, "Failed to share file or folder");
					}
				} else {
					resp(500, "Failed to share file or folder");
				}
				
			}
		}
	} else if ($action === 'remove') {
		$q = "DELETE FROM shared WHERE points_to='$hash' AND owner_id='$uid'";
		$q2 = "UPDATE files SET is_shared=0 WHERE hash='$hash' AND owner_id='$uid'";
		if (mysqli_query($db, $q)) {
			if (mysqli_query($db, $q2)) {
				resp(200, "Unshared file or folder");
			} else {
				resp(500, "Failed to unshare file or folder");
			}
		} else {
			resp(500, "Failed to unshare file or folder");
		}
	}
}
if($pageID == 'download') {
	if (isset($_GET['hashlist'])) { //multiple
		$fileName = sanitize($_GET['hashlist']);
		$n = sanitize($_GET['name']);
		$type = sanitize($_GET['type']); //folder or group of files
		if (!file_exists('./../temp')) mkdir('./../temp');
		if (!file_exists('./../temp/' . $uhd)) mkdir('./../temp/' . $uhd);
		$n2 = str_replace('.','',$n);
		$destination = './../temp/' . $uhd . '/' . $n2 . 'zip';
		$zipname = './../temp/' . $uhd . '/' . $n . '.zip';
		if ($type == 'file') { //if file name contains , is multiple files
			$files = explode(',', $fileName);
		} else {
			$files = $fileName;
		}
		if ($type === 'folder') {
			$isShared = isShared($files);
			if (getOwner($files) == $uid || $isShared) {
				if (!Zip($files, $destination, $zipname)) resp(500, "Failed to zip files.");
			} else {
				//echo "You do not have access to these files.";
			}
		} else if ($type === 'file') {
			//$files will be a CSV split into an array
			$fil = $files[0];
			$isShared = isShared($files[0]);
			if (getOwner($files[0]) == $uid || $isShared) {
				if (!Zip($files, $destination, $zipname)) resp(500, "Failed to zip files.");
			} else {
				//echo "You do not have access to these files.";
			}
		} else {
			resp(500, 'unknown type: '.$type);
		}
		if(file_exists($zipname)) {
			//echo $destination;
		    header('Pragma: public');
		    header('Expires: 0');
		    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		    header('Content-Type: application/octet-stream');
		    header("Content-Description: File Transfer");
		    header('Content-Disposition: attachment; filename="'.$n.'.zip"');
		    header('Content-Length: ' . filesize($zipname));
		    header("Content-Transfer-Encoding: binary");
		    ob_clean();
			flush();
		    readfile($zipname);
		    //sleep(1);
		    //file should stay until it finishes downloading, then poof by itself
		    //echo '<br>deleting ' . $destination . '<br>';
		    @unlink($zipname);
				//echo "Cleared user temp folder";
		    exit();
		} else {
			resp(404,'Could not find file: ' . $zipname);
		}
	} else if (isset($_GET['id'])) {
		$fileName = sanitize($_GET['id']);
		$n = sanitize($_GET['name']);

		$isShared = false;
		//$isShared = isShared($fileName);

		if (getOwner($fileName) == $uid || $isShared) {

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
			    ob_end_flush();
			    readfile($filePath);

		        exit();
		    }
		    else {
		        resp(404,'The provided file path is not valid.');
		    }
		} else {
			resp(403, "you do not have access to this file");
		}
	} else {
		resp(422, 'missing parameters');
	}
}

mysqli_close($db);