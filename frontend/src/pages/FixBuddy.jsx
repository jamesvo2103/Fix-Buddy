import { ArrowLeftIcon, Upload, Loader, AlertCircle, Youtube, Volume2, Save, ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'

const FixBuddy = () => {
  const { diagnosisId } = useParams()
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Input, 2: Upload, 3: Results
  const [inputType, setInputType] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [itemModel, setItemModel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [diagnosis, setDiagnosis] = useState(null)
  const [clarifyQuestion, setClarifyQuestion] = useState(null)
  const [clarifyAnswer, setClarifyAnswer] = useState(null)

  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'steps', 'tutorials'
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    if (diagnosisId) {
      loadExistingDiagnosis()
    }
  }, [])

  const loadExistingDiagnosis = async () => {
    try {
      const { data } = await api.get(`/diagnoses/${diagnosisId}`)
      setDiagnosis(data.diagnosis)
      setStep(3)
    } catch (error) {
      toast.error('Failed to load diagnosis')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
    }
  }

  const submitDiagnosis = async () => {
    if (inputType === 'image' && !imageFile) {
      toast.error('Please upload an image')
      return
    }

    if (inputType === 'text' && !textInput) {
      toast.error('Please describe the problem')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('inputType', inputType)
      formData.append('skillLevel', user?.experience || 'beginner')
      
      if (inputType === 'image') {
        formData.append('image', imageFile)
      } else {
        formData.append('text', textInput)
      }

      if (itemModel) {
        formData.append('itemModel', itemModel)
      }

      if (clarifyAnswer !== null) {
        formData.append('clarifyAnswer', clarifyAnswer)
      }

      const { data } = await api.post('/agent/diagnose', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (data.status === 'clarify') {
        setClarifyQuestion(data.question)
        setClarifyAnswer(null)
        toast('AI needs clarification', { icon: '❓' })
      } else {
        setDiagnosis(data.diagnosis)
        setStep(3)
        toast.success('Diagnosis complete!')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to get diagnosis')
    } finally {
      setIsLoading(false)
    }
  }

  const readAloud = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  const saveDiagnosis = async () => {
    try {
      await api.post('/diagnoses', { diagnosis })
      toast.success('✅ Diagnosis saved to history!')
      setTimeout(() => navigate('/app'), 1500)
    } catch (error) {
      toast.error('Failed to save diagnosis')
    }
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='max-w-6xl mx-auto px-4 py-6'>

        {/* Back Button */}
        <button
          onClick={() => navigate('/app')}
          className='inline-flex gap-2 items-center text-purple-300 hover:text-purple-200 transition-all mb-6'
        >
          <ArrowLeftIcon className='size-4' /> Back to Dashboard
        </button>

        {/* ============ STEP 1: INPUT TYPE ============ */}
        {step === 1 && (
          <div className='max-w-2xl mx-auto'>
            <h1 className='text-3xl font-bold mb-2'>What needs fixing? 🔧</h1>
            <p className='text-purple-300 mb-8'>Take a photo or describe your issue</p>

            <div className='grid grid-cols-2 gap-4'>
              <button
                onClick={() => {
                  setInputType('image')
                  setStep(2)
                }}
                className='p-8 rounded-lg border-2 border-purple-600 hover:bg-purple-600/20 transition-all text-center'
              >
                <Upload className='size-8 mx-auto mb-2 text-purple-400' />
                <p className='font-semibold'>📸 Upload Photo</p>
              </button>

              <button
                onClick={() => {
                  setInputType('text')
                  setStep(2)
                }}
                className='p-8 rounded-lg border-2 border-purple-600 hover:bg-purple-600/20 transition-all text-center'
              >
                <AlertCircle className='size-8 mx-auto mb-2 text-purple-400' />
                <p className='font-semibold'>📝 Describe Issue</p>
              </button>
            </div>
          </div>
        )}

        {/* ============ STEP 2: UPLOAD/INPUT ============ */}
        {step === 2 && (
          <div className='max-w-2xl mx-auto'>
            <h1 className='text-3xl font-bold mb-6'>
              {inputType === 'image' ? '📸 Upload Photo' : '📝 Describe the Problem'}
            </h1>

            {inputType === 'image' ? (
              <div className='mb-6'>
                <label className='block'>
                  <div className='flex flex-col items-center justify-center gap-4 border-2 border-dashed border-purple-600 rounded-lg p-12 hover:bg-purple-600/10 transition-all cursor-pointer'>
                    <Upload className='size-12 text-purple-400' />
                    <div className='text-center'>
                      <p className='font-semibold'>Click to upload or drag & drop</p>
                      <p className='text-sm text-purple-300'>PNG, JPG up to 8MB</p>
                    </div>
                    {imageFile && (
                      <p className='text-green-400 font-semibold'>{imageFile.name}</p>
                    )}
                  </div>
                  <input
                    type='file'
                    accept='image/*'
                    hidden
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            ) : (
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder='E.g., "My washing machine is making strange noises during the spin cycle"'
                className='w-full h-32 p-4 rounded-lg bg-purple-950/50 border border-purple-600 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 mb-6'
              />
            )}

            {/* Optional: Item Model */}
            <input
              type='text'
              placeholder='Item model (optional, e.g., LG WM1234A)'
              value={itemModel}
              onChange={(e) => setItemModel(e.target.value)}
              className='w-full p-3 rounded-lg bg-purple-950/50 border border-purple-600 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 mb-6'
            />

            {/* Clarification Question */}
            {clarifyQuestion && (
              <div className='bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6'>
                <p className='text-yellow-300 font-semibold mb-3'>❓ {clarifyQuestion}</p>
                <div className='flex gap-3'>
                  <button
                    onClick={() => setClarifyAnswer(true)}
                    className='px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition-colors'
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setClarifyAnswer(false)}
                    className='px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors'
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-3'>
              <button
                onClick={() => setStep(1)}
                className='flex-1 py-3 bg-purple-900/50 hover:bg-purple-800/50 rounded-lg font-semibold transition-all'
              >
                Back
              </button>
              <button
                onClick={submitDiagnosis}
                disabled={isLoading}
                className='flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {isLoading && <Loader className='animate-spin size-5' />}
                {isLoading ? 'Analyzing...' : 'Get Diagnosis'}
              </button>
            </div>
          </div>
        )}

        {/* ============ STEP 3: RESULTS ============ */}
        {step === 3 && diagnosis && (
          <div className='grid lg:grid-cols-3 gap-6'>
            {/* Left: Results */}
            <div className='lg:col-span-2'>
              
              {/* Item & Score */}
              <div className='bg-purple-950/50 border border-purple-600/50 rounded-lg p-6 mb-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h2 className='text-3xl font-bold'>{diagnosis.itemName}</h2>
                    {diagnosis.itemModel && (
                      <p className='text-sm text-purple-300 mt-1'>Model: {diagnosis.itemModel}</p>
                    )}
                  </div>
                </div>

                {/* Repairability Score */}
                <div className='mb-4'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='relative flex-1 h-8 bg-purple-900 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all'
                        style={{ width: `${diagnosis.repairabilityScore}%` }}
                      />
                    </div>
                    <p className='text-2xl font-bold text-purple-300'>{diagnosis.repairabilityScore}%</p>
                  </div>
                  <p className='text-sm text-purple-400'>Repairability Score</p>
                </div>

                {/* Issues */}
                {diagnosis.issues && diagnosis.issues.length > 0 && (
                  <div>
                    <p className='text-sm font-semibold text-purple-300 mb-2'>Likely Issues:</p>
                    <ul className='space-y-2'>
                      {diagnosis.issues.map((issue, idx) => (
                        <li key={idx} className='flex gap-2 text-purple-200'>
                          <span className='text-purple-400'>•</span>
                          {issue.problem}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className='flex gap-2 mb-6 border-b border-purple-600/30 overflow-x-auto'>
                {[
                  { id: 'overview', label: '📋 Overview' },
                  { id: 'steps', label: '👷 DIY Steps' },
                  { id: 'tutorials', label: '🎬 Tutorials' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-4 font-semibold transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-purple-300 hover:text-purple-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && diagnosis.diagnosis && (
                <div className='space-y-6'>
                  {/* Safety Notice */}
                  <div className='bg-red-900/20 border border-red-700/50 rounded-lg p-4'>
                    <p className='text-red-300 font-semibold mb-2'>⚠️ Safety Notice</p>
                    <p className='text-red-200 text-sm'>{diagnosis.diagnosis.safety}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-purple-900/30 rounded-lg p-4 text-center'>
                      <p className='text-2xl font-bold text-purple-400'>{diagnosis.diagnosis.tools?.length || 0}</p>
                      <p className='text-sm text-purple-300'>Tools Needed</p>
                    </div>
                    <div className='bg-purple-900/30 rounded-lg p-4 text-center'>
                      <p className='text-2xl font-bold text-purple-400'>{diagnosis.diagnosis.parts?.length || 0}</p>
                      <p className='text-sm text-purple-300'>Parts Needed</p>
                    </div>
                  </div>

                  {/* Tools List */}
                  {diagnosis.diagnosis.tools && diagnosis.diagnosis.tools.length > 0 && (
                    <div>
                      <h4 className='font-bold mb-3'>🔧 Tools Needed</h4>
                      <ul className='space-y-2'>
                        {diagnosis.diagnosis.tools.map((tool, idx) => (
                          <li key={idx} className='flex gap-2 text-purple-200'>
                            <span className='text-purple-400'>✓</span> {tool}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Parts List */}
                  {diagnosis.diagnosis.parts && diagnosis.diagnosis.parts.length > 0 && (
                    <div>
                      <h4 className='font-bold mb-3'>🛠️ Parts & Cost</h4>
                      <div className='space-y-2'>
                        {diagnosis.diagnosis.parts.map((part, idx) => (
                          <div key={idx} className='flex justify-between items-center p-3 bg-purple-900/30 rounded'>
                            <p className='text-purple-200'>{part.name}</p>
                            <p className='text-purple-400 font-semibold'>${part.estimatedCost || 'TBD'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'steps' && diagnosis.diagnosis && (
                <div className='space-y-4'>
                  <h3 className='text-lg font-bold mb-4'>Step-by-Step Instructions</h3>
                  <div className='flex gap-2 mb-4'>
                    <button
                      onClick={() => readAloud(diagnosis.diagnosis.steps?.join('. '))}
                      className='px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-2 text-sm'
                    >
                      <Volume2 className='size-4' />
                      {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                    </button>
                  </div>
                  <ol className='space-y-4'>
                    {diagnosis.diagnosis.steps?.map((step, idx) => (
                      <li key={idx} className='flex gap-4'>
                        <span className='text-purple-400 font-bold shrink-0 bg-purple-900/50 w-8 h-8 rounded-full flex items-center justify-center'>
                          {idx + 1}
                        </span>
                        <span className='text-purple-200 pt-1'>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {activeTab === 'tutorials' && diagnosis.tutorials && (
                <div className='space-y-4'>
                  <h3 className='text-lg font-bold mb-4'>Recommended Video Tutorials</h3>
                  {diagnosis.tutorials.length > 0 ? (
                    diagnosis.tutorials.map((tutorial, idx) => (
                      <a
                        key={idx}
                        href={tutorial.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex gap-4 p-4 bg-purple-900/30 border border-purple-600/30 rounded-lg hover:border-purple-400 transition-all'
                      >
                        <Youtube className='size-6 text-red-500 shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-purple-300 line-clamp-2'>{tutorial.title}</p>
                          <p className='text-sm text-purple-400'>{tutorial.source || 'Video'}</p>
                        </div>
                        <ChevronDown className='size-5 text-purple-400 shrink-0 rotate-180' />
                      </a>
                    ))
                  ) : (
                    <p className='text-purple-400 text-center py-8'>No tutorials found</p>
                  )}
                </div>
              )}

            </div>

            {/* Right: Action Buttons */}
            <div className='space-y-3 h-fit sticky top-6'>
              <button
                onClick={saveDiagnosis}
                className='w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-semibold transition-all flex items-center justify-center gap-2'
              >
                <Save className='size-5' /> Save to History
              </button>

              <button
                onClick={() => {
                  setStep(1)
                  setImageFile(null)
                  setTextInput('')
                  setItemModel('')
                  setClarifyQuestion(null)
                  setDiagnosis(null)
                }}
                className='w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-all'
              >
                New Diagnosis
              </button>

              <button
                onClick={() => navigate('/app')}
                className='w-full py-3 bg-purple-900/50 hover:bg-purple-800/50 rounded-lg font-semibold transition-all'
              >
                Back to Dashboard
              </button>

              {/* Skill Level Badge */}
              <div className='mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-600/30 text-center'>
                <p className='text-xs text-purple-400 mb-1'>Your Skill Level</p>
                <p className='text-lg font-bold text-purple-300 capitalize'>{user?.experience || 'Beginner'}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default FixBuddy
