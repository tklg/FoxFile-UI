<?php
session_start();

$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/') !== false) {
    $uri = explode('/', $uri);
    $id = $uri[sizeof($uri) - 1];
} else {
    $id = substr($uri, 1);
}

//validate key
if (!isset($_POST['key'])) {
	http_response_code(401);
	$res = array(
		'status' => '401',
		'message' => 'must provide an api key'
	);
	echo json_encode($res);
	die();
}
$key = $_POST['key'];

if ($key != '0') {

	// query db for this
	// if key owner != foxits, 
	$use_key_for_auth = true;
	// and use the db to set $uname and $uid
	// else
	$use_key_for_auth = false;
	//and set $uname and $uid to whatever the session has them set to

	// and change all auth stuff to use this instead of $_POST['sender']

	http_response_code(403);
	$res = array(
		'status' => '403',
		'message' => 'the provided key is invalid'
	);
	echo json_encode($res);
	die();
}

if ($id != 'newticket' && $id != 'tickets' && $id != 'ticket' && $id != 'newcomment' && $id != 'comments' && $id != 'ticketcount' && $id != 'logs' && $id != 'recents' && $id != 'modify_ticket' && $id != 'modify_comment' && $id != 'keys') {
	header('HTTP/1.1 400 Bad Request', true, 400);
	$res = array(
		'status' => '400',
		'message' => 'invalid action'
	);
	echo json_encode($res);
	die();
}

$db_config_path = '../includes/user.php';
require $db_config_path;

$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);

