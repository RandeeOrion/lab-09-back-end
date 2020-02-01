
'use strict';


console.log('location.js is running');

const superagent = require('superagent');
const express = require('express');
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);

const app = express();
app.get('/location', locationHandler);

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
              console.log('in superagent');
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

// Error Handler
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = locationHandler;


client.connect()
  .catch(err => {
    console.error('pg connect error', err);
  });

module.exports = locationHandler;
