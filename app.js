const path = require('path');
const express = require('express');
const app = express();
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(bodyParser.json(), bodyParser.urlencoded());

app.set('view engine', 'html');
var env = nunjucks.configure('views', {noCache: true});
app.engine('html', nunjucks.render);

// and then include these two lines of code to add the extension:
var AutoEscapeExtension = require("nunjucks-autoescape")(nunjucks);
env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(env));

// servers the public directory with all the stylesheets.
// app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));

//***ROUTE DEFINITIONS */
const wikiRouter = require('./routes/wiki');
const userRouter = require('./routes/user');
// const routes = require('./routes');
const models = require('./models/')

// middleware for the route root
app.use('/wiki', wikiRouter);
app.use('/users', userRouter);

app.get('/', function (req, res) {
    
});

app.use(function(err, req, res, next) { //error-handling middleware
  res.status(err.status || 500);
  console.error(err);
  res.render('error', { error: err });
});

models.db.sync()
.then(function() {
  app.listen(3000, function () {
    console.log('Server is listening on port 3000!');
  });
})
.catch(function(err, req, res, next) {
  next(err);
})

