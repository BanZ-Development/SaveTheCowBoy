const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

function loadProfile() {
	const uid = returnID();
	console.log(uid);

	const data = new FormData();
	data.append('uid', uid);
	fetch('api/profile/load', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			createProfile(data.profile);
		});
}

function returnID() {
	let urlParams = window.location.search;
	let getQuery = urlParams.split('?')[1];
	if (!getQuery) return null;
	let params = getQuery.split('&');
	let id = params[0].split('=')[1];
	return id;
}

function createPostElement(post, currentUserID) {
	const { _id, title, message, username, postDate, uID, likes, comments } = post;
	let div = document.createElement('div');
	let date = new Date(postDate);
	div.innerHTML = `<div id="post">
		<span class="line"></span>
		<div class="forumPost" id=${_id}>
		<a class="forumUser" href="/profile?uid=${uID}">${SafeHTML(username)}</a>
		<div class="forumTitle">
			<h3><a id="title" href="/forum?id=${_id}">${SafeHTML(title)}</a></h3>
			<p>${date.toDateString()}</p>
		</div>
		<p style="white-space:pre;">${message}</p>
		<div class="forumBtns">
			<p id="likeCounter">${likes.length}</p>
			<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
			<p id="commentCounter">${comments.length}</p>
			<button id="commentIcon" class="iconBtn"><i class="fa-regular fa-comment"></i></button>
			<button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
		</div>
		</div>
		</div>
		`;
	let isLiked = likes.includes(currentUserID);
	if (isLiked) {
		div.querySelector('#likeBtn').querySelector('i').outerHTML = '<i class="fa-solid fa-heart"></i>';
	}

	div.querySelector('#commentIcon').addEventListener('click', openPostComments);
	div.querySelector('#likeBtn').addEventListener('click', likePost);
	div.querySelector('#reportBtn').addEventListener('click', forumReport);
	document.querySelector('#posts').appendChild(div);
}

function loadPosts(posts) {
	posts.forEach((post) => {
		const data = new FormData();
		data.append('id', post);
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
					createPostElement(data.post, data.currentUserID);
				} else {
					console.log('error!');
				}
			})
			.catch((err) => {
				console.log(err);
			});
	});
}

function createProfile(profile) {
	console.log(profile);
	document.title = `${profile.username} | Long X Ranch Cowboys`;
	let div = document.createElement('div');
	div.innerHTML = `<br><br><br><br><br><br><br><br><br><br><br><br><div id="profile">
		<div style="display: flex; flex-direction: row; color: #fff; margin-bottom: 20px;">
			<img style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; object-position: center;" id="pfp" src="/image/${profile.pfp}">
			<h1 style="line-height: 15px; margin-left: 10px;">${profile.username}</h1>
		</div>
		<span class="line"></span>
		<h2 style="color: #fff;">Posts</h2>
		<div id="posts"></div>
		</div>
		`;
	document.body.appendChild(div);
	loadPosts(profile.posts);
}

function likePost() {
	let element = event.target;
	if (element.nodeName != 'I') element = element.querySelector('i');
	const root = element.closest('#post');
	const button = root.querySelector('#likeBtn');
	const title = root.querySelector('#title');
	const postID = element.closest('.forumPost').id;
	const counter = root.querySelector('#likeCounter');
	const data = new FormData();
	data.append('postID', postID);
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
		button.enabled = false;
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
			button.enabled = true;
		})
		.catch((err) => {
			console.log(err);
			button.enabled = true;
		});
}

function openPostComments() {
	let button = event.target;
	let postID = button.closest('.forumPost').id;
	location.href = `forum?id=${SafeHTML(postID)}#commentSection`;
}

function forumReport() {
	const button = event.target;
	const post = button.closest('.forumPost');
	const postID = post.id;
	const authorName = post.querySelector('.forumUser').innerHTML;
	document.querySelector('#reportTitle').innerHTML = `Report <a href="/forum?id=${postID}">${authorName}'s Post</a>`;
	document.querySelector('#makeReport').style.display = 'flex';
	document.querySelector('#reportInformation').style.display = 'flex';
}

loadProfile();
