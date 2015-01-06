var windowW, windowH;

$(document).ready( function(){

// IE 不要
	if( $.support.msie || (!!navigator.userAgent.match(/Trident\/7\./) ) ) {
		// alert('Stop using IE !');
		location.href = "http://140.119.19.45/EddieWen/ie_4_ni/";
	}

	windowW = $(window).width();
	windowH = $(window).height();

// --------------------------------- \\    \/
//			H O M E P A G E			 \\--- /
// --------------------------------- \\
	if( $('body').attr( 'id' ) == 'homepage' ) {

		$('.first-screen .btn.more').on( 'click', function(){
			$('body').animate({
				scrollTop: windowH
			}, 1200);
		});

		$('.first-screen .btn.login').on( 'click', function(){
			FB.login( function(response) {
				if( response.authResponse ) {
					console.log( 'Welcome!  Fetching your information.... ' );
					FB.api( '/me', function(response) {

						$.ajax({
							url: './backend/blindspot.php',
							type: 'POST',
							data: {
								facebook_id: response.id,
								last_name: response.last_name,
								first_name: response.first_name,
								email: response.email,
								gender: response.gender,
								birthday: response.birthday,
								func: 'insert_member'
							},
							success: function(response) {
								if( response == "success" )
									location.href = "./profile.php";
								else
									alert( '我想應該是FB的錯。請稍候嘗試~' );
							},
							error: function() {
								alert( '我想應該是FB的錯。請稍候嘗試~' );
							}
						});

					});
				} else {
					alert('很抱歉，必須登入才能使用喔 ~');
				}
			}, { scope: 'email, user_birthday' });
		});

	}

// --------------------------------- \\    \/
//			P R O F I L E			 \\--- /
// --------------------------------- \\
	if( $('body').attr( 'id' ) == 'profile' ) {

		if( relationship != "me" ) {
			setPicture( relationship );
		}

		// 取得當頁user資料，若沒id則抓session user資料
		$.ajax({
			url: './backend/blindspot.php',
			type: 'POST',
			data: {
				func: 'get_personal_info',
				friend_id: relationship
			},
			success: function( data ){
				var info = $.parseJSON( data );

				if( info['status'] == "notlogin" ) {
					//沒有登入，轉跳回登入頁
					alert( "請先進行登入動作" );
					location.href = "./";
				} else if( info['status'] == "invaliduser" ) {
					// 不存在的id
					setPicture( 0 );
					$('.msg-box').remove();
				} else {
					// me OR someone's id
					var name = isThisEnglish( info['data'][0]['l_name'] ) ? info['data'][0]['f_name'] + " " + info['data'][0]['l_name'] : info['data'][0]['l_name'] + info['data'][0]['f_name'];

					$('.psn-wall .psn-info h1').text( name );
					$('.psn-wall .psn-info h3').text( info['data'][0]['intro'] );
					$('#info_form #fname').val( info['data'][0]['f_name'] );
					$('#info_form #lname').val( info['data'][0]['l_name'] );
					$('#info_form #intro').val( info['data'][0]['intro'] );

					if( info['status'] == "me" ) {
						// 自己看自己，加入更改頁面
						setPicture( info['data'][0]['m_id'] );
						$('.data_board').css( 'display', 'block' );
						$('.msg-box').remove();
						$('.psn-photo .sticker-wrapper .ur-sticker').append('<div class="go_setting"></div>');
						startOnClick();
					} else {
						// 看別人
						$('.data_board').remove();
						$.ajax({
							url: './backend/blindspot.php',
							type: 'POST',
							data: {
								func: 'get_post',
								friend_id: relationship
							},
							success: function( response ){
								post_data = $.parseJSON( response );
								console.log( post_data );
								if( post_data['status'] = "success" ) {

									$('#lots_of_post').initialize( $('#framework').html(), {
										gridNumber: 10,
										column_number: 3,
										margin_left: '10px',
										margin_right: '10px'
									}, post_data, function(){

										$('.psn-wall .grid .more-msg').on( 'click', function(){

											var thisGrid = $(this).parent('.grid');

											$('.comment-wrapper').html('');

											$.ajax({
												url: './backend/blindspot.php',
												type: 'POST',
												data: {
													func: 'get_comment',
													p_id: thisGrid.attr('rel')
												},
												success: function( response ){
													comment = $.parseJSON(response);
													if( comment['status'] == "success" ) {
														for( var i = 0; i < comment['data'].length; i++ ) {
															var sender_name = isThisEnglish( comment['data'][i]['l_name'] ) ? comment['data'][i]['f_name'] + " " + comment['data'][i]['l_name'] : comment['data'][i]['l_name'] + comment['data'][i]['f_name'];
															$('.comment-wrapper').append('<div class="per_comment"><div class="f-left sticker"><a href="./profile.php?id=' + comment['data'][i]['sender_id'] + '"><img src="./images/profile/' + comment['data'][i]['sender_id'] + '/sticker.png" /></a></div><div class="f-left right-part"><a href="./profile.php?id=' + comment['data'][i]['sender_id'] + '"><span class="name">' + sender_name + '</span></a><div class="content">' + comment['data'][i]['c_content'] + '</div></div><br class="clear" /></div>');
														};
													}
												},
												error: function(){

												}
											});

											$('.post-box .author img').attr( 'src', thisGrid.find('.author img').attr('src') );
											$('.post-box .author .name').text( thisGrid.find('.author .name').text() );
											$('.post-box .post_content').html( thisGrid.find('.post_content').html() );

											for( var i = 0; i < post_data['data'].length; i++ ) {
												if( post_data['data'][i]['pid'] == thisGrid.attr('rel') ) {
													$('.post-box .status-bar .love .number').text( post_data['data'][i]['love'] );
													$('.post-box .status-bar .hate .number').text( post_data['data'][i]['hate'] );
												}
											}

											$('.bu_dai').fadeIn(800);
											setTimeout( function(){
												$('.bu_dai .post-box').fadeIn(800);
											}, 300);

											$('body').addClass('stop-scrolling');
											$('.msg-box').addClass('for_msg');

											$('.bu_dai .post-box').attr( 'rel', thisGrid.attr('rel') );

											$('.bu_dai .guo_fang_bu, .post-box .close-me').on( 'click', function(){
												$('.bu_dai .post-box').fadeOut(800);
												setTimeout( function(){
													$('.bu_dai').fadeOut(800);
												}, 300);

												$('body').removeClass('stop-scrolling');
												$('.msg-box').removeClass('for_msg');
												$(this).off('click');
											});

										});

									});

								}
							},
							error: function(){
								// if get_post fail
							}
						})

					}

				}
			},
			error: function( info ){
				console.log( "===============================" );
				console.log( "============ Error ============" );
				console.log( "===============================" );
				console.log( info );
			}
		});

		$('.msg-box .post_btn').on( 'click', function(){

			if( $('.msg-box').hasClass('for_msg') ) {

				$.ajax({
					url: './backend/blindspot.php',
					type: 'POST',
					data: {
						func: 'comment_on_post',
						p_id: $('.bu_dai .post-box ').attr('rel'),
						c_content: $('.msg-box input').val()
					},
					success: function( response ){
						if( $.parseJSON(response)['status'] == "success" ) {
							$('.msg-box input').val('');
						}
					},
					error: function(){
						alert( "Something wrong~ 請稍候嘗試，感謝~" );
					}
				});

			} else {

				$.ajax({
					url: './backend/blindspot.php',
					type: 'POST',
					data: {
						func: 'post_on_wall',
						friend_id: relationship,
						content: $('.msg-box input').val()
					},
					success: function( response ){
						$('.msg-box input').val('');

						var post_detail = $.parseJSON( response );
						$('#lots_of_post').addNewGrid( post_detail );
					},
					error: function(){
						alert( "Something wrong~ 請稍候嘗試，感謝~" );
					}
				});

			}

		});

		$('.msg-box input').keypress( function(e){
			if( e.keyCode == 13 && $('.msg-box input').val() !== "" )
			 	$('.msg-box .post_btn').trigger('click');
		});

		$('.bu_dai .post-box .status-bar i.fa').on( 'click', function(){
			if( $(this).hasClass('fa-thumbs-o-up') ) {
				var action = "love";
				$('.post-box .status-bar .love .number').text( parseInt($('.post-box .status-bar .love .number').text())+1 );
			} else {
				var action = "hate";
				$('.post-box .status-bar .hate .number').text( parseInt($('.post-box .status-bar .hate .number').text())+1 );
			}

			$.ajax({
				url: './backend/blindspot.php',
				type: 'POST',
				data: {
					func: 'love_post',
					p_id: $(this).closest('.post-box').attr('rel'),
					action: action
				},
				success: function( response ){
					if( $.parseJSON(response)['status'] == "success" ) {

					}
				},
				error: function(){

				}
			});
		});

	}

});

