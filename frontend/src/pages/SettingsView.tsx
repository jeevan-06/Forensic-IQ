import React, { useState } from 'react';
import { 
  User, Lock, Bell, Sliders, ShieldCheck, Key, 
  Smartphone, Monitor, Activity, CheckCircle2,
  Mail, Building2, UploadCloud, Eye, EyeOff, Hash
} from 'lucide-react';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'api', label: 'API & Integrations', icon: Key },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-[1200px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-center">
          <Sliders className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings & Preferences</h1>
          <p className="text-[11px] text-gray-400">Manage your account, security, and application preferences.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-purple-600/10 border border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.15)]' 
                    : 'bg-transparent border border-transparent text-gray-400 hover:bg-[#080d1e] hover:border-[#1e293b]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                <span className="text-[11px] font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-[#080d1e] border border-[#1e293b] rounded-2xl p-8 min-h-[600px] shadow-lg">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-sm font-bold text-white mb-6 border-b border-[#1e293b] pb-4">Public Profile</h2>
              
              <div className="flex items-center gap-6 mb-8">
                 <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 p-[2px]">
                      <div className="w-full h-full bg-[#050812] rounded-full overflow-hidden flex items-center justify-center">
                         <User className="w-8 h-8 text-gray-500" />
                      </div>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 px-4 py-2 bg-[#050812] border border-[#1e293b] hover:border-purple-500/50 rounded-lg text-[11px] text-gray-300 transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-purple-400" /> Upload Avatar
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <SettingsInput label="Full Name" icon={User} placeholder="John David Smith" />
                <SettingsInput label="Username" icon={Hash} placeholder="johndoe123" />
                <SettingsInput label="Contact Email" icon={Mail} placeholder="john@example.com" />
                <SettingsInput label="Department" icon={Building2} placeholder="Cyber Crime Division" />
              </div>

              <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] mt-4">
                Save Changes
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-sm font-bold text-white mb-6 border-b border-[#1e293b] pb-4">Security Settings</h2>
              
              <div className="mb-8 p-4 bg-[#050812] border border-[#1e293b] rounded-xl flex items-center justify-between">
                 <div>
                   <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-1">
                     <ShieldCheck className="w-4 h-4 text-green-400" /> Two-Factor Authentication (2FA)
                   </h3>
                   <p className="text-[10px] text-gray-500">Protect your account with an additional layer of security.</p>
                 </div>
                 <div className="w-12 h-6 bg-green-500/20 border border-green-500/50 rounded-full relative cursor-pointer flex items-center shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                   <div className="w-4 h-4 bg-green-400 rounded-full absolute right-1"></div>
                 </div>
              </div>

              <h3 className="text-xs font-bold text-gray-300 mb-4">Change Password</h3>
              <div className="space-y-4 max-w-md mb-8">
                 <SettingsInput label="Current Password" icon={Lock} placeholder="••••••••" type="password" />
                 <SettingsInput label="New Password" icon={Lock} placeholder="••••••••" type="password" />
                 <SettingsInput label="Confirm New Password" icon={Lock} placeholder="••••••••" type="password" />
                 <button className="px-6 py-2 bg-[#050812] border border-purple-500/50 hover:bg-purple-900/20 text-purple-400 text-[11px] font-bold rounded-lg transition-all mt-2">
                   Update Password
                 </button>
              </div>

              <h3 className="text-xs font-bold text-red-400 mb-4 border-t border-[#1e293b] pt-6">Active Sessions</h3>
              <div className="flex items-center justify-between p-4 border border-[#1e293b] rounded-xl">
                 <div className="flex items-center gap-4">
                    <Monitor className="w-6 h-6 text-gray-500" />
                    <div>
                      <div className="text-[11px] font-bold text-white">Windows 11 / Chrome</div>
                      <div className="text-[9px] text-gray-500">New York, USA • IP: 192.168.1.45</div>
                    </div>
                 </div>
                 <span className="text-[10px] text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded border border-green-500/30">Current Session</span>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-sm font-bold text-white mb-6 border-b border-[#1e293b] pb-4">Application Preferences</h2>
              
              <h3 className="text-xs font-bold text-gray-300 mb-4">Appearance</h3>
              <div className="grid grid-cols-3 gap-4 mb-10">
                 <ThemeCard title="Dark Mode" active />
                 <ThemeCard title="Light Mode" />
                 <ThemeCard title="System Default" />
              </div>

              <h3 className="text-xs font-bold text-gray-300 mb-4">Notifications</h3>
              <div className="space-y-4 border border-[#1e293b] rounded-xl p-4 bg-[#050812]">
                 <ToggleRow label="Email Alerts on Match Found" desc="Receive an email when the system finds a high-confidence match." active />
                 <div className="w-full h-[1px] bg-[#1e293b]"></div>
                 <ToggleRow label="System Update Notifications" desc="Get notified about new features and maintenance windows." active />
                 <div className="w-full h-[1px] bg-[#1e293b]"></div>
                 <ToggleRow label="Weekly Digest" desc="Receive a weekly summary of cases and analysis metrics." active={false} />
              </div>
            </div>
          )}

          {/* API TAB */}
          {activeTab === 'api' && (
            <div className="animate-in fade-in duration-300">
               <div className="flex justify-between items-center mb-6 border-b border-[#1e293b] pb-4">
                  <h2 className="text-sm font-bold text-white">API & Integrations</h2>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded-lg text-[10px] text-purple-300 transition-colors">
                    <Key className="w-3 h-3" /> Generate New Key
                  </button>
               </div>
               
               <p className="text-[11px] text-gray-400 mb-6">
                 Use these keys to authenticate API requests from external tools or custom integrations. Keep them secure.
               </p>

               <div className="border border-[#1e293b] rounded-xl overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-[#050812] border-b border-[#1e293b]">
                      <tr className="text-[9px] text-gray-500 uppercase tracking-widest">
                        <th className="p-3 font-medium">Key Name</th>
                        <th className="p-3 font-medium">Token</th>
                        <th className="p-3 font-medium">Created</th>
                        <th className="p-3 font-medium">Last Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b] text-[11px]">
                      <tr className="hover:bg-white/5 transition-colors">
                         <td className="p-3 text-white font-bold">Production Engine</td>
                         <td className="p-3 text-gray-500 font-mono">sk_live_...4f9a</td>
                         <td className="p-3 text-gray-400">12 Jan 2024</td>
                         <td className="p-3 text-green-400">Today, 10:24 AM</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                         <td className="p-3 text-white font-bold">Testing Environment</td>
                         <td className="p-3 text-gray-500 font-mono">sk_test_...8b2c</td>
                         <td className="p-3 text-gray-400">15 Mar 2024</td>
                         <td className="p-3 text-gray-500">Never</td>
                      </tr>
                    </tbody>
                 </table>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Subcomponents

function SettingsInput({ label, icon: Icon, placeholder, type = "text" }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-[#050812] border border-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>
    </div>
  );
}

function ThemeCard({ title, active }: any) {
  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center gap-3 cursor-pointer transition-all ${
      active ? 'bg-purple-900/10 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.15)]' : 'bg-[#050812] border-[#1e293b] hover:border-gray-700'
    }`}>
       <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${active ? 'bg-purple-600 border-purple-400' : 'bg-gray-800 border-gray-700'}`}>
          <Monitor className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
       </div>
       <span className={`text-[11px] font-bold ${active ? 'text-purple-400' : 'text-gray-400'}`}>{title}</span>
    </div>
  );
}

function ToggleRow({ label, desc, active }: any) {
  return (
    <div className="flex items-center justify-between py-1">
       <div>
         <div className="text-[11px] font-bold text-white mb-0.5">{label}</div>
         <div className="text-[9px] text-gray-500">{desc}</div>
       </div>
       <div className={`w-10 h-5 rounded-full relative cursor-pointer flex items-center transition-colors ${active ? 'bg-purple-600' : 'bg-gray-800'}`}>
          <div className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-all ${active ? 'right-1' : 'left-1'}`}></div>
       </div>
    </div>
  );
}
