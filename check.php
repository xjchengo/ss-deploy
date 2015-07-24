<?php
require './vendor/autoload.php';

use Xjchen\Alauda\Api\V1 as AlaudaApi;

$authType = @$_POST['alauda_auth_type'];
$token = @$_POST['alauda_token'];
$username = @$_POST['alauda_username'];
$password = @$_POST['alauda_password'];

if (!$authType
    or ($authType != 'token' and $authType != 'password')
    or ($authType == 'token' and !$token)
    or ($authType == 'password' and (!$username or !$password))
) {
    echo json_encode([
        'status' => 1,
        'msg' => '信息不完整',
    ]);
    exit();
}

try {
    if ($authType == 'password') {
        // get token
        $apiReturn = AlaudaApi::generateToken($username, $password);
        $token = $apiReturn['token'];
    }

    // fetch service info
    $result = AlaudaApi::getService($username, 'xjc-shadowsocks', $token);

    if (!isset($result['is_deploying']) or $result['is_deploying']) {
        // deploying
        $return = [
            'status' => 0,
            'stage' => 1,
        ];
    } else {
        // deploy successfully
        $env = json_decode($result['instance_envvars'], true);
        $return = [
            'status' => 0,
            'stage' => 2,
            'data' => [
                'default_domain_name' => $result['default_domain_name'],
                'service_port' => $result['instance_ports'][0]['service_port'],
                'method' => $env['METHOD'],
                'ss_password' => $env['PASSWORD'],
            ]
        ];
    }

    echo json_encode($return);
    exit();
} catch (Exception $e) {
    $message = $e->getMessage();
    if (preg_match('/Unable to login with provided credentials/', $message)) {
        $return = [
            'status' => 1,
            'msg' => $message,
        ];
    } elseif (preg_match('/Not found/', $message)) {
        $return = [
            'status' => 0,
            'stage' => 0,
        ];
    } else {
        $return = [
            'status' => -1,
            'msg' => $message,
        ];
        error_log($message."\n", 3, './error.log');
    }

    echo json_encode($return);
    exit();
}
