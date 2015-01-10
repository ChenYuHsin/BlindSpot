var windowW, windowH;

var ajax_search, dontAddMore = 0;

$(document).ready( function(){

// IE 不要
	// if( $.support.msie || (!!navigator.userAgent.match(/Trident\/7\./) ) ) {
		// alert('Stop using IE !');
		// location.href = "http://140.119.19.45/EddieWen/ie_4_ni/";
	// }

	windowW = $(window).width();
	windowH = $(window).height();

	var newStickerUrl = $('.psn-photo .ur-sticker img').attr('src') + '?yo=' + getRandomNum;
	console.log( newStickerUrl );
	// $('.psn-photo .ur-sticker img').attr('src');

// --------------------------------- \\    \/
//			H O M E P A G E			 \\--- /
// --------------------------------- \\
	if( $('body').attr( 'id' ) == 'homepage' ) {

		// check session
		$.ajax({
			url: './backend/blindspot.php',
			type: 'POST',
			data: {
				func: 'if_login'
			},
			success: function( response ){
				if( $.parseJSON(response)['status'] == "login" )
					location.href = "./profile.php";
			},
			error: function(){

			}
		})

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
									alert('啊....\n壞惹');
							},
							error: function() {

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

		$('body').animate({'scrollTop': '0px'});

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
					var name = fullName( info['data'][0]['l_name'], info['data'][0]['f_name'] );

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
						// post_about
						$.ajax({
							url: './backend/blindspot_2.php',
							type: 'POST',
							data: {
								func: 'get_post_about'
							},
							success: function( response ){
								var word = $.parseJSON(response);
								if( word['status'] == "success" ) {
									$('.data_board .post_number').text( word['data']['post_number'] );
									$('.data_board .key_word').text( word['data']['keyword'] );
									// remove loading-page
									setTimeout( function(){
										$('.loading_page').fadeOut(800);
										$('body').removeClass('stop-scrolling');
									}, 500);
								}
							},
							error: function(){
								alert('error');
							}
						});
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
								var im = post_data['delete_able'];
								if( post_data['status'] = "success" ) {

									$('#lots_of_post').initialize( $('#framework').html(), {
										gridNumber: 10,
										column_number: 3,
										margin_left: '10px',
										margin_right: '10px'
									}, post_data, function(){

										// remove loading-page
										setTimeout( function(){
											$('.loading_page').fadeOut(800);
											$('body').removeClass('stop-scrolling');
										}, 500);

										onClickFuncInFallwall();

									});

								}
							},
							error: function(){
								// if get_post fail
							}
						});

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
			if( $('.msg-box input').val() !== "" ) {

				$('.msg-box input').prop( 'disabled', true );
				$('.msg-box .dont_click').addClass('show');
				if( $('.msg-box').hasClass('for_msg') ) {

					$.ajax({
						url: './backend/blindspot.php',
						type: 'POST',
						data: {
							func: 'comment_on_post',
							p_id: $('.bu_dai .post-box').attr('rel'),
							c_content: $('.msg-box input').val()
						},
						success: function( response ){
							var comment_detail = $.parseJSON( response );
							if( comment_detail['status'] == "success" ) {
								$('.msg-box input').val('');
								$('.msg-box input').prop( 'disabled', false );
								$('.msg-box .dont_click').removeClass('show');

								var sender_name = fullName( comment_detail['data'][0]['l_name'], comment_detail['data'][0]['f_name'] );
								$('.comment-wrapper').append('<div class="per_comment" rel="' + comment_detail['data'][0]['c_id'] + '"><div class="f-left sticker"><a href="./profile.php?id=' + comment_detail['data'][0]['sender_id'] + '"><img src="./images/profile/' + comment_detail['data'][0]['sender_id'] + '/sticker.png" /></a></div><div class="f-left right-part"><a href="./profile.php?id=' + comment_detail['data'][0]['sender_id'] + '"><span class="name">' + sender_name + '</span></a><div class="content">' + comment_detail['data'][0]['c_content'] + '</div><div class="delete comment"></div></div><br class="clear" /></div>');

								$('.delete.comment').off('click').on( 'click', function(){
									if( confirm("確定刪除此則留言？") ) {
										var thisComment = $(this).parent('.right-part').parent('.per_comment');
										$.ajax({
											url: './backend/blindspot_2.php',
											type: 'POST',
											data: {
												func: 'delete_comment',
												c_id: thisComment.attr('rel')
											},
											success: function( response ){
												if( $.parseJSON(response)['status'] == "success" ) {
													thisComment.addClass('animated zoomOut');
													setTimeout( function(){
														thisComment.remove();
													}, 450);
													$.each( $('.grid'), function(){
														if( $(this).attr('rel') == thisComment.closest('.post-box').attr('rel') ) {
															$(this).find('.more-msg .num').text( parseInt( $(this).find('.more-msg .num').text() )-1 );
														}
													});
												}
											},
											error: function(){

											}
										});
									}
								});

								$.each( $('.psn-wall .grid'), function(){
									if( $(this).attr('rel') == $('.bu_dai .post-box').attr('rel') ) {
										var newMsgNumber = parseInt( $(this).find('.num').text() ) +1;
										$(this).find('.num').text( newMsgNumber );
									}
								});
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
							$('.msg-box input').prop( 'disabled', false );
							$('.msg-box .dont_click').removeClass('show');

							var post_detail = $.parseJSON( response );
							console.log(post_detail);
							$('#lots_of_post').addNewGrid( post_detail, function(){
								onClickFuncInFallwall();
							});
						},
						error: function(){
							alert( "Something wrong~ 請稍候嘗試，感謝~" );
						}
					});

				}
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

		$('.tool-bar .logout').on( 'click', function(){
			$.ajax({
				url: './backend/blindspot.php',
				type: 'POST',
				data: {
					func: 'logout'
				},
				success: function(){
					location.href = "./index.php";
				},
				error: function(){
					alert("登出也會出錯？！");
				}
			});
		});

		// search name
		$('.tool-bar .search-tool input').on( 'input', function(){
			if( $('.tool-bar .search-tool input').val() !== "" ) {
				if( ajax_search ) {
					ajax_search.abort();
				}
				ajax_search = $.ajax({
					url: './backend/blindspot.php',
					type: 'POST',
					data: {
						func: 'search_name',
						input: $(this).val()
					},
					success: function( response ){
						var outcome = $.parseJSON(response);
						if( outcome['status'] == "success" ) {
							$('.search-tool .name-box .user_wrapper').html('');
							for( var i = 0; i < outcome['data'].length; i++ ) {
								var name = fullName( outcome['data'][i]['l_name'], outcome['data'][i]['f_name'] );
								$('.search-tool .name-box .user_wrapper').append('<a href="./profile.php?id=' + outcome['data'][i]['m_id'] + '"><div class="user">' + name + '</div></a>');
							}
							$('.search-tool .name-box').addClass('show');
						} else
							$('.search-tool .name-box').removeClass('show');
					},
					error: function(){

					}
				});
			} else
				$('.search-tool .name-box').removeClass('show');
		}).focusin( function(){
			$('.tool-bar .search-tool .name-box').addClass('show');
		}).focusout( function(){
			$('.tool-bar .search-tool .name-box').removeClass('show');
		});

		// random search
		$('.tool-bar .search-tool .random_search').on( 'click', function(){
			$.ajax({
				url: './backend/blindspot_2.php',
				type: 'POST',
				data: {
					func: 'search_random_user'
				},
				success: function( response ){
					var random_id = $.parseJSON(response);
					if( random_id['status'] == "success" ) {
						location.href = "./profile.php?id=" + random_id['data']['friend_id'];
					}
				},
				error: function(){

				}
			})
		});

	}

});

