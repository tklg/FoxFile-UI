<?php
session_start();
include 'includes/cfgvars.php';
/*if (!isset ($_SESSION['access_token'])) header ("Location: login");
$userphoto = $_SESSION['foxfile_user_picture'];
$username = $_SESSION['foxfile_user_name'];*/
?>
<!DOCTYPE html>
<html lang="en">
<!--
	
                                                              
   ad88                             ad88  88  88              
  d8"                              d8"    ""  88              
  88                               88         88              
MM88MMM  ,adPPYba,  8b,     ,d8  MM88MMM  88  88   ,adPPYba,  
  88    a8"     "8a  `Y8, ,8P'     88     88  88  a8P_____88  
  88    8b       d8    )888(       88     88  88  8PP"""""""  
  88    "8a,   ,a8"  ,d8" "8b,     88     88  88  "8b,   ,aa  
  88     `"YbbdP"'  8P'     `Y8    88     88  88   `"Ybbd8"'  
                                                              
                                                              
	
	Foxfile : <?php echo basename(__FILE__); ?> 
	Version <?php echo $foxfile_version; ?> 
	Copyright (C) 2016 Theodore Kluge - All Rights Reserved
	http://tkluge.net

-->
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1">
    <title>FoxFile</title>
<!-- 	<link async href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"> -->
	<link async href='https://fonts.googleapis.com/css?family=Roboto:300' rel='stylesheet' type='text/css'>
	<link async rel="stylesheet" href="css/foxfile.css">
	<link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
	<link rel="icon" type="image/ico" href="favicon.ico">
		
	<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
    <script src="js/reloadr.js"></script>
    <script>
    Reloadr.go({
        client: [
            'js/foxfile.js',
            'css/foxfile.css'
        ],
        server: [
            '*.php'
        ],
        path: 'plugins/reloadr.php',
        frequency: 1000
    });
</script>
  </head>
<body>
<header class="main">
    <nav class="floatb-2" id="nav-header">
        <h1 class="logo-text"><span class="redfox">Fox</span>File</h1>
        <!-- <h1 class="logo-text"><span class="redfox">CTRL</span>V</h1> -->
        <form class="user-input-box file-search">
			<input class="user-input input-text input-search" type="text" id="search" />
			<label class="input-text-icon" for="search"><i class="mdi mdi-magnify"></i></label>
			<label class="input-text-placeholder" for="search">Search</label>
		</form>
        <ul class="nav nav-horiz" id="folder-controls">
            <li>Upload</li>
            <li>New folder</li>
            <!-- <li>Show deleted items</li> -->
            <li class="btn-more"><i class="mdi mdi-dots-horizontal"></i><span>More</span></li>
        </ul>
        <div class="user-menu">
        	<span class="user-menu-msg">Hello, username</span>
        	<img class="img user-menu-img" src="img/default_avatar.png" alt="user img" />
        </div>
    </nav>
    <nav class="floatb-2 nav-right" id="nav-right">
    	<ul class="nav nav-vert" id="user-controls">
            <li class="nav-vert-header nointeract">
            	<img class="img user-menu-img float" src="img/default_avatar.png" alt="user img" />
            	<div class="infobox">
	            	<span class="nav-header-name">firstname lastname</span>
	            	<span class="nav-header-email">email</span>
	            </div>
            </li>
            <hr class="nav-vert-divider">
            <li>Manage account</li>
            <li>Install desktop app</li>
            <li>Help</li>
            <hr class="nav-vert-divider">
            <li class="nav-vert-footer">Log out</li>
        </ul>
    </nav>
    <div class="nav-right-active-cover"></div>
