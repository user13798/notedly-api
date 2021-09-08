require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const jwt = require("jsonwebtoken");

const db = require("./db.js");
const models = require("./models");
const typeDefs = require("./schema.js");
const resolvers = require("./resolvers");

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();

db.connect(DB_HOST);

const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Session invalid");
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);
    console.log(user);
    return { models, user };
  },
});

server.applyMiddleware({ app, path: "/api" });

app.listen(port, () => {
  console.log(
    `GraphQL server running at http://localhost:${port}${server.graphqlPath}`
  );
});
