// For full API documentation, including code examples, visit https://wix.to/94BuAAs
import {local, session} from 'wix-storage';
import wixWindow from 'wix-window';

$w.onReady(function () {
	displayNewSiteAnnouncement();
});

// check if the new site announcement has been shown 3 times already
// if not, show it and increment the cookie value
function displayNewSiteAnnouncement() {
	const NewSiteCookie = 'newSiteAnnouncementShown';
	const NewSiteAnnouncement = 'New Site Announcement';
	const MaxDisplays = 3;


	try {

		// check if the lightbox has been shown once already this _session_ (ie visit to the website)
		if (!session.getItem(NewSiteCookie)) {
			session.setItem(NewSiteCookie, 'yes');	// set the session flag so it won't be shown again

			// check how many times the lightbox has been shown altogether (localSettings this time)
			let count = parseInt(local.getItem(NewSiteCookie), 10) || 0;
			if (count < MaxDisplays) {
				wixWindow.openLightbox(NewSiteAnnouncement);	// asynchronous
				count++;
				local.setItem(NewSiteCookie, count);
			}		
		}
	} catch (err) {
		// do nothing
	}
}