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
    <title>FoxFile Άλφα</title>
	<link rel="stylesheet" href="css/fonts.css">
    <link rel="stylesheet" href="css/foxfile.css">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">

	<!-- <link rel="stylesheet" href="css/bootstrap.min.css"> -->
	<link rel="stylesheet" href="css/font-awesome.min.css">
    <style type="text/css">

    </style>

    <script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/foxfile.js"></script>
    <script type="text/javascript" src="js/showlog.js"></script>

  </head>
<body>
	<div style="font-size:10px; position:fixed; top: 10px; right: 10px; padding: 10px; border-radius: 5px; background:rgba(255,255,255,.1)">
		<p><span>DEBUG:</span><br>
		SESSION_MODE: <?php echo $_SESSION['mode']; ?><br>
		ACCESS_LEVEL: <?php echo $_SESSION['access_level']; ?><br>
		UID: <?php echo $_SESSION['uid']; ?>
		</p>
	</div>

	<div class="alertbox"></div>

	<div id="wrapper">

	<section class="bar bar-vertical bar-main" id="bar-1">
	<div class="title menubar-title">FoxFile v1.0a</div>
	<div class="menubar menubar-left">
	<ul>
		<li class="menubar-content menubar-content-user" onclick="d.success($(this).text())">user.name</li>
		<li class="menubar-content menubar-content-main menubar-content-active" onclick="d.info($(this).text())">Home Directory Name</li>
		<li class="menubar-content menubar-content-main" onclick="d.error($(this).text())">Shared</li>
		<li class="menubar-content menubar-content-main" onclick="d.warning($(this).text())">Bookmarks</li>
		<li class="menubar-content menubar-content-main" onclick="d.success($(this).text())">Account</li>
	</ul>
	</div>
	</section>

	<section class="bar bar-vertical bar-full bar-orig" id="bar-2">
	<div class="menubar-title"><i class="fa fa-folder-open-o"></i> Home Directory Name</div>
	<div class="menubar menubar-left">
	<ul>
		<li class="menubar-content" type="file" onclick="d.info($(this).text())">
		<div class="file file-name">File in home directory.txt</div>
		<span class="file file-info" id="filetype">Text File</span> 
		<span class="file-info file-info-divider">::</span>
		<span class="file file-info" id="filesize">0.00 MB</span>
		</li>
		<li class="menubar-content" type="folder" onclick="d.info($(this).text())">
		<div class="folder file-name">Folder in home directory</div>
		<span class="file file-info" id="filetype">Folder</span>
		<span class="file-info file-info-divider">::</span>
		<span class="folder file-info" id="foldersize">0 Items</span>
		</li>
		<li class="menubar-content" type="folder" onclick="d.info($(this).text())">
		<div class="folder file-name">File in home directory.zip</div>
		<span class="file file-info" id="filetype">Zip File</span>
		<span class="file-info file-info-divider">::</span>
		<span class="folder file-info" id="foldersize">0 Items</span>
		</li>
	</ul>
	</div>
	</section>

	</div>

	<?php
	if ($showfooter) include('includes/footer.php');
  	?>

	<!--<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-48081162-1', 'villa7.github.io');
	  ga('send', 'pageview');

	</script> -->
	<script type="text/javascript">
		if ($('.footer').height() > 0) {
			$(".alertbox").css("bottom", 60);
		} else {
			$(".alertbox").css("bottom", 20);
		}

		init.resize();
	</script>
	<?php
	$time = microtime();
	$time = explode(' ', $time);
	$time = $time[1] + $time[0];
	$finishtime = $time;
	$total_time = round(($finishtime - $starttime), 4);
	if ($showpageloadtime && $showfooter) {
		echo '<script type="text/javascript">$("#loadtime").html("page generated in ' . $total_time . ' seconds.");</script>';
	}
	?>

</body>
</html>
