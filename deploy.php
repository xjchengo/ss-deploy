<?php
require './vendor/autoload.php';

use Xjchen\Alauda\Api\V1 as AlaudaApi;

$ssPassword = @$_POST['ss_password'];
$timeout = @$_POST['ss_timeout'];
$method = @$_POST['ss_method'];
$workers = @$_POST['ss_workers'];
$authType = @$_POST['alauda_auth_type'];
$token = @$_POST['alauda_token'];
$username = @$_POST['alauda_username'];
$password = @$_POST['alauda_password'];

if (!$ssPassword or !$timeout or !$method or !$workers
    or !$authType
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

    $payload = [
        'service_name' => 'xjc-shadowsocks',
        'image_name' => 'index.alauda.cn/xjchengo/shadowsocks',
        'image_tag' => 'latest',
        'instance_size' => 'XS',
        'scaling_mode' => 'MANUAL',
        'target_state' => 'STARTED',
        'target_num_instances' => '1',
        'instance_envvars' => [
            'PASSWORD' => (string)$ssPassword,
            'TIMEOUT' => (string)$timeout,
            'METHOD' => (string)$method,
            'WORKERS' => (string)$workers,
        ],
        'instance_ports' => [
            [
                'container_port' => 8388,
                'protocol' => 'tcp',
            ]
        ],
    ];
    $result = AlaudaApi::createService($username, $payload, $token);

    if ($result != null) {
        echo json_encode([
            'status' => 1,
            'msg' => json_encode($result),
        ]);
    } else {
        echo json_encode([
            'status' => 0,
        ]);
    }
    exit();
} catch (Exception $e) {
    echo json_encode([
        'status' => 1,
        'msg' => $e->getMessage(),
    ]);
    exit();
}
