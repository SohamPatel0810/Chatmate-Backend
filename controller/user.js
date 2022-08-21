const users = [];

const addUser = ({ id, name, room }) => {
  // Convert the name and room name as a single entity
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Find if such user already exists
  const userExists = users.find((user) => {
    user.name === name && user.room === room;
  });
  if (userExists) {
    return {
      error: "Username is already taken",
    };
  }
  const user = {
    id,
    name,
    room,
  };
  users.push(user);
  return {
    user
  };
};

const findUser = (id) => users.find((user) => user.id === id);


const getRoomUsers = (room) => users.filter((user) => user.room === room);


const deleteUser = (id) => {
  const user = users.findIndex((user) =>
    user.id === id
  );
  if (user !== -1) {
    return users.splice(user, 1)[0];
  } else {
    return {
      error: "User doesn't exists",
    };
  }
};

module.exports = { addUser, findUser, getRoomUsers, deleteUser };
