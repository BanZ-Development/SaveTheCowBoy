function getStripeSession() {
	const urlParams = new URLSearchParams(window.location.search);
	const uid = urlParams.get('uid');
	const data = new FormData();
	data.append('uid', uid);
	fetch('api/checkout/stripe-session', {
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
				window.location.replace('/login');
			} else {
				console.log('Payment failed.');
			}
		});
}

getStripeSession();
