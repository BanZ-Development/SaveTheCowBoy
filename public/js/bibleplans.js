loadMainOrPlan();
function returnID() {
	let urlParams = window.location.search;
	let getQuery = urlParams.split('?')[1];
	if (!getQuery) return null;
	let params = getQuery.split('&');
	let id = params[0].split('=')[1];
	return id;
}

function returnBookAndChapter() {
	try {
		let urlParams = window.location.search;
		let getQuery = urlParams.split('?')[1];
		if (!getQuery) return null;
		let params = getQuery.split('&');
		let bookID = params[1].split('=')[1];
		let chapterID = params[2].split('=')[1];
		return { bookID, chapterID };
	} catch (err) {
		return null;
	}
}

function startSpin() {
	document.querySelector('#spinner').style.display = 'flex';
	try {
		document.querySelector('#biblePlanWindow').style.display = 'none';
	} catch (err) {}
}

function endSpin() {
	document.querySelector('#biblePlanWindow').style.display = 'flex';
	document.querySelector('#spinner').style.display = 'none';
}

function startSearchSpin(id) {
	document.getElementById(id).style.display = 'flex';
}
function endSearchSpin(id) {
	document.getElementById(id).style.display = 'none';
}

function scrollToElement(elementId, smoothOrAuto) {
	const element = document.getElementById(elementId);
	if (element) {
		element.scrollIntoView({ behavior: smoothOrAuto });
	}
}

function calculateLines(element) {
	const elementHeight = element.clientHeight; // Get the height of the element
	const lineHeight = parseFloat(window.getComputedStyle(element).lineHeight); // Get the computed line height

	return Math.round(elementHeight / lineHeight); // Return number of lines (rounded)
}

function loadMainOrPlan() {
	let id = returnID();
	if (id) loadPlan(id);
	else loadMain();
}

function loadPlan(id) {
	console.log('Loading:', id);
	try {
		document.querySelector('.biblePlansHolder').remove();
	} catch (err) {}

	let data = new FormData();
	data.append('id', id);
	document.addEventListener('DOMContentLoaded', () => startSpin());
	fetch('api/biblePlans/get-bible-plan', {
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
				createPlanWindow(data.biblePlan);
				localStorage.setItem('biblePlan', JSON.stringify(data.biblePlan.books));
			}
		});
}

function getBook(name) {
	return name.split(':')[0];
}

function isNum(str) {
	return Number.isFinite(Number(str));
}

function createTableOfContents(books, scroll) {
	let bible;
	fetch('https://bolls.life/get-books/ESV/', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			bible = data;
			books.forEach((book) => {
				let chaptersCount = book.chapters.length;
				let bookNum = parseInt(book.book) - 1;
				let title = bible[bookNum].name;
				let div = document.createElement('div');
				div.innerHTML = `
                <div class="bookChapterList" id="book">
				<div class="inlineBookTitle">
					<h3 id=${bookNum}>${title} (0/${chaptersCount})</h3>
					<button style="position: static;border: none;" class="bookTitleDropBtn" id="bookDropBtn"><i class="fa-solid fa-chevron-right"></i></button>
				</div>
                        
                        <div id="chapters" style="display: flex; flex-direction: column;">
                            
                        </div>
                    </div>`;
				book.chapters.forEach((chapter) => {
					let chapterNum = chapter.number;
					let chapterElem = document.createElement('a');
					chapterElem.id = `${bookNum}:${chapterNum}`;
					chapterElem.innerHTML = `Chapter ${chapterNum}`;
					let id = returnID();
					chapterElem.href = `/biblePlans?id=${id}&b=${bookNum + 1}&c=${chapterNum}`;
					div.querySelector('#chapters').appendChild(chapterElem);
				});
				document.querySelector('#tableOfContents').appendChild(div);
			});
			scrollToElement(`book${scroll - 1}`, 'auto');
		});
}

