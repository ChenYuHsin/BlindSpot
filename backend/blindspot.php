<?php 
   session_start();

	require'../config/init.php';

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

	    			$sql = "INSERT IGNORE INTO `member`(`fb_id`, `l_name`, `f_name`, `birthday`, `gender`, `e-mail`, `status`) 
	    								VALUES ('$f_id', '$l_name', '$f_name', '$birth', '$gender', '$email', 'login')";
	    			$insert_result = $this->db_exec($sql);

	    			$sql = "SELECT m_id FROM `member` WHERE fb_id = $f_id";
	    			$result = $this->db_query($sql);
	    			$_SESSION['user_id'] = $result[0]['m_id'];
	    			return "success";

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

		    			$f_name = $_POST['fname'];
		    			$f_name = strip_tags($l_name);
		    			$f_name = htmlspecialchars($l_name);

		    			$intro = $_POST['introduction'];
		    			$intro = strip_tags($intro);
		    			$intro = htmlspecialchars($intro);

		    		}catch(Exception $e){
	    				return "fail";
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
	    			return json_encode($result);	# code...
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
	    				$c_content = $_POST['c_content'];//<script>alert("159");</script>
		    			$c_content = strip_tags($c_content);//alert("159")
		    			$c_content = htmlspecialchars($c_content);//&ltscript&gtalert(&quot159&quot);&lt/script&gt    			 
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
	    		default:
	    			# code...
	    			break;
	    	}
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
	}

	$Register = new register();
	echo $Register->getinfo();

 ?>