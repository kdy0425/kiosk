<?php
define('_INDEX_', true);
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

if (G5_IS_MOBILE) {
	include_once(G5_THEME_MOBILE_PATH.'/index.php');
	return;
}

include_once(G5_THEME_PATH.'/head.php');
?>
<style>
#container{width:100% !important;background: #454545;}
#wrapper{display: inline-flex;}
#sub_tit{display:none;}
</style>



<div id="main_content_fotm">



<div id="main_content_div" class="clearfix">
 <div class="main_location">
	<div class="item">
		<div class="tit_box">
			<div class="tit">메카니카 양평본점 <a href="https://mechanicar.co.kr/index.php" target="_blank">바로가기 </a></div>
			<div class="ads">서울 영등포구 양평로21가길 9</div>
		</div>
		<div class="cnt">
			<img src="/img/main_store1.jpg" alt="">
		</div>
	</div>
	<div class="item">
		<div class="tit_box">
			<div class="tit">메카니카 천왕점<a href="https://mechanicar.kr/index.php" target="_blank">바로가기 </a></div>
			<div class="ads">서울시 구로구 오리로 1102-4</div>
		</div>
		<div class="cnt">
			<img src="/img/main_store2.jpg?250223" alt="">
		</div>
	</div>
	<div class="item">
		<div class="tit_box">
			<div class="tit">메카니카 강남 도곡점<a href="https://naver.me/FcmrRxbw" target="_blank">바로가기 </a></div>
			<div class="ads">서울시 논현로 152</div>
		</div>
		<div class="cnt">
			<img src="/img/main_store_dogok.jpg" alt="">
		</div>
	</div>
	<div class="item">
		<div class="tit_box">
			<div class="tit">메카니카 부천 심곡점<a href="https://naver.me/GlJacOw0" target="_blank">바로가기 </a></div>
			<div class="ads">부천시 원미구 부흥로 439</div>
		</div>
		<div class="cnt">
			<img src="/img/main_store_simgok.jpg?250223" alt="">
		</div>
	</div>
	<div class="item">
		<div class="tit_box">
			<div class="tit">메카니카 강원 춘천점<a href="https://naver.me/5bVQlJQb" target="_blank">바로가기 </a></div>
			<div class="ads">강원도 춘천시 효자로 8</div>
		</div>
		<div class="cnt">
			<img src="/img/main_store_cc.jpg?250223" alt="">
		</div>
	</div>
	<div class="item">
		<div class="tit_box">
			<div class="tit">SH모터스(부천 옥길동) <a href="https://shmotors.net/index.php" target="_blank">바로가기 </a></div>
			<div class="ads">경기도 부천시 옥길로 14</div>
		</div>
		<div class="cnt">
			<img src="/img/main_store3.jpg?250223" alt="">
		</div>
	</div>
</div>

	<div id="" class="main_last_form clearfix">
		<div id="" class="mlb">
			<?php
			echo latest('theme/basic', 'qna', 4, 18);
			?>
		</div>
		<div id="" class="mlb">
			<?php
			echo latest('theme/basic', 'notice', 4, 25);
			?>
		</div>
		<div id="" class="mlc">
			<strong>CS CENTER - 고객센터</strong>
			<div id="" class="">
				<span class="">02.6953.8405, 010.8253.8882</span>
				<ul>
					<li>월 ~ 금: 08:30 ~ 18:00 &nbsp;토: 08:30 ~ 16:00</li>
					<li>일, 공휴일은 휴무 입니다.</li>
					<li>전화주시면 친절하게 상담 도와드리겠습니다.</li>
				</ul>
			</div>
		</div>
		
	</div>
	<div id="four_step" class="">
		<ul>
			<li><a href="<? echo G5_URL ?>/bbs/board.php?bo_table=gallery&sca=%EB%8D%94%EB%B2%99%EC%BB%A4"><img src="<? echo G5_IMG_URL ?>/main_m3.jpg"><span class="four_step_tit">SH MOTORS 더벙커 인증업체</span></a></li>
			<li><a href="http://m.post.naver.com/my.nhn?memberNo=39947428" target="_blank"><img src="<? echo G5_IMG_URL ?>/main_m4.jpg"><span class="four_step_tit">글래스레이 네이버 포스트</span></a></li>
			<li><a target="_blank" href="http://blog.naver.com/sh1058533"><img src="<? echo G5_IMG_URL ?>/main_m1.jpg"><span class="four_step_tit">SH MOTORS 블로그 바로가기</span></a></li>
			<li><a href="https://www.instagram.com/_sh_motors/?hl=ko" target="_blank"><img src="<? echo G5_IMG_URL ?>/main_m2.jpg"><span class="four_step_tit">SH MOTORS 인스타그램 바로가기</span></a></li>
			
		</ul>
	</div>
</div>
</div>
<div id="main_last">
<?
echo latest("jw_ga_la_01", "gallery", 30, 17);
?>
</div>
<?php
include_once(G5_THEME_PATH.'/tail.php');
?>
