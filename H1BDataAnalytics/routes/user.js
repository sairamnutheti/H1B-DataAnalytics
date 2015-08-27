var MongoClient = require('mongodb').MongoClient;
var jQuery=require('./jquery');
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.home=function(req,res){
	
	res.render('Home');
};

exports.location=function(req,res)
{
	res.render('Location');
};


////////// To get the predictive data....//////////
var findPredictiveData = function (obj) {
	return Object.prototype.toString.call(obj) === "[object Array]";
},
getNumWithSetDec = function( num, numOfDec ){
	var pow10s = Math.pow( 10, numOfDec || 0 );
	return ( numOfDec ) ? Math.round( pow10s * num ) / pow10s : num;
},
getAverageFromNumArr = function( numArr, numOfDec ){
	if( !findPredictiveData( numArr ) ){ return false;	}
	var i = numArr.length, 
		sum = 0;
	while( i-- ){
		sum += numArr[ i ];
	}
	return getNumWithSetDec( (sum / numArr.length ), numOfDec );
},
getVariance = function( numArr, numOfDec ){
	if( !findPredictiveData(numArr) ){ return false; }
	var avg = getAverageFromNumArr( numArr, numOfDec ), 
		i = numArr.length,
		v = 0;
 
	while( i-- ){
		v += Math.pow( (numArr[ i ] - avg), 2 );
	}
	v /= numArr.length;
	return getNumWithSetDec( v, numOfDec );
},
getStandardDeviation = function( numArr, numOfDec ){
	if( !findPredictiveData(numArr) ){ return false; }
	var stdDev = Math.sqrt( getVariance( numArr, numOfDec ) );
	return getNumWithSetDec( stdDev, numOfDec );
};
function getPredictiveNumber(results)
{
	var precision=0;
	results.lastYear=getStandardDeviation(results,precision);
}

exports.rendergetCompanyDataForTable=function(req,res)
{
	res.render('CompanywiseH1Data');
};

exports.renderYearlyData=function(req,res)
{
	res.render('yearlydata');
};

exports.renderPredictive=function(req,res){
	
	res.render('predictive');
};
	
exports.getList=function(req,res){

	MongoClient.connect("mongodb://admin:admin@ds045011.mongolab.com:45011/mydb", function(err, db) {
		  if(err) { return console.dir(err); }
		
		  var collection = db.collection('data');
		  collection.find({}).toArray(function(err, docs) {
			 //assert.equal(2, docs.length);
			  console.dir(docs[0]);
		        res.send(jsonFormat(docs));
		    });
	});
};




/////////////////// Table data by H1B Count,Location ,State and Company so that we can filter it in table.////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------///
exports.getCompanyDataForTable=function(req,res){
	
	MongoClient.connect("mongodb://admin:admin@ds045011.mongolab.com:45011/mydb", function(err, db) {
		  if(err) { return console.dir(err); }
		  var collection = db.collection('data');
		  console.log("In func");
		  console.log("sending to parser before");
		  collection.aggregate([
		                        {        
		                            $group: {
		                               _id: {
		                                       Company:"$LCA_CASE_EMPLOYER_NAME",
		                                       Location:"$LCA_CASE_WORKLOC1_CITY",
		                                       State:"$LCA_CASE_WORKLOC1_STATE",
		                                       Year:{$substr:["$LCA_CASE_SUBMIT",6,10]}
		                                   },         
		                               count: { $sum: 1 }
		                            },
		                         },
		                          { $sort: { count: -1 } },
		                          { $limit :30000 }
             ]).toArray(function(err, docs) {
		              			 //assert.equal(2, docs.length);
		             			//  console.log(JSON.stringify(docs));
            	 if(err){
            		 console.log(err);
            	 }
            	 else{
            	  console.log("sending to parser before");
          		//console.log(JSON.Stringify(docs));    		      
            	 res.send(jsonFormat(docs));
            	 } });
	});
};


