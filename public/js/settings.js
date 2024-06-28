const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

const setCookie = async (name, value, days) => {
	const d = new Date();
	d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
	let expires = 'expires=' + d.toUTCString();
	document.cookie = name + '=' + value + ';' + expires + '; path=/; Secure; SameSite=None';
};

const getCookie = (cname) => {
	let name = cname + '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
};

function cancelSubscriptionConfirm() {
	fetch('api/checkout/cancel-subscription', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then(async (data) => {
			console.log(data);
		});
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#cancelSubscriptionBtn').addEventListener('click', cancelSubscriptionConfirm);
	document.querySelector('#imageUpload').addEventListener('change', uploadPfp);
});

function uploadPfp() {
	const fileInput = document.querySelector('#imageUpload');
	const file = fileInput.files[0];
	console.log(file);

	try {
		const data = new FormData();
		data.append('file', file);
		fetch('api/profile/upload-pfp', {
			method: 'post',
			body: data
		})
			.then((res) => res.json())
			.then(async (data) => {
				console.log(data);
				if (data.status) setCookie('pfp', data.filename, 14);
				location.reload();
			});
	} catch (error) {
		console.log('Error uploading image:', error);
	}
}

document.querySelector('#changeSubscriptionBtn').addEventListener('click', changeSubscription);

function changeSubscription() {
	document.querySelector('.subscriptionSlider').style.display = 'flex';
}

function checkForPfpCookie() {
	let pfp = getCookie('pfp');
	console.log(pfp);
	if (pfp == '') {
		fetch('api/profile/getPfp', {
			method: 'get',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
			.then((res) => res.json())
			.then(async (data) => {
				if (data.status) {
					setCookie('pfp', data.pfp, 14);
					pfp = getCookie('pfp');
					document.querySelector('#imagePreview').src = `/image/${pfp}`;
				} else {
					document.querySelector('#imagePreview').src = '../images/default-pfp.jpeg';
				}
			})
			.catch((err) => {
				console.log(err);
			});
	} else document.querySelector('#imagePreview').src = `/image/${pfp}`;
}
checkForPfpCookie();
