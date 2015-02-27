<?php
echo "TEST<br>";
if(isset($_GET['404'])) echo '404';
if(isset($_GET['500'])) echo '500';
if(isset($_GET['301'])) echo '301';
?>

<?php
session_start();
require ('includes/config.php');
if(!isset($_SESSION['uid'])) {
	$_SESSION['uid'] = 0;
}
if(!isset($_SESSION['access_level'])) {
	$_SESSION['access_level'] = 0;
}
//error_reporting(0);//remove for debug
$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$starttime = $time;
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <title><?php echo $title ?></title>
    <?php require('includes/header.php'); ?>
    <style type="text/css">
    </style>

    <script type="text/javascript" src="js/jquery.min.js"></script>
  </head>
<body>

	<div class="alertbox"></div>

	<div id="wrapper">

	</div>

	<?php
	if ($showfooter) include('includes/footer.php');
  	?>
  	<script type="text/javascript" src="js/showlog.js"></script>
    <script type="text/javascript" src="js/foxfile.js"></script>

	<?php
	$time = microtime();
	$time = explode(' ', $time);
	$time = $time[1] + $time[0];
	$finishtime = $time;
	$total_time = round(($finishtime - $starttime), 4);
	if ($showpageloadtime) {
		echo '<script type="text/javascript">$("#loadtime").html("page generated in ' . $total_time . ' seconds.");</script>';
	}
	?>
	<a style="display:none;" href="blackhole/" rel="nofollow">Do NOT follow this link or you will be banned from the site!</a>

</body>
</html>
