Handlebars.registerHelper('isRoomInWishlist', function(roomId, roomIds) {
  return roomIds.includes(roomId);
});