const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

async function loadPosts() {
	const id = returnID();
	let loadedPosts = 0;
	loadedPosts = document.querySelectorAll('#post').length;
	const data = new FormData();
	data.append('loadedPosts', loadedPosts);
	if (!id) {
		fetch('api/forum/loadPosts', {
			method: 'post',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams(data)
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.status) {
					console.log(data);
					loadCreatePostButton();
					data.posts.forEach((post) => {
						createPostElement(post, data.currentUserID);
					});
				} else {
					console.log(data);
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
					loadSinglePost(data.post, data.currentUserID);
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
	const button = root.querySelector('#likeBtn');
	const title = root.querySelector('#title');
	const postID = title.href.split('?id=')[1];
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
		
		
		<p style="white-space:pre;">${SafeHTML(message)}</p>
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

function loadSinglePost(post, currentUserID) {
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
		
		
		<p style="white-space:pre;">${SafeHTML(message)}</p>
		<div class="forumBtns">
			<p id="likeCounter">${likes.length}</p>
			<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
			<p id="commentCounter">${comments.length}</p>
			<button id="commentIcon" class="iconBtn"><i class="fa-regular fa-comment"></i></button>
			<button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
		</div>
		</div>
		<div id="commentSection" class="commentSection">
			<h2 class="forumTitle">Comments</h2>
			<textarea class="postText" id="comment" placeholder="Add a comment..." type="text"></textarea>
			<button id="commentBtn" class="btnLink">Comment</button>
			<div id="commentsList" class="commentsList">
			</div>
		</div>
		</div>
		</div>
		`;
	let isLiked = likes.includes(currentUserID);
	if (isLiked) {
		div.querySelector('#likeBtn').querySelector('i').outerHTML = '<i class="fa-solid fa-heart"></i>';
	}
	div.querySelector('#reportBtn').addEventListener('click', forumReport);
	div.querySelector('#commentIcon').addEventListener('click', goToCommentSection);
	div.querySelector('#likeBtn').addEventListener('click', likePost);
	div.querySelector('#commentBtn').addEventListener('click', comment);
	document.querySelector('#posts').appendChild(div);
	comments.forEach((comment) => {
		loadComment(comment);
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
				if (data.message == 'Please make sure all the fields are filled in') {
					//red border around
				}
				console.log('error!');
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

function comment() {
	let content = document.querySelector('#comment').value;
	let button = event.target;
	let postID = button.closest('#post').querySelector('.forumPost').id;
	console.log('Post ID: ' + postID);

	const data = new FormData();
	data.append('content', content);
	data.append('postID', postID);

	fetch('api/forum/comment', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			location.reload();
		})
		.catch((err) => {
			console.log(err);
		});
}

function loadComment(comment) {
	const { _id, author, authorID, content, postDate, comments, likes } = comment;
	let date = new Date(postDate);
	console.log(comment);
	let div = document.createElement('div');
	div.innerHTML = `
	<div class="comment" id=${_id}>
		<a class="forumUser" href="/profile?uid=${authorID}">${SafeHTML(author)}</a>
		<p style="white-space:pre;">${SafeHTML(content)}</p>
		<div class="forumBtns">
			<p>${date.toDateString()}</p>
			<p id="likeCounter"> 0</p>
			<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
			<button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
		</div>
	</div>`;
	document.querySelector('#commentsList').appendChild(div);
	if (window.location.hash) {
		const id = window.location.hash.substring(1);
		if (id == 'commentSection') goToCommentSection();
	}
}

function submitReport() {
	let reasons = [];
	const reportCheckboxes = document.querySelectorAll('#reportCheckbox');
	const message = document.querySelector('#reportMessage').value;
	const postID = document.querySelector('#reportTitle').querySelector('a').href.split('=')[1];
	console.log(postID);
	reportCheckboxes.forEach((checkbox) => {
		if (checkbox.checked) reasons.push(checkbox.value);
	});
	const data = new FormData();
	data.append('reasons', reasons);
	data.append('message', message);
	data.append('postID', postID);
	fetch('api/forum/report', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
		})
		.catch((err) => {
			console.log(err);
		});
}

loadPosts();

function loadCreatePostButton() {
	let button = document.createElement('button');
	button.style.cssText = 'margin-left: auto; padding-block: 0px; height: 40px;';
	button.id = 'showPopup';
	button.className = 'btnLink';
	button.innerHTML = '<i style="margin-inline: 5px;" class="fa-regular fa-square-plus"></i> Create Post';
	document.querySelector('#forumHeader').appendChild(button);
	document.querySelector('#postButton').addEventListener('click', createPost);
	document.querySelector('#showPopup').addEventListener('click', popupPost);
	document.querySelector('#makePost').addEventListener('click', closePost);
}

function popupPost() {
	document.getElementById('makePost').style = 'display: flex !important;';
	document.getElementById('postInformation').style = 'display: flex !important;';
}

function closePost() {
	document.getElementById('makePost').style = 'display: none !important;';
	document.getElementById('postInformation').style = 'display: none !important;';
}

function openPostComments() {
	console.log('open comments');
	let button = event.target;
	let postID = button.closest('.forumPost').id;
	location.href = `forum?id=${SafeHTML(postID)}#commentSection`;
}

function goToCommentSection() {
	const element = document.getElementById('commentSection');
	if (element) {
		element.scrollIntoView({ behavior: 'smooth' });
	}
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

document.querySelector('#makeReport').addEventListener('click', closeReport);
document.querySelector('#submitReportButton').addEventListener('click', submitReport);

function closeReport() {
	document.querySelector('#makeReport').style.display = 'none';
	document.querySelector('#reportInformation').style.display = 'none';
}
