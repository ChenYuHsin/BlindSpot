(function($){

	/* ---------------------------------- *\
					瀑 布 流
	\* ---------------------------------- */

	var sample_code, gridNumber, jdata_stored;
	var currentGrid = 0;
	var add_running = 0;

	$.fn.initialize = function( framework, options, jdata, callback_func ) {

		sample_code = '<div class="grid">' + framework + '</div>';

		var settings = $.extend({
			gridNumber: 20,
			column_number: 1,
			margin_left: '0px',
			margin_right: '0px',
			color: 'black'
		}, options);

		gridNumber = settings.gridNumber;

		for( var i = 0; i < settings.column_number; i++ ) {
			this.append( '<div class="outline f-left"></div>' );
		}

		this.find('.outline').css({
			'margin-left': settings.margin_left,
			'margin-right': settings.margin_right,
			'color': settings.color,
			'width': ( this.width() - ( parseInt(settings.margin_left) + parseInt(settings.margin_right) ) *settings.column_number ) / settings.column_number
		});

		setContent( jdata, callback_func );
		jdata_stored = jdata;

	};

	$.fn.giveMeMore = function( more_callback ) {

		var plugin_status = 0;

		if( add_running == 0 ) {

			if( currentGrid +1 < jdata_stored['data'].length ) {

				add_running = 1;

				currentGrid++;
				var limitNum = currentGrid  + gridNumber;
				for( var i = currentGrid; i < limitNum; i++ ) {

					if( typeof jdata_stored['data'][i] != "undefined" ) {

						var shortest = getShortest();

						$('.outline').eq( shortest ).append( sample_code );

						var creatingElement = $('.outline').eq( shortest ).find('.grid').last();
							creatingElement.attr( 'rel', jdata_stored['data'][i]['pid'] );
							creatingElement.find('a').attr( 'href', './profile.php?id=' + jdata_stored['data'][i]['senderid'] );
							creatingElement.find('.author img').attr( 'src', './images/profile/' + jdata_stored['data'][i]['senderid'] + '/sticker.png' );
							creatingElement.find('.author .name').text( isThisEnglish( jdata_stored['data'][i]['l_name'] ) ? jdata_stored['data'][i]['f_name'] + " " + jdata_stored['data'][i]['l_name'] : jdata_stored['data'][i]['l_name'] + jdata_stored['data'][i]['f_name'] );
							creatingElement.find('.post_content').html( jdata_stored['data'][i]['p_content'] );
							creatingElement.find('.more-msg .num').text( jdata_stored['data'][i]['count_comment'] );
							creatingElement.addClass('animated zoomIn');

						currentGrid = i;
					} else {
						// 這一輪跑到一半就用光了
						plugin_status = 1;
						break;
					}

					if( i+1 == limitNum ) {
						// 這一輪全部跑完 nice!
						plugin_status = 2;
					}

				}

			} else {
				// 已經用光了 別在摳了>///<
				plugin_status = 3;
			}

		} else {
			// plugin is working~~~~
			plugin_status = 4;
		}

		switch( plugin_status ) {
			case 1:
					add_running = 0;
					more_callback();
					return "oh_no";
				break;
			case 2:
					add_running = 0;
					more_callback();
					return "finish";
				break;
			case 3:
					return "no_more_data";
				break;
			case 4:
					return "running";
				break;
			default: 
				break;
		}

	};

	$.fn.addNewGrid = function( jdata ) {

		var shortest = getShortest();

		$('.outline').eq( shortest ).prepend( sample_code );

		var creatingElement = $('.outline').eq( shortest ).find('.grid').first();
			creatingElement.attr( 'rel', jdata['data'][0]['pid'] );
			creatingElement.find('a').attr( 'href', './profile.php?id=' + jdata['data'][0]['senderid'] );
			creatingElement.find('.author img').attr( 'src', './images/profile/' + jdata['data'][0]['senderid'] + '/sticker.png' );
			creatingElement.find('.author .name').text( isThisEnglish( jdata['data'][0]['l_name'] ) ? jdata['data'][0]['f_name'] + " " + jdata['data'][0]['l_name'] : jdata['data'][0]['l_name'] + jdata['data'][0]['f_name'] );
			creatingElement.find('.post_content').html( jdata['data'][0]['p_content'] );
			creatingElement.find('.more-msg .num').text( jdata['data'][0]['count_comment'] );

	};

	function setContent( jdata, callback_func ) {

		for( var i = currentGrid; i < gridNumber; i++ ) {

			if( typeof jdata['data'][i] != "undefined" ) {

				var shortest = getShortest();

				$('.outline').eq( shortest ).append( sample_code );

				var creatingElement = $('.outline').eq( shortest ).find('.grid').last();
					creatingElement.attr( 'rel', jdata['data'][i]['pid'] );
					creatingElement.find('a').attr( 'href', './profile.php?id=' + jdata['data'][i]['senderid'] );
					creatingElement.find('.author img').attr( 'src', './images/profile/' + jdata['data'][i]['senderid'] + '/sticker.png' );
					creatingElement.find('.author .name').text( isThisEnglish( jdata['data'][i]['l_name'] ) ? jdata['data'][i]['f_name'] + " " + jdata['data'][i]['l_name'] : jdata['data'][i]['l_name'] + jdata['data'][i]['f_name'] );
					creatingElement.find('.post_content').html( jdata['data'][i]['p_content'] );
					creatingElement.find('.more-msg .num').text( jdata['data'][i]['count_comment'] );

				currentGrid = i;

			}

		}

		callback_func();

	}

	function getShortest() {

		var heightArray = [];

		$.each( $('.outline'), function(){
			// console.log($(this));
			heightArray.push( parseInt( $(this).height() ) );
		});

		var min_of_array = Math.min.apply( null, heightArray );
		// console.log( heightArray );
		return $.inArray( min_of_array, heightArray );

	}

	function isThisEnglish( str ) {
		var regExp = /^[\d|a-zA-Z]+$/;
		if( regExp.test(str) )
			return true; // english
		else
			return false; // chinese
	}


}(jQuery));


