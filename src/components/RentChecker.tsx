import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info, MapPin, TrendingUp, Home, Building, Bed, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface RentCheckResult {
  is_rpz: boolean;
  rent_assessment: {
    assessment: 'high' | 'average' | 'low';
    confidence: number;
    explanation: string;
  };
  legal_assessment: {
    is_legal: boolean;
    explanation: string;
  };
}

type PropertyType = 'house' | 'apartment' | '';

const RentChecker: React.FC = () => {
  const [address, setAddress] = useState('');
  const [eircode, setEircode] = useState('');
  const [rent, setRent] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('');
  const [bedrooms, setBedrooms] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<RentCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError(null);
    
    // Combine address and eircode if both are provided
    const fullAddress = eircode ? `${address} ${eircode}` : address;
    
    try {
      const response = await fetch('http://localhost:8001/api/check-rent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address: fullAddress, 
          rent: parseFloat(rent),
          property_type: propertyType,
          bedrooms: parseInt(bedrooms) || 0
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.error || 'Error checking rent');
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error checking rent:', error);
      setError('Error checking rent. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case 'high':
        return 'text-red-600';
      case 'average':
        return 'text-amber-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAssessmentBgColor = (assessment: string) => {
    switch (assessment) {
      case 'high':
        return 'bg-red-100';
      case 'average':
        return 'bg-amber-100';
      case 'low':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getConfidenceBar = (confidence: number) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${confidence}%` }}
        ></div>
      </div>
    );
  };

  const formatEircode = (input: string) => {
    // Format as user types: first 3 characters, then space, then 4 characters
    input = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (input.length > 3) {
      return `${input.slice(0, 3)} ${input.slice(3, 7)}`;
    }
    return input;
  };

  const handleEircodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatEircode(e.target.value);
    setEircode(formatted);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <TrendingUp className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold font-google-sans text-gray-900">Fair Rent Checker</h2>
          <p className="text-gray-600 mt-1">
            Check if a rent price is fair and legal for a specific location in Ireland
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
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Property Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g. 123 Main Street, Dublin 8"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="eircode" className="block text-sm font-medium text-gray-700 mb-1">
              Eircode (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="eircode"
                value={eircode}
                onChange={handleEircodeChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g. D02 X285"
                maxLength={8}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-xs text-gray-500">For more accurate results</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {propertyType === 'house' ? (
                    <Home className="h-5 w-5 text-gray-400" />
                  ) : propertyType === 'apartment' ? (
                    <Building className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Home className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors appearance-none"
                  required
                >
                  <option value="">Select property type...</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Bedrooms
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Bed className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors appearance-none"
                  required
                >
                  <option value="">Select bedrooms...</option>
                  <option value="0">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5">5+ Bedrooms</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent (€)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">€</span>
              </div>
              <input
                type="number"
                id="rent"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g. 1800"
                min="0"
                step="50"
                required
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isChecking}
              className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isChecking ? (
                <>
                  <div className="h-5 w-5 relative mr-3">
                    <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  </div>
                  Checking...
                </>
              ) : (
                'Check Rent'
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
          {/* Property Details Summary */}
          <motion.div 
            className="p-5 rounded-lg bg-gray-50 border border-gray-200 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-2">
                  {propertyType === 'house' ? (
                    <Home className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Building className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
                <span className="text-sm text-gray-700 capitalize">{propertyType || 'Property'}</span>
              </div>
              
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-2">
                  <Bed className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {bedrooms === '0' ? 'Studio' : `${bedrooms} Bedroom${parseInt(bedrooms) !== 1 ? 's' : ''}`}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-full mr-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm text-gray-700 truncate max-w-[200px]">{address} {eircode}</span>
              </div>
            </div>
          </motion.div>
          
          {/* RPZ Status */}
          <motion.div 
            className="p-5 rounded-lg bg-blue-50 border border-blue-100 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 font-google-sans">
                  {result.is_rpz ? 'Rent Pressure Zone (RPZ)' : 'Not in a Rent Pressure Zone'}
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  {result.is_rpz 
                    ? 'This property is in a Rent Pressure Zone, where rent increases are capped.' 
                    : 'This property is not in a Rent Pressure Zone. Market rates apply.'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Legal Assessment */}
          <motion.div 
            className={`p-5 rounded-lg ${result.legal_assessment.is_legal ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'} shadow-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {result.legal_assessment.is_legal ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium font-google-sans ${result.legal_assessment.is_legal ? 'text-green-800' : 'text-amber-800'}`}>
                  {result.legal_assessment.is_legal ? 'Legally Compliant' : 'Potential Legal Issue'}
                </h3>
                <p className={`mt-1 text-sm ${result.legal_assessment.is_legal ? 'text-green-700' : 'text-amber-700'}`}>
                  {result.legal_assessment.explanation}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Market Assessment */}
          <motion.div 
            className="p-5 rounded-lg bg-gray-50 border border-gray-200 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-gray-800 mb-3 font-google-sans">Market Assessment</h3>
            <div className="flex items-center mb-3">
              <span className="text-sm mr-2">Price is:</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full text-sm ${getAssessmentBgColor(result.rent_assessment.assessment)} ${getAssessmentColor(result.rent_assessment.assessment)}`}>
                {result.rent_assessment.assessment.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                Confidence: {result.rent_assessment.confidence}%
              </span>
            </div>
            {getConfidenceBar(result.rent_assessment.confidence)}
            <p className="mt-4 text-sm text-gray-600">
              {result.rent_assessment.explanation}
            </p>
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
            Check Another Property
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

export default RentChecker; 