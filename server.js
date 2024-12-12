const io = require("socket.io")(5000, {
  cors: {
    origin: "*",
  },
});

const userSocketMap = {}; // Map user IDs to their socket IDs

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User registered: ${userId} -> ${socket.id}`);
  });

  socket.on("offer", ({ offer, target, sender }) => {
    const targetSocketId = userSocketMap[target];
    console.log("Sending offer to:", target);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit("offer", { offer, sender });
    } else {
      socket.emit("error", "Target user not found or offline.");
    }
  });

  socket.on("answer", ({ answer, callerId }) => {
    const callerSocketId = userSocketMap[callerId];
    console.log("Sending answer to:", callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("answer", { answer });
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    for (const [userId, id] of Object.entries(userSocketMap)) {
      if (id === socket.id) {
        delete userSocketMap[userId];
        console.log(`User unregistered: ${userId}`);
        break;
      }
    }
  });
});
