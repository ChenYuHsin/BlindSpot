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