const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

const getCookie = (name) => {
	let value = null;
	let cookies = document.cookie.split(';');
	cookies.forEach((cookie) => {
		if (cookie.includes(`${name}=`)) {
			value = cookie.split(`${name}=`)[1];
			return value;
		}
	});
	return value;
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
				location.reload();
			});
	} catch (error) {
		console.log('Error uploading image:', error);
	}
}

document.querySelector('#changeSubscriptionBtn').addEventListener('click', changeSubscriptionDisplay);

function changeSubscriptionDisplay() {
	document.querySelector('.subscriptionSlider').style.display = 'flex';
	window.scroll(0, 925)
}

function checkForPfpCookie() {
	let pfp = getCookie('pfp');
	console.log(pfp);
	if (pfp) document.querySelector('#imagePreview').src = `/image/${pfp}`;
	else document.querySelector('#imagePreview').src = '../images/default-pfp.jpeg';
	fetch('api/profile/getPfp', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then(async (data) => {
			if (data.status) {
				document.querySelector('#imagePreview').src = `/image/${data.pfp}`;
			} else {
				document.querySelector('#imagePreview').src = '../images/default-pfp.jpeg';
			}
		})
		.catch((err) => {
			console.log(err);
		});
}
checkForPfpCookie();

function changeSubscription(tier) {
	try {
		let data = new FormData();
		data.append('tier', tier);
		fetch('api/checkout/change-subscription', {
			method: 'post',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams(data)
		})
			.then((res) => res.json())
			.then(async (data) => {
				console.log(data);
			})
			.catch((err) => {
				console.log(err);
			});
	} catch (error) {}
}

let subButtons = document.querySelectorAll('.subBtn');
for (let i = 0; i < subButtons.length; i++) {
	subButtons[i].addEventListener('click', () => {
		changeSubscription(i);
	});
}
