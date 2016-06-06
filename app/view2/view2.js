'use strict';

angular.module('myApp.view2', ['ngRoute', 'highcharts-ng'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])


    .controller('View2Ctrl', function ($scope, $http) {
        $http({
            url: "http://127.0.0.1:3000/history",
            method: "GET",
            type: "json"
        }).success(function (data, status, headers, config) {
            if (data.status) data = [];
            var xA = [], yA = [];
            for (var i = 0, len = data.length; i < len; i++) {
 //               xA.push(Date.parse(data[i].time));
                yA.push([Date.parse(data[i].time), data[i].value]);
            }
            $scope.chartConfig1 = {
                options: {
                    chart: {
                        zoomType: 'x',
                        type: 'spline'
                    },
                    rangeSelector: {
                        enabled: true
                    },
                    navigator: {
                        enabled: true
                    }
                },
                title: {
                    text: '中行历史汇率',
                    x: -20 //center
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
                },
                useHighStocks: true,
                useUTC: false
            };
        }).error(function (data, status, headers, config) {
            //$scope.status = status;
            console.log('err');
        });
    });