<?php

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
            printf("No. WordString               Attr  Weight(times)\n");
            printf("-------------------------------------------------\n");
            $list = $cws->get_tops($limit, $xattr);
            $cnt = 1;
            settype($list, 'array');
            foreach ($list as $tmp)
            {
                printf("%02d. %-24.24s %-4.2s  %.2f(%d)\n",
                    $cnt, $tmp['word'], $tmp['attr'], $tmp['weight'], $tmp['times']);
                $cnt++;
            }
        }else{
            // segment
            $i = 0;
            echo "<pre>";
            while ($res = $cws->get_result())
            {
                // $result[$i++] = $res;
                foreach ($res as $key => $value) {
                    echo $value['word']."__";
                }
            }
            echo "</pre>";
        }

        $cws->close();

        // return ($result);
    }
}


    $scws = new simpleCSWS();
    $scws->segment("農委會主委陳保基出身台大農學院，曾擔任過台大農學院院長，行政院發言人孫立群則是台大農業經濟學系的教授，這些研究農業、依賴農業研究為生、並因農業研究而獲取官位的學者，他們有幫農業及農民講話嗎？他們有護衛農民的權益嗎？沒有，完全沒有，他們反而是在滅農！因此，我也要學孫立群的口吻講一句話，「太扯了！一群沒有用的農業學者！」你們如果不願意護衛農業及農民，就請全部都下台！");

?>
