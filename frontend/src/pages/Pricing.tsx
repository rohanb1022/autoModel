import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Check, Shield, Zap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      // 1. Create order on the backend
      // Using a test amount of 499 INR
      const orderData = await API.post("/payment/create-order", {
        amount: 499,
        currency: "INR",
      });

      const options = {
        key: orderData.data.key_id, // Dynamically loaded from backend environment variables
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "AutoModel AI",
        description: "Pro Subscription",
        order_id: orderData.data.id,
        handler: async function (response: any) {
          try {
            // 2. Verify payment on the backend
            const userString = localStorage.getItem("user");
            let userId = null;
            if (userString) {
              const userObj = JSON.parse(userString);
              userId = userObj._id || userObj.id;
            }

            const verifyData = await API.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: userId
            });

            if (verifyData.data.success) {
              alert("Payment successful! You are now subscribed.");
              navigate("/dashboard");
            }
          } catch (err) {
            console.error(err);
            alert("Verification failed.");
          }
        },
        prefill: {
          name: "AutoModel User",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong while initiating checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase mb-4">
            Unleash <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Premium</span> Power
          </h1>
          <p className="text-xl text-gray-400">
            Fix data inconsistencies instantly with our auto-healing AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl border border-white/5 bg-[#121212] relative flex flex-col">
            <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
            <p className="text-gray-400 mb-6">For exploring simple datasets.</p>
            <div className="text-4xl font-black text-white mb-8">
              $0<span className="text-lg text-gray-500 font-normal">/mo</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-gray-500 mr-3" /> Basic Model Training
              </li>
              <li className="flex items-center text-gray-300">
                <Check className="w-5 h-5 text-gray-500 mr-3" /> Standard Visualizations
              </li>
              <li className="flex items-center text-gray-500 line-through">
                <Check className="w-5 h-5 text-gray-700 mr-3" /> Auto-Heal Data Errors
              </li>
            </ul>

            <button disabled className="w-full py-4 px-6 rounded-xl font-bold bg-white/5 text-gray-500 cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-3xl border border-indigo-500/30 bg-indigo-950/10 relative flex flex-col ring-1 ring-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.15)]">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full flex items-center gap-1 ">
                <Sparkles className="w-3 h-3" /> Popular
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Pro</h3>
            <p className="text-gray-400 mb-6">For professional workflows & heavy datasets.</p>
            <div className="text-4xl font-black text-white mb-8">
              ₹499<span className="text-lg text-gray-500 font-normal">/mo</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-gray-200">
                <Check className="w-5 h-5 text-indigo-400 mr-3" /> Advanced Model Generation
              </li>
              <li className="flex items-center text-gray-200">
                <Check className="w-5 h-5 text-indigo-400 mr-3" /> Unlimited Dataset Size
              </li>
              <li className="flex items-center text-white font-bold">
                <Zap className="w-5 h-5 text-yellow-400 mr-3 fill-yellow-400" /> AI Auto-Heal & Imputations
              </li>
            </ul>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Upgrade to Pro"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
