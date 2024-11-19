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

function deletePostConfirm() {
	let button = event.target;
	let postID = button.closest('.forumPost').id;
	const data = new FormData();
	data.append('postID', postID);

	fetch('api/forum/delete-post', {
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
				window.location.replace(`/forum`);
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
			if (data.status) {
				createProfile(data.profile);
			}
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

function returnPfp(uID, parent) {
	let data = new FormData();
	data.append('userID', uID);
	fetch('api/profile/getPfp', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then(async (data) => {
			if (data.status) {
				parent.querySelector('.forumPfp').src = '/image/' + data.pfp;
			} else {
				parent.querySelector('.forumPfp').src = '../images/default-pfp.jpeg';
			}
		});
}

function createPostElement(post, currentUserID, pfp) {
	const { _id, title, message, username, postDate, uID, likes, likesCount, comments, commentsCount, images } = post;
	let div = document.createElement('div');
	let date = new Date(postDate);
	div.innerHTML = `<div id="post">
		<span class="line"></span>
		<div class="forumPost" href="/forum?id=${_id}" id=${_id}>
		<div class="inlineForumUser">
			<img class="forumPfp" src="../images/default-pfp.jpeg"></img>
			<a class="forumUser" href="/profile?uid=${uID}">${SafeHTML(username)}</a>
			<p id="forumDate" class="forumUser"><i class="fa-solid fa-circle"></i> ${DateText(date)}</p>
		</div>
		<div class="forumTitle">
			<h3><a id="title" href="/forum?id=${_id}">${SafeHTML(title)}</a></h3>
		</div>
		
		
		<p style="white-space:pre;pointer-events:none;">${message}</p>
		<div id="images" style="display: flex; flex-direction: row; justify-content: flex-start;pointer-events:none;"></div>
		<div class="forumBtns">
			<p id="likeCounter">${likesCount}</p>
			<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
			<p id="commentCounter">${commentsCount}</p>
			<button id="commentIcon" class="iconBtn"><i class="fa-regular fa-comment"></i></button>
			<button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
		</div>
		</div>
		</div>
		`;
	returnPfp(uID, div);
	let isLiked = likes.includes(currentUserID);
	if (isLiked) {
		div.querySelector('#likeBtn').querySelector('i').outerHTML = '<i class="fa-solid fa-heart"></i>';
	}
	if (currentUserID == uID) {
		let button = document.createElement('button');
		button.id = 'deleteBtn';
		button.className = 'iconBtn';
		button.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
		button.addEventListener('click', deletePostConfirm);
		div.querySelector('.forumBtns').appendChild(button);
	}
	if (images.length > 0) {
		images.forEach((img) => {
			div.querySelector('#images').appendChild(returnIconDiv(img, 100));
		});
	}
	div.querySelector('#commentIcon').addEventListener('click', openPostComments);
	div.querySelector('#likeBtn').addEventListener('click', likePost);
	div.querySelector('#reportBtn').addEventListener('click', forumReport);
	document.querySelector('#posts').appendChild(div);
}

function createProfile(profile) {
	console.log(profile);
	document.title = `${profile.username} | Long X Ranch Cowboys`;
	let div = document.createElement('div');
	div.innerHTML = `<div class="profile" id="profile">
		<div class="profileInformation"> 
			<div style="display: flex; flex-direction: column; color: #333; margin-bottom: 20px; width: 40%;">
				<img style="order: 1; width: 10vw; height: 10vw; border-radius: 50%; object-fit: cover; object-position: center; margin-inline: auto;" id="pfp" src="/image/${profile.pfp}">
				<h1 class="profileUsername" style="order: 2; line-height: 15px; margin-left: 10px; font-size: 2.4vw; text-align: center;">${profile.username}</h1>
				<h1 class="profileLocation" style="order: 3; line-height: 15px; margin-left: 10px; font-size: 1.7vw; text-align: center;">${profile.city}, ${profile.state}</h1>
			</div>
			<div style="width: 40%;">
				<h1 class="biographyHeader" style="margin-top: 0px; color: #333;">Biography</h1>
				<p class="profileBiography">${profile.bio}</p>
			</div>
		</div>
		<div class="buttonRack">
			<button data-target="posts" class="highlighted-border" id="profileSwitchViewBtn">Posts</button>
			<button data-target="comments" id="profileSwitchViewBtn">Comments</button>
			<button data-target="annotations" id="profileSwitchViewBtn">Annotations</button>
			<button data-target="favorites" id="profileSwitchViewBtn">Favorites</button>
			<button data-target="followers" id="profileSwitchViewBtn">Followers</button>
		</div>
		<div style="width: 80%; margin-inline: auto;" id="posts"></div>
		<div style="width: 80%; margin-inline: auto;" id="comments"></div>
		<div style="width: 80%; margin-inline: auto;" id="annotations"></div>
		<div style="width: 80%; margin-inline: auto;" id="favorites"></div>
		<div style="width: 80%; margin-inline: auto;" id="followers"></div>
		</div>
		`;
	document.body.appendChild(div);
	loadPosts();
	loadComments();
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

document.addEventListener('click', function (event) {
	if (event.target && event.target.id === 'profileSwitchViewBtn') {
		document.querySelectorAll('#posts, #comments, #annotations, #favorites, #followers').forEach((div) => {
			div.style.display = 'none';
		});

		const buttons = document.querySelectorAll('#profileSwitchViewBtn');
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].classList.remove('highlighted-border');
		}

		event.target.classList.add('highlighted-border');

		const targetDivId = event.target.getAttribute('data-target').toLowerCase();
		const targetDiv = document.getElementById(targetDivId);

		if (targetDiv) {
			targetDiv.style.display = 'flex';
		}
	}
});

document.addEventListener('DOMContentLoaded', () => {
	document.addEventListener('click', (event) => {
		if (event.target.matches('.forumPost')) {
			location.href = `forum?id=${event.target.id}`;
		}
	});
});

function createCommentElement(comment, currentUserID) {
	const { _id, author, authorID, content, postDate, comments, likes, likesCount, commentsCount } = comment;
	console.log('Replies:', comments);
	let date = new Date(postDate);
	let div = document.createElement('div');
	div.innerHTML = `
			<div>
			<span class="line"></span>
			<div style="padding: 10px; border-radius: 10px;" class="comment" id=${_id}>
				<div class="inlineForumUser">
				<img id="postPfp" class="forumPfp" src="${pfp}"></img>
				<a class="forumUser" href="/profile?uid=${authorID}">${SafeHTML(author)}</a>
				<p id="forumDate" class="forumUser"><i class="fa-solid fa-circle"></i> ${DateText(date)}</p>
				</div>
				
				<p style="font-family: 'roboto'; font-size: 19px; color: #333;">${SafeHTML(content)}</p>
				<div class="forumBtns">
					<p style="color: #333;" id="likeCounter">${likesCount}</p>
					<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
					<button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
					<button id="replyBtn" class="iconBtn">Reply</button>
				</div>
				</div>
			</div>`;
	returnPfp(authorID, div);
	div.querySelector('#likeBtn').addEventListener('click', likeComment);
	div.querySelector('#replyBtn').addEventListener('click', replyClick);
	div.querySelector('#reportBtn').addEventListener('click', reportComment);
	let isLiked = likes.includes(currentUserID);
	if (isLiked) {
		div.querySelector('#likeBtn').querySelector('i').outerHTML = '<i class="fa-solid fa-heart"></i>';
	}
	if (currentUserID == authorID) {
		let button = document.createElement('button');
		button.id = 'deleteBtn';
		button.className = 'iconBtn';
		button.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
		button.addEventListener('click', deleteCommentConfirm);
		div.querySelector('.forumBtns').appendChild(button);
	}
	document.querySelector('#comments').appendChild(div);
	if (window.location.hash) {
		const id = window.location.hash.substring(1);
		if (id == 'commentSection') goToCommentSection();
	}
	if (comments.length > 0) {
		let openReplyBtn = document.createElement('div');
		let replyText = `Load ${commentsCount} replies`;
		if (comments.length === 1) replyText = `Load ${commentsCount} reply`;
		openReplyBtn.innerHTML = `<button style="text-indent: 0px; padding: 10px;"class="faqBtn" id="openReplyBtn">${replyText}</button>`;
		openReplyBtn.querySelector('#openReplyBtn').addEventListener('click', openReplies);
		div.querySelector('.comment').appendChild(openReplyBtn);
	}
}

function replySubmit() {
	let button = event.target;
	let parent = button.closest('div');
	let content = parent.querySelector('#replyInput').value;
	let commentID = button.closest('.comment').id;
	let postID = document.querySelector('.forumPost').id;
	const data = new FormData();
	data.append('content', content);
	data.append('commentID', commentID);
	data.append('postID', postID);
	fetch('api/forum/reply', {
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

function likeComment() {
	let element = event.target;
	if (element.nodeName != 'I') element = element.querySelector('i');
	const root = element.closest('.comment');
	const button = root.querySelector('#likeBtn');
	const commentID = element.closest('.comment').id;
	const counter = root.querySelector('#likeCounter');
	const data = new FormData();
	data.append('commentID', commentID);
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
	fetch('api/forum/likeComment', {
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

function reportComment() {
	const button = event.target;
	const comment = button.closest('.comment');
	const commentID = comment.id;
	const authorName = post.querySelector('.forumUser').innerHTML;
	document.querySelector('#reportTitle').innerHTML = `Report <a href="/forum?id=${commentID}">${authorName}'s Comment</a>`;
	document.querySelector('#reportTitle').name = commentID;
	document.querySelector('#makeReport').style.display = 'flex';
	document.querySelector('#reportInformation').style.display = 'flex';
}

function deleteCommentConfirm() {
	let button = event.target;
	let commentID = button.closest('.comment').id;
	const data = new FormData();
	data.append('commentID', commentID);

	fetch('api/forum/delete-comment', {
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
				window.location.reload();
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

function closeReplyClick() {
	console.log('close');
	let button = event.target;
	let comment = button.closest('.comment');
	let replies = comment.querySelectorAll('#replyDiv');
	replies.forEach((reply) => reply.remove());
	button.innerHTML = 'Reply';
	button.removeEventListener('click', closeReplyClick);
	button.addEventListener('click', replyClick);
}

function replyClick() {
	let button = event.target;
	button.innerHTML = 'Close';
	let comment = button.closest('.comment');
	let replies = comment.querySelectorAll('#replyDiv');
	replies.forEach((reply) => reply.remove());
	let commentID = comment.id;
	let div = document.createElement('div');
	div.id = 'replyDiv';
	div.innerHTML = `<input id="replyInput" placeholder="Add your reply..."class="postText" type="text"><button style="margin-left: auto;margin-right:5%;text-indent: 0px; padding: 10px;" class="faqBtn" id="replySubmitBtn">Reply</button>`;
	div.querySelector('#replySubmitBtn').addEventListener('click', replySubmit);
	comment.querySelector('.forumBtns').insertAdjacentElement('afterend', div);
	button.removeEventListener('click', replyClick);
	button.addEventListener('click', closeReplyClick);
}

function loadComments() {
	const urlParams = new URLSearchParams(window.location.search);
	let data = new FormData();
	data.append('uid', urlParams.get('uid'));
	fetch('api/profile/return-comments', {
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
				data.comments.forEach((comment) => createCommentElement(comment, data.currentUserID));
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

function loadPosts() {
	const urlParams = new URLSearchParams(window.location.search);
	let data = new FormData();
	data.append('uid', urlParams.get('uid'));
	fetch('api/profile/return-posts', {
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
				data.posts.forEach((post) => createPostElement(post, data.currentUserID));
			}
		})
		.catch((err) => {
			console.log(err);
		});
}
