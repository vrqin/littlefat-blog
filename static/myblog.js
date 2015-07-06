(function() {
  'use strict';
  var homeCtrl, listCtrl, parseList, parsePost, parseTitle, postCtrl;

  window.myblogApp = angular.module("myblog", ["ngRoute", "ngAnimate"]);

  myblogApp.directive('markdown', function() {
    return {
      restrict: 'EA',
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        return scope.$watch((function() {
          return ngModel.$modelValue;
        }), function(newValue) {
          return element.html(marked((newValue ? newValue : "# loading...")));
        });
      }
    };
  });

  myblogApp.directive('markdowntext', function() {
    return {
      restrict: 'EA',
      link: function(scope, element, attrs) {
        return element.html(marked(element.text()));
      }
    };
  });

  myblogApp.config(function($routeProvider, $locationProvider) {
    return $routeProvider.when("/", {
      templateUrl: "/template/home.html"
    }).when("/post/:name", {
      templateUrl: "/template/post.html"
    }).when("/page/:name", {
      templateUrl: "/template/post.html"
    }).otherwise({
      redirectTo: "/"
    });
  });

  parseTitle = function(data) {
    var key, line, r, value, _i, _len, _ref, _ref1;
    r = {
      title: "",
      category: "",
      tag: "",
      text: "",
      url: "",
      hide: ""
    };
    _ref = data.split('\n');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      _ref1 = line.split(':'), key = _ref1[0], value = _ref1[1];
      key = _.str.trim(key);
      value = _.str.trim(value);
      if (r.hasOwnProperty(key)) {
        r[key] = value;
      }
    }
    return r;
  };

  parseList = function(data) {
    return _.map(data.split(/\n[\-=]+\n/), parseTitle);
  };

  listCtrl = function($scope, $http) {
    window.w = $scope;
    return $http.get("/posts/list.md", {
      cache: true
    }).success(function(data) {
      return $scope.blogList = _.filter(parseList(data), function(it) {
        return it.hide !== 'true';
      });
    });
  };

  listCtrl.$inject = ['$scope', '$http'];

  parsePost = function(text) {
    var flag, head, line, post, tail, _i, _len, _ref;
    flag = false;
    head = "";
    tail = "";
    _ref = text.split('\n');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      if (/[\-=]+/.test(line)) {
        flag = true;
      }
      if (flag) {
        tail += '\n' + line;
      } else {
        head += '\n' + line;
      }
    }
    post = parseTitle(head);
    post.text = tail;
    if (post.hide === "true") {
      return;
    }
    return post;
  };

  postCtrl = function($scope, $http, $routeParams) {
    $scope.name = $routeParams.name;
    return $http.get('/posts/' + $scope.name).success(function(data) {
      return $scope.post = parsePost(data);
    });
  };

  postCtrl.$inject = ['$scope', '$http', '$routeParams'];

  homeCtrl = function($scope) {};

  homeCtrl.$injector = ['$scope'];

  myblogApp.controller('listCtrl', listCtrl);

  myblogApp.controller('postCtrl', postCtrl);

  myblogApp.controller('homeCtrl', homeCtrl);

}).call(this);
