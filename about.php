<?php
//session_start();
include 'includes/cfgvars.php';
?>
<!DOCTYPE html>
<html lang="en-US">
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
	<title>FoxFile - About</title>
	<meta charset="utf-8" />
	<meta author="tkluge" />
	<link rel="stylesheet" href="css/page.css" />
	<!-- <link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" /> -->
	<link rel="icon" type="image/ico" href="favicon.ico">
	<link href='https://fonts.googleapis.com/css?family=Roboto:300,400' rel='stylesheet' type='text/css'>
	<meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
</head>
<body>
	<header class="header float-2">
		<a href="./"><h1 class="logo"><span class="redfox">Fox</span>File</h1></a>
		<nav class="nav-horiz-buttons">
			<a class="btn nav-horiz-item float" href="about">About<link class="rippleJS"/></a>
			<a class="btn nav-horiz-item float" href="help">Help<link class="rippleJS"/></a>
		</nav>
	</header>
	<main class="main">
		<h2 class="title">About FoxFile</h2>
		<article class="content float">
			
		</article>
	</main>
	<footer class="footer">
		<nav class="nav-horiz-bars">
			<span class="nav-horiz-item"><a href="tos">Terms of service</a></span>
			<span class="nav-horiz-bar">|</span>
			<span class="nav-horiz-item"><a href="privacy">Privacy policy</a></span>
			<span class="nav-horiz-bar">|</span>
			<span class="nav-horiz-item"><a href="about">About</a></span>
			<span class="nav-horiz-bar">|</span>
			<span class="nav-horiz-item"><a href="help">Help</a></span>
		</nav>
		<span class="copyright">
			<span id="c1">&copy; <?php echo date("Y");?> Theodore Kluge</span>
			<span id="c2">Made with ❤ by Theodore Kluge</span>
		</span>
	</footer>
<!-- <script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script> -->
<script type="text/javascript" src="js/ripple.js"></script>
</body>
</html>