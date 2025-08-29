const {
  queryRef,
  executeQuery,
  mutationRef,
  executeMutation,
  validateArgs
} = require("firebase/data-connect");

// 🔧 Configurazione del connettore
const connectorConfig = {
  connector: "example",
  service: "manutenzioni-app",
  location: "us-central1"
};
exports.connectorConfig = connectorConfig;

// 🧠 Factory generica per mutation
const buildMutation = (operationName) => {
  const ref = (dcOrVars, vars) => {
    const { dc, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
    dc._useGeneratedSdk();
    return mutationRef(dc, operationName, inputVars);
  };
  ref.operationName = operationName;
  const exec = (dcOrVars, vars) => executeMutation(ref(dcOrVars, vars));
  return { ref, exec };
};

// 🧠 Factory generica per query
const buildQuery = (operationName) => {
  const ref = (dcOrVars, vars) => {
    const { dc, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars);
    dc._useGeneratedSdk();
    return queryRef(dc, operationName, inputVars);
  };
  ref.operationName = operationName;
  const exec = (dcOrVars, vars) => executeQuery(ref(dcOrVars, vars));
  return { ref, exec };
};

// 📡 Operazioni registrate
const operations = {
  createMovie: buildMutation("CreateMovie"),
  upsertUser: buildMutation("UpsertUser"),
  addReview: buildMutation("AddReview"),
  deleteReview: buildMutation("DeleteReview"),
  listMovies: buildQuery("ListMovies"),
  listUsers: buildQuery("ListUsers"),
  listUserReviews: buildQuery("ListUserReviews"),
  getMovieById: buildQuery("GetMovieById"),
  searchMovie: buildQuery("SearchMovie")
};

exports.operations = operations;

// 🔁 Esportazioni dirette
Object.entries(operations).forEach(([key, { ref, exec }]) => {
  exports[`${key}Ref`] = ref;
  exports[key] = exec;
});