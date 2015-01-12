<?php

	if( isset($_POST['code']) ) {
		$code = $_POST['code'];

		echo ( $code == "abababc" ) ? "nice" : "FUCK";
	} else {
		echo 'fuck you';
	}

?>

