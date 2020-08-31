// For full API documentation, including code examples, visit https://wix.to/94BuAAs
//import {coachRegister} from 'backend/class-register-backend.jsw';
import {getGymnasts} from 'backend/Member/member-backend.jsw';
import {getClasses, getClassGymnasts} from 'backend/Classes/classes-backend.jsw';
import {getSurveys} from 'backend/CovidSurveys/covid-surveys-backend.jsw';
import wixLocation from 'wix-location';

$w.onReady(async function () {
	// TODO: write you page related code here...	
	try {
		prepareFilters();
		fetchRegisters();

	} catch (err) {
		console.error(err);
	}

});

async function prepareFilters() {

	// populate the classesFilter
	getClasses().then(
		(classes)=>{
			const options = classes.map(e=> {return {label:e.lessonFormat, value: e._id}; });
			options.unshift({label: 'All', value:null});
			$w('#classFilter').options = options;
		}, 
		(error)=>{});
}

async function fetchRegisters(filterOptions) {
	// define the filter if not supplied
	if (typeof filterOptions === 'undefined') {
		filterOptions = {
			class: $w('#classFilter').value,
			status: $w('#covidFilter').value
		};
	}

	try {
		let surveyPromise;
		let classPromise;

		if (filterOptions.class) {
			// class filter specified. Get the members of the class
			console.log('class filter specified');
			classPromise = getClassGymnasts(filterOptions.class);
		} else {
			classPromise = [];
		}

		
		if (filterOptions.status === 'Ignore') {
				// get every member of the club, plus every current covid survey
		} else {
			console.log('covid status filter specified');
			// only return surveys with a certain status
			if (filterOptions.status === 'All') {
				console.log('getting All surveys');
				surveyPromise = getSurveys();
			} else {
				console.log(`getting ${filterOptions.status} surveys`);
				surveyPromise = getSurveys({status: filterOptions.status});
			}
		}
		
		const [classResult, surveyResult] = await Promise.all([classPromise, surveyPromise]);
		// console.log('prepareFilters', classResult, surveyResult);

		let result;
		if (classResult.length === 0) {
			result= surveyResult;
		} else {
			// need to create a new list of all class members and their results
			result = classResult.map(g =>{
				// find a survey, if it exists
				const gymnast = surveyResult.find(s => s.memberEmail === g.memberEmail);
				if (gymnast) return gymnast; // found a match
				if (filterOptions.status !== 'All') {
					// return nothing. Looked for a person with a specific status, not there
					return null;
				} else {
					// return an empty(ish) row so the whole class list is visible
					return {
						memberName: g.memberName,
						memberEmail: g.memberEmail,
						_id: g._id,
						_owner: g._owner,
					};
				}
			});
		}

		$w('#repRegister').data = result;

	} catch (err) {
		console.error(err);
	}
}

export function repRegister_itemReady($item, itemData, index) {
	try {
		$item('#memberName').text = itemData.memberName || '';
		$item('#memberEmail').text = itemData.memberEmail;
		$item('#health').text = `Health: ${itemData.health || ''}`;
		$item('#status').text = `Status: ${itemData.status || ''}`;
		$item('#otherInformation').value = itemData.otherInformation
		$item('#details').onClick((event) => {
			wixLocation.to(`/registers/owner/${itemData._owner}`);
		})

		$item('#gymnastButton').onClick(async () => {
			expandCollapse($item('#gymnasts'));
			const gymnasts = (await getGymnasts(itemData._owner))
				.map(g => {return {gymnastFullName: g.gymnastFullName}});
			$item('#gymnasts').rows= gymnasts;	
		});

		// calculate the difference in hours from updated time to now
		const now = new Date();
		const created = new Date(itemData._createdDate);
		const elapsed = (now - created)/(1000 * 60 * 60 ) // ms -> hours
		
		if (elapsed <2) {
			$item('#lastUpdate').text = 'updated just now';	
		} else {
			if (isNaN(elapsed)) {
				$item('#lastUpdate').text = `No survey received`;
			} else {
				$item('#lastUpdate').text = `updated ${Math.floor(elapsed)} hours ago`;
			}
		}

		switch (itemData.health) {
			case 'PASS':
				$item('#box').style.backgroundColor = (itemData.status === 'Current') ? '#BDE8A2' : '#E8A425';
				break;
			case 'FAIL':
				$item('#box').style.backgroundColor = '#E09DAE';
				break;
			default:
				break;
		}
	} catch (err) {
		console.error(err);
	}

}

function expandCollapse(element) {
	if (element.collapsed) {
		element.expand();
	} else {
		element.collapse();
	}
}


export function optionsButton_click(event) {
	expandCollapse($w('#options'));
}

export function filterButton_click(event) {
	// Add your code for this event here: 
	// console.log($w('#classFilter').value, $w('#classFilter').selectedIndex);
	fetchRegisters();
	$w('#options').collapse();
}