function sanitize($s) {
	global $db;
 	return htmlentities(preg_replace('/\<br(\s*)?\/?\>/i', "\n", mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if ($id == 'newticket') {
	if (!isset($_POST['sender']) || !isset($_POST['title']) || !isset($_POST['desc']) || !isset($_POST['tags'])) {
		http_response_code(400);
		$res = array(
			'status' => '400',
			'message' => 'POST request must include \'sender\', \'title\', \'desc\', \'tags\''
		);
		echo json_encode($res);
		die();
	}

	require '../includes/hashids/Hashids.php';
	$hashids = new Hashids\Hashids('foxits salt is best salt', 12);

	if ($_POST['sender'] == 'fromsession') {
		$uname = $_SESSION['foxits_user_name'];
		$uid = $_SESSION['foxits_user_id'];
	} else {
		if (!isset($_POST['senderID'])) {
			http_response_code(400);
			$res = array(
				'status' => '400',
				'message' => 'POST request must include \'senderID\''
			);
			echo json_encode($res);
			die();
		}
		$uname = sanitize($_POST['sender']);
		$uid = sanitize($_POST['senderID']);
	}
	$title = sanitize($_POST['title']);
	$desc = sanitize($_POST['desc']);
	$tags = $_POST['tags'];
	foreach ($tags as $value) {
		$value = sanitize($value);
	}
	$temphash = date('H:i:s');
	//add new ticket
	$sql = "INSERT INTO TICKETS (owner, owner_id, hash, title, content, priority, status)
        VALUES (
        '$uname',
        '$uid',
        '$temphash',
        '$title',
        '$desc',
        'normal',
        'new')";
	if (mysqli_query($db, $sql)) {
		
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => mysql_error()
		);
		echo json_encode($res);
		die();
	}

	$sql = "SELECT PID FROM TICKETS WHERE hash='$temphash' LIMIT 1";
	if ($result = mysqli_query($db, $sql)) {
		$nextID = mysqli_fetch_object($result)->PID;
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => mysql_error()
		);
		echo json_encode($res);
		die();
	}

	$hash = $hashids->encode($nextID);

	$sql = "UPDATE TICKETS SET hash='$hash' WHERE hash='$temphash'";
	if (mysqli_query($db, $sql)) {
		
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => mysql_error()
		);
		echo json_encode($res);
		die();
	}

	//check tags table for existing tags
	$tag_list = array();
	foreach ($tags as $value) {
		$tag_list[] = '("'.$value.'")';
	}
	$sql = "INSERT IGNORE INTO TAGS (name) VALUES ".implode(',', $tag_list);
	if (mysqli_query($db, $sql)) {
		
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to add tags to table'
		);
		echo json_encode($res);
		die();
	}

	//add to tagmap table to map tags to new ticket
	foreach ($tags as $value) {
		$tag_list[] = '"'.$value.'"';
	}
	$tag_list = implode(',', $tag_list);
	$tagsWithID = array();
	$sql = "SELECT PID FROM TAGS WHERE name IN ($tag_list)";
	if ($result = mysqli_query($db, $sql)) {
		$tag_list = array();
		while ($row = mysqli_fetch_object($result)) {
			$tag_list[] = '("'.$nextID.'","'.$row->PID.'")';
		}
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => mysql_error()
		);
		echo json_encode($res);
		die();
	}

	$sql = "INSERT IGNORE INTO TAGMAP (ticket_id, tag_id) VALUES ".implode(',', $tag_list);
	if (mysqli_query($db, $sql)) {
		
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to add tags to tagmap'
		);
		echo json_encode($res);
		die();
	}
	http_response_code(200);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
} else if ($id == 'tickets') {

	if (!isset($_POST['sender'])) {
		http_response_code(400);
		$res = array(
			'status' => '400',
			'message' => 'POST request must include \'sender\''
		);
		echo json_encode($res);
		die();
	}

	$num_per_load = 10;

	if ($_POST['sender'] == 'fromsession')
		$uid = $_SESSION['foxits_user_id'];
	else
		$uid = sanitize($_POST['sender']);

	$sql = "SELECT access_level FROM USERS WHERE google_id='$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$alvl = mysqli_fetch_object($result)->access_level;
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve user rank'
		);
		echo json_encode($res);
		die();
	}

	if (isset($_POST['status']) && $_POST['status'] != '')
		$status = $_POST['status'];
	else
		$status = 'all';
	if (isset($_POST['priority']) && $_POST['priority'] != '')
		$priority = $_POST['priority'];
	else
		$priority = 'all';
	if (isset($_POST['offset']) && $_POST['offset'] != '')
		$offset = $_POST['offset'];
	else
		$offset = 0;

	$me = false;
	if ($status == 'me') {
		$me = true;
		$status = 'all';
	}

	// possibly also get the tags from the tagmap from within these queries
	if ($alvl > 1) {
		if ($me) {
			// query usermap for tickets assigned to user first
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset"; //add conditions for sorting priority
		} else if ($status == 'all' && $priority == 'all') {
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset";
		} else if ($status == 'all' && $priority != 'all') {
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND priority='$priority' GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset";
		} else if ($status != 'all' && $priority == 'all') {
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND status='$status' GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset";
		} else {
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND status='$status' AND priority='$priority' GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset";
		}
	} else {
		if ($me) {
			// query usermap for tickets assigned to user first
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND owner_id='$uid' GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset"; //add conditions for sorting priority
		} else if ($status == 'all' && $priority == 'all') {
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND owner_id='$uid' GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset";
		} else if ($status == 'all' && $priority != 'all') {
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND owner_id='$uid' AND priority='$priority' GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset";
		} else if ($status != 'all' && $priority == 'all') {
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND owner_id='$uid' AND status='$status' GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset";
		} else {
			$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND owner_id='$uid' AND status='$status' AND priority='$priority' GROUP BY tk.PID LIMIT $num_per_load OFFSET $offset";
		}
	}
	if ($result = mysqli_query($db, $sql)) {
		http_response_code(200);
		$rows = array();
		while ($row = mysqli_fetch_object($result)) {
			$rows[] = $row;
		}
		echo json_encode($rows);
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to fetch ticket list'
		);
		echo json_encode($res);
		die();
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
} else if ($id == 'ticket') {
	if (!isset($_POST['id']) || !isset($_POST['sender'])) {
		http_response_code(400);
		$res = array(
			'status' => '400',
			'message' => 'POST request must include \'id\', \'sender\''
		);
		echo json_encode($res);
		die();
	}
	$id = sanitize($_POST['id']);
	if ($_POST['sender'] == 'fromsession')
		$uid = $_SESSION['foxits_user_id'];
	else
		$uid = sanitize($_POST['sender']);

	$sql = "SELECT access_level FROM USERS WHERE google_id='$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$alvl = mysqli_fetch_object($result)->access_level;
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve user rank'
		);
		echo json_encode($res);
		die();
	}

	if ($alvl > 1) {
		$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.hash = '$id' AND tk.PID = tm.ticket_id AND tg.PID = tm.tag_id GROUP BY tk.PID LIMIT 1";
	} else {
		$sql = "SELECT tk.*, GROUP_CONCAT(tg.name) AS tags FROM TICKETS tk, TAGMAP tm, TAGS tg WHERE tk.hash = '$id' AND tk.PID = tm.ticket_id AND tg.PID = tm.tag_id AND owner_id='$uid' GROUP BY tk.PID LIMIT 1";
	}
	if ($result = mysqli_query($db, $sql)) {
		if (mysqli_num_rows($result) == 0) {
			http_response_code(403);
			mysqli_close($db);
			die();
		}
		http_response_code(200);
		echo json_encode(mysqli_fetch_object($result));
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to fetch ticket'
		);
		echo json_encode($res);
		die();
	}
	$sql = "UPDATE TICKETS SET date_last_checked=NOW() WHERE hash='$id'";
	if (mysqli_query($db, $sql)) {
		
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => mysql_error()
		);
		echo json_encode($res);
		die();
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
} else if ($id == 'newcomment') {
	if (!isset($_POST['sender']) || !isset($_POST['desc']) || !isset($_POST['ticket_id'])) {
		http_response_code(400);
		$res = array(
			'status' => '400',
			'message' => 'POST request must include \'sender\', \'desc\', \'ticket_id\''
		);
		echo json_encode($res);
		die();
	}

	if ($_POST['sender'] == 'fromsession') {
		$uname = $_SESSION['foxits_user_name'];
		$uid = $_SESSION['foxits_user_id'];
	} else {
		if (!isset($_POST['senderID'])) {
			http_response_code(400);
			$res = array(
				'status' => '400',
				'message' => 'POST request must include \'senderID\''
			);
			echo json_encode($res);
			die();
		}
		$uname = sanitize($_POST['sender']);
		$uid = sanitize($_POST['senderID']);
	}
	$desc = sanitize($_POST['desc']);
	$ticket_id = sanitize($_POST['ticket_id']);

	$sql = "INSERT INTO COMMENTS (ticket_hash, owner, owner_id, content)
        VALUES (
        '$ticket_id',
        '$uname',
        '$uid',
        '$desc')";
	if (mysqli_query($db, $sql)) {
		
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => mysql_error()
		);
		echo json_encode($res);
		die();
	}
	http_response_code(200);
	$res = array(
		'owner'=>$uname,
		'owner_id'=>$uid,
		'content'=>$desc,
		'date_submitted'=>date('Y-m-d G:i:s')
	);
	echo json_encode($res);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
} else if ($id == 'comments') {
	if (!isset($_POST['sender']) || !isset($_POST['ticket_id'])) {
		http_response_code(400);
		$res = array(
			'status' => '400',
			'message' => 'POST request must include \'sender\', \'ticket_id\''
		);
		echo json_encode($res);
		die();
	}
	if ($_POST['sender'] == 'fromsession')
		$uid = $_SESSION['foxits_user_id'];
	else
		$uid = sanitize($_POST['sender']);

	$sql = "SELECT access_level FROM USERS WHERE google_id='$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$alvl = mysqli_fetch_object($result)->access_level;
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve user rank'
		);
		echo json_encode($res);
		die();
	}

	$id = sanitize($_POST['ticket_id']);

	$sql = "SELECT * FROM COMMENTS WHERE ticket_hash = '$id' ORDER BY date_submitted";
	if ($result = mysqli_query($db, $sql)) {
		$rows = array();
		while ($row = mysqli_fetch_object($result)) {
			$rows[] = $row;
		}
		echo json_encode($rows);
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve comments'
		);
		echo json_encode($res);
		die();
	}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
} else if ($id == 'ticketcount') {

} else if ($id == 'logs') {

} else if ($id == 'recents') {

} else if ($id == 'modify_ticket') {

} else if ($id == 'modify_comment') {

} else if ($id == 'keys') {
	if (!isset($_POST['sender'])) {
		http_response_code(400);
		$res = array(
			'status' => '400',
			'message' => 'POST request must include \'sender\''
		);
		echo json_encode($res);
		die();
	}
	if ($_POST['sender'] == 'fromsession')
		$uid = $_SESSION['foxits_user_id'];
	else
		$uid = sanitize($_POST['sender']);

	$sql = "SELECT access_level FROM USERS WHERE google_id='$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$alvl = mysqli_fetch_object($result)->access_level;
		if ($alvl < 5) {
			http_response_code(403);
			die();
		}
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve user rank'
		);
		echo json_encode($res);
		die();
	}

	$sql = "SELECT * FROM APIKEYS";
	if ($result = mysqli_query($db, $sql)) {
		$rows = array();
		while ($row = mysqli_fetch_object($result)) {
			$rows[] = $row;
		}
		echo json_encode($rows);
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve keys'
		);
		echo json_encode($res);
		die();
	}
} else if ($id == 'create_key') {
	if (!isset($_POST['sender'])) {
		http_response_code(400);
		$res = array(
			'status' => '400',
			'message' => 'POST request must include \'sender\''
		);
		echo json_encode($res);
		die();
	}
	if ($_POST['sender'] == 'fromsession')
		$uid = $_SESSION['foxits_user_id'];
		$username = $_SESSION['foxits_user_name'];
	else
		$uid = sanitize($_POST['sender']);
		$username = sanitize($_POST['sender']);

	$sql = "SELECT access_level FROM USERS WHERE google_id='$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$alvl = mysqli_fetch_object($result)->access_level;
		if ($alvl < 5) {
			http_response_code(403);
			die();
		}
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve user rank'
		);
		echo json_encode($res);
		die();
	}
	$key = 'foxits_'.md5(uniqid(rand(), true));
	$origin = sanitize($_POST['http_origin']);
	$values = $_POST['values'];
	foreach ($values as $v) {
		$v = sanitize($v);
	}
	$sql = "INSERT INTO APIKEYS (api_key,owner,created_by,http_origin,create_ticket,list_tickets,create_comments,list_comments,modify_tickets,modify_comments,list_logs,create_key)
		VALUES (
        	'$key',
        	'$username',
        	'$gid',
        	'$origin',
        	'$values[0]','$values[1]','$values[2]','$values[3]','$values[4]','$values[5]','$values[6]','$values[7]'
        )";
	if ($result = mysqli_query($db, $sql)) {
		$rows = array(
			'api_key' => $key,
			'owner' => $username,
			'created_by' => $gid,
			'http_origin' => $origin,
			'create_ticket' => $values[0],
			'list_tickets' => $values[1],
			'create_comments' => $values[2],
			'list_comments' => $values[3],
			'modify_tickets' => $values[4],
			'modify_comments' => $values[5],
			'list_logs' => $values[6],
			'create_key' => $values[7]
			);
		echo json_encode($rows);
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to add new key'
		);
		echo json_encode($res);
		die();
	}
} else if ($id == 'modify_key') {
	if (!isset($_POST['sender'])) {
		http_response_code(400);
		$res = array(
			'status' => '400',
			'message' => 'POST request must include \'sender\''
		);
		echo json_encode($res);
		die();
	}
	if ($_POST['sender'] == 'fromsession')
		$uid = $_SESSION['foxits_user_id'];
		$username = $_SESSION['foxits_user_name'];
	else
		$uid = sanitize($_POST['sender']);
		$username = sanitize($_POST['sender']);

	$sql = "SELECT access_level FROM USERS WHERE google_id='$uid'";
	if ($result = mysqli_query($db, $sql)) {
		$alvl = mysqli_fetch_object($result)->access_level;
		if ($alvl < 5) {
			http_response_code(403);
			die();
		}
	} else {
		http_response_code(500);
		$res = array(
			'status' => '500',
			'message' => 'Failed to retrieve user rank'
		);
		echo json_encode($res);
		die();
	}
	if (isset($_POST['regen'])) {

	} else {

	}
}

mysqli_close($db);