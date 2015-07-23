jQuery(document).ready(function () {

    /*
     Fullscreen background
     */
    $.backstretch("assets/img/backgrounds/1.jpg");

    $('#top-navbar-1').on('shown.bs.collapse', function () {
        $.backstretch("resize");
    });
    $('#top-navbar-1').on('hidden.bs.collapse', function () {
        $.backstretch("resize");
    });

    $(document).keypress(function (e) {
        if (e.which == 13) {
            if ($('.bootbox button').is(':visible')) {
                $('.bootbox button').trigger('click');
            } else {
                $('.btn-next:visible').trigger('click');
                $('.btn-deploy:visible').trigger('click');
            }
        }
    });

    function generate_form() {
        var authType = $('#alauda_auth_type').val();
        if (authType == 'token') {
            $('#alauda_password').parent().addClass('hide');
            $('#alauda_token').parent().removeClass('hide');
        } else {
            $('#alauda_token').parent().addClass('hide');
            $('#alauda_password').parent().removeClass('hide');
        }
    }

    generate_form();
    $('#alauda_auth_type').change(function () {
        generate_form();
    });

    /*
     Form
     */
    $('.deploy-form fieldset:first-child').fadeIn('slow');

    $('.deploy-form input[type="text"], .deploy-form input[type="password"], .deploy-form select').on('focus', function () {
        $(this).removeClass('input-error');
    });

    // next step
    $('.deploy-form .btn-next').on('click', function () {
        var parent_fieldset = $(this).parents('fieldset');
        var next_step = true;

        parent_fieldset.find('input, select').each(function () {
            if ($(this).is(":visible") && $(this).val() == "") {
                $(this).addClass('input-error');
                next_step = false;
            }
            else {
                $(this).removeClass('input-error');
            }
        });

        if (next_step) {
            $.ajax({
                method: 'POST',
                url: '/check.php',
                data: $(parent_fieldset).serialize(),
                dataType: 'json',
                beforeSend: function () {
                    $.blockUI({
                        message: '<h1>灵雀云账号验证中 <img src="./assets/img/ajax-loader.gif"></h1>'
                    });
                },
                complete: function () {
                    $.unblockUI();
                },
                success: function (result) {
                    if (result.status == 0) {
                        if (result.stage == 0) {
                            parent_fieldset.fadeOut(400, function () {
                                $(this).next().fadeIn();
                                $('#ss_password').focus();
                            });
                        } else {
                            wait_for_deploy();
                        }
                    } else if (result.status == 1) {
                        bootbox.alert("账号验证失败，请检查您的账号信息");
                    } else {
                        bootbox.alert("未知错误：" + result.msg);
                    }
                },
                error: function () {
                    bootbox.alert("服务异常");
                }
            });
        }

    });

    // submit
    $('.deploy-form .btn-deploy').on('click', function (e) {
        e.preventDefault();
        var deploy = true;
        $(this).find('input, select').each(function () {
            if ($(this).val() == "") {
                deploy = false;
                $(this).addClass('input-error');
            }
            else {
                $(this).removeClass('input-error');
            }
        });
        if (deploy) {
            $.ajax({
                method: 'POST',
                url: '/deploy.php',
                data: $('form').serialize(),
                dataType: 'json',
                beforeSend: function () {
                    $.blockUI({
                        message: '<h1>Shadowsocks 服务创建中 <img src="./assets/img/ajax-loader.gif"></h1>'
                    });
                },
                success: function (result) {
                    if (result.status == 0) {
                        $.blockUI({
                            message: '<h1>服务创建成功，部署中 <img src="./assets/img/ajax-loader.gif"></h1>'
                        });
                        wait_for_deploy();
                    } else if (result.status == 1) {
                        $.unblockUI();
                        bootbox.alert("账号验证失败，请检查您的账号信息");
                    } else {
                        $.unblockUI();
                        bootbox.alert("未知错误：" + result.msg);
                    }
                },
                error: function () {
                    $.unblockUI();
                    bootbox.alert("服务异常");
                }
            });
        }
    });

    function wait_for_deploy() {
        $.ajax({
            method: 'POST',
            url: '/check.php',
            data: $('form').serialize(),
            dataType: 'json',
            success: function (result) {
                if (result.status == 0) {
                    if (result.stage == 0) {
                        $.unblockUI();
                        bootbox.alert("服务已被删除，请重新创建");
                    } else if (result.stage == 1) {
                        setTimeout(function () {
                            wait_for_deploy();
                        }, 5000);
                    } else if (result.stage == 2) {
                        $.unblockUI();
                        $('#dd-domain').html(result.data.default_domain_name);
                        $('#dd-port').html(result.data.service_port);
                        $('#dd-method').html(result.data.method);
                        $('#dd-password').html(result.data.ss_password);
                        bootbox.alert("Shadowsocks 服务部署成功", function () {
                            $('fieldset:visible').fadeOut(400, function () {
                                $('fieldset').last().fadeIn();
                            });
                        });
                    }
                } else {
                    $.unblockUI();
                    if (result.status == 1) {
                        bootbox.alert("账号验证失败，请检查您的账号信息");
                    } else {
                        bootbox.alert("未知错误：" + result.msg);
                    }
                }
            },
            error: function () {
                $.unblockUI();
                bootbox.alert("服务异常");
            }
        });
    }
});
