var app = require('http').createServer();
var io = require('socket.io')(app)

var PORT = 8001
var currentStatus = {
  page:null
}

app.listen(PORT)

io.on('connection',function(socket) {
  socket.on('change',function(data){
    console.log(data)
    io.emit('receive',data)
  })
})


console.log('websocket server listening on port' + PORT)



