'use strict';

const superagent = require('superagent');
// const express = require('express');
module.exports = weatherHandler;

// const app = express();
// app.get('/weather', weatherHandler);

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

function Weather(day){
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

