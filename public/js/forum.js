async function loadPosts() {
	const id = returnID();
	if (!id) {
		fetch('api/forum/loadPosts', {
			method: 'get',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				console.log(data.status);
				if (data.status) {
					data.posts.forEach((post) => {
						createPostElement(post);
					});
				} else {
					console.log('error!');
				}
			})
			.catch((err) => {
				console.log(err);
			});
	} else {
		const data = new FormData();
		data.append('id', id);
		fetch('api/forum/loadPost', {
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
					console.log('success');
					createPostElement(data.post);
				} else {
					console.log('error!');
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
}

function returnID() {
	let urlParams = window.location.search;
	let getQuery = urlParams.split('?')[1];
	if (!getQuery) return null;
	let params = getQuery.split('&');
	let id = params[0].split('=')[1];
	return id;
}

function createPostElement(post) {
	const { _id, title, message, username, postDate, uID } = post;
	let div = document.createElement('div');
	let date = new Date(postDate);
	console.log(postDate);
	div.innerHTML = `
	<span class="line"></span>
	<div class="forumPost" id=${_id}>
	<a class="forumUser" href="/profile?uid=${uID}">${username}</a>
	<div class="forumTitle">
		<h3><a href="/forum?id=${_id}">${title}</a></h3>
		<p>${date.toDateString()}</p>
	</div>
	
	
	<p style="white-space:pre;">${message}</p>
	
	
	</div>
	`;
	document.querySelector('#posts').appendChild(div);
}

function createPost() {
	let title = document.querySelector('#title').value;
	let message = document.querySelector('#message').value;

	const data = new FormData();
	data.append('title', title);
	data.append('message', message);

	fetch('api/forum/post', {
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
				console.log('success');
				window.location.replace(`/forum?id=${data.id}`);
			} else {
				console.log('error!');
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

loadPosts();
document.querySelector('#postButton').addEventListener('click', createPost);

document.querySelector('#showPopup').addEventListener('click', popupPost);

document.querySelector('#makePost').addEventListener('click', closePost);

function popupPost() {
	document.getElementById('makePost').style = 'display: flex !important;';
	document.getElementById('postInformation').style = 'display: flex !important;';
}

function closePost() {
	document.getElementById('makePost').style = 'display: none !important;';
	document.getElementById('postInformation').style = 'display: none !important;';
}
