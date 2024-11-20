let allFiles = [];
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#storyInput').addEventListener('click', function () {
		let page = document.querySelector('.createStory');
		page.style = 'height: calc(60vh - 30px); flex-direction: column;';
		anime({
			targets: '.createStory',
			width: ['50%', '94%'],
			height: ['fit-content', 'calc(70vh - 55px)'],
			easing: 'easeInOutQuad',
			duration: 1000
		});
		document.querySelector('.tox').style = 'display: flex; height: 500px; width: 93%; margin-inline: auto;';
		document.querySelector('#createStoryTitle').style = 'display: block; padding: 10px; font-family: "Roboto"; background-color: #fff; width: 90%;';
		document.querySelector('#createStoryDesc').style = 'display: block; padding: 10px; font-family: "Roboto"; background-color: #fff; width: 90%;';
		document.querySelector('#storyInput').style.display = 'none';
		document.querySelector('.submitImage').style.display = 'flex';
	});
	document.querySelector('#postStoryBtn').addEventListener('click', postStory);
});

document.addEventListener('click', function (event) {
	let shrinkableDiv = document.querySelector('.createStory');
	let parent = document.querySelector('.cowboyStoryExplore');
	if (!shrinkableDiv.contains(event.target)) {
		const currentWidth = parseFloat(window.getComputedStyle(shrinkableDiv).getPropertyValue('width'));
		const parentWidth = parseFloat(window.getComputedStyle(parent).getPropertyValue('width'));
		const windowWidth = window.innerWidth;
		console.log(currentWidth / windowWidth);
		console.log(currentWidth / parentWidth);
		if (currentWidth / windowWidth != 0.9 && window.innerWidth <= 856) {
			anime({
				targets: '.createStory',
				width: ['94%', '90%'],
				height: ['calc(70vh - 55px)', '7vh'],
				easing: 'easeInOutQuad',
				duration: 1000
			});
			shrinkableDiv.style.flexDirection = 'row';
		} else if (currentWidth / parentWidth != 0.5 && window.innerWidth > 856) {
			anime({
				targets: '.createStory',
				width: ['94%', '50%'],
				height: ['calc(70vh - 55px)', '7vh'],
				easing: 'easeInOutQuad',
				duration: 1000
			});
			shrinkableDiv.style.flexDirection = 'row';
		}
		document.querySelector('.tox').style.display = 'none';
		document.querySelector('#createStoryTitle').style.display = 'none';
		document.querySelector('#createStoryDesc').style.display = 'none';
		document.querySelector('#storyInput').style = 'margin-inline: none; width: 100%; margin-block: 1px; border: none; padding-inline: 2px;';
		document.querySelector('.submitImage').style.display = 'none';
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

function checkTitleAndMessage(title, message, description) {
	console.log(title, message);
	let failed = false;
	if (title == '') {
		InputValidation('createStoryTitle', 'red');
		failed = true;
	}
	if (message == '') {
		InputValidation('message_ifr', 'red');
		failed = true;
	}
	if (description == '') {
		InputValidation('createStoryDesc', 'red');
		failed = true;
	}
	return failed;
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('dropArea').addEventListener('dragover', function (e) {
		e.preventDefault();
	});

	document.getElementById('dropArea').addEventListener('drop', uploadImage);

	document.getElementById('addImage').addEventListener('change', uploadImage);
});

function setAspectRatio(img) {
	img.onload = function () {
		let defaultHeight = parseFloat(img.style.height.replace('px', ''));
		let height = img.naturalHeight;
		let width = img.naturalWidth;
		let aspectRatio = (width / height).toFixed(2);
		img.style.width = aspectRatio * defaultHeight + 'px';
	};
}

document.querySelector('#removeImageBtn').addEventListener('click', function () {
	document.getElementById('imageUploadPreview').setAttribute('src', '');
	document.querySelector('.submitImageText').style.display = 'flex';
	document.querySelector('.imageUploadPreviewDiv').style.display = 'none';
	document.querySelector('#removeImageBtn').style.display = 'none';
});

function uploadImage() {
	console.log('Uploading...');
	const files = Array.from(event.target.files);
	allFiles = allFiles.concat(files);
	console.log(allFiles);
	if (files.length > 0) {
		files.forEach((file) => {
			if (file && file.type.startsWith('image/')) {
				const reader = new FileReader();
				let div = document.createElement('div');
				div.innerHTML = `
					<img id="${file.name}" style="width: 150px; height: 150px; border: 2px solid grey; object-fit: cover;"></img>
					<button>Delete</button> 
				`;
				div.querySelector('button').addEventListener('click', deleteImage);
				let img = div.querySelector('img');
				reader.onload = function (e) {
					img.src = e.target.result;
					setAspectRatio(img);
				};
				reader.readAsDataURL(file);
				document.querySelector('#images').appendChild(div);
			} else {
				alert('Please upload a valid image file.');
			}
		});
	}
}

function deleteImage() {
	let name = event.target.parentElement.querySelector('img').id;
	event.target.parentElement.remove();
	console.log(name);
	allFiles = allFiles.filter((item) => item.name !== name);
	console.log(allFiles);
}

function postStory() {
	let title = document.querySelector('#createStoryTitle').value;
	let description = document.querySelector('#createStoryDesc').value;
	let message = tinymce.get('message').getContent();
	if (checkTitleAndMessage(title, message, description)) return;
	let data = new FormData();
	data.append('title', title);
	data.append('message', message);
	data.append('description', description);
	console.log('All Files Uploaded:', allFiles);
	if (allFiles.length > 0) {
		// Check if there are files selected
		for (let i = 0; i < allFiles.length; i++) {
			data.append('files', allFiles[i]); // Append each file to FormData
		}
		// Now `data` contains all the files, and you can send it via AJAX or Fetch
	}
	fetch('api/cowboy/create-story', {
		method: 'post',
		body: data
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.status) {
				window.location.replace(`/forum?id=${data.id}`);
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
