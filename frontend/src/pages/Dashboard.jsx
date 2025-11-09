// frontend/src/pages/Dashboard.jsx
import { PlusIcon, TrashIcon, Clock, Zap, AlertCircle } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [diagnoses, setDiagnoses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]

  const loadDiagnoses = async () => {
    try {
      setIsLoading(true)
      // This route now exists
      const { data } = await api.get('/diagnoses') 
      setDiagnoses(data.diagnoses || [])
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to load history");
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDiagnosis = async (diagnosisId) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this diagnosis?');
      if (confirm) {
        // This route now exists
        await api.delete(`/diagnoses/${diagnosisId}`)
        setDiagnoses(diagnoses.filter(d => d._id !== diagnosisId))
        toast.success('Diagnosis deleted')
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete");
    }
  }

  useEffect(() => {
    loadDiagnoses()
  }, [])

  return (
    <div className='min-h-screen bg-black'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        
        {/* Header */}
        <div className='mb-8'>
          <p className='text-3xl font-bold text-white mb-2'>Welcome back, {user?.username}! 👋</p>
          <p className='text-purple-300'>Let's fix your household problems</p>
        </div>

        {/* Experience Level Badge */}
        {user?.experience && (
          <div className='inline-block mb-6 px-4 py-2 bg-purple-900/50 border border-purple-600/50 rounded-full'>
            <p className='text-sm text-purple-200'>
              Skill Level: <span className='font-bold capitalize'>{user.experience}</span>
            </p>
          </div>
        )}

        {/* New Diagnosis Button */}
        <button 
          onClick={() => navigate('/app/fixbuddy')} // Corrected route
          className='w-full sm:max-w-48 h-40 flex flex-col items-center justify-center rounded-lg gap-3 text-white border-2 border-dashed border-purple-500 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 bg-purple-950/30 group mb-8'
        >
          <PlusIcon className='size-12 text-purple-400 group-hover:scale-110 transition-all'/>
          <p className='text-sm font-medium'>New Diagnosis</p>
        </button>

        <hr className='border-purple-700/30 my-8' />

        {/* Diagnoses History */}
        <div className='mb-6'>
          <h2 className='text-xl font-bold text-white mb-4'>Diagnosis History (Last 10)</h2>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin'>
              <div className='size-8 border-4 border-purple-600 border-t-transparent rounded-full'></div>
            </div>
          </div>
        ) : diagnoses.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {diagnoses.map((diagnosis, index) => {
              const baseColor = colors[index % colors.length]
              const repairScore = diagnosis.repairabilityScore || 0
              
              return (
                <div // Changed from <button> to <div> for better click handling
                  key={diagnosis._id}
                  className='relative rounded-lg p-6 border transition-all duration-300 group hover:shadow-lg text-left'
                  style={{
                    background: `linear-gradient(135deg, ${baseColor}15, ${baseColor}25)`,
                    borderColor: baseColor + '40'
                  }}
                >
                  <div 
                    onClick={() => navigate(`/app/fixbuddy/${diagnosis._id}`)} // Clickable area
                    className="cursor-pointer"
                  >
                    {/* Item Name */}
                    <h3 className='text-lg font-bold text-white mb-1'>
                      {diagnosis.itemName}
                    </h3>

                    {/* Item Model */}
                    {diagnosis.itemModel && (
                      <p className='text-xs text-purple-300 mb-3'>
                        Model: {diagnosis.itemModel}
                      </p>
                    )}

                    {/* Repairability Score */}
                    <div className='flex items-center gap-2 mb-3'>
                      <Zap className='size-4' style={{ color: baseColor }} />
                      <span className='text-sm font-semibold' style={{ color: baseColor }}>
                        {repairScore}% Repairable
                      </span>
                    </div>

                    {/* Top Issue */}
                    {diagnosis.issues?.[0] && (
                      <p className='text-xs text-purple-200 mb-4 line-clamp-2'>
                        {diagnosis.issues[0].problem}
                      </p>
                    )}

                    {/* Date */}
                    <div className='flex items-center gap-1 text-xs text-purple-400'>
                      <Clock className='size-3' />
                      {new Date(diagnosis.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Delete Button (outside the navigation click area) */}
                  <div onClick={e => e.stopPropagation()} className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                      onClick={() => deleteDiagnosis(diagnosis._id)}
                      className='p-2 hover:bg-red-500/30 rounded text-red-400 transition-colors'
                    >
                      <TrashIcon className='size-5' />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='col-span-full text-center py-16'>
            <AlertCircle className='size-12 mx-auto text-purple-400 mb-4 opacity-50' />
            <p className='text-purple-400 mb-4'>No diagnoses yet</p>
            <button 
              onClick={() => navigate('/app/fixbuddy')}
              className='px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors'
            >
              Start Your First Diagnosis
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard;