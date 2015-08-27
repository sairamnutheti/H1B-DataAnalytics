
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', user.home);
app.get('/index', user.home);
app.get('/getlist',user.getList);
app.get('/getCompanyDataForTable',user.getCompanyDataForTable);
app.get('/companydata',user.rendergetCompanyDataForTable);
app.get('/home',user.home);
app.get('/location',user.location);
app.get('/getPredictiveData',user.getPredictiveData);
app.get('/topFiveH1BSponsorers',user.topFiveH1BSponsorers);
app.get('/data',user.getdata);
app.get('/yearlydata',user.renderYearlyData);
app.get('/states',user.getStates);
app.get('/predict',user.renderPredictive);
//app.get('/users', user.list);
//app.post('/jsontest',user.jsontest);
//app.post('/values',user.getValues);
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
