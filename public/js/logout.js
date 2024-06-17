function logout() {
	fetch('api/auth/logout', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.status) {
				window.location.replace('/');
			} else {
				console.log('error!');
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

logout();
