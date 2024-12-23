const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const audioRoutes = require("./routes/audioRoutes");
const homeRoutes = require("./routes/homeRoutes");
const errorHandler = require("./utils/errorHandler");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/", homeRoutes);
app.use("/api/v1", audioRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
