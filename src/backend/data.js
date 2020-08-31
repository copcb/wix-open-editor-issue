import wixUsersBackend from 'wix-users-backend';

export function Trials_afterInsert(item, context) {
	// item -> [{emergencyContactName:"fg",email:"p@b.com",_id:"095d4e8f-8d90-4bb1-959d-dc464c33b003",_createdDate:"2020-07-27T19:00:24.679Z",gymnastMedical:"",gymnastName:"fg",_updatedDate:"2020-07-27T19:00:24.679Z",gymnastAllergies:"fg",gymnastDateOfBirth:"2020-06-30T23:00:00.000Z",parentName:"gh",contactNumber:"fg",address:"fg",gymnastPreviousExperience:"",emergencyContactNumber:"fg"}]"
	//wixUsersBackend
	//	.emailUser('TrialMail','94912437-eb9c-4b22-a899-bd03ab88131a')
	//	.then(()=>{})
	//	.catch((err)=>console.error(err));
	//return item;
}

export function Trials_afterQuery(item, context) {
	item.gymnastAge = ageFromDob(item.gymnastDateOfBirth);
	item.gymnastAgeText = item.gymnastAge.text;
	return item;
}



// utilities
function ageFromDob(dob) {
	try {
		const rightNow = new Date();
		const now = {
			rightNow: rightNow,
			year: rightNow.getFullYear(),
			month: rightNow.getMonth(),
			day: rightNow.getDate(),
		};
		
		const bday = {
			rightNow: dob,
			year: dob.getFullYear(),
			month: dob.getMonth(),
			day: dob.getDate(),
		};

		const age = {};

		age.year = now.year - bday.year;

		if (now.month >= bday.month) {
			age.month = now.month - bday.month;
		} else {
			age.year--;
			age.month = 12 + now.month - bday.month;
		}

		if (now.day >= bday.day) {
			age.day = now.day - bday.day;
		} else {
			age.month--;
			age.day = 31 + now.day - bday.day;

			if (age.month <0) {
				age.month = 11;
				age.year--;
			}
		}

		if (age.year >0) {
			age.text = `${age.year} year${age.year === 1 ? '':'s'}`;
		}
		if (age.month >0) {
			age.text += ` ${age.month} month${age.month === 1 ? '': 's'}`;
		}
		age.text += ' old';

		return age;
		
	} catch (err) {
	}
}

function isAdmin(RolesArray) {
	return RolesArray.find(e => e.name === 'Admin') ? true : false;
}
function isRole(RolesArray, Role) {
	return RolesArray.find(e => e.name === Role) ? true : false;
}

export function Gymnasts_afterQuery(item, context) {
	item.gymnastFullName = [item.gymnastFirstName, item.gymnastLastName].join(' ');
	return item;
}

export async function Gymnasts_beforeQuery(query, context) {
	// limit access to admins or logged in user records only
	const roles = await wixUsersBackend.currentUser.getRoles();
	const Admin = isAdmin(roles);
	// console.log(roles, Admin);
	if (Admin) return query;

	try {
		const email = await wixUsersBackend.currentUser.getEmail();	
		return query.eq('memberEmail',email);
	} catch (err) {
		return query.eq('memberEmail',null);
	}
	
}

export function CovidSurvey_afterQuery(item, context) {
	try {
		const updated = new Date(item._createdDate);
		const now = new Date();
		const elapsed = (now - updated) / (1000 * 60 * 60 * 24); // milliseconds to days
		// console.log(updated, now, elapsed);
		item.status = (elapsed < 1) ? 'Current' : (elapsed < 2) ? 'Lapsed' : 'Invalid';
		item.health = (item.temperature || item.cough || item.taste || item.otherCondition || item.contact || item.travel) ? 'FAIL' : 'PASS';
		return item;	
	} catch (err) {
		return item;
	}
	
}



export function MemberMap_afterQuery(item, context) {
	// add the customer email based on the customer regId
	// and the memberName from the member table
	try {
		item.memberName = item.privateMemberId.name;
		item.customerName = item.customerId.customerName;
	} catch (err) {
	}
	return item;
}

export function Customers_afterQuery(item, context) {
	// add a customerName field
	try {
		item.customerName = [item.firstName, item.lastName].join(' ');
	}
	catch (err) {}
	return item;
}