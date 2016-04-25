<?php
session_start();
include 'includes/cfgvars.php';
if (!isset ($_SESSION['foxfile_uid'])) header ("Location: ./");
$user_md5 = $_SESSION['foxfile_user_md5'];
$user_alvl = $_SESSION['foxfile_access_level'];
$user_uid = $_SESSION['foxfile_uid'];
$user_email = $_SESSION['foxfile_email'];
$user_uhd = $_SESSION['foxfile_uhd'];
$user_first = $_SESSION['foxfile_firstname'];
$user_last = $_SESSION['foxfile_lastname'];
$user_name = $_SESSION['foxfile_username'];
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
	Copyright (C) 2016 Theodore Kluge
	http://tkluge.net

-->
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1">
    <title>FoxFile</title>
<!-- 	<link async href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"> -->
	<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,700' rel='stylesheet' type='text/css'>
	<link async rel="stylesheet" href="css/foxfile.css">
	<link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
	<link rel="icon" type="image/ico" href="img/favicon.png">
		
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
        <form class="user-input-box file-search">
			<input class="user-input input-text input-search" type="text" id="search" />
			<label class="input-text-icon" for="search"><i class="mdi mdi-magnify"></i></label>
			<label class="input-text-placeholder" for="search">Search</label>
		</form>
        <!-- <ul class="nav nav-horiz" id="folder-controls">
            <li>Upload</li>
            <li>Create</li>
            <li class="btn-more"><i class="mdi mdi-unfold-more"></i><span>More</span></li>
        </ul> -->
        <div class="user-menu">
        	<span class="user-menu-msg">Hello, <?php echo $user_first; ?></span>
        	<img class="img user-menu-img" src="//gravatar.com/avatar/<?php echo $user_md5; ?>?r=r" alt="user gravatar" />
        </div>
    </nav>
    <nav class="floatb-2 nav-right " id="nav-right">
    	<ul class="nav nav-vert" id="user-controls">
            <li class="nav-vert-header nointeract">
            	<img class="img user-menu-img float" src="//gravatar.com/avatar/<?php echo $user_md5; ?>?r=r" alt="user gravatar" />
            	<div class="infobox">
	            	<span class="nav-header-name"><?php echo $user_name; ?></span>
	            	<span class="nav-header-email"><?php echo $user_email; ?></span>
	            </div>
            </li>
            <hr class="nav-vert-divider">
            <li class="closeOnClick"><a class="fill" href="account">Manage account</a></li>
            <li class="closeOnClick"><a class="fill" href="installapp">Install desktop app</a></li>
            <li class="closeOnClick"><a class="fill" href="help">Help</a></li>
            <hr class="nav-vert-divider">
            <li class="nav-vert-footer closeOnClick"><a class="fill" href="logout">Log out</a></li>
        </ul>
    </nav>
    <div class="nav-right-active-cover"></div>