$(window).load( function(){

	$(window).scroll( function(){

		if( $('body').attr('id') == "profile" && relationship != "me" ) {

			var scrollNow = $(window).scrollTop();
			var postTop = $('#lots_of_post').offset().top -20;

			if( scrollNow + windowH >= postTop && !$('.msg-box').hasClass('show') ) {
				$('.msg-box').addClass('show');
			} else if( scrollNow + windowH < postTop && $('.msg-box').hasClass('show') ) {
				$('.msg-box').removeClass('show')
			}

			if( dontAddMore == 0 && scrollNow > $('body').height() - windowH +60 ) {
				var returnValue = $('#lots_of_post').giveMeMore( function(){
					onClickFuncInFallwall();
				});
				if( returnValue == "no_more_data" || returnValue == "oh_no" )
					dontAddMore = 1;
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
						if( $.parseJSON(response)['status'] == "success" ) {
							alert( "儲存成功" );
							$('.btn-group .pure-button.cancel').trigger('click');

							var name = fullName( $('#info_form #lname').val(), $('#info_form #fname').val() );
							$('.psn-wall .psn-info h1').text( name );
							$('.psn-wall .psn-info h3').text( $('#info_form #intro').val() );
						}
					},
					error: function(){
						alert( "啊被你用壞掉了...." );
					}
				});
			} else if( $(this).hasClass('photo') ) {
				$('#photo_form').submit();
			}
		});

	});

}

