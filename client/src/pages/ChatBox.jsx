import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, SendHorizontal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice'
import toast from 'react-hot-toast'

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages)
  const { userId } = useParams() // other user
  const { userId: loggedInUserId, getToken } = useAuth() // logged-in user
  const dispatch = useDispatch()

  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(null)
  const messagesEndRef = useRef(null)

  const connections = useSelector((state) => state.connections.connections)

  // ✅ fetch both users' messages
  const fetchUserMessages = async () => {
    try {
      const token = await getToken()
      dispatch(fetchMessages({
        token,
        fromUserId: loggedInUserId,
        toUserId: userId
      }))
    } catch (error) {
      toast.error(error.message)
    }
  }

  // ✅ send message
  const sendMessage = async () => {
    try {
      if (!text && !image) return

      const token = await getToken()
      const formData = new FormData()
      formData.append('to_user_id', userId)
      formData.append('text', text)
      image && formData.append('image', image)

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setText('')
        setImage(null)

        // ✅ Always keep consistent populated format
        const message = {
          ...data.message,
          from_user_id: { _id: loggedInUserId } // ensure _id is available
        }
        dispatch(addMessage(message))
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // ✅ fetch on mount & reset on cleanup
  useEffect(() => {
    fetchUserMessages()
  }, [userId])

  // ✅ set current chat user
  useEffect(() => {
    if (connections.length > 0) {
      const user = connections.find(connection => connection._id === userId)
      setUser(user)
    }
  }, [connections, userId])

  // ✅ auto scroll down
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return user && (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r 
      from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={user.profile_picture} alt="" className='size-8 rounded-full' />
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5'>@{user.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className='p-5 md:px-10 h-full overflow-y-scroll'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {
            messages
              .slice()
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // ✅ oldest first
              .map((message, index) => {
                const isOwn = message.from_user_id?._id === loggedInUserId
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow 
                      ${isOwn ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                      {
                        message.message_type === 'image' &&
                        <img
                          src={message.media_url}
                          className='w-full max-w-sm rounded-lg mb-1'
                          alt=""
                        />
                      }
                      <p>{message.text}</p>
                    </div>
                  </div>
                )
              })
          }
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className='px-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
          <input
            type="text"
            className='flex-1 outline-none text-slate-700'
            placeholder='Type a message...'
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
          />

          <label htmlFor='image'>
            {
              image
                ? <img src={URL.createObjectURL(image)} alt="" className='h-8 rounded' />
                : <ImageIcon className='size-7 text-gray-400 cursor-pointer' />
            }
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          <button
            onClick={sendMessage}
            className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full'
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
