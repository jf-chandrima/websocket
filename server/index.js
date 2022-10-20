const http = require('http').createServer();

let clients=[];
const io = require('socket.io')(http,{
    cors: {origin:"*"}
});
io.on('connection',(socket)=>{
    clients.push({id:socket.handshake.query.id,socket:socket});
    socket.on('data',(data)=>{
        console.log(socket.handshake);
        // socket.emit(message)
        for(let client of clients) {
            if(socket.handshake.query.id!= client.id){
                client.socket.send(data);
            }
          }
    });
    socket.on('message',(message)=>{
        for(let client of clients) {
            if(socket.handshake.query.id!= client.id){
                message['client']=socket.handshake.query.id;
                client.socket.send(message);
            }
          }
    });
    
});
http.listen(8080,() => console.log('listening on http://localhost:8080'))