<?php 
	require'database.php';

	class init{

		public $_config;

	    /**
	     * Init config
	     *
	     * @param string $configIniFile
	     */
	    public function initConfig($configIniFile = '../config/config.ini.php'){

	        $this->_config = parse_ini_file($configIniFile);
	    }

		/**
	     * Init database link
	     *
	     * @return resource
	     */
	    public function _initDb(){

	        /**
	         * Singleton Pattern
	         */
	        if (is_resource($this->_db)) return $this->_db;
	        
	        /**
	         * Init database config
	         */
	        $config = array(
	            'host' => $this->_config['host'],
	            'username' => $this->_config['username'],
	            'password' => $this->_config['password'],
	            'dbname' => $this->_config['dbname'],
	            'port' => $this->_config['port']
	        );        
	        $adapter = $this->_config['adapter'];
	        
	        return $this->_db;
	    }



	}

	
	$Init = new init();

 ?>