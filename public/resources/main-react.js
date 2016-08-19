var TodoList = React.createClass({
  getInitialState: function() {
      return {
          title: "",
          todos: []
      }
  },
  componentDidMount: function() {
      this.reloadTodos(this.refs.filter.getActiveFilter());
  },
  changeTitle: function (ev) {
      this.setState({
          title: ev.target.value
      });
  },

  submitTodo: function (ev) {
      ev.preventDefault();
      var self = this;
      $.ajax({
          url: "api/todo",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({title: this.state.title}),
          success: function() {
              self.reloadTodos(this.refs.filter.getActiveFilter());
          }
      });

      this.setState({
          title: ""
      });
  },
  markComplete: function (todo) {
      var self = this;
      console.log("Clicked"+todo.id);
      var updatedTodo = todo;
      updatedTodo.isComplete = !updatedTodo.isComplete;

      fetch("/api/todo/" + todo.id, {
          method: "PUT",
          headers: {
              "Content-type": "application/json"
          },
          body: JSON.stringify(updatedTodo)
      }).then(function(data) {
          if (data.ok) {
              self.reloadTodos(self.refs.filter.getActiveFilter());
          }
          else {
              //error.textContent = "Failed to update item. Server returned " + data.status + " - " + data.statusText;
          }
      });
  },
  deleteTodo: function(todo) {
      var self = this;
      fetch("/api/todo/" + todo.id, {
          method: "DELETE"
      }).then(function(response) {
          if (!response.ok) {
              //error.textContent = "Failed to get list. Server returned " + response.status + " - " + response.statusText;
              return;
          }
          self.reloadTodos(self.refs.filter.getActiveFilter());
      });
  },
  reloadTodos: function (activeFilter) {
      var self = this;
      //console.log(self.refs.filter.getActiveFilter());
      //var activeFilter = self.refs.filter.getActiveFilter();
      $.get("api/todo", function(data) {
          var filteredData = data.filter (function (el) {
              if ((activeFilter.name === "active" && !el.isComplete) || (activeFilter.name === "completed" && el.isComplete) || (activeFilter.name === "all")) {
                  return true;
              }
          });
          console.log(filteredData);
          self.setState({
              todos: filteredData
          });
      });
  },
  getRemaining: function () {
      var count = 0;
      this.state.todos.forEach(function(todo) {
          count += todo.isComplete ? 0 : 1;
      });
      return count;
  },
  deleteCompleted: function() {
    var self = this;
      this.state.todos.forEach(function(todo) {
          if (todo.isComplete) {
              self.deleteTodo(todo);
          }
      });
  },
  render: function() {
    var self = this;
      return (
        <div>
          <Filters reloadCallback={self.reloadTodos} ref="filter" />
          <span className="count">{self.getRemaining()} task(s) incomplete out of {self.state.todos.length}.</span>
          <ul className="unstyled" id="todo-list">
            {self.state.todos.map(function (todo) {
                return (
                  <li key={todo.id} className="paper">
                    <label className="checkbox">
                      <input checked={todo.isComplete} type="checkbox" onChange={self.markComplete.bind(self, todo)}></input>
                      <span className={"done-"+todo.isComplete}>{todo.title}</span>
                      <button className="button" onClick={self.deleteTodo.bind(self, todo)} >Delete me</button>
                    </label>
                  </li>
                );
            })
            }
          </ul>
          <form id="todo-form" onSubmit={self.submitTodo}>
            <input id="new-todo" type="text" size="30" placeholder="add new todo here" value={self.state.title} onChange={self.changeTitle}/>
            <input id="submit-todo" className="btn-primary button" type="submit" value="Create a note"/>
          </form>
          {self.state.todos.length - self.getRemaining() > 1 && <input className="button" type="button" onClick={self.deleteCompleted} value="Delete all completed"/>}
        </div>
      );
  }
});

var Filters = React.createClass({
    propTyoes: {
        reloadCallback: React.PropTypes.func
    },
    getInitialState: function () {
        return {
            filters : [{name: "all"}, {name: "active"}, {name: "completed"}],
            selectedIndex: 0
        }
    },
    handleClick: function(id) {
        //console.log("Button clicked! Filter ID: "+id+". "+this.getActiveFilter());
        this.setState({
          selectedIndex: id
        });
        this.props.reloadCallback(this.state.filters[id]);
    },
    getActiveFilter: function() {
        return this.state.filters[this.state.selectedIndex];
    },
    render: function() {
        var self = this;
        return (
          <div>
            <ul className="filters">
              {self.state.filters.map(function (filter, i){
                  return (<li key={i}><button type="button" className="button" onClick={self.handleClick.bind(self, i)}>{filter.name}</button></li>);
              })
              }
            </ul>
            <div style={{clear: "both"}}></div>
          </div>
          );
      }
});

var TodoApp = React.createClass({
  render: function() {
      return (
          <div>
            <TodoList />
          </div>
      );
  }
});

ReactDOM.render(<TodoApp />, document.getElementById("wrapper"));
