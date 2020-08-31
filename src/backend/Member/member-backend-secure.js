// secure functions to access PrivateMember data
import wixData from 'wix-data';
import wixUsersBackend from 'wix-users-backend';
import { isRole, isAnyRole } from 'backend/Auth/auth-backend.jsw';

const PrivateMembersData = 'Members/PrivateMembersData';

export async function __getMember(id) {
	// only coaches can see other surveys. Members can see their own
	if (await isRole('Club Staff')) {
		// do nothing
	} else if (id !== wixUsersBackend.currentUser.id) {
		throw new Error('Unauthorised');
	}

	const result = await wixData.get(PrivateMembersData, id);

	const safeResult = {
		_id: result.id,
		name: result.name,
		loginEmail: result.loginEmail
	}
	return safeResult;
}

// fetch the gymnast records associated with the member (id)
export async function __getGymnasts(id) {

	// either the member is a coach or admin, or
	// the current user is logged in and looking for their own gymnastss
	let memberId = id;
	if (await isAnyRole(['Club Staff'])) {
		// club coach - full access

	} else if (wixUsersBackend.currentUser.loggedIn) {
		// general member - only own gymnasts
		memberId = wixUsersBackend.currentUser.id;

	} else {
		// unauthorised
		throw new Error('Unauthorised call to __getGymnasts');
	}

	// get the member record
	const member = await wixData.get(PrivateMembersData, memberId);

	// now search Gymnasts for matching email addresses
	const gymnasts = await wixData.query('Gymnasts')
		.eq('memberEmail', member.loginEmail)
		.find();

	return gymnasts.items || [];
}

export async function __getMembersByEmail(memberEmails) {
	// only coaches can see bulk member data
	if (!await isRole('Club Staff')) throw new Error('Unauthorised');

	const data = await wixData.query(PrivateMembersData)
		.hasSome('loginEmail', memberEmails)
        .find();

	const safeResult = data.items.map(m => {
		return {
			_id: m.id,
			name: m.name,
			loginEmail: m.loginEmail,
		};
	});

	return safeResult;

}