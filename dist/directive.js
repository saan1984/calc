/*!
 * roi-calculator
 * 
 * Version: 0.0.1 - 2015-09-15T11:18:58.272Z
 * License: ISC
 */


'use strict';

var ptgDirectives = angular.module('ptg.directives',
    ['ngResource', 'ngSanitize', 'ui.bootstrap', 'rzModule']);

ptgDirectives.controller("CalculatorController", function($scope,$parse) {
    //Handles changes in slider
    $scope.handleItemChange = function() {
        var newSliderValue = $scope.noOfRefund;
        if (newSliderValue == null) {
            $scope.noOfRefund = 0;
        }
        $scope.applyFormulaes();
    }

    $scope.applyFormulaes = function(){
        var selectedBank = $scope.bank,
            selectedProduct = $scope.product,
            selectedNoRefund = $scope.noOfRefund,
            isValid = angular.isDefined(selectedBank) && selectedBank !== null
                      && angular.isDefined(selectedProduct) && selectedProduct !== null
                      && angular.isDefined(selectedNoRefund) && selectedNoRefund !== null;

        console.log("scope.formulaes",$scope.formulaes);
        //All inputs are present, time to apply formulaes
        if(isValid){
            angular.forEach($scope.formulaes,function(formulaObj,index){
                var keyList = Object.keys(formulaObj),
                    theKey = keyList[0];
                angular.forEach(formulaObj,function(objValue,objKey){
                    if (objKey != null) {
                        $parse(objKey).assign($scope.data, $parse(objValue)($scope));
                        console.log("scope1",$scope);
                    }
                });
                console.log("scope2",$scope);
            });
        }
    }
});

ptgDirectives.directive('roiCalculator', function(DataService,$q) {
    return {
        restrict: 'E',
        templateUrl: 'directive.html',
        scope:{
            banksUrl: "@banksUrl",
            productUrl: "@productsUrl",
            fieldUrl: "@fieldsUrl",
            formulaeUrl: "@formulaesUrl"
        },
        controller: 'CalculatorController',
        replace: true,
        link: function(scope,element,attr) {
            var banksRequest = DataService.getBanksList(scope.banksUrl).$promise,
                productsRequest = DataService.getProductList(scope.productUrl).$promise,
                fieldsRequest = DataService.getFieldList(scope.fieldUrl).$promise,
                formulaeRequest = DataService.getFormulaeList(scope.formulaeUrl).$promise;

            $q.all([banksRequest,productsRequest,fieldsRequest,formulaeRequest])
                .then(function(resData) {
                    scope.banks = resData[0];
                    scope.products = resData[1];
                    scope.fields = resData[2];
                    scope.formulaes = resData[3];
                    scope.data = {};
                    //Set Default Values for calculator inputs
                    scope.noOfRefund = scope.fields.noRefundSlider.value;
                    scope.applyFormulaes();
            });
        }
    };
});

ptgDirectives.service("DataService",function($resource) {
    return {
        //Returns JSON Array of Bank Object
        getBanksList: function(banksUrl) {
            return $resource(banksUrl, {/* parameters*/}, {
                list: {
                    method:'POST', isArray:true
                }
            }).query();
        },
        //Returns JSON Array of products Object
        getProductList: function(productsUrl) {
            return $resource(productsUrl, {/* parameters*/}, {
                list: {
                    method:'POST', isArray:true
                }
            }).query();
        },
        //Returns JSON Object For Formulae List
        getFormulaeList: function(formulaeUrl) {
            return $resource(formulaeUrl, {/* parameters*/}, {
                list: {
                    method:'POST', isArray:true
                }
            }).query();
        },
        //Returns JSON Object For Field List
        getFieldList: function(fieldUrl) {
            return $resource(fieldUrl, {/* parameters*/}, {
                list: {
                    method:'POST', isArray:false
                }
            }).get();
        }
    }
});

