<?php

	if( isset($_POST['code']) ) {
		$code = $_POST['code'];

		if( $code == "887451717554" ) {


			session_start();

			include_once '../config/init.php';
			// include_once './scws.php';
			class register{

				public $_config;
				function __counstrut($_config = ''){
					empty($config) ? $this->initConfig() : $this->_config = $config;
					$this->_initDb();
				}

				public function getinfo() {

					$func = $_POST['func'];

					switch($func) {
						case 'develope':
							$developer_id = $_SESSION['user_id'];
							
			    			$sql = "SELECT `pid`,`p_content`,`senderid`, p.updatetime, m.l_name, m.f_name, IFNULL(a.count_comment, 0) as count_comment
			    					FROM `post` p
			    					LEFT JOIN `member` m
			    						on p.senderid = m.m_id
			    					LEFT JOIN (
			    						SELECT COUNT(c_id) as count_comment, p_id FROM `comment` where able=1 GROUP BY p_id
			    						) a
										on p.pid = a.p_id
			    					WHERE receiverid = '$developer_id'
			    					ORDER BY p.updatetime DESC";
			    			$q_result = $this->db_query($sql);
			    			$result['status'] = 'success';
			    			$result['data'] = $q_result;
			    			return json_encode($result);
			    			break;
						default:
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
			echo $Register -> getinfo();

		} else {
			echo "FUCK";
		}
	} else {
		echo 'fuck you';
	}



?>


