import express from 'express';
import { sendMessage, sseController } from '../controllers/messageController.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController)
messageRouter.post('/send', upload.single('image'), ProcessingInstruction, sendMessage)
messageRouter.post('/get', protect, getChatMessages )

export default messageRouter