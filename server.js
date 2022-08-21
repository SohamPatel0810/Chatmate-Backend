const express = require("express");
const socketio = require("socket.io");
const http = require("http");
var cors = require("cors");

const {
  addUser,
  findUser,
  getRoomUsers,
  deleteUser,
} = require("./controller/user");

const app = express();
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

const PORT = process.env.PORT || 5000;

const router = require("./routes/index");
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

io.on("connection", (socket) => {
  socket.on("join", ({ userName, chatRoomName }, callback) => {
    const { error, user } = addUser({ id: socket.id, name:userName, room:chatRoomName });
    if (error) {
      return callback(error);
    } else {
      socket.emit("message", {
        user: "admin",
        text: `Hey, ${user.name.charAt(0).toUpperCase()+user.name.slice(1)} welcome to the ${user.room.charAt(0).toUpperCase()+user.room.slice(1)} group`,
      });
      socket.broadcast
        .to(user.room)
        .emit("message", {
          user: "",
          text: `${user.name.charAt(0).toUpperCase()+user.name.slice(1)} has joined the group`,
        });
        socket.join(user.room)
        io.to(user.room).emit("roomData", { room: user.room, users:getRoomUsers(user.room) });
      callback();
    }
  });

  socket.on("sendMessage", (mesaage, callback) => {
    const user = findUser(socket.id);
    io.to(user.room).emit("message", { user: user.name.charAt(0).toUpperCase()+user.name.slice(1), text:mesaage });
    
    io.to(user.room).emit("roomData", { room: user.room, users:getRoomUsers(user.room) });

    callback();
  });

  socket.on("disconnection", () => {
    const user = deleteUser(socket.id);
    if(user){
      io.to(user.room).emit("message", { user: '', text:`${user.name.charAt(0).toUpperCase()+user.name.slice(1)} has left the chat.` });
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