function fullName( last_name, first_name ) {
	return isThisEnglish( last_name ) ? first_name + " " + last_name : last_name + first_name;
}

function more() {
	$('#lots_of_post').giveMeMore();
}

// fucking long
function onClickFuncInFallwall() {

	$('.psn-wall .grid .more-msg').off('click').on( 'click', function(){

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
				var im = comment['delete_able'];
				if( comment['status'] == "success" ) {
					$('.bu_dai .post-box .status-bar .love .number').text( comment['post_about'][0]['love'] );
					$('.bu_dai .post-box .status-bar .hate .number').text( comment['post_about'][0]['hate'] );
					for( var i = 0; i < comment['data'].length; i++ ) {
						var sender_name = fullName( comment['data'][i]['l_name'], comment['data'][i]['f_name'] );
						$('.comment-wrapper').append('<div class="per_comment" rel="' + comment['data'][i]['c_id'] + '"><div class="f-left sticker"><a href="./profile.php?id=' + comment['data'][i]['sender_id'] + '"><img src="./images/profile/' + comment['data'][i]['sender_id'] + '/sticker.png" /></a></div><div class="f-left right-part"><a href="./profile.php?id=' + comment['data'][i]['sender_id'] + '"><span class="name">' + sender_name + '</span></a><div class="content">' + comment['data'][i]['c_content'] + '</div></div><br class="clear" /></div>');
						if( comment['data'][i]['sender_id'] == im ) {
							$('.comment-wrapper .per_comment:last-child .right-part').append('<div class="delete comment"></div>');
						}
					};
					$('.delete.comment').on( 'click', function(){
						if( confirm("確定刪除此則留言？") ) {
							// I dont' know why 'closest' can't get the element
							// -> $(this).closest('.per_comment');
							var thisComment = $(this).parent('.right-part').parent('.per_comment');
							$.ajax({
								url: './backend/blindspot_2.php',
								type: 'POST',
								data: {
									func: 'delete_comment',
									c_id: thisComment.attr('rel')
								},
								success: function( response ){
									if( $.parseJSON(response)['status'] == "success" ) {
										thisComment.addClass('animated zoomOut');
										setTimeout( function(){
											thisComment.remove();
										}, 450);
										$.each( $('.grid'), function(){
											if( $(this).attr('rel') == thisComment.closest('.post-box').attr('rel') ) {
												$(this).find('.more-msg .num').text( parseInt( $(this).find('.more-msg .num').text() )-1 );
											}
										});
									}
								},
								error: function(){

								}
							});
						}
					});
				}
			},
			error: function(){

			}
		});

		$('.post-box .author img').attr( 'src', thisGrid.find('.author img').attr('src') );
		$('.post-box .author .name').text( thisGrid.find('.author .name').text() );
		$('.post-box .post_content').html( thisGrid.find('.post_content').html() );

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

	$('.psn-wall .grid .delete.post').off('click').on( 'click', function(){
		if( confirm("確定刪除此則貼文？") ) {
			var thisGrid = $(this).parent('.grid');
			$.ajax({
				url: './backend/blindspot_2.php',
				type: 'POST',
				data: {
					func: 'delete_post',
					pid: thisGrid.attr('rel')
				},
				success: function( response ){
					if( $.parseJSON(response)['status'] == "success" ) {
						thisGrid.addClass('zoomOut');
						setTimeout( function(){
							thisGrid.remove();
						}, 450);
					}
				},
				error: function(){

				}
			});
		}
	});
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

function getRandomNum() {
	return Math.floor( Math.random() * 3238947 );
}













