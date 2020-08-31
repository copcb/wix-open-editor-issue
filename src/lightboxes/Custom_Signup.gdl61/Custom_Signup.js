// For full API documentation, including code examples, visit https://wix.to/94BuAAs
import wixUsers from 'wix-users';

function isEmail(value) {
	const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(value);
}

function isRequired(value) {
	return (value !== '');
}

function isPhoneNumber(value) {
	const re = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/;
	return re.test(value);
}

function isComplexity(value) {
	// wix passwords must be 4-15 characters and contain no ascii
	// we will specify 8-15 characters and upper, lower and numeric
	const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/
	return re.test(value);
}

function validationHooks()  {
	$w('#email').onCustomValidation((value, reject) => {
		// value is required
		if (!isRequired(value)) return reject('Please enter a valid email');

		// value needs to be a valid email address
		if (!isEmail(value)) return reject('Email address is invalid. Please check and correct');
	});

	$w('#firstName').onCustomValidation((value, reject) => {
		// value is required
		if (!isRequired(value)) return reject('Please enter your first name');
	})

	$w('#lastName').onCustomValidation((value, reject) => {
		// value is required
		if (!isRequired(value)) return reject('Please enter your last name');
	})

	$w('#contactNumber').onCustomValidation((value, reject) => {
		// value is required
		if (!isRequired(value)) return reject('Please enter your contact number');
		
		// value needs to be a phone number
		if (!isPhoneNumber(value)) return reject('Phone number not recognised. Please check and correct');
	})

	$w('#password').onCustomValidation((value, reject) => {
		// value is required
		if (!isRequired(value)) return reject('Please enter a password');

		// value needs to meet complexity standard
		if (!isComplexity(value)) return reject('Passwords must be 8-15 characters and have upper, lower case and numbers')
	});
	
	$w('#repeatPassword').onCustomValidation((value, reject) => {
		// value is required
		if (!isRequired(value)) return reject('Please enter your password again');
		if (value !== $w('#password').value) return reject('Passwords do not match. Please check and try again')
	});
}

$w.onReady(function () {
	//TODO: write your page related code here...
	validationHooks();
});



export async function submit_click(event) {
	//Add your code for this event here: 
	const formFields = ['email', 'firstName', 'lastName','contactNumber', 'password', 'repeatPassword', 'terms', 'privacy'];

	try {
		$w('#submit').disable();
		$w('#error').hide();

		const toObject = (acc, cur) => {acc[cur] = $w(`#${cur}`).value;return acc;};
		const values = formFields.reduce(toObject, {});

		const isValid = formFields.every(f => {
			const field = $w(`#${f}`);
			if (!field.valid) {
				field.updateValidityIndication();
				$w('#error').text=field.validationMessage;
			}
			return field.valid;
		});

		if (isValid) {
			// register the user
			const RegistrationOptions = {
				contactInfo: {
					firstName: values.firstName,
					lastName: values.lastName,
					phones: [values.contactNumber],
				}
			};
			try {
				// console.log(values, RegistrationOptions);
				await wixUsers.register(values.email, values.password, RegistrationOptions)	

				// registered
				$w('#formGroup').hide();
				$w('#textAcknowledge').show();

			} catch (err) {
					const re = /member with email .* already exists in collection/
					if (re.test(err)) {
						$w('#error').text = 'That email address is already assigned to a club member.'
					} else {
						$w('#error').text = 'There was a problem with your request. Please try later\n' + err;
					}
					$w('#error').show();
			}
			

		} else {
			$w('#error').show();
		}

	} catch (err) {
	} 
	 finally {
		await $w('#submit').enable();
	}

}