function setTitle(bookID, chapterID) {
	fetch('https://bolls.life/get-books/ESV/', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			let bookTitle = data[bookID - 1].name;
			document.querySelector('#chapterTitle').innerHTML = `${bookTitle} | Chapter ${chapterID}`;
		});
}

function returnCleanedKJV(text) {
	if (text.includes('<S>') || text.includes('<sup>')) {
		text = text.replaceAll(/<S>.*?<\/S>/g, '');
		text = text.replaceAll(/<sup>.*?<\/sup>/g, '');
		return text;
	} else return text;
}

function createText(chapter) {
	localStorage.setItem('chapter', JSON.stringify(chapter));
	let page = document.querySelector('#page1');
	page.innerHTML = '';
	chapter.forEach((obj) => {
		let { verse, text } = obj;
		text = returnCleanedKJV(text);
		page.innerHTML += `<sup id="${verse}" style="font-size: .7em; font-weight: bold;">${verse}</sup> <span id="${verse}">${text}</span>   `;
	});
	loadComments();
}

function isInBiblePlan(bookID, chapterID) {
	let allowed = false;
	let books = JSON.parse(localStorage.getItem('biblePlan'));
	books.forEach((book) => {
		if (bookID == parseInt(book.book)) {
			book.chapters.forEach((chapter) => {
				if (chapterID == chapter.number) {
					allowed = true;
				}
			});
		}
	});
	return allowed;
}

function loadNextChapter() {
	let { bookID, chapterID } = returnBookAndChapter();
	let translation = returnStoredTranslation();
	fetch(`https://bolls.life/get-books/${translation}/`, {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			let chapterLength = data[bookID - 1].chapters;
			if (chapterID == chapterLength && bookID < 65) {
				if (isInBiblePlan(parseInt(bookID) + 1, 1)) setChapter(parseInt(bookID) + 1, 1);
			} else {
				if (isInBiblePlan(bookID, parseInt(chapterID) + 1)) setChapter(bookID, parseInt(chapterID) + 1);
			}
		});
}

function loadLastChapter() {
	let { bookID, chapterID } = returnBookAndChapter();
	if (chapterID == 1 && bookID > 1) {
		if (isInBiblePlan(parseInt(bookID) - 1, 1)) setChapter(parseInt(bookID) - 1, 1);
	} else if (chapterID >= 2) {
		if (isInBiblePlan(bookID, parseInt(chapterID) - 1)) setChapter(bookID, parseInt(chapterID) - 1);
	}
}

async function setChapter(bookID, chapterID) {
	setTitle(bookID, chapterID);
	setHREF(returnID(), bookID, chapterID);
	startSpin();
	let translation = returnStoredTranslation();
	fetch(`https://bolls.life/get-chapter/${translation}/${bookID}/${chapterID}/`, {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			document.querySelector('#pageNumber').innerHTML = chapterID;
			createText(data);
			endSpin();
			checkForCompletion();
		});
}

function setCompletionText(completion) {
	for (let i = 0; i < Object.keys(completion).length; i++) {
		let key = parseInt(Object.keys(completion)[i]) - 1;
		let value = Object.values(completion)[i];
		let title = document.querySelector('#tableOfContents').querySelector(`[id='${key}']`);
		let before = title.innerHTML.split('(')[0];
		let after = title.innerHTML.split('/')[1];
		let string = `${before}(${value}/${after}`;
		title.innerHTML = string;
	}
}

function checkForCompletion() {
	let data = new FormData();
	let id = returnID();
	let { bookID, chapterID } = returnBookAndChapter();
	data.append('id', id);
	data.append('bookID', bookID);
	data.append('chapterID', chapterID);
	fetch('api/biblePlans/check-plan-completion', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.status) {
				setCompletionText(data.completion);
			}
		});
}

