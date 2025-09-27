import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from "../brush/components/forms/Container"
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'
import Icon from "../brush/Icon"

interface VaultAccessPageProps {
  onVerified: () => void
}

const VaultAccessPage: React.FC<VaultAccessPageProps> = ({ onVerified }) => {
  const { user } = useAuth()
  const [otp, setOtp] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const handleSendOtp = async () => {
    setIsSending(true)
    try {
      // For now, we'll simulate sending an OTP
      // In a real implementation, you'd call a Supabase Edge Function
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showSuccessToast('OTP sent to your email')
      setOtpSent(true)
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      showErrorToast('Failed to send OTP. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    
    try {
      // For now, we'll simulate OTP verification
      // In a real implementation, you'd call a Supabase Edge Function
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (otp === '123456') {
        showSuccessToast('Access granted')
        onVerified()
      } else {
        showErrorToast('Invalid OTP. Please try again.')
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      showErrorToast('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setOtp(value)
  }

  return (
    <Container>
      <Helmet>
        <title>Secure Vault Access | ArtFlow</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            {/* Shield Icon */}
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Icon name="shield-check" size={32} color="#3b82f6" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Vault Access</h1>
            <p className="text-gray-600 mb-8">
              For your security, please verify your identity to access your collection vault and certificates.
            </p>

            {!otpSent ? (
              /* Send OTP Section */
              <div>
                <p className="text-sm text-gray-500 mb-6">
                  We'll send a 6-digit verification code to:
                </p>
                <p className="font-medium text-gray-900 mb-6">{user?.email}</p>
                
                <button
                  onClick={handleSendOtp}
                  disabled={isSending}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Code...
                    </div>
                  ) : (
                    'Send Secure Code'
                  )}
                </button>
              </div>
            ) : (
              /* Verify OTP Section */
              <form onSubmit={handleVerifyOtp}>
                <p className="text-sm text-gray-500 mb-6">
                  A 6-digit code has been sent to your email. Please enter it below.
                </p>
                
                <div className="mb-6">
                  <input
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="_ _ _ _ _ _"
                    maxLength={6}
                    required
                    autoComplete="off"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isVerifying || otp.length < 6}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Unlock Vault'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp('')
                  }}
                  className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                >
                  Send new code
                </button>
              </form>
            )}

            {/* Security Note */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                <Icon name="info" size={16} className="text-gray-500 mr-2 mt-0.5" />
                <div className="text-left">
                  <p className="text-xs text-gray-600">
                    <strong>Security Note:</strong> This verification ensures only you can access your private collection data and certificates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default VaultAccessPage