</header>
<main>
	<section class="pages">
		<section class="transfers" id="transfers">
			<section class="bar bar-transfers" id="bar-2" type="folder" folder="file-transfers">
				<header>
					<span class="filename">File transfers</span>
					<section class="file-actions-header">
						<span><i class="mdi mdi-delete"></i></span>
						<span><i class="mdi mdi-dots-vertical"></i></span>
					</section>
				</header>
				<div class="progress">
			    	<div class="indeterminate"></div>
			  	</div>
				<nav class="file-list">
					<ul class=""></ul>
				</nav>
			</section>
		</section>
		<section class="shared" id="shared">
			<section class="bar bar-shared loading" id="bar-2" type="folder" folder="file-transfers">
				<header>
					<span class="filename">Shared with me</span>
					<section class="file-actions-header">
						<span><i class="mdi mdi-download"></i></span>
						<span><i class="mdi mdi-content-copy"></i></span>
					</section>
				</header>
				<div class="progress">
			    	<div class="indeterminate"></div>
			  	</div>
				<nav class="file-list">
					<ul class="">
						<li class="menubar-content floatb" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="" fileparent="<%= model.get('hash_parent') %>">
							<span class="file-multiselect-checkbox-container">
								<input type="checkbox" id="cb-04" value="abcdef" />
								<label class="label" for="cb-04"><i class="mdi mdi-checkbox-blank-outline"></i></label>
								<label class="label-checked" for="cb-04"><i class="mdi mdi-checkbox-marked"></i></label>
								<label class="label-icon" for="cb-04"><i class="mdi mdi-file-outline"></i></label>
							</span>
							<span class="file-name">File name 1</span>
							<div class="file-info">
								<span class="file-info-item" id="filedet"><span class="filetype">type</span><br><span id="filesize" unit="<%= model.get('units') %>">size</span></span>
							</div>
						</li>
						<li class="menubar-content floatb" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="" fileparent="<%= model.get('hash_parent') %>">
							<span class="file-multiselect-checkbox-container">
								<input type="checkbox" id="cb-03" value="abcdef" />
								<label class="label" for="cb-03"><i class="mdi mdi-checkbox-blank-outline"></i></label>
								<label class="label-checked" for="cb-03"><i class="mdi mdi-checkbox-marked"></i></label>
								<label class="label-icon" for="cb-03"><i class="mdi mdi-file-outline"></i></label>
							</span>
							<span class="file-name">File name 2</span>
							<div class="file-info">
								<span class="file-info-item" id="filedet"><span class="filetype">type</span><br><span id="filesize" unit="<%= model.get('units') %>">size</span></span>
							</div>
						</li>
					</ul>
				</nav>
			</section>
		</section>
		<section class="trash" id="trash">
			<section class="bar bar-trash loading" id="bar-2" type="folder" folder="file-transfers">
				<header>
					<span class="filename">Deleted files</span>
					<section class="file-actions-header">
						<span><i class="mdi mdi-backup-restore"></i></span>
						<span><i class="mdi mdi-delete-sweep"></i></span>
					</section>
				</header>
				<div class="progress">
			    	<div class="indeterminate"></div>
			  	</div>
				<nav class="file-list">
					<ul class="">
						<li class="menubar-content floatb" container="<%= model.get('container') %>" type="<%= model.get('basicFileType') %>" filehash="<%= model.get('hash_self') %>" id="<%= model.get('fileID') %>" name="<%= model.get('fileName') %>" pos="" fileparent="<%= model.get('hash_parent') %>">
							<span class="file-multiselect-checkbox-container">
							<input type="checkbox" id="cb-02" value="abcdef" />
								<label class="label" for="cb-02"><i class="mdi mdi-checkbox-blank-outline"></i></label>
								<label class="label-checked" for="cb-02"><i class="mdi mdi-checkbox-marked"></i></label>
								<label class="label-icon" for="cb-02"><i class="mdi mdi-file-outline"></i></label>
							</span>
							<span class="file-name">File name 1</span>
							<div class="file-info">
								<span class="file-info-item" id="filedet"><span class="filetype">type</span><br><span id="filesize" unit="<%= model.get('units') %>">size</span></span>
							</div>
							<i class="mdi mdi-delete-forever"></i>
						</li>
					</ul>
				</nav>
			</section>
		</section>
	</section>
	<section class="file-manager">
		<section class="bar" id="bar-0" type="folder" folder="menu">
			<header>
				<div class="infobox">
		           	<span class="header-name"><?php echo $user_name; ?></span>
		           	<span class="header-email"><?php echo $user_email; ?></span>
		        </div>
			</header>
			<nav class="file-list">
				<ul class="">
					<li class="menubar-content floatb btn-ctrlbar active" id="files" hash="<?php echo $user_uhd; ?>">
						<i class="nocheckbox-icon mdi mdi-folder-multiple-outline"></i><span class="file-name">My files</span>
						<!-- <span class="badge" id="badge-files"><span class="badgeval">a</span></span> -->
					</li>
					<li class="menubar-content floatb btn-ctrlbar" id="shared">
						<i class="nocheckbox-icon mdi mdi-account-multiple"></i><span class="file-name">Shared with me</span>
						<!-- <span class="badge" id="badge-shared"><span class="badgeval">10</span></span> -->
					</li>
					<li class="menubar-content floatb btn-ctrlbar" id="trash">
						<i class="nocheckbox-icon mdi mdi-delete"></i><span class="file-name">Trash</span>
						<!-- <span class="badge new" id="badge-trash"><span class="badgeval">3000</span></span> -->
					</li>
					<li class="menubar-content floatb btn-ctrlbar" id="transfers">
						<i class="nocheckbox-icon mdi mdi-transfer"></i><span class="file-name">File transfers</span>
						<span class="badge" id="badge-transfers"><span class="badgeval"></span></span>
					</li>
				</ul>
			</nav>
		</section>
	</section>
