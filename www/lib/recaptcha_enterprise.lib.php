<?php
if (!defined('_GNUBOARD_')) exit;

use Google\Cloud\RecaptchaEnterprise\V1\RecaptchaEnterpriseServiceClient;
use Google\Cloud\RecaptchaEnterprise\V1\Event;
use Google\Cloud\RecaptchaEnterprise\V1\Assessment;
use Google\Cloud\RecaptchaEnterprise\V1\CreateAssessmentRequest;

/**
 * Verify reCAPTCHA Enterprise token and return risk score check result.
 *
 * @param string $token   The token from the client.
 * @param string $siteKey The reCAPTCHA site key.
 * @param string $projectId Google Cloud project ID.
 * @param string $action  Expected action name.
 * @param float  $threshold Minimum acceptable score. Defaults to 0.5.
 * @return bool True if verification succeeded and score >= threshold.
 */
function verify_recaptcha_enterprise($token, $siteKey, $projectId, $action, $threshold = 0.5)
{
    if (!class_exists(RecaptchaEnterpriseServiceClient::class)) {
        return false;
    }

    $client = new RecaptchaEnterpriseServiceClient();
    $projectName = $client->projectName($projectId);

    $event = (new Event())
        ->setSiteKey($siteKey)
        ->setToken($token);

    $assessment = (new Assessment())
        ->setEvent($event);

    $request = (new CreateAssessmentRequest())
        ->setParent($projectName)
        ->setAssessment($assessment);

    try {
        $response = $client->createAssessment($request);

        if (!$response->getTokenProperties()->getValid()) {
            return false;
        }

        if ($response->getTokenProperties()->getAction() !== $action) {
            return false;
        }

        $score = $response->getRiskAnalysis()->getScore();
        return $score >= $threshold;
    } catch (Exception $e) {
        return false;
    } finally {
        if (method_exists($client, 'close')) {
            $client->close();
        }
    }
}
