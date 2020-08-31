//Read Our Wix Router API here  http://wix.to/94BuAAs/wix-router.html 

import {ok, notFound, forbidden, WixRouterSitemapEntry} from "wix-router"; 
import wixData from 'wix-data';
import wixUsersBackend from 'wix-users-backend';

function registers_ApplyRoute(subPage, ownerId) {
   switch (subPage.toLowerCase()) {
      case 'owner':
         return ok('Registers By Member', ownerId);
         break;

      case 'my-register':
         // console.log('my-register', wixUsersBackend.currentUser.id);
         return ok('Registers By Member', wixUsersBackend.currentUser.id);
         break;

      default:
         return notFound();
         break;
   }
}

export async function registers_Router(request) {
   // you have to be logged in to see registers at all
   if (!wixUsersBackend.currentUser.loggedIn){ 
      // console.log('registers_Router: User not logged in!');
      return forbidden();
   }

   // Get the sub-page
   const subPage = request.path[0];

   // Get ownerId name from URL request
   const ownerId = request.path[1];

   // console.log('in registers_Router', subPage, ownerId)

   try {
      // confirm the id is a valid ownerId
      //const data = await wixData.get('Members/PrivateMembersData',ownerId);

      // Render item page 
      return registers_ApplyRoute(subPage, ownerId);

   } catch (err) {
      console.error(err);
      
      // Return 404 if item is not found 
      return notFound();

   }

   /*
    // Get the item data by name
   const data = peopleData[name];

   if (data) {

   	   // Define SEO tags 
	   const seoData = { 
		   title: data.title, 
		   description: "This is a description of " + data.title + " page",
		   noIndex: false,
		   metaTags: {
		      "og:title": data.title,
		      "og:image": data.image
		   }
 	   };

   }
   */

}

export function registers_SiteMap(sitemapRequest) {

   /*
   // Convert the data to site map entries
   const siteMapEntries = Object.keys(peopleData).map((name)=>{
                               const data= peopleData[name];
                               const entry = new WixRouterSitemapEntry(name);
                               entry.pageName = "registers-page";		// The name of the page in the Wix editor to render
                               entry.url = "/registers/" + name ;			// Relative URL of the page
                               entry.title = data.title;						// For better SEO - Help Google
                               return entry;
                              });

   */

    // Return the site map entries
    return [];
}