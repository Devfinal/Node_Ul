var mainApp = angular.module("app", ["chart.js"]);
mainApp.controller("LineCtrl", function ($scope, $http) {
    $http({
        method : "GET",
        url : "/chart"
    }).then(function mySucces(response) {
        var devices = response.data.data;
        $scope.labels = [];
        $scope.data = [];
        var chart = {};
        console.log(devices);
        for (key in devices) {
          var temp =  [];
          var humi = [];
          var timestamp = [];
          for (var i = 0;i < devices[key].temp.length; i ++) {
            temp.push(devices[key].temp[i].value);
            humi.push(devices[key].humi[i].value);
            timestamp.push(devices[key].temp[i].timestamp);
          }
          chart[key] = {};
          chart[key].labels = timestamp;
          chart[key].data = [];
          chart[key].data.push(temp);
          chart[key].data.push(humi);
        }
        $scope.devices = chart;
    }, function myError(response) {
        console.log(response);
  });
  $scope.devices = {};
  $scope.series = ['temperature', 'humidity'];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };
});



