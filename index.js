require('dotenv').config()

const { readInput, inquirerMenu, pause, listPlaces } = require("./helpers/inquirer");
const Searches = require("./models/searches");

const main = async () => {

    let option;
    const searches = new Searches();

    do {
        option = await inquirerMenu();

        switch (option) {
            case 1:
                //Show message
                const searchTerm = await readInput('Type a city: ');
                //Search the places that match user's input
                const places = await searches.city(searchTerm);

                //Choose the place
                const chosenPlaceId = await listPlaces(places);
                if(chosenPlaceId === '0') continue;

                const chosenPlace = places.find(place => place.id === chosenPlaceId);
                //Store in DB
                searches.addHistory(chosenPlace.name);
                //Weather
                const weather = await searches.getPlaceWeather(chosenPlace.lat, chosenPlace.lng);
                //Show Results
                console.log('\nCity info\n'.green);
                console.log('City: ', chosenPlace.name);
                console.log('Lat: ', chosenPlace.lat);
                console.log('Lng: ', chosenPlace.lng);
                console.log('Temperature: ', weather.temp);
                console.log('Minimum: ', weather.min);
                console.log('Maximum: ', weather.max);
                console.log('Weather is: ', weather.desc);
                break;

            case 2:
                searches.capitalizedHistory.forEach((place, index) => {
                    const idx= `${index + 1}.`.green;
                    console.log(`${idx} ${place} ` );
                })
                break;
        }
        if (option !== 0) await pause();
    } while (option !== 0);
}

main();