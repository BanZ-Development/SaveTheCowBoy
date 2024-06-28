const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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

async function uploadPfp() {
	const fileInput = document.querySelector('#imageUpload');
	const file = fileInput.files[0];
	console.log(file);

	if (file) {
		const reader = new FileReader();
		reader.readAsArrayBuffer(file);

		reader.onload = async (event) => {
			const arrayBuffer = event.target.result;
			const buffer = new Uint8Array(arrayBuffer);

			const payload = {
				fileName: file.name,
				fileData: Array.from(buffer),
				contentType: file.type
			};
			const data = new FormData();
			const fileInput = Array.from(buffer);
			const fileName = file.name;
			const contentType = file.type;

			data.append('fileInput', fileInput);
			data.append('fileName', fileName);
			data.append('contentType', contentType);
			try {
				await fetch('api/profile/upload-pfp', {
					method: 'post',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: new URLSearchParams(data)
				})
					.then((res) => res.json())
					.then(async (data) => {
						console.log(data);
					});
			} catch (error) {
				console.log('Error uploading image:', error);
			}
		};
	}
}

document.querySelector('#changeSubscriptionBtn').addEventListener('click', changeSubscription)

function changeSubscription() {
	document.querySelector('.subscriptionSlider').style.display = 'flex'
}
