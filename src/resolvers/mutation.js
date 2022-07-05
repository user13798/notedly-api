require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");
const mongoose = require("mongoose");

const gravatar = require("../util/gravatar");

module.exports = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to create a note");
    }

    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id),
    });
  },
  updateNote: async (parent, { id, content }, { models, user }) => {
    // if not a user, throw an Authentication Error
    if (!user) {
      throw new AuthenticationError("You must be signed in to update a note");
    }

    // find the note
    const note = await models.Note.findById(id);
    // if the note owner and current user don't match, throw a forbidden error
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the note");
    }

    // Update the note in the db and return the updated note
    return await models.Note.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    // if not a user, throw an Authentication Error
    if (!user) {
      throw new AuthenticationError("You must be signed in to delete a note");
    }

    // find the note
    const note = await models.Note.findById(id);
    // if the note owner and current user don't match, throw a forbidden error
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to delete the note");
    }

    try {
      // if everything checks out, remove the note
      await note.remove();
      return true;
    } catch (err) {
      // if there's an error along the way, return false
      return false;
    }
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    // normalize email address
    email = email.trim().toLowerCase();

    // hash the password
    const hashed = await bcrypt.hash(password, 10);

    // create the gravatar url
    const avatar = gravatar(email);

    try {
      const user = await models.User.create({
        username,
        email,
        password: hashed,
        avatar,
      });

      // create and return the json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (error) {
      console.log(error);
      // if there's a problem creating the account, throw an error
      throw new Error("Error creating account");
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      // normalize email address
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ username }, { email }],
    });

    // if no user is found, throw an authentication error
    if (!user) {
      throw new AuthenticationError("Error signing in");
    }

    // if the passwords don't match, throw an authentication error
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError("Error signing in");
    }

    // create and return json web token
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },
};
