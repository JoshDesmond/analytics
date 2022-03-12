import * as Dotenv from 'dotenv';
import fetch from 'node-fetch';

Dotenv.config();


export default class RescueTime {
    constructor() {
        const key = process.env.RT_API_KEY;
        const perspective = "interval"; // otherwise interval
        const day = new Date();
        const dayString = day.toISOString().slice(0, 10);

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

    }
}
