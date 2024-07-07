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

function changeSubscriptionDisplay() {
	document.querySelector('.subscriptionSlider').style.display = 'flex';
	window.scroll(0, 925);
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
const returnSubscription = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			fetch('api/checkout/get-subscription', {
				method: 'post',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
				.then((res) => res.json())
				.then(async (data) => {
					console.log(data);
					resolve(data.subscription);
				});
		}, 100);
	}).catch((error) => {
		reject(error);
	});
};

const subscriptionTierToIndex = (id) => {
	switch (id) {
		case '5cc9c4dade2a2':
			return 0;
		case '5cc9c50d875e5':
			return 1;
		case '5cc9c54839744':
			return 2;
		case '5cc9c565839f9':
			return 3;
		case '5cc9c5b9deeca':
			return 4;
		case '5cc9c5c85507e':
			return 5;
	}
};

function createChangeSubButtons(index) {
	let subs = document.querySelectorAll('.subscription');
	for (let i = 0; i < subs.length; i++) {
		if (i === index) continue;
		let button = document.createElement('button');
		button.className = 'subBtn';
		button.id = 'changeSubscriptionBtn';
		button.onclick = changeSubscription;
		button.innerHTML = '<i class="fa-solid fa-repeat"></i> Change Subscription';
		subs[i].appendChild(button);
	}
}

function createCancelSubButton(index) {
	let sub = document.querySelectorAll('.subscription')[index];
	sub.style.backgroundColor = '#212121';
	sub.style.color = 'white';
	let button = document.createElement('button');
	button.className = 'subBtn';
	button.id = 'changeSubscriptionBtn';
	button.onclick = cancelSubscriptionConfirm;
	button.innerHTML = '<i class="fa-solid fa-trash"></i> Cancel Subscription';
	sub.appendChild(button);
	let text = document.createElement('p');
	text.innerHTML = 'Current Subscription';
}

async function createSubscriptionPage() {
	const subscription = await returnSubscription();
	const index = subscriptionTierToIndex(subscription.tier);
	createChangeSubButtons(index);
	createCancelSubButton(index);
}
createSubscriptionPage();

let subButtons = document.querySelectorAll('.subBtn');
for (let i = 0; i < subButtons.length; i++) {
	subButtons[i].addEventListener('click', () => {
		changeSubscription(i);
	});
}
