const fs = require('fs');

const axios = require('axios');

class Searches {
    history = [];
    dbPath = './db/database.json';

    constructor () {
        //Read DB if exists
        this.readDB();
    }

    get capitalizedHistory() {
        //Capitalize each word
        return this.history.map( place =>{
            let words = place.split(' ');
            words = words.map(word => word[0].toUpperCase() + word.substring(1));

            return words.join(' ');
        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit' : 5,
            'language' : 'es'
        }
    }

    get weatherParams() {
        return {
            'appid' : process.env.OPENWEATHER_KEY,
            'units' : 'metric'
        }
    }

    async city (place = '') {

        try {
            //HTTP petition

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
                params: this.paramsMapbox
            })

            const response = await instance.get();

            return response.data.features.map( place => ({
                id: place.id,
                name: place.place_name,
                lng: place.center[0],
                lat: place.center[1],
            }));

             //Return the places that match user's input
        } catch (error) {
            return [];
        }
    }

    async getPlaceWeather(lat, lon) {
        try {
            
            //Create axios instance axios.create()

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.weatherParams, lat, lon}
            })
            const response = await instance.get();

            const {weather, main} = response.data;
            // with the reponse we need to extract data
            //console.log(response.data);
            //return description
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }
    }

    addHistory (place = '') {
        //Prevent duplicates

        if(this.history.includes(place.toLocaleLowerCase())) {
            return;
        }

        this.history = this.history.splice(0, 5);
        this.history.unshift(place.toLocaleLowerCase());

        //Store in DB
        this.saveDB();
    }

    saveDB() {
        const payload = {
            history: this.history
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    readDB() {
        //Verify it exists ...

        if(!fs.existsSync(this.dbPath)) return ;
        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        const data = JSON.parse(info);
        this.history = data.history;
    }

}

module.exports = Searches;