</main>	
</body>
<script type="text/template" id="fm-folder">
<section class="bar loading" id="bar-<%= hash %>" type="folder" hash="<%= hash %>" parent="<%= parent %>">
	<header>
		<span class="btn-back"><i class="mdi mdi-chevron-left"></i></span>
		<span class="filename"><%= name %></span>
		<section class="file-det-header">
			<span>Shared</span>
			<span>File info</span>
			<span>Modified</span>
		</section>
		<section class="file-actions-header">
			<span><i class="mdi mdi-dots-vertical"></i><link class="rippleJS lightgray" /></span>
		</section>
	</header>
	<div class="progress">
	   	<div class="indeterminate"></div>
	</div>
	<nav class="file-list">
	</nav>
</section>
</script>
<script type="text/template" id="fm-file">
<li class="menubar-content floatb" parent="<%= getParent() %>" type="<%= getType() %>" btype="<%= btype %>" hash="<%= hash %>" id="file-<%= hash %>" name="<%= name %>" shared="<%= shared %>" >
	<div class="dragdrop-border"></div>
	<span class="file-multiselect-checkbox-container">
		<input type="checkbox" id="cb-<%= hash %>" value="abcdef" />
		<label class="label" for="cb-<%= hash %>"><i class="mdi mdi-checkbox-blank-outline"></i></label>
		<label class="label-checked" for="cb-<%= hash %>"><i class="mdi mdi-checkbox-marked"></i></label>
		<label class="label-icon" for="cb-<%= hash %>"><i class="mdi <%= getIcon() %>"></i></label>
	</span>
	<span class="file-name"><%= name %></span>
	<div class="file-info">
		<span class="file-info-item" id="fileshared"><span class="filesharedstatus">Shared</span><br><span class="filedownloadcount"><%= isPublic() ? "Public" : "Private" %></span></span>
		<span class="file-info-item" id="filedet"><span class="filetype"><%= getType() %></span><br><span id="filesize"><%= getSize() %></span></span>
		<span class="file-info-item" id="filemod"><span class="filemod"><%= getDate() %></span><br><span class="filemod"><%= getTime() %></span></span>
	</div>
</li>
</script>
<script type="text/template" id="fm-file-detail">
<section class="bar" spectype="<%= getType() %>" parent="<%= parent %>" type="<%= type %>" hash="<%= hash %>" id="file-detail-<%= hash %>" name="<%= name %>">
	<header>
		<span class="filename"><%= name %></span>
		<section class="file-actions-header">
			<span><i class="mdi mdi-information-outline"></i><link class="rippleJS lightgray" /></span>
			<span><i class="mdi mdi-download"></i><link class="rippleJS lightgray" /></span>
			<span><i class="mdi mdi-rename-box"></i><link class="rippleJS lightgray" /></span>
			<span><i class="mdi mdi-delete"></i><link class="rippleJS lightgray" /></span>
			<span><i class="mdi mdi-folder-move"></i><link class="rippleJS lightgray" /></span>
			<span><i class="mdi mdi-reload"></i><link class="rippleJS lightgray" /></span>
			<span><i class="mdi mdi-dots-vertical"></i><link class="rippleJS lightgray" /></span>
		</section>
	</header>
	<section class="file-view">
		<img src="//placehold.it/1500x1000" alt="placeholder image" />
	</section>
