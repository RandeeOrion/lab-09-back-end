'use strict';

const superagent = require('superagent');

module.exports = yelpHandler;


function yelpHandler (request, response){
  let city = request.query.search_query;
  const url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
  console.log('inside yelp handler');
  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    // .set('Accept', 'application/json')
    .then(data => {
      let yelpData = data.body.businesses.map(city => {
        return new Yelp(city);
      });
      console.log('yelp data', yelpData);
      response.send(yelpData);
    })
    .catch(() => {
      errorHandler('The kids tore the house down. Find a handy person on Yelp', request, response);
    });
}




function Yelp(city){
  this.name = city.name,
  this.image_url = city.image_url,
  this.price = city.price,
  this.rating = city.rating,
  this.url = city.url;
}


function errorHandler(error, request, response) {
  response.status(500).send(error);
}
