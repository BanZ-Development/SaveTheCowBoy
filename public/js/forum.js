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

const ReturnPfp = (pfp) => {
	let pfpText = '../images/default-pfp.jpeg';
	if (pfp.name) pfpText = '/image/' + pfp.name;
	return pfpText;
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
				loadCreatePostButton();
				if (data.status) {
					console.log(data);
					data.posts.forEach((post) => {
						createPostElement(post, data.currentUserID, data.pfp);
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
					loadSinglePost(data.post, data.currentUserID, data.pfp);
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
	console.log(pfp);
	const { _id, title, message, username, postDate, uID, likes, likesCount, comments, commentsCount } = post;
	let div = document.createElement('div');
	let date = new Date(postDate);
	div.innerHTML = `<div id="post">
		<span class="line"></span>
		<div class="forumPost" href="/forum?id=${_id}" id=${_id}>
		<div class="inlineForumUser">
			<img class="forumPfp" src="/image/${pfp}"></img>
			<a class="forumUser" href="/profile?uid=${uID}">${SafeHTML(username)}</a>
			<p id="forumDate" class="forumUser"><i class="fa-solid fa-circle"></i> ${DateText(date)}</p>
		</div>
		<div class="forumTitle">
			<h3><a id="title" href="/forum?id=${_id}">${SafeHTML(title)}</a></h3>
		</div>
		
		
		<p style="white-space:pre;">${message}</p>
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
	div.querySelector('#commentIcon').addEventListener('click', openPostComments);
	div.querySelector('#likeBtn').addEventListener('click', likePost);
	div.querySelector('#reportBtn').addEventListener('click', forumReport);
	document.querySelector('#posts').appendChild(div);
}

function loadSinglePost(post, currentUserID, pfp) {
	const { _id, title, message, username, postDate, uID, likes, likesCount, comments, commentsCount } = post;
	let div = document.createElement('div');
	let date = new Date(postDate);
	let profilePic = '../images/default-pfp.jpeg';
	if (pfp.name) profilePic = `/image/${pfp.name}`;
	document.querySelector('.backBtn').style.display = 'flex';

	div.innerHTML = `<div id="post">
		<span class="line"></span>
		<div class="forumPost" id=${_id}>
		<div class="inlineForumUser">
			<img id="postPfp" class="forumPfp" src="${profilePic}"></img>
			<a class="forumUser" href="/profile?uid=${uID}">${SafeHTML(username)}</a>
			<p id="forumDate" class="forumUser"><i class="fa-solid fa-circle"></i> ${DateText(date)}</p>
		</div>
		
		<div class="forumTitle">
			<h3><a id="title">${SafeHTML(title)}</a></h3>
		</div>
		
		
		<p style="white-space:pre;">${message}</p>
		<div class="forumBtns">
			<p id="likeCounter">${likesCount}</p>
			<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
			<p id="commentCounter">${commentsCount}</p>
			<button id="commentIcon" class="iconBtn"><i class="fa-regular fa-comment"></i></button>
			<button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
		</div>
		</div>
		<div id="commentSection" class="commentSection">
			<h2 class="forumTitle">Comments</h2>
			<textarea class="postText" id="comment" placeholder="Add a comment..." type="text"></textarea>
			<button style="line-height: 0px;"id="commentBtn" class="btnLink">Comment</button>
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
	if (currentUserID == uID) {
		let button = document.createElement('button');
		button.id = 'deleteBtn';
		button.className = 'iconBtn';
		button.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
		button.addEventListener('click', deletePostConfirm);
		div.querySelector('.forumBtns').appendChild(button);
	}
	div.querySelector('#reportBtn').addEventListener('click', forumReport);
	div.querySelector('#commentIcon').addEventListener('click', goToCommentSection);
	div.querySelector('#likeBtn').addEventListener('click', likePost);
	div.querySelector('#commentBtn').addEventListener('click', comment);
	document.querySelector('#posts').appendChild(div);
	comments.forEach((comment) => {
		loadComment(comment, currentUserID);
	});
}

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

function createPost() {
	let title = document.querySelector('#title').value;
	let message = tinymce.get('message').getContent();

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

const returnReplyElement = (reply) => {};

function loadComment(comment, currentUserID) {
	const data = new FormData();
	data.append('commentID', comment);

	fetch('api/forum/loadComment', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			const com = data.comment;
			const { _id, author, authorID, content, postDate, comments, likes, likesCount, commentsCount } = com;
			console.log('Replies:', comments);
			let date = new Date(postDate);
			let div = document.createElement('div');
			console.log(data.pfp);
			let pfp = ReturnPfp(data.pfp);
			div.innerHTML = `
			<div>
			<span class="line"></span>
			<div style="padding: 10px; border-radius: 10px;" class="comment" id=${_id}>
				<div class="inlineForumUser">
				<img id="postPfp" class="forumPfp" src="${pfp}"></img>
				<a class="forumUser" href="/profile?uid=${authorID}">${SafeHTML(author)}</a>
				<p id="forumDate" class="forumUser"><i class="fa-solid fa-circle"></i> ${DateText(date)}</p>
				</div>
				
				<p style="white-space:pre; font-family: 'roboto'; font-size: 19px;">${SafeHTML(content)}</p>
				<div class="forumBtns">
					<p id="likeCounter">${likesCount}</p>
					<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
					<button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
					<button id="replyBtn" class="iconBtn">Reply</button>
				</div>
				</div>
			</div>`;
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
			document.querySelector('#commentsList').appendChild(div);
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
		})
		.catch((err) => {
			console.log(err);
		});
}

function hideReplies() {
	let button = event.target;
	let parent = button.closest('.comment').parentElement;
	let replies = parent.querySelectorAll('#reply');
	replies.forEach((reply) => reply.remove());
	let replyText = `Load ${replies.length} replies`;
	if (replies.length === 1) replyText = `Load ${replies.length} reply`;
	button.innerHTML = replyText;
	button.removeEventListener('click', hideReplies);
	button.addEventListener('click', openReplies);
}

function openReplies() {
	let button = event.target;
	button.removeEventListener('click', openReplies);
	let prevText = button.innerHTML;
	button.innerHTML = 'Loading...';
	let commentID = button.closest('.comment').id;
	let insert = button.closest('.comment');
	let data = new FormData();
	data.append('commentID', commentID);
	fetch('api/forum/get-replies', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.status) {
				//button.closest('div').remove();
				button.innerHTML = 'Hide Replies';
				button.removeEventListener('click', openReplies);
				button.addEventListener('click', hideReplies);
				let replies = data.replies;
				let currentUserID = data.uid;
				console.log(replies);
				replies.forEach((reply) => {
					let contents = reply.reply;
					let pfp = reply.pfp;
					let pfpText = ReturnPfp(pfp);
					const { _id, author, authorID, content, postDate, comments, likes, likesCount, commentsCount } = contents;
					let date = new Date(postDate);
					let div = document.createElement('div');
					div.id = 'reply';
					div.style.marginLeft = '5%';
					div.innerHTML = `
					<div>
					<span class="line"></span>
					<div style="padding: 10px; border-radius: 10px;" class="comment" id=${_id}>
						<div class="inlineForumUser">
						<img id="postPfp" class="forumPfp" src="${pfpText}"></img>
						<a class="forumUser" href="/profile?uid=${authorID}">${SafeHTML(author)}</a>
						<p id="forumDate" class="forumUser"><i class="fa-solid fa-circle"></i> ${DateText(date)}</p>
						</div>
						<p style="white-space:pre; font-family: 'roboto'; font-size: 19px;">${SafeHTML(content)}</p>
						<div class="forumBtns">
							<p id="likeCounter">${likesCount}</p>
							<button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
							<button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
							<button id="replyBtn" class="iconBtn">Reply</button>
						</div>
						</div>
					</div>`;
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
					if (comments.length > 0) {
						let openReplyBtn = document.createElement('div');
						let replyText = `Load ${commentsCount} replies`;
						if (comments.length === 1) replyText = `Load ${commentsCount} reply`;
						openReplyBtn.innerHTML = `<button style="text-indent: 0px; padding: 10px;"class="faqBtn" id="openReplyBtn">${replyText}</button>`;
						openReplyBtn.querySelector('#openReplyBtn').addEventListener('click', openReplies);
						div.querySelector('.comment').appendChild(openReplyBtn);
					}
					insert.insertAdjacentElement('afterend', div);
				});
			} else {
				button.innerHTML = prevText;
				button.onclick = openReplies;
			}
		})
		.catch((err) => {
			console.log(err);
			button.innerHTML = prevText;
			button.onclick = openReplies;
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
	closeReport();
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

function closeReport() {
	document.querySelector('#makeReport').style.display = 'none';
	document.querySelector('#reportInformation').style.display = 'none';
}

document.querySelector('#makeReport').addEventListener('click', closeReport);
document.querySelector('#submitReportButton').addEventListener('click', submitReport);
//document.querySelector('#showMorePosts').addEventListener('click', loadPosts);
function MCEtoMessage(mce) {
	let message = '';
	mce.children.forEach((child) => {
		message += child.outerHTML;
	});
	return message;
}

// this like uploads image or whatever, idgaf

let inputFile = document.getElementById('addImage');
let imagePreview = document.getElementById('imageUploadPreview');

document.getElementById('addImage').addEventListener('change', uploadImage);

document.getElementById('dropArea').addEventListener('dragover', function (e) {
	e.preventDefault();
});

document.getElementById('dropArea').addEventListener('drop', function (e) {
	e.preventDefault();
	inputFile.files = e.dataTransfer.files;
	uploadImage();
});

function uploadImage() {
	let imgLink = URL.createObjectURL(inputFile.files[0]);
	imagePreview.setAttribute('src', imgLink);
	document.querySelector('.submitImageText').style.display = 'none';
	document.querySelector('.imageUploadPreviewDiv').style.display = 'block';
	document.querySelector('#removeImageBtn').style.display = 'inline-block';
}

document.querySelector('#removeImageBtn').addEventListener('click', function () {
	imagePreview.setAttribute('src', '');
	document.querySelector('.submitImageText').style.display = 'flex';
	document.querySelector('.imageUploadPreviewDiv').style.display = 'none';
	document.querySelector('#removeImageBtn').style.display = 'none';
});

document.querySelectorAll('.faqBtn').forEach((button) => {
	button.addEventListener('click', openFaq);
});

function openFaq(event) {
	let button = event.currentTarget;
	let answer = button.querySelector('#faqAns');
	let icon = button.querySelector('#faqIcon');
	let answerParagraph = answer.querySelector('p');

	if (window.getComputedStyle(answer).display === 'block') {
		answer.style.display = 'none';
		button.style.height = '50px';
		button.style.color = '#747474';
		anime({
			targets: icon,
			rotateX: 0,
			easing: 'linear',
			duration: 300
		});
	} else {
		answer.style.display = 'block';
		answerParagraph.style.display = 'block'; // Ensure p is display block
		button.style.height = 'fit-content'; // Set height to fit-content
		button.style.color = '#bdbdbd';
		anime({
			targets: icon,
			rotateX: 180,
			easing: 'linear',
			duration: 300
		});
	}
}
