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
    .toLocaleString("en-IN", {
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
      <div className="admins-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="search-bar-top" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <input
              type="date"
              className="reporter-search-date"
              style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #eee', fontWeight: 'bold' }}
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>

          <div className="search-input-wraper" style={{ position: 'relative', flexGrow: 1 }}>
            <input
              type="text"
              className="reporter-search-shop"
              placeholder="Search Name, Product, Category..."
              style={{ width: '100%', padding: '0.8rem 3rem 0.8rem 1rem', borderRadius: '12px', border: '1px solid #eee', fontWeight: 'bold' }}
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
            <span className="search-icon" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }}>
              <IoIosSearch size={20} />
            </span>
          </div>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #eee', fontWeight: 'bold', background: '#fff' }}
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button 
            className="search-apply-btn" 
            onClick={handleApply}
            style={{ background: '#000', color: '#fff', padding: '0.8rem 2rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
          >
            Apply
          </button>

          <div 
            className="reset-applay-btn" 
            onClick={handleRefresh}
            style={{ padding: '0.8rem', cursor: 'pointer', color: '#999', background: '#f5f5f5', borderRadius: '12px' }}
          >
            <GrPowerReset size={20} />
          </div>
        </div>

        <div style={{ background: '#000', color: '#fff', padding: '1.5rem 2rem', borderRadius: '24px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '900', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Page Sales</p>
            <h2 style={{ fontSize: '24px', fontWeight: '900' }}>₹{totalAmount.toLocaleString("en-IN")}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', fontWeight: '900', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Matching Records</p>
            <h2 style={{ fontSize: '24px', fontWeight: '900' }}>{totalCount}</h2>
          </div>
        </div>

        {loading && currentPageData.length === 0 ? (
          <SyncLoaderComponent />
        ) : (
          <div className="report-table" style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <table className="reports-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Sl.No</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Receipt ID</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Date & Time</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1.2rem', textAlign: 'right', fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {currentPageData.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '1.2rem', fontSize: '12px', fontWeight: 'bold', color: '#ccc' }}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td style={{ padding: '1.2rem', fontSize: '13px', fontWeight: '900' }}>#{item.orderId}</td>
                    <td style={{ padding: '1.2rem' }}>
                      <p style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.items?.[0]?.name || item.productName}</p>
                      <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#555FE6', textTransform: 'uppercase' }}>{item.items?.[0]?.category || item.productCategory || 'General'}</p>
                    </td>
                    <td style={{ padding: '1.2rem', fontSize: '11px', fontWeight: 'bold' }}>{formatDate(item.date || item.CREATED_AT)}</td>
                    <td style={{ padding: '1.2rem' }}>
                      <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.userName}</p>
                      <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#aaa' }}>{item.userPhone}</p>
                    </td>
                    <td style={{ padding: '1.2rem' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '100px', 
                        fontSize: '9px', 
                        fontWeight: '900', 
                        textTransform: 'uppercase',
                        background: item.status === 'Delivered' ? '#E8F5E9' : item.status === 'Cancelled' ? '#FFEBEE' : '#FFF9C4',
                        color: item.status === 'Delivered' ? '#2E7D32' : item.status === 'Cancelled' ? '#C62828' : '#F9A825'
                      }}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem', textAlign: 'right', fontSize: '14px', fontWeight: '900' }}>
                      ₹{Number(item.total || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}

                {currentPageData.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: "center", padding: "4rem", fontWeight: 'bold', color: '#ccc' }}
                    >
                      No sales records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="bottom-container-admins" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <p className="total-admims" style={{ fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Page {currentPage} of {totalPages}</p>

          <div className="pagination" style={{ display: 'flex', gap: '8px' }}>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              style={{ background: '#fff', border: '1px solid #eee', padding: '10px', borderRadius: '12px', cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer', color: (currentPage === 1 || loading) ? '#eee' : '#000' }}
            >
              <FaArrowLeft />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (totalPages > 5 && (pageNum > 3 && pageNum < totalPages - 2 && Math.abs(pageNum - currentPage) > 1)) {
                 if (pageNum === 4 || pageNum === totalPages - 3) return <span key={pageNum} style={{ alignSelf: 'center', color: '#ddd' }}>...</span>;
                 return null;
              }
              return (
                <button
                  key={pageNum}
                  className={currentPage === pageNum ? "active-page" : "inactive-page"}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    border: 'none', 
                    fontWeight: '900',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: currentPage === pageNum ? '#000' : '#fff',
                    color: currentPage === pageNum ? '#fff' : '#aaa',
                    boxShadow: currentPage === pageNum ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              style={{ background: '#fff', border: '1px solid #eee', padding: '10px', borderRadius: '12px', cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer', color: (currentPage === totalPages || loading) ? '#eee' : '#000' }}
            >
              <FaArrowRight />
            </button>
          </div>

          <p className="total-admims" style={{ fontSize: '10px', fontWeight: '900', color: '#aaa', textTransform: 'uppercase' }}>Total Records: {totalCount}</p>
        </div>
      </div>
    </>
  );
}

export default AdminReport;
