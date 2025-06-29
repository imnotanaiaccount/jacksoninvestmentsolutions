// netlify/functions/submit-to-n8n.js
const fetch = require('node-fetch'); // For making HTTP requests in Node.js

exports.handler = async function(event, context) {
    // Ensure this is a POST request and it's from a form submission
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    // Netlify Forms parse the submission data into event.body
    // It's typically URL-encoded. You'll need a utility to parse it.
    // For simple form submissions, it often comes as key=value&key2=value2
    // We need to parse this into a JSON object.
    const submittedData = new URLSearchParams(event.body);
    const payload = {};
    for (const [key, value] of submittedData.entries()) {
        payload[key] = value;
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL; // Get URL from Netlify Environment Variable

    if (!n8nWebhookUrl) {
        console.error('N8N_WEBHOOK_URL environment variable is not set!');
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server configuration error: N8n URL missing.' })
        };
    }

    try {
        // Send the form data to your n8n webhook
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Send as JSON to n8n
            },
            body: JSON.stringify(payload) // Send the parsed form data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error sending data to n8n:', response.status, errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ message: 'Failed to send data to automation service.' })
            };
        }

        // Optionally, you can get a response from n8n and send it back to the client
        // const n8nResponse = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Form submitted and sent to automation successfully!' })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error during form processing.' })
        };
    }
};
