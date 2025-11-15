
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface CreditPlan {
  name: string;
  credits: number;
  price: number;
  description: string;
}

const plans: CreditPlan[] = [
  { name: 'Starter Pack', credits: 30, price: 99, description: "Perfect for getting started." },
  { name: 'Creator Pack', credits: 100, price: 299, description: "Best value for regular creators." },
  { name: 'Pro Pack', credits: 200, price: 499, description: "For power users and professionals." },
];

const UPI_ID = '8297595449@naviaxis';
const QR_CODE_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=8297595449@naviaxis%26pn=DI-VISION%26cu=INR';

const CreditsPage: React.FC = () => {
  const { addPaymentRequest } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<CreditPlan>(plans[1]);
  const [utrCode, setUtrCode] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrCode.trim()) {
      alert('Please enter the UTR/Transaction ID.');
      return;
    }
    addPaymentRequest({
      plan: selectedPlan.name,
      amount: selectedPlan.price,
      utrCode: utrCode.trim(),
      date: new Date().toISOString(),
    });
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-fade-in text-center">
        <div className="p-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark border border-light-border dark:border-dark-border backdrop-filter backdrop-blur">
          <h1 className="text-3xl font-bold mb-4">Request Submitted</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you! Your payment request has been received. Credits will be added to your account upon verification, which typically takes a few hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 animate-slide-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Purchase Credits</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Fuel your creativity with a secure, one-time purchase. No subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Step 1 & 2: Select Plan and Pay */}
        <div className="space-y-8">
            {/* Plan Selection */}
            <div>
              <h2 className="text-2xl font-bold mb-4"><span className="text-primary mr-2">1.</span> Select Your Plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <button key={plan.credits} onClick={() => setSelectedPlan(plan)} className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${selectedPlan.credits === plan.credits ? 'border-primary bg-primary/10 scale-105' : 'bg-light-card/80 dark:bg-dark-card/80 border-light-border dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-600'}`}>
                      <p className="font-bold text-xl">{plan.credits} Credits</p>
                      <p className="font-extrabold text-3xl my-2">₹{plan.price}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
                    </button>
                  ))}
              </div>
            </div>

            {/* Payment Details */}
            <div>
                <h2 className="text-2xl font-bold mb-4"><span className="text-primary mr-2">2.</span> Make Payment</h2>
                <div className="p-6 bg-light-card dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border flex flex-col sm:flex-row items-center gap-6">
                    <img src={QR_CODE_URL} alt="UPI QR Code" className="w-40 h-40 rounded-lg bg-white p-2" />
                    <div className="space-y-2 text-center sm:text-left">
                        <p className="font-semibold">Scan the QR code with any UPI app.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">or pay to UPI ID:</p>
                        <p className="font-mono bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-md text-center">{UPI_ID}</p>
                        <p className="font-bold text-2xl pt-2">Amount to Pay: <span className="text-primary">₹{selectedPlan.price}</span></p>
                    </div>
                </div>
            </div>
        </div>

        {/* Step 3: Submit Details */}
        <div>
          <h2 className="text-2xl font-bold mb-4"><span className="text-primary mr-2">3.</span> Confirm Your Purchase</h2>
          <form onSubmit={handleSubmit} className="p-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark border border-light-border dark:border-dark-border space-y-6">
              <div>
                  <label htmlFor="utr" className="block mb-2 text-sm font-medium">UTR / Transaction ID</label>
                  <input id="utr" type="text" value={utrCode} onChange={e => setUtrCode(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition" placeholder="Enter the 12-digit transaction ID" />
                  <p className="text-xs text-gray-500 mt-2">You can find this ID in your UPI app's transaction history after payment.</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg text-sm">
                  <p>You are purchasing the <span className="font-bold">{selectedPlan.name}</span> for <span className="font-bold">₹{selectedPlan.price}</span>, which will add <span className="font-bold">{selectedPlan.credits} credits</span> to your account upon approval.</p>
              </div>
              <button type="submit" className="w-full py-3 px-4 text-white font-semibold bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-105">
                Submit for Verification
              </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;
