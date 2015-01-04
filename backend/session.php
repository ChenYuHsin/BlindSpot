<?php 
   session_start();

echo "Your SESSION['user_id']：";
echo isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Not Login';

 ?>