<?
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

if (G5_IS_MOBILE) {
    include_once(G5_THEME_MOBILE_PATH.'/head.php');
    return;
}

include_once(G5_THEME_PATH.'/head.sub.php');
include_once(G5_LIB_PATH.'/latest.lib.php');

add_javascript('<script src="'.G5_THEME_JS_URL.'/fancySelect.js"></script>', 10);
?>

<!-- 상단 시작 { -->
<div id="hd">
    <h1 id="hd_h1"><? echo $g5['title'] ?></h1>

    <div id="skip_to_container"><a href="#container">본문 바로가기</a></div>

    <?
    if(defined('_INDEX_')) { // index에서만 실행
        include G5_BBS_PATH.'/newwin.inc.php'; // 팝업레이어
    }
    ?>
	<div id="" class="family_site_form">
		<div id="" class="family_site_box">
			<a href="/index.html">인트로화면</a>
		</div>
	</div>
    <div id="hd_wrapper">
		<div id="top_call">
			<img src="<? echo G5_IMG_URL ?>/top_call.png"  ?>
			<span class="">대표번호 : 02-2688-9777, 010-8253-8882</span>
		</div>
        <div id="" class="">
			<div id="logo">
            <a href="<? echo G5_URL ?>/index.php"><img src="<? echo G5_IMG_URL ?>/logo.png" alt="<? echo $config['cf_title']; ?>" ></a>
        </div>

        <? include_once(G5_THEME_PATH.'/head.menu.php'); ?>

        
        <ul id="tnb">
            <? if ($is_member) {  ?>
            <? if ($is_admin) {  ?>
            <li class="tnb_adm"><a href="<? echo G5_ADMIN_URL ?>"><b>관리자</b></a></li>
            <? }  ?>
            <li><a href="<? echo G5_BBS_URL ?>/logout.php">로그아웃</a></li>
            <? } else {  ?>
            <li><a href="<? echo G5_BBS_URL ?>/login.php" ><b>로그인</b></a></li>
            <? }  ?>
        </ul>
        </div>
    </div>

    <hr>
	

</div>
<!-- } 상단 끝 -->
<? if($co_id=="company" || $co_id=="place"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/company_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="tire"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/organize_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="gloss"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/gloss_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="paint"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/paint_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="tint"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/tint_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($bo_table=="gallery"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/gallery_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($bo_table=="notice"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/notice_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($bo_table=="accessory"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/accessory_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<? if($co_id=="event"){?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/event_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<?php if($bo_table=="qna"){ ?>
<style>
#sub_tit{background-image:url('<? echo G5_IMG_URL ?>/faq_bg.jpg');background-position:center center;background-size:cover;}
</style>
<?}?>
<hr>
<? if ((defined("_INDEX_"))) { ?>
	<div id="" class="main_visual_form">
		<ul class="main_visual">
			<li>
				<img src="/img/main_visual1_new.jpg" alt=""/>
				<div id="" class="main_text">
					<strong>SH MOTORS <span>(부천옥길동)</span></strong>
					<p>SH 부천옥길동점입니다. 정비, 타이어와 본점과 2호점과 연계하여 모든 시공이 가능합니다.<br/>저렴한 시공비용과 만족도 높은 시공으로 보답하겠습니다.</p>
				</div>
			</li>
			<li>
				<img src="/img/main_visual4_new.jpg" alt=""/>
				<div id="" class="main_text">
					<strong>EBS 극한직업 <span> 출연</span></strong>
					<p>에스에이치 모터스는 최고의 결과물을 드릴 것을 약속합니다.<br/>거짓없는 정직함으로 고객님들께 보답하겠습니다.</p>
				</div>
			</li>
			<li>
				<img src="/img/main_visual2_new.jpg" alt=""/>
				<div id="" class="main_text">
					<strong>THE BUNKER <span>5,6,7,8 출연</span></strong>
					<p>더벙커 5,6,7,8시즌 출연하였습니다.<br/> 에스에이치모터스는 더벙커 인증업체로 고객분들에게 만족드리겠습니다.</p>
				</div>
			</li>
		</ul>
	</div>
	<script>
	$('.main_visual').bxSlider({
	  mode: 'fade',
	  captions: true,
	  controls:false,
		  auto:true,
		  speed:800
	});
	  $(document).ready(function(){
		$('.main_gallery').bxSlider({
		slideWidth: 230,
			auto:true,
		minSlides: 4,
		maxSlides: 30,
		moveSlides: 1,
		slideMargin: 30,
		pager: false,
		auto: true,
		speed: 800,
		pause: 5000
		});
});
	</script>
<? } ?>

<!-- 콘텐츠 시작 { -->
<div id="wrapper">
    <div id="sub_tit">
		<? if (!defined("_INDEX_")) { ?>
        <h2 id="ctn_title"><? echo get_text((isset($bo_table) && $bo_table) ? $board['bo_subject'] : $g5['title']); ?></h2>
		<? } ?>
    </div>
	
    <div id="container">
        <? if (($bo_table || $w == 's' ) && !defined("_INDEX_")) { ?><div id="container_title"><? echo $g5['title'] ?></div><? } ?>
