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
    html, body {
    	height: 100%;
    	width: 100%;
    	padding: 0;
    	margin: 0;
    	color: #ccc;
		font-family: sans-serif;
		-webkit-font-smoothing: antialiased;
		background: #222;
		overflow: hidden;
    }
    a {
		text-decoration: none;
		color: rgb(250, 101, 0);
		-webkit-transition: all .1s ease-in-out;
	            transition: all .1s ease-in-out;
	}
	a:hover {
		color: #ccc;
	}
	::selection {
		background: rgba(255,255,255,.1);
	}
    #wrapper {
    	height: 50%;
    	width: 50%;
    	position: absolute;
    	top: 0; bottom: 0; left: 0; right: 0;
    	margin: auto;
    }
    .errornumber {
    	font-size: 100pt;
    	padding: 0;
    	margin: 0;
    	/*font-family: 'quicksandlight', sans-serif;*/
    }
    .errornumber::first-letter {
    	color: rgb(250, 101, 0);
    }
    .errordesc {
    	margin: 0;
    }
    </style>

    <script type="text/javascript" src="js/jquery.min.js"></script>
  </head>
<body>

	<?php
	$er = 'Error';
	$de = 'Something is wrong and we don\'t know what.';
	if(isset($_GET['404'])) {$er = '404'; $de = 'The requested page does not exist.';}
	if(isset($_GET['500'])) {$er = '500'; $de = 'Something is broken!';}
	if(isset($_GET['403'])) {$er = '403'; $de = 'Access is forbidden.';}
	if(isset($_GET['418'])) {$er = '418'; $de = 'I\'m a teapot.<br><br>The resulting entity body is short and stout.<br>Tip me over and pour me out.';}
	if(isset($_GET['502'])) {$er = '502'; $de = 'Bad gateway.';}
	?>
	<div id="wrapper">
	<p class="errornumber">
	<?php
	echo $er;
	?>
	</p>
	<p class="errordesc">
	<?php
	echo $de;
	?>
	</p>
	<p class="errorsol">
	<a href="/foxfile/index">Return to Home</a> or <a onclick="window.history.back()" style="cursor:pointer">Go Back</a>
	</p>
	</div>

	<?php
	if ($showfooter) include('includes/footer.php');
  	?>
  	<script type="text/javascript" src="js/showlog.js"></script>
    <!-- <script type="text/javascript" src="js/foxfile.js"></script> -->
    <script type="text/javascript">
    <?php
    if(isset($_GET['404'])) echo 'var code = 404;';
	if(isset($_GET['500'])) echo 'var code = 500;';
	if(isset($_GET['403'])) echo 'var code = 403;';
	?>
    document.title = 'Error ' + code;
    </script>

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
	<a style="display:none;" href="blackhole/" rel="nofollow">Do NOT follow this link or you will be banned from the site!</a>

</body>
</html>
