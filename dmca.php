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
	https://tkluge.net

-->
<head>
	<title>FoxFile - DMCA</title>
	<meta charset="utf-8" />
	<meta author="tkluge" />
	<link rel="stylesheet" href="css/page.css" />
	<!-- <link href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" /> -->
	<link rel="icon" type="image/ico" href="img/favicon.png">
	<link href='https://fonts.googleapis.com/css?family=Roboto:300,400' rel='stylesheet' type='text/css'>
	<meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">
</head>
<body>
	<header class="header float-2">
		<a href="./"><h1 class="logo"><span class="redfox">Fox</span>File</h1></a>
		<nav class="nav-horiz-buttons">
			<a class="btn nav-horiz-item float" href="tos">Terms of service<link class="rippleJS"/></a>
			<a class="btn nav-horiz-item float" href="privacy">Privacy policy<link class="rippleJS"/></a>
			<a class="btn nav-horiz-item float" href="dmca">DMCA policy<link class="rippleJS"/></a>
		</nav>
	</header>
	<main class="main">
		<h2 class="title">DMCA Policy</h2>
		<article class="content float">
			<p class="lastmod">Last updated May 21, 2016</p>
			<!-- 2/28/16 <p>dmca currently not set, use 'report' on a file to have it reviewed<br>
			or something</p> -->
			<p>Im not really sure how to do this. Send me an email, I guess.</p>
		</article>
	</main>
	<?php include './includes/footer.html'; ?>
<!-- <script type="text/javascript" src="//code.jquery.com/jquery-2.1.4.min.js"></script> -->
<script type="text/javascript" src="js/ripple.js"></script>
</body>
</html>