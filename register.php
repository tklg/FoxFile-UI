<?php
session_start();
require ('includes/config.php');

if (!isset($_SESSION['mode'])) {
	$_SESSION['mode'] = 'guest';
}
if(!isset($_SESSION['uid'])) {
	$_SESSION['uid'] = 0;
}
if(!isset($_SESSION['access_level'])) {
	$_SESSION['access_level'] = 0;
}
//error_reporting(0);//remove for debug
$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$starttime = $time;
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <title>D&amp;D 1e CSM - Register</title>
	<link rel="stylesheet" href="css/fonts.css">
    <link rel="stylesheet" href="css/dndcsm.css">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">

	<!-- <link rel="stylesheet" href="css/bootstrap.min.css"> -->
	<link rel="stylesheet" href="css/font-awesome.min.css">
    <style type="text/css">
	#wrapper {
        width: 250px;
        height: 600px;
        position: absolute;
        left: 0;right: 0;top:0;bottom:0;margin: auto;
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
    .login-content {
        background: rgba(255,255,255,.1);
        border: none;
        padding: 2px 0;
        text-indent: 2px;
    }
    .btn-submit {
        background: rgba(255,255,255,.2);
        border: none;
        padding: 5px;
        margin-top: 10px;
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
    background: rgba(255,255,255,.3);
	}
	.uname-val {
		float: right;
	    position: relative;
	    margin: -15px 2px 0px 0px;
	    font-size: 14px;
	    color: rgba(0,0,0,0);
	}
    </style>

    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/app.js"></script>
  </head>
<body>

	<div class="alertbox"></div>

	<div id="wrapper">
	
		<p class="loginpage-title" style="margin-top: 40px"><?php echo $title; ?></p>
		<p>
			<label class="login-content-title" for="uname"><i class="fa fa-user"></i> Username</label>
			<input class="login-content" name="unamesub" type="text" id="uname" value="" placeholder="Username" required onBlur="check_availability()">
			<i class="fa fa-check-square uname-val" id="namevalid"></i>
		</p>
		<p>				
			<label class="login-content-title" for="upass"><i class="fa fa-unlock-alt"></i> Password</label>
			<input class="login-content" name="upasssub" type="password" id="upass" placeholder="Password" required>
			<i class="fa fa-check-square uname-val" id="passvalid"></i>
		</p>
		<p>
			<label class="login-content-title" for="upass2" id="passlab2"><i class="fa fa-unlock-alt"></i> Repeat password</label>
			<input class="login-content" name="upasssub2" type="password" id="upass2" placeholder="Password" required >
			<i class="fa fa-check-square uname-val" id="passvalid2"></i>
		</p>
		<?php if($useGroupPassword) { ?>
		<p>				
			<label class="login-content-title" for="upass"><i class="fa fa-unlock-alt"></i> Group Password</label>
			<input class="login-content" name="gpasssub" type="password" id="gpass" placeholder="Group Password">
		</p>
		<?php } else { ?>
			<input type="hidden" id="gpass">
		<?php } ?>

		<button type="submit" name="login" class="btn btn-submit" onclick="check_validity()"><b>Register</b></button>
		<button class="btn btn-submit" onclick="document.location = 'login.php'">or Log In</button>

	</div>

	<script type="text/javascript">
	function check_availability() {  

        var username = $('#uname').val(); 

        if(username.length > 0)  {
  
	        $.post("uauth.php", { 
	        	check_username: 'yes',
	        	username: username
	        	},  
	            function(result) {  
	                if (result == 1) {  
	                    $('#namevalid').css('color','#99c68e') //light green
						.removeClass('fa-exclamation-triangle')
						.addClass('fa-check-square'); 
	                } else {  
	                    $('#namevalid').css('color','#e77471') //light red
						.removeClass('fa-check-square')
						.addClass('fa-exclamation-triangle');
	                }  
	        });  
	    }
	}
	var uavail = false;
	var pavail = false;

	$('#upass, #upass2').on('input', function checkPass() {
		
		if ($('#upass').val().length >= 8) {
			$('#passvalid').css('color','#99c68e') //light green
					.removeClass('fa-exclamation-triangle')
					.addClass('fa-check-square');
			if ($('#upass').val() == $('#upass2').val()) {
				$('#passvalid, #passvalid2').css('color','#99c68e') //light green
					.removeClass('fa-exclamation-triangle')
					.addClass('fa-check-square'); 
				d.info("Passwords match.");
				pavail = true;
			} else {
				$('#passvalid2').css('color','#e77471') //light red
					.removeClass('fa-check-square')
					.addClass('fa-exclamation-triangle');
				d.warning('Passwords do not match.');
				pavail = false;
			}
		} else {
			$('#passvalid').css('color','#e77471') //light red
					.removeClass('fa-check-square')
					.addClass('fa-exclamation-triangle');
			d.warning("Password must be at least 8 characters.");
			pavail = false;
		}
	});
	function check_validity() {
		var username = $('#uname').val(),
			password = $('#upass').val(),
			gPass = $('#gpass').val();

		if (username.length > 0 && pavail) {
		d.info("Checking validity...");
			$.post("uauth.php", {
				register: 'yes',
				username: username,
				password: password,
				group_password: gPass
			},
			function (result) {
				if (result == 'valid') {
					$('#namevalid').css('color','#99c68e') //light green
						.removeClass('fa-exclamation-triangle')
						.addClass('fa-check-square');
					$('#passvalid').css('color','#99c68e') //light green
						.removeClass('fa-exclamation-triangle')
						.addClass('fa-check-square');
					d.success("Creating account...");
					setTimeout(function() {
						document.location = 'login.php';
					}, 1000);
				} else {
					console.log(result);
					d.error(result);
				}
			});
		} else {
			d.warning("Please fill in all fields.");
		}
	}
	</script>

	<?php
    	include('includes/footer.php');
  	?>

	<?php
	$time = microtime();
	$time = explode(' ', $time);
	$time = $time[1] + $time[0];
	$finishtime = $time;
	$total_time = round(($finishtime - $starttime), 4);
	if ($showpageloadtime) {
		echo '<script type="text/javascript">$("#loadtime").html("page generated in ' . $total_time . ' seconds.");</script>';
	}
	?>

</body>
</html>
