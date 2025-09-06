import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Messages from './pages/Messages'
import Feed from './pages/Feed'
import Login from './pages/Login'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import {useUser, useAuth} from '@clerk/clerk-react'
import Layout from './pages/Layout'
import {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'

const App = () => {
  const { user } = useUser()
  const {getToken} = useAuth()

  const dispatch = useDispatch()

  useEffect(()=>{
    const fetchData = async () => {
      if(user){
        const token = await getToken()
        dispatch(fetchUser(token))
      }
    }
    fetchData()
   
  },[user, getToken, dispatch])

  return (
   
    <>
      <Toaster/>
      <Routes>
        <Route path='/' element={ !user ? <Login/>:<Layout/>}>
          <Route index element={<Feed/>}/>
           <Route path='messages' element={<Messages/>}/>
            <Route path='messages/:userId' element={<ChatBox/>}/>
            <Route path='connections' element={<Connections/>}/>
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
