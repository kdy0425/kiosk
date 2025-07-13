<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

include_once(G5_THEME_PATH.'/head.sub.php');
include_once(G5_LIB_PATH.'/latest.lib.php');
include_once(G5_LIB_PATH.'/connect.lib.php');
?>
<!-- } 상단 끝 -->
<? if($co_id=="company" || $co_id=="place"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/company_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="organize"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/organize_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="gloss"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/gloss_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="tint"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/tint_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="tire"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/organize_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="paint"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/paint_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($bo_table=="gallery"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/gallery_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($bo_table=="notice"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/notice_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($bo_table=="accessory"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/accessory_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="event"){?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/event_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<?php if($bo_table=="qna"){ ?>
<style>
#container_title{background-image:url('<? echo G5_IMG_URL ?>/faq_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<header id="hd">
    <h1 id="hd_h1"><?php echo $g5['title'] ?></h1>
    <div class="to_content"><a href="#container">본문 바로가기</a></div>
    <?php
    if(defined('_INDEX_')) { // index에서만 실행
        include G5_MOBILE_PATH.'/newwin.inc.php'; // 팝업레이어
    } ?>
	<div id="" class="family_site_form">
		<div id="" class="family_site_box">
		<!-- 	<a href="http://shmotors.kr">인트로화면</a> -->
		</div>
	</div>
    <div id="hd_wrapper">
        <div id="logo">
            <a href="<?php echo G5_URL ?>/index.php"><img src="<?php echo G5_IMG_URL ?>/logo.png?2025-02-23" width="160px"alt="<?php echo $config['cf_title']; ?>"></a>
        </div>
        <!--메뉴-->
        <!-- <?php include_once(G5_THEME_MOBILE_PATH.'/head.menu.php'); ?> -->
		<button type="button" id="gnb_open" class="hd_opener">메뉴<span class="sound_only"> 열기</span></button>
		<div id="" class="gnb_form">
			<div id="gnb" class="hd_div">
				<div id="" class="gnb_logo">
					<img src="<?php echo G5_IMG_URL ?>/logo.png" alt="<?php echo $config['cf_title']; ?>">
				</div>
				<ul id="gnb_1dul">
				<?php
				$sql = " select *
							from {$g5['menu_table']}
							where me_mobile_use = '1'
							  and length(me_code) = '2'
							order by me_order, me_id ";
				$result = sql_query($sql, false);

				for($i=0; $row=sql_fetch_array($result); $i++) {
				?>
					<li class="gnb_1dli">
						<a href="<?php echo $row['me_link']; ?>" target="_<?php echo $row['me_target']; ?>" class="gnb_1da"><?php echo $row['me_name'] ?></a>
						<?php
						$sql2 = " select *
									from {$g5['menu_table']}
									where me_mobile_use = '1'
									  and length(me_code) = '4'
									  and substring(me_code, 1, 2) = '{$row['me_code']}'
									order by me_order, me_id ";
						$result2 = sql_query($sql2);

						for ($k=0; $row2=sql_fetch_array($result2); $k++) {
							if($k == 0)
								echo '<ul class="gnb_2dul">'.PHP_EOL;
						?>
							<li class="gnb_2dli"><a href="<?php echo $row2['me_link']; ?>" target="_<?php echo $row2['me_target']; ?>" class="gnb_2da"><span></span><?php echo $row2['me_name'] ?></a></li>
						<?php
						}

						if($k > 0)
							echo '</ul>'.PHP_EOL;
						?>
					</li>
				<?php
				}

				if ($i == 0) {  ?>
					<li id="gnb_empty">메뉴 준비 중입니다.<?php if ($is_admin) { ?> <br><a href="<?php echo G5_ADMIN_URL; ?>/menu_list.php">관리자모드 &gt; 환경설정 &gt; 메뉴설정</a>에서 설정하세요.<?php } ?></li>
				<?php } ?>
				</ul>
				<div id="" class="gnb_inqury clearfix">
					<a href="tel:010-8253-8882" class="gi_tel"><img src="/img/m/icon_call.png" alt="전화아이콘"/><span>전화상담</span></a>
					<a href="sms:010-8253-8882" class="gi_sms"><img src="/img/m/icon_sms.png" alt="문자아이콘"/><span>문자상담</span></a>
				</div>
				<button type="button" id="gnb_close" class="hd_closer"><span class="sound_only">메뉴 </span>닫기</button>
			</div>
			
		</div>
		<span class="gnb_bg"></span>
       

        <script>
        $(function () {
            $(".hd_opener").on("click", function() {
			   $(".gnb_form").css("right", "0px");
			   $(".gnb_bg").fadeIn(400);
            });

            $(".hd_closer, .gnb_bg").on("click", function() {
               $(".gnb_form").css("right", "-100%");
			   $(".gnb_bg").fadeOut(400);
            });
        });
        </script>
    </div>

</header>

<hr>

<div id="wrapper">
    <div id="container">
        <?php if ((!$bo_table || $w == 's' ) && !defined("_INDEX_")) { ?><div id="container_title"><?php echo $g5['title'] ?></div><?php } ?>