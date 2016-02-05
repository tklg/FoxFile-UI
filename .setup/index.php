<?php
// http://tagging.pui.ch/post/37027745720/tags-database-schemas
// https://en.wikipedia.org/wiki/Issue_tracking_system
$db_config_path = '../includes/user.php';

session_start();
require $db_config_path;
function sanitize($s) {
	global $dbhost, $dbuname, $dbupass, $dbname;
 	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
 	return htmlentities(preg_replace('/\<br(\s*)?\/?\>/i', "\n", mysqli_real_escape_string($db, $s)), ENT_QUOTES);
}
if (isset($installed) && $installed && isset($_SESSION['foxits_done_setup'])) {
	header("Location: ../dashboard");
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
	    google_id CHAR(21),
	    google_refresh_token VARCHAR(128),
	    name VARCHAR(128),
	    email VARCHAR(128),
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
	$gid = $_SESSION['foxits_user_id'];
	$name = $_SESSION['foxits_user_name'];
	$email = $_SESSION['foxits_user_email'];
	$sql = "INSERT INTO USERS (google_id, name, email, access_level)
        VALUES (
        '$gid',
        '$name',
        '$email',
        '5')";
	if (mysqli_query($db, $sql)) {
		echo 0;
	} else {
		echo mysql_error();
	}
} else if (isset($_POST['create_table_tickets'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$sql = 'CREATE TABLE TICKETS (
        PID INT NOT NULL AUTO_INCREMENT, 
        PRIMARY KEY(PID),
		owner VARCHAR(128),
		owner_id CHAR(21),
		hash CHAR(12),
		title VARCHAR(128),
        content TEXT,
        priority VARCHAR(32),
        status VARCHAR(32),
        date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_last_checked DATETIME DEFAULT NULL,
        date_completed DATETIME DEFAULT NULL,
        UNIQUE(PID,hash)
        )';
	if (mysqli_query($db, $sql)) {
		echo 0;
	} else {
		echo mysql_error();
	}
} else if (isset($_POST['create_table_tagmap'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$sql = 'CREATE TABLE TAGMAP (
        PID INT NOT NULL AUTO_INCREMENT, 
        PRIMARY KEY(PID),
        ticket_id INT,
        tag_id INT
        )';
	if (mysqli_query($db, $sql)) {
		echo 0;
	} else {
		echo mysql_error();
	}
} else if (isset($_POST['create_table_tags'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$sql = 'CREATE TABLE TAGS (
        PID INT NOT NULL AUTO_INCREMENT, 
        PRIMARY KEY(PID),
        name VARCHAR(50),
        UNIQUE (PID,name)
        )';
	if (mysqli_query($db, $sql)) {
		echo 0;
	} else {
		echo mysql_error();
	}
} else if (isset($_POST['create_table_usermap'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$sql = 'CREATE TABLE USERMAP (
        PID INT NOT NULL AUTO_INCREMENT, 
        PRIMARY KEY(PID),
        user_id INT,
        ticket_id INT
        )';
	if (mysqli_query($db, $sql)) {
		echo 0;
	} else {
		echo mysql_error();
	}
} else if (isset($_POST['create_table_comments'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$sql = 'CREATE TABLE COMMENTS (
        PID INT NOT NULL AUTO_INCREMENT, 
        PRIMARY KEY(PID),
        ticket_hash CHAR(12),
		owner VARCHAR(128),
		owner_id CHAR(21),
        content TEXT,
        date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(PID)
        )';
	if (mysqli_query($db, $sql)) {
		echo 0;
	} else {
		echo mysql_error();
	}
} else if (isset($_POST['create_table_keys'])) {
	$db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
	$sql = 'CREATE TABLE APIKEYS (
        PID INT NOT NULL AUTO_INCREMENT, 
        PRIMARY KEY(PID),
        api_key CHAR(39),
		owner VARCHAR(128),
		created_by VARCHAR(128),
		http_origin VARCHAR(256),
		create_ticket BOOLEAN,
		list_tickets BOOLEAN,
		create_comments BOOLEAN,
		list_comments BOOLEAN,
		modify_tickets BOOLEAN,
		modify_comments BOOLEAN,
		list_logs BOOLEAN DEFAULT 0,
		create_key BOOLEAN DEFAULT 0,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(PID,api_key,owner)
        )';
	if (mysqli_query($db, $sql)) {
		$gid = $_SESSION['foxits_user_id'];
		$key = 'foxits_'.md5(uniqid(rand(), true));
		$sql = "INSERT INTO APIKEYS (api_key,owner,created_by,http_origin,create_ticket,list_tickets,create_comments,list_comments,modify_tickets,modify_comments,list_logs,create_key)
		VALUES (
        	'$key',
        	'FoxITS',
        	'$gid',
        	'localhost',
        	1,1,1,1,1,1,1,1
        )";
		if (mysqli_query($db, $sql)) {
			$cfg = array(
				'logfile'=>'logs/log.txt',
				'api_key'=>$key
			);
			$fp = fopen('../includes/cfg.json', "w");
	        fwrite($fp, json_encode($cfg));
	        fclose($fp);
			echo 0;
		} else {
			echo mysql_error();
		}	
	} else {
		echo mysql_error();
	}
	$_SESSION['foxits_done_setup'] = true;
}
} else {
	?>
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
<style type="text/css">
	html, body {
		height: 100%;
		width: 100%;
		margin: 0;
		padding: 0;
		font-family: sans-serif;
		background: white;
	}
    :selection {
        background: #ff8f00;  
    }
	.wrapper {
		width: 400px;
		left: calc(50% - 200px);
		<?php if (isset($_SESSION['foxits_user_id'])) { ?>
		height: 500px;
		<?php } else { ?>
		height: 55px;
		<?php } ?>
		position: absolute;
		top: 0;bottom:0;margin: auto;
		-webkit-transition: all .3s ease-in-out;
        transition: all .3s ease;
        background: #f2f2f2;
        padding: 20px;
        padding-top: 30px;
    }
	.content {
		width: 320px;
		/*top:0;bottom:0;*/right:0;left:0;margin:auto;
		position: absolute;
	}
	.inputbar {
		position: relative;
		width: 100%;
		height: 60px;
		margin-bottom: 30px;
/*        background: red*/
	}
	.userlabel {
		color: rgba(0,0,0,.87);
	}
	.userinfo {
		color: rgba(0,0,0,.87);
		font-size: 110%;
		width: 100%;
		background: transparent;
		border: none;
		border-bottom: 2px solid rgba(0,0,0,.1);
		padding: 7px 0;
		text-indent: 10px;
	}
	input:active,
	input:focus {
		outline: 0 none;
	}
	.placeholder-userinfo {
		color: rgba(0,0,0,.87);
		position: absolute;
		top: 11px;
		left: 10px;
		cursor: text;
		user-select: none;
		-webkit-transition: all .3s ease-in-out;
        transition: all .3s ease;
	}
	.input-underline {
		margin-top: -2px;
		position: absolute;
		height: 2px;
		width: 0;
		left: 50%;
		background: #ff8f00;
		-webkit-transition: all .3s ease-in-out;
        transition: all .3s ease;
	}
	.userinfo:focus ~ .input-underline {
		width: 100%;
		left: 0;
	}
	.userinfo:focus ~ .placeholder-userinfo,
    .userinfo[empty="false"] ~ .placeholder-userinfo {
		top: -14px;
		left: 0;
		font-size: 70%;
        color: #ff8f00;
	}
	.nosel {
		-webkit-touch-callout: none;
	    -webkit-user-select: none;
	    -khtml-user-select: none;
	    -moz-user-select: none;
	    -ms-user-select: none;
	    user-select: none;
	}
    .title {
        color: white;
        font-size: 200%;
        position: relative;
        width: 100%;
        height: 50px;
        padding: 10px 0;
        text-indent: 15px;
        margin: 0;
        font-weight: normal;
        display: none;
    }
    .btn {
        background: #ff8f00;
        padding: 12px 0;
        border: none;
        outline: 0 none;
        width: 100%;
        font-size: 104%;
        color: white;
        cursor: pointer;
        -webkit-transition: all .3s ease-in-out;
        transition: all .3s ease;
    }
    .btn:hover,
    .btn:focus {
        background: #ff6f00;  
    }
    .nomargin {
        margin: 0;
    }
    a {
        text-decoration: none;
        color: #ff8f00;
        -webkit-transition: all .3s ease-in-out;
        transition: all .3s ease;
    }
    a:hover,
    a:focus {
        color: #ff6f00;
    }
    .inputbar a {
        font-size: 80%;   
    }
    .inputbar a:last-of-type {
        float: right;
    }
    .error {
    	width: 100%;
    	border: 1px solid red;
    	padding: 2px 0;
    	text-indent: 4px;
    	border-top: none;
    	color: red;
    	height: 0;
    	opacity: 0;
    	-webkit-transition: all .3s ease-in-out;
        transition: all .3s ease;
    }
    .error.error-active {
    	height: 18px;
    	opacity: 1;
    }
    .float {
    	box-shadow: 0 8px 17px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
    }
    .imgbar {

    }
    .imgbar img {
    	float: left;
    }
    .imgbar div {
    	float: left;
    	height: 60px;
    	padding-top: 10px;
    }
    .userimg {
    	height: 60px;
    	width: 60px;
    	border-radius: 50%;
    	vertical-align: middle;
    	margin-right: 10px;
    }
    .useremail {
    	color: rgba(0,0,0,.54);
    }
</style>
<link rel="icon" type="image/ico" href="img/foxits.png">
    <title>FoxITS - Setup</title>
</head>
<body>
<section class="wrapper float">
	<section class="content">
    <form id="install" name="install" action="#" method="post">
		<?php if (!isset($_SESSION['foxits_user_id'])) { ?>
		<div class="inputbar nosel">
			<button class="btn btn-submit" onclick="window.location = 'setupauth.php'; return false">Sign in with Google</button>
		</div>
		<?php
		} else if (isset($_SESSION['foxits_user_id'])) { ?>
		<div class="inputbar nosel imgbar">
			<img class="userimg" src="<?php echo $_SESSION['foxits_user_picture']; ?>" alt="profile picture" />
			<div><?php echo $_SESSION['foxits_user_name']; ?><br>
			<span class="useremail"><?php echo $_SESSION['foxits_user_email']; ?></span></div>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="dbuser" class="userinfo" id="dbuser" type="text">
				<span class="placeholder-userinfo nosel">Database username</span>
				<div class="input-underline"></div>
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="dbpass" class="userinfo" id="dbpass" type="password">
				<span class="placeholder-userinfo nosel">Database password</span>
				<div class="input-underline"></div>
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="dbname" class="userinfo" id="dbname" type="text">
				<span class="placeholder-userinfo nosel">Database name</span>
				<div class="input-underline"></div>
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input required name="dbhost" class="userinfo" id="dbhost" type="text">
				<span class="placeholder-userinfo nosel">Database host</span>
				<div class="input-underline"></div>
			</label>
		</div>
        <section class="inputbar nosel nomargin">
            <button class="btn btn-submit" id="button-submit">Set up</button>
        </section>
        <?php } ?>
    </form>
	</section>
</section>
	<style type="text/css">
	.result {
		position: absolute;
		width: 200px;
		height: 620px;
		left: 70%;
		opacity: 0;
		/*display: none;*/
		top:0;bottom:0;margin:auto;
		-webkit-transition: all .3s ease-in-out;
        transition: all .3s ease;
	}
	.result-active {
		opacity: 1;
		left: calc(50% + 100px);
	}
	.wrapper-active {
		left: calc(50% - 400px);
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
			<div class="output-step">Create tickets table</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
		<div class="inputbar nosel" id="5">
			<div class="output-step">Create tags table</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
		<div class="inputbar nosel" id="6">
			<div class="output-step">Create tagmap</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
		<div class="inputbar nosel" id="7">
			<div class="output-step">Create usermap</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
		<div class="inputbar nosel" id="8">
			<div class="output-step">Create comments table</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
		<div class="inputbar nosel" id="9">
			<div class="output-step">Create keys table</div>
			<div class="output-status">Waiting...</div>
			<div class="output-spinner"></div>
		</div>
	</section>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script type="text/javascript">
    $(document).ready(function() {
        var user = $('#username').val();
        $('#username').attr('empty', (user != '') ? 'false' : 'true');
        ((user == '') ? $('#username') : $('#userpass')).focus();
    });
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
    var done = [false, false, false, false, false, false, false, false, false];
    $('#install').submit(function(e) {
    	e.preventDefault()
    	install();
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
							create_user: ''
						},
						function(errorcode) {
							if (errorcode == 0 || done[2]) {
								done[2] = true;
								success(3);
								$.post('index.php',
								{
									create_table_tickets: ''
								},
								function(errorcode) {
									if (errorcode == 0 || done[3]) {
										done[3] = true;
										success(4);
										$.post('index.php',
										{
											create_table_tags: ''
										},
										function(errorcode) {
											if (errorcode == 0 || done[4]) {
												done[4] = true;
												success(5);
												$.post('index.php',
												{
													create_table_tagmap: ''
												},
												function(errorcode) {
													if (errorcode == 0 || done[5]) {
														done[5] = true;
														success(6);
														$.post('index.php',
														{
															create_table_usermap: ''
														},
														function(errorcode) {
															if (errorcode == 0 || done[6]) {
																done[6] = true;
																success(7);
																$.post('index.php',
																{
																	create_table_comments: ''
																},
																function(errorcode) {
																	if (errorcode == 0 || done[7]) {
																		done[7] = true;
																		success(8);
																		$.post('index.php',
																		{
																			create_table_keys: ''
																		},
																		function(errorcode) {
																			if (errorcode == 0 || done[8]) {
																				done[8] = true;
																				success(9);
																				finish();
																			} else {
																				error(9, errorcode);
																			}
																		});
																	} else {
																		error(8, errorcode);
																	}
																});
															} else {
																error(7, errorcode);
															}
														});
													} else {
														error(6, errorcode);
													}
												});
											} else {
												error(5, errorcode);
											}
										});
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
    	$('.wrapper').addClass('wrapper-active');
    	$('.result').addClass('result-active');
    }
    function closeStat() {
    	$('.wrapper').removeClass('wrapper-active');
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
    	$('#button-submit').html("Done!").attr('onclick', 'window.location = "setupauth.php?logout"');
    }
    $('#email').blur(function() {
    	if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test($('#email').val())) {
    		$('.error').removeClass('error-active');
    	} else {
    		if ($('#email').val() != '') {
    			$('.error').addClass('error-active');
    		}
    	}
    });
    </script>
</body>
</html>
<?php 
	}
?>