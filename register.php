<?php
session_start();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta author="tkluge" />
    <link rel="stylesheet" href="css/login.css" />
    <link rel="icon" type="image/ico" href="favicon.ico">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <title>FoxFile - Register</title>
</head>
<body>
<main class="float-2 register">
    <header class="header float" id="header-main">
        <span>Create a new account</span>
    </header>
	<section class="content">
        <form name="register" action="uauth.php" method="post" onsubmit="sub(); return false;">
            <div class="inputbar noslider nosel">
                <label class="userlabel">
                    <input name="email" class="userinfo" id="email" type="text" autofocus required>
                    <span class="placeholder-userinfo nosel">Your email</span>
                    <hr class="input-underline" />
                    <div class="error error-email"><div class="error-message">Invalid Email Address</div></div>
                </label>
            </div>
            <div class="inputbar inputbar-half nosel">
                <label class="userlabel">
                    <input name="firstname" class="userinfo" id="firstname" type="text" required>
                    <span class="placeholder-userinfo nosel">First name</span>
                    <hr class="input-underline" />
                    <div class="error error-name"><div class="error-message">Username not Available</div></div>
                </label>
            </div>
            <div class="inputbar inputbar-half nosel">
                <label class="userlabel">
                    <input name="lastname" class="userinfo" id="lastname" type="text">
                    <span class="placeholder-userinfo nosel">Last name</span>
                    <hr class="input-underline" />
                    <div class="error error-name"><div class="error-message">Username not Available</div></div>
                </label>
            </div>
            <div class="inputbar nosel">
                <label class="userlabel">
                    <input name="password" class="userinfo" id="password" type="password" required>
                    <span class="placeholder-userinfo nosel">Password</span>
                    <hr class="input-underline" />
                    <div class="error error-pass"><div class="error-message">Passwords do not Match</div></div>
                </label>
            </div>
            <div class="inputbar nosel">
                <label class="userlabel">
                    <input name="password2" class="userinfo" id="password2" type="password" required>
                    <span class="placeholder-userinfo nosel">Repeat password</span>
                    <hr class="input-underline" />
                    <div class="error error-pass"><div class="error-message">Passwords do not Match</div></div>
                </label>
            </div>
            <a href="login" class="new-account">Got an account?</a>
            <button class="btn btn-submit" type="submit">Create</button>
        </form>
	</section>
</main>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script type="text/javascript">
    $(document).ready(function() {
        var user = $('#email').val();
        $('#email').attr('empty', (user != '') ? 'false' : 'true');
    });
    $('input.userinfo').change(function() {
        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
    });
    $('#password2, #password').change(function() {
        if ($('#password').val() == $('#password2').val()) {
            $('.error-pass').removeClass('active');
        } else {
            if ($('#password2').val() != '')
                $('.error-pass').addClass('active');
        }
    });
    $('#email').blur(function() {
    	if (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test($('#email').val())) {
    		$('.error-email').removeClass('active');
    	} else {
    		if ($('#email').val() != '') {
                $('.error-email').addClass('active');
            }
    	}
    });
    function sub() {

    }
    </script>
</body>
</html>