/////////////////// Max Wage rate group by ,location based on user inputed JOB Title ////////////////////////////////////
//Can use this for both Maximum Salary and Average Salary----------------------------------------------
//-----------------------------------------------------------------------------------------------------------///
exports.getMaxWageRateByLocation=function(req,res){
	
	MongoClient.connect("mongodb://admin:admin@ds045011.mongolab.com:45011/mydb", function(err, db) {
		  if(err) { return console.dir(err);}
		  var collection = db.collection('data');
		  console.log("In func");
		var jobTitle=req.param("jobTitle");
		  
		  
		  collection.aggregate([
		                        {$match: {LCA_CASE_JOB_TITLE:jobTitle}},
		                        { $group: {
		                            _id: {
		                                    Company :"$LCA_CASE_EMPLOYER_NAME",
		                                    Location : "$LCA_CASE_EMPLOYER_CITY"

		                                },         
		                          Avg_Salary: { "$avg": "$LCA_CASE_WAGE_RATE_FROM" },
		                      }},
		                      {$sort:{Avg_Salary:-1}}
           ]).toArray(function(err, docs) {
		              			 //assert.equal(2, docs.length);
		             			  //console.log(JSON.stringify(docs));
		             		       res.send(jsonFormat(docs));
		             		    });
	});
};
//Redundancy
/////////////////// Avg Wage rate,location based on user inputed JOB Title ////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------///
exports.getAvgWageRateByLocation=function(req,res){
	
	MongoClient.connect("mongodb://admin:admin@ds045011.mongolab.com:45011/mydb", function(err, db) {
		  if(err) { return console.dir(err); }
		  var collection = db.collection('data');
		  console.log("In func");
		var jobTitle=req.param("jobTitle");
		 
		  collection.aggregate([
		                        
		                        {$match: {LCA_CASE_JOB_TITLE:jobTitle}},
		                        { $group: {
		                            _id: {
		                                    Work_Location :"$LCA_CASE_WORKLOC1_CITY"
		                                },         
		                          Avg_Salary: { "$avg": "$LCA_CASE_WAGE_RATE_FROM" }
		                          
		                      }
		                      },
		                      {$sort:{Avg_Salary:-1}},
		                      {$limit:100}
         ]).toArray(function(err, docs) {
		              			 //assert.equal(2, docs.length);
		             			  console.log(JSON.stringify(docs));
		             		       res.send(jsonFormat(docs));
		             		    });
	});
};

/////////////////// Hourly rate,location,State based on user inputed JOB Title ////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------///
exports.getHourlyRateByLocation=function(req,res){
	
	MongoClient.connect("mongodb://admin:admin@ds045011.mongolab.com:45011/mydb", function(err, db) {
		  if(err) { return console.dir(err); }
		  var collection = db.collection('data');
		  console.log("In func");
var jobTitle=req.param("jobTitle");
		  
		  collection.aggregate([
		                        {$match: {LCA_CASE_JOB_TITLE:jobTitle}},
		                        { $group: {
		                            _id: {
		                                    Work_Location :"$LCA_CASE_WORKLOC1_CITY",
		                                    State:"$LCA_CASE_WORKLOC1_STATE",
		                                    Salary :"$LCA_CASE_WAGE_RATE_FROM"
		                                },         
		                         }
		                     },
		                     { $project: { HourlyRate: { "$divide": [ "$_id.Salary", 2080 ] } } }
		                      
       ]).toArray(function(err, docs) {
		              			 //assert.equal(2, docs.length);
		             			  console.log(JSON.stringify(docs));
		             		       res.send(jsonFormat(docs));
		             		    });
	});
};

/////////////////// TOP 5 Companies who sponsers max H1b////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------///
exports.topFiveH1BSponsorers=function(req,res){
	
	MongoClient.connect("mongodb://admin:admin@ds045011.mongolab.com:45011/mydb", function(err, db) {
		  if(err) { return console.dir(err); }
		  var collection = db.collection('data');
		  console.log("In func");
		  
		  collection.aggregate([

		                          { $group: {
		                               _id: {
		                                       Company:"$LCA_CASE_EMPLOYER_NAME",
		                                       Dates: {$substr:["$LCA_CASE_SUBMIT",6,10]},
		                                   },         
		                               count: { $sum: 1 },
		                            },},
		                          { $sort: {count:-1,Dates:-1} },{$limit:100}

     ]).toArray(function(err, docs) {
		              			 //assert.equal(2, docs.length);
		             			  console.log(JSON.stringify(docs));
								  res.send(jsonFormat(docs));
		             		    });
	});
};


