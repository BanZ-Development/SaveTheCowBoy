const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

const getCookie = (name) => {
	let value = null;
	let cookies = document.cookie.split(';');
	cookies.forEach((cookie) => {
		if (cookie.includes(`${name}=`)) {
			value = cookie.split(`${name}=`)[1];
			return value;
		}
	});
	return value;
};

function load() {
	let nav = document.createElement('nav');
	nav.innerHTML = `
	<div class="construction" style="display: none;">
	<p id="constructionDesc"><i style="margin-inline:5px;" class="fa-solid fa-wrench"></i> sorry that page is still under construction</p>
	</div>
	<nav id="nav">
    <a class="navLogo" href="/">
            <img src="../images/webLogo.png" alt="">
        </a>
        <div class="nav-links">
			<span id="navSep" class="line"></span>
            <a href="/" class="nav-link"><i id="responsiveNavIcon" class="fa-solid fa-house"></i> Home</a>
			<a id="logoutBtn2" href="logout" class="navProfileDropLink"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
            <div class="navLinkDrop">
                <p>Community</p>
                <i class="material-icons">keyboard_arrow_down</i>
            <div class="navDrop">
                <a style="border-radius: 4px 4px 0px 0px;" href="forum" class="dropLink"><i class="fa-regular fa-comments" disabled></i> Forum</a>
                <a href="devotions" class="dropLink"><i class="fa-regular fa-calendar"></i> Daily Devotions</a>
                <a href="biblePlans" class="dropLink"><i class="fa-solid fa-book-bible"></i> Bible Plans</a>
                <a style="border-radius: 0px 0px 4px 4px" href="cowboyStories" class="dropLink"><i class="fa-solid fa-hat-cowboy-side"></i> Cowboy Stories</a>
            </div>
        </div>
            <a id="signupNav" href="signup" class="nav-link"><i id="responsiveNavIcon" class="fa-solid fa-right-to-bracket"></i></a>
            <div href="" style="display: none;"  id="navProfile" class="navProfile">
            <div class="navProfileUser">    
                <p style="margin-inline: 10px;" id="username"></p>
                <img id="pfp" src="images/default-pfp.jpeg" alt="">
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="navProfileDrop">
                <a id="profile" class="navProfileDropLink"><i class="fa-solid fa-user"></i> Profile</a>
                <a href="settings" class="navProfileDropLink"><i class="fa-solid fa-gear"></i> Settings</a>
                <a id="navSub" style="display: none;" class="navProfileDropLink"><i class="fa-solid fa-credit-card"></i> Subscription</a>
                <a id="logoutBtn1" href="logout" class="navProfileDropLink"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
            </div>
        </div>
		</div>
        
        <button class="navIcon" id="burgerMenu"><i class="fa-solid fa-bars"></i></button>
    </nav>
	<div id="spinner" style="background-color: white; width: 100%; height: 100%; display: none; justify-content: center; align-items: center; z-index: 100;">
        <l-ring
        size="40"
        stroke="5"
        bg-opacity="0"
        speed="2"
        color="black" 
        ></l-ring>
    </div>
    `;
	document.body.innerHTML = nav.innerHTML + document.body.innerHTML;
	let spinner = document.createElement('script');
	spinner.type = 'module';
	spinner.src = 'https://cdn.jsdelivr.net/npm/ldrs/dist/auto/ring.js';
	console.log(spinner);
	document.head.appendChild(spinner);
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
				document.querySelector('.navDrop').style = 'right: -35px;';
				document.querySelector('#signupNav').style = 'display: none; !important';
				document.querySelector('#navProfile').style = 'display: flex;';
				document.querySelector('#logoutBtn1').style = 'display: flex; !important';
				document.querySelector('#profile').setAttribute('href', `profile?uid=${data.uid}`);
				if (data.pfp) {
					document.querySelector('#pfp').src = `/image/${data.pfp}`;
				}
				if (data.admin) {
					let adminLink = document.createElement('a');
					adminLink.className = 'navProfileDropLink';
					adminLink.innerHTML = '<i class="fa-solid fa-chart-line"></i> Admin Dashboard';
					adminLink.href = 'admin';
					document.querySelector('#navSub').insertAdjacentElement('afterend', adminLink);
				}
			} else {
				document.querySelector('#signupNav').innerHTML = '<i id="responsiveNavIcon" class="fa-solid fa-right-to-bracket"></i> Signup';
				document.querySelector('.navDrop').style = 'right: -35px';
				document.querySelector('.navProfile').style = 'display: none !important;';
				document.querySelector('#logoutBtn2').style = 'display: none !important;';
				document.querySelector('#navSep').style = 'display: none !important;';
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
	if (pfp) document.querySelector('#pfp').src = `/image/${pfp}`;
	else document.querySelector('#pfp').src = '../images/default-pfp.jpeg';
	fetch('api/profile/getPfp', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then(async (data) => {
			if (data.status) {
				document.querySelector('#pfp').src = `/image/${data.pfp}`;
			} else {
				document.querySelector('#pfp').src = '../images/default-pfp.jpeg';
			}
		})
		.catch((err) => {
			console.log(err);
		});
}
checkForPfpCookie();

/* COMMENT OUT ON TEST (CONSTRUCTION BANNER)
document.addEventListener('DOMContentLoaded', function () {
	for (let i = 0; i < document.querySelectorAll('.dropLink').length; i++) {
		document.querySelectorAll('.dropLink')[i].addEventListener('click', (event) => {
			event.preventDefault();
			document.querySelector('.construction').style = 'display: block !important;';
			document.querySelector('#nav').style = 'margin-top: 51px;';
			anime({
				targets: '.construction, #constructionDesc',
				easing: 'easeInOutQuad',
				translateY: [-100, 0],
				opacity: [0, 1],
				duration: 200
			});
		});
	}
});*/

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#profile').setAttribute('href', '');
	document.querySelector('#profile').addEventListener('click', construction);
	document.querySelector('#navSub').addEventListener('click', construction);
});

function construction(event) {
	event.preventDefault();
	document.querySelector('.construction').style = 'display: block !important;';
	document.querySelector('#nav').style = 'margin-top: 51px;';
	anime({
		targets: '.construction, #constructionDesc',
		easing: 'easeInOutQuad',
		translateY: [-100, 0],
		opacity: [0, 1],
		duration: 200
	});
}