function rerouteToFirstChapter(books) {
	// could also reroute to last visisted
	console.log('Reroute:', books);
	let bookID = books[0].book;
	let chapterID = books[0].chapters[0].number;
	return {
		bookID: bookID,
		chapterID: chapterID
	};
}

function setHREF(_id, bookID, chapterID) {
	const currentUrl = new URL(window.location.href);
	const params = new URLSearchParams();
	params.set('id', _id);
	params.set('b', bookID);
	params.set('c', chapterID);
	const newUrl = `${currentUrl.pathname}?${params.toString()}`;
	window.history.replaceState({}, '', newUrl);
}

async function createPlanWindow(plan) {
	let { _id, books, description, icon, title } = plan;
	let { booksCount, chaptersCount } = returnBooksAndChaptersCount(plan);
	let bookID, chapterID;
	try {
		let route = returnBookAndChapter();
		bookID = route.bookID;
		chapterID = route.chapterID;
	} catch (err) {
		let route = rerouteToFirstChapter(books);
		bookID = route.bookID;
		chapterID = route.chapterID;
		setHREF(_id, bookID, chapterID);
	}
	await setChapter(bookID, chapterID);
	let div = document.createElement('div');
	div.id = 'biblePlanWindow';
	div.innerHTML = `
    <div class="biblePlanSidebar">
	
        <div class="toolbar">
            <button id="tableOfContentsBtn"><i class="fa-solid fa-list"></i></button>
            <button id="annotationsBtn"><i class="fa-regular fa-note-sticky"></i></button>
            <button id="commentsBtn"><i class="fa-regular fa-comment"></i></button>
            <button id="translationsBtn"><i class="fa-solid fa-language"></i></button>
        </div>
        <div id="sidebar" style="overflow: auto;">
            <div id="tableOfContents" style="flex-direction: column; display: flex;">
                
            </div>
            <div id="annotations" style="display: none; flex-direction: column;">
				<h1 style="margin-bottom:0px; text-align: center; font-family: 'Noto Serif';">Annotations</h1>
				<label style="text-align: center; margin-bottom: 15px; font-family: 'Noto Serif';">Create private notes to study the bible!</label>
				<div id="annotationsHolder" style="display: flex; flex-direction: column;">
				<div id="annotationsSpinner" style="background-color: white; width: 100%; height: 100%; display: none; justify-content: center; align-items: center; z-index: 100;">
					<l-ring
					size="40"
					stroke="5"
					bg-opacity="0"
					speed="2"
					color="black" 
					></l-ring>
				</div></div>
				<div id="annotationsUserInput" style="position: absolute;bottom: 0; flex-direction: column; display: none; width:100%">
					<label id="annotateRoute"></label>
					<textarea placeholder="Write down something important to you..." id="annotateBox" style="width=95%; height=6em; resize: none;"></textarea>
					<button id="submitAnnotationBtn" style="width=95%;">Annotate</button>
				</div>
				<h3 id="annotatePrerequisite" style="position: absolute;bottom: 0; display: none">Highlight text to create an annotation!</h3>
            </div>
            <div id="comments" style="display: none; flex-direction: column;">
				<h1 style="margin-bottom:0px;text-align: center; font-family: 'Noto Serif';">Comments</h1>
				<label style="text-align: center; margin-bottom: 10px; font-family: 'Noto Serif';">Chat with other STC members about this chapter!</label>
				<div id="commentsHolder" style="display: flex; flex-direction: column;">
					<div id="commentsSpinner" style="background-color: white; width: 100%; height: 100%; display: none; justify-content: center; align-items: center; z-index: 100;">
						<l-ring
						size="40"
						stroke="5"
						bg-opacity="0"
						speed="2"
						color="black" 
						></l-ring>
					</div>
				</div>
				<div id="commentUserInput" style="position: absolute;bottom: 0; flex-direction: column; display: none; width:100%">
					<label id="quote">Quoting: </label>
					<textarea placeholder="Speak your mind..."id="commentBox" style="width=95%; height=6em; resize: none;"></textarea>
					<button id="submitCommentBtn" style="width=95%;">Comment</button>
				</div>
				<h3 id="commentPrerequisite" style="position: absolute;bottom: 0; display: none;">Highlight text to create a comment!</h3>
            </div>
            <div id="translations" style="display:none; flex-direction: column;">
				<h1 style="margin-bottom:0px; text-align: center; font-family: 'Noto Serif';">Translations</h1>
				<label style="text-align:center; margin-bottom: 15px; font-family: 'Noto Serif';" id="currentTranslation">Current Translation: </label>
				<label for="languageDropdown">Language:</label>
				<select class="custom-select" id="languageDropdown"></select>
				<div id="translationsHolder" style="display:flex; flex-direction: column;"></div>
            </div>
        </div>
    </div>
    <div style="display: flex; flex-direction: column; height: 90vh; width: 65%; padding-top: 110px; padding-left: 30%;">
        <h1 style="font-family: 'Spectral'; color: #767676; font-size: 40px; text-align: center; margin-block: 0px; margin-top: 10px;">${title}</h1>
        <h2 id="chapterTitle" style="font-family: 'Spectral'; color: #767676; font-size: 30px; text-align: center; margin-block: 10px;"></h2>
        <div class="biblePlanPages">
			<div class="biblePlanPopup" id="biblePlanPopup"><button class="filterBtn" id="annotateBtn"><i class="fa-regular fa-note-sticky"></i> Annotate</button><button class="filterBtn" id="commentBtn"><i class="fa-regular fa-comment"></i> Comment</button></div>
            <div class="biblePlanPage" id="page1"></div>
        </div>
        <div class="pageSwitch">
            <button id="pageBackward"><i class="fa-solid fa-arrow-left"></i></button>
            <p id="pageNumber">1</p>
            <button id="pageForward"><i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
	<style>

		#commentProfile {
			text-decoration: none;
			cursor: pointer;
		}

		#commentProfile > p {
			font-weight: bold;
			color: #333;
		}

		#commentProfile > img {
			width: 45px;
			height: 45px;
			margin-left: 0px;
		}

		.deleteBtn {
			border: solid 1px #ccc;
			border-radius: 12px;
		}
        .deleteBtn:hover {
            background-color: #f75252 !important;
			border: solid 1px #fff0;
        }
    </style>
    `;
	div.querySelector('#pageForward').addEventListener('click', loadNextChapter);
	div.querySelector('#pageBackward').addEventListener('click', loadLastChapter);
	div.querySelector('#tableOfContentsBtn').addEventListener('click', openTableOfContents);
	div.querySelector('#commentsBtn').addEventListener('click', openComments);
	div.querySelector('#translationsBtn').addEventListener('click', openTranslations);
	div.querySelector('#languageDropdown').addEventListener('change', changeStoredLanguage);
	div.querySelector('#commentBtn').addEventListener('click', openCommentsWithComment);
	div.querySelector('#annotateBtn').addEventListener('click', openAnnotations);
	div.querySelector('#submitCommentBtn').addEventListener('click', submitComment);
	div.querySelector('#submitAnnotationBtn').addEventListener('click', submitAnnotation);
	div.querySelector('#annotationsBtn').addEventListener('click', openAnnotations);
	document.querySelector('body').appendChild(div);
	createTableOfContents(books, bookID);
	createTranslations();
}