/////////////////// Year Wise H1B sponsoring data by Company name////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------///
exports.getPieChartData=function(req,res){
	
	MongoClient.connect("mongodb://admin:admin@ds045011.mongolab.com:45011/mydb", function(err, db) {
		  if(err) { return console.dir(err); }
		  var collection = db.collection('data');
		  console.log("In func");
		var company=req.param("company");
		 		  
		  collection.aggregate([

		                        { $match:{LCA_CASE_EMPLOYER_NAME:company}},
		                        { $group: {
		                               _id: {
		                                       Company:"$LCA_CASE_EMPLOYER_NAME",
		                                       Dates: {$substr:["$LCA_CASE_SUBMIT",6,10]},
		                                   },         
		                               count: { $sum: 1 },
		                               Average_Sal:{"$avg": "$LCA_CASE_WAGE_RATE_FROM"},
		                            },},
		                          { $sort: {Dates:-1} }
   ]).toArray(function(err, docs) {
		              			 //assert.equal(2, docs.length);
		             			  console.log(JSON.stringify(docs));
								res.send(jsonFormat(docs));
		             		    });
	});
};



exports.getPredictiveData=function(req,res){
	
	MongoClient.connect("mongodb://admin:admin@ds045011.mongolab.com:45011/mydb", function(err, db) {
		  if(err) { return console.dir(err); }
		  var collection = db.collection('data');
		  var title=req.param("title");
		  console.log("In func");
		  collection.aggregate([
		                        {$match: {LCA_CASE_JOB_TITLE:title}},
		                        { $group: {
		                            _id: {
		                                    LCA_CASE_WORKLOC1_CITY :"$LCA_CASE_WORKLOC1_CITY",
		                                    LCA_CASE_WAGE_RATE_FROM :"$LCA_CASE_WAGE_RATE_FROM"
		                                },         
		                          Avg_Salary: { "$avg": "$LCA_CASE_WAGE_RATE_FROM" },
		                          
		                      }
		                      },
		                     
		                      {$limit:100}
             ]).toArray(function(err, docs) {
		              			 //assert.equal(2, docs.length);
		             			 // console.log(JSON.stringify(docs));
            	 				
            	 docs=findPredictiveData(docs);
		             		       res.send(jsonFormat(docs));
		             		    });
	});


	
};

function jsonFormat(results) {
	var reqJson = '[';
	var jsonLength = results.length;
	var idLength = Object.keys(results[0]._id).length;
	var otherLength = Object.keys(results[0]).length;
console.log("Inside parsing");
	for (var i=0;i<jsonLength;i++) {
		
		reqJson += '{';
		
		for (var j=0;j<idLength;j++) {
			reqJson += '"' +Object.keys(results[i]._id)[j] +'":"' +results[i]._id[Object.keys(results[i]._id)[j]] +'"';
			if(j !== idLength-1) {
				reqJson += ',';
			}
		}

		for (var k=1;k<otherLength;k++) {
			reqJson += ',"' +Object.keys(results[i])[k] +'":"' +results[i][Object.keys(results[i])[k]] +'"';
			/*if(k !== otherLength-1) {
				reqJson += ',';
			}*/
		}
		
		if(i !== results.length-1) {
			reqJson += '},';
		}
	}

	reqJson += '}]';

	//console.log(reqJson);

	var finalJson = JSON.parse(reqJson);
	
	return finalJson;
}





