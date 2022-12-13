import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";

const app = express();
app.use(helmet());
app.use(express.json());

const users = [
  {
    id: 1,
    email: "david@wcs.dev",
    password: "wilder123",
    secretNote: "Grumpy Cat pretends to be grumpy",
  },
  {
    id: 2,
    email: "pierre@wcs.dev",
    password: "grumpycat",
    secretNote: "My new movie is coming out next week",
  },
];

// In practice you should get this from a .env and it should only be known to the backend
const JWT_SECRET = "öikuedhdfgvöokndaöjkfbvöijasdäoflngkölansmdf";

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (user == null) {
    res.sendStatus(404);
    return;
  }

  if (password !== user.password) {
    res.sendStatus(403);
    return;
  }

  const token = jwt.sign(
    {
      sub: user.id,
    },
    JWT_SECRET,
    {
      expiresIn: "1 hour",
    }
  );

  res.json({
    token: token,
  });
});

app.get("/api/users/:userId/secret_note", (req, res) => {
  const { userId } = req.params;

  const authorization = req.get("Authorization");
  if(authorization == null) {
    res.sendStatus(401);
    return;
  }

  const [type, token] = authorization.split(" ");
  if (type !== "Bearer") {
    res.sendStatus(401);
    return;
  }

  const authenticatedSubject = jwt.verify(token, JWT_SECRET);

  // jwt.verify(token, JWT_SECRET, (error, payload) => {
  //   console.log(error, payload);
  // })

  // console.log(authenticatedSubject, userId);
  if (parseInt(authenticatedSubject.sub) !== parseInt(userId)) {
    res.sendStatus(403);
    return;
  }

  const user = users.find((u) => (u.id === parseInt(userId)));

  res.json({
    secret_note: user.secretNote,
  });
});

app.listen(5050, () => {
  console.log("Express listening on http://localhost:5050");
});
