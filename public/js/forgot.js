const InputValidation = (element, color) => {
	const e = document.querySelector('#' + element);
	AnimateBorder(e, color);
};

const AnimateBorder = (element, color) => {
	element.style.border = `2px solid ${color}`;
};

const ErrorMessage = (elementName, message, color) => {
	try {
		let element = document.querySelector(`#${elementName}Error`);
		element.innerHTML = message;
	} catch (error) {
		document.querySelector(`#${elementName}`).insertAdjacentHTML('afterend', `<p style="color: ${color}; margin-bottom: 0px; font-size: 13pt;" id="${elementName}Error">${message}</p>`);
	}
};

const RemoveError = (elementName) => {
	try {
		document.querySelector(`#${elementName}Error`).remove();
	} catch (error) {}
};

const validatePassword = () => {
	let password = document.querySelector('#password').value;
	let error = 'Password must be at least 8 characters long, have a number, and have a capital and lowercase character';
	let special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
	if (password.length >= 8 && /\d/.test(password) && special.test(password)) {
		InputValidation('password', 'green');
		RemoveError('password');
		return true;
	} else {
		InputValidation('password', 'red');
		ErrorMessage('password', error, 'red');
		return false;
	}
};

function getResetCode() {
	let email = document.querySelector('#email').value;
	console.log(email);
	const data = new FormData();
	data.append('email', email);
	fetch('api/auth/get-reset-code', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.status) {
				document.querySelector(
					'#response'
				).innerHTML = `Your verification code has been sent to the email: <b>${email}</b>. \nIt may take a few minutes for you to receive your code. Do <b>NOT</b> click the <a href="/forgot-password">back</a> button to try again for 5 minutes.`;
				document.querySelector('#getCode').style.display = 'none';
				document.querySelector('#verifyCode').style.display = 'block';
				document.querySelector('#email').innerHTML = '';
			} else {
				document.querySelector('#response').innerHTML = `There was an error processing your request. Are you sure there is an account associated with the email: ${email}`;
				document.querySelector('#getCode').style.display = 'block';
				document.querySelector('#verifyCode').style.display = 'none';
			}
		});
}

function hasCode() {
	document.querySelector('#sendEmailBtn').style.display = 'none';
	document.querySelector('#hasCodeBtn').style.display = 'none';
	document.querySelector('#verifyCode').style.display = 'block';
}

function back() {
	document.querySelector('#sendEmailBtn').style.display = 'inline';
	document.querySelector('#hasCodeBtn').style.display = 'block';
	document.querySelector('#verifyCode').style.display = 'none';
	document.querySelector('#email').innerHTML = '';
}

function verifyResetCode() {
	let email = document.querySelector('#email').value;
	let code = document.querySelector('#code').value;
	console.log(code);
	const data = new FormData();
	data.append('email', email);
	data.append('code', code);
	fetch('api/auth/verify-reset-code', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.status) {
				//create reset password elements
				console.log('You may reset your password.');
				document.querySelector('#codeDiv').style.display = 'none';
				document.querySelector('#resetDiv').style.display = 'block';
			} else {
				console.log('Error.');
			}
		});
}

function resetPassword() {
	let email = document.querySelector('#email').value;
	let code = document.querySelector('#code').value;
	let password = document.querySelector('#password').value;
	const data = new FormData();
	data.append('email', email);
	data.append('code', code);
	data.append('password', password);
	fetch('api/auth/reset-password', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.status) {
				RemoveError('password');
				InputValidation('password', 'green');
				ErrorMessage('password', 'Password has been reset!', 'green');
				window.location.href = '/login';
			} else {
				RemoveError('password');
				InputValidation('password', 'red');
				ErrorMessage('password', 'Cannot change password! Make sure your email, code, and password are correct!', 'red');
			}
		});
}

document.querySelector('#sendEmailBtn').addEventListener('click', getResetCode);
document.querySelector('#hasCodeBtn').addEventListener('click', hasCode);
document.querySelector('#verifyCodeBtn').addEventListener('click', verifyResetCode);
document.querySelector('#backBtn').addEventListener('click', back);

let timeoutId;
let delay = 500;
const debounce = (func, delay) => {
	clearTimeout(timeoutId);
	timeoutId = setTimeout(func, delay);
};

document.querySelector('#password').addEventListener('input', () => {
	debounce(validatePassword, delay);
});

document.querySelector('#resetPasswordBtn').addEventListener('click', resetPassword);

document.querySelector('#showPassword').addEventListener('change', function () {
	let checkbox = document.getElementById('showPassword');
	let passwordField = document.getElementById('password');

	if (checkbox.checked) {
		passwordField.setAttribute('type', 'text');
	} else {
		passwordField.setAttribute('type', 'password');
	}
});
