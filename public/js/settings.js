const subscriptionList = ['5cc9c4dade2a2', '5cc9c50d875e5', '5cc9c54839744', '5cc9c565839f9', '5cc9c5b9deeca', '5cc9c5c85507e'];

const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

const DateText = (date) => {
	const options = { month: 'long' };
	const month = new Intl.DateTimeFormat('en-US', options).format(date);
	const day = date.getDate();
	const year = date.getFullYear();
	return `${month} ${day}, ${year}`;
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

function cancelSubscriptionConfirm() {
	let button = document.querySelector('#confirmPopupBtn');
	button.innerHTML = 'Processing...';
	button.onclick = null;
	fetch('api/checkout/cancel-subscription', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then(async (data) => {
			console.log(data);
			if (data.status) {
				button.onclick = cancelSubscriptionConfirm;
				button.innerHTML = 'Cancelled';
				document.querySelector('#popupBlur').addEventListener('click', () => {
					location.reload();
				});
				InputValidation('confirmPopupBtn', 'green');
				RemoveError('confirmPopupBtn');
				ErrorMessage(
					'confirmPopupBtn',
					`Your subscription has been cancelled.<br>You will still have access to LXR until ${DateText(new Date(data.subscription.current_period_end * 1000))}`,
					'green'
				);
			} else {
				InputValidation('confirmPopupBtn', 'red');
				RemoveError('confirmPopupBtn');
				ErrorMessage('confirmPopupBtn', 'An error occurred while processing your cancellation request. Please try again.', 'red');
				button.onclick = cancelSubscriptionConfirm;
				button.innerHTML = 'Confirm';
			}
		})
		.catch((err) => {});
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#imageUpload').addEventListener('change', uploadPfp);
});

function compressPfp(file) {
	var reader = new FileReader();

	reader.onload = function (e) {
		var img = new Image();
		img.src = e.target.result;

		img.onload = function () {
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			// Set desired width and height (for resizing)
			var maxWidth = 128; // Example: resize to max 400px width
			var maxHeight = 128;
			var width = img.width;
			var height = img.height;
			// Calculate the new width and height, maintaining the aspect ratio
			if (width > height) {
				if (width > maxWidth) {
					height *= maxWidth / width;
					width = maxWidth;
				}
			} else {
				if (height > maxHeight) {
					width *= maxHeight / height;
					height = maxHeight;
				}
			}
			canvas.width = width;
			canvas.height = height;
			// Draw the image on the canvas
			ctx.drawImage(img, 0, 0, width, height);
			// Compress the image and convert to Blob (for uploading)
			return canvas.toBlob(
				function (blob) {
					// Blob is the compressed image data
					// You can now upload the blob to your server or show a preview

					// Example: Preview the compressed image
					console.log(blob);
					const data = new FormData();
					data.append('file', blob);
					fetch('api/profile/upload-pfp', {
						method: 'post',
						body: data
					})
						.then((res) => res.json())
						.then(async (data) => {
							console.log(data);
							location.reload();
						});
				},
				'image/jpeg',
				1
			); // 0.7 is the quality level (0.0 - 1.0)
		};
	};

	reader.readAsDataURL(file);
}

function uploadPfp() {
	const fileInput = document.querySelector('#imageUpload');
	const file = fileInput.files[0];
	try {
		compressPfp(file);
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

const setSubscriptionTiers = () => {
	let subs = document.querySelectorAll('.subscription');
	for (let i = 0; i < subs.length; i++) {
		subs[i].dataset.tier = subscriptionList[i];
	}
};
setSubscriptionTiers();

function createChangeSubButtons(index) {
	let subs = document.querySelectorAll('.subscription');
	for (let i = 0; i < subs.length; i++) {
		if (i === index) continue;
		let button = document.createElement('button');
		button.className = 'subBtn';
		button.id = 'changeSubscriptionBtn';
		button.style = 'position: initial; margin-bottom: 15px;';
		button.onclick = openChangePopup;
		button.innerHTML = '<i class="fa-solid fa-repeat"></i> Change Subscription';
		subs[i].appendChild(button);
	}
}

function createCancelSubButton(index, isCancelled) {
	let sub = document.querySelectorAll('.subscription')[index];
	sub.style.backgroundColor = '#212121';
	sub.style.color = 'white';
	sub.style.border = 'solid 1px #464646';
	let button = document.createElement('button');
	button.style.backgroundColor = '#fff';
	button.style.color = '#44372c';
	button.style = 'position: initial; margin-bottom: 15px;';
	button.className = 'subBtn';
	button.id = 'changeSubscriptionBtn';
	if (!isCancelled) {
		button.onclick = openCancelPopup;
		button.innerHTML = '<i class="fa-solid fa-trash"></i> Cancel Subscription';
	} else {
		button.onclick = openRenewPopup;
		button.innerHTML = '<i class="fa-solid fa-arrow-rotate-right"></i> Renew Subscription';
	}

	sub.appendChild(button);
}

function openCancelPopup() {
	document.querySelector('#popupTitle').innerHTML = 'Are you sure you want to cancel your subscription?';
	document.querySelector('#popupBlur').style.display = 'flex';
	document.querySelector('#popupBox').style.display = 'flex';
	document.querySelector('#confirmPopupBtn').addEventListener('click', cancelSubscriptionConfirm);
}

function openRenewPopup() {
	document.querySelector('#popupTitle').innerHTML = 'Would you like to renew your subscription?';
	document.querySelector('#popupBlur').style.display = 'flex';
	document.querySelector('#popupBox').style.display = 'flex';
	document.querySelector('#confirmPopupBtn').addEventListener('click', renewSubscriptionConfirm);
}

function openChangePopup() {
	let button = event.target;
	let sub = button.closest('.subscription');
	let tier = sub.dataset.tier;
	document.querySelector('#popupTitle').innerHTML = 'Are you sure you want to change your plan?';
	document.querySelector('#popupBlur').style.display = 'flex';
	document.querySelector('#popupBox').style.display = 'flex';
	document.querySelector('#popupBox').dataset.tier = tier;
	document.querySelector('#confirmPopupBtn').addEventListener('click', changeSubscriptionConfirm);
}

function openNewSubPopup() {
	let button = event.target;
	let sub = button.closest('.subscription');
	let tier = sub.dataset.tier;
	document.querySelector('#popupTitle').innerHTML = 'Are you sure you want to subscribe to this plan?';
	document.querySelector('#popupBlur').style.display = 'flex';
	document.querySelector('#popupBox').style.display = 'flex';
	document.querySelector('#popupBox').dataset.tier = tier;
	document.querySelector('#confirmPopupBtn').addEventListener('click', newSubConfirm);
}

function newSubConfirm() {
	const tier = document.querySelector('#popupBox').dataset.tier;
	const index = subscriptionTierToIndex(tier);
	let data = new FormData();
	data.append('tier', index);
	let button = document.querySelector('#confirmPopupBtn');
	button.innerHTML = 'Processing...';
	button.onclick = null;
	fetch('api/checkout/create-checkout-session', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then(async (data) => {
			console.log(data);
			if (data.status) {
				RemoveError('confirmPopupBtn');
				InputValidation('confirmPopupBtn', 'green');
				window.location = data.url;
			} else {
				console.log('Error while creating Stripe checkout session.');
				InputValidation('confirmPopupBtn', 'red');
				RemoveError('confirmPopupBtn');
				ErrorMessage('confirmPopupBtn', 'Error while creating your checkout session. Please try again.', 'red');
				button.innerHTML = 'Confirm';
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

function changeSubscriptionConfirm() {
	const priceID = document.querySelector('#popupBox').dataset.tier;
	let data = new FormData();
	data.append('priceID', priceID);
	let button = document.querySelector('#confirmPopupBtn');
	button.innerHTML = 'Processing...';
	button.onclick = null;
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
			if (data.status) {
				button.innerHTML = 'Changed';
				document.querySelector('#popupBlur').addEventListener('click', () => {
					location.reload();
				});
				InputValidation('confirmPopupBtn', 'green');
				RemoveError('confirmPopupBtn');
				ErrorMessage('confirmPopupBtn', `Your subscription has been changed.<br>You will still be charged on ${DateText(new Date(data.subscription.current_period_end * 1000))}`, 'green');
			} else {
				InputValidation('confirmPopupBtn', 'red');
				RemoveError('confirmPopupBtn');
				ErrorMessage('confirmPopupBtn', 'An error occurred while processing your subscription change request. Please try again.', 'red');
				button.innerHTML = 'Confirm';
			}
			button.onclick = changeSubscriptionConfirm;
		})
		.catch((err) => {});
}

function renewSubscriptionConfirm() {
	let button = document.querySelector('#confirmPopupBtn');
	button.innerHTML = 'Processing...';
	button.onclick = null;
	fetch('api/checkout/renew-subscription', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then(async (data) => {
			console.log(data);
			if (data.status) {
				button.onclick = renewSubscriptionConfirm;
				button.innerHTML = 'Renewed';
				document.querySelector('#popupBlur').addEventListener('click', () => {
					location.reload();
				});
				InputValidation('confirmPopupBtn', 'green');
				RemoveError('confirmPopupBtn');
				ErrorMessage('confirmPopupBtn', `Your subscription has been renewed.<br>You will still be charged on ${DateText(new Date(data.subscription.current_period_end * 1000))}`, 'green');
			} else {
				InputValidation('confirmPopupBtn', 'red');
				RemoveError('confirmPopupBtn');
				ErrorMessage('confirmPopupBtn', 'An error occurred while processing your cancellation request. Please try again.', 'red');
				button.onclick = renewSubscriptionConfirm;
				button.innerHTML = 'Confirm';
			}
		})
		.catch((err) => {});
}

document.querySelector('#popupBlur').addEventListener('click', () => {
	document.querySelector('#popupBlur').style.display = 'none';
	document.querySelector('#popupBox').style.display = 'none';
});

function createNewSubButtons() {
	let subs = document.querySelectorAll('.subscription');
	for (let i = 0; i < subs.length; i++) {
		let button = document.createElement('button');
		button.className = 'subBtn';
		button.id = 'changeSubscriptionBtn';
		button.onclick = openNewSubPopup;
		button.innerHTML = '<i class="fa-solid fa-credit-card"></i> Subscribe';
		subs[i].appendChild(button);
	}
}

function createNewSubscriberPage() {
	console.log('new subscriber');
	createNewSubButtons();
}

async function createSubscriptionPage() {
	const subscription = await returnSubscription();
	if (!subscription) {
		createNewSubscriberPage();
		return;
	}
	const tier = subscription.plan.id;
	const index = subscriptionTierToIndex(tier);
	const isCancelled = subscription.cancel_at_period_end;
	createChangeSubButtons(index);
	createCancelSubButton(index, isCancelled);
}
createSubscriptionPage();

let subButtons = document.querySelectorAll('.subBtn');
for (let i = 0; i < subButtons.length; i++) {
	subButtons[i].addEventListener('click', () => {
		changeSubscription(i);
	});
}

function loadUserMeta() {
	fetch('api/profile/load', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.status) {
				let { username, bio } = data.profile;
				document.querySelector('#settingUsername').placeholder = username;
			}
		});
}

function loadMenu() {
	let menuID = event.target.id;
	if (!menuID) menuID = event.target.parentElement.id;
	let menus = document.querySelectorAll('.settingSection');
	menus.forEach((m) => {
		m.style.display = 'none';
	});
	load(menuID);
}

function load(menuID) {
	let menu = document.querySelector('#' + menuID + 'Menu');
	menu.style.display = 'flex';
	switch (menuID) {
		case 'account':
			loadUserMeta();
			break;
	}
}

document.querySelectorAll('.settingSidebarBtn').forEach((btn) => {
	btn.addEventListener('click', loadMenu);
});

load('account');
