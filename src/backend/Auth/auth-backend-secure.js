// Authentication functions
import wixUsersBackend from 'wix-users-backend';

// isRole - return true if the current user is a member of the role RoleName
export async function __isRole(RoleName) {
	const Roles = await wixUsersBackend.currentUser.getRoles();
	return Roles.some(userRole => userRole.name === RoleName);
}

// isAnyRole - return true if the current user is a member of any of the roles in RoleNameArray
export async function __isAnyRole(RoleNameArray) {
	const Roles = await wixUsersBackend.currentUser.getRoles();

	const result =  Roles.some(userRole => RoleNameArray.some(RoleName => userRole.name === RoleName));
	return result;
}