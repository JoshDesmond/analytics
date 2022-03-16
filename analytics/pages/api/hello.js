// import * as Dotenv from 'dotenv';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// Dotenv.config();

class RescueTime {
    constructor() {
        this.last_time = 0;
    }

    async getScores() {
        // Use cached result if queuried within last 20 minutes
        const TWENTY_MINS = 20 * 60 * 1000;
        const curr_time = new Date();
        if (curr_time - this.last_time < TWENTY_MINS) {
            console.log(`Using cached data: ${this._cachedScores}`);
            return this._cachedScores;
        }

        // Generate api string
        const key = process.env.RT_API_KEY;
        const perspective = "interval";
        const day = new Date();
        day.setHours(day.getHours() - 4); // TODO find a better solution for timezones
        const dayString = day.toISOString().slice(0, 10);
        this.apiString = `https://www.rescuetime.com/anapi/data?key=${key}&by=${perspective}&rk=productivity&interval=day&restrict_begin=${dayString}&format=json`;

        // Fetch new data from RescueTime
        console.log(`Fetching with api string: ${this.apiString}`);
        const response = await fetch(this.apiString);
        console.log(`fetch result: ${response}`); // TODO temp
        this.last_time = new Date();
        if (!response) { throw new Error(`RescueTime API fetch failed with respose: ${response}`) }
        this._cachedScores = await response.json();
        return this._cachedScores;
    }


    /**
     * 
     * @param {Object} data The JSON data returned by a productivity restricted interval query to RT
     * @returns {Number} The productivity pulse, a number between 0-100
     */
    _calculateProductivityPulse(data) {
        if (!data) throw new TypeError(`Illegal data argument: ${data}`);
        let weighted_total = 0;
        let total = 0;
        for (let i = 0; i < data.rows.length; i++) {
            const time = data.rows[i][1];
            const prod = data.rows[i][3];
            if (prod >= 2 && prod <= -2) console.error(`Prod value ${prod} out of bounds`);
            if (typeof time !== 'number') throw new TypeError(`Unexpected type ${typeof time} expected a number: ${time}`);
            total += time;
            weighted_total += time * (prod + 2);
        }

        return weighted_total / (total * 4) * 100;
    }
}

const rt = new RescueTime();

export default async function handler(req, res) {
    try {
        const data = await rt.getScores();
        console.log(`fetched result from api: ${data}`);
        const score = rt._calculateProductivityPulse(data);
        console.log(`Productivity Pulse: ${score}`);
        res.status(200).send(score);
    } catch (err) {
        res.status(500).send({ error: `failed to load data with error: ${err}` })
    }
}