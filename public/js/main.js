function checkLogin() {
	fetch('api/auth/isLoggedIn', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.status) {
				console.log('working');
				document.querySelector('#username').innerHTML = data.username;
				document.querySelector('.navDrop').style = 'right: 275px;';
				document.querySelector('#signupNav').style = 'display: none; !important';
				document.querySelector('#navProfile').style = 'display: flex;';
				document.querySelector('#logoutBtn').style = 'display: flex; !important';
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

checkLogin();
