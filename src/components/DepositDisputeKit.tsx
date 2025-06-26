import React, { useState, useRef } from 'react';
import { AlertCircle, Upload, Image as ImageIcon, Copy, Check, Camera, DollarSign, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface DisputeResult {
  analysis: string;
  arguments: string[];
  wear_and_tear_classification: boolean;
  estimated_fair_deduction: string;
}

const DepositDisputeKit: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [deductionAmount, setDeductionAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DisputeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      setError('Please upload an image of the alleged damage');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('description', description);
      formData.append('deduction_amount', deductionAmount);

      const response = await fetch('http://localhost:8001/api/analyze-dispute', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.error || 'Error analyzing dispute');
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing dispute:', error);
      setError('Error analyzing dispute. Please try again.');
    } finally {
      setIsAnalyzing(false);
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

  const getArgumentsText = () => {
    if (!result) return '';
    
    let text = 'DEPOSIT DISPUTE ARGUMENTS\n\n';
    text += `Analysis: ${result.analysis}\n\n`;
    text += 'Key Arguments:\n';
    
    result.arguments.forEach((arg, index) => {
      text += `${index + 1}. ${arg}\n`;
    });
    
    text += `\nClassification: ${result.wear_and_tear_classification ? 'Normal wear and tear' : 'May constitute damage'}\n`;
    text += `Estimated Fair Deduction: ${result.estimated_fair_deduction}`;
    
    return text;
  };

  const simplifyText = (text: string) => {
    // Keep legal references but simplify other jargon
    return text
      .replace(/pursuant to/gi, 'under')
      .replace(/in accordance with/gi, 'under')
      .replace(/notwithstanding/gi, 'despite')
      .replace(/aforementioned/gi, 'this')
      .replace(/hereinafter/gi, '')
      .replace(/heretofore/gi, 'previously')
      .replace(/thereafter/gi, 'after that');
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <DollarSign className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold font-google-sans text-gray-900">Deposit Dispute Prep Kit</h2>
          <p className="text-gray-600 mt-1">
            Upload photos of alleged damage and get legal arguments to dispute unfair deposit deductions
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
            <input
              type="file"
              id="image-upload"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {!imagePreview ? (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer py-4"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-indigo-500" />
                </div>
                <span className="text-base font-medium text-gray-800 font-google-sans">
                  Upload a photo of the alleged damage
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  Click or drag and drop (PNG, JPG)
                </span>
                <motion.button
                  type="button"
                  onClick={triggerFileInput}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Select Image
                </motion.button>
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description of Alleged Damage
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 transition-colors"
              placeholder="E.g., 'Scuff marks on living room wall' or 'Stain on carpet'"
            />
          </div>
          
          <div>
            <label htmlFor="deductionAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Deduction Amount (€)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">€</span>
              </div>
              <input
                type="number"
                id="deductionAmount"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="E.g., 300"
                min="0"
                step="10"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isAnalyzing || !image}
              className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-5 w-5 relative mr-3">
                    <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  </div>
                  Analyzing Image...
                </>
              ) : (
                'Analyze Dispute'
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
            className="flex justify-between items-center mb-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-medium text-indigo-900 font-google-sans">
                Dispute Analysis Results
              </h3>
            </div>
            <motion.button
              onClick={() => copyToClipboard(getArgumentsText())}
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
            className="flex flex-col md:flex-row gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="md:w-1/3">
              {imagePreview && (
                <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Disputed damage"
                    className="w-full"
                  />
                </div>
              )}
              
              <div className={`mt-4 p-4 rounded-lg ${result.wear_and_tear_classification ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'} shadow-sm`}>
                <p className="text-sm font-medium font-google-sans">
                  Classification: {result.wear_and_tear_classification ? 
                    <span className="text-green-700">Normal Wear & Tear</span> : 
                    <span className="text-yellow-700">May Constitute Damage</span>}
                </p>
                <p className="text-sm mt-2">
                  Estimated Fair Deduction: <span className="font-semibold">{result.estimated_fair_deduction}</span>
                </p>
              </div>
            </div>
            
            <div className="md:w-2/3 space-y-4">
              <motion.div 
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-sm font-medium text-gray-800 mb-2 font-google-sans">Analysis</h4>
                <p className="text-sm text-gray-700">{simplifyText(result.analysis)}</p>
              </motion.div>
              
              <motion.div 
                className="p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="text-sm font-medium text-blue-800 mb-3 font-google-sans">Arguments for Your Dispute</h4>
                <ul className="space-y-3">
                  {result.arguments.map((argument, index) => (
                    <motion.li 
                      key={index} 
                      className="text-sm text-blue-700 flex bg-blue-50/50 p-2 rounded-md"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (index * 0.1) }}
                    >
                      <span className="font-bold mr-2 text-blue-800">{index + 1}.</span>
                      <span>{simplifyText(argument)}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
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
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            Analyze Another Dispute
          </motion.button>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-lg mt-6 shadow-sm"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700 font-medium">{error}</p>
              <p className="text-xs text-amber-600 mt-1">Please try again or check your connection.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DepositDisputeKit; 