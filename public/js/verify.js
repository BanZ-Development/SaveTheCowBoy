function verify() {
	const url = window.location.href;

	// Extract the query string
	const queryString = url.split('?')[1];

	// Parse the query string into an object
	const params = {};
	if (queryString) {
		queryString.split('&').forEach((pair) => {
			const [key, value] = pair.split('=');
			params[decodeURIComponent(key)] = decodeURIComponent(value || '');
		});
	}
	let uid = params.uid;
	let code = params.code;
	const data = new FormData();
	data.append('uid', uid);
	data.append('code', code);
	fetch('api/auth/verify-account', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(params);
			console.log(uid, code);
			if (data.status) {
				window.location.replace('/');
			} else {
				console.log('Verification failed');
				alert(`Verification failed: ${data.message}`);
				window.location.replace('/');
			}
		});
}

verify();
