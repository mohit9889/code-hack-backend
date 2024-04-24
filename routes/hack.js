const express = require("express");
const router = express.Router();
const Hack = require("../modals/hack");

// POST route to save hacks
router.post("/hacks", async (req, res) => {
  try {
    // Create a new hack object from request body
    const newHack = new Hack({
      title: req.body.title,
      description: req.body.description,
      code: req.body.code,
      code_lang: req.body.code_lang,
      user_name: req.body.user_name,
      twitter_id: req.body.twitter_id,
    });

    // Save the new hack to the database
    await newHack.save();

    // Send success response
    res.status(200).json({ message: "Your Hack is saved!" });
  } catch (error) {
    // Send error response if saving fails
    res.status(400).json({ message: error.message });
  }
});

// POST route to increment the like count for a hack
router.post("/hacks/:id/like", async (req, res) => {
  const hackId = req.params.id;

  try {
    // Find the hack by ID in the database
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: "Hack not found" });
    }

    // Increment the like count
    hack.like_count++;

    // Save the updated hack
    await hack.save();

    // Send success response
    res.status(200).json({ message: `Hack Liked` });
  } catch (error) {
    // Send error response if incrementing like count fails
    res.status(400).json({ message: error.message });
  }
});

// POST route to decrement the like count for a hack
router.post("/hacks/:id/dislike", async (req, res) => {
  const hackId = req.params.id;

  try {
    // Find the hack by ID in the database
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: "Hack not found" });
    }

    // Decrement the like count (if greater than 0)
    hack.like_count--;

    // Save the updated hack
    await hack.save();

    // Send success response
    res.status(200).json({ message: `Hack Disliked` });
  } catch (error) {
    // Send error response if decrementing like count fails
    res.status(400).json({ message: error.message });
  }
});

// POST route to add a comment to a hack
router.post("/hacks/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { comment, user_name, twitter_id, replyTo } = req.body;

  try {
    const hack = await Hack.findById(id);
    if (!hack) {
      return res.status(404).json({ message: "Hack not found" });
    }

    // Prepare new comment object
    const newComment = {
      comment,
      user_name,
      twitter_id,
      replies: [],
    };

    // Check if it's a reply to an existing comment or a reply
    if (replyTo) {
      const parentComment = findParentComment(hack.comments, replyTo);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      parentComment.replies.push(newComment); // Add the new comment as a reply
    } else {
      hack.comments.push(newComment); // Add the new comment to the top-level comments array
    }

    // Increment comment count and save the hack
    hack.comment_count += 1;
    await hack.save();

    // Send success response
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    // Send error response if adding comment fails
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST route to increment the like count for a comment or reply
router.post("/hacks/:hackId/comments/:commentId/like", async (req, res) => {
  const { hackId, commentId } = req.params;

  try {
    // Find the hack by ID in the database
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: "Hack not found" });
    }

    // Recursively find the comment or reply within the hack's comments
    const comment = findParentComment(hack.comments, commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment or reply not found" });
    }

    // Increment the like count for the comment or reply
    comment.like_count++;

    // Save the updated hack
    await hack.save();

    // Send success response
    res.status(200).json({ message: `Comment or reply Liked` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST route to decrement the like count for a comment or reply
router.post("/hacks/:hackId/comments/:commentId/dislike", async (req, res) => {
  const { hackId, commentId } = req.params;

  try {
    // Find the hack by ID in the database
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: "Hack not found" });
    }

    // Recursively find the comment or reply within the hack's comments
    const comment = findParentComment(hack.comments, commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment or reply not found" });
    }

    // Decrement the like count for the comment or reply (if greater than 0)
    if (comment.like_count > 0) {
      comment.like_count--;
    }

    // Save the updated hack
    await hack.save();

    // Send success response
    res.status(200).json({ message: `Comment or reply Disliked` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Recursive function to find the parent comment
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

// GET route to retrieve all hacks
router.get("/hacks", async (req, res) => {
  try {
    // Retrieve all hacks from the database
    const hacks = await Hack.find();

    // Send success response with retrieved hacks
    res.status(200).json(hacks);
  } catch (error) {
    // Send error response if retrieving hacks fails
    res.status(400).json({ message: error.message });
  }
});

// GET route to retrieve the 50 latest hacks by creation time
router.get("/hacks/new", async (req, res) => {
  try {
    // Retrieve the 50 latest hacks from the database, sorted by creation time
    const latestHacks = await Hack.find().sort({ created_at: -1 }).limit(50);

    // Send success response with retrieved hacks
    res.status(200).json(latestHacks);
  } catch (error) {
    // Send error response if retrieving hacks fails
    res.status(400).json({ message: error.message });
  }
});

// GET route to retrieve hacks in descending order by like count
router.get("/hacks/top", async (req, res) => {
  try {
    // Retrieve hacks from the database, sorted by like count in descending order
    const sortedHacks = await Hack.find().sort({ like_count: -1 });

    // Send success response with retrieved hacks
    res.json(sortedHacks);
  } catch (error) {
    // Send error response if retrieving hacks fails
    res.status(500).json({ message: error.message });
  }
});

// GET route to retrieve a single hack by ID
router.get("/hacks/:id", async (req, res) => {
  const hackId = req.params.id;

  try {
    // Find the hack by ID in the database
    const hack = await Hack.findById(hackId);

    if (!hack) {
      return res.status(404).json({ message: "Hack not found" });
    }

    // Send success response with retrieved hack
    res.status(200).json(hack);
  } catch (error) {
    // Send error response if retrieving hack fails
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;