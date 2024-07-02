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

async function signupAndReturnUserID(user) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			fetch('api/auth/signup', {
				method: 'post',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams(user)
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data.id);
				});
		}, 700);
	}).catch((error) => {
		reject(error);
	});
}

const createReturningUserAccount = () => {
	document.querySelector('#signup2').style.display = 'none';
	let email = document.querySelector('#email').value;
	const data = new FormData();
	data.append('email', email);
	fetch('api/auth/check-unique-email', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.status && data.returningUser) {
				let username = document.querySelector('#usernameInput').value;
				let email = document.querySelector('#email').value;
				let password = document.querySelector('#password').value;
				const user = new FormData();
				user.append('username', username);
				user.append('email', email);
				user.append('password', password);
				user.append('returningUser', true);
				signupAndReturnUserID(user).then((id) => {
					console.log('Account created: ' + id);
					location.replace('/login');
				});
			} else {
				document.querySelector('#signup2').style.display = 'flex';
			}
		});
};

const validateUsername = (username) => {
	if (username == '') {
		InputValidation('usernameInput', 'red');
		ErrorMessage('usernameInput', 'Username cannot be left empty!', 'red');
		return false;
	} else if (username.length < 3) {
		InputValidation('usernameInput', 'red');
		ErrorMessage('usernameInput', 'Username cannot be less than 3 characters!', 'red');
		return false;
	} else if (username.length > 20) {
		InputValidation('usernameInput', 'red');
		ErrorMessage('usernameInput', 'Username cannot be more than 20 characters!', 'red');
		return false;
	}
	return true;
};

const validateEmail = (email) => {
	if (email == '') {
		InputValidation('email', 'red');
		ErrorMessage('email', 'Email cannot be left empty!', 'red');
		return false;
	} else if (email.length < 4 || !email.includes('@')) {
		InputValidation('email', 'red');
		ErrorMessage('email', 'Please choose a valid email!', 'red');
		return false;
	}
	return true;
};

const validatePassword = () => {
	let password = document.querySelector('#password').value;
	let error = 'Password must be at least 8 characters long, have a number, and a special character';
	let special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
	console.log(/\d/.test(password));
	console.log(special.test(password));
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

function continueClick() {
	let username = document.querySelector('#usernameInput').value;
	let email = document.querySelector('#email').value;
	if (validateUsername(username) && validateEmail(email) && validatePassword()) {
		createReturningUserAccount();
		anime({
			targets: '#signup1',
			opacity: 0,
			easing: 'easeInOutExpo',
			duration: 1000
		});
		setTimeout(function () {
			document.getElementById('signup1').style.display = 'none';
		}, 1000);
	}
}

async function checkoutClick() {
	let buttons = document.querySelectorAll('.subscriptionDesc');
	let index;
	for (let i = 0; i < buttons.length; i++) {
		if (buttons[i].getAttribute('data-selected') === 'true') index = i;
	}

	let username = document.querySelector('#usernameInput').value;
	let email = document.querySelector('#email').value;
	let password = document.querySelector('#password').value;
	const user = new FormData();
	user.append('tier', index);
	user.append('username', username);
	user.append('email', email);
	user.append('password', password);
	user.append('returningUser', false);

	fetch('api/checkout/start', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(user)
	})
		.then((res) => res.json())
		.then(async (data) => {
			if (data.status) {
				signupAndReturnUserID(user).then((id) => {
					console.log('ID: ' + id);
					startCheckout(id, index);
				});
			} else {
				console.log(data.message);
			}
		});
}

function startCheckout(id, tier) {
	const data = new FormData();
	data.append('uid', id);
	data.append('tier', tier);
	fetch('api/checkout/create-checkout-session', {
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
				window.location = data.url;
			} else {
				console.log('Error while creating Stripe checkout session.');
			}
		});
}

function usernameCheck() {
	let username = document.querySelector('#usernameInput').value;
	validateUsername(username);
	const data = new FormData();
	data.append('username', username);
	fetch('api/auth/check-unique-username', {
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
				InputValidation('usernameInput', 'green');
				RemoveError('usernameInput');
				validateUsername(username);
			} else {
				InputValidation('usernameInput', 'red');
				ErrorMessage('usernameInput', 'Please choose a unique username!', 'red');
			}
		});
}

function emailCheck() {
	let email = document.querySelector('#email').value;
	validateEmail(email);
	const data = new FormData();
	data.append('email', email);
	fetch('api/auth/check-unique-email', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.status && !data.returningUser) {
				InputValidation('email', 'green');
				RemoveError('email');
				validateEmail(email);
			} else if (data.status && data.returningUser) {
				InputValidation('email', 'blue');
				ErrorMessage('email', 'This email is linked to your previous Save the Cowboy account.', 'blue');
			} else {
				InputValidation('email', 'red');
				ErrorMessage('email', 'Please choose a unique email!', 'red');
			}
		});
}
let timeoutId;
let delay = 500;
const debounce = (func, delay) => {
	clearTimeout(timeoutId);
	timeoutId = setTimeout(func, delay);
};

document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#continueBtn').addEventListener('click', continueClick);
	document.querySelector('#checkoutBtn').addEventListener('click', checkoutClick);
	document.querySelector('#usernameInput').addEventListener('input', () => {
		debounce(usernameCheck, delay);
	});
	document.querySelector('#email').addEventListener('input', () => {
		debounce(emailCheck, delay);
	});
	document.querySelector('#password').addEventListener('input', () => {
		debounce(validatePassword, delay);
	});
});
