import { Status, SET_USERS, CREATE_USER } from './actions';

const initialState = {
  status: Status.INIT,
  byId: {},
  allIds: []
};

export default function usersReducer(state = initialState, action) {

  switch (action.type) {
    case CREATE_USER: {
      const { user } = action.payload;
      return {
        ...state,
        byId: {
          ...state.byId,
          [user._id]: {
            ...user
          }
        },
        allIds: [...state.allIds, user._id]
      }
    }
    case SET_USERS: {
      const { users } = action.payload || [];
      let userObj = {};

      users.forEach((user) => {
        userObj[user._id] = { ...user };
      })

      return {
        status: Status.LOADED,
        byId: userObj,
        allIds: Object.keys(userObj)
      }
    }
    default:
      return state;
  }
}
