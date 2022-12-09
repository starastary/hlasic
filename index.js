const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 8080;

let adminToken = null;
let position = 1;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

app.get('/open', (req, res) => {
  res.send(data.open)
});


var data = {
  open: false,
  started: false,
  started_time: false,
  members: [

  ]
}

io.on('connection', (socket) => {

  socket.on('join', socketData => {
    console.log(socket.id + " joined as " + socketData.name)

    if(!data.members.find(e => e.id == socket.id)) {
      data.members.push({
        id: socket.id,
        name: socketData.name,
        raised: false,
        time: null,
        position: null,
      })
    }

    io.emit('id', socket.id, socket.id)
    io.emit('data', data);
  });


  socket.on('join-admin', socketData => {
    console.log("[Admin] joined")

    if(socketData.name === "admin" && socketData.joinPass === "Admin123") {
      adminToken = 123
      io.emit('join-admin', {success: true, token: adminToken});
      io.emit('data', data);
    }
    io.emit('join-admin', {success: false, token: null});
  });

  socket.on('admin-open', socketData => {
    console.log("[Admin] opened")
    data.open = true
    io.emit('data', data);
  });

  socket.on('admin-start', socketData => {
    console.log("[Admin] started")
    data.started = true
    data.started_time = Date.now()
    io.emit('data', data);
  });

  socket.on('admin-stop', socketData => {
    console.log("[Admin] stoped")
    data.started = false
    io.emit('data', data);
  });

  socket.on('admin-close', socketData => {
    console.log("[Admin] closed")
    data.started = false
    data.open = false
    io.emit('data', data);
  });

  socket.on('admin-clear', socketData => {
    console.log("[Admin] cleared")
    data.started = false
    data.open = false
    data.started_time = null

    data.members.forEach((member, index) => {
      data.members[index].raised = false
      data.members[index].time = null
      data.members[index].position = null
    });

    position = 1

    io.emit('data', data);
  });

  socket.on('admin-reset', socketData => {
    console.log("[Admin] reseted")
    data = {
      open: false,
      started: false,
      started_time: false,
      members: [
    
      ]
    }

    position = 1
    
    io.emit('reseted', 1);
    io.emit('data', data);
  });

  socket.on('raise', socketData => {
    console.log(socket.id + " raised hand")
    let index = data.members.findIndex(element => element.id === socket.id)
    
    data.members[index].raised = true
    data.members[index].position = position
    data.members[index].time = Date.now() - data.started_time

    position++

    io.emit('data', data);
  });

  socket.on('disconnect', function () {
    let members = data.members.filter((member) => member.id !== socket.id)
    console.log(socket.id + " disconected")
    data.members = members
    io.emit('data', data);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});



