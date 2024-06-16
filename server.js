const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { getCurrentUser, userJoin, getRoomUsers, userLeave } = require("./utils/users");

const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = 'ChatCord Bot';




io.on("connection", (socket) => {

    socket.on("joinRoom", ({ username, room }) => {

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // 
        socket.emit("message", formatMessage(botName, "Welcome to ChatCord !"));

        //
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, ` ${user.username} Has joined the Chat !`));

        //
        io.to(user.room).emit("roomUsers", { room: user.room, users: getRoomUsers(user.room) })
    });

    //
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    //
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        console.log(user);
        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));
        }
    })


});





server.listen(3000, () => {
    console.log("server is running on port 3000");
});