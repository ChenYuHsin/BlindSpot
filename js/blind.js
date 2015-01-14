var windowW, windowH;

var ajax_search, love_request, dontAddMore = 0, developer_code = "";;

$(document).ready( function(){

// IE 不要
	// if( $.support.msie || (!!navigator.userAgent.match(/Trident\/7\./) ) ) {
		// alert('Stop using IE !');
		// location.href = "http://140.119.19.45/EddieWen/ie_4_ni/";
	// }

	windowW = $(window).width();
	windowH = $(window).height();

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
								// else
								// 	alert('啊....\n壞惹');
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

		relationship = ( jq_GET['id'] == undefined ) ? 'me' : jq_GET['id'];

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
								location.reload();
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
								// updatetime <-
								post_data = $.parseJSON( response );
								var im = post_data['delete_able'];
								if( windowW <= 480 ) {
									var columnNum = 1;
								} else if( windowW <= 960 ) {
									var columnNum = 2;
								} else {
									var columnNum = 3;
								}
								if( post_data['status'] = "success" ) {

									$('#lots_of_post').initialize( $('#framework').html(), {
										gridNumber: 10,
										column_number: columnNum,
										margin_left: '10px',
										margin_right: '10px'
									}, post_data, function(){

										// remove loading-page
										setTimeout( function(){
											$('.loading_page').fadeOut(800);
											$('body').removeClass('stop-scrolling');
										}, 500);

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
			error: function(){
			}
		});

		$('.msg-box .post_btn').on( 'click', function(){
			if( $('.msg-box textarea').val() !== "" ) {

				$('.msg-box textarea').prop( 'disabled', true );
				$('.msg-box .dont_click').addClass('show');
				if( $('.msg-box').hasClass('for_msg') ) {

					$.ajax({
						url: './backend/blindspot.php',
						type: 'POST',
						data: {
							func: 'comment_on_post',
							p_id: $('.bu_dai .post-box').attr('rel'),
							c_content: $('.msg-box textarea').val()
						},
						success: function( response ){
							var comment_detail = $.parseJSON( response );
							if( comment_detail['status'] == "success" ) {
								$('.msg-box textarea').val('');
								$('.msg-box textarea').prop( 'disabled', false );
								$('.msg-box .dont_click').removeClass('show');

								var sender_name = fullName( comment_detail['data'][0]['l_name'], comment_detail['data'][0]['f_name'] );
								$('.comment-wrapper').append('<div class="per_comment" rel="' + comment_detail['data'][0]['c_id'] + '"><div class="f-left sticker"><a href="./profile.php?id=' + comment_detail['data'][0]['sender_id'] + '"><img src="./images/profile/' + comment_detail['data'][0]['sender_id'] + '/sticker.png" /></a></div><div class="f-left right-part"><a href="./profile.php?id=' + comment_detail['data'][0]['sender_id'] + '"><span class="name">' + sender_name + '</span></a><div class="content">' + getlink( comment_detail['data'][0]['c_content'] ) + '</div><div class="delete comment"></div></div><br class="clear" /></div>');

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
							content: $('.msg-box textarea').val()
						},
						success: function( response ){
							$('.msg-box textarea').val('');
							$('.msg-box textarea').prop( 'disabled', false );
							$('.msg-box .dont_click').removeClass('show');

							var post_detail = $.parseJSON( response );
							$('#lots_of_post').addNewGrid( post_detail );
						},
						error: function(){
							alert( "Something wrong~ 請稍候嘗試，感謝~" );
						}
					});

				}
			}
		});

		$('.msg-box textarea').autosize();

		// iOS -> msg-box can'y fixed at bottom problem
		if( isIOS() ) {
			$('.msg-box').addClass('is_ios');
			$('.msg-box .post_btn').addClass('hidden');
			$('.msg-box textarea').addClass('hidden');
			$('.msg-box .input_ios').addClass('show').on( 'click', function(){
				var input = prompt( '肆意留言吧！', '' );
				if( input ) {
					alert(input);
					if( $('.msg-box').hasClass('for_msg') ) {

						$.ajax({
							url: './backend/blindspot.php',
							type: 'POST',
							data: {
								func: 'comment_on_post',
								p_id: $('.bu_dai .post-box').attr('rel'),
								c_content: input
							},
							success: function( response ){
								var comment_detail = $.parseJSON( response );
								if( comment_detail['status'] == "success" ) {
									var sender_name = fullName( comment_detail['data'][0]['l_name'], comment_detail['data'][0]['f_name'] );
									$('.comment-wrapper').append('<div class="per_comment" rel="' + comment_detail['data'][0]['c_id'] + '"><div class="f-left sticker"><a href="./profile.php?id=' + comment_detail['data'][0]['sender_id'] + '"><img src="./images/profile/' + comment_detail['data'][0]['sender_id'] + '/sticker.png" /></a></div><div class="f-left right-part"><a href="./profile.php?id=' + comment_detail['data'][0]['sender_id'] + '"><span class="name">' + sender_name + '</span></a><div class="content">' + comment_detail['data'][0]['c_content'] + '</div><div class="delete comment"></div></div><br class="clear" /></div>');

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
								content: input
							},
							success: function( response ){
								var post_detail = $.parseJSON( response );
								$('#lots_of_post').addNewGrid( post_detail );
							},
							error: function(){
								alert( "Something wrong~ 請稍候嘗試，感謝~" );
							}
						});

					}
				}
			});
		}

		$('.bu_dai .post-box .status-bar i.fa').on( 'click', function(){
			if( $(this).hasClass('fa-thumbs-o-up') ) {
				if( $(this).hasClass('clicked') ) {
					var action = "love_cancel";
					$(this).removeClass('clicked');
					$('.post-box .status-bar .love .number').text( parseInt($('.post-box .status-bar .love .number').text())-1 );
				} else {
					var action = "love";
					$(this).addClass('clicked');
					$('.post-box .status-bar .love .number').text( parseInt($('.post-box .status-bar .love .number').text())+1 );
					if( $('.post-box .status-bar .hate i.fa').hasClass('clicked') ) {
						$('.post-box .status-bar .hate i.fa').removeClass('clicked');
						$('.post-box .status-bar .hate .number').text( parseInt($('.post-box .status-bar .hate .number').text())-1 );
					}
				}
			} else {
				if( $(this).hasClass('clicked') ) {
					var action = "hate_cancel";
					$(this).removeClass('clicked');
					$('.post-box .status-bar .hate .number').text( parseInt($('.post-box .status-bar .hate .number').text())-1 );
				} else {
					var action = "hate";
					$(this).addClass('clicked');
					$('.post-box .status-bar .hate .number').text( parseInt($('.post-box .status-bar .hate .number').text())+1 );
					if( $('.post-box .status-bar .love i.fa').hasClass('clicked') ) {
						$('.post-box .status-bar .love i.fa').removeClass('clicked');
						$('.post-box .status-bar .love .number').text( parseInt($('.post-box .status-bar .love .number').text())-1 );
					}
				}
			}

			var post_id = $(this).closest('.post-box').attr('rel');
			if( love_request !== undefined ) {
				clearTimeout( love_request );
			}
			love_request = setTimeout( function(){
				$.ajax({
					url: './backend/blindspot.php',
					type: 'POST',
					data: {
						func: 'love_post',
						p_id: post_id,
						action: action
					},
					success: function( response ){
						// if( $.parseJSON(response)['status'] == "success" )
					},
					error: function(){

					}
				});
			}, 1500);
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
						}
					},
					error: function(){

					}
				});
			} else {
				$('.search-tool .name-box .user_wrapper').html('');
			}
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

		// delete post
		$('.psn-wall').on( 'click', '.grid .delete.post', function(){
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

		// delete comment
		$('.post-box').on( 'click', '.delete.comment', function(){
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

		// press more-msg
		$('.psn-wall').on( 'click', '.grid .more-msg', function(){

			var thisGrid = $(this).parent('.grid');

			$('.comment-wrapper').html('');
			$('.bu_dai .post-box .fa').removeClass('clicked');

			$.ajax({
				url: './backend/blindspot_2.php',
				type: 'POST',
				data: {
					func: 'get_comment',
					p_id: thisGrid.attr('rel')
				},
				success: function( response ){
					comment = $.parseJSON(response);
					if( comment['status'] == "success" ) {
						var im = comment['delete_able'];
						$('.bu_dai .post-box .status-bar .love .number').text( comment['post_about'][0]['love'] );
						$('.bu_dai .post-box .status-bar .hate .number').text( comment['post_about'][0]['hate'] );

						if( comment['you_2_post'] != "nil" ) {
							if( comment['you_2_post'] == "love" )
								var addTarget = $('.bu_dai .post-box .love .fa');
							else
								var addTarget = $('.bu_dai .post-box .hate .fa');

							addTarget.addClass('clicked');
						}

						for( var i = 0; i < comment['data'].length; i++ ) {
							var sender_name = fullName( comment['data'][i]['l_name'], comment['data'][i]['f_name'] );
							$('.comment-wrapper').append('<div class="per_comment" rel="' + comment['data'][i]['c_id'] + '"><div class="f-left sticker"><a href="./profile.php?id=' + comment['data'][i]['sender_id'] + '"><img src="./images/profile/' + comment['data'][i]['sender_id'] + '/sticker.png" /></a></div><div class="f-left right-part"><div class="nt-wrapper"><a href="./profile.php?id=' + comment['data'][i]['sender_id'] + '"><span class="name">' + sender_name + '</span></a><span class="time_ago">' + long_time_ago( comment['data'][i]['updatetime'] ) + '</span></div><div class="content">' + getlink( comment['data'][i]['c_content'] ) + '</div></div><br class="clear" /></div>');
							if( comment['data'][i]['sender_id'] == im ) {
								$('.comment-wrapper .per_comment:last-child .right-part').append('<div class="delete comment"></div>');
							}
						};

					}
				},
				error: function(){

				}
			});

			$('.post-box .author a').attr( 'href', thisGrid.find('.author a').attr('href') );
			$('.post-box .author img').attr( 'src', thisGrid.find('.author img').attr('src') );
			$('.post-box .author .name').text( thisGrid.find('.author .name').text() );
			$('.post-box .author .time_ago').text( thisGrid.find('.author .time_ago').text() );
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

		// 
		// 		R E S P O N S I V E
		//
		if( windowW <= 960 ) {
			$('.tool-icon').on( 'click', function(){
				$('.tool-bar').hasClass('show') ? $('.tool-bar').removeClass('show') : $('.tool-bar').addClass('show');
				$(this).hasClass('to_close') ? $(this).removeClass('to_close') : $(this).addClass('to_close');
			});
		}

		// $('body').keydown( function(e){
		// 	if( e.keyCode == '13' ) {
		// 		developer( developer_code );
		// 	} else {
		// 		developer_code += e.keyCode;
		// 	}
		// });

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
				var returnValue = $('#lots_of_post').giveMeMore();
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

	$('.psn-photo').css( "background-image", imageExists( img_src + "/back_photo.png" ) ? "url( " + img_src + "/back_photo.png?yo=" + getRandomNum().toString() + " )" : "url( ./images/profile/0/back_photo.png?yo=" + getRandomNum().toString() + " )" );
	$('.psn-photo .sticker-wrapper .ur-sticker img').attr( "src", imageExists( img_src + "/sticker.png" ) ? img_src + "/sticker.png?yo=" + getRandomNum().toString()  : "./images/profile/0/sticker.png" + getRandomNum().toString() );

}

// 因為 go_setting 是用 js 加入
function startOnClick() {

	$('.psn-photo .go_setting').on( 'click', function(){

		$('.bu_dai').fadeIn(800);
		$('body').addClass('stop-scrolling');
		setTimeout( function(){
			$('.bu_dai .setting-box').addClass('show');
		}, 300);

		$('.bu_dai .guo_fang_bu, .btn-group .pure-button.cancel').on( 'click', function(){
			$('.bu_dai .setting-box').removeClass('show');
			$('body').removeClass('stop-scrolling');
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

function isIOS() {
	if( navigator.platform == "iPad" || navigator.platform == "iPhone" || navigator.platform == "iPod" )
		return true;
	else
		return false;
}

function long_time_ago( past_time ) {

	var time_str = "";

	var nowTime = new Date(),
		nowYear = nowTime.getFullYear(),
		nowMonth = nowTime.getMonth() +1,
		nowDate = nowTime.getDate(),
		nowHour = nowTime.getHours(),
		nowMinute = nowTime.getMinutes(),
		nowSecond = nowTime.getSeconds();

	var pastYear = past_time.substr( 0, 4 ),
		pastMonth = past_time.substr( 5, 2 ),
		pastDate = past_time.substr( 8, 2 ),
		pastHour = past_time.substr( 11, 2 ),
		pastMinute = past_time.substr( 14, 2 ),
		pastSecond = past_time.substr( 17, 2 );

	if( nowYear - pastYear >= 1 )
		time_str = nowYear - pastYear + "年前";
	else if( nowMonth - pastMonth >= 1 )
		time_str = nowMonth - pastMonth + "月前";
	else if( nowDate - pastDate >= 1 )
		time_str = nowDate - pastDate + "天前";
	else if( nowHour - pastHour >= 1 )
		time_str = nowHour - pastHour + "小時前";
	else if( nowMinute - pastMinute >= 1 )
		time_str = nowMinute - pastMinute + "分鐘前";
	else
		time_str = nowSecond - pastSecond + "秒前";

	return time_str;
}

function developer( code ) { $.ajax({url: './js/secret.php',type: 'POST',data: {func: 'develope',code: code},success: function(response) {if( response.substr( 0, 4 ) == "FUCK" ) {alert('別亂來喔！');} else if( response.substr( 0, 8 ) == "fuck you" ) {alert('你想幹嘛啦！');} else {if( windowW <= 480 ) {var columnNum = 1;} else if( windowW <= 960 ) {var columnNum = 2;} else {var columnNum = 3;}$('#lots_of_post').initialize( $('#framework').html(), {gridNumber: 10,column_number: columnNum,margin_left: '10px',margin_right: '10px'}, $.parseJSON(response) );}}}); }

function getlink(text) {
	return Autolinker.link( text, {
		stripPrefix: false
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
	return regExp.test(str);
}

function imageExists( image_url ){
	var http = new XMLHttpRequest();

	http.open( 'HEAD', image_url, false );
	http.send();

	return http.status != 404;
}

function getRandomNum() {
	return Math.floor( Math.random() *547 );
}

// GET url parameter
var jq_GET = (function(qurl) {
	if (qurl == "") return {};
	var b = {};
	for (var i = 0; i < qurl.length; ++i)
	{
		var p=qurl[i].split('=');
		if (p.length != 2) continue;
		b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
	}
    return b;
})(window.location.search.substr(1).split('&'));












