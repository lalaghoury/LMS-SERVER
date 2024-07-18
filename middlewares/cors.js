const cors = require("cors");

const useCors = (app) => {
  app.use(
    cors({
      origin: ["http://localhost:3000", "*"],
      credentials: true,
    })
  );
};

module.exports = useCors;
