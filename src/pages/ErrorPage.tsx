import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Container from "../components/common/Container"
import Icon from '../components/icons/Icon'

interface ErrorPageProps {
  statusCode?: number
  title?: string
  message?: string
  showBackButton?: boolean
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 404,
  title,
  message,
  showBackButton = true
}) => {
  const getErrorContent = () => {
    switch (statusCode) {
      case 404:
        return {
          title: title || 'Oops! Page Not Found',
          message: message || 'The page you\'re looking for seems to have wandered off like a lost masterpiece. Don\'t worry though – there\'s plenty of beautiful art to discover instead!',
          icon: 'search',
          suggestions: [
            'Check the URL for typos',
            'Go back to the homepage',
            'Browse our art collection',
            'Discover new artists',
            'Contact support if you need help'
          ]
        }
      case 500:
        return {
          title: title || 'Server Error',
          message: message || 'Something went wrong on our end. We\'re working to fix it.',
          icon: 'alert-triangle',
          suggestions: [
            'Try refreshing the page',
            'Check your internet connection',
            'Wait a few minutes and try again',
            'Contact support if the problem persists'
          ]
        }
      case 403:
        return {
          title: title || 'Access Denied',
          message: message || 'You don\'t have permission to access this resource.',
          icon: 'lock',
          suggestions: [
            'Check if you\'re logged in',
            'Verify your account permissions',
            'Contact support for access',
            'Go back to the homepage'
          ]
        }
      default:
        return {
          title: title || 'Something Went Wrong',
          message: message || 'An unexpected error occurred.',
          icon: 'alert-circle',
          suggestions: [
            'Try refreshing the page',
            'Go back to the homepage',
            'Contact support for help'
          ]
        }
    }
  }

  const errorContent = getErrorContent()

  return (
    <Container>
      <Helmet>
        <title>{errorContent.title} | ArtFlow</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name={errorContent.icon} size={48} color="#ef4444" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-4">
            <h1 className="text-6xl font-bold text-gray-900">{statusCode}</h1>
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {errorContent.title}
          </h2>

          {/* Error Message */}
          <p className="text-gray-600 mb-8">
            {errorContent.message}
          </p>

          {/* Suggestions */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">What you can do:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {errorContent.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center justify-center">
                  <Icon name="check" size={16} className="mr-2 text-green-500" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showBackButton && (
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Icon name="arrow-left" size={20} className="mr-2" />
                Go Back
              </button>
            )}
            
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              <Icon name="home" size={20} className="mr-2" />
              Go Home
            </Link>
          </div>

          {/* Help Link */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Still need help?</p>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default ErrorPage