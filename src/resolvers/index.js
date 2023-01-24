const Query = require("./query.js");
const Mutation = require("./mutation.js");
const Note = require("./note.js");
const User = require("./user.js");
const { GraphQLDateTime } = require("graphql-iso-date");

module.exports = {
  Query,
  Mutation,
  Note,
  User,
  DateTime: GraphQLDateTime,
};
