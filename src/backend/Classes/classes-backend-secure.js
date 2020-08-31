import wixData from 'wix-data';
import wixUsersBackend from 'wix-users-backend';
import {isRole, isAnyRole} from 'backend/Auth/auth-backend.jsw';
import {getGymnasts} from 'backend/Gymnasts/gymnasts-backend.jsw';
import {getMembersByEmail} from 'backend/Member/member-backend.jsw';

// Get all classes
export async function __getClasses() {

    if (await isAnyRole(['Club Staff'])){
        const result = await wixData.aggregate('GymnastClasses')
            .group('lessonFormat')
            .ascending('lessonFormat')
            .run();
        
        return result.items || [];
    } else {
        throw new Error('unauthorised');
    }
 
}

export async function __getClassGymnasts(className, dateRange = null) {
    // only coaches can use this
    if (!await isRole('Club Staff')) throw new Error('Unauthorised');

    // get all the gymnasts for the class. This returns the gymnast ID
    const classFilter=wixData.filter().eq('lessonFormat', className);
    const classResult = await wixData.aggregate('GymnastClasses')
        .filter(classFilter)
        .group('gymnastRegId')
        .run();    

    // now get the gymnast details from Gymnasts
    const gymnastList = classResult.items.map(f => f.gymnastRegId);
    const gymnasts = await wixData.query('Gymnasts')
        .hasSome('gymnastRegId', gymnastList)
        .find();
    
    // need to add the memberName to the resultset
    const memberEmails = gymnasts.items.map(g=>g.memberEmail);
    const members = await getMembersByEmail(memberEmails);

    const result = gymnasts.items.map(g =>{
        // lookup the memberName
        const member = members.find(m=>m.loginEmail === g.memberEmail) || {name:''};
        g.memberName = member.name;
        return g;
    });

    return result || [];
}