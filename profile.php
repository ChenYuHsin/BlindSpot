<?php

	include( "./source/head.php" );

	if( isset( $_GET['id'] ) ) {
		$id = $_GET['id'];
		echo '<script type="text/javascript">var relationship = '.$id.';</script>';
	} else
		echo '<script type="text/javascript">var relationship = "me";</script>';

?>

<body id="profile" class="stop-scrolling">

	<div class="tool-bar">
		<div class="search-tool">
			<input type="text" placeholder="Who are you looking for?" />
			<!-- 提示框框 -->
			<div class="name-box">
				<div class="title">User</div>
				<div class="user_wrapper"></div>
				<div class="random_search">Random</div>
			</div>
		</div>
		<div class="logo">
			<a href="./profile.php">
				<img src="./images/logo/logo-white.png" />
			</a>
		</div>
		<span class="logout">登出</span>
	</div>

	<div class="psn-photo v-mid">
		<div class="sticker-wrapper">
			<div class="ur-sticker">
				<img src="./images/profile/0/sticker.png" />
			</div>
		</div>
		<div class="add-friend">
			+ FRIEND
		</div>
	</div>

	<div class="psn-wall">

		<div class="psn-info">
			<h1>Robot</h1>
			<h3>此 ID 不存在喔</h3>
		</div>

	<!-- 瀑布牆 -->
		<div id="lots_of_post">

			<!-- ... -->
			<!-- ... -->
			<!-- ... -->

		</div>
		<br class="clear" />

	</div>

	<div class="data_board">
		<h1>累計po文數</h1>
		<h2 class="post_number"></h2>
		<h1>留言關鍵字</h1>
		<h2 class="key_word"></h2>
	</div>

	<div class="msg-box">
		<input type="text" placeholder="Anything good, anything bad, you can comment here." />
		<div class="post_btn"></div>
		<div class="dont_click"></div>
	</div>

	<div class="bu_dai">

		<!-- 嘿嘿 -->
		<div class="guo_fang_bu"></div>

		<!-- 個人設定 -->
		<div class="setting-box">
			<div class="setting-menu">
				<div id="info" class="item menu-selected">Info</div>
				<div id="photo" class="item">Photo</div>
			</div>
			<div class="divider setting"></div>

			<form id="info_form" class="pure-form pure-form-aligned">

				<div class="pure-control-group">
					<label for="fname">First name</label>
					<input id="fname" type="text" placeholder="First name" />
				</div>

				<div class="pure-control-group">
					<label for="lname">Last name</label>
					<input id="lname" type="text" placeholder="Last name" />
				</div>

				<div class="pure-control-group">
					<label for="intro">Introduction<br/><span class="note">(160 character limit)</span></label>
					<textarea id="intro" type="text" maxlength="160" placeholder="About you" ></textarea>
				</div>

			</form>

			<form id="photo_form" action="./backend/blindspot.php" method="POST" enctype="multipart/form-data" class="pure-form pure-form-aligned">

				<div class="pure-control-group">
					<label for="sticker">Personal photo</label>
					<input id="sticker" name="sticker" type="file" />
				</div>

				<div class="pure-control-group">
					<label for="back_photo">Background photo</label>
					<input id="back_photo" name="back_photo" type="file" />
				</div>

				<input type="hidden" name="func" value="upload_photo" />

			</form>

			<div class="btn-group">
				<button class="pure-button pure-button-primary save">Save</button>
				<button class="pure-button cancel">Cancel</button>
			</div>
		</div>

		<!-- 顯示po文 -->
		<div class="post-box">

			<img class="close-me" src="./images/profile/close_btn.png" />

			<div class="author v-mid">
				<img />
				<span class="name"></span>
			</div>

			<div class="d_wrapper">
				<div class="divider"></div>
			</div>

			<div class="post_content"></div>

			<div class="comment_block">

				<div class="status-bar">
					<div class="love"><i class="fa fa-thumbs-o-up"></i>x<span class="number"></span></div>
					<div class="hate"><i class="fa fa-thumbs-o-down"></i>x<span class="number"></span></div>
				</div>

				<div class="comment-wrapper">
					<!-- ... -->
					<!-- ... -->
					<!-- ... -->
				</div>

			</div>

		</div>

		<div id="framework">
			<div class="author v-mid">
				<a><img /></a><a><span class="name"></span></a>
			</div>
			<div class="post_content"></div>
			<span class="more-msg">
				<span class="num"></span>則留言...
			</span>
		</div>

	</div>

	<div class="loading_page v-mid">
		<img src="./images/loading.gif" />
	</div>

</body>

</html>


