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
				let firstName = document.querySelector('#firstName').value;
				let lastName = document.querySelector('#lastName').value;
				let phoneNumber = document.querySelector('#phoneNumber').value;
				let address = document.querySelector('#address').value;
				let city = document.querySelector('#city').value;
				let zip = document.querySelector('#zip').value;
				let state = document.querySelector('#state').value;
				const user = new FormData();
				user.append('username', username);
				user.append('email', email);
				user.append('password', password);
				user.append('returningUser', true);
				user.append('firstName', firstName);
				user.append('lastName', lastName);
				user.append('phoneNumber', phoneNumber);
				user.append('address', address);
				user.append('city', city);
				user.append('zip', zip);
				user.append('state', state);
				signupAndReturnUserID(user).then((id) => {
					console.log('Account created: ' + id);
					location.replace('/login');
				});
			} else {
				document.querySelector('#signup3').style.display = 'flex';
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

const validateFirstName = (firstName) => {
	if (firstName == '') {
		InputValidation('firstName', 'red');
		ErrorMessage('firstName', 'First name cannot be left empty!', 'red');
		return false;
	}
	return true;
};

const validateLastName = (lastName) => {
	if (lastName == '') {
		InputValidation('lastName', 'red');
		ErrorMessage('lastName', 'Last name cannot be left empty!', 'red');
		return false;
	}
	return true;
};

const validatePhoneNumber = (phoneNumber) => {
	if (phoneNumber == '') {
		InputValidation('phoneNumber', 'red');
		ErrorMessage('phoneNumber', 'Phone number cannot be left empty!', 'red');
		return false;
	}
	return true;
};

const validateAddress = (address) => {
	if (address == '') {
		InputValidation('address', 'red');
		ErrorMessage('address', 'Home address cannot be left empty!', 'red');
		return false;
	}
	return true;
};

const validatePassword = () => {
	let password = document.querySelector('#password').value;
	let error = 'Password must be at least 8 characters long, have a number, and a special character';
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

async function continueClick() {
	let username = document.querySelector('#usernameInput').value;
	let email = document.querySelector('#email').value;
	if (validateUsername(username) && validateEmail(email)) {
		await usernameCheck().then(async (res) => {
			if (res)
				await emailCheck().then((res2) => {
					if (res2) {
						anime({
							targets: '#signup1',
							opacity: 0,
							easing: 'easeInOutExpo',
							duration: 1000
						});
						setTimeout(function () {
							document.getElementById('signup1').style.display = 'none';
							document.querySelector('#signup2').style.display = 'flex';
						}, 1000);
					}
				});
		});
	}
}

async function continueAgainClick() {
	let firstName = document.querySelector('#firstName').value;
	let lastName = document.querySelector('#lastName').value;
	let phoneNumber = document.querySelector('#phoneNumber').value;
	let address = document.querySelector('#address').value;
	if (validateFirstName(firstName) && validateLastName(lastName) && validatePhoneNumber(phoneNumber) && validateAddress(address)) {
		createReturningUserAccount();
		anime({
			targets: '#signup2',
			opacity: 0,
			easing: 'easeInOutExpo',
			duration: 1000
		});
		setTimeout(function () {
			document.getElementById('signup2').style.display = 'none';
		}, 1000);
	}
}

async function checkoutClick() {
	let buttons = document.querySelectorAll('.subscriptionDesc');
	let index;
	for (let i = 0; i < buttons.length; i++) {
		if (buttons[i].getAttribute('data-selected') === 'true') index = i;
	}
	let firstName = document.querySelector('#firstName').value;
	let lastName = document.querySelector('#lastName').value;
	let phoneNumber = document.querySelector('#phoneNumber').value;
	let address = document.querySelector('#address').value;
	let username = document.querySelector('#usernameInput').value;
	let email = document.querySelector('#email').value;
	let password = document.querySelector('#password').value;
	let city = document.querySelector('#city').value;
	let zip = document.querySelector('#zip').value;
	let state = document.querySelector('#state').value;
	const user = new FormData();
	user.append('tier', index);
	user.append('username', username);
	user.append('email', email);
	user.append('password', password);
	user.append('returningUser', false);
	user.append('firstName', firstName);
	user.append('lastName', lastName);
	user.append('phoneNumber', phoneNumber);
	user.append('address', address);
	user.append('city', city);
	user.append('zip', zip);
	user.append('state', state);
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
	let button = document.querySelector('#checkoutBtn');
	button.onclick = null;
	button.innerHTML = 'Processing...';
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
				RemoveError('checkoutBtn');
				InputValidation('checkoutBtn', 'green');
				window.location = data.url;
			} else {
				button.innerHTML = 'Check out';
				console.log('Error while creating Stripe checkout session.');
				RemoveError('checkoutBtn');
				ErrorMessage('checkoutBtn', 'Cannot create your account. Make sure you have a valid email address.', 'red');
				InputValidation('checkoutBtn', 'red');
			}
		});
}

async function usernameCheck() {
	let username = document.querySelector('#usernameInput').value;
	validateUsername(username);
	const data = new FormData();
	data.append('username', username);
	return new Promise((resolve, reject) => {
		setTimeout(() => {
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
					resolve(data.status);
				});
		}, 100);
	}).catch((error) => {
		reject(error);
	});
}

async function emailCheck() {
	let email = document.querySelector('#email').value;
	validateEmail(email);
	const data = new FormData();
	data.append('email', email);
	return new Promise((resolve, reject) => {
		setTimeout(() => {
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
						RemoveError('email');
						ErrorMessage('email', 'This email is linked to your previous Save the Cowboy account.', 'blue');
					} else {
						InputValidation('email', 'red');
						RemoveError('email');
						ErrorMessage('email', 'Please choose a unique email!', 'red');
					}
					resolve(data.status);
				});
		}, 100);
	}).catch((error) => {
		reject(error);
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
	document.querySelector('#continueAgain').addEventListener('click', continueAgainClick);
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

document.addEventListener('DOMContentLoaded', function () {
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
