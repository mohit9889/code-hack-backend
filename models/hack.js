import mongoose from 'mongoose';

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
    replies: {
      type: [mongoose.Schema.Types.Mixed], // Allows any nested structure
      default: [],
    },
  },
  { timestamps: true }
);

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
    is_reported: {
      type: Number,
      default: 0,
    },
    offensive_score: {
      type: Number,
      default: 0,
    },
    most_visited: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Hack = mongoose.model('Hack', HackSchema);

export default Hack;
