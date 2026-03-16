exports.handler = async function () {
    const baseUrl = process.env.RSVP_DASHBOARD_URL;
    const key = process.env.RSVP_DASHBOARD_KEY;

    if (!baseUrl || !key) {
        return {
            statusCode: 500,
            body: 'Faltan variables de entorno del dashboard RSVP'
        };
    }

    return {
        statusCode: 302,
        headers: {
            Location: `${baseUrl}?key=${encodeURIComponent(key)}`
        },
        body: ''
    };
};