function updateCompletion(userPlans) {
	console.log(userPlans);
	userPlans.forEach((plan) => {
		let obj = document.getElementById(plan.id);
		let progress = obj.querySelector('.innerBiblePlanProg');
		let percent = plan.chaptersFinished.length / progress.id;
		obj.querySelector('#progressCounter').innerHTML = `${(percent * 100).toFixed(0)}% completed`;
		progress.style.width = percent * 100 + '%';
	});
}

function loadMain() {
	console.log('Loading Main');
	fetch('api/biblePlans/get-bible-plans', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.status) {
				iteratePlans(data.biblePlans);
				updateCompletion(data.userPlans);
			}
		});
}

function createPlanLink(plan) {
	let link = document.createElement('li');
	link.style = 'margin-inline: auto; margin-block: 15px;';
	link.innerHTML = `<a href="#${plan._id}" style="text-decoration: underline;">${plan.title}</a>`;
	document.querySelector('.tableContents > ul').appendChild(link);
}

function iteratePlans(plans) {
	plans.forEach((plan) => {
		createPlanObject(plan);
		createPlanLink(plan);
	});
	document.querySelector('.tableContents').style.display = 'block';
	document.querySelector('.biblePlans').style.display = 'flex';
}

function returnBooksAndChaptersCount(plan) {
	let books = 0;
	let chapters = 0;
	plan.books.forEach((book) => {
		books++;
		chapters += book.chapters.length;
	});
	return {
		booksCount: books,
		chaptersCount: chapters
	};
}

