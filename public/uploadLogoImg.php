<?php
	if(isset($_FILES['file']['name'])){
		$serverPath = dirname(__FILE__);
		$filename = $_FILES['file']['name']; $new_name = (string)time();
		$file_extension = pathinfo($filename, PATHINFO_EXTENSION);
		$location = $serverPath."/logo//".$new_name.'.'.$file_extension; // $filename;
	
		$file_name = '';
		if(move_uploaded_file($_FILES['file']['tmp_name'], $location)) {
			$file_name = $new_name.'.'.$file_extension;
		}
		$server_ip = $_SERVER['SERVER_ADDR'];
		echo $file_name;
		// echo json_encode((object)['file_name'=>$file_name, 'server_ip'=>(array)$server_ip]);
		exit;
	}
?>