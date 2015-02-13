<?php
session_start();
require ('includes/config.php');
if(!isset($_SESSION['uid'])) {
	$_SESSION['uid'] = 0;
}
if(!isset($_SESSION['access_level'])) {
	$_SESSION['access_level'] = 0;
}
if(!isset($_SESSION['username'])) {
	$_SESSION['username'] = 'Default_User';
}
$uid = $_SESSION['uid'];
$alvl = $_SESSION['access_level'];
$uname = $_SESSION['username'];
//error_reporting($show_errors);//remove for debug
$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$starttime = $time;
if ($uid < 1 && !isset($_GET['nouser'])) {
	header("Location: login.php");
	die();
}
?>
<!DOCTYPE html>
<html lang="en">
<!--
 * index.php - FoxFile
 * (C) Theodore Kluge 2014-2015
 * http://kluge.ninja
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
		UUID: <?php echo $_SESSION['uid']; ?> (<?php echo $uname ?>)<br>
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
		<li class="menubar-content menubar-content-user menubar-content-user-name menubar-content-active" id="menubar-button-1"><span id="display_name"><?php echo $uname ?></span><a href="uauth.php?logout" class="btn btn-logout"><i class="fa fa-sign-out"></i></a></li>
		<li class="menubar-content menubar-content-main menubar-content-active" container="1" id="menubar-button-files" type="folder" onclick="files.open('home_dir', $(this).text(), $(this).attr('container'), $(this).attr('type'));" href="#my-files">My Files</li>
		<?php if($allowsharing) {?><li class="menubar-content menubar-content-main" id="menubar-button-shared" href="#shared-files">Shared</li> <?php } ?>
		<li class="menubar-content menubar-content-main" id="menubar-button-bookmarks" href="#bookmarks">Bookmarks</li>
		<li class="menubar-content menubar-content-main" id="menubar-button-account" href="#account">Account</li>
		<li class="menubar-content menubar-content-main" id="menubar-button-account" href="#settings">Settings</li>
	</ul>
	</div>
	</section>

	</div>

	<?php
	if ($showfooter) include('includes/footer.php');
  	?>

	<script type="text/template" id="folder_template">
    <li class="menubar-content" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" onclick="<%= model.get('onclick') %>" pos="">
		<span class="folder file-name"><%= model.get('fileName') %></span>
		<div class="file-info">
			<span class="file-info-item" id="filesize"><span class="filetype"><%= model.get('fileType') %></span><br><%= model.get('fileSize') %></span>
		</div>
	</li>
	</script>
	<script type="text/template" id="file_template">
    <li class="menubar-content-view" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="">
		<div class="file-view"></div>
		<div class="file-info">
			<span class="file-info-item" id="filesize"><span class="filetype"><%= model.get('fileType') %></span><br><%= model.get('fileSize') %></span>
		</div>
	</li>
	</script>

	<section class="modal-background modal-new-folder">
	<div class="modal">
		<div class="modal-header">
			Create new folder in <span id="modal-header-name">FOLDER</span>?
		</div>
		<div class="modal-content">
			Folder name:<br>
			<input class="modal-content-input" id="modal-file-name-new" type="text" name="newfoldername">
			<input id="modal-file-id-new" type="hidden">
			<input id="modal-bar-id-new" type="hidden">
		</div>
		<div class="modal-footer">
			<button class="btn btn-cancel" onclick="files.newFolderGUI.hide()">Cancel</button>
			<button class="btn btn-submit" onclick="files.newFolder($('#modal-file-name-new').val(), $('.modal-new-folder #modal-file-id-new').val(), $('.modal-new-folder #modal-bar-id-new').val())">Create</button>
		</div>
	</div>
	</section>
	<section class="modal-background modal-rename">
	<div class="modal">
		<div class="modal-header">
			Rename <span id="modal-header-name">FOLDER</span>?
		</div>
		<div class="modal-content">
			New name:<br>
			<input class="modal-content-input" id="modal-file-name-rename" type="text" name="newfoldername">
			<input id="modal-file-id-rename" type="hidden">
			<input id="modal-bar-id-rename" type="hidden">
		</div>
		<div class="modal-footer">
			<button class="btn btn-cancel" onclick="files.renameGUI.hide()">Cancel</button>
			<button class="btn btn-submit" onclick="files.rename($('#modal-file-name-rename').val(), $('.modal-rename #modal-file-id-rename').val(), $('.modal-rename #modal-bar-id-rename').val())">Rename</button>
		</div>
	</div>
	</section>
	<section class="modal-background modal-delete">
	<div class="modal">
		<div class="modal-header">
			Are you sure you want to delete <span id="modal-header-name">FOLDER</span>?
		</div>
		<div class="modal-content">
			You can't undo this.
			<input id="modal-file-id-delete" type="hidden">
			<input id="modal-bar-id-delete" type="hidden">
		</div>
		<div class="modal-footer">
			<button class="btn btn-cancel" onclick="files.deleteGUI.hide()">Cancel</button>
			<button class="btn btn-submit" onclick="files.delete($('#modal-file-name-delete').val(), $('.modal-delete #modal-file-id-delete').val(), $('.modal-delete #modal-bar-id-delete').val())">Delete</button>
		</div>
	</div>
	</section>
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
			//BCL.start(2, 'home_dir', 'folder');
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
	        //e.preventDefault();
	    });


	    init.resize();
		clickMenu.rebind();
		names.get(<?php echo $_SESSION['uid']; ?>);
		files.open('home_dir', 'My Files', 1, 'folder');

	});

	//files.open('home_dir', 'My Files', 1, 'folder');
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
