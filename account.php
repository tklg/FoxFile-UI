<?php
//session_start();
include 'includes/cfgvars.php';
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
	<link async href='https://fonts.googleapis.com/css?family=Roboto:300,400,700' rel='stylesheet' type='text/css'>
    <link async rel="stylesheet" href="css/foxfile.css">
    <link async rel="stylesheet" href="css/foxfile-dark.css">
	<link async rel="stylesheet" href="css/account.css">
	<link async href="css/materialdesignicons.min.css" media="all" rel="stylesheet" type="text/css" />
	<link rel="icon" type="image/ico" href="img/favicon.png">
		
	<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
<!--     <script src="js/reloadr.js"></script>
    <script>
    Reloadr.go({
        client: [
            'js/account.js',
            'css/foxfile.css',
            'css/account.css'
        ],
        frequency: 1000
    });
</script> -->
  </head>
<body class="account">
<header class="main">
    <nav class="floatb-2" id="nav-header">
        <h1 class="logo-text"><a href="./browse"><span class="redfox">Fox</span>File</a></h1>
    	<div class="file-search"></div>
        <div class="user-menu">
        	<span class="user-menu-msg" fetch-data="user-first"></span>
            <img class="img user-menu-img" fetch-data="user-gravatar" src="img/default_avatar.png" alt="user gravatar" />
        </div>
    </nav>
    <nav class="floatb-2 nav-right " id="nav-right">
    	<ul class="nav nav-vert" id="user-controls">
            <li class="nav-vert-header nointeract">
            	<img class="img user-menu-img float" fetch-data="user-gravatar" src="img/default_avatar.png" alt="user gravatar" />
            	<div class="infobox">
	            	<span class="nav-header-name" fetch-data="user-name"></span>
                    <span class="nav-header-email" fetch-data="user-email"></span>
	            </div>
            </li>
            <hr class="nav-vert-divider">
            <li class="closeOnClick"><a class="fill" href="browse">Manage my files</a></li>
            <li class="closeOnClick disabled"><a class="fill" href="installapp">Install desktop app</a></li>
            <li class="closeOnClick"><a class="fill" href="help">Help</a></li>
            <hr class="nav-vert-divider">
            <li class="nav-vert-footer closeOnClick"><a class="fill" href="#" onclick="account.logout()">Log out</a></li>
        </ul>
    </nav>
    <div class="nav-right-active-cover"></div>
