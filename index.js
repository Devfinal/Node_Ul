'use strict';
var request = require('request');
var mysql = require('mysql');
var express = require('express');
var app = express();
var path = require('path');
var async = require( 'async' );
app.set('views', path.join(__dirname, './public/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/')));
function getDevices(callback) {
	var obj = [];
		request({url: 'https://www.terasyshub.io/api/v1/devices'
		}, function(error, res) {
		if (error)
		{
			console.log('Error:');
			console.log(error);
		}
		else 
		{
			var data = res.body;
			console.log(data);
			var obj = JSON.parse(data);
		}
		callback(null, obj);
	})
}
function getTemp(devices, cb) {
	var device_info = [];	
	async.eachSeries(devices, function (device, callback) {	
		async.parallel({
		    temp: function(callback) {
        		request({url: 'https://www.terasyshub.io/api/v1/data/temperature/'+device.mac
				}, function(error, res) {
					if (error)
					{
						console.log('Error:');
						console.log(error);
						callback(error);
					}
					else 
					{
						var tem = res.body;
						var object = JSON.parse(tem);						
						callback(null, object)
					}
				})
		    },
		    humi: function(callback) {
	        	request({url: 'https://www.terasyshub.io/api/v1/data/humidity/'+device.mac
				}, function(error, res) {
					if (error)
					{
						console.log('Error:');
						console.log(error);
						callback(error);
					}
					else 
					{
						var hum = res.body;
						var object = JSON.parse(hum);
						callback(null, object)
					}
				})
		    }
		}, function(err, results) {
			if (err) {
				console.log(err);
			}
			else {
				if (results.temp.length == results.humi.length)
					device_info.push(results);
				callback();
			}
		});
	}, function (err) {
		if (!err) {
			console.log(device_info);
			cb(null, device_info)
		}
	});
}
app.get('/chart', function (req, res) {
	async.waterfall([
    	getDevices,
	    getTemp
		, function (results, callback) {
			var data = {};
    		var temp = {};
	      	for (var i=0; i<results.length ; i++) {
	      		var object = {};
				object.temp = results[i].temp;
				object.humi = results[i].humi;
	        	data[results[i].temp[0].mac] = object;
	        	if (i == results.length - 1) {
	        		callback(null, data);
	        	}
			}
		}], function(error, results) {
			if (!error) {
				console.log(results);
				res.send(JSON.stringify({data:results}));
		}		
	})
});
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname+'/public/views/chart.html'))
})
var server = app.listen(8081, function () {
  	console.log("Example app listening at 127.0.0.1:%s", 8081);
})