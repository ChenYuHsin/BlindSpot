<?php

class DataBase {

	private $host;
	private $datebase;
	private $name;
	private $pass;
	public  $link; 


	public function __construct ($h, $n, $p, $b) {

	    $this->host=$h;
	    $this->name=$n;
	    $this->pass=$p;
	    $this->database=$b;
	}

	public function Connect() {
		$noerrors="true";

		if (!($this->link= new PDO(
									"mysql:host=localhost;dbname=blindspot",
									'root',
									'ilovesteven',
									array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8')))) {
		    $this->error('No connect '.$this->host);
		    $noerrors="false";
		}
		// if (!mysql_select_db("recommend")) {
		//     $this->error('No connect '.$this->database);
		//     $noerrors=false;
		// }
		return $noerrors;
	    }

	public function Query() {
		// mysql_query("set character set 'utf8'");//讀庫 
		// mysql_query("set names 'utf8'");//寫庫
		$this->queryResult = $this->link->query($this->Query) or die(print_r($this->link->errorInfo(), true));
		return $this->queryResult;
	    }
	 public function Exec(){
		$this->queryResult = $this->link->exec($this->Exec);
		return $this->queryResult;
	 }

	public function Close() {
		$this->link = null;
	}
}
?>
