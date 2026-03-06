import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { GrPowerReset } from "react-icons/gr";
import { GridLoader } from "react-spinners";
import API from "../../api";
import "./AdminReport.css";

const formatDate = (dateInput) => {
  if (!dateInput) return "-";
  
  // Handle Firestore Timestamp object
  let date;
  if (dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else if (dateInput._seconds) {
    date = new Date(dateInput._seconds * 1000);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return "-";
  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

const SyncLoaderComponent = () => (
  <div className="flex items-center justify-center p-20">
    <GridLoader color="#000" size={15} />
  </div>
);

function AdminReport() {
  const [loading, setLoading] = useState(true);
  const [currentPageData, setCurrentPageData] = useState([]);
  
  const [searchDate, setSearchDate] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const itemsPerPage = 10;

  const pageCache = useRef({}); 

  const fetchPage = async (pageNumber) => {
    if (pageCache.current[pageNumber]) {
      return pageCache.current[pageNumber];
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNumber,
        limit: itemsPerPage,
        status: filterStatus
      });
      if (searchDate) params.append("date", searchDate);
      if (searchUser) params.append("search", searchUser);

      const response = await API.get(`/admin/orders?${params.toString()}`);
      const fetchedOrders = Array.isArray(response.data.orders) ? response.data.orders : [];
      
      setTotalCount(response.data.totalCount || 0);
      setTotalAmount(response.data.totalAmount || 0);

      pageCache.current[pageNumber] = fetchedOrders;
      return fetchedOrders;
    } catch (err) {
      console.error("Error fetching admin report page:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    const maxPage = Math.ceil(totalCount / itemsPerPage) || 1;
    if (newPage < 1 || newPage > maxPage) return;

    if (!pageCache.current[newPage]) {
      const data = await fetchPage(newPage);
      setCurrentPageData(data);
    } else {
      setCurrentPageData(pageCache.current[newPage]);
    }
    setCurrentPage(newPage);
  };

  useEffect(() => {
    handleApply();
  }, []);

  const handleApply = async () => {
    pageCache.current = {};
    setCurrentPage(1);
    const data = await fetchPage(1);
    setCurrentPageData(data);
  };

  const handleRefresh = () => {
    setSearchDate("");
    setSearchUser("");
    setFilterStatus("ALL");
    handleApply();
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 font-sans px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Sticky Header with Filters */}
        <div className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-sm border border-gray-100 mb-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-shrink-0">
              <input
                type="date"
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold text-xs outline-none focus:ring-2 focus:ring-black transition-all"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>

            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search name, product, Catalog Tag..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold text-xs outline-none focus:ring-2 focus:ring-black transition-all"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
              <IoIosSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold text-xs outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
            >
              <option value="ALL">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Out for Delivery">Out</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="ReturnProduct">ReturnProduct</option>
              <option value="Refund Proceed">Refund Proceed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              className="flex-grow bg-black text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-lg active:scale-95 transition-all" 
              onClick={handleApply}
            >
              Apply Filter
            </button>
            <button 
              className="bg-gray-100 text-gray-400 px-4 py-3 rounded-xl hover:text-black hover:bg-gray-200 transition-all active:scale-95"
              onClick={handleRefresh}
            >
              <GrPowerReset size={18} />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] text-white shadow-xl flex flex-col justify-center">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Session Volume</p>
            <h2 className="text-xl sm:text-3xl font-black">₹{totalAmount.toLocaleString("en-IN")}</h2>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center text-right sm:text-left">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Records Found</p>
            <h2 className="text-xl sm:text-3xl font-black text-gray-900">{totalCount}</h2>
          </div>
        </div>

        {/* Records List/Table */}
        {loading && currentPageData.length === 0 ? (
          <div className="flex justify-center p-20">
             <GridLoader color="#4F46E5" size={15} />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-bottom border-gray-100">
                    <th className="p-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="p-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Item / Category</th>
                    <th className="p-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                    <th className="p-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="p-5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="p-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map((item) => (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <td className="p-5 text-xs font-black text-gray-300">#{item.orderId.slice(-6)}</td>
                      <td className="p-5">
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight line-clamp-1">{item.items?.[0]?.name || item.productName}</p>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{item.items?.[0]?.category || item.productCategory || 'General'}</p>
                      </td>
                      <td className="p-5 text-[10px] font-bold text-gray-500">{formatDate(item.date || item.CREATED_AT)}</td>
                      <td className="p-5">
                        <p className="text-xs font-black text-gray-700 uppercase">{item.userName}</p>
                        <p className="text-[9px] font-bold text-gray-400">{item.userPhone}</p>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          item.status === 'Delivered' ? 'bg-green-50 text-green-600' : 
                          item.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 
                          item.status === 'ReturnProduct' ? 'bg-orange-50 text-orange-500' : 
                          item.status === 'Refund Proceed' ? 'bg-purple-50 text-purple-600' : 
                          item.status === 'Refunded' ? 'bg-indigo-50 text-indigo-600' : 
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {item.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-5 text-right font-black text-sm text-gray-900 italic">
                        ₹{Number(item.total || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {currentPageData.map((item) => (
                <div key={item.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Receipt ID</p>
                      <h3 className="font-black text-xs text-gray-900">#{item.orderId}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      item.status === 'Delivered' ? 'bg-green-50 text-green-600' : 
                      item.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 
                      item.status === 'ReturnProduct' ? 'bg-orange-50 text-orange-500' : 
                      item.status === 'Refund Proceed' ? 'bg-purple-50 text-purple-600' : 
                      item.status === 'Refunded' ? 'bg-indigo-50 text-indigo-600' : 
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      {item.status || "Pending"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl mb-4">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Item Detail</p>
                    <p className="font-black text-xs text-gray-800 line-clamp-1 truncate uppercase">{item.items?.[0]?.name || item.productName}</p>
                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{item.items?.[0]?.category || item.productCategory || 'General'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                      <p className="text-[10px] font-black text-gray-700 truncate">{item.userName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                      <p className="text-sm font-black text-gray-900">₹{Number(item.total || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">{formatDate(item.date || item.CREATED_AT)}</p>
                  </div>
                </div>
              ))}
            </div>

            {currentPageData.length === 0 && !loading && (
              <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-100 text-gray-300 font-bold uppercase tracking-widest text-xs">
                 No report data available
              </div>
            )}
          </>
        )}

        {/* Pagination Controls */}
        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages} <span className="mx-2">•</span> {totalCount} Records
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-black disabled:opacity-20 transition-all shadow-sm"
            >
              <FaArrowLeft size={14} />
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (totalPages > 5 && (pageNum > 3 && pageNum < totalPages - 2 && Math.abs(pageNum - currentPage) > 1)) {
                   if (pageNum === 4 || pageNum === totalPages - 3) return <span key={pageNum} className="text-gray-300">...</span>;
                   return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                      currentPage === pageNum 
                        ? "bg-black text-white shadow-xl shadow-gray-200" 
                        : "bg-white text-gray-400 border border-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-black disabled:opacity-20 transition-all shadow-sm"
            >
              <FaArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default AdminReport;
