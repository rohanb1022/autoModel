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
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#00000b] mb-4">
            Unleash <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4b41e1] to-[#8b5cf6]">Premium</span> Power
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Fix data inconsistencies instantly with our auto-healing AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white relative flex flex-col shadow-sm">
            <h3 className="text-2xl font-black text-[#00000b] mb-2 tracking-tight">Basic</h3>
            <p className="text-slate-500 mb-6 font-medium">For exploring simple datasets.</p>
            <div className="text-5xl font-black text-[#00000b] mb-8 tracking-tighter">
              $0<span className="text-xl text-slate-400 font-bold">/mo</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-slate-600 font-bold">
                <Check className="w-5 h-5 text-slate-400 mr-3" /> Basic Model Training
              </li>
              <li className="flex items-center text-slate-600 font-bold">
                <Check className="w-5 h-5 text-slate-400 mr-3" /> Standard Visualizations
              </li>
              <li className="flex items-center text-slate-400 font-medium line-through">
                <Check className="w-5 h-5 text-slate-300 mr-3" /> Auto-Heal Data Errors
              </li>
            </ul>

            <button disabled className="w-full py-4 px-6 rounded-xl font-bold bg-slate-50 border border-slate-200 text-slate-400 shadow-sm cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-[2.5rem] border border-[#4b41e1]/20 bg-slate-50 relative flex flex-col ring-1 ring-[#4b41e1]/10 shadow-[0_20px_50px_rgba(75,65,225,0.06)] hover:shadow-[0_20px_60px_rgba(75,65,225,0.1)] transition-all">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-[#4b41e1] text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg shadow-[#4b41e1]/30">
                <Sparkles className="w-3 h-3 text-[#e2dfff]" /> Popular
              </span>
            </div>

            <h3 className="text-2xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#4b41e1] to-[#8b5cf6] tracking-tight">Pro</h3>
            <p className="text-slate-500 mb-6 font-medium">For professional workflows & heavy datasets.</p>
            <div className="text-5xl font-black text-[#00000b] mb-8 tracking-tighter">
              ₹499<span className="text-xl text-slate-400 font-bold">/mo</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center text-slate-700 font-bold">
                <Check className="w-5 h-5 text-[#4b41e1] mr-3" /> Advanced Model Generation
              </li>
              <li className="flex items-center text-slate-700 font-bold">
                <Check className="w-5 h-5 text-[#4b41e1] mr-3" /> Unlimited Dataset Size
              </li>
              <li className="flex items-center text-[#4b41e1] font-black tracking-tight">
                <Zap className="w-5 h-5 text-[#4b41e1] mr-3 fill-[#4b41e1]/20" /> AI Auto-Heal & Imputations
              </li>
            </ul>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold bg-[#00000b] hover:bg-slate-900 text-white transition-all shadow-xl shadow-black/10 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Upgrade to Pro"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
