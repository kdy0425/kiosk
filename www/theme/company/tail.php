<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

if (G5_IS_MOBILE) {
    include_once(G5_THEME_MOBILE_PATH.'/tail.php');
    return;
}
?>
        <!-- <a href="#hd" id="top_btn">상단으로</a> -->
    </div>
</div>

<!-- } 콘텐츠 끝 -->

<hr>

<!-- 하단 시작 { -->
<div id="ft">
    <div id="ft_wr">
<?include_once(G5_LIB_PATH.'/visit.lib.php'); ?>
        <ul class="footer_nav clearfix">
			<li><a href="/bbs/content.php?co_id=company">공업사 소개</a></li>
			<li><a href="/bbs/content.php?co_id=place">찾아오시는 길</a></li>
			<li><a href="/bbs/board.php?bo_table=qna">견적문의</a></li>
			<li><a href="/bbs/board.php?bo_table=notice">공지사항</a></li>
        </ul>
        <div id="ft_company" >
            <p class="ft_info"style="position:relative;">
		<span class="" style=""><strong>MECHANICAR 메카니카 본점(양평동)</strong> - 서울 영등포구 양평로21가길 9&nbsp;&nbsp; 대표 : 박승호&nbsp;&nbsp;Tel : 02.2688.9777</span><br/>
			<span class="" style=""><strong>MECHANICAR 메카니카 2호점(천왕동)</strong> - 서울시 구로구 오리로 1102-4&nbsp;&nbsp;   대표 : 박승호&nbsp;&nbsp;   Tel : 02-2618-8456</span>
			<span class="" style=""><strong>SH MOTORS(부천 옥길동)</strong> - 경기도 부천시 옥길로 14&nbsp;&nbsp;   대표 : 박승호&nbsp;&nbsp;   Tel : 02-6953-8405</span>
			<?php echo visit('theme/basic'); // 접속자집계, 테마의 스킨을 사용하려면 스킨을 theme/basic 과 같이 지정 ?>
			</p>
        </div>
    </div>
	<div class="ft_copy">
			<div id="" class="">
				<p>Copyright &copy; <b>SH MOTORS.</b> All rights reserved.</p>
				<?php
				if(G5_DEVICE_BUTTON_DISPLAY && !G5_IS_MOBILE) { ?>
				<a href="<?php echo get_device_change_url(); ?>" id="device_change">모바일 버전으로 보기</a>
				<?php
				}

				if ($config['cf_analytics']) {
					echo $config['cf_analytics'];
				}
				?>
				</div>
			</div>
</div>

<script>
$(function() {
    $("#top_btn").on("click", function() {
        $("html, body").animate({scrollTop:0}, '500');
        return false;
    });
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
if ($config['cf_analytics']) {
    echo $config['cf_analytics'];
}
?>

<!-- } 하단 끝 -->

<?php
include_once(G5_THEME_PATH."/tail.sub.php");
?>