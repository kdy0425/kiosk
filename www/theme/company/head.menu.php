<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가
?>

<nav id="gnb">
    <h2>메인메뉴</h2>
    <ul id="gnb_1dul">
        <?php
        $gnb_menus = array();

        $sql = " select *
                    from {$g5['menu_table']}
                    where me_use = '1'
                      and length(me_code) = '2'
                    order by me_order, me_id ";
        $result = sql_query($sql, false);
        $gnb_zindex = 999; // gnb_1dli z-index 값 설정용

        for ($i=0; $row=sql_fetch_array($result); $i++) {
        ?>
        <li class="gnb_1dli" style="z-index:<?php echo $gnb_zindex--; ?>">
            <?php
            $submenus = '';

            $sql2 = " select *
                        from {$g5['menu_table']}
                        where me_use = '1'
                          and length(me_code) = '4'
                          and substring(me_code, 1, 2) = '{$row['me_code']}'
                        order by me_order, me_id ";
            $result2 = sql_query($sql2);

            for ($k=0; $row2=sql_fetch_array($result2); $k++) {
                if($k == 0)
                   $submenus .= '<ul class="gnb_2dul">'.PHP_EOL;

                $submenus .= '<li class="gnb_2dli"><a href="'.$row2['me_link'].'" target="_'.$row2['me_target'].'" class="gnb_2da">'.$row2['me_name'].'</a></li>'.PHP_EOL;
            }

            if($k > 0)
                $submenus .= '</ul>'.PHP_EOL;

            if($submenus)
                $gnb_class = 'gnb_1da gnb_bg';
            else
                $gnb_class = 'gnb_1da';
            ?>
            <a href="<?php echo $row['me_link']; ?>" target="_<?php echo $row['me_target']; ?>" class="<?php echo $gnb_class; ?>"><?php echo $row['me_name'] ?></a>
            <?php echo $submenus; ?>
        </li>
        <?php
        }

        if ($i == 0) {  ?>
            <li id="gnb_empty">메뉴 준비 중입니다.<?php if ($is_admin) { ?> <br><a href="<?php echo G5_ADMIN_URL; ?>/menu_list.php">관리자모드 &gt; 환경설정 &gt; 메뉴설정</a>에서 설정하실 수 있습니다.<?php } ?></li>
        <?php } ?>
    </ul>
</nav>