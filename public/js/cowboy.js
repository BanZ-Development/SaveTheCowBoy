document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#storyInput').addEventListener('click', function () {
            let page = document.querySelector('.createStory');
            page.style = 'height: calc(60vh - 30px); flex-direction: column; width: 95%;';
            document.querySelector('#createStoryTitle').style = 'display: block; padding: 10px; font-family: "Roboto"; background-color: #fff;';
            document.querySelector('#createStoryDesc').style = 'display: block; padding: 10px; font-family: "Roboto"; background-color: #fff;';
            document.querySelector('#storyInput').style = 'margin-inline: auto; width: 70%; margin-top: 10px; border: solid 1px #ccc; padding: 10px;';
    });
});

document.addEventListener('click', function (event) {
	let shrinkableDiv = document.querySelector('.createStory');
	if (!shrinkableDiv.contains(event.target)) {
		if (window.innerWidth <= 856) {
			shrinkableDiv.style = 'flex-direction: row; width: 90%;'
		} else {
			shrinkableDiv.style = 'flex-direction: row; width: 50%;';
		}
		document.querySelector('#createStoryTitle').style = 'display: none;';
		document.querySelector('#createStoryDesc').style = 'display: none;';
		document.querySelector('#storyInput').style = 'margin-inline: none; width: calc(100% - 125px); margin-block: 1px; border: none; padding-inline: 2px;';
	}
});

loadStories();


const InputValidation = (element, color) => {
	const e = document.querySelector('#' + element);
	console.log(e);
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

function checkTitleAndMessage(title, message) {
	console.log(title, message);
	let failed = false;
	if (title == '') {
		InputValidation('createStoryTitle', 'red');
		failed = true;
	}
	if (message == '') {
		InputValidation('storyInput', 'red');
		failed = true;
	}
	return failed;
}

function postStory() {
	let title = document.querySelector('#createStoryTitle').value;
	let message = document.querySelector('#storyInput').value;
	//let message = tinymce.get('message').getContent();
	if (checkTitleAndMessage(title, message)) return;
	let data = new FormData();
	data.append('title', title);
	data.append('message', message);
	fetch('api/cowboy/create-story', {
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
				hideCreateStoryMenu();
				window.location.replace(`/forum?id=${data.cowboyStory._id}`);
			}
		});
}

function loadStories() {
	fetch('api/cowboy/get-stories', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
		});
}