</section>
</script>
<script type="text/template" id="fm-folder-empty">
<section class="folder-empty">
	<i class="mdi mdi-cloud-upload"></i>
	<span>This folder is empty</span>
</section>
</script>
<script type="text/template" id="fm-file-transferring">
<li class="menubar-content floatb" hash="<%= id %>" id="tfile-<%= id %>" name="<%= name %>">
	<span class="file-upload-status">Waiting</span>
	<div class="nameandprogress">
		<span class="file-name"><%= getName(true) %></span>
		<span class="file-upload-progress">
			<div class="file-upload-progress-bar"></div>
		</span>
	</div>
	<div class="file-info">
		<span class="file-info-item" id="filedet"><span class="filetype"><%= getType() %></span><br><span id="filesize"><%= getSize() %></span></span>
	</div>
</li>
</script>
<script type="text/template" id="fm-file-trash">
<li class="menubar-content floatb" btype="<%= btype %>" hash="<%= hash %>" id="bfile-<%= hash %>" name="<%= name %>" parent="<%= parent %>">
	<span class="file-multiselect-checkbox-container">
	<input type="checkbox" id="cb-<%= hash %>" value="<%= hash %>" />
	<label class="label" for="cb-<%= hash %>"><i class="mdi mdi-checkbox-blank-outline"></i></label>
	<label class="label-checked" for="cb-<%= hash %>"><i class="mdi mdi-checkbox-marked"></i></label>
	<label class="label-icon" for="cb-<%= hash %>"><i class="mdi <%= getIcon() %>"></i></label>
	</span>
	<span class="file-name"><%= name %></span>
	<span class="file-controls">
		<span onclick="fm.restore('<%= hash %>')"><i class="mdi mdi-backup-restore"></i></span>
		<span onclick="fm.dialog.delete.show('<%= name %>','<%= hash %>')"><i class="mdi mdi-delete-forever"></i></span>
	</span>
	<div class="file-info">
		<span class="file-info-item" id="filedet"><span class="filetype"><%= getType() %></span><br><span id="filesize"><%= getSize() %></span></span>
	</div>
</li>
</script>
<script type="text/template" id="contextmenu">
<section class="clickmenu"><ul class="nav-vert"></ul></section>
</script>
<script type="text/template" id="menuitem">
<li id="<%= id %>" onclick="<%= fn %>"><i class="mdi mdi-<%= icon %>"></i><span><%= content %></span><span class="kbs-hint"><%= kbsHint %></span></li>
</script>
<script type="text/template" id="template-dialog">
<div class="dialog-cover" id="<%= id %>">
	<div class="dialog">
		<%= header %>
		<article><%= content %></article>
		<footer><%= footer %></footer>
	</div>
</div>
</script>
<script type="text/template" id="template-dialog-footer-opt">
<button class="btn dialog-btn dialog-btn-<%= type %>" onclick="<%= fn %>"><%= name %><link class="rippleJS" /></button>
</script>
	<script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="//code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
	<!-- <link async rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/themes/base/jquery-ui.css"/> -->
    <script src="js/underscore.min.js"></script>
    <script src="js/backbone.min.js"></script>
    <script src="js/foxfile.js"></script>
    <script src="js/filetypes.js"></script>
    <script type="text/javascript" src="js/ripple.js"></script>
    <script>
    var foxfile_root = '<?php echo $user_uhd; ?>';
    $(document).ready(function() {
	    foxfile.init();
    });
    </script>
	
	<?php echo $foxfile_ga_script; ?>

</html>