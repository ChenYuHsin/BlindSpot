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
		$noerrors=true;
		if (!($this->link=mysql_connect("localhost","root","1234"))) {
		    $this->error('No connect '.$this->host);
		    $noerrors=false;
		}
		if (!mysql_select_db("recommend")) {
		    $this->error('No connect '.$this->database);
		    $noerrors=false;
		}
		return $noerrors;
	    }

	public function Query() {
		mysql_query("set character set 'utf8'");//读库 
		mysql_query("set names 'utf8'");//写库 
		$this->queryResult=mysql_query($this->Query);
		return $this->queryResult;
	    }

	public function Close() {
		mysql_close($this->link);
	}
}
?>