$(window).load( function(){

	$(window).scroll( function(){

		if( $('body').attr('id') == "profile" ) {

			var scrollNow = $(window).scrollTop();
			var postTop = $('#lots_of_post').offset().top -20;

			if( scrollNow + windowH >= postTop && !$('.msg-box').hasClass('show') ) {
				$('.msg-box').addClass('show');
			} else if( scrollNow + windowH < postTop && $('.msg-box').hasClass('show') ) {
				$('.msg-box').removeClass('show')
			}

		}

	});

});

// --------------------------------- \\    \/
//				FUNCTION			 \\--- /
// --------------------------------- \\

function setPicture( user_id ) {

	var img_src = "./images/profile/" + user_id;

	$('.psn-photo').css( "background-image", imageExists( img_src + "/back_photo.png" ) ? "url( " + img_src + "/back_photo.png )" : "url( ./images/profile/0/back_photo.png )" );
	$('.psn-photo .sticker-wrapper .ur-sticker img').attr( "src", imageExists( img_src + "/sticker.png" ) ? img_src + "/sticker.png" : "./images/profile/0/sticker.png" );

}

// 因為 go_setting 是用 js 加入
function startOnClick() {

	$('.psn-photo .go_setting').on( 'click', function(){

		$('.bu_dai').fadeIn(800);
		setTimeout( function(){
			$('.bu_dai .setting-box').css( 'top', '10vh' );
		}, 300);

		$('.bu_dai .guo_fang_bu, .btn-group .pure-button.cancel').on( 'click', function(){
			$('.bu_dai .setting-box').css( 'top', '-200vh' );
			setTimeout( function(){
				$('.bu_dai').fadeOut(800);
			}, 300);
			$(this).off('click');
			$('.setting-box .setting-menu .item').off('click');
			$('.btn-group .pure-button.save').off('click');
		});

		$('.setting-box .setting-menu .item').on( 'click', function(){

			$('.setting-box .setting-menu .item').removeClass('menu-selected');
			$(this).addClass('menu-selected');

			$('.btn-group .pure-button.save').removeClass('info photo');
			$('.btn-group .pure-button.save').addClass( $(this).attr('id') );

			$('.setting-box form').css( 'display', 'none' );
			$('.setting-box form#' + $(this).attr('id') + '_form').css( 'display', 'block' );

		});
		$('.setting-box .setting-menu .item#info').trigger('click');

		$('.btn-group .pure-button.save').on( 'click', function(){
			if( $(this).hasClass( 'info' ) ) {
				$.ajax({
					url: './backend/blindspot.php',
					type: 'POST',
					data: {
						func: 'save_personal_info',
						fname: $('#info_form #fname').val(),
						lname: $('#info_form #lname').val(),
						introduction: $('#info_form #intro').val()
					},
					success: function( response ){
						if( response == "success" ) {
							alert( "儲存成功" );
							$('.btn-group .pure-button.cancel').trigger('click');

							var name = isThisEnglish( $('#info_form #lname').val() ) ? $('#info_form #fname').val() + " " + $('#info_form #lname').val() : $('#info_form #lname').val() + $('#info_form #fname').val()
							$('.psn-wall .psn-info h1').text( name );
							$('.psn-wall .psn-info h3').text( $('#info_form #intro').val() );
						}
					},
					error: function(){
						alert( "啊被你用壞掉了...." );
					}
				});
			} else if( $(this).hasClass('photo') ) {
				alert( 'photo' );
			}
		});

	});

}

function more() {
	$('#lots_of_post').giveMeMore();
}

// --------------------------------- \\    \/
//			NICE FUNCTION			 \\--- /
// --------------------------------- \\

function isThisEnglish( str ) {
	var regExp = /^[\d|a-zA-Z]+$/;
	if( regExp.test(str) )
		return true; // english
	else
		return false; // chinese
}

function imageExists( image_url ){

	var http = new XMLHttpRequest();

	http.open( 'HEAD', image_url, false );
	http.send();

	return http.status != 404;

}













