<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가
// 스팸 방지 필드 이름과 값을 설정
if(!defined('CHECK_WRITEPAGE_SPAM_INPUT_NAME')){
    define('CHECK_WRITEPAGE_SPAM_INPUT_NAME', 'qwejijiojj1231oqwej1');
}

if(!defined('CHECK_WRITEPAGE_SPAM_INPUT_VALUE')){
    define('CHECK_WRITEPAGE_SPAM_INPUT_VALUE', '독도만세대한민국다다비비');
}
// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$board_skin_url.'/style.css">', 0);
?>


<style>
.qna_caution{background-color:#f1f1f1;padding:20px;font-size:15px;color:#222;text-align:center;letter-spacing:-0.5px;word-break:keep-all;}
.qna_caution strong{color:#0261A4;font-size:18px;display:inline-block;}
.qna_caution strong a{color:#0261A4;}
.qna_layer{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);border:1px solid #ddd;z-index:100;word-break:keep-all;box-shadow:0 0 15px rgba(0,0,0,.15);max-width:90%;width:100%;}
.qna_layer .cnt{padding:30px 15px;font-size:16px;color:#222;text-align:center;letter-spacing:-0.5px;line-height:1.6;background-color:#fff;}
.qna_layer .cnt strong{color:#0261A4;font-size:18px;font-weight:600;display:inline-block;}
.qna_layer .cnt strong a{color:#0261A4;}
.qna_layer button{width:100%;border:0;background-color:#0261A4;color:#fff;font-size:15px;font-weight:600;height:42px;}
</style>
<div class="qna_caution">
	바쁜 업무로 인해 인터넷 문의는 답변이 느릴 수 있습니다.<br/>
	빠른 상담을 원하시면 <strong><a href="tel:02-2618-8456">02-6953-8405</a>, <a href="tel:010-8253-8882">010-8253-8882</a></strong>로 연락 주시면 친절하게 상담 도와드리겠습니다.
</div>

<section id="bo_w">
    <h2 id="container_title"><?php echo $g5['title'] ?></h2>
<script src="https://www.google.com/recaptcha/api.js" async defer></script>

    <form name="fwrite" id="fwrite" action="<?php echo $action_url ?>" onsubmit="return fwrite_submit(this);" method="post" enctype="multipart/form-data" autocomplete="off">
				<input type="hidden" name="<?php echo CHECK_WRITEPAGE_SPAM_INPUT_NAME; ?>" value="<?php echo CHECK_WRITEPAGE_SPAM_INPUT_VALUE; ?>">

    <input type="hidden" name="w" value="<?php echo $w ?>">
    <input type="hidden" name="bo_table" value="<?php echo $bo_table ?>">
    <input type="hidden" name="wr_id" value="<?php echo $wr_id ?>">
    <input type="hidden" name="sca" value="<?php echo $sca ?>">
    <input type="hidden" name="sfl" value="<?php echo $sfl ?>">
    <input type="hidden" name="stx" value="<?php echo $stx ?>">
    <input type="hidden" name="spt" value="<?php echo $spt ?>">
    <input type="hidden" name="sst" value="<?php echo $sst ?>">
    <input type="hidden" name="sod" value="<?php echo $sod ?>">
    <input type="hidden" name="page" value="<?php echo $page ?>">
    <?php
    $option = '';
    $option_hidden = '';
    if ($is_notice || $is_html || $is_secret || $is_mail) {
        $option = '';
        if ($is_notice) {
            $option .= PHP_EOL.'<input type="checkbox" id="notice" name="notice" value="1" '.$notice_checked.'>'.PHP_EOL.'<label for="notice">공지</label>';
        }

        if ($is_html) {
            if ($is_dhtml_editor) {
                $option_hidden .= '<input type="hidden" value="html1" name="html">';
            } else {
                $option .= PHP_EOL.'<input type="checkbox" id="html" name="html" onclick="html_auto_br(this);" value="'.$html_value.'" '.$html_checked.'>'.PHP_EOL.'<label for="html">html</label>';
            }
        }

        if ($is_secret) {
            if ($is_admin || $is_secret==1) {
                $option .= PHP_EOL.'<input type="checkbox" id="secret" name="secret" value="secret" '.$secret_checked.'>'.PHP_EOL.'<label for="secret">비밀글</label>';
            } else {
                $option_hidden .= '<input type="hidden" name="secret" value="secret">';
            }
        }

        if ($is_mail) {
            $option .= PHP_EOL.'<input type="checkbox" id="mail" name="mail" value="mail" '.$recv_email_checked.'>'.PHP_EOL.'<label for="mail">답변메일받기</label>';
        }
    }

    echo $option_hidden;
    ?>
    <div class="tbl_frm01 tbl_wrap">
        <table>
        <caption><?php echo $g5['title'] ?></caption>
        <tbody>
        <?php if ($is_name) { ?>
        <tr>
            <th scope="row"><label for="wr_name">이름<strong class="sound_only">필수</strong><span class="required_txt">(필수)</span></label></th>
            <td><input type="text" name="wr_name" value="<?php echo $name ?>" id="wr_name" required class="frm_input required" maxlength="20"></td>
        </tr>
        <?php } ?>

        <?php if ($is_password) { ?>
        <tr>
            <th scope="row"><label for="wr_password">비밀번호<strong class="sound_only">필수</strong><span class="required_txt">(필수)</span></label></th>
            <td><input type="password" name="wr_password" id="wr_password" <?php echo $password_required ?> class="frm_input <?php echo $password_required ?>" maxlength="20"></td>
        </tr>
        <?php } ?>

        <?php if ($is_category) { ?>
        <tr>
            <th scope="row"><label for="ca_name">분류<strong class="sound_only">필수</strong></label></th>
            <td>
                <select class="required" id="ca_name" name="ca_name" required>
                    <option value="">선택하세요</option>
                    <?php echo $category_option ?>
                </select>
            </td>
        </tr>
        <?php } ?>

        <tr>
            <th scope="row"><label for="wr_subject">제목<strong class="sound_only">필수</strong><span class="required_txt">(필수)</span></label></th>
            <td><input type="text" name="wr_subject" value="<?php echo $subject ?>" id="wr_subject" required class="frm_input required"></td>
        </tr>
		<tr>
            <th scope="row"><label for="wr_email">연락처<span class="required_txt">(필수)</span></label></th>
            <td><input type='text' name='wr_1' value='<?=$write[wr_1]?>' required class="frm_input required" placeholder="ex) 010-1234-1234" ></td>
        </tr>
		 <tr>
            <th scope="row"><label for="wr_email">차종,연식<span class="required_txt">(필수)</span></label></th>
            <td><input type='text' name='wr_2' value='<?=$write[wr_2]?>' required class="frm_input required" placeholder="ex) 쏘나타 2012년식"></td>
        </tr>
        <tr>
            <th scope="row"><label for="wr_content">내용<strong class="sound_only">필수</strong><span class="required_txt">(필수)</span></label></th>
            <td class="wr_content">
                <?php if($write_min || $write_max) { ?>
                <!-- 최소/최대 글자 수 사용 시 -->
                <p id="char_count_desc">이 게시판은 최소 <strong><?php echo $write_min; ?></strong>글자 이상, 최대 <strong><?php echo $write_max; ?></strong>글자 이하까지 글을 쓰실 수 있습니다.</p>
                <?php } ?>
                <?php echo $editor_html; // 에디터 사용시는 에디터로, 아니면 textarea 로 노출 ?>
                <?php if($write_min || $write_max) { ?>
                <!-- 최소/최대 글자 수 사용 시 -->
                <div id="char_count_wrap"><span id="char_count"></span>글자</div>
                <?php } ?>
            </td>
        </tr>

        <?php for ($i=1; $is_link && $i<=G5_LINK_COUNT; $i++) { ?>
        <tr>
            <th scope="row"><label for="wr_link<?php echo $i ?>">링크 #<?php echo $i ?></label></th>
            <td><input type="url" name="wr_link<?php echo $i ?>" value="<?php if($w=="u"){echo$write['wr_link'.$i];} ?>" id="wr_link<?php echo $i ?>" class="frm_input wr_link"></td>
        </tr>
        <?php } ?>

        <?php for ($i=0; $is_file && $i<$file_count; $i++) { ?>
        <tr>
            <th scope="row">파일 #<?php echo $i+1 ?></th>
            <td>
                <input type="file" name="bf_file[]" title="파일첨부 <?php echo $i+1 ?> :  용량 <?php echo $upload_max_filesize ?> 이하만 업로드 가능" class="frm_file frm_input">
                <?php if ($is_file_content) { ?>
                <input type="text" name="bf_content[]" value="<?php echo ($w == 'u') ? $file[$i]['bf_content'] : ''; ?>" title="파일 설명을 입력해주세요." class="frm_file frm_input">
                <?php } ?>
                <?php if($w == 'u' && $file[$i]['file']) { ?>
                <input type="checkbox" id="bf_file_del<?php echo $i ?>" name="bf_file_del[<?php echo $i; ?>]" value="1"> <label for="bf_file_del<?php echo $i ?>"><?php echo $file[$i]['source'].'('.$file[$i]['size'].')'; ?> 파일 삭제</label>
                <?php } ?>
            </td>
        </tr>
        <?php } ?>

        <tr>
            <th scope="row">자동등록방지</th>
            <td>
               <div class="g-recaptcha" data-sitekey="6LdxdFcrAAAAAHjxHR91VnBgHqzDhkAo-ZU3hrGo"></div>
            </td>
        </tr>

        </tbody>
        </table>
    </div>

    <div class="btn_confirm">
        <input type="submit" value="작성완료" id="btn_submit" class="btn_submit" accesskey="s">
        <a href="./board.php?bo_table=<?php echo $bo_table ?>" class="btn_cancel">취소</a>
    </div>
    </form>
</section>

<script>
<?php if($write_min || $write_max) { ?>
// 글자수 제한
var char_min = parseInt(<?php echo $write_min; ?>); // 최소
var char_max = parseInt(<?php echo $write_max; ?>); // 최대
check_byte("wr_content", "char_count");

$(function() {
    $("#wr_content").on("keyup", function() {
        check_byte("wr_content", "char_count");
    });
});

<?php } ?>
function html_auto_br(obj)
{
    if (obj.checked) {
        result = confirm("자동 줄바꿈을 하시겠습니까?\n\n자동 줄바꿈은 게시물 내용중 줄바뀐 곳을<br>태그로 변환하는 기능입니다.");
        if (result)
            obj.value = "html2";
        else
            obj.value = "html1";
    }
    else
        obj.value = "";
}

    function fwrite_submit(f)
    {
		if (typeof grecaptcha !== 'undefined') {
        const token = grecaptcha.getResponse();
        console.log('reCAPTCHA 응답:', token);  // 👈 이 줄이 핵심
        if (!token) {
            alert('자동등록방지를 완료해 주세요.');
            return false;
        }
    }
    var subject = "";
    var content = "";
    $.ajax({
        url: g5_bbs_url+"/ajax.filter.php",
        type: "POST",
        data: {
            "subject": f.wr_subject.value,
            "content": f.wr_content.value
        },
        dataType: "json",
        async: false,
        cache: false,
        success: function(data, textStatus) {
            subject = data.subject;
            content = data.content;
        }
    });

    if (subject) {
        alert("제목에 금지단어('"+subject+"')가 포함되어있습니다");
        f.wr_subject.focus();
        return false;
    }

    if (content) {
        alert("내용에 금지단어('"+content+"')가 포함되어있습니다");
        if (typeof(ed_wr_content) != "undefined")
            ed_wr_content.returnFalse();
        else
            f.wr_content.focus();
        return false;
    }

    if (document.getElementById("char_count")) {
        if (char_min > 0 || char_max > 0) {
            var cnt = parseInt(check_byte("wr_content", "char_count"));
            if (char_min > 0 && char_min > cnt) {
                alert("내용은 "+char_min+"글자 이상 쓰셔야 합니다.");
                return false;
            }
            else if (char_max > 0 && char_max < cnt) {
                alert("내용은 "+char_max+"글자 이하로 쓰셔야 합니다.");
                return false;
            }
        }
    }


    document.getElementById("btn_submit").disabled = "disabled";

    return true;
}
</script>
