async function login() {
	let email = document.querySelector('#email').value;
	let password = document.querySelector('#password').value;

	const data = new FormData();
	data.append('email', email);
	data.append('password', password);

	await fetch('api/auth/login', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data != undefined && data.status) {
				console.log('Logged in!');
				window.location.replace('/');
			} else {
				console.log('Incorrect email or password!');
			}
		});
}

document.querySelector('#loginButton').addEventListener('click', login);
