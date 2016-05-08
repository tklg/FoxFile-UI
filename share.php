<?php
session_start();
include 'includes/cfgvars.php';
if (!isset ($_SESSION['foxfile_uid'])) $logged_in = false;
else {
    $logged_in = true;
    $user_md5 = $_SESSION['foxfile_user_md5'];
    $user_alvl = $_SESSION['foxfile_access_level'];
    $user_uid = $_SESSION['foxfile_uid'];
    $user_email = $_SESSION['foxfile_email'];
    $user_uhd = $_SESSION['foxfile_uhd'];
    $user_first = $_SESSION['foxfile_firstname'];
    $user_last = $_SESSION['foxfile_lastname'];
    $user_name = $_SESSION['foxfile_username'];
}
$uri = $_SERVER['REQUEST_URI'];
if (strpos($uri, '/') !== false) {
    $uri = explode('/', $uri);
    $pageID = $uri[sizeof($uri) - 1];
} else {
    $pageID = substr($uri, 1);
}
if (strpos($pageID, '?') !== false) {
    $uri = explode('?', $pageID);
    $pageID = $uri[0];
}
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
	https://tkluge.net

-->
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1">
    <title>FoxFile</title>
	<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,700' rel='stylesheet' type='text/css'>
    <link async rel="stylesheet" href="css/foxfile.css">
    <link async rel="stylesheet" href="../css/foxfile.css">
    <link async rel="stylesheet" href="css/shared.css">
	<link async rel="stylesheet" href="../css/shared.css">
    <link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
	<link href="../css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
    <link rel="icon" type="image/ico" href="img/favicon.png">
	<link rel="icon" type="image/ico" href="../img/favicon.png">
		
	<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
    <script src="../js/reloadr.js"></script>
    <script>
    Reloadr.go({
        client: [
            '../js/shared.js',
            '../css/shared.css'
        ],
        frequency: 1000
    });
</script>
  </head>
<body>
<header class="main">
    <nav class="floatb-2" id="nav-header">
        <h1 class="logo-text"><a href="./../"><span class="redfox">Fox</span>File</a></h1>
    	<div class="file-search"></div>
        <?php if ($logged_in) { ?>
        <!-- <div class="user-menu">
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
            <li class="closeOnClick disabled"><a class="fill" href="installapp">Install desktop app</a></li>
            <li class="closeOnClick"><a class="fill" href="help">Help</a></li>
            <hr class="nav-vert-divider">
            <li class="nav-vert-footer closeOnClick"><a class="fill" href="logout">Log out</a></li>
        </ul>
    </nav>
    <div class="nav-right-active-cover"></div> -->
        <?php } ?>
</header>
<main>
	<section class="bar" id="bar-0" type="folder" folder="menu">
        <?php if ($logged_in) { ?>
        <header>
            <div class="infobox">
	           	<span class="header-name"><?php echo $user_name; ?></span>
	           	<span class="header-email"><?php echo $user_email; ?></span>

              </div>
        </header>
        <?php } ?>
        <?php if ($logged_in) { ?>
        <nav class="file-list">
            <ul class="">
				<li class="menubar-content floatb btn-ctrlbar" id="account" onclick="document.location.href='./../account'">
					<i class="nocheckbox-icon mdi mdi-account"></i><span class="file-name">My account</span>
				</li>
				<li class="menubar-content floatb btn-ctrlbar" id="settings" onclick="document.location.href='./../browse'">
					<i class="nocheckbox-icon mdi mdi-folder-multiple-outline"></i><span class="file-name">My files</span>
				</li>
			</ul>
		</nav>
        <?php } else { ?>
            <article class="promo">
                <h2>A place<br>to keep your files</h2>
                <p>FoxFile starts you with 2GB of free online storage - so you can keep anything.</p>
                <div>
                    <a class="btn" href="./../register">Get started</a>
                    or
                    <a class="btn" href="./../login">Log in</a>
                </div>
            </article>
        <?php } ?>
	</section>
    <section class="bar bar-shared loading active" id="bar-shared">
        <header>
            <span class="filename">Shared files</span>
        </header>
        <div class="progress">
            <div class="indeterminate"></div>
        </div>
        <section class="content">
            <div class="file">
                <span class="file-name">File name</span>
                <!-- <span class="file-size">1000mb</span> -->
            </div>
            <div>
                <a class="btn" onclick="shared.download(shared_id)">Download</a>
                <?php if ($logged_in) { ?>
                or
                <a class="btn" onclick="shared.copy(shared_id)">Copy to my files</a>
                <?php } ?>
            </div>
        </section>
    </section>
</main>	
</body>
<script type="text/template" id="template-snackbar">
<div class="snackbar" id="snackbar-<%= id %>">
    <span class="snackbar-msg"><%= message %></span><% if (action != null) { %><button class="btn snackbar-btn" onclick="<%= fn %>"><%= action %></button><% } %>
</div>
</script>
	<script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script>
	<!-- <script src="//code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script> -->
	<!-- <link async rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/themes/base/jquery-ui.css"/> -->
    <!-- <script src="js/underscore.min.js"></script> -->
    <script src="../js/underscore.min.js"></script>
    <!-- <script src="js/backbone.min.js"></script> -->
    <script src="../js/backbone.min.js"></script>
    <script src="../js/shared.js"></script>
    <!-- <script type="text/javascript" src="js/ripple.js"></script> -->
    <script type="text/javascript" src="../js/ripple.js"></script>
    <script>
    <?php if ($logged_in) { ?> var foxfile_root = '<?php echo $user_uhd; ?>'; <?php } ?>
    var shared_id = '<?php echo $pageID; ?>';
    $(document).ready(function() {
	    shared.init();
    });
    </script>
	
	<?php echo $foxfile_ga_script; ?>

</html>