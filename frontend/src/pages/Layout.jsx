import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Login from './Login'

const Layout = () => {
  const { user, loading } = useSelector(state => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return <Loader />
  }

  return (
    <div>
      {
        user ? (
          <div className='min-h-screen bg-black'>
            <Navbar/>
            <Outlet />
          </div>
        )
        : <Login />
      }
    </div>
  )
}

export default Layout
