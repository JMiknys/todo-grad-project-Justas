/*globals angular */
var ang = angular.module("todoApp", ["ngResource"])
  .controller("TodoListController", function($scope, $http, Todo) {
      var self = this;
      // Load todos from REST
      var todoListPlaceholder = document.getElementById("todo-list-placeholder");
      var error = document.getElementById("error");
      $scope.isLoading = true;

      $scope.filters = [
          {name: "all"},
          {name: "active"},
          {name: "completed"}
      ];
      $scope.selectedFilter = $scope.filters[0];

      $scope.setFilter = function (filter) {
          $scope.selectedFilter = filter;
          console.log($scope.selectedFilter.filterExpr);
      };

      $scope.myFilter = function (item) {
          if ($scope.selectedFilter.name === "all") {
              return true;
          } else if ($scope.selectedFilter.name === "completed") {
              return item.isComplete ? true : false;
          } else if ($scope.selectedFilter.name === "active") {
              return item.isComplete ? false : true;
          }
      };

      function getTodoById(id) {
          return $scope.todos.filter(function(el) {
              return el.id === id;
          })[0];
      }

      function setErrorText(val) {
          var error = document.getElementById("error");
          error.textContent = val;
      }

      self.reload = function () {
          $scope.isLoading = true;
          $scope.todos = Todo.query({}, function(data) {
              // success
              console.log(data);
              $scope.isLoading = false;
          }, function (error) {
              console.log(error);
              $scope.errorm = "Failed to get list. Server returned " + error.status + " - " + error.statusText;
              $scope.isLoading = false;
          });
      };

      self.isReloading = function () {
          return $scope.isLoading;
      };

      self.remaining = function () {
          var count = 0;
          angular.forEach($scope.todos, function(todo) {
              count += todo.isComplete ? 0 : 1;
          });
          return count;
      };

      self.update = function (id) {
          $scope.todo = getTodoById(id);
          $scope.todo.isComplete = !$scope.todo.isComplete;
          Todo.update({id: id}, $scope.todo, function() {
              self.reload();
          });
      };

      self.delete = function (id) {
          Todo.delete({id: id}, function() {
              console.log("Item deleted?");
              self.reload();
          });
      };
      self.addNote = function () {
          $scope.todo = new Todo();
          $scope.todo.title = self.todoTitle;
          $scope.todo.isComplete = false;

          Todo.save($scope.todo, function () {
              // success
              console.log("Suceeded to add");
              self.todoTitle = "";
              self.reload();
          }, function (error) {
              setErrorText("Failed to create item. Server returned " + error.status + " - " + error.statusText);
          });
          /*
          $scope.todo.$save(function () {
              self.todoTitle = "";
              self.reload();
          });
          */
          /*
          $promise.then(function (data) {
              // success
              console.log("Suceeded to add");
          }, function (error) {
              // failure
              setErrorText("Failed?");
              console.log("Add failed?");
          });
          */
      };
      self.deleteCompleted = function () {
          $scope.todos.filter(function (el) {
              return el.isComplete;
          }).forEach(function (el) {
              self.delete(el.id);
          });
          self.reload();
      };

      //todoListPlaceholder.style.display = "block";
      self.reload();//Todo.query();
      //todoListPlaceholder.style.display = "none";
  });

ang.factory("Todo", function($resource) {
    return $resource("/api/todo/", {}, {
        "update": {
            method: "PUT"
        },
        "delete": {
            url: "/api/todo/:id",
            method: "DELETE"
        }
    });
});
