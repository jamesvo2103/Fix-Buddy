// frontend/src/pages/Login.jsx
import { Lock, Mail, User2Icon, ChevronDown, Loader } from 'lucide-react'
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../configs/api.js'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice.js'
import toast from 'react-hot-toast'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = React.useState(false)

  const query = new URLSearchParams(window.location.search)
  const urlState = query.get('state')
  const [state, setState] = React.useState(urlState || "login")

  const [data, setData] = React.useState({
    name: '',
    username: '',
    password: '',
    experience: 'beginner'
  })

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      let responseData;

      if (state === 'login') {

        if (!data.username || !data.password) {
          toast.error('Please fill in all fields');
          setIsLoading(false);
          return;
        }

        const payload = {
          username: data.username,
          password: data.password
        };

        const { data: res } = await api.post('/login', payload);
        responseData = res;

      } else {

        const payload = {
          username: data.username,
          password: data.password,
          experience: data.experience
        };

        const { data: res } = await api.post('/users', payload);
        responseData = res;
      }
      // --- COMMON SUCCESS LOGIC ---
      if (responseData.token) {

        dispatch(login({
          token: responseData.token,
          username: responseData.username,
          experience: responseData.experience
        }));
      }

      toast.success(responseData.message || `Successfully ${state === 'login' ? 'logged in' : 'registered'}!`);

      if (state === 'login') {
        const from = location?.state?.from?.pathname || '/app';
        navigate(from, { replace: true });
      } else {

        setState('login');
        setData({ name: '', username: '', password: '', experience: 'beginner' });
      }

    } catch (error) {
      console.error('Full Error:', error);
      const errorMessage = error?.response?.data?.error ||
        error?.message ||
        'An unknown error occurred.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

        {state !== "login" && (
          <div className="flex items-center w-full mt-4 bg-purple-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <User2Icon size={16} className="text-purple-400" />
            <input
              type="text"
              placeholder="Full Name (Optional)"
              className="bg-transparent text-purple-50 placeholder-purple-400 outline-none text-sm w-full h-full border-none"
              name="name"
              value={data.name}
              onChange={onChangeHandler}
            />
          </div>
        )}

        <div className="flex items-center w-full mt-4 bg-purple-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <User2Icon size={16} className="text-purple-400" />
          <input
            type="text"
            placeholder="Username"
            className="bg-transparent text-purple-50 placeholder-purple-400 outline-none text-sm w-full h-full border-none"
            name="username"
            value={data.username}
            onChange={onChangeHandler}
            required
          />
        </div>

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

        {state !== "login" && (
          <div className="relative flex items-center w-full mt-4 bg-purple-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <ChevronDown size={16} className="text-purple-400" />
            <select
              name="experience"
              value={data.experience}
              onChange={onChangeHandler}
              className="bg-transparent text-purple-50 outline-none text-sm w-full h-full border-none appearance-none pr-6"
              required
            >
              <option value="beginner" className="bg-purple-900">Beginner</option>
              <option value="intermediate" className="bg-purple-900">Intermediate</option>
              <option value="expert" className="bg-purple-900">Expert</option>
            </select>
          </div>
        )}

        {state === "login" && (
          <div className="mt-5 text-left">
            <a className="text-sm text-purple-400 hover:text-purple-300 transition" href="#">
              Forgot password?
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full h-11 rounded-full text-white bg-purple-600 hover:bg-purple-500 transition-all font-semibold flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <Loader className="size-5 animate-spin" /> : (state === "login" ? "Login" : "Create Account")}
        </button>

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

export default Login;