import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoMdAttach } from "react-icons/io";
import { MdSend } from 'react-icons/md';
import { chatEndPoints } from '../../../services/apis';

const {SEND_MESSAGES , FETCH_MESSAGES } = chatEndPoints;

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
      <div className="bg-black dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative  text-gray-100 h-screen pb-16 md:pb-4 flex flex-col">
        <h2 className="text-xl font-semibold p-2">Chat</h2>
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto p-2">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender._id === userId ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`p-2 rounded-lg max-w-[70%] ${
                  msg.sender._id === userId ? 'bg-blue-600' : 'bg-gray-700'
                }`}>
                  <p className="font-semibold text-sm">{msg.sender.firstName}</p>
                  <p className="text-sm mt-1">{msg.content}</p>
                  {msg.attachments.map((att, i) => (
                    <a key={i} href={att.link} target="_blank" rel="noopener noreferrer" className="block mt-1 text-xs text-blue-300 hover:underline">
                      {att.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        </div>
        <div className="bg-gray-800 p-2 flex flex-col">
    <textarea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Type your message..."
      className="w-full p-2 rounded border border-gray-700 bg-gray-700 text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      rows="2"
    />
    {showAttachment && (
      <div className="mt-2 space-y-2">
        <input
          type="text"
          value={attachmentName}
          onChange={(e) => setAttachmentName(e.target.value)}
          placeholder="Attachment name"
          className="w-full p-1 rounded border border-gray-700 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <input
          type="text"
          value={attachmentLink}
          onChange={(e) => setAttachmentLink(e.target.value)}
          placeholder="Attachment link"
          className="w-full p-1 rounded border border-gray-700 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    )}
    <div className="flex items-center mt-2">
      <button
        onClick={() => setShowAttachment(!showAttachment)}
        className="p-2 rounded-full hover:bg-gray-700 transition-colors mr-2"
      >
        <IoMdAttach size={20} color="white" />
      </button>
      <button
        onClick={sendMessage}
        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <MdSend size={20} />
      </button>
    </div>
  </div>
      </div>
    );
  };
  
  export default ChatWindow;