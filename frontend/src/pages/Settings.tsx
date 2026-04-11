import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 py-6 md:p-8 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 w-12 bg-[#4b41e1] rounded-full" />
            <span className="text-[#4b41e1] font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">Configuration</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#00000b] tracking-tighter">
            User <span className="text-[#4b41e1]">Settings</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mt-2 text-sm md:text-base">
            Manage your account preferences and platform configuration.
          </p>
        </div>

        <div className="rounded-[2rem] p-6 md:p-8 space-y-6 border border-slate-100 bg-white/60 backdrop-blur-2xl shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Display Name</Label>
              <Input defaultValue="John Doe" className="bg-white border-slate-200 text-[#00000b] rounded-xl h-12 focus:ring-2 focus:ring-[#4b41e1]/30 focus:border-[#4b41e1] shadow-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</Label>
              <Input defaultValue="john@example.com" type="email" className="bg-white border-slate-200 text-[#00000b] rounded-xl h-12 focus:ring-2 focus:ring-[#4b41e1]/30 focus:border-[#4b41e1] shadow-sm" />
            </div>
          </div>
          <Button className="w-full md:w-auto px-10 h-12 rounded-xl bg-[#00000b] hover:bg-slate-900 text-white font-bold shadow-xl shadow-black/10 hover:-translate-y-0.5 active:scale-95 transition-all">
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
