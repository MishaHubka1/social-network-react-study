import { usersAPI } from "../api/api";
import { updateObjectInArray } from "../utils/validators/object-helpers";
const FOLLOW = "network/users/FOLLOW";
const UNFOLLOW = "network/users/UNFOLLOW";
const SET_USERS = "network/users/SET_USERS";
const SET_CURRENT_PAGE = "network/users/SET_CURRENT_PAGE";
const SET_TOTAL_USERS_COUNT = "network/users/SET_TOTAL_USERS_COUNT";
const TOGGLE_IS_FETCHING = "network/users/TOGGLE_IS_FETCHING";
const TOGGLE_IS_FOLLOWING_PROGRESS = "network/users/TOGGLE_IS_FOLLOWING_PROGRESS";

let initialState = {
  users: [],
  pageSize: 10,
  totalUsersCount: 0,
  currentPage: 1,
  isFetching: true,
  followingInProgress: [],
};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case FOLLOW:
      return {
        ...state,
        users: updateObjectInArray(state.users, action.userId, "id", {followed: true})
      };

    case UNFOLLOW:
      return {
        ...state,
        users: updateObjectInArray(state.users, action.userId, "id", {followed: false})
      };

    case SET_USERS: {
      return { ...state, users: action.users };
    }

    case SET_CURRENT_PAGE: {
      return { ...state, currentPage: action.currentPage };
    }
    case SET_TOTAL_USERS_COUNT: {
      return { ...state, totalUsersCount: action.count };
    }
    case TOGGLE_IS_FETCHING: {
      return { ...state, isFetching: action.isFetching };
    }
    case TOGGLE_IS_FOLLOWING_PROGRESS: {
      return {
        ...state,
        followingInProgress: action.isFetching
          ? [...state.followingInProgress, action.userId]
          : state.followingInProgress.filter((id) => id != action.userId),
      };
    }

    default:
      return state;
  }
};

export const followSuccess = (userId) => ({ type: FOLLOW, userId });
export const unfollowSuccess = (userId) => ({ type: UNFOLLOW, userId });
export const setUsers = (users) => ({ type: SET_USERS, users });
export const setCurrentPage = (currentPage) => ({
  type: SET_CURRENT_PAGE,
  currentPage,
});
export const setTotalUsersCount = (totalUsersCount) => ({
  type: SET_TOTAL_USERS_COUNT,
  count: totalUsersCount,
});
export const toggleIsFetching = (isFetching) => ({
  type: TOGGLE_IS_FETCHING,
  isFetching,
});
export const toggleFollowingProgress = (isFetching, userId) => ({
  type: TOGGLE_IS_FOLLOWING_PROGRESS,
  isFetching,
  userId,
});

export const requestUsers = (page, pageSize) => {
  return async (dispach) => {
    dispach(toggleIsFetching(true));
    dispach(setCurrentPage(page));
    let data = await usersAPI.getUsers(page, pageSize);
    dispach(toggleIsFetching(false));
    dispach(setUsers(data.items));
    dispach(setTotalUsersCount(data.totalCount));
  };
};

const followUnfollowFlow = async (
  dispatch,
  userId,
  apiMetod,
  actionCreator
) => {
  dispatch(toggleFollowingProgress(true, userId));
  let response = await apiMetod(userId);
  if (response.data.resultCode == 0) {
    dispatch(actionCreator(userId));
  }
  dispatch(toggleFollowingProgress(false, userId));
};

export const follow = (userId) => {
  return async (dispach) => {
    followUnfollowFlow(
      dispach,
      userId,
      usersAPI.follow.bind(usersAPI),
      followSuccess
    );
  };
};

export const unfollow = (userId) => {
  return async (dispach) => {
    followUnfollowFlow(
      dispach,
      userId,
      usersAPI.unfollow.bind(usersAPI),
      unfollowSuccess
    );
  };
};

export default usersReducer;