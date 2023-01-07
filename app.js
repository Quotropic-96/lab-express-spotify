require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  
  // Retrieve an access token
  spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:
app.get('/', (req, res, next) => {
    res.render('index');
});

app.get('/artist-search', (req, res, next) => {
  const { artist } = req.query;
  spotifyApi
    .searchArtists(artist)
    .then(data => {
      const results = data.body.artists.items.map(result => {
        let {
          id,
          images,
          name
        } = result;
        if (images[0] === undefined){
          return {artist: name, img: 'https://www.ioshacker.com/wp-content/uploads/2018/11/Spotify-feat.jpg', id: id};
        } else {
          return {artist: name, img: images[0].url, id: id};
        }
      });
      res.render('artist-search-results', {results});
    })
    .catch(err => console.log('The error while searching artists occurred: ', err));
});

app.get('/albums/:artistId', (req, res, next) => {
  const { artistId } = req.params;
  spotifyApi
    .getArtistAlbums(artistId)
    .then(data => {
      const results = data.body.items.map(result => {
        let {
          name,
          artists,
          images,
          id
        } = result;
        return {artist: artists[0].name, img: images[0].url, title: name, id: id};
      });
      res.render('album-list', {results, artist: results[0].artist});
    })
    .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.get('/tracks/:albumId/:albumTitle', (req, res, next) => {
  const { albumId, albumTitle } = req.params;
  spotifyApi
    .getAlbumTracks(albumId)
    .then(data => {
      const results = data.body.items.map(result => { 
        let {
          name,
          preview_url
        } = result;
        return {name, preview_url};
      });
      res.render('track-list', {results, albumTitle});
    })
    .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
