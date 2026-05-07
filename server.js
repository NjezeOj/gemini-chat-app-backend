import express from 'express';
import cors from 'cors';
import chatRouter from './src/chatRouter.js';

// Create Express app
const app = express();

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
  res.send('Chat App Backend is running');
});

app.use('/api', chatRouter);

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// prepare proper curl command
// curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message":"Hello, how are you?"}'
