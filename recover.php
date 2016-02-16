<?php
session_start();
include 'includes/cfgvars.php';
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
    <title>FoxFile - Recover password</title>
    <meta charset="utf-8" />
    <meta author="tkluge" />
    <link rel="stylesheet" href="css/login.css" />
    <link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'>
    <link rel="icon" type="image/ico" href="favicon.ico">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
</head>
<body>
<main class="recover float-2">
    <header class="header float" id="header-main">
        <img class="float" src="img/default_avatar.png" alt="profile picture" />
        <span>Enter recovery email</span>
    </header>
	<section class="content">
        <form name="recover" action="uauth.php" method="post">
            <p class="instructions">
                Please enter your email address below and we'll send you instructions on how to set a new password.
            </p>
            <div class="inputbar nosel">
    			<label class="userlabel">
    				<input name="email" class="userinfo" id="email" type="text" autofocus>
    				<span class="placeholder-userinfo nosel">Email</span>
    				<hr class="input-underline"></hr>
    				<div class="error"><div class="error-message">Invalid Email Address</div></div>
    			</label>
    		</div>
            <a href="login" class="new-account">Log in</a>
            <button class="btn btn-submit" type="button" onclick="sendEmail()">Send email<link class="rippleJS" /></button>
        </form>
	</section>
</main>
<footer class="footer">
    <nav class="nav-horiz-bars">
        <span class="nav-horiz-item"><a href="tos">Terms of service</a></span>
        <span class="nav-horiz-bar">|</span>
        <span class="nav-horiz-item"><a href="privacy">Privacy policy</a></span>
        <span class="nav-horiz-bar">|</span>
        <span class="nav-horiz-item"><a href="about">About</a></span>
        <span class="nav-horiz-bar">|</span>
        <span class="nav-horiz-item"><a href="help">Help</a></span>
    </nav>
    <span class="copyright">
        <span id="c1">&copy; <?php echo date("Y");?> Theodore Kluge</span>
        <span id="c2">Made with ❤ by Theodore Kluge</span>
    </span>
</footer>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="js/ripple.js"></script>
    <script type="text/javascript">
    $(document).ready(function() {
        var user = $('#email').val();
        $('#email').attr('empty', (user != '') ? 'false' : 'true');
    });
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
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