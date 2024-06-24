function forgotPassword() {
	let email = document.querySelector('#email').value;
	console.log(email);
	const data = new FormData();
	data.append('email', email);
	fetch('api/auth/forgot-password', {
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

document.querySelector('#sendEmailBtn').addEventListener('click', forgotPassword);
