'use client';

import React, { useState } from 'react';
import FileUpload from '../../components/FileUpload';
import RentChecker from '../../components/RentChecker';
import RepairRequestAssistant from '../../components/RepairRequestAssistant';
import DepositDisputeKit from '../../components/DepositDisputeKit';
import { AlertCircle, CheckCircle, Info, FileText, TrendingUp, Wrench, DollarSign, HomeIcon, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Define TypeScript interfaces for our data structure
interface KeyTerms {
  rent?: string;
  deposit?: string;
  lease_term?: string;
  start_date?: string;
  [key: string]: string | undefined;
}

interface Alert {
  rule_id: string;
  title: string;
  explanation: string;
  severity: string;
  recommendation: string;
}

interface GoodToKnow {
  title: string;
  explanation: string;
}

interface AnalysisResult {
  key_terms: KeyTerms;
  alerts: Alert[];
  good_to_know: GoodToKnow[];
}

export default function AppPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'key_terms' | 'alerts' | 'good_to_know'>('key_terms');
  const [activeFeature, setActiveFeature] = useState<'lease_analyzer' | 'rent_checker' | 'repair_assistant' | 'deposit_dispute'>('lease_analyzer');

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file to backend...');
      const response = await fetch('http://localhost:8001/api/analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response from server:', data);
        
        // Check if we have a fallback analysis we can use
        if (data.fallback_analysis) {
          console.log('Using fallback analysis');
          setResult(data.fallback_analysis);
          setError(`Note: ${data.error || 'Analysis may be incomplete.'}`)
          return;
        }
        
        setError(data.error || 'Error analyzing PDF. Please try again with a different file.');
        return;
      }

      // Validate the response structure
      if (!data || typeof data !== 'object') {
        console.error('Invalid response format:', data);
        setError('The analysis result was in an unexpected format. Please try again.');
        return;
      }

      // Check if we have a valid response structure or try to adapt to what we received
      let validatedResult: AnalysisResult;
      
      if (data.key_terms && Array.isArray(data.alerts) && Array.isArray(data.good_to_know)) {
        // The response is already in the expected format
        validatedResult = data as AnalysisResult;
      } else {
        // Try to adapt the response to our expected format
        console.log('Adapting response structure:', data);
        
        // Create a default structure
        validatedResult = {
          key_terms: {},
          alerts: [],
          good_to_know: []
        };
        
        // Try to extract key terms if available
        if (typeof data.key_terms === 'object' && data.key_terms !== null) {
          validatedResult.key_terms = data.key_terms;
        } else if (data.rent || data.deposit || data.lease_term || data.start_date) {
          // Try to extract directly from root
          validatedResult.key_terms = {
            rent: data.rent || 'Not specified',
            deposit: data.deposit || 'Not specified',
            lease_term: data.lease_term || 'Not specified',
            start_date: data.start_date || 'Not specified'
          };
        }
        
        // Try to extract alerts if available
        if (Array.isArray(data.alerts)) {
          validatedResult.alerts = data.alerts;
        } else if (data.alerts && typeof data.alerts === 'object') {
          // Convert object to array if needed
          validatedResult.alerts = [data.alerts];
        }
        
        // Try to extract good_to_know if available
        if (Array.isArray(data.good_to_know)) {
          validatedResult.good_to_know = data.good_to_know;
        } else if (data.good_to_know && typeof data.good_to_know === 'object') {
          // Convert object to array if needed
          validatedResult.good_to_know = [data.good_to_know];
        }
      }
      
      // Check if the result is empty (no key terms and empty arrays)
      const isResultEmpty = 
        Object.keys(validatedResult.key_terms).length === 0 && 
        validatedResult.alerts.length === 0 && 
        validatedResult.good_to_know.length === 0;
      
      if (isResultEmpty) {
        // Add fallback content if the result is empty
        validatedResult = {
          key_terms: {
            "note": "We couldn't extract specific details from your lease"
          },
          alerts: [],
          good_to_know: [{
            title: "PDF Text Extraction Issue",
            explanation: "We couldn't extract specific details from your lease agreement. This could be because the PDF contains scanned images of text rather than actual text content, or the format is not recognized. For best results, please upload a PDF with selectable text content rather than scanned images."
          }]
        };
      }

      console.log('Validated analysis result:', validatedResult);
      setResult(validatedResult);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error connecting to the analysis service. Please ensure the backend is running and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Component for displaying key terms
  const KeyTermsSection = ({ keyTerms }: { keyTerms: KeyTerms }) => {
    // Check if we only have a "note" key, which indicates no details were found
    const hasOnlyNote = Object.keys(keyTerms).length === 1 && keyTerms.note !== undefined;
    
    if (hasOnlyNote) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-lg"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Note</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>{keyTerms.note}</p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {Object.entries(keyTerms).map(([key, value], index) => (
          <motion.div 
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-all duration-200"
          >
            <h3 className="text-sm font-medium text-indigo-500 capitalize mb-1">{key.replace('_', ' ')}</h3>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Component for displaying alerts
  const AlertsSection = ({ alerts }: { alerts: Alert[] }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-2"
        >
          <div className="flex items-start">
            <Info className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-indigo-700">
              These items highlight potential concerns in your lease agreement based on Irish tenancy law. 
              They're provided as educational insights to help you understand your rights as a tenant.
            </p>
          </div>
        </motion.div>
      )}
      
      {alerts.map((alert, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-lg transition-all duration-200"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">{alert.title}</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>{alert.explanation}</p>
              </div>
              <div className="mt-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-md inline-block">
                <p>Reference: {alert.rule_id}</p>
              </div>
              {alert.recommendation && (
                <div className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 border border-amber-200 rounded">
                  <strong>Recommended action:</strong> {alert.recommendation}
                </div>
              )}
              {alert.severity && (
                <div className="mt-2 text-xs inline-flex items-center">
                  <span className={`px-2 py-1 rounded-full ${
                    alert.severity === 'High' ? 'bg-red-100 text-red-800' : 
                    alert.severity === 'Medium' ? 'bg-orange-100 text-orange-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alert.severity} severity
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      {alerts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-green-50 rounded-lg border border-green-100"
        >
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
          <p className="text-green-800 font-medium text-lg">No issues found in your lease!</p>
          <p className="text-green-600 mt-2">Your agreement appears to comply with Irish tenancy laws.</p>
        </motion.div>
      )}
    </motion.div>
  );

  // Component for displaying good to know items
  const GoodToKnowSection = ({ goodToKnow }: { goodToKnow: GoodToKnow[] }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {goodToKnow.length > 0 && goodToKnow.map((item, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-lg transition-all duration-200"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">{item.title}</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{item.explanation}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      {goodToKnow.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-blue-50 rounded-lg border border-blue-100"
        >
          <Info className="h-14 w-14 text-blue-500 mx-auto mb-4" />
          <p className="text-blue-800 font-medium text-lg">No additional information to display</p>
          <p className="text-blue-600 mt-2">Your lease is straightforward with no special clauses to highlight.</p>
        </motion.div>
      )}
    </motion.div>
  );

  // Add this component to display a more user-friendly error message
  const ErrorDisplay = ({ error }: { error: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border-l-4 border-red-400 p-5 rounded-lg mb-6"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-white to-white font-roboto">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* Header with Home Link */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md mr-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-google-sans">
                Hestia
              </h1>
              <p className="text-md text-indigo-600 font-medium">
                Your AI Tenant's Advocate
              </p>
            </div>
          </div>
          <Link 
            href="/"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
          >
            <HomeIcon className="h-4 w-4 mr-2" />
            Home
          </Link>
        </div>
        
        {/* Feature Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8 overflow-hidden">
          <div className="flex flex-wrap justify-center">
            <button 
              onClick={() => setActiveFeature('lease_analyzer')} 
              className={`px-6 py-4 flex items-center font-google-sans transition-all duration-200 ${activeFeature === 'lease_analyzer' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <FileText className="h-5 w-5 mr-2" />
              <span>Lease Analyzer</span>
            </button>
            <button 
              onClick={() => setActiveFeature('rent_checker')} 
              className={`px-6 py-4 flex items-center font-google-sans transition-all duration-200 ${activeFeature === 'rent_checker' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              <span>Rent Checker</span>
            </button>
            <button 
              onClick={() => setActiveFeature('repair_assistant')} 
              className={`px-6 py-4 flex items-center font-google-sans transition-all duration-200 ${activeFeature === 'repair_assistant' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <Wrench className="h-5 w-5 mr-2" />
              <span>Repair Assistant</span>
            </button>
            <button 
              onClick={() => setActiveFeature('deposit_dispute')} 
              className={`px-6 py-4 flex items-center font-google-sans transition-all duration-200 ${activeFeature === 'deposit_dispute' ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <DollarSign className="h-5 w-5 mr-2" />
              <span>Deposit Dispute</span>
            </button>
          </div>
        </div>

        <motion.div 
          key={activeFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {activeFeature === 'lease_analyzer' ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              {error && <ErrorDisplay error={error} />}
              
              {!result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative mb-8 bg-white p-8 rounded-xl shadow-md border border-gray-200"
                >
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                      <div className="h-16 w-16 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 opacity-25"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-indigo-800 font-medium mt-4">Analyzing your lease agreement...</p>
                      <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                    </div>
                  )}
                  <div className="flex items-center mb-6">
                    <div className="bg-indigo-100 p-3 rounded-full mr-4">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold font-google-sans text-gray-900">Lease Analyzer</h2>
                      <p className="text-gray-600 mt-1">
                        Upload your lease agreement for an instant legal analysis
                      </p>
                    </div>
                  </div>
                  <div className="bg-indigo-50/50 p-6 rounded-lg border border-indigo-100 mb-6">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-indigo-700">
                        Our AI will analyze your lease agreement for potential issues, unfair terms, and highlight important clauses based on Irish residential tenancy laws.
                      </p>
                    </div>
                  </div>
                  <FileUpload onFileUpload={handleFileUpload} />
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                >
                  <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
                    <h2 className="text-2xl font-semibold mb-2 font-google-sans text-gray-900">Analysis Results</h2>
                    <p className="text-indigo-600">
                      Here's what we found in your lease agreement
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-200 bg-gray-50">
                    <nav className="flex px-4">
                      <button
                        onClick={() => setActiveSection('key_terms')}
                        className={`px-6 py-4 text-sm font-medium font-google-sans transition-all duration-200 ${
                          activeSection === 'key_terms'
                            ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white -mb-px'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Key Terms
                      </button>
                                              <button
                          onClick={() => setActiveSection('alerts')}
                          className={`px-6 py-4 text-sm font-medium font-google-sans transition-all duration-200 ${
                            activeSection === 'alerts'
                              ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white -mb-px'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Legal Insights
                          {result.alerts.length > 0 && (
                            <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              {result.alerts.length}
                            </span>
                          )}
                        </button>
                      <button
                        onClick={() => setActiveSection('good_to_know')}
                        className={`px-6 py-4 text-sm font-medium font-google-sans transition-all duration-200 ${
                          activeSection === 'good_to_know'
                            ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white -mb-px'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Good to Know
                        {result.good_to_know.length > 0 && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {result.good_to_know.length}
                          </span>
                        )}
                      </button>
                    </nav>
                  </div>
                  
                  <div className="p-8">
                    <AnimatePresence mode="wait">
                      {activeSection === 'key_terms' && <KeyTermsSection keyTerms={result.key_terms} />}
                      {activeSection === 'alerts' && <AlertsSection alerts={result.alerts} />}
                      {activeSection === 'good_to_know' && <GoodToKnowSection goodToKnow={result.good_to_know} />}
                    </AnimatePresence>
                  </div>
                  
                  <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <button
                      onClick={() => {
                        setResult(null);
                        setError(null);
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                    >
                      Analyze Another Lease
                    </button>
                    <button
                      className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Report
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : activeFeature === 'rent_checker' ? (
            <motion.div
              key="rent_checker"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <RentChecker />
            </motion.div>
          ) : activeFeature === 'repair_assistant' ? (
            <motion.div
              key="repair_assistant"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <RepairRequestAssistant />
            </motion.div>
          ) : (
            <motion.div
              key="deposit_dispute"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <DepositDisputeKit />
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
} 