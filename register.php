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
    <title><?php echo $title ?></title>
    <?php require('includes/header.php'); ?>
    <style type="text/css">
	#wrapper {
        width: 320px;
        top: 50px;
        height: auto;
        position: absolute;
        left: 0;right: 0;margin: auto;
        font-family: 'quicksandlight', sans-serif;
    }
    .loginpage-title {
    	font-size: 200%;
    }
    .login-content-title-desc {
    	font-size: 45%;
    	color: #aaa;
    	padding-top: -10px;
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
        padding: 4px 0;
        text-indent: 5px;
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

  </head>
<body>

	<div class="alertbox"></div>

	<div id="wrapper">
	
		<p class="loginpage-title">Welcome to <?php echo $name; ?></p>
		<p>
			<label class="login-content-title" for="uname"><i class="fa fa-user"></i> Username</label><!-- <br>
			<label class="login-content-title login-content-title-desc" for="uname"> The name you will use to log in.</label> -->
			<input class="login-content" name="unamesub" type="text" id="uname" value="" placeholder="Username" required onBlur="check_availability()">
		</p>
		<p>				
			<label class="login-content-title" for="upass"><i class="fa fa-unlock-alt"></i> Password</label>
			<input class="login-content" name="upasssub" type="password" id="upass" placeholder="Password" required>
		</p>
		<p>
			<label class="login-content-title" for="upass2" id="passlab2"><i class="fa fa-unlock-alt"></i> Repeat password</label>
			<input class="login-content" name="upasssub2" type="password" id="upass2" placeholder="Password" required >
		</p>
		<?php if($useGroupPassword) { ?>
		<p>				
			<label class="login-content-title" for="upass"><i class="fa fa-unlock-alt"></i> Group Password</label>
			<input class="login-content" name="gpasssub" type="password" id="gpass" placeholder="Group Password">
		</p>
		<?php } else { ?>
			<input type="hidden" id="gpass">
		<?php } ?>
		<p>
			<label class="login-content-title" for="uemail"><i class="fa fa-envelope"></i> Email</label>
			<input class="login-content" name="uemailsub" type="text" id="uemail" value="" placeholder="Email" required onBlur="check_email()">
		</p>

		<button type="submit" name="login" class="btn btn-submit" onclick="check_validity()"><b>Register</b></button>
		<button class="btn btn-submit" onclick="document.location = 'login'">or Log In</button>

	</div>

	<script type="text/javascript">
	var uavail = false;
	function check_availability() {  

        var username = $('#uname').val(); 

        if(username.length > 0)  {
  
	        $.post("uauth.php", { 
	        	check_username: 'yes',
	        	username: username
	        	},  
	            function(result) {  
	                if (result == 1) {  
	                    $('#uname').css('border','#99c68e solid 1px');
						uavail = true;
	                } else {  
	                    $('#uname').css('border','#e77471 solid 1px');
						uavail = false;
						if (result != 0) {
							d.warning(result);
						}
	                }  
	        });  
	    }
	}
	var pavail = false;

	$('#upass, #upass2').on('input', function checkPass() {
		
		if ($('#upass').val().length >= 8) {
			$('#upass').css('border','#99c68e solid 1px');;
			if ($('#upass').val() == $('#upass2').val()) {
				$('#upass2').css('border','#99c68e solid 1px');
				pavail = true;
			} else {
				$('#upass2').css('border','#e77471 solid 1px');
				pavail = false;
			}
		} else {
			$('#upass').css('border','#e77471 solid 1px');
			pavail = false;
		}
	});
	function check_validity() {
		var username = $('#uname').val(),
			password = $('#upass').val(),
			gPass = $('#gpass').val(),
			email = $('#uemail').val();

		if (!(username.length > 0)) {
			d.warning("Username cannot be blank.");
		} else if (!pavail) {
			if (!($('#upass').val().length >= 8)) {
				d.warning("Password must be at least 8 characters.");
			} else if ($('#upass').val() != $('#upass2').val()) {
				d.warning('Passwords do not match.');
			} else {
				d.warning("Please fill in all fields.");
			}
		} else if (!uavail) {
			d.warning("Username is not available.");
		} else {
			d.info("Checking validity...");
				$.post("uauth.php", {
					register: 'yes',
					username: username,
					password: password,
					email: email,
					group_password: gPass
				},
				function (result) {
					if (result == 'valid') {
						$('#uname').css('border','#99c68e solid 1px');
						$('#upass, #upass2, #gpass').css('border','#99c68e solid 1px');
						d.success("Creating account...");
						setTimeout(function() {
							document.location = 'login.php';
						}, 1000);
					} else if (result == "Username is not available") {
						d.error(result);
						$('#uname').css('border','#e77471 solid 1px');
					} else if (result.indexOf("Invalid group password") >= 1) {
						d.error(result);
						$('#gpass').css('border','#e77471 solid 1px');
					} else {
						d.error(result);
						$('#uname').css('border','#e77471 solid 1px');
					}
				});
			}
		}
	if ($('.footer').height() > 0) {
		$(".alertbox").css("bottom", 60);
	} else {
		$(".alertbox").css("bottom", 20);
	}
	</script>
	<script type="text/javascript" src="js/showlog.js"></script>
    <script type="text/javascript" src="js/foxfile.js"></script>

	<?php
	if ($showfooter) include('includes/footer.php');
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
	<a style="display:none" href="blackhole/" rel="nofollow">Do NOT follow this link or you will be banned from the site!</a>

</body>
</html>
