<?php
session_start();
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
        background: #628fce;
    }
    :selection {
        background: #2b65ec;  
    }
    .wrapper {
        height: 270px;
        width: 320px;
        position: absolute;
        top:0;bottom:0;right:0;left:0;margin:auto;
    }
    .content {
        width: 320px;
        top:0;bottom:0;right:0;left:0;margin:auto;
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
		color: white;
	}
	.userinfo {
		color: white;
		font-size: 110%;
		width: 100%;
		background: transparent;
		border: none;
		border-bottom: 2px solid rgba(255,255,255,.1);
		padding: 7px 0;
		text-indent: 10px;
	}
	input:active,
	input:focus {
		outline: 0 none;
	}
	.placeholder-userinfo {
		color: white;
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
		background: #2b65ec;
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
        color: #2b65ec;
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
        background: #2b65ec;
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
        background: #517ee8;  
    }
    .nomargin {
        margin: 0;
    }
    a {
        text-decoration: none;
        color: #2b65ec;
        -webkit-transition: all .3s ease-in-out;
        transition: all .3s ease;
    }
    a:hover,
    a:focus {
        color: #517ee8;
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
    .instructions {
        color: white;
        margin-bottom: 60px;
        display: none;
    }
</style>
    <title>Title - Recover Account</title>
</head>
<body>
<h1 class="title">
    StandardLogin 4 - Recover
</h1>
<section class="wrapper">
	<section class="content">
    <form name="recover" action="uauth.php" method="post">
        <p class="instructions">
            Please enter your email address below and we'll send you instructions on how to set a new password.
        </p>
        <div class="inputbar nosel">
			<label class="userlabel">
				<input name="email" class="userinfo" id="email" type="text" autofocus>
				<span class="placeholder-userinfo nosel">Email</span>
				<div class="input-underline"></div>
				<div class="error"><div class="error-message">Invalid Email Address</div></div>
			</label>
		</div>
        <section class="inputbar nosel nomargin">
            <button class="btn btn-submit" type="submit">Send Recovery Email</button>
        </section>
        <div class="inputbar">
            <a href="login">Login</a>
            <a href="register">Create an Account</a>
        </div>
    </form>
	</section>
</section>
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
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