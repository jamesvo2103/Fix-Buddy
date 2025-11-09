import { Lock, Mail, User2Icon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../configs/api.js'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice.js'
import toast from 'react-hot-toast'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()  // ✅ Added

  const query = new URLSearchParams(window.location.search)
  const urlState = query.get('state')
  const [state, setState] = React.useState(urlState || "login")

  const [formData, setFormData] = React.useState({
      name: '',
      email: '',
      password: ''
  })

  const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        const { data } = await api.post(`/api/users/${state}`, formData)
        dispatch(login(data))  // ✅ Dispatches both token and user
        localStorage.setItem('token', data.token)
        toast.success(data.message)
        
        // ✅ REDIRECT TO DASHBOARD AFTER LOGIN
        navigate('/app')
        
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message)
      }
  }

  const handleChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-black'>
        <form onSubmit={handleSubmit} className="sm:w-[350px] w-full text-center border border-purple-700/40 rounded-2xl px-8 bg-purple-950">
          <h1 className="text-white text-3xl mt-10 font-medium">{state === "login" ? "Login" : "Sign up"}</h1>
          <p className="text-purple-200 text-sm mt-2">Please {state} to continue</p>
          
          {state !== "login" && (
              <div className="flex items-center mt-6 w-full bg-purple-900 border border-purple-700/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
                  <User2Icon size={16} color='#c084fc'/>
                  <input type="text" name="name" placeholder="Name" className="bg-transparent text-purple-50 placeholder-purple-400 outline-none ring-0 border-none w-full" value={formData.name} onChange={handleChange} required />
              </div>
          )}
          
          <div className="flex items-center w-full mt-4 bg-purple-900 border border-purple-700/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <Mail size={13} color='#c084fc'/>
              <input type="email" name="email" placeholder="Email" className="bg-transparent text-purple-50 placeholder-purple-400 outline-none ring-0 border-none w-full" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="flex items-center mt-4 w-full bg-purple-900 border border-purple-700/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <Lock size={13} color='#c084fc'/>
              <input type="password" name="password" placeholder="Password" className="bg-transparent text-purple-50 placeholder-purple-400 outline-none ring-0 border-none w-full" value={formData.password} onChange={handleChange} required />
          </div>
          
          <div className="mt-4 text-left">
              <button className="text-sm text-purple-300 hover:text-purple-200 transition" type="reset">Forget password?</button>
          </div>
          
          <button type="submit" className="mt-2 w-full h-11 rounded-full text-white bg-purple-600 hover:bg-purple-500 transition-colors">
              {state === "login" ? "Login" : "Sign up"}
          </button>
          
          <p className="text-purple-200 text-sm mt-3 mb-11">
            {state === "login" ? "Don't have an account?" : "Already have an account?"} 
            <button type="button" onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-purple-300 hover:text-purple-200 transition ml-1">
              {state === "login" ? "Sign up" : "Login"}
            </button>
          </p>
      </form>
    </div>
  )
}

export default Login
