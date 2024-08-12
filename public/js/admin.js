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

Object.defineProperty(String.prototype, 'capitalize', {
	value: function () {
		return this.charAt(0).toUpperCase() + this.slice(1);
	},
	enumerable: false
});

const updateDAU = () => {
	let chartStatus = Chart.getChart('dailyActiveUsers'); // <canvas> id
	if (chartStatus != undefined) {
		chartStatus.destroy();
	}
	fetch('api/admin/get-analytics', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			const { dailyActiveUsers } = data;
			let timeframe = parseInt(document.querySelector('#timeframeSelector').value);
			let type = document.querySelector('#typeSelector').value;
			LoadDailyActiveUsers(dailyActiveUsers, timeframe, type);
		});
};

const LoadAnalytics = () => {
	fetch('api/admin/get-analytics', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			const { totalUsers, totalPosts, dailyActiveUsers, usersCalendar, postsCalendar } = data;
			LoadDailyActiveUsers(dailyActiveUsers, 14, 'days');
			LoadTotalUsers(totalUsers, usersCalendar);
			LoadTotalPosts(totalPosts, postsCalendar);
			LoadNewMembers();
			LoadPageVisits();
			LoadDatabasePercent();
		});
};

const searchCalendar = (calendar, year, month, day) => {
	try {
		if (calendar[`${year}`][`${month}`][`${day}`] == undefined) {
			return 0;
		} else {
			return calendar[`${year}`][`${month}`][`${day}`];
		}
	} catch (err) {
		return 0;
	}
};

function daysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

const returnCalendarData = (calendar) => {
	//return last 8 days
	let time = 8;
	let labels = [];
	let data = [];
	let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	while (data.length <= time) {
		while (day > 0) {
			labels.unshift(`${month}/${day}`);
			data.unshift(searchCalendar(calendar, year, month, day));
			day--;
			if (data.length >= time) return { labels, data };
		}
		month--;
		while (month > 0) {
			day = daysInMonth(month, year);
			while (day > 0) {
				labels.unshift(`${month}/${day}`);
				data.unshift(searchCalendar(calendar, year, month, day));
				day--;
				if (data.length >= time) return { labels, data };
			}
			month--;
		}
		year--;
		while (year > 0) {
			month = 12;
			while (month > 0) {
				day = daysInMonth(month, year);
				while (day > 0) {
					labels.unshift(`${month}/${day}`);
					data.unshift(searchCalendar(calendar, year, month, day));
					day--;
					if (data.length >= time) return { labels, data };
				}
				month--;
			}
			year--;
		}
	}
	return { labels, data };
};

const returnDauData = (dau, time, type) => {
	let labels = [];
	let data = [];

	while (data.length <= time) {
		switch (type) {
			case 'days': {
				let date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();
				while (day > 0) {
					labels.unshift(`${month}/${day}`);
					data.unshift(searchCalendar(dau, year, month, day));
					day--;
					if (data.length >= time) return { labels, data };
				}
				month--;
				while (month > 0) {
					day = daysInMonth(month, year);
					while (day > 0) {
						labels.unshift(`${month}/${day}`);
						data.unshift(searchCalendar(dau, year, month, day));
						day--;
						if (data.length >= time) return { labels, data };
					}
					month--;
				}
				year--;
				while (year > 0) {
					month = 12;
					while (month > 0) {
						day = daysInMonth(month, year);
						while (day > 0) {
							labels.unshift(`${month}/${day}`);
							data.unshift(searchCalendar(dau, year, month, day));
							day--;
							if (data.length >= time) return { labels, data };
						}
						month--;
					}
					year--;
				}
			}
			case 'months': {
				let date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				while (month > 0) {
					let monthName = new Date(year, month, 0).toLocaleString('default', { month: 'long' });
					let days = daysInMonth(month, year);
					let sum = 0;
					for (let i = 1; i <= days; i++) {
						sum += searchCalendar(dau, year, month, i);
					}
					labels.unshift(monthName);
					data.unshift(sum);
					month--;
					if (data.length >= time) return { labels, data };
				}
				year--;
				while (year > 0) {
					month = 12;
					while (month > 0) {
						let monthName = new Date(year, month, 0).toLocaleString('default', { month: 'long' });
						let days = daysInMonth(month, year);
						let sum = 0;
						for (let i = 1; i <= days; i++) {
							sum += searchCalendar(dau, year, month, i);
						}
						labels.unshift(monthName);
						data.unshift(sum);
						month--;
						if (data.length >= time) return { labels, data };
					}
					year--;
				}
			}
			case 'years': {
				let date = new Date();
				let year = date.getFullYear();
				while (year > 0) {
					let sum = 0;
					let month = 12;
					while (month > 0) {
						let days = daysInMonth(month, year);
						for (let i = 1; i <= days; i++) {
							sum += searchCalendar(dau, year, month, i);
						}
						month--;
					}
					labels.unshift(year);
					data.unshift(sum);
					if (data.length >= time) return { labels, data };
					year--;
				}
			}
		}
	}
};

