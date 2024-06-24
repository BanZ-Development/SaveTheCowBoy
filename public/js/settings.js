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
});
