import {
  DataConnect,
  MutationRef,
  MutationPromise,
  QueryRef,
  QueryPromise
} from "firebase/data-connect";

export const connectorConfig = {
  connector: "example",
  service: "manutenzioni-app",
  location: "us-central1"
};

// 🧠 Factory generica per mutation
function createMutation<TData, TVars>(operationName: string) {
  const ref = (dc: DataConnect, vars: TVars): MutationRef<TData, TVars> =>
    dc.mutation(operationName, vars);
  const exec = (dc: DataConnect, vars: TVars): MutationPromise<TData, TVars> =>
    dc.runMutation(operationName, vars);
  return { ref, exec, operationName };
}

// 🧠 Factory generica per query
function createQuery<TData, TVars = undefined>(operationName: string) {
  const ref = (dc: DataConnect, vars?: TVars): QueryRef<TData, TVars> =>
    dc.query(operationName, vars);
  const exec = (dc: DataConnect, vars?: TVars): QueryPromise<TData, TVars> =>
    dc.runQuery(operationName, vars);
  return { ref, exec, operationName };
}

// 🎬 Movies
export const movies = {
  create: createMutation<CreateMovieData, CreateMovieVariables>("CreateMovie"),
  list: createQuery<ListMoviesData>("ListMovies"),
  getById: createQuery<GetMovieByIdData, GetMovieByIdVariables>("GetMovieById"),
  search: createQuery<SearchMovieData, SearchMovieVariables>("SearchMovie")
};

// 👤 Users
export const users = {
  upsert: createMutation<UpsertUserData, UpsertUserVariables>("UpsertUser"),
  list: createQuery<ListUsersData>("ListUsers"),
  reviews: createQuery<ListUserReviewsData>("ListUserReviews")
};

// 📝 Reviews
export const reviews = {
  add: createMutation<AddReviewData, AddReviewVariables>("AddReview"),
  delete: createMutation<DeleteReviewData, DeleteReviewVariables>("DeleteReview")
};