import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import Listing from "../models/Listing.js";

export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "firstName lastName email")
      .populate("listingId", "title createdBy image")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("GET USER CONVERSATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

export const createOrGetConversation = async (req, res) => {
  try {
    const { senderId, recipientId, listingId } = req.body;

    if (!senderId || !recipientId || !listingId) {
      return res.status(400).json({
        message: "senderId, recipientId, and listingId are required",
      });
    }

    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);
    const listing = await Listing.findById(listingId);

    if (!sender || !recipient || !listing) {
      return res.status(404).json({
        message: "Sender, recipient, or listing not found",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId], $size: 2 },
      listingId,
    })
      .populate("participants", "firstName lastName email")
      .populate("listingId", "title createdBy image");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        listingId,
        messages: [],
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "firstName lastName email")
        .populate("listingId", "title createdBy image");
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("CREATE OR GET CONVERSATION ERROR:", error);
    res.status(500).json({ message: "Failed to create or fetch conversation" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, text } = req.body;

    if (!senderId || !text?.trim()) {
      return res.status(400).json({ message: "senderId and text are required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.messages.push({
      senderId: new mongoose.Types.ObjectId(senderId),
      text: text.trim(),
    });

    await conversation.save();

    const updatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "firstName lastName email")
      .populate("listingId", "title createdBy image");

    res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};