angular.module("ptg.directives").run(["$templateCache", function($templateCache) {$templateCache.put("_popOver.html","<div class=\"popover ng-isolate-scope top fade in\" tooltip-animation-class=\"fade\" tooltip-classes=\"\" ng-class=\"{ in: isOpen() }\" popover-popup=\"\" title=\"\" content=\"I fade in and out!\" placement=\"top\" popup-class=\"\" animation=\"animation\" is-open=\"isOpen\" origin-scope=\"origScope\"><div class=\"arrow\"></div><div class=\"popover-inner\"><div class=\"popover-content ng-binding\" ng-bind=\"content\">I fade in and out!</div></div></div>");
$templateCache.put("directive.html","<div class=\"widget-container hy-jumbo\"><div class=\"row\"><div class=\"col-sm-12\"><div class=\"panel card ptg-header-section\"><div class=\"row\"><h1 class=\"text-center panel-heading hy-text-light\">Tax Refund ROI Calculator</h1><h3 class=\"hy-text-light text-center text-primary roi-subtitle\">See how much more money you can be putting in your text</h3></div><div class=\"row ptg-vertical-gap\"><div class=\"col-sm-6\"><div class=\"form-group\"><label for=\"noRefTransfer\" class=\"pull-left hy-heading\"># of Refund Transfers</label><div class=\"slider-container\"><rzslider class=\"ptg-slider\" rz-slider-model=\"noOfRefund\" rz-slider-floor=\"fields.noRefundSlider.floor\" rz-slider-ceil=\"fields.noRefundSlider.ceil\"></rzslider></div></div><div class=\"form-group\"><input type=\"number\" ng-model=\"noOfRefund\" ng-value=\"fields.noRefundSlider.value\" ng-change=\"handleItemChange()\" class=\"form-control\" min=\"{{fields.noRefundSlider.floor}}\" max=\"{{fields.noRefundSlider.ceil}}\" step=\"1\" id=\"noRefTransfer\"></div></div><div class=\"col-sm-6\"><div class=\"form-group\"><label for=\"provider\" class=\"control-label pull-left\">Tax Software Provider</label><select class=\"form-control\" ng-change=\"handleItemChange()\" id=\"provider\" ng-model=\"product\" ng-options=\"c.name for c in products\"><option value=\"\">-Select-</option></select></div><div class=\"form-group\"><label for=\"bank\" class=\"control-label pull-left\">Banking Partner</label><select class=\"form-control\" ng-change=\"handleItemChange()\" id=\"bank\" ng-model=\"bank\" ng-options=\"c.name for c in banks\"><option value=\"\">-Select-</option></select></div></div></div></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"card panel\"><h1 class=\"panel-heading hy-text-light text-left\">Other Software</h1><table class=\"table\"><thead><tr><td class=\"\">Bank Fees</td><td class=\"text-danger\">{{data.bankFeeOther | currency}}</td></tr></thead><tbody><tr><td>Added RT <span class=\"hidden-xs hidden-sm\">Processing Fees</span> <sub class=\"visible-sm visible-xs\">Processing Fees</sub></td><td class=\"text-danger\">{{data.processFeeOther | currency}}</td></tr><tr><td>Intuit RT <span class=\"hidden-xs hidden-sm\">Incentive</span> <sub class=\"visible-sm visible-xs\">Incentive</sub></td><td class=\"text-danger\">{{data.incentiveOther | currency}}</td></tr></tbody><tfoot class=\"ptg-footer hy-bg-brightblue3\"><tr><td><strong>Total Cost <span class=\"hidden-xs hidden-sm\">Total Cost</span> <sub class=\"visible-sm visible-xs\">For {{data.noRefundSlider.value}} Returns</sub></strong></td><td popover=\"ROI\" popover-placement=\"bottom\"><strong>{{ data.totalOther | currency}}</strong></td></tr></tfoot></table></div></div><div class=\"col-sm-6\"><div class=\"card panel\"><h1 class=\"panel-heading hy-text-light text-left\">ProSeries</h1><table class=\"table\"><thead><tr><td class=\"\">Bank Fees</td><td class=\"text-success\">{{data.bankFeePro | currency}}</td></tr></thead><tbody><tr><td>Added RT <span class=\"hidden-xs hidden-sm\">Processing Fees</span> <sub class=\"visible-sm visible-xs\">Processing Fees</sub></td><td class=\"text-success\">{{data.processFeePro | currency}}</td></tr><tr><td>Intuit RT <span class=\"hidden-xs hidden-sm\">Incentive</span> <sub class=\"visible-sm visible-xs\">Incentive</sub></td><td class=\"text-success\">{{data.incentivePro | currency}}</td></tr></tbody><tfoot class=\"ptg-footer hy-bg-brightblue3\"><tr><td><strong>Total Cost <span class=\"hidden-xs hidden-sm\">Total Cost</span> <sub class=\"visible-sm visible-xs\">For {{data.noRefundSlider.value}} Returns</sub></strong></td><td tooltip-template=\"_popOver.html\" popover-placement=\"bottom\"><strong>{{data.totalPro | currency}}</strong></td></tr></tfoot></table></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><h6 class=\"hy-text-light text-left text-warning\">Now that you\'ve seen the ProSeries difference, request your quote on how to make <strong class=\"strong-number\">MORE</strong> money.</h6></div><div class=\"col-sm-3\"><h6 class=\"hy-text-light text-left text-success\">You could profit by <strong class=\"strong-number\">$24.00</strong> using ProSeriese.</h6></div><div class=\"col-sm-3\"><button class=\"btn btn-primary btn-block\">Request Quote</button></div></div></div>");}]);