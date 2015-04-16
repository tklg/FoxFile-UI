<?php
session_start();
require ('includes/config.php');
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
		top: 50px;
        width: 300px;
        height: auto;
        position: absolute;
        left: 0;right: 0;margin: auto;
        font-family: 'quicksandlight', sans-serif;
    }
    .loginpage-title {
    	font-size: 200%;
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
        border: 1px solid transparent;
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
	}
	.login-user .login-user-message {
		width: 100%;
		text-align: center;
	}
    </style>

    <script type="text/javascript" src="js/jquery.min.js"></script>
  </head>
<body>

	<div class="alertbox"></div>

	<div id="wrapper">
	
		<p class="loginpage-title" style="margin-top: 40px"><?php echo $name; ?> Login</p>
		<p class="login-nouser">
			<label class="login-content-title" for="uname"><i class="fa fa-user"></i> Username</label>
			<input class="login-content" name="unamesub" type="text" id="uname" value="" placeholder="Username" required onBlur="check_availability()" />
		</p>
		<div class="login-user login-user-show">
			<img src="http://placehold.it/100x100" />
			<input class="login-content" name="unamesub" type="hidden" id="uname2" value="" />
			<div class="login-user-message">USERNAME</div>
		</div>
		<p>				
			<label class="login-content-title" for="upass"><i class="fa fa-unlock-alt"></i> Password</label>
			<input class="login-content" name="upasssub" type="password" id="upass" placeholder="Password" required >
		</p>

		<button type="submit" name="login" class="btn btn-submit" onclick="check_validity()"><b>Login</b></button>
		<div class="link sulink">Need an account? <a href="register">Sign Up!</a></div>
		<div class="link sulinksub login-user-show">Not you? <a href="#" onclick="removeUser()">Change User</a></div>

	</div>

	<script type="text/javascript">
	var uexists = false;
	var using_cookie = false;
	function check_availability() {  

        var username = $('#uname').val();

        if(username.length > 0) {
  
	        $.post("uauth.php", { 
	        	check_username: 'yes',
	        	username: username
	        	},  
	            function(result) {  
	                if (result == 0) {  
	                    $('#uname').css('border','#99c68e solid 1px'); //light green
				        setCookie("username", username, 28);
	                    uexists = true;
	                } else {  
	                    $('#uname').css('border','#e77471 solid 1px'); //light red
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
			}
		if (username.length < 1 || password.length < 1) {
			d.warning("Please fill in both fields.");
		} else {
			if (uexists) {
				d.info("Checking validity...");
				$.post("uauth.php", {
					login: 'yes',
					username: username,
					password: password
				},
				function (result) {
					if (result == 'valid') {
						$('#uname').css('border','#99c68e solid 1px');
						$('#upass').css('border','#99c68e solid 1px');
						//d.info("Valid!");
						d.success("Logging in...");
						setTimeout(function() {
							document.location = '<?php if(isset($_GET["target"])) {echo $_GET["target"];} else {echo "browse";}?>';
						}, 1000);
					} else {
						$('#pass').css('border','#e77471 solid 1px')
						console.info(result);
						d.error(result);
					}
				});
			} else {
				d.error("Username not found.");
			}
		}
	}
	if ($('.footer').height() > 0) {
		$(".alertbox").css("bottom", 60);
	} else {
		$(".alertbox").css("bottom", 20);
	}
	$('#uname').focus();
	$(document).keydown(function(e) {
		if (e.keyCode == 13) { //enter
            check_availability()
			$('.btn-submit').click();
		}
	});

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
		setCookie('username', '', 28);
		location.reload();
	}
	$(document).ready(function() {
		var u = getCookie("username");
	    if (u != null && u != "") {
	        using_cookie = true;
	        $('#uname2').val(u);
	        $('.login-user-message').text(u);
	        $.post('dbquery.php', {
				get_user_photo: u
			}, function(result) {
				if (result != 1) {
					$('.login-user-show img').attr('src', result);
				} else {
					d.error("Failed to retrieve photo for " + username);
				}
				files.refresh(bar);
				files.deleteGUI.hide();
			});
	        $('.login-user-show').css("display", 'block');
	        $('.login-nouser').css("display", 'none');
	        $('#upass').focus();
	    }
	});
</script>

	<?php
	if ($showfooter) include('includes/footer.php');
  	?>
  	<script type="text/javascript" src="js/showlog.js"></script>
    <script type="text/javascript" src="js/foxfile.js"></script>

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
