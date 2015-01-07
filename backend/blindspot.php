<?php 
   session_start();

	include_once'../config/init.php';
	include_once './scws.php';
	class register{

		public $_config;
		/**
		*	Constructor
		*/
		function __counstrut($_config = ''){

			/**
	         * Init config
	         */
	        empty($config) ? $this->initConfig() : $this->_config = $config;
	        
	        /**
	         * Init database link
	         */
	        $this->_initDb();
		}


	    public function getinfo(){

	    	$func = $_POST['func'];

	    	switch ($func) {

	    		case 'insert_member': //如果曾經註冊過，就回傳1
	    			try{
		    			$f_id = $_POST['facebook_id'];
		    			$l_name = $_POST['last_name'];
		    			$f_name = $_POST['first_name'];
		    			$email = $_POST['email'];
		    			$gender = $_POST['gender'];
		    			$birth = $_POST['birthday'];	    				
	    			}catch(Exception $e){
	    				return "fail";
	    			}

	    			//判斷是否有登入過
	    			$sql = "SELECT m_id FROM `member` WHERE fb_id = $f_id";
	    			$result = $this->db_query($sql);
	    			if(!isset($result[0]['m_id']) || empty($result[0]['m_id'])){

		    			//如果第一次註冊就新增一個會員，不然就跳過
		    			$sql = "INSERT IGNORE INTO `member`(`fb_id`, `l_name`, `f_name`, `birthday`, `gender`, `e-mail`, `status`) 
		    								VALUES ('$f_id', '$l_name', '$f_name', '$birth', '$gender', '$email', 'login')";
		    			$insert_result = $this->db_exec($sql);


		    			//把會員id記到SESSION
		    			$sql = "SELECT m_id FROM `member` WHERE fb_id = $f_id";
		    			$result = $this->db_query($sql);
		    			$_SESSION['user_id'] = $result[0]['m_id'];
		    			$user_id = $_SESSION['user_id'];

		    			//create會員資料夾
		    			$source_dir = "../images/profile/0";
		    			$destination_dir = "../images/profile/$user_id";
						$this->recurse_copy($source_dir, $destination_dir);

		    			//下載會員的大頭照
		    			$download_url = "http://graph.facebook.com/$f_id/picture?type=large";
						$save_route = "../images/profile/$user_id/sticker.png";
						file_put_contents($save_route, file_get_contents($download_url));
		    			
		    			//下載會員的封面照

	    			}else{
		    			//把會員id記到SESSION
		    			$_SESSION['user_id'] = $result[0]['m_id'];
		    			$user_id = $_SESSION['user_id'];
	    			}

	    			$this->save_log($user_id, 'login');
	    			return "success";

	    			break;

	    		case 'if_login'://剛進首頁先判斷是不是有登入過，有就轉跳到profile.php
	    			if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
	    				$result['status'] = "notlogin";
		    			return json_encode($result);
	    			}else{
	    				$result['status'] = "login";
		    			return json_encode($result);
	    			}
	    			break;

	    		case 'logout':
	    			$user_id = $_SESSION['user_id'];
	    			$_SESSION['user_id']='';
	    			$result['status'] = "success";

	    			$this->save_log($user_id, 'logout');

	    			return json_encode($result);	
	    			break; 

	    		case 'search_name':
	    			$search_name = $_POST['input'];
	    			$sql = "SELECT `m_id`, `l_name`, `f_name`  FROM `member` WHERE (l_name like '%$search_name%' or f_name like '%search_name%')";
	    			$search_result = $this->db_query($sql);
	    			
	    			if (!isset($search_result[0]['m_id']) || empty($search_result[0]['m_id'])) {
	    			$result['status'] = "fail";  //判斷fail，不回傳值	
	    			return json_encode($result);
	    			}else{
	    				$result['status'] = "success";
		    			$result['data'] = $search_result;
		    			return json_encode($result);
	    			}
	    			break;

	    		case 'get_personal_info':

	    			$result = array();
	    			try{
		    			$friend_id = $_POST['friend_id'];
	    			}catch(Exception $e){
	    				$result['status'] = "fail";
	    				return json_encode($result);
	    			}

	    			if($friend_id == 'me' || $friend_id == $_SESSION['user_id']){//如果是接到me
	    				if(!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])){//現在沒有登入
		    				$result['status'] = "notlogin";
		    				return json_encode($result);
	    				}else{//個人看自己的首頁
		    				$friend_id = $_SESSION['user_id'];
		    				$result['status'] = "me";
	    				}
	    			}else if(empty($friend_id)){
	    				$result['status'] = "fail";
	    				return json_encode($result);
	    			}else{
		    			$result['status'] = "friend";
	    			}


	    			$sql = "SELECT `m_id`, `l_name`, `f_name`, `intro` FROM `member` WHERE m_id = $friend_id";
	    			$q_result = $this->db_query($sql);
	    			if(sizeof($q_result) > 0){
		    			$result['data'] = $q_result;
		    			return json_encode($result);
	    			}else{
		    			$result['status'] = "invaliduser";
		    			return json_encode($result);
	    			}

	    		break;

	    		case 'save_personal_info':

	    			try{
	    				$l_name = $_POST['lname'];
	    				$l_name = strip_tags($l_name);
	    				$l_name = htmlspecialchars($l_name);
                    	$l_name = addslashes($l_name);

		    			$f_name = $_POST['fname'];
		    			$f_name = strip_tags($f_name);
		    			$f_name = htmlspecialchars($f_name);
		    			$f_name = addslashes($f_name);
		    			
		    			$intro = $_POST['introduction'];
		    			$intro = strip_tags($intro);
		    			$intro = htmlspecialchars($intro);
		    			$intro = addslashes($intro);

		    		}catch(Exception $e){
	    				$result['status'] = "fail";
	    				return json_encode($result);
	    			}
					
	    			$user = $_SESSION['user_id'];
					$sql = "UPDATE `member`
							SET l_name = '$l_name', f_name = '$f_name', intro = '$intro'
							WHERE m_id = $user";
	    			$change_result = $this->db_exec($sql);
	    			$result['status'] = "success";
	    			return json_encode($result);	# code...
	    			break;

	    		case 'post_on_wall':

	    			try{
	    				$content = $_POST['content'];
	    				$content = strip_tags($content);
	    				$content = htmlspecialchars($content);
		    			$content = addslashes($content);
		    			$friend_id = $_POST['friend_id'];

		    		}catch(Exception $e){
	    				$result['status'] = "fail";
	    				return json_encode($result);
	    			}
					
	    			$user = $_SESSION['user_id'];
					$sql = "INSERT INTO `post`(p_content,receiverid,senderid)
							VALUES ('$content', '$friend_id', '$user')";
	    			$change_result = $this->db_exec($sql);
	    			$sql = "SELECT `pid`,`p_content`,`senderid`, m.l_name, m.f_name, IFNULL(a.count_comment, 0) as count_comment
	    					FROM `post` p
	    					LEFT JOIN `member` m
	    						on p.senderid = m.m_id
	    					LEFT JOIN (
	    						SELECT COUNT(c_id) as count_comment, p_id FROM `comment` GROUP BY p_id
	    						) a
								on p.pid = a.p_id
	    					ORDER BY pid DESC
	    					LIMIT 0,1 ";
	    			$q_result = $this->db_query($sql);
	    			$result['status'] = 'success';
	    			$result['data'] = $q_result;


	    			$this->save_log($user, 'post_on_wall');
	    			//重新整理接受po文人的關鍵字
				    $scws = new simpleCSWS();
				    $keyword = $scws->getoneskeyword($friend_id);
				    $sql = "UPDATE `member` SET `keyword` = '$keyword' WHERE `m_id` = $friend_id";
				    $key_exec = $this->db_exec($sql);
	    			return json_encode($result);
	    			break;

	    		case 'get_post':

	    			try{
	    				$friend_id = $_POST['friend_id'];

		    		}catch(Exception $e){
	    				$result['status'] = "fail";
	    				return json_encode($result);
	    			}
					
	    			$sql = "SELECT `pid`,`p_content`,`senderid`, m.l_name, m.f_name, IFNULL(a.count_comment, 0) as count_comment,`love`,`hate`
	    					FROM `post` p
	    					LEFT JOIN `member` m
	    						on p.senderid = m.m_id
	    					LEFT JOIN (
	    						SELECT COUNT(c_id) as count_comment, p_id FROM `comment` GROUP BY p_id
	    						) a
								on p.pid = a.p_id
	    					WHERE receiverid = '$friend_id'
	    					ORDER BY p.updatetime DESC";
	    			$q_result = $this->db_query($sql);
	    			$result['status'] = 'success';
	    			$result['data'] = $q_result;
	    			return json_encode($result);	# code...
	    			break;

	    		case 'comment_on_post':

	    			try{
	    				$c_content = $_POST['c_content'];//<script alert("159");</script
		    			// $c_content = strip_tags($c_content);//alert("159")
		    			// $c_content = htmlspecialchars($c_content);//&ltscript&gtalert(&quot159&quot);&lt/script&gt    			 
		    			$p_id = $_POST['p_id'];

		    		}catch(Exception $e){
	    				$result['status'] = "fail";
	    				return json_encode($result);
	    			}
					
	    			$user = $_SESSION['user_id'];
					$sql = "INSERT INTO `comment`(c_content,p_id,sender_id)
							VALUES ('$c_content', '$p_id', '$user')";
	    			$change_result = $this->db_exec($sql);
					$sql = "SELECT `sender_id`,`c_content`,`hate`,`love`,m.l_name, m.f_name
	    					FROM `comment` c
	    					LEFT JOIN `member` m
	    						on c.sender_id = m.m_id
	    					WHERE p_id = '$p_id'
	    					ORDER BY `c_id`";
	    			$q_result = $this -> db_query($sql);
	    			$result['status'] = 'success';
	    			$result['data'] = $q_result;
	    			return json_encode($result);
	    			break;
	    		
	    		case 'get_comment':
	    			try{
	    				$p_id = $_POST['p_id'];
	    			}
	    			catch(Exception $e){
	    				$result['status'] = "fail";
	    				return json_encode($result);
	    			}

	    			$user = $_SESSION['user_id'];
	    			$sql = "SELECT `sender_id`,`c_content`,`hate`,`love`,m.l_name, m.f_name
	    					FROM `comment` c
	    					LEFT JOIN `member` m
	    						on c.sender_id = m.m_id
	    					WHERE p_id = '$p_id'
	    					ORDER BY `c_id`";
	    			$q_result = $this -> db_query($sql);
	    			$result['status'] = 'success';
	    			$result['data'] = $q_result;
	    			return json_encode($result);
					break;

				case 'love_post':
					try{
						$p_id = $_POST['p_id'];
						$love = $_POST['action'];
					} 
					catch(Exception $e){
						$result['status'] = "fail";
						return json_encode($result);
					}

					if($love == 'love'){
						$sql = "UPDATE `post`
								SET `love` = `love` + 1
								WHERE `pid` = $p_id";
					}
					else if ($love == 'hate') {
						$sql = "UPDATE `post`
								SET `hate` = `hate` +1
								WHERE `pid` = $p_id";
						# code...
					}
					else{
						$result['status'] = "fail";
						return json_encode($result);
					}
					$change_result = $this->db_exec($sql);
					$result['status'] = "success";
	    			return json_encode($result);
				break;

				case 'upload_photo':

					try {
						$files = $_FILES;
		    			$user_id = $_SESSION['user_id'];
					} catch (Exception $e) {
						$result['status'] = "fail";
						return json_encode($result);
					}
					foreach ($files as $key => $value) {

						if(!empty($value['tmp_name'])){
			    			$download_url = $value['tmp_name'];
			    			$photo_name = $key;
							$save_route = "../images/profile/$user_id/$photo_name.png";
							// file_put_contents($save_route, file_get_contents($download_url));

							if($photo_name == 'sticker'){
								$this->resize_photo($download_url, 200, 200, $save_route);
							}else if($photo_name == 'back_photo'){
								$this->resize_photo($download_url, 200, 200, $save_route);
							}
						}
					}
					header('Location:../profile.php');
					$result['status'] = "success";
	    			return json_encode($result);
				break;
	    		default:
	    			# code...
	    			break;
	    	}
	    }

		function recurse_copy($src,$dst) { 
		    $dir = opendir($src); 
		    @mkdir($dst); 
		    while(false !== ( $file = readdir($dir)) ) { 
		        if (( $file != '.' ) && ( $file != '..' )) { 
		            if ( is_dir($src . '/' . $file) ) { 
		                recurse_copy($src . '/' . $file,$dst . '/' . $file); 
		            } 
		            else { 
		            	if($file != 'back_photo.png')
			                copy($src . '/' . $file,$dst . '/' . $file); 
		            } 
		        } 
		    } 
		    closedir($dir); 
		} 

		function resize_photo($photo, $width_thumb, $height_thumb, $dst) { 
			$src = imagecreatefromjpeg($photo);
			// get the source image's widht and hight
			$src_w = imagesx($src);
			$src_h = imagesy($src);
			 
			// assign thumbnail's widht and hight
			if($src_w > $src_h){
				$thumb_w = $width_thumb;
				$thumb_h = intval($src_h / $src_w * 100);
			}else{
				$thumb_h = $height_thumb;
				$thumb_w = intval($src_w / $src_h * 100);
			}
			 			 
			// start resize
			imagecopyresized($thumb, $src, 0, 0, 0, 0, $width, $height, $src_w,  $src_h);
			 
			 
			// save thumbnail
			imagejpeg($thumb, $dst);
		} 

	    public function db_query($sql){

			$Database = new DataBase($this->_config['host'], 
					$this->_config['username'], 
					$this->_config['password'], 
					$this->_config['dbname']);
			$Database->Connect();
			$Database->Query=$sql;
			$Database->Query();
			$result = $Database->queryResult->fetchAll();
			$Database->close();

			return $result;
	    }

	    public function db_exec($sql){
	    	
			$Database = new DataBase($this->_config['host'], 
					$this->_config['username'], 
					$this->_config['password'], 
					$this->_config['dbname']);
			$Database->Connect();
			$Database->Exec=$sql;

			if($Database->Exec()){
				$Database->close();
				return true;
			}else{
				$Database->close();
				return false;
			}

	    }
	    public function save_log($user_id, $action){

			//紀錄log
			$sql = "INSERT INTO `log`(`m_id`, `action`) VALUES ('$user_id', '$action')";
			$insert_result = $this->db_exec($sql);

	    }
	}

	$Register = new register();
	echo $Register->getinfo();

 ?>