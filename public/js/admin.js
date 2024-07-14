const SafeHTML = (html) => {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

const returnAnalytics = () => {
	fetch('api/admin/get-analytics', {
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
		});
};

const LoadDailyActiveUsers = () => {
	let ctx = document.getElementById('dailyActiveUsers').getContext('2d');

	let myChart = new Chart(ctx, {
		type: 'bar', // Specify the type of chart (e.g., 'bar', 'line', 'pie', etc.)
		data: {
			labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
			datasets: [
				{
					label: 'Daily Active Users (DAUs)',
					data: [12, 19, 3, 5, 2, 3],
					backgroundColor: 'lightblue',
					borderColor: 'blue',
					borderWidth: 1
				}
			]
		}
	});
};

const LoadTotalUsers = () => {
	let ctx = document.getElementById('totalUsers').getContext('2d');
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: [0, 1, 2, 3, 4, 5, 6],
			datasets: [{
				label: 'My First Dataset',
				data: [65, 59, 80, 81, 56, 55, 40],
				fill: false,
				borderColor: 'rgb(247, 82, 82)',
				tension: 0.1
			}]
		},
		options: {
			scales: {
				x: {
					grid: {
						display: false,
						drawOnChartArea: false
					},
					ticks: {
						display: false
					}
				},
				y: {
					grid: {
						display: false,
						drawOnChartArea: false
					},
					ticks: {
						display: false
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					enabled: false
				}
			}
		}
	});
};

const LoadDatabasePercent = () => {
	let ctx = document.getElementById('databasePercent').getContext('2d');

	let myChart = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: [
			  'Used',
			  'Not Used'
			],
			datasets: [{
			  label: 'My First Dataset',
			  data: [65, 35],
			  backgroundColor: [
				'rgb(39, 130, 242)',
				'rgb(255, 255, 255)',
			  ],
			  hoverOffset: 4
			}]
		  }
		});
	}

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
	if (username != '') filter['meta.username'] = { $regex: username, $options: 'i' };
	if (firstName != '') filter['meta.firstName'] = { $regex: firstName, $options: 'i' };
	if (lastName != '') filter['meta.lastName'] = { $regex: lastName, $options: 'i' };
	if (phoneNumber != '') filter['meta.phoneNumber'] = { $regex: phoneNumber };
	if (state != '') filter['meta.shipping.state'] = { $regex: state, $options: 'i' };
	if (city != '') filter['meta.shipping.city'] = { $regex: city, $options: 'i' };
	if (address != '') filter['meta.shipping.address'] = { $regex: address, $options: 'i' };
	if (zip != '') filter['meta.shipping.zip'] = zip;
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

function openFilterClick() {
	document.querySelector('#filterPopup').style.display = 'block';
}

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
	document.querySelector('#filterBtn').addEventListener('click', openFilterClick);
	document.querySelector('#applyFilterBtn').addEventListener('click', applyFilterClick);
}

const updateURL = (view) => {
	const newUrl = window.location.origin + window.location.pathname + `?v=${view}`;
	history.pushState(null, '', newUrl);
};

function openAnalytics() {
	enableView('analytics');
	const analytics = returnAnalytics();
	LoadDailyActiveUsers();
	LoadTotalUsers();
	LoadDatabasePercent();
}

async function openReports() {
	enableView('reports');
	console.log('reports');
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#membersBtn').addEventListener('click', openMembers);
	document.querySelector('#analyticsBtn').addEventListener('click', openAnalytics);
	document.querySelector('#reportsBtn').addEventListener('click', openReports);
});
