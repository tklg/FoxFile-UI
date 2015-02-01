<?php
session_start();
require ('../includes/config.php');
if(!isset($_SESSION['uid'])) {
  $_SESSION['uid'] = 0;
}
if(!isset($_SESSION['access_level'])) {
  $_SESSION['access_level'] = 0;
}
error_reporting($show_errors);//remove for debug
$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$starttime = $time;
?>

<!DOCTYPE html>
<html lang="en">
<!--
 * _install/index.php - FoxFile
 * (C) Theodore Kluge 2014-2015
 * villa7.github.io
 -->
<head>
    <title><?php echo $title ?> Install</title>
  <link rel="stylesheet" href="../css/fonts.css">
    <link rel="stylesheet" href="../css/foxfile.css">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">

  <!-- <link rel="stylesheet" href="css/bootstrap.min.css"> -->
  <link rel="stylesheet" href="../css/font-awesome.min.css">
    <style type="text/css">

    </style>

</head>
<body>

  <div class="alertbox"></div>

  <?php

    require('../includes/user.php');

    if (isset($_POST["install"])) {

    $string = '<?php 

    $dbuname = "' . $_POST['dbuname'] . '";

    $dbupass = "' . $_POST['dbupass'] . '";

    $dbhost = "' . $_POST['dbhost'] . '";

    $dbname = "' . $_POST['dbname'] . '";

    ';

    if (!isset($installed)) {

        $fp = fopen("../includes/user.php", "w");

        fwrite($fp, $string);

        fclose($fp);

        $db = mysqli_connect($dbhost,$dbuname,$dbupass,$dbname);
        if (mysqli_connect_errno()) {
        //echo "Failed to connect to MySQL: " . mysqli_connect_error();
        echo "<script type='text/javascript'>d.error('MySQL conn failed: " . mysqli_connect_error() . "')</script>";
        } else {
            //Create MySQL table for users
            $sql = 'CREATE TABLE Users(
                PID INT NOT NULL AUTO_INCREMENT, 
                PRIMARY KEY(PID),
                uName VARCHAR(50), 
                pass VARCHAR(512), 
                access_level INT
                )';

            //$upass = sha2($_POST['upass'], 512);
            $default = "not set";
            $options = [
                'cost' => 11,
            ];
            
            $uname = addslashes($_POST['uname']);
            $upass = password_hash(addslashes($_POST['upass']), PASSWORD_BCRYPT, $options);

            // Execute query
            if (mysqli_query($db,$sql)) {
              echo "<script type='text/javascript'>d.success('Table \'Users\' Created successfully')</script>";
            } else {
              echo "<script type='text/javascript'>d.error('MySQL Query failed: " . mysqli_error($db) . "')</script>";
            }

            $sql = "INSERT INTO Users (uName, pass, access_level)
                    VALUES ('$uname', 
                    '$upass',
                    '2')";

            if (mysqli_query($db,$sql)) {
              echo "<script type='text/javascript'>d.success('User \'". $uname ."\' created successfully')</script>";
            } else {
              echo "<script type='text/javascript'>d.error('MySQL Query failed: " . mysqli_error($db) . "')</script>";
            }

            $sql = 'CREATE TABLE Items(
                PID INT NOT NULL AUTO_INCREMENT, 
                PRIMARY KEY(PID),
                owner VARCHAR(50),
                item_name VARCHAR(100),
                item_amount INT,
                item_value INT,
                item_value_unit VARCHAR(4)
                )';

            if (mysqli_query($db,$sql)) {
              echo "<script type='text/javascript'>d.success('Table \'Items\' Created successfully')</script>";
            } else {
              echo "<script type='text/javascript'>d.error('MySQL Query failed: " . mysqli_error() . "')</script>";
            }

            $string = '<?php 

            $dbuname = "' . $_POST['dbuname'] . '";

            $dbupass = "' . $_POST['dbupass'] . '";

            $dbhost = "' . $_POST['dbhost'] . '";

            $dbname = "' . $_POST['dbname'] . '";

            $installed = true;

            ';

            $fp = fopen("../includes/user.php", "w");

            fwrite($fp, $string);

            fclose($fp);

            header("Location: index.php");

        } 

    } else {
        echo "<script type='text/javascript'>d.error('FoxFile is already installed.')</script>";
    }

    

}

?>
  <div id="wrapper">
  <?php if (!isset($installed)) { ?>

  <h1>FoxFile Setup</h1>
  <hr>

  <form action="" method="post" name="install" id="install">
  <p>
      <label class="install-content-title" for="uname"><i class="fa fa-user"></i> Set an Admin username.</label>
      <input class="install-content" name="uname" type="text" id="uname" value="" required> 
  </p>
  <p>
      <label class="install-content-title" for="upass"><i class="fa fa-lock"></i> Set an Admin password.</label>
      <input class="install-content" name="upass" type="password" id="upass" required> 
  </p>
  <p>
      <label class="install-content-title" for="dbuname"><i class="fa fa-cog"></i> Enter the database username.</label>
      <input class="install-content" name="dbuname" type="text" id="dbuname" value="" required> 
  </p>
  <p>
      <label class="install-content-title" for="dbupass"><i class="fa fa-cog"></i> Enter the database password.</label>
      <input class="install-content" name="dbupass" type="password" id="dbupass" required> 
  </p>
  <p>
      <label class="install-content-title" for="dbhost"><i class="fa fa-cog"></i> Enter the database host url.</label>
      <input class="install-content" name="dbhost" type="text" id="dbhost" value="" required> 
  </p>
  <p>
      <label class="install-content-title" for="dbname"><i class="fa fa-cog"></i> Enter the database name.</label>
      <input class="install-content" name="dbname" type="text" id="dbname" required> 
  </p>
  <p>
      <button class="btn btn-submit" type="submit" name="install" value="Install"><b>Install</b></button>
      <button class="btn btn-submit" name="moar" value="Moar"><b>Moar</b></button>
  </p>
  </form>

  <?php } else { ?>
  <h1>FoxFile is already installed.</h1>
  <h3><button class="btn btn-submit" onclick="document.location = '../';">Return to Index</button></h3>
  <?php } ?>
  </div>

  <?php
	if ($showfooter) include('includes/footer.php');
  	?>

  <?php
  $time = microtime();
  $time = explode(' ', $time);
  $time = $time[1] + $time[0];
  $finishtime = $time;
  $total_time = round(($finishtime - $starttime), 4);
  echo '<script type="text/javascript">$("#loadtime").html("page generated in ' . $total_time . ' seconds.");</script>';
  ?>

</body>
</html>