</header>
<main>
	<section class="bar" id="bar-0" type="folder" folder="menu">
		<header>
			<div class="infobox">
	           	<span class="header-name" fetch-data="user-name"></span>
                    <span class="header-email" fetch-data="user-email"></span>
		      </div>
		</header>
		<nav class="file-list">
			<ul class="">
				<li class="menubar-content floatb btn-ctrlbar active" id="account">
					<i class="nocheckbox-icon mdi mdi-account"></i><span class="file-name">My account</span>
				</li>
				<li class="menubar-content floatb btn-ctrlbar" id="settings">
					<i class="nocheckbox-icon mdi mdi-settings"></i><span class="file-name">Settings</span>
				</li>
				<li class="menubar-content floatb btn-ctrlbar" id="security">
					<i class="nocheckbox-icon mdi mdi-security"></i><span class="file-name">Security</span>
				</li>
				<li class="menubar-content floatb btn-ctrlbar" id="history">
					<i class="nocheckbox-icon mdi mdi-history"></i><span class="file-name">Account history</span>
				</li>
			</ul>
		</nav>
	</section>
    <section class="bar bar-account loading active">
        <header>
            <span class="filename">My account</span>
        </header>
        <div class="progress">
            <div class="indeterminate"></div>
        </div>
        <section class="content">
            <h2>Your personal info</h2>
            <ul>
                <li>
                    <span class="property">First name</span>
                    <input class="value" type="text" id="firstname" placeholder="Your first name" />
                    <button class="btn btn-save" onclick="account.changeName($('#firstname').val(),'first')">Save</button>
                </li>
                <li>
                    <span class="property">Last name</span>
                    <input class="value" type="text" id="lastname" placeholder="Your last name" />
                    <button class="btn btn-save" onclick="account.changeName($('#lastname').val(),'last')">Save</button>
                </li>
                <li>
                    <span class="property">Email</span>
                    <input class="value" type="text" id="email" placeholder="Your email address" />
                    <button class="btn btn-save" onclick="account.changeEmail($('#email').val())">Save</button>
                </li>
                <li>
                    <span class="property">Join date</span>
                    <span class="value" id="join">Fetching...</span>
                </li>
                <li>
                    <span class="property">FoxFile ID</span>
                    <span class="value" id="foxid">Fetching...</span>
                </li>
                <li>
                    <span class="property">Verified email?</span>
                    <span class="value" id="email-ver">Fetching...</span>
                    <button class="btn btn-save hidden" id="email-resend" onclick="account.sendVerificationEmail()">Resend email</button>
                </li>
            </ul>
            <h2>Your files</h2>
            <ul>
                <li class="large">
                    <span class="property">Storage quota<!-- <br><span class="desc" id="s_total">out of NaN GB</span> --></span>
                    <ul>
                        <li>
                            <span class="value">All files
                            <span id="filepercent">Fetching...</span>/<span id="s_total">Fetching...</span>
                            <!-- Trash bin
                            <span id="trashpercent">0.5GB</span> -->
                            </span>
                        </li>
                        <li>
                            <div class="graph">
                                <div class="prog-f">Files</div><div class="prog-t">Trash</div>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </section>
    </section>
    <section class="bar bar-settings loading">
        <header>
            <span class="filename">Account settings</span>
        </header>
        <div class="progress">
            <div class="indeterminate"></div>
        </div>
        <section class="content">
            <h2>Your account settings</h2>
            <ul>
                <li>
                    <span class="property">Night mode</span>
                    <input class="value" type="checkbox" id="theme" />
                    <label class="switch-box" for="theme"><div class="switch"></div></label>
                </li>
            </ul>
        </section>
    </section>
    <section class="bar bar-security loading">
        <header>
            <span class="filename">Account security</span>
        </header>
        <div class="progress">
            <div class="indeterminate"></div>
        </div>
        <section class="content">
            <h2>Security settings</h2>
            <ul>
                <!-- <li class="large">
                    <span class="property">Password</span>
                    <ul class="passstack">
                        <li>
                            <input placeholder="Password" class="value" type="password" id="password" />
                        </li>
                        <li>
                            <input placeholder="And again" class="value" type="password" id="password2" />
                            <button class="btn btn-save" onclick="account.changePass();">change</button>
                        </li>
                    </ul>
                </li> -->
                <li>
                    <span class="property">Backup my master key</span>
                    <span class="value">Keep this key somewhere safe.</span>
                    <button class="btn btn-save" onclick="account.backupKey()">Save</button></label>
                </li>
                <li>
                    <span class="property">Remove my account</span>
                    <span class="value">This cannot be undone.</span>
                    <button class="btn btn-save" onclick="account.dialog.removeAccount.show()">remove</button></label>
                </li>
            </ul>
        </section>
    </section>
    <section class="bar bar-history loading">
        <header>
            <span class="filename">Account history</span>
        </header>
        <div class="progress">
            <div class="indeterminate"></div>
        </div>
        <section class="content">
            <h2>Logins</h2>
            <div class="ulheader">
                <span class="useragent">Browser</span>
                <span class="creator">IP address</span>
                <!-- <span class="country">Country</span> -->
                <span class="date">Last login</span>
                <span class="status"></span>
            </div>
            <ul class="acc-h">
                
            </ul>
        </section>
    </section>
</main>	
</body>
<script type="text/template" id="template-snackbar">
<div class="snackbar" id="snackbar-<%= id %>">
    <span class="snackbar-msg"><%= message %></span><% if (action != null) { %><button class="btn snackbar-btn" onclick="<%= fn %>"><%= action %></button><% } %>
</div>
</script>
<script type="text/template" id="template-key">
    <li class="<%= current + ' ' + status %>">
        <span class="value useragent"><%= ua %></span>
        <span class="value creator"><%= ip %></span>
        <span class="value country"><%= country %></span>
        <span class="value date"><%= date %></span>
        <button class="btn status" id="<%= key %>" onclick="account.invalidateKey('<%= key %>')"><%= status %></button>
    </li>
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
	<!-- <script src="//code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script> -->
	<!-- <link async rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/themes/base/jquery-ui.css"/> -->
    <script src="js/underscore.min.js"></script>
    <script src="js/backbone.min.js"></script>
    <script type="text/javascript" src="js/forge.min.js"></script>
    <script src="js/account.js"></script>
    <script src="js/filesaver.min.js"></script>
    <script async type="text/javascript" src="js/ripple.js"></script>
    <script>
    if (!localStorage.getItem('api_key')) location.replace('./login');
    var api_key = localStorage.getItem('api_key');
    $(document).ready(function() {
	    account.init();
    });
    </script>
	
	<?php echo $foxfile_ga_script; ?>

</html>