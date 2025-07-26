export const getUserFromId = (userList, userId) => {
  const user = userList.find((user) => user.id === userId);
  return user ? user : { id: userId, name: "Noname" };
};
