const Query = require("./query.js");
const Mutation = require("./mutation.js");
const { GraphQLDateTime } = require("graphql-iso-date");

module.exports = {
  Query,
  Mutation,
  DateTime: GraphQLDateTime,
};
