import { Lock, Mail, User2Icon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../configs/api.js'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice.js'
import toast from 'react-hot-toast'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const query = new URLSearchParams(window.location.search)
  const urlState = query.get('state')
  const [state, setState] = React.useState(urlState || "login")

  const [data, setData] = React.useState({
      name: '',
      email: '',
      password: ''
  })

  const onChangeHandler = (e) => {
      setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        // For login: send only email & password
        // For register: send name, email & password
        const payload = state === 'login' 
          ? { email: data.email, password: data.password }
          : { name: data.name, email: data.email, password: data.password }

        const { data: responseData } = await api.post(`/users/${state}`, payload)
        dispatch(login(responseData))
        localStorage.setItem('token', responseData.token)
        toast.success(responseData.message)
        
        navigate('/app')
        
      } catch (error) {
        console.error('Error:', error)
        toast.error(error?.response?.data?.message || error.message)
      }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-black'>
        <form 
          onSubmit={handleSubmit}
          className="w-full sm:w-[350px] text-center rounded-2xl px-8 bg-purple-950"
        >
          <h1 className="text-white text-3xl mt-10 font-medium">
            {state === "login" ? "Login" : "Register"}
          </h1>
          <p className="text-purple-200 text-sm mt-2 pb-6">
            Please {state === "login" ? "sign in" : "sign up"} to continue
          </p>

          {/* Name Input (only for register) */}
          {state !== "login" && (
            <div className="flex items-center w-full mt-4 bg-purple-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
              <User2Icon size={16} className="text-purple-400" />
              <input 
                type="text" 
                placeholder="Full Name" 
                className="bg-transparent text-purple-50 placeholder-purple-400 outline-none text-sm w-full h-full border-none" 
                name="name" 
                value={data.name} 
                onChange={onChangeHandler} 
                required 
              />
            </div>
          )}

          {/* Email Input (always show) */}
          <div className="flex items-center w-full mt-4 bg-purple-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <Mail size={16} className="text-purple-400" />
            <input 
              type="email" 
              placeholder="Email" 
              className="bg-transparent text-purple-50 placeholder-purple-400 outline-none text-sm w-full h-full border-none" 
              name="email" 
              value={data.email} 
              onChange={onChangeHandler} 
              required 
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center mt-4 w-full bg-purple-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <Lock size={16} className="text-purple-400" />
            <input 
              type="password" 
              placeholder="Password" 
              className="bg-transparent text-purple-50 placeholder-purple-400 outline-none text-sm w-full h-full border-none" 
              name="password" 
              value={data.password} 
              onChange={onChangeHandler} 
              required 
            />
          </div>

          {/* Forgot Password (only for login) */}
          {state === "login" && (
            <div className="mt-5 text-left">
              <a className="text-sm text-purple-400 hover:text-purple-300 transition" href="#">
                Forgot password?
              </a>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="mt-6 w-full h-11 rounded-full text-white bg-purple-600 hover:bg-purple-500 transition-all font-semibold">
            {state === "login" ? "Login" : "Create Account"}
          </button>

          {/* Toggle Login/Register */}
          <p className="text-purple-200 text-sm mt-3 mb-11">
            {state === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button 
              type="button" 
              className="text-purple-400 hover:text-purple-300 transition font-semibold"
              onClick={() => setState(prev => prev === "login" ? "register" : "login")}
            >
              {state === "login" ? "Register" : "Login"}
            </button>
          </p>
        </form>
    </div>
  )
}

export default Login
