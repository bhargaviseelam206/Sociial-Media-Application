import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Messages from './pages/Messages'
import Feed from './pages/Feed'
import Login from './pages/Login'
import ChatBox from './pages/ChatBox'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Login/>}>
          <Route index element={<Feed/>}/>
           <Route path='messages' element={<Messages/>}/>
            <Route path='messages/:userId' element={<ChatBox/>}/>
            <Route path='messages' element={<Messages/>}/>
            <Route path='discover' element={<Discover/>}/>
            <Route path='profile' element={<Profile/>}/>
            <Route path='Profile/:profileId' element={<Messages/>}/>
            <Route path='create-post' element={<CreatePost/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
