class SocketModule {
  static connection(socket) {
    console.log(`User connect id is ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`User disconnect id is ${socket.id}`);
    });
  }
}

module.exports = SocketModule;
