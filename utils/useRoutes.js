const useRoutes = (app) => {
  // Welcome Route
  app.get("/", (req, res) => {
    res.send("Assalom-Alaikum! Euphoria Backend API");
  });

  // User Routes
  const userRouter = require("../routes/user");
  app.use("/api/users", userRouter);

  // Auth Routes
  const authRouter = require("../routes/auth");
  app.use("/api/auth", authRouter);

  // batch Routes
  const batchRouter = require("../routes/batch");
  app.use("/api/batches", batchRouter);

  // batch invitation routes
  const invitationRouter = require("../routes/invitation");
  app.use("/api/batches/invitation", invitationRouter);

  // Assignment Routes
  const assignmentRouter = require("../routes/assignment");
  app.use("/api/batches/assignments", assignmentRouter);
 
  // Student Routes
  const studentsRouter = require("../routes/students");
  app.use("/api/batches/students", studentsRouter);

  // Image Routes
  const imageRouter = require("../routes/image");
  app.use("/api/images", imageRouter);
};

module.exports = useRoutes;
