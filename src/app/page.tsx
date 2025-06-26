import Link from 'next/link';
import RotatingText from '../components/RotatingText';
import Image from 'next/image';
import StarBorder from '../components/StarBorder';

export default function LandingPage() {
  return (
    <main className="antialiased">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-slate-50 to-white">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-6 py-16 sm:py-24 md:py-32 flex flex-col items-center">
          {/* Brand Name with Shield Logo */}
          <div className="flex items-center mb-8 bg-white px-4 py-2 rounded-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="ml-3 text-2xl font-bold text-indigo-600 font-google-sans">HESTIA</span>
          </div>
          
          {/* Tagline */}
          <p className="text-sm uppercase tracking-wider text-indigo-600 font-medium mb-4 font-google-sans">Powered by Gemini</p>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl mx-auto text-center font-google-sans">
            Helping Irish Tenants <span className="text-indigo-600">Understand Their Rights</span>
          </h1>
          
          {/* Sub-headline */}
          <div className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto mb-10 text-center font-roboto">
            <p className="mb-4">Instantly</p>
            <RotatingText
              texts={[
                'Analyse rental agreements',
                'Check if your rent is fair',
                'Handle deposit disputes',
                'Generate repair requests',
                'Understand your tenant rights'
              ]}
              mainClassName="px-2 sm:px-2 md:px-3 bg-indigo-100 text-indigo-600 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg font-medium"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={3500}
            />
            <p className="mt-4">with tools designed in consultation with housing experts and tenant advocates.</p>
          </div>
          
          {/* CTA Button with Star Border */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
            <StarBorder 
              as={Link}
              href="/app"
              color="#6366F1"
              speed="8s"
              thickness={2}
              className="font-google-sans font-medium hover:scale-105 transition-transform duration-300"
              style={{ 
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.2)'
              }}
            >
              Try It Out
            </StarBorder>
          </div>
          
          {/* Trust Signals with Realistic Organizations */}
          <div className="w-full max-w-4xl mx-auto">
            <p className="text-center text-sm text-slate-500 mb-4">Developed with guidance from:</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              <div className="flex items-center">
                <div className="text-slate-700 font-medium">Residential Tenancies Board</div>
              </div>
              <div className="flex items-center">
                <div className="text-slate-700 font-medium">Housing Rights Ireland</div>
              </div>
              <div className="flex items-center">
                <div className="text-slate-700 font-medium">Citizens Information</div>
              </div>
              <div className="flex items-center">
                <div className="text-slate-700 font-medium">Threshold</div>
              </div>
            </div>
          </div>
          
          {/* Legal Context Badge */}
          <div className="inline-flex items-start bg-indigo-50 border border-indigo-100 rounded-lg px-6 py-4 mt-8 mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium">Important:</span> This tool provides information based on Irish residential tenancy laws and is regularly updated to reflect legislative changes. While we strive for accuracy, the information provided should not be considered a substitute for professional legal advice.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section with More Realistic Content */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container mx-auto px-6">
          {/* Section Title */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-google-sans">
              Tools for Irish Tenants
            </h2>
            <p className="text-slate-600 text-lg font-roboto">
              Our tools are designed to help you navigate the complexities of Irish residential tenancy law and regulations, with specific focus on the Residential Tenancies Acts.
            </p>
          </div>
          
          {/* Features Grid - More Realistic Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Feature 1: Lease Analyzer */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex group hover:border-indigo-200">
              <div className="bg-indigo-100 p-4 h-fit rounded-full mr-5 group-hover:bg-indigo-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-google-sans">
                  Lease Analyzer
                </h3>
                <p className="text-slate-600 mb-4 font-roboto">
                  Upload your lease agreement to identify potentially unfair terms, illegal fees, and confusing language. Our analyzer checks against the latest provisions in the Residential Tenancies Acts and highlights areas of concern.
                </p>
                <Link href="/app" className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center group-hover:underline">
                  Analyze your lease
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Feature 2: Fair Rent Checker */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex group hover:border-indigo-200">
              <div className="bg-indigo-100 p-4 h-fit rounded-full mr-5 group-hover:bg-indigo-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-google-sans">
                  Fair Rent Checker
                </h3>
                <p className="text-slate-600 mb-4 font-roboto">
                  Verify if your property is in a Rent Pressure Zone (RPZ) and check if your rent increase complies with the 2% cap or HICP regulations. Our tool uses the official RTB database to provide accurate information.
                </p>
                <Link href="/app" className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center group-hover:underline">
                  Check your rent
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Feature 3: Repair Requests */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex group hover:border-indigo-200">
              <div className="bg-indigo-100 p-4 h-fit rounded-full mr-5 group-hover:bg-indigo-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-google-sans">
                  Repair Request Assistant
                </h3>
                <p className="text-slate-600 mb-4 font-roboto">
                  Generate professional repair request letters based on the Housing (Standards for Rented Houses) Regulations 2019. Our templates help you clearly document issues and request timely repairs in line with your tenant rights.
                </p>
                <Link href="/app" className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center group-hover:underline">
                  Create a request
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Feature 4: Deposit Dispute Kit */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex group hover:border-indigo-200">
              <div className="bg-indigo-100 p-4 h-fit rounded-full mr-5 group-hover:bg-indigo-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-google-sans">
                  Deposit Dispute Kit
                </h3>
                <p className="text-slate-600 mb-4 font-roboto">
                  Prepare for RTB dispute resolution with our comprehensive toolkit. Document property conditions, distinguish between normal wear and tear versus damage, and build your case with evidence that meets RTB requirements.
                </p>
                <Link href="/app" className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center group-hover:underline">
                  Prepare your case
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Legal Information Section - More Detailed */}
      <section className="bg-indigo-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <div className="flex items-start mb-8">
              <div className="bg-indigo-100 p-3 rounded-full mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-google-sans">About Our Tools</h3>
                <p className="text-slate-600 mb-4 font-roboto">
                  Hestia provides information based on the Residential Tenancies Acts 2004-2022 and related Irish housing legislation. Our tools are regularly updated to reflect changes in the law, including amendments to the Residential Tenancies Act and updates to Rent Pressure Zone designations.
                </p>
                <p className="text-slate-600 font-roboto">
                  While we strive for accuracy and comprehensiveness, our tools should be used as an informational resource rather than a substitute for professional legal advice, especially for complex cases.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm text-gray-600">Updated with current RTB guidelines and determinations</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm text-gray-600">Compliant with GDPR and Irish data protection laws</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm text-gray-600">Incorporates 2022 Rent Pressure Zone regulations</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm text-gray-600">Based on Housing Standards Regulations 2019</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer with More Professional Layout */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="ml-2 text-lg font-bold text-indigo-600 font-google-sans">HESTIA</span>
            </div>
            <div className="flex space-x-8">
              <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-roboto">About</Link>
              <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-roboto">Privacy</Link>
              <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-roboto">Terms</Link>
              <Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors font-roboto">Contact</Link>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500 text-center">
              © 2025 Hestia. All rights reserved. Helping Irish tenants understand their rights under the Residential Tenancies Acts.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
} 