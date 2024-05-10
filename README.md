# JavaScript Hacks API

Welcome to the JavaScript Hacks API repository. This Node.js backend is designed to manage and serve data for a platform showcasing JavaScript tricks and hacks. It supports operations such as adding new hacks, retrieving the hottest, newest, and top-rated tricks, and maintaining user interactions.

## Features

- **RESTful API**: Provides REST API endpoints for managing JavaScript hacks.
- **Database Integration**: Connects with a MongoDB database to store and retrieve hacks.
- **User Comments**: Allows users to comment on individual hacks and reply to comments, facilitating an interactive community dialogue.
- **Likes/Dislikes**: Users can express their opinions on hacks and comments by liking or disliking them.
- **Reporting System**: Users can report inappropriate hacks or comments, which helps maintain the quality and integrity of the content.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm installed on your computer. Node.js 12.x or newer is recommended.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mohit9889/code-hack-backend.git
   ```

2. Go into the repository:
   ```bash
   cd code-hack-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the server:
   ```bash
   npm run dev
   ```
   This will start the Node.js server on the defined PORT, defaulting to 3000.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.

- `DB_URL` - Your MongoDB connection string.

### Example `.env` File

```plaintext
# Configuration for the Next app
DB_URL=mongodb+srv://<user_name>:<password>@clusterXYZ.dsjabxohsgdhgah.mongodb.net/?retryWrites=true&w=majority
```
