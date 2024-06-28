const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

const getCookie = (cname) => {
	let name = cname + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
};

const setCookie = async (name, value, days) => {
	const d = new Date();
	d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
	let expires = 'expires=' + d.toUTCString();
	document.cookie = name + '=' + value + ';' + expires + '; path=/; Secure; SameSite=None';
};

function load() {
	let nav = document.createElement('nav');
	nav.innerHTML = `<nav>
    <a class="navLogo" href="/">
            <img src="../images/webLogo.png" alt="">
        </a>
        <div class="nav-links">
            <a href="/" class="nav-link"><i id="responsiveNavIcon" class="fa-solid fa-house"></i> Home</a>
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
            <a id="signupNav" href="signup" class="nav-link"><i id="responsiveNavIcon" class="fa-solid fa-right-to-bracket"></i> Sign Up</a>
            <div href="" style="display: none;"  id="navProfile" class="navProfile">
            <div class="navProfileUser">    
                <p style="margin-inline: 10px;" id="username"></p>
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
		</div>
        
        <button class="navIcon" id="burgerMenu"><i class="fa-solid fa-bars"></i></button>
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
				if (data.pfp) document.querySelector('#pfp').src = `/image/${data.pfp}`;
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

document.querySelector('.navIcon').addEventListener('click', openMenu);

function openMenu() {
	let menu = document.querySelector('.nav-links').style.display;
	if (menu == 'flex') {
		document.querySelector('.nav-links').style.display = 'none';
		document.querySelector('#burgerMenu').innerHTML = '<i class="fa-solid fa-bars"></i>';
	} else {
		document.querySelector('.nav-links').style.display = 'flex';
		document.querySelector('#burgerMenu').innerHTML = '<i class="fa-solid fa-xmark"></i>';
		anime({
			targets: '.nav-links',
			translateX: [-100, 0],
			opacity: [0, 1],
			easing: 'easeInOutQuad',
			duration: 200
		});
	}
}

function checkForPfpCookie() {
	let pfp = getCookie('pfp');
	if (pfp == '') {
		fetch('api/profile/getPfp', {
			method: 'get',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
			.then((res) => res.json())
			.then(async (data) => {
				if (data.status) {
					setCookie('pfp', data.pfp, 14);
					pfp = getCookie('pfp');
					document.querySelector('#pfp').src = `/image/${pfp}`;
				} else {
					document.querySelector('#pfp').src = '../images/default-pfp.jpeg';
				}
			})
			.catch((err) => {
				console.log(err);
			});
	} else document.querySelector('#pfp').src = `/image/${pfp}`;
}
checkForPfpCookie();
