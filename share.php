<?php
session_start();
include 'includes/cfgvars.php';
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
if ($pageID == '') {
    header('Location: ./../');
}
if ($pageID == 'share') header("Location: ./");
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
    <title>FoxFile - Share</title>
	<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,700' rel='stylesheet' type='text/css'>
    <!-- <link async rel="stylesheet" href="css/foxfile.css"> -->
    <link async rel="stylesheet" href="../css/foxfile.css">
    <!-- <link async rel="stylesheet" href="css/shared.css"> -->
	<link async rel="stylesheet" href="../css/shared.css">
    <link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
	<link href="../css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
    <!-- <link rel="icon" type="image/ico" href="img/favicon.png"> -->
	<link rel="icon" type="image/ico" href="../img/favicon.png">
		
	<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
<body>
<header class="main">
    <nav class="floatb-2" id="nav-header">
        <h1 class="logo-text"><a href="./../"><span class="redfox">Fox</span>File</a></h1>
</header>
<main>
	<section class="bar" id="bar-0" type="folder" folder="menu">
        <header class="hidden">
            <div class="infobox">
	           	<span class="header-name" fetch-data="user-name"></span>
	           	<span class="header-email" fetch-data="user-email"></span>

              </div>
        </header>
        <nav class="file-list hidden">
            <ul class="">
				<li class="menubar-content floatb btn-ctrlbar" id="account" onclick="document.location.href='./../account'">
					<i class="nocheckbox-icon mdi mdi-account"></i><span class="file-name">My account</span>
				</li>
				<li class="menubar-content floatb btn-ctrlbar" id="settings" onclick="document.location.href='./../browse'">
					<i class="nocheckbox-icon mdi mdi-folder-multiple-outline"></i><span class="file-name">My files</span>
				</li>
			</ul>
		</nav>
        <article class="promo">
            <h2>A place<br>to keep your files</h2>
            <p>FoxFile starts you with 2GB of free online storage - so you can keep anything.</p>
            <div>
                <a class="btn" href="./../register">Get started</a>
                or
                <a class="btn" href="./../login">Log in</a>
            </div>
        </article>
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
                <span class="file-name">Fetching...</span>
                <!-- <span class="file-size">1000mb</span> -->
            </div>
            <div class="inactive">
                <a class="btn" onclick="shared.download()">Download</a>
                <!-- <a class="btn hidden" onclick="shared.copy()">Copy to my files</a> -->
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
    <script src="../js/underscore.min.js"></script>
    <script src="../js/filetypes.js"></script>
    <script src="../js/backbone.min.js"></script>
    <script src="../js/shared.js"></script>
    <script type="text/javascript" src="../js/ripple.js"></script>
    <script>
    var logged_in = true;
    if (!localStorage.getItem('api_key')) logged_in = false;
    var api_key = localStorage.getItem('api_key');
    var shared_id = '<?php echo $pageID; ?>';
    $(document).ready(function() {
	    shared.init();
    });
    </script>
	
	<?php echo $foxfile_ga_script; ?>

</html>