const LoadDailyActiveUsers = (dailyActiveUsers, time, type) => {
	let ctx = document.getElementById('dailyActiveUsers').getContext('2d');
	const { labels, data } = returnDauData(dailyActiveUsers, time, type);
	console.log(labels, data);
	Chart.defaults.font.family = 'Montserrat';
	let myChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [
				{
					label: 'DAUs',
					data: data,
					fill: false,
					borderRadius: 20,
					borderSkipped: false,
					borderColor: '#2782f2',
					backgroundColor: '#2782f2',
					datalabels: {
						display: false
					}
				}
			]
		},
		options: {
			barThickness: 30,
			plugins: {
				legend: {
					display: false
				}
			},
			scales: {
				x: {
					grid: {
						display: false
					},

					categoryPercentage: 1.0,
					barPercentage: 1.0
				},
				y: {
					beginAtZero: true
				}
			}
		}
	});
};

const LoadTotalUsers = (totalUsers, usersCalendar) => {
	document.querySelector('#totalUsersNum').innerHTML = totalUsers;
	const { labels, data } = returnCalendarData(usersCalendar);
	let color = SetPreview(data, 'totalUsers');
	let ctx = document.getElementById('totalUsers').getContext('2d');
	ctx.canvas.parentNode.style.height = '70%';
	ctx.canvas.parentNode.style.width = '100%';
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels, // Adjusted to match the number of data points
			datasets: [
				{
					label: 'Users',
					data: data, // Data points
					borderColor: color,
					backgroundColor: color, // Optional: Adding a background color for better visibility
					fill: false, // Ensures no area fill below the line
					tension: 0.5
				}
			]
		},
		options: {
			scales: {
				y: {
					display: false, // Hide Y axis labels
					stacked: false
				},
				x: {
					beginAtZero: true,
					display: false // Hide X axis labels
				}
			},
			plugins: {
				legend: {
					display: false
				}
			},
			elements: {
				point: {
					radius: 1
				}
			}
		}
	});
	myChart.update();
};

const LoadNewMembers = () => {
	let ctx = document.getElementById('newMembers').getContext('2d');
	ctx.canvas.parentNode.style.height = '70%';
	ctx.canvas.parentNode.style.width = '100%';
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4], // Adjusted to match the number of data points
			datasets: [
				{
					label: 'My First Dataset',
					data: [80, 70, 90, 50, 60], // Data points
					borderColor: 'rgb(247, 82, 82)',
					backgroundColor: 'rgba(247, 82, 82, 0.1)', // Optional: Adding a background color for better visibility
					fill: false, // Ensures no area fill below the line
					tension: 0.5
				}
			]
		},
		options: {
			scales: {
				y: {
					display: false, // Hide Y axis labels
					stacked: false
				},
				x: {
					beginAtZero: true,
					display: false // Hide X axis labels
				}
			},
			plugins: {
				legend: {
					display: false
				}
			},
			elements: {
				point: {
					radius: 1
				}
			}
		}
	});
	myChart.update();
};

const SetPreview = (data, title) => {
	let first = data[0];
	let last = data[data.length - 1];
	let ratio = last / first;
	let total = Math.round(ratio * 100);
	let num = total - 100;
	let percent = Math.abs(num);
	let color = '#3dd598';
	let sign = '+';
	if (percent < 0) {
		color = '#f75252';
		sign = '-';
	}
	if (percent == 0) sign = '';
	document.querySelector(`#${title}Preview`).innerHTML = `<b style="color: ${color};">${sign}${percent}%</b> this week`;
	if (percent < 0) {
		return '#f75252';
	} else {
		return '#3dd598';
	}
};

