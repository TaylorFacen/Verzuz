// Checks to see if a user is authenticated for the selected battle and parses their profile info

export default battleId => {
    const verzuzCookieQuery = document.cookie.split(';').filter(c => c.substr(0, 6) === 'verzuz');

    if ( verzuzCookieQuery.length === 1) {
        const verzuzCookie = verzuzCookieQuery[0].split('=')[1];
        const cookieData = JSON.parse(decodeURI(verzuzCookie));

        if ( cookieData.battleId === battleId ) {
            return {
                hasAccess: true,
                data: cookieData
            }
        } else {
            // User was authenticated for another battle, and needs to authenticate for this one
            return {
                hasAccess: false
            }
        }
    } else {
        return {
            hasAccess: false
        }
    }
}