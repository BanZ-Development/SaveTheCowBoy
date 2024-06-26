const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

function load() {
	let nav = document.createElement('nav');
	nav.innerHTML = `<nav>
    <a class="navLogo" href="/">
            <img src="../images/webLogo.png" alt="">
        </a>
        <div class="nav-links">
            <a href="/" class="nav-link">Home</a>
            <div class="navLinkDrop">
                <p>Community</p>
                <i class="material-icons">keyboard_arrow_down</i>
            <div class="navDrop">
                <a style="border-radius: 4px 4px 0px 0px;" href="forum" class="dropLink"><i class="fa-regular fa-comments"></i> Forum</a>
                <a href="devotions" class="dropLink"><i class="fa-regular fa-calendar"></i> Daily Devotions</a>
                <a href="bible-plans" class="dropLink"><i class="fa-solid fa-book-bible"></i> Bible Plans</a>
                <a style="border-radius: 0px 0px 4px 4px" href="cowboy-stories" class="dropLink"><i class="fa-solid fa-hat-cowboy-side"></i> Cowboy Stories</a>
            </div>
        </div>
            <a href="pricing" class="nav-link">Pricing</a>
            <a id="signupNav" href="signup" class="nav-link">Sign Up</a>
        </div>
        <div href="" style="display: none;"  id="navProfile" class="navProfile">
            <div class="navProfileUser">    
                <p style="margin-inline: 10px;" id="username">Lucky</p>
                <img id="pfp" src="images/default-pfp.jpeg" alt="">
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="navProfileDrop">
                <a id="profile" class="navProfileDropLink"><i class="fa-solid fa-user"></i> Profile</a>
                <a href="settings" class="navProfileDropLink"><i class="fa-solid fa-gear"></i> Settings</a>
                <a href="subscription" class="navProfileDropLink"><i class="fa-solid fa-credit-card"></i> Subscription</a>
                <a id="logoutBtn" href="logout" class="navProfileDropLink"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
            </div>
        </div>
    </nav>
    `;
	document.body.innerHTML = nav.innerHTML + document.body.innerHTML;
}

function checkLogin() {
	fetch('api/auth/isLoggedIn', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then(async (data) => {
			if (data.status) {
				document.querySelector('#username').innerHTML = SafeHTML(data.username);
				document.querySelector('.navDrop').style = 'right: 275px;';
				document.querySelector('#signupNav').style = 'display: none; !important';
				document.querySelector('#navProfile').style = 'display: flex;';
				document.querySelector('#logoutBtn').style = 'display: flex; !important';
				document.querySelector('#profile').setAttribute('href', `profile?uid=${data.uid}`);
				//document.querySelector('#pfp').src = await returnPfp();
			} else {
				document.querySelector('#signupNav').innerHTML = 'Sign Up';
				document.querySelector('.navDrop').style = 'right: 200px;';
				document.querySelector('.navProfile').style = 'display: none; !important';
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

load();
checkLogin();

async function returnPfp() {
	fetch('api/profile/getPfp', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			const { imageSrc } = data;
			return imageSrc;
		})
		.catch((err) => {
			console.log(err);
		});
}