const LoadTotalPosts = (totalPosts, postsCalendar) => {
	document.querySelector('#totalPostsNum').innerHTML = totalPosts;
	const { labels, data } = returnCalendarData(postsCalendar);
	SetPreview(data, 'totalPosts');
	let ctx = document.getElementById('totalPosts').getContext('2d');
	ctx.canvas.parentNode.style.height = '70%';
	ctx.canvas.parentNode.style.width = '100%';
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels, // Adjusted to match the number of data points
			datasets: [
				{
					label: 'Posts',
					data: data, // Data points
					borderColor: 'rgba(61, 213, 152, 0.945)',
					backgroundColor: 'rgba(61, 213, 152, 0.945)', // Optional: Adding a background color for better visibility
					fill: false, // Ensures no area fill below the line
					tension: 0.5
				}
			]
		},
		options: {
			scales: {
				y: {
					display: false, // Hide Y axis labels
					stacked: false
				},
				x: {
					beginAtZero: true,
					display: false // Hide X axis labels
				}
			},
			plugins: {
				legend: {
					display: false
				}
			},
			elements: {
				point: {
					radius: 1
				}
			}
		}
	});
	myChart.update();
};

const LoadDatabasePercent = () => {
	let ctx = document.getElementById('databasePercent').getContext('2d');
	ctx.canvas.parentNode.style.height = '300px';
	ctx.canvas.parentNode.style.width = '300px';
	let myChart = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: ['Used', 'Not Used'],
			datasets: [
				{
					label: 'Database Storage',
					data: [65, 35],
					backgroundColor: ['rgb(39, 130, 242)', 'rgb(255, 255, 255)'],
					hoverOffset: 4
				}
			]
		},
		options: {
			hover: { mode: null },
			plugins: {
				legend: {
					display: false
				}
			}
		}
	});
	myChart.update();
};

const LoadPageVisits = () => {
	let ctx = document.getElementById('pageVisits').getContext('2d');
	ctx.canvas.parentNode.style.height = '70%';
	ctx.canvas.parentNode.style.width = '100%';
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4], // Adjusted to match the number of data points
			datasets: [
				{
					label: 'My First Dataset',
					data: [60, 65, 80, 70, 90], // Data points
					borderColor: 'rgba(61, 213, 152, 0.945)',
					backgroundColor: 'rgba(61, 213, 152, 0.945)', // Optional: Adding a background color for better visibility
					fill: false, // Ensures no area fill below the line
					tension: 0.5
				}
			]
		},
		options: {
			scales: {
				y: {
					display: false, // Hide Y axis labels
					stacked: false
				},
				x: {
					beginAtZero: true,
					display: false // Hide X axis labels
				}
			},
			plugins: {
				legend: {
					display: false
				}
			},
			elements: {
				point: {
					radius: 1
				}
			}
		}
	});
	myChart.update();
};

function checkAdmin() {
	fetch('api/admin/isAdmin', {
		method: 'get',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.status) {
				sendToRequest();
			}
		});
}
checkAdmin();

const disableAllViews = () => {
	let views = document.querySelectorAll('.settingSection');
	views.forEach((view) => {
		view.style.display = 'none';
	});
};

const enableView = (view) => {
	disableAllViews();
	let viewElement = document.querySelector(`#${view}`);
	if (viewElement) {
		viewElement.style.display = 'flex';
		updateURL(view);
	} else document.querySelector('#members').style.display = 'flex';
};

const openView = (view) => {
	switch (view) {
		case 'members':
			openMembers();
			break;
		case 'analytics':
			openAnalytics();
			break;
		case 'reports':
			openReports();
			break;
		default:
			openMembers();
			break;
	}
};

const sendToRequest = () => {
	let view = returnView();
	disableAllViews();
	enableView(view);
	openView(view);
};

function returnView() {
	let urlParams = window.location.search;
	let getQuery = urlParams.split('?')[1];
	if (!getQuery) return null;
	let params = getQuery.split('&');
	let id = params[0].split('=')[1];
	return id;
}

const createMemberElement = (user) => {
	let { address, admin, city, customer, email, firstName, lastName, pfp, phoneNumber, state, uid, zip } = user;
	let div = document.createElement('div');
	div.id = 'memberElement';
	div.innerHTML = `
		<div class="tableRow">
		<div class="tableRowInfo">
		<button id="dropInformation" class="tableDropBtn"> <i class="fa-solid fa-chevron-right"></i></button>
		<p id="firstNameAdmin">${SafeHTML(firstName)}</p>
		<p id="lastNameAdmin">${SafeHTML(lastName)}</p>
		<p id="emailAdmin">${SafeHTML(email)}</p>
		<p id="phoneNumberAdmin">${SafeHTML(phoneNumber)}</p>
		<p id="stateAdmin">${SafeHTML(state)}</p>
        <p id="cityAdmin">${SafeHTML(city)}</p>
		<p id="addressAdmin">${SafeHTML(address)}</p>
		<p id="zipAdmin">${SafeHTML(zip)}</p>
		<p id="adminAdmin">${admin}</p>
		</div>
		<div style="display: flex; flex-direction: row;">
		</div>
		<div class="tableRowBtns">
		<button style="font-size: 17px;height: 40px;line-height: 10px;" id="deleteBtn" class="btnLink">Delete</button>
		<button style="font-size: 17px;height: 40px;line-height: 10px;" id="editBtn" class="btnLink">Edit</button>
		<button style="font-size: 17px;height: 40px;line-height: 10px;" id="profileBtn" class="btnLink">View Profile</button>
		</div>
		</div>
		<div style="display:none;" id="dropdownBox">
		<a>Profile</a>
		</div>
		<span class="line"></span>
	`;
	document.querySelector('.membersTable').appendChild(div);
};

