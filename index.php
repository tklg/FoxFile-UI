<?php
session_start();
if (!isset ($_SESSION['access_token'])) header ("Location: login");
$userphoto = $_SESSION['user_picture'];
$username = $_SESSION['user_name'];
?>
<!DOCTYPE html>
<html lang="en">
<!--
	
	 ,ggg, ,ggg,_,ggg,   ad888888b,  ,ggg, ,ggg,_,ggg,  
dP""Y8dP""Y88P""Y8b d8"     "88 dP""Y8dP""Y88P""Y8b 
Yb, `88'  `88'  `88          88 Yb, `88'  `88'  `88 
 `"  88    88    88         d8P  `"  88    88    88 
     88    88    88        a8P       88    88    88 
     88    88    88      ,d8P        88    88    88 
     88    88    88    ,d8P'         88    88    88 
     88    88    88  ,d8P'           88    88    88 
     88    88    Y8,a88"             88    88    Y8,
     88    88    `Y888888888888      88    88    `Y8
	
	mailtome - index.php
	Copyright (C) 2015 Theodore Kluge - All Rights Reserved
	http://tkluge.net

-->
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1">
    <title>MailtoMe</title>
	<link async href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link async href='https://fonts.googleapis.com/css?family=Roboto:300' rel='stylesheet' type='text/css'>
	<link async rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.1/css/materialize.min.css">
	<link async rel="stylesheet" href="css/mailtome.css">
	<link rel="icon" type="image/ico" href="favicon.ico">
		
	<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
<body>
<header class="main">
	<section class="z-depth-1" id="nav-main">
	    <a id="btn-burger" data-activates="nav-menu" class="btn btn-burger btn-flat waves-effect waves-circle waves-light"><i class="material-icons">menu</i></a>
	    <div class="title noselect"><a>Mail to Me</a></div>
	    <!-- <ul class="right quickmenu">		    
		    <a href="#" class="button-account-bar show-on-large"><li class="btn btn-flat btn-header-menu btn-header-menu-img waves-effect waves-circle waves-light"><img src="<?php echo $userphoto ?>" /></li></a>
	    </ul> -->
	</section>
</header>
<main>
<nav id="nav-right">
	<div class="nav-wrapper">
	<ul>
		<li class="inputbox">
			<input type="text" class="input" id="search" />
			<label class="input-placeholder" for="search">Enter keywords</label>
		    <hr class="input-underline" />
		</li>
	</ul>
	<button class="btn waves-effect waves-light" id="fetchmail">Fetch</button>
	<!-- <hr> -->
	<ul>
		<li><input type="checkbox" id="saveimages" checked /><label for="saveimages">Save images</label></li>
		<li><input type="checkbox" id="savetext" /><label for="savetext">Save text</label></li>
		<li><input type="checkbox" id="markasread" checked /><label for="markasread">Mark as read</label></li>
		<li><input type="checkbox" id="deleteafter" /><label for="deleteafter">Delete after downloading</label></li>
	</ul>
		<button class="btn waves-effect waves-light" id="downloadmail">Download</button>
	</div>
	<footer class="dl-btn-box">
	<svg class="spinner spinner-inactive" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
		   <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
		</svg>
	</footer>
</nav>
<nav class="side-nav" id="nav-menu">
<header class="nav-header">
	<img src="//placehold.it/304x160" alt="" />
</header>
<ul>
	<li><?php echo $username; ?></li>
	<li><a href="oauth?logout">Log out</a></li>
</ul>
</nav>

<section class="emails emails-empty">
<div class="emails-empty-pic z-depth-1"><i class="emails-empty-pic-envelope material-icons">email</i></div>
<ul class="mailgroup z-depth-1" id="mg1"></ul>
</section>

</main>	
</body>
	<script type="template" id="template-mail-id">
	<li>
	<span id="mail-num"><%= num %></span>ID: <span id="mail-id"><%= id %></span>
	</li>
	</script>
	<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
	<link async rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/themes/base/jquery-ui.css"/>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.1/js/materialize.min.js"></script>
    <script src="js/underscore.min.js"></script>
    <script src="js/mailtome.js"></script>
    <script>
    var res;
    $(document).ready(function() {
	    $('#btn-burger').sideNav({
	      menuWidth: 304,
	      edge: 'left',
	      closeOnClick: true
	    });
	    $('input').change(function() {
	        $(this).attr('empty', ($(this).val() != '') ? 'false' : 'true');
	    });

	    init.mailbox();
    });
    </script>
	
	<script>
	  /*(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-48081162-1', 'villa7.github.io');
	  ga('send', 'pageview');*/

	</script>

</html>