function createPlanObject(plan) {
	let { _id, books, description, icon, title } = plan;
	let { booksCount, chaptersCount } = returnBooksAndChaptersCount(plan);
	let obj = document.createElement('div');
	obj.className = 'biblePlan';
	obj.id = _id;
	obj.style = 'width: 50vw; max-width: 575px;';
	obj.innerHTML = `
                <div style="width: 45%;">
                    <img style="width: 100%; height: 100%; border-radius: 10px 0px 0px 10px; object-fit: fill;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Christ_at_the_Cross_-_Cristo_en_la_Cruz.jpg/640px-Christ_at_the_Cross_-_Cristo_en_la_Cruz.jpg" alt="">
                </div>
                <div style="padding-left: 20px; width: 55%; position: relative;">
                    <h3 style="font-style: italic; font-family: 'spectral'; font-weight: 500; text-align: center;">${title}</h3>
                    <p>${description}</p>
                    <p>${booksCount} books, ${chaptersCount} chapters</p>
					<label for="${chaptersCount}" id="progressCounter">0% completed</label>
                    <div class="biblePlanProg">
                        <span style="width: 0%"id="${chaptersCount}" class="innerBiblePlanProg"></span>
                    </div>
                    <a class="biblePlanBtn" href="/biblePlans?id=${_id}">Continue</a>
                </div>`;
	document.querySelector('.biblePlans').appendChild(obj);
}

function openWindow(id) {
	document.querySelector('#tableOfContents').style.display = 'none';
	document.querySelector('#annotations').style.display = 'none';
	document.querySelector('#comments').style.display = 'none';
	document.querySelector('#translations').style.display = 'none';
	document.querySelector(`#${id}`).style.display = 'flex';
}

document.addEventListener('mouseup', function (event) {
	try {
		let selected = window.getSelection();
		let anchor = selected.anchorNode;
		let focus = selected.focusNode;
		if (anchor.parentElement.parentElement.id != 'page1' || focus.parentElement.parentElement.id != 'page1') return;
		const selectedText = selected.toString().trim();
		const popup = document.getElementById('biblePlanPopup');

		if (selectedText.length > 0) {
			const range = window.getSelection().getRangeAt(0);
			const rect = range.getBoundingClientRect();

			popup.style.left = `${rect.left + window.scrollX}px`;
			popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
			popup.style.display = 'block';
		} else {
			popup.style.display = 'none';
		}
	} catch (err) {}
});

function returnBookAndChapterName() {
	let bookName = document.querySelector('#chapterTitle').innerHTML.split(' |')[0];
	let { chapterID } = returnBookAndChapter();
	return { bookName, chapterID };
}

function noSelectionComment() {
	document.querySelector('#commentUserInput').style.display = 'none';
	document.querySelector('#commentPrerequisite').style.display = 'flex';
}

