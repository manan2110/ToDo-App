import './App.css';
import React from 'react';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: '',
        completed: false,
      },
      editing: false,
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)


    this.startEdit = this.startEdit.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.strikeUnstrike = this.strikeUnstrike.bind(this)
  };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentWillMount() {
    this.fetchTasks()
  }

  fetchTasks() {
    console.log('Fetching...');

    axios.get("/api/task-list/")
      .then(data =>
        this.setState({
          todoList: data.data
        })
      )
      .catch(err => console.log(err));
  }

  handleChange(e) {
    var name = e.target.name
    var value = e.target.value
    console.log('Name:', name)
    console.log('Value:', value)

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    console.log('ITEM:', this.state.activeItem)
    var url = '/api/task-create/'

    if (this.state.editing === true) {
      url = `/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing: false
      })
    }

    axios.post(url, this.state.activeItem)
      .then((response) => {
        this.fetchTasks()
        this.setState({
          activeItem: {
            id: null,
            title: '',
            completed: false,
          }
        })
      }).catch(function (error) {
        console.log('ERROR:', error)
      })

  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    })
  }


  deleteItem(task) {
    axios.delete(`/api/task-delete/${task.id}/`)
      .then((response) => {
        this.fetchTasks()
      })
  }


  strikeUnstrike(task) {
    var csrftoken = this.getCookie('csrftoken')
    task.completed = !task.completed
    var url = `/api/task-update/${task.id}/`
    axios({
      method: "POST",
      url: url,
      data: this.state.activeItem,
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({ 'completed': task.completed, 'title': task.title })
    })
      .then(() => {
        this.fetchTasks()
      })
    console.log('TASK:', task.completed)
  }


  render() {
    var tasks = this.state.todoList;
    var self = this;
    return (
      <div className="container">

        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input onChange={this.handleChange} className="form-control" id="title" value={this.state.activeItem.title} type="text" name="title" placeholder="Add task.." />
                </div>

                <div style={{ flex: 1 }}>
                  <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                </div>
              </div>
            </form>

          </div>

          <div id="list-wrapper">
            {tasks.map(function (task, index) {
              return (
                <div key={index} className="task-wrapper flex-wrapper">

                  <div onClick={() => self.strikeUnstrike(task)} style={{ flex: 7 }}>

                    {task.completed === false ? (
                      <span>{task.title}</span>

                    ) : (

                      <strike>{task.title}</strike>
                    )}

                  </div>

                  <div style={{ flex: 1 }}>
                    <button onClick={() => self.startEdit(task)} className="btn">  <i className="edit alternate outline icon" style={{ color: "blue" }}></i></button>
                  </div>

                  <div style={{ flex: 1 }}>
                    <button onClick={() => self.deleteItem(task)} className="btn"> <i className="trash alternate outline icon" style={{ color: "red" }}></i></button>
                  </div>

                </div>
              )
            })}
          </div>
        </div>

      </div>
    )
  }
}


export default App;
