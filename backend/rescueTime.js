import * as Dotenv from 'dotenv';
import fetch from 'node-fetch';

Dotenv.config();

const key = process.env.RT_API_KEY;
const perspective = "interval"; // otherwise interval
const day = new Date();
const dayString = day.toISOString().slice(0, 10);


const apiString = `https://www.rescuetime.com/anapi/data?key=${key}&by=${perspective}&rk=productivity&interval=day&restrict_begin=${dayString}&format=json`;

export async function getScore() {
    const response = await fetch(apiString);
    return await response.json();
}

getScore().then(res => {
    console.log(res);
});