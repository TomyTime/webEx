'use strict';

angular.module('myApp.view2', ['ngRoute', 'highcharts-ng'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])


    .controller('View2Ctrl', function ($scope, $http, MyCache, ngProgressLite) {
        ngProgressLite.start();
        var chartConfig = MyCache.get('history');
        if(!chartConfig) {
            $http({
                url: "http://127.0.0.1:3000/history",
                method: "GET",
                cache: MyCache,
                type: "json"
            }).success(function (data, status, headers, config) {
                if (data.status) data = [];
                var xA = [], yA = [];
                for (var i = 0, len = data.length; i < len; i++) {
                    //               xA.push(Date.parse(data[i].time));
                    yA.push([Date.parse(data[i].time), data[i].value]);
                }
                var chartConfig1 = {
                    options: {
                        chart: {
                            zoomType: 'x'
                        },
                        rangeSelector: {
                            buttons: [{
                                type: 'day',
                                count: 1,
                                text: '1d'
                            }, {
                                type: 'week',
                                count: 1,
                                text: '1w'
                            }, {
                                type: 'month',
                                count: 1,
                                text: '1m'
                            }, {
                                type: 'year',
                                count: 1,
                                text: '1y'
                            }, {
                                type: 'all',
                                text: 'All'
                            }],
                            selected: 1 // month
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
                        data: yA,
                        tooltip: {
                            valueDecimals: 2
                        }/*,
                         dataGrouping: {
                         enabled: false
                         }*/
                    }],
                    /*loading: false,*/
                    useHighStocks: true,
                    useUTC: false
                };

                MyCache.put('history', chartConfig1);
                $scope.chartConfig1 = chartConfig1;

            }).error(function (data, status, headers, config) {
                //$scope.status = status;
                console.log('err');
            }).finally(function(){
                ngProgressLite.done();
            });
        }else{
            $scope.chartConfig1 = chartConfig;
            ngProgressLite.done();
        }
    });