
import { ArrowLeftIcon, Upload, Loader, AlertCircle, Youtube, Volume2, Save, ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api.js'
import toast from 'react-hot-toast'

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const FixBuddy = () => {
  const { diagnosisId } = useParams() 
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [step, setStep] = useState(diagnosisId ? 3 : 1) 
  const [imageFile, setImageFile] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [isLoading, setIsLoading] = useState(!!diagnosisId) 
  
  const [diagnosis, setDiagnosis] = useState(null)
  
  const [activeTab, setActiveTab] = useState('overview') 
  const [isSpeaking, setIsSpeaking] = useState(false)

  
  useEffect(() => {
    if (diagnosisId) {
      loadExistingDiagnosis()
    }
  }, [diagnosisId])

  const loadExistingDiagnosis = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/diagnoses/${diagnosisId}`)
      setDiagnosis(data.diagnosis)
      setStep(3)
    } catch (error) {
      toast.error('Failed to load diagnosis')
      navigate('/app'); 
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 8 * 1024 * 1024) { 
        toast.error("Image is too large. Max 8MB.");
        return;
      }
      setImageFile(file)
    }
  }


  const submitDiagnosis = async () => {
    if (!textInput && !imageFile) {
      toast.error('Please describe the problem or upload an image.');
      return;
    }

    setIsLoading(true);
    try {
      let imageBase64 = null;
      if (imageFile) {
        imageBase64 = await toBase64(imageFile);
      }

 
      const payload = {
        description: textInput,
        imageBase64: imageBase64,// Can be null
        experience: user?.experience || 'beginner',
 
      };


      const { data } = await api.post('/agent', payload);


      setDiagnosis(data.result); 
      setStep(3);
      toast.success('Diagnosis complete!');


      if (data.result._id) {
         navigate(`/app/fixbuddy/${data.result._id}`, { replace: true });
      }

    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to get diagnosis');
    } finally {
      setIsLoading(false);
    }
  }

  const readAloud = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }
  
 
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const resetForm = () => {
    setStep(1);
    setImageFile(null);
    setTextInput('');
    setDiagnosis(null);
    navigate('/app/fixbuddy'); 
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='max-w-6xl mx-auto px-4 py-6'>


        <button
          onClick={() => navigate('/app')}
          className='inline-flex gap-2 items-center text-purple-300 hover:text-purple-200 transition-all mb-6'
        >
          <ArrowLeftIcon className='size-4' /> Back to Dashboard
        </button>


        {step === 1 && (
          <div className='max-w-2xl mx-auto'>
            <h1 className='text-3xl font-bold mb-2'>What needs fixing? 🔧</h1>
            <p className='text-purple-300 mb-8'>Take a photo, describe your issue, or both!</p>


            <button
              onClick={() => setStep(2)}
              className='w-full p-8 rounded-lg border-2 border-purple-600 hover:bg-purple-600/20 transition-all text-center'
            >
              <Upload className='size-8 mx-auto mb-2 text-purple-400' />
              <p className='font-semibold'>Start New Diagnosis</p>
            </button>
          </div>
        )}


        {step === 2 && (
          <div className='max-w-2xl mx-auto'>
            <h1 className='text-3xl font-bold mb-6'>
              Provide Details
            </h1>

            {/* Image Upload */}
            <div className='mb-6'>
              <label className='block'>
                <div className='flex flex-col items-center justify-center gap-4 border-2 border-dashed border-purple-600 rounded-lg p-12 hover:bg-purple-600/10 transition-all cursor-pointer'>
                  <Upload className='size-12 text-purple-400' />
                  <div className='text-center'>
                    <p className='font-semibold'>Click to upload or drag & drop</p>
                    <p className='text-sm text-purple-300'>Image (Recommended)</p>
                  </div>
                  {imageFile && (
                    <p className='text-green-400 font-semibold'>{imageFile.name}</p>
                  )}
                </div>
                <input
                  type='file'
                  accept='image/png, image/jpeg'
                  capture='environment'
                  hidden
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            
            {/* Text Input */}
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder='Describe the problem... (e.g., "My wooden table leg is broken.")'
              className='w-full h-32 p-4 rounded-lg bg-purple-950/50 border border-purple-600 text-white placeholder-purple-400 focus:outline-none focus:border-purple-400 mb-6'
            />

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


        {step === 3 && (isLoading ? (
          <div className='flex items-center justify-center py-40'>
            <div className='animate-spin'>
              <div className='size-12 border-4 border-purple-600 border-t-transparent rounded-full'></div>
            </div>
          </div>
        ) : diagnosis && (
          <div className='grid lg:grid-cols-3 gap-6'>
  
            <div className='lg:col-span-2'>
              
   
              {diagnosis.blocked ? (
                <div className='bg-red-900/20 border border-red-700/50 rounded-lg p-6 mb-6 text-center'>
                  <AlertCircle className="size-12 mx-auto text-red-400 mb-4" />
                  <h2 className="text-3xl font-bold text-red-300 mb-2">Safety Hazard Detected</h2>
                  <p className="text-red-200 max-w-md mx-auto">
                    {diagnosis.diagnosis?.safety || "This repair is unsafe for DIY and requires professional attention. Please contact a certified professional."}
                  </p>
                </div>
              ) : (
                <>
                  <div className='bg-purple-950/50 border border-purple-600/50 rounded-lg p-6 mb-6'>
                    <h2 className='text-3xl font-bold'>{diagnosis.itemName}</h2>
                    {diagnosis.itemModel && (
                      <p className='text-sm text-purple-300 mt-1'>Model: {diagnosis.itemModel}</p>
                    )}
                    <div className='my-4 h-px bg-purple-600/30' />

                    {/* Repairability Score */}
                    <div className='mb-4'>
                      <p className='text-sm text-purple-400 mb-2'>Repairability Score</p>
                      <div className='flex items-center gap-3'>
                        <div className='relative flex-1 h-8 bg-purple-900 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all'
                            style={{ width: `${diagnosis.repairabilityScore}%` }}
                          />
                        </div>
                        <p className='text-2xl font-bold text-purple-300'>{diagnosis.repairabilityScore}%</p>
                      </div>
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
                            <ChevronDown className='size-5 text-purple-400 shrink-0 -rotate-90' />
                          </a>
                        ))
                      ) : (
                        <p className='text-purple-400 text-center py-8'>No tutorials found</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className='space-y-3 h-fit sticky top-6'>
              <button
                onClick={resetForm}
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
        ))}

      </div>
    </div>
  )
}

export default FixBuddy;