import * as Dotenv from 'dotenv';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

Dotenv.config();

class RescueTime {
    constructor() {
        const key = process.env.RT_API_KEY;
        const perspective = "interval"; // otherwise interval
        const day = new Date();
        const dayString = day.toISOString().slice(0, 10);

        // TODO cache api result if time hasn't changed much since last call

        this.apiString = `https://www.rescuetime.com/anapi/data?key=${key}&by=${perspective}&rk=productivity&interval=day&restrict_begin=${dayString}&format=json`;
    }

    async getScore() {
        const response = await fetch(this.apiString);
        return await response.json();
    }

    /**
     * 
     * @param {Object} data The JSON data returned by a productivity restricted interval query to RT
     * @returns {Number} The productivity pulse, a number between 0-100
     */
    _calculateProductivityPulse(data) {
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
        console.log("Hello");
        rt.getScore().then(result => {
            res.status(200).send(rt._calculateProductivityPulse(result));
        });
    } catch (err) {
        res.status(500).send({ error: 'failed to load data' })
    }
}