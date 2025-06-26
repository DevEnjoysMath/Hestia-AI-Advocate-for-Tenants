import React, { useState } from 'react';
import { AlertCircle, Copy, Check, Mail, Wrench, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface RepairRequestResult {
  subject: string;
  message: string;
}

const REPAIR_ISSUES = [
  { value: 'hot_water', label: 'No Hot Water' },
  { value: 'heating', label: 'Heating Not Working' },
  { value: 'leak', label: 'Water Leak/Pipe Issue' },
  { value: 'electrical', label: 'Electrical Problem' },
  { value: 'appliance', label: 'Broken Appliance' },
  { value: 'mold', label: 'Mold or Dampness' },
  { value: 'structural', label: 'Structural Issue' },
  { value: 'pest', label: 'Pest Infestation' },
  { value: 'other', label: 'Other Issue' }
];

const RepairRequestAssistant: React.FC = () => {
  const [issueType, setIssueType] = useState('');
  const [details, setDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<RepairRequestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8001/api/generate-repair-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ issue_type: issueType, details }),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.error || 'Error generating repair request');
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error generating repair request:', error);
      setError('Error generating repair request. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getIssueLabel = (value: string) => {
    const issue = REPAIR_ISSUES.find(issue => issue.value === value);
    return issue ? issue.label : 'Unknown Issue';
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <Wrench className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold font-google-sans text-gray-900">Repair Request Assistant</h2>
          <p className="text-gray-600 mt-1">
            Generate a professional email to request repairs from your landlord
          </p>
        </div>
      </div>
      
      {!result ? (
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-5 bg-indigo-50/50 p-6 rounded-lg border border-indigo-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
              Type of Issue
            </label>
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors"
              required
            >
              <option value="">Select an issue...</option>
              {REPAIR_ISSUES.map(issue => (
                <option key={issue.value} value={issue.value}>{issue.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 transition-colors"
              placeholder="E.g., When the issue started, how severe it is, any attempts to fix it..."
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating || !issueType}
              className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 relative mr-3">
                    <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  </div>
                  Generating...
                </>
              ) : (
                'Generate Repair Request'
              )}
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <motion.div 
            className="flex justify-between items-center mb-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <ClipboardCheck className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-medium text-indigo-900 font-google-sans">
                Request for: {getIssueLabel(issueType)}
              </h3>
            </div>
            <motion.button
              onClick={() => copyToClipboard(`Subject: ${result.subject}\n\n${result.message}`)}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-white border border-gray-200 text-indigo-600 hover:text-indigo-800 hover:border-indigo-200 rounded-lg shadow-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy All
                </>
              )}
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="border rounded-lg overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gray-50 px-5 py-3 border-b">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Subject: {result.subject}</span>
              </div>
            </div>
            <div className="p-5 bg-white">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                {result.message}
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You can copy this email and send it to your landlord. Feel free to modify it to better reflect your situation.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={() => {
              setResult(null);
              setError(null);
            }}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
          >
            Generate Another Request
          </motion.button>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 p-5 rounded-lg mt-6 shadow-sm"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <p className="text-xs text-red-600 mt-1">Please try again or check your connection.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RepairRequestAssistant; 