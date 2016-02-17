<?php
session_start();
include 'includes/cfgvars.php';
if (isset ($_SESSION['foxfile_uid'])) header ("Location: browse");
/*if (!isset ($_SESSION['access_token'])) header ("Location: login");*/
?>
<!DOCTYPE html>
<html lang="en-US">
<!--
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                              

	Foxfile : <?php echo basename(__FILE__); ?> 
	Version <?php echo $foxfile_version; ?> 
	Copyright (C) 2016 Theodore Kluge
	http://tkluge.net

-->
<head>
	<title>FoxFile</title>
	<meta charset="utf-8" />
	<meta author="tkluge" />
	<link rel="stylesheet" href="css/login.css" />
	<link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
	<link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'>
	<link rel="icon" type="image/ico" href="favicon.ico">
	<meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
</head>
<body>
<main class="float-2">
	<!-- add rememberme cookie thing from github -->
	<span class="back" onclick="removeUser()"><i class="mdi mdi-arrow-left"></i></span>
	<header class="header float" id="header-main">
		<img class="float" src="img/default_avatar.png" alt="profile picture" />
		<span>Sign in to FoxFile</span>
	</header>
	<section class="content">
	    <form name="login" action="login.php" method="post" onsubmit="return false;">
	    	<section class="slider">
				<div class="inputbar nosel">
					<label class="userlabel">
						<input name="email" class="userinfo" id="email" type="text" required>
						<span class="placeholder-userinfo nosel">Enter your email</span>
						<hr class="input-underline" />
						<div class="error error-email"><div class="error-message">Invalid email address</div></div>
					</label>
				</div>
				<div class="inputbar nosel">
					<label class="userlabel">
						<input name="password" class="userinfo" id="userpass" type="password" required>
						<span class="placeholder-userinfo nosel">Password</span>
						<hr class="input-underline" />
						<div class="error error-pass"><div class="error-message">Incorrect password</div></div>
					</label>
				</div>
			</section>
			</div>
			<a href="register" class="new-account">Need an account?</a>
	        <button class="btn btn-submit" type="button" onclick="checkEmail()">Next<link class="rippleJS" /></button>
	        <a href="recover" class="forgot-password">Forgot password?</a>
	        <button class="btn btn-submit" type="button" onclick="sub()">Sign In<link class="rippleJS" /></button>
	    </form>
	</section>
</main>
<?php include './includes/footer.html'; ?>
<script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="js/md5.js"></script>
<script type="text/javascript" src="js/ripple.js"></script>
    <script type="text/javascript">
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
    var stage = 0;
    var pressed = false;
    $(document).keydown(function(e) {
		if (!pressed && e.keyCode == 13) { //enter
			pressed = true;
            if (stage == 0) {
            	checkEmail();
            } else {
            	sub();
            }
		}
	});
	$(document).keyup(function(e) {
		if (e.keyCode == 13) { //enter
			pressed = false;
		}
	});
    function checkEmail() {
    	if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test($('#email').val())) {
    		$('main').addClass('active');
    		$('.error-email').removeClass('active');
    		$('#header-main img').attr('src', '//www.gravatar.com/avatar/'+md5($('#email').val())+'?d=retro&r=r');
    		$('#header-main span').text($('#email').val());
    		setTimeout(function() {
    			$('#userpass').focus();
    		}, 450);
    		setCookie('useremail', $('#email').val(), 7);
    		stage = 1;
    	} else {
    		if ($('#email').val() != '') {
                $('.error-email').addClass('active');
            }
    	}
    }
    function restart() {
    	$('main').removeClass('active');
    	$('.error-email').removeClass('active');
    	$('#header-main span').text('Sign in to FoxFile');
    	$('.email').focus();
    	stage = 0;
    }
    function sub() {
    	$.post('./api/auth/login',
			{
				useremail: $('#email').val(),
				userpass: $('#userpass').val()
			},
			function(result) {
				console.log(result);
				switch (result) {
					case '0': //ok
						window.location.href = "./browse";
						break;
					case '1': //invalid u/p
						$('.error-pass').addClass('active').text('Invalid email/pass');
						break;
					case '2':
						$('.error-pass').addClass('active').text('Database error');
						break;
				}
		});
    }
    function getCookie(c_name) {
	    var c_value = document.cookie;
	    var c_start = c_value.indexOf(" " + c_name + "=");
	    if (c_start == -1) {
	        c_start = c_value.indexOf(c_name + "=");
	    }
	    if (c_start == -1) {
	        c_value = null;
	    } else {
	        c_start = c_value.indexOf("=", c_start) + 1;
	        var c_end = c_value.indexOf(";", c_start);
	        if (c_end == -1) {
	            c_end = c_value.length;
	        }
	        c_value = unescape(c_value.substring(c_start, c_end));
	    }
	    return c_value;
	}
	function setCookie(c_name, value, exdays) {
	    var exdate = new Date();
	    exdate.setDate(exdate.getDate() + exdays);
	    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	    document.cookie = c_name + "=" + c_value;
	}
	function removeUser() {
		setCookie('useremail', '', 7);
		var user = $('#email').val();
        $('#email').attr('empty', (user != '') ? 'false' : 'true');
        var pass = $('#userpass').val();
        $('#userpass').attr('empty', (pass != '') ? 'false' : 'true');
		restart();
	}
	$(document).ready(function() {

		var u = getCookie("useremail");
	    if (u != null && u != "") {
	        using_cookie = true;
	        $('#email').val(u);
	        checkEmail();
	    }
		var user = $('#email').val();
        $('#email').attr('empty', (user != '') ? 'false' : 'true');
        var pass = $('#userpass').val();
        $('#userpass').attr('empty', (pass != '') ? 'false' : 'true');
	});
    </script>
</body>
</html>