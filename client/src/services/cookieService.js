// Checks to see if a user is authenticated for the selected battle and parses their profile info

export default {
    parseCookie: battleId => {
        const verzuzCookieQuery = document.cookie.split(';').filter(c => c.trim().substr(0, 6) === 'verzuz');

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
    },
    removeCookie: async () => {
        document.cookie = "verzuz=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    },

    setCookie: async (battleId, userId, userType) => {
        const expirationDate = new Date(Date.now() + 86400e3).toUTCString();
        const cookieData = JSON.stringify({
            userType,
            userId,
            battleId
        });
        const uriEncodedCookieData = encodeURI(cookieData);
        document.cookie = `verzuz=${uriEncodedCookieData}; expires=${expirationDate}; path=/;`;

        return uriEncodedCookieData
    }
}