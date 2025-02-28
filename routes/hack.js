import express from 'express';
import Hack from '../models/hack.js';

const router = express.Router();

/**
 * @route POST /hacks
 * @desc Save a new hack
 * @access Public
 */
router.post('/hacks', async (req, res) => {
  try {
    const newHack = new Hack({
      title: req.body.title,
      description: req.body.description,
      code: req.body.code,
      code_lang: req.body.code_lang,
      user_name: req.body.user_name,
      twitter_id: req.body.twitter_id,
    });

    await newHack.save();
    res.status(200).json({ message: 'Your Hack is saved!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route POST /hacks/:id/like
 * @desc Increment the like count for a hack
 * @param {string} req.params.id - The ID of the hack to like
 * @access Public
 */
router.post('/hacks/:id/like', async (req, res) => {
  const hackId = req.params.id;

  try {
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: 'Hack not found' });
    }

    hack.like_count++;

    await hack.save();
    res.status(200).json({ message: `Hack Liked` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route POST /hacks/:id/dislike
 * @desc Decrement the like count for a hack
 * @param {string} req.params.id - The ID of the hack to dislike
 * @access Public
 */
router.post('/hacks/:id/dislike', async (req, res) => {
  const hackId = req.params.id;

  try {
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: 'Hack not found' });
    }

    // Ensure like count does not go below zero
    if (hack.like_count > 0) {
      hack.like_count--;
    }

    await hack.save();
    res.status(200).json({ message: `Hack Disliked` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route POST /hacks/:id/comments
 * @desc Add a comment to a hack
 * @param {string} req.params.id - The ID of the hack to comment on
 * @param {string} req.body.comment - The comment text
 * @param {string} req.body.user_name - The name of the user posting the comment
 * @param {string} req.body.twitter_id - The Twitter ID of the user (optional)
 * @param {string} [req.body.replyTo] - The ID of the comment to reply to (if applicable)
 * @access Public
 */
router.post('/hacks/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { comment, user_name, twitter_id, replyTo } = req.body;

  try {
    const hack = await Hack.findById(id);
    if (!hack) {
      return res.status(404).json({ message: 'Hack not found' });
    }

    // Prepare new comment object
    const newComment = {
      comment,
      user_name,
      twitter_id,
      replies: [],
    };

    // Check if it's a reply to an existing comment
    if (replyTo) {
      const parentComment = findParentComment(hack.comments, replyTo);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      parentComment.replies.push(newComment); // Add the new comment as a reply
    } else {
      hack.comments.push(newComment); // Add the new comment to the top-level comments array
    }

    // Increment comment count and save the hack
    hack.comment_count += 1;
    await hack.save();

    // Find the saved comment in the updated hack object
    let savedComment;
    if (replyTo) {
      const parentComment = findParentComment(hack.comments, replyTo);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      savedComment = parentComment.replies[0];
    } else {
      const fetchedComment = await Hack.findById(id, {
        comments: { $elemMatch: { comment: comment } },
      });
      savedComment = fetchedComment.comments[0];
    }

    // Send success response
    res.status(200).json({
      message: 'Comment added successfully',
      comment: savedComment,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /hacks/:hackId/comments/:commentId/like
 * @desc Increment the like count for a comment or reply
 * @param {string} req.params.hackId - The ID of the hack containing the comment
 * @param {string} req.params.commentId - The ID of the comment or reply to like
 * @access Public
 */
router.post('/hacks/:hackId/comments/:commentId/like', async (req, res) => {
  const { hackId, commentId } = req.params;

  try {
    // Find the hack by ID in the database
    const hack = await Hack.findById(hackId);
    if (!hack) {
      return res.status(404).json({ message: 'Hack not found' });
    }

    // Recursively find the comment or reply within the hack's comments
    const comment = findParentComment(hack.comments, commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment or reply not found' });
    }

    // Increment the like count for the comment or reply
    comment.like_count++;

    // Save the updated hack
    await hack.save();

    // Send success response
    res.status(200).json({ message: 'Comment or reply Liked' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route POST /hacks/:hackId/comments/:commentId/dislike
 * @desc Decrement the like count for a comment or reply
 * @param {string} req.params.hackId - The ID of the hack containing the comment
 * @param {string} req.params.commentId - The ID of the comment or reply to dislike
 * @access Public
 */
router.post('/hacks/:hackId/comments/:commentId/dislike', async (req, res) => {
  const { hackId, commentId } = req.params;

  try {
    // Find the hack by ID in the database
    const hack = await Hack.findById(hackId);
    if (!hack) {
      return res.status(404).json({ message: 'Hack not found' });
    }

    // Recursively find the comment or reply within the hack's comments
    const comment = findParentComment(hack.comments, commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment or reply not found' });
    }

    // Decrement the like count for the comment or reply (if greater than 0)
    if (comment.like_count > 0) {
      comment.like_count--;
    }

    // Save the updated hack
    await hack.save();

    // Send success response
    res.status(200).json({ message: 'Comment or reply Disliked' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Recursively finds the parent comment or reply within a nested comment structure.
 *
 * @param {Array} comments - The array of comments to search within.
 * @param {string} replyTo - The ID of the comment or reply being searched for.
 * @returns {Object|null} - Returns the found comment object or null if not found.
 */
const findParentComment = (comments, replyTo) => {
  for (const comment of comments) {
    if (comment._id.toString() === replyTo) {
      return comment; // Found the parent comment
    }
    if (comment.replies && comment.replies.length > 0) {
      const parentComment = findParentComment(comment.replies, replyTo);
      if (parentComment) {
        return parentComment; // Found the parent comment in a nested reply
      }
    }
  }
  return null; // Parent comment not found
};

/**
 * @route POST /hacks/:id/report
 * @desc Report a hack, increment the report count, and update the offensive score
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - ID of the hack to report
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */
router.post('/hacks/:id/report', async (req, res) => {
  try {
    const hackId = req.params.id;
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: 'Hack not found' });
    }

    // Increment the report count
    hack.is_reported += 1;

    // Calculate the offensive score with two decimal precision
    hack.offensive_score = parseFloat((hack.is_reported / 5).toFixed(2));

    // Save the updated hack
    await hack.save();

    res.status(200).json({ message: 'Hack reported successfully' });
  } catch (error) {
    console.error('Error reporting hack:', error);
    res.status(400).json({ message: 'Internal server error' });
  }
});

/**
 * @route POST /hacks/:id/visited
 * @desc Increase the most_visited count for a hack
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - ID of the hack being visited
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */
router.post('/hacks/:id/visited', async (req, res) => {
  const hackId = req.params.id;

  try {
    // Find the hack document by ID
    let hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: 'Hack not found' });
    }

    // Increment the most_visited count by one (initialize if undefined)
    hack.most_visited = (hack.most_visited || 0) + 1;

    // Save the updated hack document
    await hack.save();

    return res.status(200).json({ message: 'Visited!' });
  } catch (error) {
    console.error('Error increasing visit count:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /hacks
 * @desc Retrieve all hacks from the database
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing all hacks or an error message
 */
router.get('/hacks', async (req, res) => {
  try {
    const hacks = await Hack.find();
    res.status(200).json(hacks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route GET /hacks/new
 * @desc Retrieve the 50 latest hacks sorted by creation time
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the latest 50 hacks or an error message
 */
router.get('/hacks/new', async (req, res) => {
  try {
    const latestHacks = await Hack.find().sort({ created_at: -1 }).limit(50);
    res.status(200).json(latestHacks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route GET /hacks/top
 * @desc Retrieve hacks sorted by like count in descending order (Top Hacks)
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing hacks sorted by like count or an error message
 */
router.get('/hacks/top', async (req, res) => {
  try {
    const sortedHacks = await Hack.find().sort({ like_count: -1 });
    res.json(sortedHacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route GET /hacks/hot
 * @desc Retrieve hacks sorted by most_visited count in descending order (Hot Hacks)
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing hacks sorted by most_visited or an error message
 */
router.get('/hacks/hot', async (req, res) => {
  try {
    const hacks = await Hack.find().sort({ most_visited: -1 });
    return res.status(200).json(hacks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @route GET /hacks/sitemap
 * @desc Retrieve all hacks to generate sitemap URLs
 * @access Public
 */
router.get('/hacks/sitemap', async (req, res) => {
  try {
    const hacks = await Hack.find({}, 'title _id');
    const sitemapUrls = hacks.map(({ title, _id }) => ({
      url: `${title.replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-${_id}`,
    }));

    res.status(200).json(sitemapUrls);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

/**
 * @route GET /hacks/:id
 * @desc Retrieve a single hack by its ID
 * @access Public
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Hack ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the hack data or an error message
 */
router.get('/hacks/:id', async (req, res) => {
  const hackId = req.params.id;

  try {
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: 'Hack not found', status: 404 });
    }

    res.status(200).json(hack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
