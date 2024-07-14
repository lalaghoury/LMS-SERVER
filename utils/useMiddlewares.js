const useMiddlewares = (app) => {
  // Configuring Express JSON
  const useJson = require("../middlewares/json");
  useJson(app);

  // Configuring CORS
  const useCors = require("../middlewares/cors");
  useCors(app);

  // Configuring Cookie Parser
  const useCookieParser = require("../middlewares/cookie-parser");
  useCookieParser(app);

  // Configuring Passport
  const usePassport = require("../middlewares/passport");
  usePassport(app);
};

module.exports = useMiddlewares;
