<?php
//error_reporting(0);//remove for debug
$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$starttime = $time;
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <title>D&amp;D 1e CSM Install</title>
  <link rel="stylesheet" href="../css/fonts.css">
    <link rel="stylesheet" href="../css/dndcsm.css">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1, user-scalable=no">

  <!-- <link rel="stylesheet" href="css/bootstrap.min.css"> -->
  <link rel="stylesheet" href="../css/font-awesome.min.css">
    <style type="text/css">
    #wrapper {
        width: 250px;
        height: 600px;
        position: absolute;
        left: 0;right: 0;top:0;bottom:0;margin: auto;
    }
    .install-content-title,
    .install-content,
    .btn-submit {
        width: 100%;
        margin-top: 3px;
        color: #bcc6cc;
        -webkit-transition: all .2s ease-in-out;
          transition: all .2s ease-in-out;
    }
    .install-content {
        background: rgba(255,255,255,.1);
        border: none;
        padding: 2px 0;
        text-indent: 2px;
    }
    .btn-submit {
        background: rgba(255,255,255,.2);
        border: none;
        padding: 5px;
        margin-top: 10px;
    }
    .btn-submit:hover {
        background: rgba(255,255,255,.6);
        cursor: pointer;
    }
    input:active,
    input:focus,
    button:active,
    button:focus {
    outline: 0 none;
    background: rgba(255,255,255,.3);
}

    </style>

    <script type="text/javascript" src="../js/jquery.min.js"></script>

    <script type="text/javascript" src="../js/app.js"></script>
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

            //Create MySQL table for characters
            $sql = 'CREATE TABLE Characters(
                PID INT NOT NULL AUTO_INCREMENT, 
                PRIMARY KEY(PID),
                owner_name VARCHAR(50), 
                character_name VARCHAR(50),
                gender VARCHAR(50),
                race VARCHAR(50),
                class VARCHAR(50),
                alignment VARCHAR(50),
                platinum INT,
                electrum INT,
                gold INT,
                copper INT,
                silver INT, 
                xp INT,

                strength INT,
                intelligence INT,
                wisdom INT,
                dexterity INT,
                constitution INT,
                charisma INT,

                to_hit INT,
                damage INT,
                magical_attack_adjustment INT,
                reaction_attack_adjustment INT,
                hp_bonus INT,
                max_henchmen INT,

                weight_allowance INT,
                defence_bonus INT,
                system_shock INT,
                loyalty_base INT,
                bend_lift INT,
                resurrection_survival INT,
                reaction_adjustment INT,

                ppd_magic INT,
                pet_or_poly INT,
                rod_staff_wand INT,
                breath_weapon INT,
                spells INT,

                hit_points INT, 
                armor_class INT, 
                starting_age INT,
                height VARCHAR(10),
                weight VARCHAR(10)
                )';

            // Execute query
            if (mysqli_query($db,$sql)) {
              echo "<script type='text/javascript'>d.success('Table \'Characters\' Created successfully')</script>";
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
        echo "<script type='text/javascript'>d.error('D&amp;DCSM is already installed')</script>";
    }

    

}

?>
  <div id="wrapper">
  <?php if (!isset($installed)) { ?>

  <h1>Install D&amp;D CSM</h1>
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
  </p>
  </form>

  <?php } else { ?>
  <h1>D&amp;D Character Sheet Manager is already installed or has just been installed.</h1>
  <h3><button class="btn btn-submit" onclick="document.location = '../';">Return to Main Page</button></h3>
  <?php } ?>
  </div>

  <?php
    include('../includes/footer.php');
  ?>

  <!--<script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-48081162-1', 'villa7.github.io');
    ga('send', 'pageview');

  </script> -->
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