exports.getStates=function(req,res)
{
	var states=[
	    {
	        "name": "Alabama",
	        "abbreviation": "AL"
	    },
	    {
	        "name": "Alaska",
	        "abbreviation": "AK"
	    },
	    {
	        "name": "American Samoa",
	        "abbreviation": "AS"
	    },
	    {
	        "name": "Arizona",
	        "abbreviation": "AZ"
	    },
	    {
	        "name": "Arkansas",
	        "abbreviation": "AR"
	    },
	    {
	        "name": "California",
	        "abbreviation": "CA"
	    },
	    {
	        "name": "Colorado",
	        "abbreviation": "CO"
	    },
	    {
	        "name": "Connecticut",
	        "abbreviation": "CT"
	    },
	    {
	        "name": "Delaware",
	        "abbreviation": "DE"
	    },
	    {
	        "name": "District Of Columbia",
	        "abbreviation": "DC"
	    },
	    {
	        "name": "Federated States Of Micronesia",
	        "abbreviation": "FM"
	    },
	    {
	        "name": "Florida",
	        "abbreviation": "FL"
	    },
	    {
	        "name": "Georgia",
	        "abbreviation": "GA"
	    },
	    {
	        "name": "Guam",
	        "abbreviation": "GU"
	    },
	    {
	        "name": "Hawaii",
	        "abbreviation": "HI"
	    },
	    {
	        "name": "Idaho",
	        "abbreviation": "ID"
	    },
	    {
	        "name": "Illinois",
	        "abbreviation": "IL"
	    },
	    {
	        "name": "Indiana",
	        "abbreviation": "IN"
	    },
	    {
	        "name": "Iowa",
	        "abbreviation": "IA"
	    },
	    {
	        "name": "Kansas",
	        "abbreviation": "KS"
	    },
	    {
	        "name": "Kentucky",
	        "abbreviation": "KY"
	    },
	    {
	        "name": "Louisiana",
	        "abbreviation": "LA"
	    },
	    {
	        "name": "Maine",
	        "abbreviation": "ME"
	    },
	    {
	        "name": "Marshall Islands",
	        "abbreviation": "MH"
	    },
	    {
	        "name": "Maryland",
	        "abbreviation": "MD"
	    },
	    {
	        "name": "Massachusetts",
	        "abbreviation": "MA"
	    },
	    {
	        "name": "Michigan",
	        "abbreviation": "MI"
	    },
	    {
	        "name": "Minnesota",
	        "abbreviation": "MN"
	    },
	    {
	        "name": "Mississippi",
	        "abbreviation": "MS"
	    },
	    {
	        "name": "Missouri",
	        "abbreviation": "MO"
	    },
	    {
	        "name": "Montana",
	        "abbreviation": "MT"
	    },
	    {
	        "name": "Nebraska",
	        "abbreviation": "NE"
	    },
	    {
	        "name": "Nevada",
	        "abbreviation": "NV"
	    },
	    {
	        "name": "New Hampshire",
	        "abbreviation": "NH"
	    },
	    {
	        "name": "New Jersey",
	        "abbreviation": "NJ"
	    },
	    {
	        "name": "New Mexico",
	        "abbreviation": "NM"
	    },
	    {
	        "name": "New York",
	        "abbreviation": "NY"
	    },
	    {
	        "name": "North Carolina",
	        "abbreviation": "NC"
	    },
	    {
	        "name": "North Dakota",
	        "abbreviation": "ND"
	    },
	    {
	        "name": "Northern Mariana Islands",
	        "abbreviation": "MP"
	    },
	    {
	        "name": "Ohio",
	        "abbreviation": "OH"
	    },
	    {
	        "name": "Oklahoma",
	        "abbreviation": "OK"
	    },
	    {
	        "name": "Oregon",
	        "abbreviation": "OR"
	    },
	    {
	        "name": "Palau",
	        "abbreviation": "PW"
	    },
	    {
	        "name": "Pennsylvania",
	        "abbreviation": "PA"
	    },
	    {
	        "name": "Puerto Rico",
	        "abbreviation": "PR"
	    },
	    {
	        "name": "Rhode Island",
	        "abbreviation": "RI"
	    },
	    {
	        "name": "South Carolina",
	        "abbreviation": "SC"
	    },
	    {
	        "name": "South Dakota",
	        "abbreviation": "SD"
	    },
	    {
	        "name": "Tennessee",
	        "abbreviation": "TN"
	    },
	    {
	        "name": "Texas",
	        "abbreviation": "TX"
	    },
	    {
	        "name": "Utah",
	        "abbreviation": "UT"
	    },
	    {
	        "name": "Vermont",
	        "abbreviation": "VT"
	    },
	    {
	        "name": "Virgin Islands",
	        "abbreviation": "VI"
	    },
	    {
	        "name": "Virginia",
	        "abbreviation": "VA"
	    },
	    {
	        "name": "Washington",
	        "abbreviation": "WA"
	    },
	    {
	        "name": "West Virginia",
	        "abbreviation": "WV"
	    },
	    {
	        "name": "Wisconsin",
	        "abbreviation": "WI"
	    },
	    {
	        "name": "Wyoming",
	        "abbreviation": "WY"
	    }
	];
	res.send(states);
};