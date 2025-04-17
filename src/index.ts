import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello from DRA BE");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
