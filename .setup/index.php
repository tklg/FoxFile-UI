<?php
$db_config_path = '../includes/user.php';

session_start();
require $db_config_path;
function sanitize($s) {
	global $dbhost, $dbuname, $dbupass, $dbname;
 	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
 	return htmlentities(preg_replace('/\<br(\s*)?\/?\>/i', "\n", mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
if (isset($installed) && $installed) {
	header("Location: ../login");
	die();
} else if(isset($_POST['connect_database'])) {
	$dbhost = $_POST['dbhost'];
	$dbuname = $_POST['dbuser'];
	$dbupass = $_POST['dbpass'];
	$dbname = $_POST['dbname'];
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	if (!mysqli_connect_errno()) {
		$string = '<?php 
$dbuname = "' . $dbuname . '";
$dbupass = "' . $dbupass . '";
$dbhost = "' . $dbhost . '";
$dbname = "' . $dbname . '";
';
	    $fp = fopen($db_config_path, "w");
        fwrite($fp, $string);
        fclose($fp);
        mysqli_close($db);
		echo 0;
	} else {
		echo mysqli_connect_error();
	}
} else if (isset($_POST['create_table_user'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	if (mysqli_connect_errno()) {
		echo mysqli_connect_error($db);
		exit();
	}
    $sql = "CREATE TABLE users (
	    PID INT NOT NULL AUTO_INCREMENT, 
	    PRIMARY KEY(PID),
	    firstname VARCHAR(128),
	    lastname VARCHAR(128),
	    email VARCHAR(128),
	    password VARCHAR(512),
	    root_folder VARCHAR(12) character set utf8 collate utf8_bin not null,
		total_storage DOUBLE(100, 2),
		account_status VARCHAR(32),
	    access_level TINYINT,
	    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) charset=utf8 ENGINE=INNODB";
		$sql1 = "CREATE TABLE idgen (
			  PID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			  PRIMARY KEY(PID),
			  hashes char(1) NOT NULL DEFAULT '',
			  UNIQUE(hashes)
			) ENGINE=INNODB";
		$sql2 = "CREATE TABLE linkgen (
			  PID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			  PRIMARY KEY(PID),
			  hashes char(1) NOT NULL DEFAULT '',
			  UNIQUE(hashes)
			) ENGINE=INNODB";
	if (mysqli_query($db, $sql) && mysqli_query($db, $sql1) && mysqli_query($db, $sql2)) {
		mysqli_close($db);
		echo 0;
		die();
		/*$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
		if (mysqli_query($db, $sql1)) {
			mysqli_close($db);
			$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
			if (mysqli_query($db, $sql2)) {
				mysqli_close($db);
				echo 0;
				die();
			} else {
				mysqli_close($db);
				echo 502;
				echo mysqli_error($db);
			}
		} else {
			mysqli_close($db);
			echo 501;
			echo mysqli_error($db);
		}*/
	} else {
		echo mysqli_error($db);
		echo 500;
		mysqli_close($db);
	}
} else if (isset($_POST['create_user'])) {
	require '../plugins/hashids/Hashids.php';
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$email = $_POST['useremail'];
	$password = password_hash($_POST['userpass'], PASSWORD_BCRYPT);
	$sql = "REPLACE INTO idgen (hashes) VALUES ('a')";
	if ($result = mysqli_query($db, $sql)) {
		$newIdObj = mysqli_insert_id($db);
		$hashids = new Hashids\Hashids('foxfilesaltisstillbestsalt', 12);
		$root_folder = $hashids->encode($newIdObj);
		$total_storage = 2147483648;
		$sql = "INSERT INTO users (firstname, email, password, root_folder, total_storage, account_status, access_level)
	        VALUES (
	        'Administrator',
	        '$email',
	        '$password',
	        '$root_folder',
	        '$total_storage',
	        'unverified',
	        '5')";
		if (mysqli_query($db, $sql)) {
			mkdir('../files/'.$root_folder.'/');
			mysqli_close($db);
			//mkdir('../trashes/'.$root_folder.'/');
			echo 0;
			die();
		} else {
			echo mysqli_error();
			echo 504;
			mysqli_close($db);
		}
	} else {
		echo 503;
		echo mysqli_error();
		mysqli_close($db);
	}
} else if (isset($_POST['create_table_files'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$sql = 'CREATE TABLE files (
        PID INT NOT NULL AUTO_INCREMENT, 
        PRIMARY KEY(PID),
		owner_id INT,
		is_folder BOOLEAN,
		hash CHAR(12) character set utf8 collate utf8_bin not null,
		parent CHAR(12) character set utf8 collate utf8_bin not null,
		name VARCHAR(128),
		size DOUBLE(30, 2),
        is_trashed BOOLEAN DEFAULT 0,
        is_shared BOOLEAN DEFAULT 0,
        is_public BOOLEAN DEFAULT 0,
        lastmod TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(PID,hash)
        ) charset=utf8 ENGINE=INNODB';
    $q2 = "CREATE TABLE shared (
    	PID INT NOT NULL AUTO_INCREMENT,
    	PRIMARY KEY(PID),
    	owner_id INT,
    	hash CHAR(12) character set utf8 collate utf8_bin not null,
    	points_to CHAR(12) character set utf8 collate utf8_bin not null,
    	is_public BOOLEAN DEFAULT 0,
    	shared_with VARCHAR(128),
    	UNIQUE(PID,hash)
    	) charset=utf8 ENGINE=INNODB";
	if (mysqli_query($db, $sql) && mysqli_query($db, $q2)) {
		/*$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
		if (mysqli_query($db, $q2)) {*/
		$string = '<?php 
$dbuname = "' . $dbuname . '";
$dbupass = "' . $dbupass . '";
$dbhost = "' . $dbhost . '";
$dbname = "' . $dbname . '";
$installed = true;
';
	    $fp = fopen($db_config_path, "w");
        fwrite($fp, $string);
        fclose($fp);
        mysqli_close($db);
		echo 0;
		die();	
		/*} else {
			mysqli_close($db);
			echo 506;
			echo mysqli_error();
		}*/
	} else {
		echo 505;
		echo mysqli_error();
		mysqli_close($db);
	}
//} else if (isset($_POST['create_table_files'])) { 
} else {
	?>
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
<link rel="stylesheet" href="../css/login.css" />
<link rel="icon" type="image/ico" href="../img/foxfile.ico">
    <title>FoxFile - Setup</title>
</head>
<body>
<main class="setup float-2">
	<header class="header float" id="header-main">
		<span>Set up FoxFile</span>
	</header>
	<section class="content">
    <form id="install" name="install" action="#" method="post">
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="email" class="userinfo" id="email" type="text" autofocus>
				<span class="placeholder-userinfo nosel">Your email</span>
				<hr class="input-underline" />
				<div class="error error-email"><div class="error-message">Invalid email address</div></div>
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="userpass" class="userinfo" id="userpass" type="password">
				<span class="placeholder-userinfo nosel">Your password</span>
				<hr class="input-underline" />
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="dbuser" class="userinfo" id="dbuser" type="text">
				<span class="placeholder-userinfo nosel">Database username</span>
				<hr class="input-underline" />
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="dbpass" class="userinfo" id="dbpass" type="password">
				<span class="placeholder-userinfo nosel">Database password</span>
				<hr class="input-underline" />
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="dbname" class="userinfo" id="dbname" type="text">
				<span class="placeholder-userinfo nosel">Database name</span>
				<hr class="input-underline" />
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="dbhost" class="userinfo" id="dbhost" type="text">
				<span class="placeholder-userinfo nosel">Database host</span>
				<hr class="input-underline" />
			</label>
		</div>
		<a class="new-account"></a>
		<button class="btn btn-submit" type="submit">Start<link class="rippleJS" /></button>
    </form>
	</section>
</main>
	<style type="text/css">
	.result {
		position: absolute;
		width: 200px;
		height: 300px;
		left: 70%;
		opacity: 0;
		/*display: none;*/
		top:0;bottom:0;margin:auto;
        transition: all .3s ease;
	}
	.result-active {
		opacity: 1;
		left: calc(50% + 50px);
	}
	.wrapper-active {
		position: absolute;
		margin: auto;
		top: 0;bottom:0;
		left: calc(50% - 350px);
	}
	.output-step {
		padding: 7px;
		color: rgba(0,0,0,.87);
	}
	.output-status {
		text-indent: 7px;
		color: #ff8f00;
	}
	.output-status-failed {
		color: red;
	}
	.output-status-complete {
		color: lime;
	}
	</style>
	<section class="result">
		<div class="inputbar nosel" id="1">
			<div class="output-step">Connect to SQL server</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
		<div class="inputbar nosel" id="2">
			<div class="output-step">Create users table</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
		<div class="inputbar nosel" id="3">
			<div class="output-step">Making your account</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
		<div class="inputbar nosel" id="4">
			<div class="output-step">Create files table</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
	</section>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="../js/ripple.js"></script>
    <script type="text/javascript">
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
    var done = [false, false, false, false];
    $('#install').submit(function(e) {
    	e.preventDefault()
    	checkEmail();
    });
    function install() {
    	openStat();
    	if (done[0]) {
    		install2();
    		return;
    	}
    	$.post('index.php?connect_database',
		{
			connect_database: '',
			dbuser: $('#dbuser').val(),
			dbpass: $('#dbpass').val(),
			dbname: $('#dbname').val(),
			dbhost: $('#dbhost').val()
		},
		function(errorcode) {
			console.log(errorcode);
			if (errorcode == 0) {
				done[0] = true;
				success(1);
				install2();
			} else {
				error(1, errorcode);
			}
		});
    }
    function install2() {
    	if (done[1]) {
    		install3();
    		return;
    	}
    	$.post('index.php?create_table_user',
			{
			create_table_user: ''
			},
			function(errorcode) {
			if (errorcode == 0) {
			done[1] = true;
			success(2);
			install3();
			} else {
			error(2, errorcode);
			}
		});
    }
    function install3() {
    	if (done[2]) {
    		install4();
    		return;
    	}
    	$.post('index.php?create_user',
			{
			create_user: '',
			useremail: $('#email').val(),
			userpass: $('#userpass').val()
			},
			function(errorcode) {
			if (errorcode == 0) {
			done[2] = true;
			success(3);
			install4();
			} else {
			error(3, errorcode);
			}
		});
    }
    function install4() {
    	if (done[3]) {
    		return;
    	}
    	$.post('index.php?create_table_files',
			{
			create_table_files: ''
			},
			function(errorcode) {
			if (errorcode == 0) {
			done[3] = true;
			success(4);
			finish();
			} else {
			error(4, errorcode);
			}
		});
    }
    function openStat() {
    	$('main').addClass('wrapper-active');
    	$('.result').addClass('result-active');
    }
    function closeStat() {
    	$('main').removeClass('wrapper-active');
    	$('.result').removeClass('result-active');
    }
	function error(e, message) {
		if (message.includes('No such host is known')) {
			message = 'Host lookup failed';
			$('#dbhost').focus();
		} else if (message.includes('Access denied for user')) {
			message = 'Access denied for DB User';
			$('#dbuser').focus();
		} else if (message.includes('Unknown database')) {
			message = 'Database not found';
			$('#dbname').focus();
		}
		$('.result #'+e+' .output-status').html(message).addClass('output-status-failed');
	}
    function success(step) {
    	$('.result #'+step+' .output-status').html("Done").addClass('output-status-complete');
    }
    function finish() {
    	$('.btn-submit').html("Done!").attr('onclick', 'window.location = "../login"');
    }
    function checkEmail() {
    	if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test($('#email').val())) {
    		$('.error-email').removeClass('active');
    		install();
    	} else {
    		if ($('#email').val() != '') {
    			$('.error-email').addClass('active');
    		}
    	}
    };
    </script>
</body>
</html>
<?php 
	}
?>