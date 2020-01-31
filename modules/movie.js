'use strict';

const superagent = require('superagent');

module.exports = moviesHandler;



function moviesHandler(request, response){
  let city = request.query.search_query;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${city}&page=1&include_adult=false`;

  superagent.get(url)
    .then(data => {
      let movieData = data.body.results.map(city =>{
        return new Movie(city);
      });
      response.status(200).json(movieData);
    })
    .catch(() => {
      errorHandler('So sorry, the dwarves mined too deep and found the balrog.', request, response);
    });
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

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

