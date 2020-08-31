import wixData from 'wix-data';
// For full API documentation, including code examples, visit https://wix.to/94BuAAs

$w.onReady(function () {
	//TODO: write your page related code here...
});

async function validateAndSubmitForm() {
	try {
		$w('#textError').hide();
		$w('#textAcknowledge').hide();
		$w('#buttonSubmit').disable();

		// formFields are the required items.
		const formFields = ['inputEmail', 'inputParentName', 'inputContactNumber', 'inputAddress', 'inputGymnastName', 'inputGymnastDateOfBirth', 'inputTerms'];

		const isValid = formFields.every(input => {
			const ref = $w(`#${input}`);
			if (!ref.valid) {
				// console.log(`${input} fails validation`);
				ref.updateValidityIndication();					
			}
			return ref.valid;
		});

		if (isValid) {
			const newRequest = {
				email: $w('#inputEmail').value,
				parentName: $w('#inputParentName').value,
				contactNumber: $w('#inputContactNumber').value,
				address: $w('#inputAddress').value,
				emergencyContactName: $w('#inputEmergencyName').value,
				emergencyContactNumber: $w('#inputEmergencyNumber').value,
				gymnastName: $w('#inputGymnastName').value,
				gymnastDateOfBirth: $w('#inputGymnastDateOfBirth').value,
				gymnastPreviousExperience: $w('#inputPriorExperience').value,
				gymnastAllergies: $w('#inputAllergies').value,
				gymnastMedical: $w('#inputMedical').value,
			};
			await wixData.insert('Trials', newRequest);
			$w('#textError').hide();
			$w('#formGroup').hide();
			$w('#textAcknowledge').show();
		} else {
			// console.log('showing the error message');
			$w('#textError').show();
			// $w('#textAcknowledge').hide();
		}
		
	} catch (err) {
		// console.log('error!');
		console.log(err);
	} 
	 finally {
		// console.log('enabling the submit button');
		$w('#buttonSubmit').enable();

	}

}


export function buttonSubmit_click() {
	//Add your code for this event here: 
	validateAndSubmitForm();
}