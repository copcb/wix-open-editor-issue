import {isRole} from 'backend/Auth/auth-backend.jsw';
import wixData from 'wix-data';

export async function __getGymnasts() {
    // only coaches can view general gymnast data
    if (!await isRole('Club Staff')) throw new Error('Unauthorised');
    
    try {
    const result = wixData.query('Gymnasts')
        .find();

    return result.items || [];
        
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
}