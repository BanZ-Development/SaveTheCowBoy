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
				
				<p style="font-family: 'roboto'; font-size: 19px;">${SafeHTML(content)}</p>
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

function returnID() {
	let urlParams = window.location.search;
	let getQuery = urlParams.split('?')[1];
	if (!getQuery) return null;
	let params = getQuery.split('&');
	let id = params[0].split('=')[1];
	return id;
}

function getDevotions() {
	const id = returnID();
	let loadedPosts = 0;
	loadedPosts = document.querySelectorAll('#post').length;

	const data = new FormData();
	data.append('type', 'devotion');
	data.append('loadedPosts', loadedPosts);

	if (id) loadPost(id);
	else loadPosts(data);
}

function loadPosts(data) {
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
				let loadMoreBtn = document.querySelector('#loadMoreBtn');
				if (data.hasMore) {
					loadMoreBtn.style.display = 'flex';
					loadMoreBtn.addEventListener('click', loadPosts);
				} else {
					loadMoreBtn.style.display = 'none';
					loadMoreBtn.addEventListener('click', loadPosts);
				}
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
}

function loadSinglePost(post, currentUserID, pfp) {
	const { _id, title, message, username, postDate, uID, likes, likesCount, comments, commentsCount } = post;
	let div = document.createElement('div');
	let date = new Date(postDate);
	let profilePic = '../images/default-pfp.jpeg';
	if (pfp) profilePic = `/image/${pfp.name}`;
	document.querySelector('.backBtn').style.display = 'flex';
	document.querySelector('#sorting').style.display = 'none';

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

function loadPost(id) {
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

function openPostComments() {
	let button = event.target;
	let postID = button.closest('.forumPost').id;
	location.href = `forum?id=${SafeHTML(postID)}#commentSection`;
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

function forumReport() {
	const button = event.target;
	const post = button.closest('.forumPost');
	const postID = post.id;
	const authorName = post.querySelector('.forumUser').innerHTML;
	document.querySelector('#reportTitle').innerHTML = `Report <a href="/forum?id=${postID}">${authorName}'s Post</a>`;
	document.querySelector('#makeReport').style.display = 'flex';
	document.querySelector('#reportInformation').style.display = 'flex';
}

function createPostElement(post, currentUserID, pfp) {
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

getDevotions();
