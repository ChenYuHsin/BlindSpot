<?php

    include_once'../config/init.php';

class simpleCSWS{

    public $_config;
    /**
    *   Constructor
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

    function getoneskeyword($user_id){

        $sql = "SELECT `p_content` FROM `post` WHERE receiverid = $user_id";
        $result = $this->db_query($sql);

        $article = "";
        foreach ($result as $key => $value) {
            $article .= $value['p_content']." ";
        }

        $keyword = $this->getkeyword($article);
        return $keyword;
    }


    function getkeyword($article){

        $segment_arr = $this->segment($article);
        $i = 0;
        $max_frequency = 0;
        foreach ($segment_arr as $segement_key => $segement_value) {
            foreach ($segement_value as $key => $value) {
                if($value['idf'] >= $max_frequency){
                    $keyword = $value['word'];
                    $max_frequency = $value['idf'];
                }
            }
        }
        return $keyword;
    }


    function segment($content, $ignore = false, $showa = false, $stats = false, $duality = false, $limit = 10){

        // other options
        $checked_ignore = $checked_showa = $checked_stats = $checked_duality = '';

        
        if ($ignore == true){// 是否清除标点符号
            $checked_ignore = ' checked';
        }
        if ($showa == true){// 是否标注词性
            $checked_showa = ' checked';
        }
        if ($stats == true){ // 是转看统计表
            $checked_stats = ' checked';
        }

        $xattr = &$_REQUEST['xattr'];
        if (!isset($xattr)) $xattr = '~v';
        $limit = &$_REQUEST['limit'];
        if (!isset($limit)) $limit = 10;

        // do the segment
        $cws = scws_new();
        $cws->set_charset('utf8');

        //
        // use default dictionary & rules
        //
        $cws->set_rule(ini_get('scws.default.fpath') . '/rules_cht.utf8.ini');
        $cws->set_dict(ini_get('scws.default.fpath') . '/dict_cht.utf8.xdb');


        $cws->set_ignore($ignore);
        $cws->send_text($content);

        if ($stats == true){
            // stats
            // printf("No. WordString               Attr  Weight(times)\n");
            // printf("-------------------------------------------------\n");
            // $list = $cws->get_tops($limit, $xattr);
            // $cnt = 1;
            // settype($list, 'array');
            // foreach ($list as $tmp)
            // {
            //     printf("%02d. %-24.24s %-4.2s  %.2f(%d)\n",
            //         $cnt, $tmp['word'], $tmp['attr'], $tmp['weight'], $tmp['times']);
            //     $cnt++;
            // }
        }else{
            // segment
            $i = 0;
            while ($res = $cws->get_result())
            {
                $result[$i++] = $res;
            }
        }

        $cws->close();

        return ($result);
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
    // $scws = new simpleCSWS();
    // echo $keyword = $scws->getoneskeyword(2);


?>
