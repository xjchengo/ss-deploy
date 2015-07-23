
jQuery(document).ready(function(){
	
	$('.deploy-form input[type="text"], .deploy-form input[type="password"], .deploy-form textarea').each(function() {
		$(this).val( $(this).attr('placeholder') );
    });
	
});