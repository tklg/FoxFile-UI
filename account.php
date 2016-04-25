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
    	<div class="file-search"></div>
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
            <li class="closeOnClick"><a class="fill" href="browse">Manage my files</a></li>
            <li class="closeOnClick"><a class="fill" href="installapp">Install desktop app</a></li>
            <li class="closeOnClick"><a class="fill" href="help">Help</a></li>
            <hr class="nav-vert-divider">
            <li class="nav-vert-footer closeOnClick"><a class="fill" href="logout">Log out</a></li>
        </ul>
    </nav>
    <div class="nav-right-active-cover"></div>
</header>
<main>
	<section class="file-manager account">
		<section class="bar" id="bar-0" type="folder" folder="menu">
			<header>
				<div class="infobox">
		           	<span class="header-name"><?php echo $user_name; ?></span>
		           	<span class="header-email"><?php echo $user_email; ?></span>
		        </div>
			</header>
			<nav class="file-list">
				<ul class="">
					<li class="menubar-content floatb btn-ctrlbar active" id="profile">
						<i class="nocheckbox-icon mdi mdi-account"></i><span class="file-name">My account</span>
						<!-- <span class="badge" id="badge-files"><span class="badgeval">a</span></span> -->
					</li>
					<li class="menubar-content floatb btn-ctrlbar" id="settings">
						<i class="nocheckbox-icon mdi mdi-settings"></i><span class="file-name">Settings</span>
						<!-- <span class="badge" id="badge-shared"><span class="badgeval">10</span></span> -->
					</li>
					<li class="menubar-content floatb btn-ctrlbar" id="security">
						<i class="nocheckbox-icon mdi mdi-security"></i><span class="file-name">Security</span>
						<!-- <span class="badge" id="badge-transfers"><span class="badgeval"></span></span> -->
					</li>
					<li class="menubar-content floatb btn-ctrlbar" id="history">
						<i class="nocheckbox-icon mdi mdi-history"></i><span class="file-name">Account history</span>
						<!-- <span class="badge new" id="badge-trash"><span class="badgeval">3000</span></span> -->
					</li>
				</ul>
			</nav>
		</section>
		<section class="bar" id="bar-1" type="folder" folder="menu">

		</section>
	</section>
</main>	
</body>

<script type="text/template" id="contextmenu">
<section class="clickmenu"><ul class="nav-vert"></ul></section>
</script>
<script type="text/template" id="menuitem">
<li id="<%= id %>" onclick="<%= fn %>"><span><%= content %></span></li>
</script>
	<script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="//code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
	<!-- <link async rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/themes/base/jquery-ui.css"/> -->
    <script src="js/underscore.min.js"></script>
    <script src="js/backbone.min.js"></script>
    <script src="js/profile.js"></script>
    <script type="text/javascript" src="js/ripple.js"></script>
    <script>
    var foxfile_root = '<?php echo $user_uhd; ?>';
    $(document).ready(function() {
	    profile.init();
    });
    </script>
	
	<?php echo $foxfile_ga_script; ?>

</html>