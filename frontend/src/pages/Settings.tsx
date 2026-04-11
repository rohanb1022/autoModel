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
            <div className="h-1 w-12 bg-indigo-500 rounded-full" />
            <span className="text-indigo-400 font-mono text-[10px] md:text-xs uppercase tracking-widest">Configuration</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight italic uppercase">
            SET<span className="text-indigo-500 text-stroke-white">TINGS</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-lg mt-2 text-sm md:text-base">
            Manage your account preferences and platform configuration.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 space-y-6 border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Display Name</Label>
              <Input defaultValue="John Doe" className="bg-white/5 border-white/10 rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</Label>
              <Input defaultValue="john@example.com" type="email" className="bg-white/5 border-white/10 rounded-xl h-12" />
            </div>
          </div>
          <Button className="w-full md:w-auto px-10 h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
