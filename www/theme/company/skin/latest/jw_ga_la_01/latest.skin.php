<?php
if (!defined('_GNUBOARD_')) exit; //개별 페이지 접근 불가
include_once(G5_LIB_PATH.'/thumbnail.lib.php');
// 스넵이미지 생성함수
add_stylesheet('<link rel="stylesheet" href="'.$latest_skin_url.'/style.css">', 0);
$n_thumb_width = 175;  //썸네일 가로 크기
$n_thumb_height = 103; //썸네일 세로 크기
?>

<div class="latest_jw_ga_bbs_01_box">
  <ul>
  <?php for ($i = 0; $i < count($list); $i++) { ?>
    <li class="latest_jw_ga_bbs_01_cop">
		<a class="thumb" href="<?=$list[$i]['href']?>">
			<?php
							$n_thumb = get_list_thumbnail($bo_table, $list[$i]['wr_id'], $n_thumb_width, $n_thumb_height);
								// 스넵이미지 생성하고 뷰어 시킨다.
							$n_noimg = "$latest_skin_url/img/noimg.gif";
								// 이미지가 없을경우의 이미지 위치
					if($n_thumb['src']) {
							$img_content = '<img src="'.$n_thumb['src'].'" width="'.$n_thumb_width.'" height="'.$n_thumb_height.'" alt="'.$list[$i]['subject'].'" title="" />';
					} else {
							$img_content = '<img src="'.$n_noimg.'" width="'.$n_thumb_width.'" height="'.$n_thumb_height.'" alt="이미지없음" title="" />';
					}
							echo $img_content;
					?>
		</a>
		<span class="cop_txt">
			<a class="txt_blck" href="<?=$list[$i]['href']?>"><?php echo $list[$i]['subject'];?></a>
			<span class="txt_gry"><? echo $list[$i]['name']; ?> / <? echo $list[$i]['datetime']; ?></span>
		</span>
		</li>
  <?php } ?> 
        
	</ul>
</div>
