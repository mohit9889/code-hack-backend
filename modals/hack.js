const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    twitter_id: {
      type: String,
    },
    like_count: {
      type: Number,
      default: 0,
    },
    replies: [this],
  },
  { timestamps: true }
);

CommentSchema.add({ replies: [CommentSchema] });

const HackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    code: {
      type: String,
    },
    code_lang: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    twitter_id: {
      type: String,
    },
    like_count: {
      type: Number,
      default: 0,
    },
    comment_count: {
      type: Number,
      default: 0,
    },
    comments: [CommentSchema],
  },
  { timestamps: true }
);

const Hack = mongoose.model("Hack", HackSchema);

module.exports = Hack;
