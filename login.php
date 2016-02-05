<?php

if (!isset($_POST['username']) || !isset($_POST['password'])) {

?>
<!DOCTYPE html>
<<<<<<< HEAD
<html lang="en-US">
    <!--
    
      _                  _____ _                  _     _            
     | |                / ____(_)                (_)   | |           
     | |     __ _ ___  | |     _ _ __   _____   ___  __| | ___  ___  
     | |    / _` / __| | |    | | '_ \ / _ \ \ / / |/ _` |/ _ \/ _ \ 
     | |___| (_| \__ \ | |____| | | | |  __/\ V /| | (_| |  __/ (_) |
     |______\__,_|___/  \_____|_|_| |_|\___| \_/ |_|\__,_|\___|\___/ 
=======
<html lang="en">
  <head>
    <title><?php echo $title ?></title>
    <?php require('includes/header.php'); ?>
    <style type="text/css">
	/*#wrapper {
		top: 50px;
        width: 300px;
        height: auto;
        position: absolute;
        left: 0;right: 0;margin: auto;
        font-family: 'quicksandlight', sans-serif;
    }*/
    #wrapper {
        width: 300px;
        /*height: 250px;*/
        height: auto;
        position: absolute;
        top: 20%;
        left: 0;right: 0;margin: auto;
        font-family: 'quicksandlight', sans-serif;
        padding: 30px;
        border: 1px solid blue;
        border-radius: 10px;
    }
    .loginpage-title {
    	font-size: 300%;
        margin: 0;
        margin-bottom: 10px;
        color: #999999;
        text-align: center;
    }
    .login-content-title,
    .login-content,
    .btn-submit {
        width: 100%;
        margin-top: 3px;
        color: #bcc6cc;
        -webkit-transition: all .2s ease-in-out;
          transition: all .2s ease-in-out;
    }
    /*.login-content {
        background: rgba(255,255,255,.1);
        border: 1px solid transparent;
        padding: 4px 0;
        text-indent: 5px;
    }
    .btn-submit {
        background: rgba(255,255,255,.2);
        border: none;
        padding: 5px;
        margin-top: 10px;
    }*/
    .login-content {
        background: transparent;
        border: 1px solid transparent;
        border-bottom: 1px solid rgba(255,255,255,.1);
        padding: 4px 0;
        text-indent: 5px;
    }
    .btn-submit {
        background: rgba(255,255,255,.1);
        padding: 10px 5px;
        margin-top: 10px;
        border: 1px solid transparent;
    }
    .btn-submit:hover {
        background: rgba(255,255,255,.6);
        cursor: pointer;
    }
    input:active,
    input:focus,
    button:active,
    button:focus {
    outline: 0 none;
    	background: transparent !important;
	}
	.uname-val {
		float: right;
	    position: relative;
	    margin: -15px 2px 0px 0px;
	    font-size: 14px;
	    color: rgba(0,0,0,0);
	}
	.link {
		-webkit-transition: all .2s ease-in-out;
          transition: all .2s ease-in-out;
	}
	.sulink {
		margin-top: 10px;
		font-size: 70%;
	}
	.sulinksub {
		font-size: 70%;
	}
	.login-nouser {
		/*display: none;*/
	}
	.login-user-show {
		display: none;
	}
	.login-user img {
		margin: 20px calc(100% - 200px);
		margin-bottom: 5px;
		width: 100px;
		border-radius: 50px;
		/*border: 1px solid;*/
	}
	.login-user .login-user-message {
		width: 100%;
		text-align: center;
	}
    </style>
>>>>>>> b5ee11af37e522c9fedcf9af357f4a7edd5adb8c

    (c) Las Cinevideo
    admin/login.php
    Design by Theodore Kluge
    https://tkluge.net                                                                 

    -->
<head>
	<title>Las Cinevideo</title>
	<meta charset="utf-8" />
	<meta author="tkluge" />
	<meta description="Las Cinevideo website" />
	<link rel="stylesheet" href="../css/login.css" />
	<link rel="icon" type="image/ico" href="../favicon.ico">
</head>
<body>

<<<<<<< HEAD
<section class="wrapper">
	<section class="content">
		<header class="header" id="header-main">
			<a href="./" class="anchor-wrap"><img class="logo" id="logo" src="../img/logo.svg" /></a>
		</header>
    <form name="login" action="login.php" method="post" onsubmit="sub(); return false;">
		<div class="inputbar nosel">
			<label class="userlabel">
				<input name="username" class="userinfo" id="username" type="text" required>
				<span class="placeholder-userinfo nosel">Username</span>
				<div class="input-underline"></div>
			</label>
		</div>
		<div class="inputbar nosel">
			<label class="userlabel">
				<input name="password" class="userinfo" id="userpass" type="password" required>
				<span class="placeholder-userinfo nosel">Password</span>
				<div class="input-underline"></div>
			</label>
		</div>
		<div class="inputbar errors">
=======
	<div class="orangeborder" id="wrapper">
	
		<p class="loginpage-title"><?php echo $name; ?></p>
		<p class="login-nouser">
			<label class="login-content-title" for="uname"><i class="fa fa-user"></i> Username</label>
			<input class="login-content obf" name="unamesub" type="text" id="uname" value="" placeholder="" required onBlur="check_availability()" />
		</p>
		<div class="login-user login-user-show">
			<img class="orangeborder" src="http://placehold.it/100x100" />
			<input class="login-content obf" name="unamesub" type="hidden" id="uname2" value="" />
			<div class="login-user-message">USERNAME</div>
		</div>
		<p>				
			<label class="login-content-title" for="upass"><i class="fa fa-unlock-alt"></i> Password</label>
			<input class="login-content obf" name="upasssub" type="password" id="upass" placeholder="" required >
		</p>

		<button type="submit" name="login" class="btn btn-submit" onclick="check_validity()"><b>Login</b></button>
		<div class="link sulink">Need an account? <a href="register">Sign Up!</a></div>
		<div class="link sulinksub login-user-show">Not you? <a href="#" onclick="removeUser()">Change User</a></div>

	</div>
>>>>>>> b5ee11af37e522c9fedcf9af357f4a7edd5adb8c

		</div>
        <section class="inputbar inputbar nosel nomargin">
            <button class="btn btn-submit btn-flat waves-effect waves-light" type="submit">Sign In</button>
        </section>
    </form>
	</section>
</section>
<script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
    <script type="text/javascript">
    $(document).ready(function() {
        var user = $('#username').val();
        $('#username').attr('empty', (user != '') ? 'false' : 'true');
        var pass = $('#userpass').val();
        $('#userpass').attr('empty', (pass != '') ? 'false' : 'true');
        //((user == '') ? $('#username') : $('#userpass')).focus();
    });
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
    function sub() {
    	console.log('a');
    	$.post('./login.php',
			{
				username: $('#username').val(),
				password: $('#userpass').val()
			},
			function(result) {
				console.log(result);
				switch (result) {
					case '1': //ok
						window.location.href = "./";
						break;
					case '2': //invalid u/p
						$('.errors').text('Invalid user/pass');
						break;
					case '3': //invalid ip
						$('.errors').text('Invalid IP address');
						break;
				}
		});
    }
    </script>
</body>
</html>
<?php
} else {
	session_start();
	$user = $_POST['username'];
	$pass = $_POST['password'];
	$ip = $_SERVER['REMOTE_ADDR'];

	$users_list_file = file_get_contents('users.json');
	$allowed_ips_file = file_get_contents('ips.json');
	$users_list = json_decode($users_list_file, 1);
	$ips_list = json_decode($allowed_ips_file, 1);
	require "plugin/password.php";

<<<<<<< HEAD
	if (array_key_exists($user, $users_list)) {
		if (password_verify($pass, $users_list[$user])) { //pass matches user
			foreach ($ips_list as $value) {
				if (preg_match('/^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/', $value)) {
					// is numerical ip
				} else {
					$value = gethostbyname($value);
				}
				if ($ip == $value) {
					$_SESSION['user'] = $user;
					echo 1;
					die();
				}
=======
        if(username.length > 0) {
  
	        $.post("uauth.php", { 
	        	check_username: 'yes',
	        	username: username
	        	},  
	            function(result) {  
	                if (result == 0) {  
	                    //$('#uname').css('border-bottom','#99c68e solid 1px'); //light green
				        setCookie("username", username, 28);
	                    uexists = true;
	                } else {  
	                    //$('#uname').css('border-bottom','#e77471 solid 1px'); //light red
	                    uexists = false;
	                }  
	        });  
	    }
	}
	function check_validity() {
		var username = $('#uname').val(),
			password = $('#upass').val();
			if (using_cookie) {
				username = $('#uname2').val();
				uexists = true;
>>>>>>> b5ee11af37e522c9fedcf9af357f4a7edd5adb8c
			}
			echo 3;
		} else {
<<<<<<< HEAD
			echo 2;
=======
			if (uexists) {
				d.info("Checking validity...");
				$.post("uauth.php", {
					login: 'yes',
					username: username,
					password: password
				},
				function (result) {
					if (result == 'valid') {
						$('#uname').css('border-bottom','#99c68e solid 1px');
						$('#upass').css('border-bottom','#99c68e solid 1px');
						//d.info("Valid!");
						d.success("Logging in...");
						setTimeout(function() {
							document.location = '<?php if(isset($_GET["target"])) {echo $_GET["target"];} else {echo "browse";}?>';
						}, 1000);
					} else {
						$('#pass').css('border-bottom','#e77471 solid 1px')
						console.info(result);
						d.error(result);
					}
				});
			} else {
				d.error("Username not found.");
			}
>>>>>>> b5ee11af37e522c9fedcf9af357f4a7edd5adb8c
		}
	} else {
		echo 2;
	}
}