const removeAllMembers = () => {
	let members = document.querySelectorAll('#memberElement');
	members.forEach((member) => member.remove());
};

const returnMembers = async () => {
	//add form data
	let filter = {};
	let username = document.querySelector('#usernameInput').value;
	let firstName = document.querySelector('#fnInput').value;
	let lastName = document.querySelector('#lnInput').value;
	let phoneNumber = document.querySelector('#pnInput').value;
	let state = document.querySelector('#stateInput').value;
	let city = document.querySelector('#cityInput').value;
	let address = document.querySelector('#addressInput').value;
	let zip = document.querySelector('#zipInput').value;
	let admin = document.querySelector('#adminInput').value;
	console.log(admin);
	if (username != '') filter['meta.username'] = { $regex: username, $options: 'i' };
	if (firstName != '') filter['meta.firstName'] = { $regex: firstName, $options: 'i' };
	if (lastName != '') filter['meta.lastName'] = { $regex: lastName, $options: 'i' };
	if (phoneNumber != '') filter['meta.phoneNumber'] = { $regex: phoneNumber };
	if (state != '') filter['meta.shipping.state'] = { $regex: state, $options: 'i' };
	if (city != '') filter['meta.shipping.city'] = { $regex: city, $options: 'i' };
	if (address != '') filter['meta.shipping.address'] = { $regex: address, $options: 'i' };
	if (zip != '') filter['meta.shipping.zip'] = zip;
	if (admin != '') filter['admin'] = /^true$/i.test(admin);
	console.log(filter);
	let data = new FormData();
	data.append('filter', JSON.stringify(filter));
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			fetch('api/admin/get-members', {
				method: 'post',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams(data)
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data.members);
				});
		}, 100);
	}).catch((error) => {
		reject(error);
	});
};

async function applyFilterClick() {
	let members = await returnMembers();
	removeAllMembers();
	members.forEach((member) => createMemberElement(member));
}

async function openMembers() {
	removeAllMembers();
	enableView('members');
	let members = await returnMembers();
	members.forEach((member) => createMemberElement(member));
	document.querySelector('#applyFilterBtn').addEventListener('click', applyFilterClick);
}

const updateURL = (view) => {
	const newUrl = window.location.origin + window.location.pathname + `?v=${view}`;
	history.pushState(null, '', newUrl);
};

function openAnalytics() {
	enableView('analytics');
	LoadAnalytics();
}

const reasonsToSentence = (string) => {
	return string.replaceAll(',', ', ');
};

const createReportObject = (message, reasons, post, pfp, postID, _id, ignored) => {
	let date = new Date(post.postDate);
	let div = document.createElement('div');

	let uid = post.uID || post.authorID;
	let username = post.username || post.author;
	let title = post.title || post.content;
	let text = post.message != null ? post.message : '';
	let ignoredText = !ignored ? 'Ignore' : 'Unignore';
	div.id = 'report';
	div.innerHTML = `
		<div id="${_id}" style="border: solid 1px #333; padding: 10px; border-radius: 5px; margin-top: 20px;">
		<div id="post>
        <div class="forumPost" href="/forum?id=${postID}" id=${postID}>
        <div class="inlineForumUser">
            <img class="forumPfp" src="/image/${pfp.name}"></img>
            <a class="forumUser" href="/profile?uid=${uid}">${SafeHTML(username)}</a>
            <p id="forumDate" class="forumUser"><i class="fa-solid fa-circle"></i> ${DateText(date)}</p>
        </div>
            <div class="forumTitle">
                <h3><a id="title" href="/forum?id=${post.id}">${SafeHTML(title)}</a></h3>
            </div>
                            
                            
        <p style="white-space:pre;">${text}</p>
        <div class="forumBtns">
            <p id="likeCounter">${post.likesCount}</p>
            <button id="likeBtn" class="iconBtn"><i class="fa-regular fa-heart"></i></button>
            <p id="commentCounter">${post.commentsCount}</p>
            <button id="commentIcon" class="iconBtn"><i class="fa-regular fa-comment"></i></button>
            <button id="reportBtn" class="iconBtn"><i class="fa-regular fa-flag"></i></button>
        </div>
        </div>
        <span class="line"></span>
        <p>Report category: ${reasonsToSentence(reasons).capitalize()}</p>
        <p>Report message: ${SafeHTML(message)}</p>
        <div class="inlineButtons">
        <button style="height: 50px;" id="deleteBtn" class="btnLink">Delete</button>
        <button style="height: 50px;" id="ignoreBtn" class="btnLink">${ignoredText}</button>
        </div>
		</div>
		</div>
	`;
	div.querySelector('#deleteBtn').addEventListener('click', deleteReport);
	div.querySelector('#ignoreBtn').addEventListener('click', ignoreReport);
	document.querySelector('#reportHolder').appendChild(div);
};

