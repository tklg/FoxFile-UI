<?php
session_start();

require_once 'includes/OAuth2/Google/autoload.php';

function checkToken() {
    $client = getClient();
    if ($client->isAccessTokenExpired()) { //so convenient :p
        $client->refreshToken($_SESSION['refresh_token']);
        $access_token = $client->getAccessToken();
        $_SESSION['access_token'] = $access_token;
        $tokeninfo = json_decode($access_token);
        $_SESSION['token'] = $tokeninfo->access_token;
    }
}
function getClient() {
    $client = new Google_Client();
    $client->setAuthConfigFile('includes/OAuth2/client_secret.json');
    $client->setAccessToken($_SESSION['access_token']);
    return $client;
}
function getBatchClient() {
    $client = new Google_Client();
    $client->setUseBatch(true);
    $client->setAuthConfigFile('includes/OAuth2/client_secret.json');
    $client->setAccessToken($_SESSION['access_token']);
    return $client;
}
function getMailService() {
    return $driveService = new Google_Service_Gmail(getClient());
}
function getBatchMailService() {
    return $driveService = new Google_Service_Gmail(getBatchClient());
}
function getMail($keywords) {
    checkToken();
    $pageToken = NULL;
    $messages = array();
    $opt_param = array();
    $userId = 'me';

    $params = array(
        'maxResults' => '500',
        'pageToken' => $pageToken
    );
    if ($keywords != '') $params['q'] = $keywords;
    do {
        try {
            if ($pageToken) {
                $params['pageToken'] = $pageToken;
            }
            $messagesResponse = getMailService()->users_messages->listUsersMessages($userId, $params);
            if ($messagesResponse->getMessages()) {
                $messages = array_merge($messages, $messagesResponse->getMessages());
                $pageToken = $messagesResponse->getNextPageToken();
            }
        } catch (Exception $e) {
            print 'An error occurred: ' . $e->getMessage();
        }
    } while ($pageToken);
    if (count($messages) == 0) {
        echo "No files found.";
        return '';
    } else {
        return json_encode($messages);
    }
}
function downloadMail($keywords, $saveImages, $saveText) {
    checkToken();
    $client = getBatchClient();
    $mail = getMail($keywords);
    //echo $mail;
    $mail = json_decode($mail, true);
    $batch = new Google_Http_Batch($client);
    $params = array();
    $folderId;
    foreach ($mail as $key => $value) {
        $messageId = $value['id'];
        $folderId = $messageId;
        try {
            $message = getBatchMailService()->users_messages->get('me', $messageId);
            $batch->add($message, $messageId);
        } catch (Exception $e) {
            //print '<br>An error occurred: ' . $e->getMessage();
        }
    }
    $results = $batch->execute();
    /*print "<pre>";
    print_r($results);
    print "</pre>";*/
    if (!is_dir('temp/'.$folderId)) mkdir('temp/'.$folderId);
    foreach ($results as $item) { //$results['response-id']
        //echo $item['snippet'].'<br>';
        if (preg_match('/(\.jpg|\.jpeg|\.png|\.bmp|\.gif|\.mov|\.mp4)$/', $item['snippet'])) {
            if ($saveImages) pullFromServer($item['snippet'], $folderId);
            //echo 'pullFromServer';
        } else {
            if ($saveText) file_put_contents('temp/'.$folderId.'/'.$item['id'].'.txt', base64_decode($item['modelData']['payload']['parts'][0]['body']['data']));
            //echo 'text';
        }

    }

    zip($folderId);

}
function pullFromServer($file, $name) {
    $res;
    $filename = end(explode('/', $file));
    $path = str_replace(':', '', "temp/".$name."/".$filename);
    try {
        $res = file_put_contents($path, fopen($file, 'r'));
    } catch (Exception $e) {
        $res = file_put_contents($path, file_get_contents($file));
    }
    return $res;

}
function zip($folder) {
    $zipname = $folder.'.zip';
    $folder = 'temp/'.$folder;

    $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($folder),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    $zip = new ZipArchive;
    $zip->open($folder.'.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);
    foreach ($files as $file) {
        if (!$file->isDir()) {
            $relativePath = basename($file);
            //echo '<br>'.$file.'<br>'.$relativePath;
            $zip->addFile($file, $relativePath);
        }
    }
    $zip->close();
    deleteDir($folder);
    header('Content-Description: File Transfer');
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename='.$zipname);
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize(realpath($folder.'.zip')));
    ob_end_flush();
    readfile(realpath($folder.'.zip'));
    rmdir(realpath($folder.'.zip'));
}
function deleteDir($path) {
    foreach(glob("{$path}/*") as $file) {
        if(is_dir($file)) { 
            deleteDir($file);
        } else {
            unlink($file);
        }
    }
    rmdir($path);
}
//getFilesInFolder('root');
if (isset($_GET['get_mail'])) {
    if (isset($_GET['keywords'])) {
        echo getMail($_GET['keywords']);
    } else {
        echo getMail('in:inbox');
    }
}
if (isset($_POST['get_mail'])) {
    if (isset($_POST['keywords'])) {
        echo getMail($_POST['keywords']);
    } else {
        echo getMail('in:inbox');
    }
}
if (isset($_GET['download_mail'])) {
    if (isset($_GET['keywords'])) {
        downloadMail($_GET['keywords'], $_GET['saveImages'], $_GET['saveText']);
    } else {
        downloadMail('in:inbox', $_GET['saveImages'], $_GET['saveText']);
    }
}
if (isset($_POST['download_mail'])) {
    if (isset($_POST['keywords'])) {
        downloadMail($_POST['keywords'], $_POST['saveImages'], $_POST['saveText']);
    } else {
        downloadMail('in:inbox', $_POST['saveImages'], $_POST['saveText']);
    }
}
/*if (isset($_GET['set_file_contents'])) {
    updateFileContent($_GET['set_file_contents'], $_GET['content']);
}*/