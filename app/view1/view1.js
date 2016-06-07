'use strict';

angular.module('myApp.view1', ['ngRoute', 'highcharts-ng'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', function ($scope, $http, ngProgressLite) {
        ngProgressLite.start();
        $http({
            url: "http://127.0.0.1:3000",
            method: "GET",
            type: "json"
        }).success(function (data, status, headers, config) {
            if (data.status) data = [];
            var xA = [], yA = [];
            data = data.reverse();
            for (var i = 0, len = data.length; i < len; i++) {
                xA.push(data[i].time.split(' ')[1]);
                yA.push(data[i].value);
            }
            $scope.chartConfig = {
                chart: {
                    type: 'spline'
                    //animation: 'Highcharts.svg', // don't animate in old IE
                    /*marginRight: 10,
                    events: {
                        load: function () {
                            // set up the updating of the chart each second
                            var series = this.series[0];
                            setInterval(function () {
                                var x = (new Date()).getTime(), // current time
                                    y = Math.random();
                                //series.addPoint([x, y], true, true);
                                console.log('...');
                            }, 1000);
                        }
                    }*/
                },
                title: {
                    text: '中行实时汇率',
                    x: -20 //center
                },
                xAxis: {
                    name: '时间',
                    categories: xA
                },
                series: [{
                    name: '人民币',
                    data: yA
                }],
                loading: false,
                yAxis: {
                    title: {
                        text: '100纽币可换人民币'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                }
            };
        }).error(function (data, status, headers, config) {
            //$scope.status = status;
            console.log('err');
        }).finally(function(){
            ngProgressLite.done();
        });

    });
