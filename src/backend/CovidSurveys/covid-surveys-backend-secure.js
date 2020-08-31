import wixUsersBackend from 'wix-users-backend';
import wixData from 'wix-data';
import {sub} from 'date-fns';
import {isRole} from 'backend/Auth/auth-backend.jsw';
import {getMember} from 'backend/Member/member-backend.jsw';


// options:
//  status: 'Current' | 'Lapsed' | 'Invalid';
export async function __getSurveys(options) {
    if (typeof options === 'undefined') {
        options = {};
    }
	if (!await isRole('Club Staff')) throw new Error('Unauthorised');
	
	// get all recent surveys
	try {
		// get all the items, sorted from newest to oldest
		const {items} = await wixData.query('CovidSurvey')
			.descending('_updatedDate')
			.find();
		

		// remove any surveys that have been rendered obsolete by a later survey
		const distinct = items.reduce((total, value, index, array) => {
			return total.find((e) =>  e._owner === value._owner)
				? total
				: [...total, value];
			}, []);

		// now, if a status filter has been specified, apply that too
        let result;
        if (options.status) {
            result = distinct.filter(item => item.status === options.status);
        } else {
            result = distinct;
        }
        
        // return the answer
        return result;

	} catch (err) {
	}
}

// return all surveys for an owner
export async function __getSurveysByOwner(ownerId, age = 14) {
    // only coaches can see other surveys. Members can see their own
    if (await isRole('Club Staff')) {
        // do nothing
    } else if (ownerId !== wixUsersBackend.currentUser.id) {
        throw new Error('Unauthorised');
    }

    const surveyResult =  await wixData.query('CovidSurvey')
        .eq('_owner', ownerId)
        .ge('_createdDate', sub(new Date(), {days:age}))
        .descending('_updatedDate')
        .find();
    
        // now wait for both queries to finish
    
    return surveyResult.items || [];

}