</header>
<main>
	<section class="bar" id="bar-0" folder="menu">
		<header>
			<div class="infobox">
	           	<span class="header-name">firstname lastname</span>
	           	<span class="header-email">email</span>
	        </div>
		</header>
		<nav class="file-list">
			<ul class="">
				<li class="menubar-content floatb active">
					<i class="nocheckbox-icon mdi mdi-folder-multiple-outline"></i><span class="file-name">My files</span>
				</li>
				<li class="menubar-content floatb">
					<i class="nocheckbox-icon mdi mdi-account-multiple"></i><span class="file-name">Shared with me</span>
				</li>
				<li class="menubar-content floatb">
					<i class="nocheckbox-icon mdi mdi-delete"></i><span class="file-name">Trash</span>
				</li>
			</ul>
		</nav>
	</section>
	<section class="bar bar-active" id="bar-1" folder="root-files">
		<header>
			<h1>Folder name</h1>
			<section class="file-det-header">
				<span>Shared</span>
				<span>File info</span>
				<span>Modified</span>
			</section>
		</header>
		<nav class="file-list">
			<ul class="">
				<li class="menubar-content floatb" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="" fileparent="<%= model.get('hash_parent') %>">
					<div class="dragdrop-border"></div>
					<span class="file-multiselect-checkbox-container">
						<input type="checkbox" id="cb-0" value="abcdef" />
						<label class="label" for="cb-0"><i class="mdi mdi-checkbox-blank-outline"></i></label>
						<label class="label-checked" for="cb-0"><i class="mdi mdi-checkbox-marked"></i></label>
						<label class="label-icon" for="cb-0"><i class="mdi mdi-file-outline"></i></label>
					</span>
					<span class="file-name">File name</span>
					<div class="file-info">
						<span class="file-info-item" id="fileshared"><span class="filesharedstatus">shared</span><br><span class="filedownloadcount">DL'd 0 times</span></span>
						<span class="file-info-item" id="filedet"><span class="filetype">type</span><br><span id="filesize" unit="<%= model.get('units') %>">size</span></span>
						<span class="file-info-item" id="filemod"><span class="filemod">lastmod_date</span><br><span class="filemod">lastmod_time</span></span>
					</div>
				</li>
				<li class="menubar-content floatb active" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="" fileparent="<%= model.get('hash_parent') %>">
					<div class="dragdrop-border"></div>
					<span class="file-multiselect-checkbox-container">
						<input type="checkbox" id="cb-1" value="abcdef" />
						<label class="label" for="cb-1"><i class="mdi mdi-checkbox-blank-outline"></i></label>
						<label class="label-checked" for="cb-1"><i class="mdi mdi-checkbox-marked"></i></label>
						<label class="label-icon" for="cb-1"><i class="mdi mdi-file-outline"></i></label>
					</span>
					<span class="file-name">File name 2</span>
					<div class="file-info">
						<span class="file-info-item" id="fileshared"><span class="filesharedstatus">shared</span><br><span class="filedownloadcount">DL'd 0 times</span></span>
						<span class="file-info-item" id="filedet"><span class="filetype">type</span><br><span id="filesize" unit="<%= model.get('units') %>">size</span></span>
						<span class="file-info-item" id="filemod"><span class="filemod">lastmod_date</span><br><span class="filemod">lastmod_time</span></span>
					</div>
				</li>
			</ul>
		</nav>
	</section>
	<section class="bar bar-active" id="bar-2" folder="root-files">
		<header>
			<h1>Folder name</h1>
			<section class="file-det-header">
				<span>Shared</span>
				<span>File info</span>
				<span>Modified</span>
			</section>
		</header>
		<nav class="file-list">
			<ul class="">
				<li class="menubar-content floatb" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="" fileparent="<%= model.get('hash_parent') %>">
					<div class="dragdrop-border"></div>
					<span class="file-multiselect-checkbox-container">
						<input type="checkbox" id="cb-2aad" value="abcdef" />
						<label class="label" for="cb-2aad"><i class="mdi mdi-checkbox-blank-outline"></i></label>
						<label class="label-checked" for="cb-2aad"><i class="mdi mdi-checkbox-marked"></i></label>
						<label class="label-icon" for="cb-2aad"><i class="mdi mdi-file-outline"></i></label>
					</span>
					<span class="file-name">File name</span>
					<div class="file-info">
						<span class="file-info-item" id="fileshared"><span class="filesharedstatus">shared</span><br><span class="filedownloadcount">DL'd 0 times</span></span>
						<span class="file-info-item" id="filedet"><span class="filetype">type</span><br><span id="filesize" unit="<%= model.get('units') %>">size</span></span>
						<span class="file-info-item" id="filemod"><span class="filemod">lastmod_date</span><br><span class="filemod">lastmod_time</span></span>
					</div>
				</li>
				<li class="menubar-content floatb" shared container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="" fileparent="<%= model.get('hash_parent') %>">
					<div class="dragdrop-border"></div>
					<span class="file-multiselect-checkbox-container">
						<input type="checkbox" id="cb-asda33" value="abcdef" />
						<label class="label" for="cb-asda33"><i class="mdi mdi-checkbox-blank-outline"></i></label>
						<label class="label-checked" for="cb-asda33"><i class="mdi mdi-checkbox-marked"></i></label>
						<label class="label-icon" for="cb-asda33"><i class="mdi mdi-file-outline"></i></label>
					</span>
					<span class="file-name">File name 2</span>
					<div class="file-info">
						<span class="file-info-item" id="fileshared"><span class="filesharedstatus">shared</span><br><span class="filedownloadcount">DL'd 0 times</span></span>
						<span class="file-info-item" id="filedet"><span class="filetype">type</span><br><span id="filesize" unit="<%= model.get('units') %>">size</span></span>
						<span class="file-info-item" id="filemod"><span class="filemod">lastmod_date</span><br><span class="filemod">lastmod_time</span></span>
					</div>
				</li>
			</ul>
		</nav>
	</section>
</main>	
</body>
	<script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="//code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
	<!-- <link async rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/themes/base/jquery-ui.css"/> -->
    <!-- <script src="js/underscore.min.js"></script> -->
    <script>
    $(document).ready(function() {
	    
    });
    </script>
	
	<?php echo $foxfile_ga_script; ?>

</html>