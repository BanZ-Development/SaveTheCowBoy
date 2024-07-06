const InputValidation = (color) => {
	const email = document.querySelector('#email');
	const password = document.querySelector('#password');
	AnimateBorder(email, color);
	AnimateBorder(password, color);
};

const AnimateBorder = (element, color) => {
	element.style.border = `2px solid ${color}`;
};

const ErrorMessage = (message) => {
	let element = document.querySelector('#wrongCredentials');
	element.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Incorrect username or password!';
};

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
			if (data.status) {
				InputValidation('green');
				window.location.replace('/');
			} else {
				InputValidation('red');
				ErrorMessage('Incorrect username or password!');
			}
		});
}

document.querySelector('#loginButton').addEventListener('click', login);

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#showPassword').addEventListener('change', function () {
        let checkbox = document.getElementById('showPassword');
        let passwordField = document.getElementById('password');

        if (checkbox.checked) {
            passwordField.setAttribute('type', 'text');
        } else {
            passwordField.setAttribute('type', 'password');
        }
    });
});