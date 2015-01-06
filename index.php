<?php include("./source/head.php") ?>
<!--  -->
<body id="homepage">

	<div class="top-bar"></div>

	<div class="first-screen v-mid">
		<img src="./images/logo/logo-sunglasses.png" />

		<div class="btn login">login</div>
		<div class="btn more">know more</div>
	</div>

	<div class="question container">
		<div class="icon-wrapper">
			<img src="./images/homepage/question_mark.png" />
		</div>

		<h1>“布萊得斯霸”是什麼啊？</h1>
		<h2>
			我們想要做出一個可以在對方眼皮底下肆意討論的網路平台&gt;///&lt;<br/>
			<span class="dont_show">( 想到這就覺得刺激XDD )</span>
		</h2>

		<div class="intro-wrapper">
			<div class="intro-section">
				<img class="f-left" src="./images/homepage/people.png" />
				<div class="content v-mid f-right">
					緊緊緊！樓頂揪樓咖，阿公揪阿爸！找來你那些三五好友、狐群狗黨(?)、親朋好友、酒肉朋友(?)，總之....
				</div>
				<br class="clear" />
			</div>
			<div class="intro-section">
				<div class="content v-mid f-left">
					在這裡你能夠簡單地在別人的地盤上撒野，盡情地留下你想說的話，當然也可以與其他人一同討論。
				</div>
				<img class="f-right" src="./images/homepage/message.png" />
				<br class="clear" />
			</div>
			<div class="intro-section">
				<img class="f-left" src="./images/homepage/blind.png" />
				<div class="content v-mid f-right">
					更有趣的是，「那個人」還完全不會發現！這根本是____的情節啊！<br/>你可以....<br/>
					（Ａ） 曖昧地偷偷感謝那位幫你投下15塊公車錢的男(女)孩<br/>
					（Ｂ） 曖昧地偷偷稱讚那個男(女)孩<br/>
					（Ｃ） 曖昧地偷偷跟那位男(女)孩告白，而且全世界都知道了他(她)還不知道
				</div>
				<br class="clear" />
			</div>
		</div>
	</div>

	<div class="divider"></div>

	<div class="team container">
		<div class="icon-wrapper">
			<img src="./images/homepage/team.png" />
		</div>

		<h1>關於製作團隊。。。</h1>
		<h2>
			算了....<br/>nobody cares
		</h2>

	</div>

	<footer>
		Do not copy !!!<div id="fb-root"></div>
	</footer>

</body>

<script>
	window.fbAsyncInit = function() {
		FB.init({
			appId		: '725596630841809',
			cookie		: true,
			status		: true,
			version		: 'v2.2'
		});
	};

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>

</html>

