/**
 * Test Page - Run comprehensive stress tests
 */

import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { testRunnerService, ComprehensiveTestReport } from '../services/testRunner'
import { Loader, CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react'

const TestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [report, setReport] = useState<ComprehensiveTestReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setIsRunning(true)
    setError(null)
    setReport(null)

    try {
      const testReport = await testRunnerService.runAllTests()
      setReport(testReport)
    } catch (err: any) {
      setError(err.message || 'Test execution failed')
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: 'PASS' | 'FAIL' | 'WARN') => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'WARN':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: 'PASS' | 'FAIL' | 'WARN') => {
    switch (status) {
      case 'PASS':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'FAIL':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'WARN':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Stress Tests - Artflow</title>
        <meta name="description" content="Comprehensive stress testing and validation" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comprehensive Stress Tests</h1>
              <p className="text-gray-600 mt-2">
                Run comprehensive validation and stress tests to ensure codebase quality
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Tests
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Test Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {report && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className={`p-6 rounded-lg border-2 ${getStatusColor(report.overallStatus)}`}>
                <div className="flex items-center gap-3 mb-4">
                  {getStatusIcon(report.overallStatus)}
                  <h2 className="text-2xl font-bold">Overall Status</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{report.summary.totalTests}</div>
                    <div className="text-sm opacity-75">Total Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{report.summary.passedSuites}</div>
                    <div className="text-sm opacity-75">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{report.summary.failedSuites}</div>
                    <div className="text-sm opacity-75">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{report.summary.warningSuites}</div>
                    <div className="text-sm opacity-75">Warnings</div>
                  </div>
                </div>
                <div className="mt-4 text-sm opacity-75">
                  Duration: {report.totalDuration}ms
                </div>
              </div>

              {/* Test Suite Results */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Test Suite Results</h3>
                <div className="space-y-3">
                  {report.suites.map((suite, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(suite.status)}
                        <span className="font-medium">{suite.suiteName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(suite.status)}`}>
                          {suite.status}
                        </span>
                        <span className="text-sm text-gray-500">{suite.duration}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Issues */}
              {report.criticalIssues.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-red-600">Critical Issues</h3>
                  <div className="space-y-2">
                    {report.criticalIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-red-700">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {report.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-2">
                    {report.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-blue-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={runTests}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Run Again
                </button>
                {report.overallStatus === 'PASS' && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Deploy to Production
                  </button>
                )}
              </div>
            </div>
          )}

          {!report && !isRunning && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Test</h3>
              <p className="text-gray-500 mb-6">
                Click "Run Tests" to start comprehensive validation of the codebase
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestPage
