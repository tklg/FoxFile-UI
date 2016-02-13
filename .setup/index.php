<?php
$db_config_path = '../includes/user.php';

session_start();
require $db_config_path;
function sanitize($s) {
	global $dbhost, $dbuname, $dbupass, $dbname;
 	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
 	return htmlentities(preg_replace('/\<br(\s*)?\/?\>/i', "\n", mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
if (isset($installed) && $installed && isset($_SESSION['foxfile_done_setup'])) {
	header("Location: ../login");
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
$installed = true;
';
	    $fp = fopen($db_config_path, "w");
        fwrite($fp, $string);
        fclose($fp);
		echo 0;
	} else {
		echo mysqli_connect_error();
	}
} else if (isset($_POST['create_table_user'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
    $sql = 'CREATE TABLE USERS (
	    PID INT NOT NULL AUTO_INCREMENT, 
	    PRIMARY KEY(PID),
	    firstname VARCHAR(128),
	    lastname VARCHAR(128),
	    email VARCHAR(128),
	    password VARCHAR(512),
	    root_folder VARCHAR(32),
		total_storage DOUBLE(100, 2),
		account_status VARCHAR(32),
	    access_level TINYINT,
	    join_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )';
	if (mysqli_query($db, $sql)) {
		echo 0;
	} else {
		echo mysql_error();
	}
} else if (isset($_POST['create_user'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$email = $_POST['useremail'];
	$password = password_hash($_POST['userpass'], PASSWORD_BCRYPT);
	$root_folder = md5($email);
	$total_storage = 5000000000;
	$sql = "INSERT INTO USERS (firstname, email, password, root_folder, total_storage, account_status, access_level)
        VALUES (
        'Administrator',
        '$email',
        '$password',
        '$root_folder',
        '$total_storage',
        'verified',
        '5')";
	if (mysqli_query($db, $sql)) {
		mkdir('../files/'.$root_folder.'/');
		mkdir('../trashes/'.$root_folder.'/');
		echo 0;
	} else {
		echo mysql_error();
	}
} else if (isset($_POST['create_table_files'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$sql = 'CREATE TABLE FILES (
        PID INT NOT NULL AUTO_INCREMENT, 
        PRIMARY KEY(PID),
		owner_email VARCHAR(128),
		owner_id INT,
		is_folder BOOLEAN,
		hash CHAR(12),
		parent CHAR(12),
		title VARCHAR(128),
        trashed BOOLEAN DEFAULT 0,
        shared BOOLEAN DEFAULT 0,
        date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_last_checked DATETIME DEFAULT NULL,
        date_completed DATETIME DEFAULT NULL,
        UNIQUE(PID,hash)
        )';
	if (mysqli_query($db, $sql)) {
		$_SESSION['foxfile_done_setup'] = true;
		echo 0;
	} else {
		echo mysql_error();
	}
} else {
	?>
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
<link rel="stylesheet" href="../css/login.css" />
<link rel="icon" type="image/ico" href="img/foxfile.png">
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
    	$.post('index.php',
		{
			connect_database: '',
			dbuser: $('#dbuser').val(),
			dbpass: $('#dbpass').val(),
			dbname: $('#dbname').val(),
			dbhost: $('#dbhost').val()
		},
		function(errorcode) {
			console.log(errorcode);
			if (errorcode == 0 || done[0]) {
				done[0] = true;
				success(1);
				$.post('index.php',
				{
					create_table_user: ''
				},
				function(errorcode) {
					if (errorcode == 0 || done[1]) {
						done[1] = true;
						success(2)
						$.post('index.php',
						{
							create_user: '',
							useremail: $('#email').val(),
							userpass: $('#userpass').val()
						},
						function(errorcode) {
							if (errorcode == 0 || done[2]) {
								done[2] = true;
								success(3);
								$.post('index.php',
								{
									create_table_files: ''
								},
								function(errorcode) {
									if (errorcode == 0 || done[3]) {
										done[3] = true;
										success(4);
										finish();
									} else {
										error(4, errorcode);
									}
								});
							} else {
								error(3, errorcode);
							}
						});
					} else {
						error(2, errorcode);
					}
				});
			} else {
				error(1, errorcode);
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