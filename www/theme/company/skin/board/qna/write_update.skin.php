<?
if (!defined("_GNUBOARD_")) exit;//개별 페이지 접근 불가
include_once(G5_LIB_PATH.'/icode.sms.lib.php');
 
//질문 등록시 관리자에게 전송
if($bo_table == "qna") { // 수정 시에도 문자 보내기
//if($bo_table == "qna" && $w == '') { // 수정 및 댓글에는 문자 보내지 않기
// $send_hp_mb = "질문하신 분 전화번호";//보내는 전화번호
// $recv_hp_mb = "질문하신 분 전화번호";//받는 전화번호

$send_hp = str_replace("-","",$send_hp_mb);//-제거
$recv_hp = str_replace("-","",$recv_hp_mb);//-제거

$send_number = "01089708456"; // - 없이 입력
$recv_number = "01089708456";

$sms_content = $wr_1." 님이 질문게시판에 글을 남겼습니다 -부천옥길점";  // 문자 내용
// $sms_content = "질문게시판에 새 글이 등록되었습니다.";

$SMS = new SMS; // SMS 연결 
$SMS->SMS_con($config['cf_icode_server_ip'], $config['cf_icode_id'], $config['cf_icode_pw'], $config['cf_icode_server_port']); 
$SMS->Add($send_number, $send_number, $config['cf_icode_id'], iconv("utf-8", "euc-kr", stripslashes($sms_content)), ""); 
$SMS->Send();
}
alert("견적문의가 접수되었습니다.", G5_URL);
?>