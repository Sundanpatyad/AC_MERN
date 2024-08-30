import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Search, Send, Menu } from 'lucide-react';
import { chatEndPoints } from '../../../services/apis';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { GET_CHATS, SEARCH_USERS, CREATE_CHAT } = chatEndPoints;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(GET_CHATS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data);
        setFilteredChats(response.data);
      } catch (err) {
        setError('Failed to load chats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [token, GET_CHATS]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleUserSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const filtered = chats.filter((chat) => {
      const instructorEmail = chat.instructor?.email || '';
      const userEmail = chat.user?.email || '';
      return (
        instructorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredChats(filtered);
  }, [searchTerm, chats]);

  const handleUserSearch = async () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${SEARCH_USERS}/search?query=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
    } catch (err) {
      setError('Failed to search users. Please try again later.');
    }
  };

  const handleCreateChat = async (targetUserEmail) => {
    try {
      const response = await axios.post(
        CREATE_CHAT,
        { targetUserEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chat/${response.data._id}`);
    } catch (err) {
      console.error('Failed to create or get chat:', err.response.data.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-lg text-gray-300">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-lg text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold  sm:text-2xl">Chats</h2>
        </div>
      </div>
      <div className="relative p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {searchResults.length > 0 && (
          <ul className="absolute left-0 right-0 mt-2 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto z-10">
            {searchResults.map((user) => (
              <li
                key={user._id}
                className="p-3 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleCreateChat(user.email)}
              >
                <span className="block text-gray-200 truncate">
                  {user.firstName} {user.lastName} - {user.email}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ul className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            const lastMessageContent = lastMessage ? lastMessage.content : 'No messages yet';
            const displayName = chat.instructor ? chat.instructor.email : chat.user.email;

            return (
              <li key={chat._id} className="hover:bg-gray-800">
                <Link to={`/chat/${chat._id}`} className="flex items-center p-3 sm:p-4 border-b border-gray-700">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-100 truncate">{displayName}</span>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {moment(chat.lastUpdated).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{lastMessageContent}</p>
                  </div>
                </Link>
              </li>
            );
          })
        ) : (
          <li className="p-4 text-center text-gray-400">No chats available.</li>
        )}
      </ul>
    </div>
  );
};

export default ChatList;