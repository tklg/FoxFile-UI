<?php
session_start();
require ('includes/config.php');
if(!isset($_SESSION['uid'])) {
	$_SESSION['uid'] = 0;
}
if(!isset($_SESSION['access_level'])) {
	$_SESSION['access_level'] = 0;
}
error_reporting($show_errors);//remove for debug
$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$starttime = $time;
?>

<!DOCTYPE html>
<html lang="en">
<!--
 * index.php - FoxFile
 * (C) Theodore Kluge 2014-2015
 * villa7.github.io
 -->
<head>
    <title>FoxFile Άλφα v1.0</title>
	<link rel="stylesheet" href="css/fonts.css">
    <link rel="stylesheet" href="css/foxfile.css">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">

	<!-- <link rel="stylesheet" href="css/bootstrap.min.css"> -->
	<link rel="stylesheet" href="css/font-awesome.min.css">
    <style type="text/css">

    </style>

</head>
<body>
<?php if ($show_debug) { ?>
	<div style="z-index:100;color:#fff;font-size:9pt; position:fixed; bottom: 10px; left: 10px; padding: 10px; border-radius: 5px; background:rgba(255,255,255,.1)">
		<span>DEBUG:</span><br><hr>
		UUID: <?php echo $_SESSION['uid']; ?><br>
		ACCESS_LEVEL: <?php echo $_SESSION['access_level']; ?><br>
		FOLDER: file.directory
	</div>
<?php } ?>
	<div class="alertbox"></div>

	<div id="wrapper">

	<section class="bar bar-vertical bar-main" id="bar-1">
	<div class="title menubar-title">FoxFile v1.0a</div>
	<div class="menubar menubar-left">
	<ul>
		<li class="menubar-content menubar-content-user menubar-content-active" id="menubar-button-1" onclick="d.success($(this).text())">user.name</li>
		<li class="menubar-content menubar-content-main menubar-content-active" container="1" id="menubar-button-files" onclick="files.open('backbonetest.json', 'example_hash_self', $(this).text(), $(this).attr('container'));">My Files</li>
		<?php if($allowsharing) {?><li class="menubar-content menubar-content-main" id="menubar-button-shared" onclick="d.error($(this).text())">Shared</li> <?php } ?>
		<li class="menubar-content menubar-content-main" id="menubar-button-bookmarks" onclick="d.warning($(this).text())">Bookmarks</li>
		<li class="menubar-content menubar-content-main" id="menubar-button-account" onclick="d.success($(this).text())">Account</li>
		<li class="menubar-content menubar-content-main" id="menubar-button-account" onclick="d.success($(this).text())">Settings</li>
	</ul>
	</div>
	</section>

	<section class="bar bar-vertical bar-full bar-orig" id="bar-2" type="folder" state="closed">
	<div class="menubar-title"><span class="heightsettertext"></span><!-- <i class="fa fa-caret-left"></i> --><span class="menubar-title-link">My Files</span></div>
	<div class="menubar menubar-left">
	<ul>
	</ul>
	</div>
	</section>


	</div>

	<?php
	if ($showfooter) include('includes/footer.php');
  	?>

	<script type="text/javascript">
	var init = {
		resize: function() {
			var title = {
				fontSize: 20,
				fontSpacing: 5,
				fontTotalWidth: $('.title').width(),
				fontLetterWidth: $('.title').width() / $('.title').text().length
			}
			var width = {
				titleBox: $('.title').width(),
				titleText: title.fontTotalWidth,
				titleLetterSpacing: $('.title').width() / (($('.title').text().length - 1) * 4.2)
			}
			$('.title, .heightsettertext').css({
				'font-size': title.fontLetterWidth + 'pt',
				'letter-spacing': width.titleLetterSpacing + 'pt'
			})
		},
		loadFiles: function() {
			BCL = new BarContentLoader();
			BCL.start('backbonetest.json', 2, 'file_key', 'parent_key');
		}
	}
	init.resize();
	</script>
	<script type="text/template" id="folder_template">
    <li class="menubar-content" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" onclick="<%= model.get('onclick') %>" pos="">
		<span class="folder file-name"><%= model.get('fileName') %></span>
		<div class="file-info">
			<span class="file-info-item" id="filetype"><%= model.get('fileType') %></span> 
			<span class="file-info-item" id="filesize"><%= model.get('fileSize') %></span>
		</div>
	</li>
	</script>
	<script type="text/template" id="file_template">
    <li class="menubar-content" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" onclick="<%= model.get('onclick') %>" pos="">
		<span class="folder file-name"><%= model.get('fileName') %></span>
		<div class="file-info">
			<span class="file-info-item" id="filetype"><%= model.get('fileType') %></span> 
			<span class="file-info-item" id="filesize"><%= model.get('fileSize') %></span>
		</div>
	</li>
	</script>
	<!--<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-48081162-1', 'villa7.github.io');
	  ga('send', 'pageview');

	</script> -->
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min.js"></script>
    <script type="text/javascript" src="js/showlog.js"></script>
    <script type="text/javascript" src="js/foxfile.js"></script>
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
