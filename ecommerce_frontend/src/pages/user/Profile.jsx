import React, { useEffect, useState, useRef } from "react";
import API from "../../api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaWallet, FaPhone, FaCalendarAlt, FaEdit, FaTimes, FaSignOutAlt, FaLock, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    newPassword: "",
    confirmPassword: "",
    address: "",
    profileImage: ""
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/profile");
      setUser(data);
      
      // Update local storage to keep navbar in sync with server data
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
      const updatedUser = {
        ...storedUser,
        fullName: data.fullName,
        profileImage: data.profileImage || ""
      };
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdate"));

      setFormData({
        ...formData,
        fullName: data.fullName,
        address: data.address || "",
        profileImage: data.profileImage || ""
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize the image using Canvas
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Get the compressed Base64 string
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality
          setFormData({ ...formData, profileImage: dataUrl });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      const payload = {
        fullName: formData.fullName,
        address: formData.address,
        profileImage: formData.profileImage
      };
      if (formData.newPassword) payload.newPassword = formData.newPassword;

      await API.put("/profile", payload);
      toast.success("Profile updated successfully");
      setEditing(false);
      
      // Update local storage too for immediate navbar update
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
      const updatedUser = {
        ...storedUser,
        fullName: formData.fullName,
        profileImage: formData.profileImage
      };
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      
      // Notify other components (like Navbar) that user data has changed
      window.dispatchEvent(new Event("userUpdate"));
      
      setFormData({ ...formData, newPassword: "", confirmPassword: "" });
      fetchProfile();
    } catch (err) {
      console.error("Update Error:", err);
      toast.error(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth";
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative group overflow-hidden rounded-full shadow-2xl">
                <img
                  src={formData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=128&rounded=true`}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
                <div 
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${!editing && 'pointer-events-none'}`}
                  onClick={() => editing && fileInputRef.current.click()}
                >
                  <FaCamera className="text-white text-2xl" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
              </div>
              <button 
                onClick={() => setEditing(!editing)}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-indigo-600 hover:text-indigo-800 transition-colors border border-gray-100"
              >
                {editing ? <FaTimes /> : <FaEdit />}
              </button>
            </div>
          </div>

          <div className="pt-20 pb-10 px-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {user.fullName}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                {user.role}
              </span>
              <span className="text-sm text-gray-400">• Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            {editing ? (
              /* Edit Form */
              <form onSubmit={handleUpdate} className="mt-10 max-w-lg mx-auto space-y-6 text-left">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaUserCircle />
                      </span>
                      <input
                        name="fullName"
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition-all duration-200"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Shipping Address</label>
                    <div className="relative">
                      <span className="absolute top-3 left-3 flex items-center text-gray-400">
                        <FaMapMarkerAlt />
                      </span>
                      <textarea
                        name="address"
                        rows="3"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition-all duration-200"
                        placeholder="Enter your street address, city, and pincode..."
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Security</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <FaLock />
                        </span>
                        <input
                          name="newPassword"
                          type="password"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition-all duration-200"
                          value={formData.newPassword}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <FaLock />
                        </span>
                        <input
                          name="confirmPassword"
                          type="password"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition-all duration-200"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all shadow-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Profile Info Display */
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest leading-tight">Phone Number</p>
                      <p className="text-lg font-bold text-gray-700 mt-0.5">{user.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl text-green-600">
                      <FaWallet />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest leading-tight">Wallet Balance</p>
                      <p className="text-lg font-bold text-gray-700 mt-0.5">
                        {user.role === "admin" ? "∞ (Admin)" : `₹${user.walletBalance || 0}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors group col-span-1 md:col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest leading-tight">Default Address</p>
                      <p className="text-lg font-medium text-gray-700 mt-0.5">
                        {user.address || "No address saved for shipping."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-colors group col-span-1 md:col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="bg-pink-100 p-3 rounded-xl text-pink-600">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest leading-tight">Last Account Update</p>
                      <p className="text-lg font-bold text-gray-700 mt-0.5">
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Recently joined!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(user.role === 'admin' ? '/dashboard' : '/')}
                className="flex-1 bg-gray-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition-all shadow-lg"
              >
                {user.role === 'admin' ? 'Back to Dashboard' : 'Continue Shopping'}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center justify-center gap-2 flex-1 border-2 border-red-500 text-red-500 font-bold py-3 px-6 rounded-xl hover:bg-red-50 transition-all"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          
          {/* Modal Content Card */}
          <div className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <FaSignOutAlt className="text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight italic">Leaving?</h3>
              <p className="text-gray-500 font-bold text-sm mb-8 leading-relaxed">Are you sure you want to end your session?</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 uppercase tracking-widest text-xs active:scale-95"
                >
                  Yes, Sign Me Out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full bg-gray-100 text-gray-500 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
