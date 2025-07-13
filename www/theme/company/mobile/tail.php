<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가
?>
    </div>
</div>
<div id="" class="sns_box">
	<ul>
		<li><a href="tel:010-8253-8882" class="gi_tel"><img src="/img/m/icon_call.png" alt="전화아이콘"/></a></li>
		<li><a href="sms:010-8253-8882" class="gi_sms"><img src="/img/m/icon_sms.png" alt="문자아이콘"/></a></li>
		<li><a href="http://blog.naver.com/sh1058533" target="_blank"><img src="/img/m/sns_m1.png" alt=""/></a></li>
		<li><a href="https://www.instagram.com/_sh_motors/?hl=ko" target="_blank"><img src="/img/m/sns_m2.png" alt=""/></a></li>
	</ul>
</div>
<div id="ft" class="clearfix">
    <div id="ft_copy" class="clearfix">
        <ul class="footer_nav clearfix">
			<li><a href="/bbs/content.php?co_id=company">공업사 소개</a></li>
			<li><a href="/bbs/content.php?co_id=place">오시는 길</a></li>
			<li><a href="/bbs/board.php?bo_table=qna">견적문의</a></li>
			<li><a href="/bbs/board.php?bo_table=notice">공지사항</a></li>
        </ul>
	
       <p class="ft_info"><strong>MECHANICAR 메카니카 본점(양평동)</strong><span>서울 영등포구 양평로21가길 9</span><span>Tel : 02.2688.9777</span></p>
        <p class="ft_info"><strong>MECHANICAR 메카니카 2호점(천왕동)</strong><span>서울시 구로구 오리로 1102-4</span><span>Tel : 02-2618-8456</span></p>
		<p class="ft_info"><strong>SH MOTORS(부천 옥길동)</strong><span>경기도 부천시 옥길로 14</span><span>Tel : 02-6953-8405</span></p>
       
        <p class="copyright">Copyright &copy; <b>SH MOTORS.</b> All rights reserved.
			<?php
			if(G5_DEVICE_BUTTON_DISPLAY && G5_IS_MOBILE) { ?>
			<a href="<?php echo get_device_change_url(); ?>" id="device_change">PC 버전으로 보기</a>
			<?php
			}
			if ($config['cf_analytics']) {
				echo $config['cf_analytics'];
			}
			?>
		</p>
    </div>
    
</div>

<script>
$(function() {
    // 폰트 리사이즈 쿠키있으면 실행
    font_resize("container", get_cookie("ck_font_resize_rmv_class"), get_cookie("ck_font_resize_add_class"));
});
$('.tab_menu li').click(function() {
		var tabIndex = $(this).index()+1;
		$(this).parent().find('li').removeClass('on');
		$(this).addClass('on');
		$(this).parent().parent().find('div[class^="new_sub"]').hide();
		$(this).parent().parent().find('.tab_box'+tabIndex).show();
	});
</script>

<?php
include_once(G5_THEME_PATH."/tail.sub.php");
?>