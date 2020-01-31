'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT;
const app = express();
app.use(cors());

const locationHandler = require('./modules/location.js');
const weatherHandler = require('./modules/weather.js');
const moviesHandler = require('./modules/movie.js');
const yelpHandler = require('./modules/yelp');


app.get('/', (request, response) => {
  response.send('This still works!');
});


app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
//app.get('/eventful', eventfulHandler)
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);





// function moviesHandler(request, response){
//   let city = request.query.search_query;
//   const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${city}&page=1&include_adult=false`;

//   superagent.get(url)
//     .then(data => {
//       let movieData = data.body.results.map(city =>{
//         return new Movie(city);
//       });
//       response.status(200).json(movieData);
//     })
//     .catch(() => {
//       errorHandler('So sorry, the dwarves mined too deep and found the balrog.', request, response);
//     });
// }

// function Movie(city){
//   this.title = city.title,
//   this.overview = city.overview,
//   this.average_votes = city.vote_average,
//   this.total_votes = city.vote_count,
//   this.image_url = `https://image.tmdb.org/t/p/w500${city.poster_path}`,
//   this.popularity = city.popularity,
//   this.released_on = city.release_date;
// }

// function yelpHandler (request, response){
//   let city = request.query.search_query;
//   const url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
//   console.log('inside yelp handler');
//   superagent.get(url)
//     .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
//     // .set('Accept', 'application/json')
//     .then(data => {
//       let yelpData = data.body.businesses.map(city => {
//         return new Yelp(city);
//       });
//       console.log('yelp data', yelpData);
//       response.send(yelpData);
//     })
//     .catch(() => {
//       errorHandler('The kids tore the house down. Find a handy person on Yelp', request, response);
//     });
// }




// function Yelp(city){
//   this.name = city.name,
//   this.image_url = city.image_url,
//   this.price = city.price,
//   this.rating = city.rating,
//   this.url = city.url;
// }



app.listen(PORT, () => {
  console.log('Server up on: ', PORT);
});


// Error Handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}





