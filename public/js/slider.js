document.addEventListener('DOMContentLoaded', function () {
	var f = function () {
		let links = ['https://pushpay.com/g/savethecowboy?src=hpp'];
		let titles = ['Long X Ranch Cowboys'];
		let desc = [
			'Save the Cowboy, a 501(c)(3) non-profit, Christian, working-ranch introduces our subscription and community service, <b>Long X Ranch Cowboys</b>. Connect with other ranchers, learn and spread the gospel, and help support our local ranchers.'
		];
		let repo = ['signup']; // donate link

		let slide = document.querySelectorAll('.slide');
		let curr = -1; // initialize curr to -1

		// Find the currently displayed slide
		for (let i = 0; i < slide.length; i++) {
			if (slide[i].style.display === 'block') {
				curr = i;
				slide[i].style.display = 'none';
				break; // Exit the loop once the current slide is found
			}
		}

		if (curr === 3) {
			curr = -1;
		}

		anime({
			targets: '.slide',
			opacity: [1, 0],
			duration: 500,
			easing: 'linear'
		});

		if (slide[curr + 1]) {
			slide[curr + 1].style.display = 'block';
		} else if (slide.length > 0) {
			slide[0].style.display = 'block';
		}

		document.getElementById('link').setAttribute('href', links[0]);
		document.getElementById('title').innerHTML = titles[0];
		document.getElementById('desc').innerHTML = desc[0];
		document.getElementById('repo').setAttribute('href', repo[0]);

		anime({
			targets: '.slide',
			opacity: [0, 1],
			duration: 500,
			easing: 'linear'
		});

		document.querySelector('.progressIn').style.width = '0%';
		anime({
			targets: '.progressIn',
			duration: 15000,
			width: ['0%', '100%'],
			easing: 'linear'
		});
	};

	window.setInterval(f, 15000);
	f();
});

// Subscription Slider

function slideRight() {
	let container = document.querySelector('.subscriptions');
	container.scrollLeft += 1400;
	let maxScrollLeft = container.scrollWidth - container.clientWidth;
	if (container.scrollLeft >= maxScrollLeft) {
		container.scrollLeft = 0;
	}
}

function slideLeft() {
	let container = document.querySelector('.subscriptions');
	container.scrollLeft -= 1400;
	if (container.scrollLeft <= 0) {
		container.scrollLeft = container.scrollWidth - container.clientWidth;
	}
}

document.querySelector('#slideLeft').addEventListener('click', slideLeft);
document.querySelector('#slideRight').addEventListener('click', slideRight);
