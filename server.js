'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT;
const app = express();
app.use(cors());


app.get('/', (request, response) => {
  response.send('This still works!');
});


app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
//app.get('/eventful', eventfulHandler)
app.get('/movies', moviesHandler);

//Location Handler Function
function locationHandler(request, response){
  let sql = 'SELECT * FROM location WHERE search_query=$1;';
  console.log('inside locationHandler');
  client.query(sql,[request.query.city])
  // console.log('sql = ', sql)
  // console.log('request = ', request.query.city)
  // console.log('SQL console', client.query(sql,request.query.city))
    .then(result => {
      console.log('sucuessful quiry', result.rows);
      if (result.rows.length > 0) {
        console.log('found the city in the database');
        response.send(result.rows[0]);
      } else{ console.log('no city in database headed to superLena');
        try{
          let city = request.query.city;
          console.log('city', request.query, city);
          let key = process.env.GEOCODE_API_KEY;
          const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
          console.log('hi', url);

          superagent.get(url)
            .then(data => {
              console.log('in supperagent');
              const geoData = data.body[0];
              // console.log('city and geoData', city, geoData);
              const location = new Location(city, geoData);
              console.log('location inside superagent: ', location);
              let apiToSql = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
              let safeValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];
              client.query(apiToSql, safeValues);
              response.send(location);
            })
            .catch(() => {
              errorHandler('location superagent broke', request, response);
            });
        }
        catch(error){
          errorHandler(error, request, response);
        }
      }
    });
}

// Location Constructor
function Location(city, geoData){
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function weatherHandler(request, response) {
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

  superagent.get(url)
    .then(data => {
      const weatherSummaries = data.body.daily.data.map(day =>{
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch(()=>{
      errorHandler('So sorry, something went wrong. Blame the elves.', request, response);
    });
}



function moviesHandler(request, response){
  console.log('inside movie handler');
  let city = request.query.search_query;
  console.log(city);
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${city}&page=1&include_adult=false`;

  superagent.get(url)
    .then(data => {
      let movieData = data.body.results.map(city =>{
        return new Movie(city);
      });
      console.log('movie data = ', movieData);
      response.status(200).json(movieData);
    })
    .catch(() => {
      errorHandler('So sorry, the dwarves mined too deep and found the balrog.', request, response);
    });
}



function Weather(day){
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}

function Movie(city){
  this.title = city.title,
  this.overview = city.overview,
  this.average_votes = city.vote_average,
  this.total_votes = city.vote_count,
  this.image_url = `https://image.tmdb.org/t/p/w500${city.poster_path}`,
  this.popularity = city.popularity,
  this.released_on = city.release_date;
}



client.connect()
  .then( ()=>{
    app.listen(PORT, () => {
      console.log('Server up on: ', PORT);
    });
  })
  .catch(err => {
    console.error('pg connect error', err);
  });


// Error Handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}




// Location {
//   search_query: 'seattle',
//   formatted_query: 'Seattle, King County, Washington, USA',
//   latitude: '47.6038321',
//   longitude: '-122.3300624'