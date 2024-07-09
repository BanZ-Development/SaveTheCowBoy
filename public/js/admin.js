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
	console.log(views);
	views.forEach((view) => {
		view.style.display = 'none';
	});
};

const enableView = (view) => {
	let viewElement = document.querySelector(`#${view}`);
	if (viewElement) viewElement.style.display = 'flex';
	else document.querySelector('#members').style.display = 'flex';
};

const openView = (view) => {
	switch (view) {
		case 'members':
			openMembers();
			break;
		case 'analytics':
			openAnalytics();
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
		<p id="firstNameAdmin">${firstName}</p>
		<p id="lastNameAdmin">${lastName}</p>
		<p id="emailAdmin">${email}</p>
		<p id="phoneNumberAdmin">${phoneNumber}</p>
		<p id="stateAdmin">${state}</p>
        <p id="cityAdmin">${city}</p>
		<p id="addressAdmin">${address}</p>
		<p id="zipAdmin">${zip}</p>
		</div>
		</div>
		<div style="display:none;" id="dropdownBox">
		<a>Profile</a>
		</div>
		<span class="line"></span>
	`;
	document.querySelector('.membersTable').appendChild(div);
};

const returnMembers = async () => {
	//add form data
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			fetch('api/admin/get-members', {
				method: 'post',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
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

async function openMembers() {
	let members = await returnMembers();
	members.forEach((member) => createMemberElement(member));
}
function openAnalytics() {}
