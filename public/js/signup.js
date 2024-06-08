function signup() {
	let email = document.querySelector('#email').value;
	let username = document.querySelector('#username').value;
	let password = document.querySelector('#password').value;

	const data = new FormData();
	data.append('email', email);
	data.append('username', username);
	data.append('password', password);

	fetch('api/auth/signup', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
		});
}

document.querySelector('#signupButton').addEventListener('click', signup);


function Continue() {
	Anime({
		targets: '.signupDivSec',
		opacity: 0,
		easing: 'easeInOutExpo'
	});
}
