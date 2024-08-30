import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoMdAttach } from "react-icons/io";
import { MdSend } from 'react-icons/md';
import { chatEndPoints } from '../../../services/apis';

const { SEND_MESSAGES, FETCH_MESSAGES } = chatEndPoints;

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentLink, setAttachmentLink] = useState('');
  const [showAttachment, setShowAttachment] = useState(false);
  const { chatId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const userId = user._id;
  const messageEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [chatId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${FETCH_MESSAGES}/${chatId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && !attachmentLink) return;
    try {
      const response = await axios.post(
        `${SEND_MESSAGES}/${chatId}`,
        { content: message, attachmentName, attachmentLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.messages);
      setMessage('');
      setAttachmentName('');
      setAttachmentLink('');
      setShowAttachment(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-black  h-[100vh] pt-16 fixed w-full flex flex-col">
      <h2 className="text-xl font-semibold p-4 bg-zinc-900">Chat</h2>
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender._id === userId ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[70%] ${
                msg.sender._id === userId ? 'bg-slate-200 text-black' : 'bg-zinc-700 text-white'
              } shadow-md`}>
                <p className="font-semibold text-sm mb-1">{msg.sender.firstName}</p>
                <p className="text-sm">{msg.content}</p>
                {msg.attachments.map((att, i) => (
                  <a key={i} href={att.link} target="_blank" rel="noopener noreferrer" className="block mt-2 text-xs text-blue-300 hover:underline">
                    {att.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      </div>
      <div className="bg-zinc-900 pb-16 md:pb-2 p-4">
        <div className="flex items-center space-x-2 bg-zinc-700 rounded-lg p-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-grow bg-transparent text-gray-100 resize-none focus:outline-none text-sm"
            rows="1"
          />
          <button
            onClick={() => setShowAttachment(!showAttachment)}
            className="p-2 rounded-full hover:bg-gray-600 transition-colors"
          >
            <IoMdAttach size={20} color="white" />
          </button>
          <button
            onClick={sendMessage}
            className="bg-white text-black p-2 rounded-full flex items-center justify-center"
          >
            <MdSend size={20} />
          </button>
        </div>
        {showAttachment && (
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Attachment name"
              className="flex-1 p-2 rounded border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              value={attachmentLink}
              onChange={(e) => setAttachmentLink(e.target.value)}
              placeholder="Attachment link"
              className="flex-1 p-2 rounded border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;