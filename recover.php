<?php
//session_start();
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
    https://tkluge.net

-->
<head>
    <title>FoxFile - Recover password</title>
    <meta charset="utf-8" />
    <meta author="tkluge" />
    <link rel="stylesheet" href="css/login.css" />
    <link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'>
    <link rel="icon" type="image/ico" href="img/favicon.png">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
</head>
<body>
<main class="recover float-2">
    <header class="header float" id="header-main">
        <img class="float" src="img/default_avatar.png" alt="profile picture" />
        <span>Enter recovery email</span>
    </header>
	<section class="content">
        <form name="recover"  onsubmit="return sendEmail()" method="post">
            <p class="instructions">
                Please enter your email address below and we'll send you instructions on how to set a new password. Your existing files will no longer be accessible.
            </p>
            <div class="inputbar nosel">
    			<label class="userlabel">
    				<input name="email" class="userinfo" id="email" type="text" autofocus>
    				<span class="placeholder-userinfo nosel">Email</span>
    				<hr class="input-underline"></hr>
    				<div class="error"><div class="error-message">Invalid Email Address</div></div>
    			</label>
    		</div>
            <div class="g-recaptcha" data-sitekey="<?php echo $foxfile_recaptcha_public; ?>"></div>
            <a href="./" class="new-account">Log in</a>
            <button class="btn btn-submit" type="submit"">Send email<link class="rippleJS" /></button>
        </form>
	</section>
</main>
<?php include './includes/footer.html'; ?>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="js/ripple.js"></script>
<script src='https://www.google.com/recaptcha/api.js'></script>
    <script type="text/javascript">
    $(document).ready(function() {
        var user = $('#email').val();
        $('#email').attr('empty', (user != '') ? 'false' : 'true');
    });
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
    function sendEmail() {
        if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test($('#email').val())) {
            if (grecaptcha.getResponse().length > 0) {
                $.ajax({
                    type: "POST",
                    url: "./api/auth/send_recovery",
                    data: {
                        email: $('#email').val(),
                        extra: false,
                        captcha: grecaptcha.getResponse()
                    },
                    success: function(result) {
                        console.log(result);
                        $('form').html('<p class="instructions">Recovery email sent.</p>');
                    },
                    error: function(request, error) {
                        grecaptcha.reset();
                        if (request.status == 401) {
                            $('.error').addClass('active').children('.error-message').text('No account was found with that email');
                        } else {
                            $('.error').addClass('active').children('.error-message').text('Failed to send recovery email');
                        }
                    }
                });
            }
        } else {
            if ($('#email').val() != '') {
                $('.error').addClass('active');
            }
        }
        return false;
    }
    $('#email').blur(function() {
    	if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test($('#email').val())) {
    		$('.error').removeClass('active');
    	} else {
    		if ($('#email').val() != '') {
                $('.error').addClass('active');
            }
    	}
    });
    </script>
</body>
</html>