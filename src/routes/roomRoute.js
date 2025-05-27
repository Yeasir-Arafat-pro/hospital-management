const { handleCreateRoom, handleGetAllRooms, handleDeleteRoomById, handleGetRoomById, handleUpdateRoomById } = require('../controllers/roomController');



const roomRoute = require('express').Router();


roomRoute.delete('/:id', handleDeleteRoomById)
roomRoute.put('/:id', handleUpdateRoomById)
roomRoute.get('/:id', handleGetRoomById)
roomRoute.post('/create', handleCreateRoom)
roomRoute.get('/', handleGetAllRooms)



module.exports = roomRoute