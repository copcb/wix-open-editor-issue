// For full API documentation, including code examples, visit https://wix.to/94BuAAs
import wixUsers from 'wix-users';
import wixData from 'wix-data';

 $w.onReady(async function () {

	// get the current user's name
	wixData.query("Members/PrivateMembersData")
  		.eq("_id", wixUsers.currentUser.id)
  		.find()
  		.then(result => {
			  $w('#memberName').text = (result.items[0].name);
  		} );
});

export async function submit_click(event) {
	// Add your code for this event here: 

	const formFields = ['temperature','cough','taste','contact', 'travel','otherCondition','otherInformation','accept'];
	
	try {
		$w('#submit').disable();
		$w('#error').hide();

		const toObject = (acc, cur) => {
			const obj =$w(`#${cur}`);
			acc[cur] = obj.type ==='$w.Checkbox' ? obj.checked : obj.value;
			return acc;
		};
		const values = formFields.reduce(toObject, {});

		const isValid = formFields.every(f => {
			const field = $w(`#${f}`);
			if (!field.valid) {
				field.updateValidityIndication();
				$w('#error').text=field.validationMessage;
			}
			return field.valid;
		});

		// console.log($w('#temperature').type);

		if (isValid) {
			// register the questionnaire
			const data = {
				temperature: values.temperature,
				cough: values.cough,
				taste: values.taste,
				contact: values.contact,
				travel:values.travel,
				otherCondition: values.otherCondition,
				otherInformation: values.otherInformation,
				memberName: $w('#memberName').text,
				memberEmail: await wixUsers.currentUser.getEmail()
			};
			// console.log(values,data);
			
			try {
				await wixData.insert('CovidSurvey', data);	

				$w('#formGroup').hide();

				const isAtRisk = values.temperature || values.cough || values.taste || values.contact || values.travel;
				if (isAtRisk) {
					$w('#ackPositive').show()
				} else {
					$w('#ackNegative').show();
				}

			} catch (err) {
				console.log(err);
				$w('#error').text = err.toString();
				$w('#error').show();	
			}
			
		} else {
			$w('#error').show();
		}


	} catch (err) {
	} 
	 finally {
		// enable the submit button
		$w('#submit').enable();
	}
}

export function dTemperature_change(event) {
	// Add your code for this event here: 
	// console.log(event);
}