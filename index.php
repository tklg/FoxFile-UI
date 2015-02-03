<?php
session_start();
require ('includes/config.php');
if(!isset($_SESSION['uid'])) {
	$_SESSION['uid'] = 0;
}
if(!isset($_SESSION['access_level'])) {
	$_SESSION['access_level'] = 0;
}
//error_reporting($show_errors);//remove for debug
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
    <title><?php echo $title ?></title>
    <?php require('includes/header.php'); ?>
    <style type="text/css">
    <?php if (!$allowsharing) { ?>
    	.clickmenu li:last-of-type {
    		display: none;
    	}
    <?php } ?>
    </style>

</head>
<body>
<?php if ($show_debug) { ?>
	<div style="z-index:100;color:#fff;font-size:9pt; position:fixed; bottom: 10px; left: 10px; padding: 10px; border-radius: 5px; background:rgba(255,255,255,.1)">
		<span>DEBUG:</span><br><hr>
		UUID: <?php echo $_SESSION['uid']; ?><br>
		ACCESS_LEVEL: <?php echo $_SESSION['access_level']; ?><br>
		DIR: <span class="debug" id="dir">My Files</span>
	</div>
<?php } ?>
	<div class="alertbox"></div>

	<div id="wrapper">

	<section class="bar bar-vertical bar-main tabs" id="bar-1">
	<div class="title menubar-title"><?php echo $name . ' ' . $ver ?></div>
	<div class="menubar menubar-left tab-links">
	<ul>
		<li class="menubar-content menubar-content-user menubar-content-active" id="menubar-button-1" onclick="d.success($(this).text())">user.name</li>
		<li class="menubar-content menubar-content-main menubar-content-active" container="1" id="menubar-button-files" type="folder" onclick="files.open('home_dir', $(this).text(), $(this).attr('container'), $(this).attr('type'));" href="#my-files">My Files</li>
		<?php if($allowsharing) {?><li class="menubar-content menubar-content-main" id="menubar-button-shared" href="#shared-files">Shared</li> <?php } ?>
		<li class="menubar-content menubar-content-main" id="menubar-button-bookmarks" href="#bookmarks">Bookmarks</li>
		<li class="menubar-content menubar-content-main" id="menubar-button-account" href="#account">Account</li>
		<li class="menubar-content menubar-content-main" id="menubar-button-account" href="#settings">Settings</li>
	</ul>
	</div>
	</section>

	<section class="bar bar-vertical bar-full bar-orig" id="bar-2" type="folder" state="closed" filename="home_directory">
	<div class="menubar-title"><span class="heightsettertext"></span><i class="bar-backbutton btn fa fa-angle-left"></i><span class="menubar-title-link btn">My Files</span></div>
	<div class="menubar menubar-left">
	<ul>
	</ul>
	</div>
	</section>

	</div>

	<?php
	if ($showfooter) include('includes/footer.php');
  	?>

	<script type="text/template" id="folder_template">
    <li class="menubar-content" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" onclick="<%= model.get('onclick') %>" pos="">
		<span class="folder file-name"><%= model.get('fileName') %></span>
		<div class="file-info">
			<span class="file-info-item" id="filesize"><span class="filetype"><%= model.get('fileType') %></span><br><%= model.get('fileSize') %></span>
		</div>
	</li>
	</script>
	<script type="text/template" id="file_template">
    <li class="menubar-content-view" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="">
		<div class="file-view"></div>
		<!--<span class="folder file-name"><%= model.get('fileName') %></span>-->
		<div class="file-info">
			<span class="file-info-item" id="filesize"><span class="filetype"><%= model.get('fileType') %></span><br><%= model.get('fileSize') %></span>
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
	<script type="text/javascript" src="js/jquery.min.js"></script>
    <script type="text/javascript" src="js/underscore.min.js"></script>
    <script type="text/javascript" src="js/backbone.min.js"></script>
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
			BCL.start(2, 'home_dir', 'folder');
		}
	}

	if ($('.footer').height() > 0) {
		$(".alertbox").css("bottom", 60);
	} else {
		$(".alertbox").css("bottom", 20);
	}

	$(document).ready(function() {
	   	$('.tabs .tab-links li').on('click', function(e)  {
	        var currentAttrValue = $(this).attr('href');
	        // Show/Hide Tabs
	        $('.tabs ' + currentAttrValue).show().siblings().hide();
	        // Change/remove current tab to active
	        $(this).parent('li').addClass('active').siblings().removeClass('active');
	        e.preventDefault();
	    });
	    init.resize();
		clickMenu.rebind();
	});
	</script>
    <script type="text/javascript" src="js/showlog.js"></script>
    <script type="text/javascript" src="js/foxfile.js"></script>
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
