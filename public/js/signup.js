const InputValidation = (element, color) => {
	const e = document.querySelector('#' + element);
	AnimateBorder(e, color);
};

const AnimateBorder = (element, color) => {
	element.style.border = `2px solid ${color}`;
};

const ErrorMessage = (elementName, message) => {
	try {
		let element = document.querySelector(`#${elementName}Error`);
		element.innerHTML = message;
	} catch (error) {
		document
			.querySelector(`#${elementName}`)
			.insertAdjacentHTML('afterend', `<p style="color: red; margin-bottom: 0px; font-size: 13pt;" id="${elementName}Error"><i class="fa-solid fa-circle-exclamation"></i> ${message}</p>`);
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

function continueClick() {
	anime({
		targets: '#signup1',
		opacity: 0,
		easing: 'easeInOutExpo',
		duration: 1000
	});
	setTimeout(function () {
		document.getElementById('signup1').style.display = 'none';
		document.getElementById('signup2').style.display = 'flex';
	}, 1000);
}

async function checkoutClick() {
	let buttons = document.querySelectorAll('.subscriptionDesc');
	let index;
	for (var i = 0; i < buttons.length; i++) {
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
					startCheckout(id, tier);
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
			} else {
				InputValidation('usernameInput', 'red');
				ErrorMessage('usernameInput', 'Please choose a unique username!');
			}
		});
}

function emailCheck() {
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
			console.log(data);
			if (data.status) {
				InputValidation('email', 'green');
				RemoveError('email');
			} else {
				InputValidation('email', 'red');
				ErrorMessage('email', 'Please choose a unique email!');
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
});