function returnFirstAndEndVerse(selected) {
	let anchor = selected.anchorNode;
	let focus = selected.focusNode;
	let id1 = parseInt(anchor.parentElement.id);
	let id2 = parseInt(focus.parentElement.id);
	if (id1 < id2) {
		return {
			startVerse: id1,
			endVerse: id2
		};
	} else if (id2 < id1) {
		return {
			startVerse: id2,
			endVerse: id1
		};
	} else {
		return {
			startVerse: id1,
			endVerse: id1
		};
	}
}

function returnVerseString(bookName, chapterID, selected) {
	let { startVerse, endVerse } = returnFirstAndEndVerse(selected);
	let verseString = `${bookName} ${chapterID}:${startVerse}`;
	if (startVerse != endVerse) verseString += `-${endVerse}`;
	return verseString;
}

function setupCommentWindow() {
	// pass parameters for first verse and last verse
	let selected = window.getSelection();
	let { bookName, chapterID } = returnBookAndChapterName();
	let verseString = returnVerseString(bookName, chapterID, selected);
	if (!selected.toString().trim()) {
		noSelectionComment();
	} else {
		document.querySelector('#quote').innerHTML = `Quoting: ${verseString}`;
	}
}

document.addEventListener('mousedown', function (e) {
	if (e.target.id == 'commentBtn') {
		openCommentsWithComment();
		setupCommentWindow();
	} else if (e.target.id == 'annotateBtn') {
		openAnnotations();
	}
	try {
		const popup = document.getElementById('biblePlanPopup');
		popup.style.display = 'none';
	} catch (err) {}
});

function openTranslations() {
	openWindow('translations');
}

function setCommentsLabel() {
	let { bookName, chapterID } = returnBookAndChapterName();
	//document.querySelector('#label').innerHTML = `${bookName} ${chapterID}`;
}

function openComments() {
	let selected = window.getSelection();
	//setCommentsLabel();
	if (selected.anchorNode) {
		openCommentsWithComment();
		setupCommentWindow();
	} else {
		noSelectionComment();
		openWindow('comments');
	}
}

function openAnnotations() {
	openWindow('annotations');
	loadAnnotations();
	let selected = window.getSelection();
	if (selected.toString().trim()) {
		let { bookName, chapterID } = returnBookAndChapterName();
		document.querySelector('#annotationsUserInput').style.display = 'flex';
		document.querySelector('#annotatePrerequisite').style.display = 'none';
		document.querySelector('#annotateRoute').innerHTML = returnVerseString(bookName, chapterID, selected);
	} else {
		document.querySelector('#annotationsUserInput').style.display = 'none';
		document.querySelector('#annotatePrerequisite').style.display = 'flex';
	}
}

function openCommentsWithComment() {
	document.querySelector('#commentPrerequisite').style.display = 'none';
	document.querySelector('#commentUserInput').style.display = 'flex';
	openWindow('comments');
}

function openTableOfContents() {
	openWindow('tableOfContents');
}

function createTranslationElements(data) {
	let languages = [];
	let div = document.createElement('div');
	div.id = 'languageHolder';
	data.forEach((language) => {
		let languageName = language.language;
		languages.push(languageName);
		let languageTranslations = language.translations;
		let languageDiv = document.createElement('div');
		languageDiv.style.display = 'none';
		languageDiv.id = languageName;
		languageDiv.style.flexDirection = 'column';
		languageTranslations.forEach((translation) => {
			let translationDiv = document.createElement('div');
			translationDiv.className = 'bibleTranslation';
			translationDiv.id = translation.short_name;
			translationDiv.innerHTML = `
			<div style="display: flex; flex-direction: column; width: 85%;">
					<h2>${translation.short_name}</h2>
					<h3>${translation.full_name}</h3>
				</div>
				<button id="selectTranslationBtn"></button>
			`;
			translationDiv.querySelector('#selectTranslationBtn').addEventListener('click', changeTranslation);

			languageDiv.appendChild(translationDiv);
		});
		div.appendChild(languageDiv);
	});
	languages.forEach((language) => {
		const newOption = document.createElement('option');
		newOption.value = language;
		newOption.text = language;
		document.querySelector('#languageDropdown').appendChild(newOption);
	});
	document.querySelector('#languageDropdown').value = returnStoredLanguage();
	document.querySelector('#translationsHolder').appendChild(div);
	viewCurrentLanguage(returnStoredLanguage());
	displayCurrentTranslation();
}

