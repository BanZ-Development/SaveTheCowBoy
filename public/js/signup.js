function signupClick() {
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

function startCheckout() {
	let buttons = document.querySelectorAll('.subscriptionDesc');
	let index;
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i].getAttribute('data-selected') === 'true') index = i;
	}
	let username = document.querySelector('#username').value;
	let email = document.querySelector('#email').value;
	let password = document.querySelector('#password').value;
	const data = new FormData();
	data.append('index', index);
	data.append('username', username);
	data.append('email', email);
	data.append('password', password);
	fetch('api/checkout/start', {
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
				console.log('continue');
			}
		});
}

console.log('hello');
document.querySelector('#checkoutBtn').addEventListener('click', startCheckout);
document.querySelector('#continueBtn').addEventListener('click', continueClick);
