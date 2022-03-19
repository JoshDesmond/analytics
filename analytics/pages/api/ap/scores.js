import Cors from 'cors';
import http from 'http';

// Initializing the cors middleware
const cors = Cors({
    methods: ['GET', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }

            return resolve(result);
        })
    })
}

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
export default async function handler(req, res) {
    // Run the middleware
    await runMiddleware(req, res, cors);

    const secret = process.env.AP_SECRET;
    if (req.query.key != secret) {
        res.status(401).end(`Incorrect Key ${secret}`);
    }

    console.log(req.body);
    const data = JSON.parse(req.body);
    const method = req.method;

    switch (method) {
        case 'POST':
            console.log(data);
            // TODO move data to database
            res.status(200).json(`Hello`);
            break
        case 'GET':
            // Get data from your database
            // TODO how to get params?
            res.status(200).json({ data: `Hello` });
            // res.status(200).json({ id, name: `User ${id}` })
            break
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}