const deleteReportObjects = () => {
	let reports = document.querySelectorAll('#report');
	reports.forEach((report) => {
		report.remove();
	});
};

const initReportObject = (report) => {
	const { message, reasons, postID, reporterID, _id, ignored } = report;
	const data = new FormData();
	data.append('id', postID);
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
				const { post, pfp } = data;
				createReportObject(message, reasons, post, pfp, postID, _id, ignored);
			} else {
				console.log('error!');
			}
		})
		.catch((err) => {
			console.log(err);
		});
};

async function openReports() {
	enableView('reports');
	deleteReportObjects();
	let data = new FormData();
	data.append('id', '');
	fetch('api/admin/get-reports', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			document.querySelector('#loadedReportsTitle').innerHTML = `Loaded ${data.reports.length} ${data.type} Reports`;
			data.reports.forEach((report) => {
				initReportObject(report);
			});
		});
}

async function clickReportsButton() {
	deleteReportObjects();
	let button = event.target;
	let id = button.id;
	if (id == 'currentReportsBtn') {
		document.querySelector('#currentReportsBtn').style.backgroundColor = '#353535';
		document.querySelector('#ignoredReportsBtn').style.backgroundColor = '#1e1e1e';
	} else if (id == 'ignoredReportsBtn') {
		document.querySelector('#ignoredReportsBtn').style.backgroundColor = '#353535';
		document.querySelector('#currentReportsBtn').style.backgroundColor = '#1e1e1e';
	}

	let data = new FormData();
	data.append('id', id);
	fetch('api/admin/get-reports', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			document.querySelector('#loadedReportsTitle').innerHTML = `Loaded ${data.reports.length} ${data.type} Reports`;
			data.reports.forEach((report) => {
				initReportObject(report);
			});
		});
}

function decreaseReportsTitle() {
	let title = document.querySelector('#loadedReportsTitle');
	let string = title.innerHTML;
	let arr = string.split(' ');
	let numStr = arr[1];
	let num = parseInt(numStr);
	num--;
	let newString = string.replace(numStr, num);
	title.innerHTML = newString;
}

function deleteReport() {
	let button = event.target;
	let report = button.closest('#report');
	let reportID = report.querySelector('div').id;
	report.remove();
	decreaseReportsTitle();
	let data = new FormData();
	data.append('reportID', reportID);
	fetch('api/admin/delete-report', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
		});
}

function ignoreReport() {
	let button = event.target;
	let report = button.closest('#report');
	let reportID = report.querySelector('div').id;
	report.remove();
	decreaseReportsTitle();
	let data = new FormData();
	data.append('reportID', reportID);
	fetch('api/admin/ignore-report', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(data)
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
		});
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#membersBtn').addEventListener('click', openMembers);
	document.querySelector('#analyticsBtn').addEventListener('click', openAnalytics);
	document.querySelector('#reportsBtn').addEventListener('click', openReports);
	document.querySelector('#updateDauBtn').addEventListener('click', updateDAU);
	document.querySelector('#currentReportsBtn').addEventListener('click', clickReportsButton);
	document.querySelector('#ignoredReportsBtn').addEventListener('click', clickReportsButton);
});

document.addEventListener('click', function (event) {
	if (event.target.closest('#dropInformation')) {
		var button = event.target.closest('#dropInformation');
		var tableRow = button.closest('.tableRow');

		if (tableRow.style.height === '120px') {
			tableRow.style.height = '60px'; // Change to the original height
			button.querySelector('i').classList.replace('fa-chevron-down', 'fa-chevron-right');
		} else {
			tableRow.style.height = '120px'; // Expand to fit content
			button.querySelector('i').classList.replace('fa-chevron-right', 'fa-chevron-down');
		}
	}
});