function viewCurrentLanguage(languageName) {
	document.querySelector('#languageHolder').childNodes.forEach((language) => {
		if (language.id != languageName) language.style.display = 'none';
		else language.style.display = 'flex';
	});
}

function createTranslations() {
	fetch('https://bolls.life/static/bolls/app/views/languages.json', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			createTranslationElements(data);
		});
}

function returnStoredLanguage() {
	let language = localStorage.getItem('language');
	if (!language) {
		localStorage.setItem('language', 'English');
		return returnStoredLanguage();
	} else {
		return language;
	}
}

function changeStoredLanguage() {
	let languageName = document.querySelector('#languageDropdown').value;
	localStorage.setItem('language', languageName);
	viewCurrentLanguage(languageName);
}

function returnStoredTranslation() {
	let translation = localStorage.getItem('translation');
	if (!translation) {
		localStorage.setItem('translation', 'ESV');
		return returnStoredTranslation();
	} else {
		return translation;
	}
}

async function changeStoredTranslation(translationName) {
	localStorage.setItem('translation', translationName);
	displayCurrentTranslation();
	let { bookID, chapterID } = returnBookAndChapter();
	await setChapter(bookID, chapterID);
	//refresh
}

function changeTranslation() {
	let button = event.target;
	let translationName = button.closest('div').id;
	changeStoredTranslation(translationName);
}

function displayCurrentTranslation() {
	let translation = returnStoredTranslation();
	document.querySelector('#currentTranslation').innerHTML = `Current Translation: ${translation}`;
	document.querySelectorAll('#selectTranslationBtn').forEach((btn) => {
		btn.innerHTML = '';
		btn.parentElement.style.backgroundColor = 'white';
	});
	document.querySelector(`#${translation}`).style.backgroundColor = '#d5d5d5';
	document.querySelector(`#${translation}`).querySelector('#selectTranslationBtn').innerHTML = '<i class="fa-solid fa-check"></i>';
}

function submitComment() {
	let id = returnID();
	let { bookID, chapterID } = returnBookAndChapter();
	let comment = document.querySelector('#commentBox').value;
	let location = document.querySelector('#quote').innerHTML.split(': ')[1];
	let data = new FormData();
	data.append('id', id);
	data.append('bookID', bookID);
	data.append('chapterID', chapterID);
	data.append('comment', comment);
	data.append('location', location);
	fetch('api/biblePlans/create-comment', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			clearCommentsWindow();
			loadComments();
		});
}

function deleteComments() {
	document.querySelector('#commentsHolder').style.display = 'none';
	document.querySelector('#commentsHolder').childNodes.forEach((child) => {
		if (child.id != 'commentsSpinner') child.remove();
	});
	document.querySelector('#commentsHolder').style.display = 'flex';
}

function loadComments() {
	document.querySelector('#commentsHolder').style.display = 'none';
	deleteComments();
	document.querySelector('#commentsHolder').style.display = 'flex';
	startSearchSpin('commentsSpinner');
	setCommentsLabel();
	let id = returnID();
	let { bookID, chapterID } = returnBookAndChapter();
	let data = new FormData();
	data.append('id', id);
	data.append('bookID', bookID);
	data.append('chapterID', chapterID);
	fetch('api/biblePlans/get-comments', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			createCommentElements(data.comments);
			endSearchSpin('commentsSpinner');
		});
}

