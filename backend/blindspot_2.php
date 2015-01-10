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

	    		case 'get_post_about':
	    			$user = $_SESSION['user_id'];
	    			$sql = "SELECT COUNT(*) as count
	    					FROM `post` 
	    					WHERE `receiverid` = '$user'";
	    			$q_result = $this->db_query($sql);
	    			$result['status'] = 'success';
	    			$result['data']['post_number'] = $q_result[0]['count'];	 


	    			$sql = "SELECT `keyword` 
	    					FROM `member`
	    					WHERE `m_id` = '$user'";
	    			$q_result = $this->db_query($sql);
	    			$result['data']['keyword'] = $q_result[0]['keyword'];
	    			return json_encode($result);
					break;
				case 'delete_post':
					try{
						$pid = $_POST['pid'];
					}
					catch(Exception $e){
						$result['status'] = "fail";
	    				return json_encode($result);
					}
					$sql = "UPDATE `post`
							SET `able` = '-1'
							WHERE `pid` = '$pid'";
					$change_result = $this->db_exec($sql);
	    			$result['status'] = "success";
	    			return json_encode($result);
					break;
				case 'delete_comment':
					try{
						$c_id = $_POST['c_id'];
					}
					catch(Exception $e){
						$result['status'] = "fail";
	    				return json_encode($result);
					}
					$sql = "UPDATE `comment`
							SET `able` = '-1'
							WHERE `c_id` = '$c_id'";
					$change_result = $this->db_exec($sql);
	    			$result['status'] = "success";
	    			return json_encode($result);
					break;
				case 'search_random_user':
					$user = $_SESSION['user_id'];
					$sql = "SELECT `m_id` FROM `member` WHERE m_id != $user";
					$mem_result = $this->db_query($sql);

					foreach ($mem_result as $key => $value) {
						$member_arr[$key] = $value['m_id']; 
					}

					$selected_num = rand(0, count($member_arr)-1);
					try {
						$selected_id = $member_arr[$selected_num];
		    			$result['status'] = "success";
		    			$result['data']['friend_id'] = $selected_id;
					} catch (Exception $e) {
		    			$result['status'] = "fail";
					}

					return json_encode($result);

					break;

					case 'get_comment':
	    			try{
	    				$p_id = $_POST['p_id'];
	    				$user_id = $_SESSION['user_id'];
	    			}
	    			catch(Exception $e){
	    				$result['status'] = "fail";
	    				return json_encode($result);
	    			}

	    			//$user = $_SESSION['user_id']; 湖俊傑註解der
	    			$sql = "SELECT `c_id`,`sender_id`,`c_content`,`hate`,`love`,m.l_name, m.f_name
	    					FROM `comment` c
	    					LEFT JOIN `member` m
	    						on c.sender_id = m.m_id
	    					WHERE p_id = '$p_id'
	    					and able = '1' 
	    					ORDER BY `c_id`";
	    			$q_result = $this -> db_query($sql);
	    			$sql = "SELECT `love`, `hate` 
	    					FROM `post`
	    					WHERE pid = '$p_id'";
  			 		$plike_result = $this -> db_query($sql);
	    			$sql = "SELECT `status`
	    					FROM `member_post`
	    					WHERE p_id = '$p_id'
	    					and m_id = '$user_id'";
	    			
	    			$status_result = $this -> db_query($sql);
	    			// $status_result => {
	    			// 					[0] => {
	    			// 								['status'] => xxx
	    			// 							}
	    			// 					[1] => {
	    			// 								['status'] => xxx
	    			// 							}
	    			// 					}

	    			if (!isset($status_result[0]) || empty($status_result)) {
	    				$post_status = 'nil';	
	    			}
	    			else if ($status_result[0]['status']==0) {
	    				$post_status = 'nil';	
	    			}
	    			else if ($status_result[0]['status']==1) {
	    				$post_status = 'love';	
	    			}
	    			else if ($status_result[0]['status']==2) {
	    				$post_status = 'hate';	
	    			}
	    			$result['status'] = 'success';
	    			$result['post_about'] = $plike_result;
	    			$result['data'] = $q_result;
	    			$result['delete_able'] = $user_id;
	    			$result['you_2_post'] = $post_status;
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