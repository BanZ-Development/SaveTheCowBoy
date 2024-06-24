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
				if (data.status) {
					console.log(data);
					data.posts.forEach((post) => {
						createPostElement(post, data.currentUserID);
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

function likePost() {
	let element = event.target;
	if (element.nodeName != 'I') element = element.querySelector('i');
	const root = element.closest('#post');
	const title = root.querySelector('#title');
	const postID = title.href.split('?id=')[1];
	const counter = root.querySelector('#likeCounter');
	const data = new FormData();
	data.append('postID', postID);
	console.log(element.outerHTML);
	try {
		if (element.outerHTML == '<i class="fa-regular fa-heart"></i>') {
			//liking
			element.outerHTML = '<i class="fa-solid fa-heart"></i>';
			counter.innerHTML++;
		} else {
			//unliking
			element.outerHTML = '<i class="fa-regular fa-heart"></i>';
			counter.innerHTML--;
		}
	} catch (error) {
		console.log(error);
	}
	fetch('api/forum/likePost', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.type == 'like') {
				element.outerHTML = '<i class="fa-solid fa-heart"></i>';
			} else if (data.type == 'unlike') {
				element.outerHTML = '<i class="fa-regular fa-heart"></i>';
			}
			counter.innerHTML = data.likes;
		})
		.catch((err) => {
			console.log(err);
		});
}

function createPostElement(post, currentUserID) {
	const { _id, title, message, username, postDate, uID, likes } = post;
	let div = document.createElement('div');
	let date = new Date(postDate);
	div.innerHTML = `<div id="post">
		<span class="line"></span>
		<div class="forumPost" id=${_id}>
		<a class="forumUser" href="/profile?uid=${uID}">${username}</a>
		<div class="forumTitle">
			<h3><a id="title" href="/forum?id=${_id}">${title}</a></h3>
			<p>${date.toDateString()}</p>
		</div>
		
		
		<p style="white-space:pre;">${message}</p>
		<div class="forumBtns">
			<p id="likeCounter">${likes.length}</p>
			<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
			<button class="iconBtn"><i class="fa-regular fa-flag"></i></button>
		</div>
		</div>
		</div>
		`;
	let isLiked = likes.includes(currentUserID);
	console.log(isLiked);
	if (isLiked) {
		div.querySelector('#likeBtn').querySelector('i').outerHTML = '<i class="fa-solid fa-heart"></i>';
	}

	document.querySelector('#posts').appendChild(div);
	document.querySelectorAll('#likeBtn').forEach((btn) => {
		btn.addEventListener('click', likePost);
	});
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
