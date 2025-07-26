// third-party
import { configureStore } from "@reduxjs/toolkit";
import reducers from "./reducers";
import { useDispatch, useSelector } from "react-redux";
// project import

// ==============================|| REDUX TOOLKIT - MAIN STORE ||============================== //

const store = configureStore({
  reducer: reducers,
});

const { dispatch } = store;

export { store, dispatch };

export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
