import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  FaChartLine, FaUsers, FaBoxOpen, FaRupeeSign, 
  FaArrowUp, FaArrowDown, FaCalendarAlt, FaUserCircle
} from "react-icons/fa";
import { GridLoader } from "react-spinners";
import API from "../../api";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(15);
  const [showAllRecords, setShowAllRecords] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/analytics?days=${timeRange}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <GridLoader color="#4F46E5" size={15} />
      </div>
    );
  }

  const { summary, revenueChartData, categoryChartData, statusCounts, recentOrders } = data;

  const stats = [
    { 
      label: "Total Revenue", 
      value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`, 
      icon: <FaRupeeSign />, 
      color: "bg-indigo-500",
      trend: "+12.5%",
      isPositive: true
    },
    { 
      label: "Total Orders", 
      value: summary.totalOrders, 
      icon: <FaBoxOpen />, 
      color: "bg-emerald-500",
      trend: "+8.2%",
      isPositive: true
    },
    { 
      label: "Total Users", 
      value: summary.userCount, 
      icon: <FaUsers />, 
      color: "bg-amber-500",
      trend: "+14.1%",
      isPositive: true
    },
    { 
      label: "Products", 
      value: summary.productCount, 
      icon: <FaChartLine />, 
      color: "bg-violet-500",
      trend: "-2.4%",
      isPositive: false
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans italic selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
              Business <span className="text-indigo-600">Intelligence</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Real-time Performance Metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 px-3 py-1 rounded-xl border border-gray-100 flex items-center gap-2">
               <FaCalendarAlt className="text-gray-400 text-xs" />
               <select 
                 value={timeRange} 
                 onChange={(e) => setTimeRange(Number(e.target.value))}
                 className="bg-transparent border-none text-[10px] font-black uppercase text-gray-600 focus:outline-none cursor-pointer"
               >
                 <option value={7}>Last 7 Days</option>
                 <option value={15}>Last 15 Days</option>
                 <option value={30}>Last 30 Days</option>
                 <option value={90}>Last 3 Months</option>
                 <option value={365}>Last Year</option>
               </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
               <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-700`} />
               
               <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg ${stat.color.replace('bg-', 'shadow-')}/20 group-hover:scale-110 transition-transform duration-500`}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {stat.isPositive ? <FaArrowUp /> : <FaArrowDown />}
                    {stat.trend}
                  </div>
               </div>
               
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Revenue Over Time */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Revenue Trajectory</h3>
                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Growth Analytics</p>
                </div>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                      REVENUE
                   </div>
                </div>
             </div>
             
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900 }} 
                      cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Revenue Distribution</h3>
                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Top Selling Categories</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                     <PieChart>
                       <Pie
                         data={categoryChartData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {categoryChartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900 }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                   {categoryChartData.map((cat, i) => (
                     <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                           <span className="text-[9px] font-black uppercase text-gray-600 group-hover:text-black transition-colors">{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-900">₹{cat.value.toLocaleString()}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Order Status Breakdown */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Lifecycle Funnel</h3>
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Current Distribution</span>
             </div>
             <div className="space-y-6">
                {Object.entries(statusCounts).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([status, count], i) => {
                  const percentage = ((count / summary.totalOrders) * 100).toFixed(0);
                  return (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase">
                          <span className="text-gray-500 tracking-widest">{status}</span>
                          <span className="text-gray-900">{count} Units</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                          />
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Live Acquisition Stream</h3>
                <button 
                  onClick={() => setShowAllRecords(!showAllRecords)}
                  className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-200 hover:text-indigo-800 transition-colors"
                >
                  {showAllRecords ? "Collapse Stream" : "View All Records"}
                </button>
             </div>
             
             <div className={`overflow-x-auto transition-all duration-700 ease-in-out ${showAllRecords ? 'max-h-[600px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-gray-50">
                         <th className="pb-4 text-left text-[8px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                         <th className="pb-4 text-left text-[8px] font-black text-gray-400 uppercase tracking-widest">Associate</th>
                         <th className="pb-4 text-center text-[8px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                         <th className="pb-4 text-right text-[8px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {(showAllRecords ? recentOrders : recentOrders.slice(0, 5)).map((order, i) => (
                        <tr key={i} className="group transition-colors hover:bg-gray-50/50">
                           <td className="py-4">
                              <span className="text-[10px] font-black text-indigo-600 italic">#{order.orderId.slice(-6).toUpperCase()}</span>
                              <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Acquisition Sync</p>
                           </td>
                           <td className="py-4">
                              <div className="flex items-center gap-2">
                                 <FaUserCircle className="text-gray-200 text-lg" />
                                 <div>
                                    <p className="text-[10px] font-black uppercase text-gray-900 line-clamp-1">{order.userName}</p>
                                    <p className="text-[8px] font-bold text-gray-400">{order.userPhone}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                order.status === 'Cancelled' ? 'bg-red-50 text-red-500 border-red-100' : 
                                'bg-indigo-50 text-indigo-600 border-indigo-100'
                              }`}>
                                {order.status}
                              </span>
                           </td>
                           <td className="py-4 text-right font-black text-xs text-gray-900 italic">
                              ₹{Number(order.total).toLocaleString()}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
