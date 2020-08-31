// For full API documentation, including code examples, visit https://wix.to/94BuAAs
import wixWindow from 'wix-window';
import wixUsers from 'wix-users';
// import {ownerRegister} from 'backend/class-register-backend.jsw';
import {getSurveysByOwner} from 'backend/CovidSurveys/covid-surveys-backend.jsw';
import {getMember, getGymnasts} from 'backend/Member/member-backend.jsw';
import {isAnyRole} from 'backend/Auth/auth-backend.jsw';
import {format,formatDistanceToNow} from 'date-fns';

$w.onReady(async function () {
	const receivedId = wixWindow.getRouterData();

	// either the current member is a coach, 
	// or the current member is looking at their own data
	let ownerId=receivedId;
	try {
		if (isAnyRole(['Club Staff', 'Admin'])) {
			// do nothing. 
		} else {
			// not a staff member. change the ownerId to the current id
			ownerId = wixUsers.currentUser.id;
		}

		
	} catch (err) {
		console.error('error!',err);
		ownerId = wixUsers.currentUser.id;
	}

	getGymnasts(ownerId)
		.then(
			gymnasts =>{
				const gymnastData = gymnasts.map(g => {return {gymnastFullName: g.gymnastFullName}});
				$w('#gymnasts').rows = gymnastData;
			},
			error =>{}
		)
	
	getSurveysByOwner(ownerId)
		.then(
			(items) => {
				// set the repeater
				$w('#repeater1').data = items;
			},
			error =>{}
		)
		
	getMember(ownerId)
		.then(
			owner =>{
				// Set the header
				$w('#memberName').text = owner.name;
				$w('#memberEmail').text = owner.loginEmail;
			},
			error =>{}
		);

});

export function repeater1_itemReady($item, itemData, index) {
	const BAD = 'wix:image://v1/a19f72_e3fc190e5504401ba128b6cb375473d0~mv2.png/_.png#originWidth=48&originHeight=48';
	const GOOD = 'wix:image://v1/a19f72_1481a024c2424bf38dfc975917fd3232~mv2.png/_.png#originWidth=48&originHeight=48';

	const Fields = ['taste', 'temperature','contact','travel','cough', 'otherCondition'];

	$item('#surveyDate').text = format(itemData._createdDate, 'EEE eo LLLL HH:mm' );
	$item('#surveyAge').text = formatDistanceToNow(itemData._createdDate, {addSuffix: true});
	Fields.forEach(f =>	{$item(`#${f}`).src = itemData[f] ? BAD : GOOD;	});
	$item('#otherInformation').text = itemData.otherInformation || '';
	
}