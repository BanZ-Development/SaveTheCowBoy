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
	document.querySelector('.biblePlansHolder').remove();

	let data = new FormData();
	data.append('id', id);
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
			if (data.status) createPlanWindow(data.biblePlan);
		});
}

function createTableOfContents(books) {
	let bible;
	fetch('https://bolls.life/get-books/ESV/', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			bible = data;
			books.forEach((book) => {
				let chaptersCount = book.chapters.length;
				let bookNum = parseInt(book.book) - 1;
				let title = bible[bookNum].name;
				let div = document.createElement('div');
				div.innerHTML = `
                <div id="book">
                        <h3 id=${bookNum}>${title} (0/${chaptersCount})</h3>
                        <div id="chapters" style="display: flex; flex-direction: column;">
                            
                        </div>
                    </div>`;
				book.chapters.forEach((chapter) => {
					let chapterElem = document.createElement('a');
					chapterElem.id = chapter;
					chapterElem.innerHTML = `Chapter ${chapter}`;
					let id = returnID();
					chapterElem.href = `/biblePlans?id=${id}&b=${bookNum + 1}&c=${chapter}`;
					div.querySelector('#chapters').appendChild(chapterElem);
				});
				document.querySelector('#tableOfContents').appendChild(div);
			});
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
			console.log(data);
			let bookTitle = data[bookID - 1].name;
			document.querySelector('#chapterTitle').innerHTML = `${bookTitle} | Chapter ${chapterID}`;
		});
}

function createText(chapter) {
	localStorage.setItem('chapter', JSON.stringify(chapter));
	let page = document.querySelector('#page1');
	page.innerHTML = '';
	chapter.forEach((obj) => {
		if (calculateLines(page) < 10) {
			let { verse, text } = obj;
			page.innerHTML += `<span id="${verse}" style="font-size: .7em; font-weight: bold;">${verse}</span> <span id="${verse}">${text}</span>   `;
		}
	});
}

function loadNextPage(lastVerse) {
	let chapter = JSON.parse(localStorage.getItem('chapter'));
	if (lastVerse == chapter.length) return;
	let page = document.querySelector('#page1');
	page.innerHTML = '';
	addPageNumber(1);
	for (let i = lastVerse; calculateLines(page) < 10; i++) {
		let obj = chapter[i];
		if (!obj) return;
		let { verse, text } = obj;
		page.innerHTML += `<span id="${verse}" style="font-size: .7em; font-weight: bold;">${verse}</span> <span id="${verse}">${text}</span>   `;
	}
}

function loadLastPage(lastVerse) {
	let chapter = JSON.parse(localStorage.getItem('chapter'));
	let page = document.querySelector('#page1');
	if (page.childNodes[0].id == '1') return;
	page.innerHTML = '';
	addPageNumber(-1);
	for (let i = lastVerse - 2; calculateLines(page) < 10; i--) {
		let obj = chapter[i];
		if (!obj) return;
		let { verse, text } = obj;
		page.innerHTML = `<span id="${verse}" style="font-size: .7em; font-weight: bold;">${verse}</span> <span id="${verse}">${text}</span>   ` + page.innerHTML;
	}
}

function addPageNumber(num) {
	let elem = document.querySelector('#pageNumber');
	let string = elem.innerHTML;
	let number = parseInt(string) + num;
	elem.innerHTML = number;
}

function returnLastVerse() {
	let page = document.querySelector('#page1');
	let length = page.childNodes.length;
	let lastVerse = page.childNodes[length - 2].id;
	console.log('Last Verse:', lastVerse);
	return lastVerse;
}

function returnFirstVerse() {
	let page = document.querySelector('#page1');
	let firstVerse = page.childNodes[0].id;
	console.log('First Verse:', firstVerse);
	return firstVerse;
}

function pageForward() {
	let lastVerse = returnLastVerse();
	loadNextPage(lastVerse);
}

function pageBackward() {
	let firstVerse = returnFirstVerse();
	loadLastPage(firstVerse);
}

async function setChapter(bookID, chapterID) {
	setTitle(bookID, chapterID);
	let translation = 'ESV';
	fetch(`https://bolls.life/get-chapter/${translation}/${bookID}/${chapterID}/`, {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			createText(data);
		});
}

function rerouteToFirstChapter(books) {
	// could also reroute to last visisted
	console.log('Reroute:', books);
	let bookID = books[0].book;
	let chapterID = books[0].chapters[0];
	return {
		bookID: bookID,
		chapterID: chapterID
	};
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
		const currentUrl = new URL(window.location.href);
		const params = new URLSearchParams();
		params.set('id', _id);
		params.set('b', bookID);
		params.set('c', chapterID);
		const newUrl = `${currentUrl.pathname}?${params.toString()}`;
		window.history.replaceState({}, '', newUrl);
	}

	await setChapter(bookID, chapterID);
	let div = document.createElement('div');
	div.innerHTML = `
    <div class="biblePlanSidebar">
        <div class="toolbar">
            <button><i class="fa-solid fa-list"></i></button>
            <button><i class="fa-regular fa-note-sticky"></i></button>
            <button><i class="fa-regular fa-comment"></i></button>
            <button><i class="fa-solid fa-language"></i></button>
        </div>
        <div id="sidebar" style="overflow: auto;">
            <div id="tableOfContents" style="flex-direction: column; display: flex;">
                
            </div>
            <div id="notes">

            </div>
            <div id="comments">

            </div>
            <div id="translations">

            </div>
        </div>
    </div>
    <div style="display: flex; flex-direction: column; height: 90vh; width: 65%; padding-top: 110px; padding-left: 30%;">
        <h1 style="font-family: 'Spectral'; color: #767676; font-size: 40px; text-align: center;">${title}</h1>
        <h2 id="chapterTitle" style="font-family: 'Spectral'; color: #767676; font-size: 30px; text-align: center;"></h2>
        <div class="biblePlanPages">
            <div class="biblePlanPage" id="page1"></div>
        </div>
        <div class="pageSwitch">
            <button id="pageBackward"><i class="fa-solid fa-arrow-left"></i></button>
            <p id="pageNumber">1</p>
            <button id="pageForward"><i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
    `;
	div.querySelector('#pageForward').addEventListener('click', pageForward);
	div.querySelector('#pageBackward').addEventListener('click', pageBackward);
	document.querySelector('body').appendChild(div);
	createTableOfContents(books);
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
			if (data.status) iteratePlans(data.biblePlans);
		});
}

function iteratePlans(plans) {
	plans.forEach((plan) => {
		createPlanObject(plan);
	});
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
	obj.innerHTML = `<div class="biblePlan">
                <div style="width: 45%;">
                    <img style="width: 100%; height: 100%; border-radius: 10px 0px 0px 10px;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Christ_at_the_Cross_-_Cristo_en_la_Cruz.jpg/640px-Christ_at_the_Cross_-_Cristo_en_la_Cruz.jpg" alt="">
                </div>
                <div style="padding-left: 20px; width: 55%; position: relative;">
                    <h3 style="font-style: italic; font-family: 'spectral'; font-weight: 500; text-align: center;">${title}</h3>
                    <p>${description}</p>
                    <p>${booksCount} books, ${chaptersCount} chapters</p>
                    <div class="biblePlanProg">
                        <span class="innerBiblePlanProg"></span>
                    </div>
                    <a class="biblePlanBtn" href="/biblePlans?id=${_id}">Continue</a>
                </div>
            </div>`;
	document.querySelector('.biblePlans').appendChild(obj);
}

loadMainOrPlan();
