<?php
session_start();

if (!isset($_SESSION['mode'])) {
	$_SESSION['mode'] = 'user';
}
if(!isset($_SESSION['user'])) {
	$_SESSION['user'] = 'Guest';
}
error_reporting(0);//remove for debug
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Blag - Admin</title>

        <?php
    	require ('../includes/config.php');
    	echo '<link rel="stylesheet" href="../css/blag-light.css">';
    	if ($usecustombg == "true") {
				echo '<style type="text/css">body{background: url("' . $custombg . '")}</style>';
			}
    	echo '<link rel="stylesheet" href="../css/blag-' . $_SESSION['theme'] . '.css">'; //adds to main theme
    	
    	if ($usepace === 'true') {
    		echo '<link rel="stylesheet" href="../css/pace/pace-centerbar.css">';
    		echo '<script src="../js/pace/pace.min.js"></script>';
    	}
    ?>
        <meta charset="utf-8">
        <!-- <base target="_blank" /> -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">

	<link rel="stylesheet" href="../css/bootstrap.min.css">
	<link rel="stylesheet" href="../css/font-awesome.min.css">
	<style type="text/css">
.tab-menu {
	height: auto;
		width: 20%;
		float: left;
		position: relative;
}
.tabs {
    display:inline-block;
}
    .tab-links:after {
        display:block;
        clear:both;
        content:'';
    }
 
    .tab-links li {
        width: 100%;
        float:left;
        list-style:none;
    }
 
        .tab-links a {
            display:inline-block;
            padding: 10px 30px;
            margin-bottom: 1px;
            width: 100%;
            border-radius:0px 5px 5px 0px;
            background:rgba(255,255,255,0);
            font-size:16px;
            font-weight:600;
            color:#222;
            transition:all linear 0.1s;
        }
 
        .tab-links a:hover {
            background: rgba(0,0,0,.35);
            text-decoration:none;
        }
 
    li.active a {
        background:#4e8975;
        color:222;
    } 
    li.active a:hover {
    	background: #78866b;
    }
        .tab {
            display:none;
        }
 
        .tab.active {
            display:block;
        }
    .btn-footer-right {
    	float: right;
    	position: relative;
    	margin: 3px 3px 2px 0px;
    	padding: 3px 10px;
    }
    #grav_list > li, #grav_list_2 > li {
    	position: relative;
    	float: left;
    	margin: 10px;
    }
    ul#grav_list input[type='radio'], ul#grav_list_2 input[type='radio'] {
    	display: none;
    }
    ul#grav_list input[type='radio'] + label {
    	border: rgba(0,0,0,.4) 2px solid;
    	border-radius: 33px;
    	background: rgba(0,0,0,.4);
    	transition: all .2s ease;
    	-webkit-transition: all .3s ease;
	}
	ul#grav_list_2 input[type='radio'] + label {
		border: rgba(0,0,0,.4) 2px solid;
		background: #fff;
		transition: all .2s ease;
    	-webkit-transition: all .3s ease;
	}
	ul#grav_list input[type='radio']:checked + label, ul#grav_list_2 input[type='radio']:checked + label {
	    border: #0f0 2px solid;
	}
	ul#grav_list input[type='radio'] + label > img {
		border-radius: 30px;
	}
	.settings {
		margin-top: 50px;
	}
	table.table-userlist {
		background: rgba(255,255,255,.15);
		margin-top: -1px;
		margin-left: -1px;
	}
	table.table-userlist tr {
		margin: 1px;
	}
	table.table-userlist td {
		border: rgba(0,0,0,.45) 1px solid;
		padding: 5px;
	}
	.mce-tinymce {
		width: 60% !important;
		margin-left: 10px !important;
	}
	</style>

<?php 
	if($localcode) {
    echo '<script src="../js/jquery.min.js"></script>';
	} else {
    echo '<script type="text/javascript" src="http://code.jquery.com/jquery-2.1.0.min.js"></script>';
	}
	?>
    <script src="../js/bootstrap.min.js"></script>
    <script src="../js/holder.js"></script>
    <script src="../js/jquery.smoothscroll.js"></script>
    <script src="../js/blag.js"></script>

  </head>
