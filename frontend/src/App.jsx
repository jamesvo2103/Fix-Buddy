import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import FixBuddy from './pages/FixBuddy'
import Login from './pages/Login'


const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}/>

        <Route path='/app' element={<Layout />}>
          <Route index element={<Dashboard />}/>
          <Route path='fixbuddy/:fixBuddyId' element={<FixBuddy />}/>
        </Route>

        <Route path='/login' element={<Login />}/>
      </Routes>
    </>
  )
}

export default App