function createCommentElements(comments) {
	deleteComments();
	comments.forEach((obj) => {
		let { comment, location, uID, postDate } = obj;
		let div = document.createElement('div');
		div.innerHTML = `
		<div class="annotation">
			<div class="inlineAnnotationTitle"> 
				<a class="navProfileUser" id="commentProfile" href="/profile?uid=${uID}"></a>
				<label style="margin-left: auto; color: #797979; font-family: 'Noto Serif'; margin-block: auto;" id="location"for="comment">${location}</label>
			</div>
			<p style="padding-bottom: 15px;" class="annotationText" id="comment">${comment}</p>
		</div>
		
		`;
		document.querySelector('#commentsHolder').appendChild(div);
		let data = new FormData();
		data.append('uid', uID);
		fetch('api/profile/load', {
			method: 'post',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams(data)
		})
			.then((res) => res.json())
			.then((data) => {
				let { username, pfp } = data.profile;
				div.querySelector('#commentProfile').innerHTML = `<img src="/image/${pfp}" alt="Profile pic"> <p>${username}</p>`;
			});
	});
}

function clearCommentsWindow() {
	document.querySelector('#commentPrerequisite').style.display = 'flex';
	document.querySelector('#commentUserInput').style.display = 'none';
	document.querySelector('#commentBox').value = '';
	//document.querySelector('#label').innerHTML = '';
}

function clearAnnotationWindow() {
	document.querySelector('#annotationsUserInput').style.display = 'none';
	document.querySelector('#annotatePrerequisite').style.display = 'flex';
	document.querySelector('#annotateBox').value = '';
	document.querySelector('#annotateRoute').innerHTML = '';
}

function submitAnnotation() {
	let id = returnID();
	let { bookID, chapterID } = returnBookAndChapter();
	let annotation = document.querySelector('#annotateBox').value;
	let location = document.querySelector('#annotateRoute').innerHTML;
	let data = new FormData();
	data.append('id', id);
	data.append('bookID', bookID);
	data.append('chapterID', chapterID);
	data.append('annotation', annotation);
	data.append('location', location);
	fetch('api/biblePlans/create-annotation', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			clearAnnotationWindow();
			loadAnnotations();
		});
}

function deleteAnnotations() {
	document.querySelector('#annotationsHolder').style.display = 'none';
	document.querySelector('#annotationsHolder').childNodes.forEach((child) => {
		if (child.id != 'annotationsSpinner') child.remove();
	});
	document.querySelector('#annotationsHolder').style.display = 'flex';
}

function loadAnnotations() {
	deleteAnnotations();
	startSearchSpin('annotationsSpinner');
	let id = returnID();
	let { bookID, chapterID } = returnBookAndChapter();
	let data = new FormData();
	data.append('id', id);
	data.append('bookID', bookID);
	data.append('chapterID', chapterID);
	fetch('api/biblePlans/get-annotations', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.status && data.annotations) {
				createAnnotationElements(data.annotations);
				endSearchSpin('annotationsSpinner');
			} else {
				endSearchSpin('annotationsSpinner');
			}
		});
}

function createAnnotationElements(annotations) {
	annotations.forEach((obj) => {
		let { annotation, location, uID, postDate } = obj;
		let div = document.createElement('div');
		div.innerHTML = `
		<div class="annotation">
			<div class="inlineAnnotationTitle"> 
				<label class="annotationTitle" id="location"for="comment">${location}</label>
				<button class="viewVerseBtn">View Verse</button>
			</div>
			<p class="annotationText" id="comment">${annotation}</p>
			<div style="display:flex;flex-direction:row;">
				<button style="height: 45px; line-height:0px;" class="btnLink deleteBtn"><i class="fa-solid fa-trash"></i> Delete</button>
				<button class="annotationDrop"><i class="fa-solid fa-chevron-down"></i></button>
			</div>
		</div>
		`;
		document.querySelector('#annotationsHolder').appendChild(div);
	});
}