<body>

	<div class="alert-error" id="errordiv">
		Error goes here
	</div>

<div class="header-admin" style="margin-bottom:5px">
						<span class="header-content">
							<a href="../index.php" class="btn homebtn"><i class="fa fa-home"></i></a>
							<a href="#" type="submit" name="Logout" class="btn-lock" onclick="document.logout.submit();"><i class="fa fa-lock"></i></a>
							<a href="../user.php?u=<?php echo $_SESSION['user']; ?>" class="btn btn-random"><i class="fa fa-user"></i></a>
							<a href="admin.php" class="btn btn-random"><i class="fa fa-dashboard"></i></a>
							<a href="../edit.php" class="btn btn-random"><i class="fa fa-pencil"></i></a>
							<span class='msg-welcome'>Heyo, <?php echo strtok($_SESSION['username'], ' '); ?>!</span>
						</span>
					</div>

	<?php
		//Read from the pages file to get contents because an efficient database is too efficient.

	if ($_SESSION['mode'] === 'admin') {

		if(isset($_POST['savesettings'])) {

			if(!isset($_POST['usetinymce'])) {
				$_POST['usetinymce'] = 'false';
			}
			if(!isset($_POST['usepace'])) {
				$_POST['usepace'] = 'false';
			}

			$settings = '<?php
			$title = "' . addslashes($_POST['sitename']) . '";
			$greeting = "' . addslashes($_POST['sitegreeting']) . '";
			$greetingContent = "' . addslashes($_POST['sitegreeting-content']) . '";
			$theme = "' . $_POST['theme'] . '";
			$usetinymce = "' . $_POST['usetinymce'] . '";
			$usepace = "' . $_POST['usepace'] . '";
			$localcode = "' . $_POST['uselocalcode'] . '";
			$grav_default = "' . $_POST['grav_default'] . '";
			$grav_rating = "' . $_POST['grav_rating'] . '";
			$grav_custom = "' . $_POST['grav_custom'] . '";
			$usecustombg = "' . $_POST['usecustombg'] . '";
			$custombg = "' . $_POST['custombg'] . '";
			$showpageloadtime = "' . $_POST['showpageloadtime'] . '";
			';

			$fp = fopen("../includes/config.php", "w");
        	fwrite($fp, $settings);
        	fclose($fp);

        	$_SESSION['theme'] = $_POST['theme'];

        	header('Location: ' . $_SERVER['REQUEST_URI']);
		}

		require('../includes/config.php');

		?>
<section class="tabs tab-menu">
	<ul class="tab-links">
		<li class=""><a href="" onclick="$('#savesettingsbutton').click()">Save settings</a></li>
		<li class="active"><a href="#tab-titles">Titles</a></li>
		<li class=""><a href="#tab-colors">Colors</a></li>
		<li class=""><a href="#tab-includes">Includes</a></li>
		<!-- <li class=""><a href="#tab-display">Display</a></li> -->
		<li class=""><a href="#tab-gravatar">Gravatar</a></li>
		<li class=""><a href="#tab-users" onclick="getUserlist()">User list</a></li>
	</ul>
</section>
<div class="main-container-admin tabs">
<section class="settings">
	<form action="" class="tab-content" method="post" name="savesettings" id="savesettings">
<!-- Site greeting, name and stuff like that -->
		<div class="admin-control admin-control-style tab active" id="tab-titles">
		<div class="ac-title">Titles:</div>

		<label class="acc-title">Site Name:</label>
		<input class="acc-content" name="sitename" id="sitename" type="text" value="<?php echo $title; ?>">

		<label class="acc-title">Site greeting:</label>
		<input class="acc-content" name="sitegreeting" id="sitegreeting" type="text" value="<?php echo $greeting; ?>">
		<label class="acc-title">Site greeting content:</label>
		<textarea class="acc-content" name="sitegreeting-content" id="sitegreeting-content" type="text"><?php echo $greetingContent; ?></textarea>

		</div>
		<div class="admin-control admin-control-settings-color tab" id="tab-colors">
		<div class="ac-title">Color settings:</div>
<!-- Stylesheet settings -->
		<ul class="acc-options-list">
		<li><input class="acc-radio" type="radio" name="theme" value="light" size="17" <?php echo ($theme=='light')?'checked':'' ?>><span class="acc-content">Light stylesheet</span>
		<li><input class="acc-radio" type="radio" name="theme" value="fancy" size="17" <?php echo ($theme=='fancy')?'checked':'' ?>><span class="acc-content">Fancy stylesheet</span>
		<li><input class="acc-radio" type="radio" name="theme" value="custom" size="17" <?php echo ($theme=='custom')?'checked':'' ?>><span class="acc-content">Custom stylesheet</span>
		<li><input class="acc-checkbox" type="checkbox" name="usecustombg" value="true" size="17" <?php echo ($usecustombg=='true')?'checked':'' ?>><span class="acc-content">Use custom image for background? (use fancy stylesheet)</span>
		<li><input class="acc-content" name="custombg" id="custombg" type="text" value="<?php echo $custombg ?>" placeholder="URL of custom background">

		<li><a href="http://villa7.github.io/color-helper" target="_blank">Das color helper</a>
		</ul>

		</div>

<!-- Main site settings -->
		<div class="admin-control admin-control-settings-includes tab" id="tab-includes">
		<div class="ac-title">Include-y stuff:</div>
		<ul class="acc-options-list">
		<li><input class="acc-checkbox" type="checkbox" name="usetinymce" value="true" size="17" <?php echo ($usetinymce=='true')?'checked':'' ?>><span class="acc-content">Use TinyMCE?</span>
		<li><input class="acc-checkbox" type="checkbox" name="usepace" value="true" size="17" <?php echo ($usepace=='true')?'checked':'' ?>><span class="acc-content">Use PACE for pageload animations?</span>
		<li><input class="acc-checkbox" type="checkbox" name="uselocalcode" value="true" size="17" <?php echo ($localcode=='true')?'checked':'' ?>><span class="acc-content">Use only local files?</span>
		<li><input class="acc-checkbox" type="checkbox" value="true" name="showpageloadtime" size="17" <?php echo ($showpageloadtime=='true')?'checked':'' ?>><span class="acc-content">Show pageload time?</span>
		</ul>

		</div>
<!-- Site reset -->
		<div class="admin-control admin-control-reset tab" id="tab-display">
		<div class="ac-title">Display settings:</div>
		<ul class="acc-options-list">
		<li><input class="acc-checkbox" type="checkbox" value="true" size="17"><span class="acc-content">Display stuff?</span>
		</ul>
		</div>
<!-- Gravatar stuff -->
		<div class="admin-control admin-control-gravatar tab" id="tab-gravatar">
		<div class="ac-title">Gravatar settings:</div>
		<label class="acc-title">Default gravatar</label>
		<p>
		<ul class="acc-options-list" id="grav_list">
		<!-- <li><input class="acc-radio" type="radio" name="grav_default" value="404" size="17" <?php echo ($grav_default=='404')?'checked':'' ?>><label class="acc-content"><img src="http://www.gravatar.com/avatar/00000000000000000000000000000000?d=404&f=y" /></label> -->
		<li><input class="acc-radio" type="radio" name="grav_default" value="mm" id="mm" size="17" <?php echo ($grav_default=='mm')?'checked':'' ?>><label class="" for="mm"><img src="http://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y"/></label>
		<li><input class="acc-radio" type="radio" name="grav_default" value="identicon" id="identicon" size="17" <?php echo ($grav_default=='identicon')?'checked':'' ?>><label class="" for="identicon"><img src="http://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=y"/></label>
		<li><input class="acc-radio" type="radio" name="grav_default" value="monsterid" id="monsterid" size="17" <?php echo ($grav_default=='monsterid')?'checked':'' ?>><label class="" for="monsterid"><img src="http://www.gravatar.com/avatar/00000000000000000000000000000000?d=monsterid&f=y"/></label>
		<li><input class="acc-radio" type="radio" name="grav_default" value="wavatar" id="wavatar" size="17" <?php echo ($grav_default=='wavatar')?'checked':'' ?>><label class="" for="wavatar"><img src="http://www.gravatar.com/avatar/00000000000000000000000000000000?d=wavatar&f=y"/></label>
		<li><input class="acc-radio" type="radio" name="grav_default" value="retro" id="retro" size="17" <?php echo ($grav_default=='retro')?'checked':'' ?>><label class="" for="retro"><img src="http://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y"/></label>
		<li><input class="acc-radio" type="radio" name="grav_default" value="custom" id="custom" size="17" <?php echo ($grav_default=='custom')?'checked':'' ?>><label class="" for="custom"><img height="80" width="80" src="<?php echo $grav_custom ?>" /></label>
		&emsp;Custom: <input type="text" name="grav_custom" value="<?php echo $grav_custom ?>" placeholder="Enter image url:" />
		</ul>
		</p>
		<p>
		<br><br><br><br><br><br><br> <!-- SO UGLY -->
		<label class="acc-title">Allowed gravatars</label>
		<ul class="acc-options-list" id="grav_list_2">
		<li><input class="acc-radio" type="radio" name="grav_rating" value="g" id="g" size="17" <?php echo ($grav_rating=='g')?'checked':'' ?>><label class="" for="g"><img src="http://s.gravatar.com/images/gravatars/ratings/0.gif?121" /></label>
		<li><input class="acc-radio" type="radio" name="grav_rating" value="pg" id="pg" size="17" <?php echo ($grav_rating=='pg')?'checked':'' ?>><label class="" for="pg"><img src="http://s.gravatar.com/images/gravatars/ratings/1.gif?121" /></label>
		<li><input class="acc-radio" type="radio" name="grav_rating" value="r" id="r" size="17" <?php echo ($grav_rating=='r')?'checked':'' ?>><label class="" for="r"><img src="http://s.gravatar.com/images/gravatars/ratings/2.gif?121" /></label>
		<li><input class="acc-radio" type="radio" name="grav_rating" value="x" id="x" size="17" <?php echo ($grav_rating=='x')?'checked':'' ?>><label class="" for="x"><img src="http://s.gravatar.com/images/gravatars/ratings/3.gif?121" /></label>
		</ul>
		</p>
		</div>
		<div class="admin-control admin-control-users tab" id="tab-users" style="padding: 0px 10px 50px 0px; position: fixed; overflow: auto">
		<!-- <div class="ac-title">User list:</div> -->
		<table id="user-table" class="table-userlist">

		</table>
		</div>

		<button type="submit" id="savesettingsbutton" name="savesettings" class="btn btn-submit" style="display:none"></button>
	</form>
	</section>
</div>

	<form action="../login.php" method="post" name="logout" id="logout">
	<input type="hidden" value="logout">
	</form>


<?php
	} else { 
		//If user is not logged in and is not admin
		header('Location: ' . dirname($_SERVER['REQUEST_URI']));
		die();

	}

	if ($usetinymce === 'true') { ?>
	<!-- <script src="//tinymce.cachefly.net/4.0/tinymce.min.js"></script> -->
	<script type="text/javascript" src="../includes/tinymce/tinymce.min.js"></script>
	<script type="text/javascript">
	        tinymce.init({
	        	selector:'textarea#sitegreeting-content',
	        	plugins: [
	        		"autolink lists link image preview",
	        		"searchreplace code fullscreen",
	        		"media table paste contextmenu"
	        	],
	        	toolbar: "undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
	        });
	        setTimeout(function() {
				tinymce.get('sitegreeting-content').dom.loadCSS('../css/blag-light-tinymce.css');
			}, 500); //delay while tinymce loads
	</script>
	<?php } ?>
	<script type="text/javascript">
		getUserlist = function() {
			$('#user-table').empty();
			var userlist = 'all';
			$.post("../dbquery.php", { userlist: userlist }, function(result){
		 		$('#user-table').append(result);
		 		if(result == 0) {
		 			console.log('userlist request failed');
		 		}
	 		});  
		}
		$(document).ready(function() {
	    	$('.tabs .tab-links a').on('click', function(e)  {
		        var currentAttrValue = $(this).attr('href');

		        // Show/Hide Tabs
		        $('.tabs ' + currentAttrValue).show().siblings().hide();

		        // Change/remove current tab to active
		        $(this).parent('li').addClass('active').siblings().removeClass('active');

		        e.preventDefault();
		    });
		});

	</script>

</body>
</html>
