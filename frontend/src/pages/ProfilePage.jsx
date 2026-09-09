import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { User, Mail, Building, Camera, Loader2, Save, Shield, Compass, MapPin, Calendar, CheckCircle2, Edit2, X, Image as ImageIcon, RotateCcw } from "lucide-react";

export const ProfilePage = () => {
  const {
    authUser,
    updateProfile,
    uploadAvatar,
    uploadBanner,
    removeBanner,
    isUpdatingProfile,
    isUploadingAvatar,
    isUploadingBanner,
  } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [imgError, setImgError] = useState(false);
  const [bannerImgError, setBannerImgError] = useState(false);
  const fileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);

  useEffect(() => {
    setFormData({
      fullName: authUser?.fullName || "",
      bio: authUser?.bio || "",
      location: authUser?.location || "",
    });
    setImgError(false);
  }, [authUser]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Only jpg, png, and webp are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image must be less than 5MB.");
      return;
    }

    const res = await uploadAvatar(authUser._id, file);
    if (res.success) {
      setSuccessMsg("Profile photo updated successfully!");
    } else {
      setErrorMsg(res.message || "Failed to update profile photo.");
    }

    e.target.value = null;
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Only jpg, png, and webp are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Banner image must be less than 5MB.");
      return;
    }

    const res = await uploadBanner(authUser._id, file);
    if (res.success) {
      setSuccessMsg("Cover banner updated successfully!");
      setBannerImgError(false);
    } else {
      setErrorMsg(res.message || "Failed to update banner.");
    }

    e.target.value = null;
  };

  const handleResetBanner = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    const res = await removeBanner(authUser._id);
    if (res.success) {
      setSuccessMsg("Banner reset to default contrast gradient.");
      setBannerImgError(false);
    } else {
      setErrorMsg(res.message || "Failed to reset banner.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const res = await updateProfile(formData);
    if (res.success) {
      setSuccessMsg("Profile details updated successfully!");
      setIsEditMode(false);
    } else {
      setErrorMsg(res.message || "Failed to update profile details.");
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setFormData({
      fullName: authUser?.fullName || "",
      bio: authUser?.bio || "",
      location: authUser?.location || "",
    });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const joinedDate = new Date(authUser?.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const displayAvatar = authUser?.avatarUrl || authUser?.profilePic;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-[#F5F8F4] flex justify-center relative overflow-hidden">
      {/* Environmental Ambient Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-3xl animate-gradient-shift" />
        <div className="absolute -bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/[0.03] blur-3xl animate-gradient-shift" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-4xl space-y-6 relative z-10 animate-fade-in-up">

        {/* Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-fade-in-up shadow-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <p>{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-semibold animate-fade-in-up shadow-xs">
            <X className="w-5 h-5 shrink-0 text-rose-600" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* 1. Header Section with Customizable Banner & Default Contrast Gradient */}
        <div className="bg-white border border-[#E2ECE4] rounded-3xl overflow-hidden shadow-xs">
          <div className="h-44 sm:h-48 relative overflow-hidden bg-gradient-to-r from-[#0b2416] via-[#04421b] to-[#0f5c2b]">
            {/* Custom Banner Image or Default Rich Contrast Gradient */}
            {authUser?.bannerUrl && !bannerImgError ? (
              <img
                src={authUser.bannerUrl}
                alt="Profile Cover Banner"
                className="w-full h-full object-cover object-center"
                onError={() => setBannerImgError(true)}
              />
            ) : (
              <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-[#0b2416] via-[#04421b] to-[#0f5c2b]">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-400/15 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-teal-400/15 blur-xl" />
              </div>
            )}

            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

            {/* Top Right Action Controls: Edit Banner & Edit Profile */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBannerChange}
              />

              {/* Edit Banner Button */}
              <button
                onClick={() => bannerFileInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="py-2 px-3.5 bg-black/40 hover:bg-black/60 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md border border-white/20 disabled:opacity-50"
                title="Upload custom banner photo"
              >
                {isUploadingBanner ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Edit Banner</span>
                  </>
                )}
              </button>

              {/* Reset to Default Gradient Button (only when custom banner exists) */}
              {authUser?.bannerUrl && (
                <button
                  onClick={handleResetBanner}
                  disabled={isUploadingBanner}
                  className="py-2 px-3 bg-black/40 hover:bg-black/60 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer backdrop-blur-md border border-white/20"
                  title="Reset to default gradient banner"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              {/* Edit Profile Details Button */}
              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="py-2 px-4 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">

              {/* Avatar (only the circular avatar overlaps the bottom edge of banner) */}
              <div className="relative group shrink-0 -mt-16 sm:-mt-20">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-md flex items-center justify-center relative">
                  {displayAvatar && !imgError ? (
                    <img
                      src={displayAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#E8F0EA] flex items-center justify-center text-emerald-800">
                      <User className="w-16 h-16 sm:w-20 sm:h-20" />
                    </div>
                  )}

                  {/* Upload Spinner Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Change Photo Overlay */}
                {!isUploadingAvatar && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent hover:border-emerald-400/50"
                  >
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Change Photo</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageChange}
                  disabled={isUploadingAvatar}
                />
              </div>

              {/* Title Info — positioned completely below the banner in the clean white section */}
              <div className="text-center sm:text-left flex-1 pt-2 sm:pt-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#132A22] tracking-tight">
                  {authUser?.fullName || authUser?.username}
                </h1>
                <p className="text-[#52685E] font-medium text-sm mt-0.5 flex items-center justify-center sm:justify-start gap-2">
                  @{authUser?.username}
                  {authUser?.authProvider === "google" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      Google
                    </span>
                  )}
                </p>
                <div className="mt-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${authUser?.role === "authority"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    {authUser?.role === "authority" ? <Shield className="w-4 h-4 text-amber-600" /> : <Compass className="w-4 h-4 text-emerald-600" />}
                    {authUser?.role === "authority" ? "Park Authority" : "Sahyadri Trekker"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 2. Info Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-[#132A22] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-700" />
                Profile Information
              </h2>

              {isEditMode ? (
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#132A22] mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F8FAF8] border border-[#D5E2D8] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#132A22] mb-1.5">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F8FAF8] border border-[#D5E2D8] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                        placeholder="e.g. Pune, Maharashtra"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#132A22] mb-1.5 flex justify-between">
                        Bio
                        <span className={`text-[11px] ${formData.bio.length > 150 ? "text-rose-600" : "text-[#52685E]"}`}>
                          {formData.bio.length} / 150
                        </span>
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        maxLength={150}
                        rows={3}
                        className="w-full px-4 py-3 bg-[#F8FAF8] border border-[#D5E2D8] rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition resize-none"
                        placeholder="Tell us about your connection to the Sahyadris..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2ECE4]">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isUpdatingProfile}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#52685E] uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-semibold text-slate-800">{authUser?.fullName || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#52685E] uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600" /> Email</p>
                      <p className="text-sm font-semibold text-slate-800">{authUser?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#52685E] uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> Location</p>
                      <p className="text-sm font-semibold text-slate-800">{authUser?.location || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#52685E] uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> Member Since</p>
                      <p className="text-sm font-semibold text-slate-800">{joinedDate}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-[#E2ECE4]">
                    <p className="text-xs font-bold text-[#52685E] uppercase tracking-wider">Bio</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {authUser?.bio || <span className="text-slate-400 italic font-normal">No bio provided yet. Add one to tell others about yourself!</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Activity Feed Placeholder */}
            <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-[#132A22] mb-4">Recent Trail Activity</h2>
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#CBD5E1] rounded-2xl bg-[#F8FAF8]">
                <Compass className="w-10 h-10 text-slate-400 mb-2" />
                <h3 className="text-slate-800 font-bold mb-1 text-sm">No Activity Logged Yet</h3>
                <p className="text-xs text-[#52685E] max-w-[260px] font-medium">
                  {authUser?.role === "authority"
                    ? "Recent resolved alerts and inspections will appear here."
                    : "Photos and trail evidence you upload will appear here."}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Role Specific Section */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 shadow-xs">
              <h2 className="text-lg font-bold text-[#132A22] mb-6 flex items-center gap-2">
                {authUser?.role === "authority" ? (
                  <><Shield className="w-5 h-5 text-amber-600" /> Official Details</>
                ) : (
                  <><Compass className="w-5 h-5 text-emerald-600" /> Trekker Stats</>
                )}
              </h2>

              {authUser?.role === "authority" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-[#E2ECE4]">
                    <p className="text-xs font-bold text-[#52685E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-600" /> Department / Designation
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {authUser?.authorityDetails?.designation || authUser?.organization || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                    </p>
                  </div>
                  <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-[#E2ECE4]">
                    <p className="text-xs font-bold text-[#52685E] uppercase tracking-wider mb-2">
                      Assigned Forts
                    </p>
                    {authUser?.authorityDetails?.assignedForts?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {authUser.authorityDetails.assignedForts.map(fort => (
                          <span key={fort} className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                            {fort}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No specific forts assigned yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 text-center">
                      <p className="text-2xl font-black text-sky-800 mb-0.5">{authUser?.stats?.treksCompleted || 0}</p>
                      <p className="text-[10px] font-bold text-[#52685E] uppercase tracking-wider">Treks Logged</p>
                    </div>
                    <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center">
                      <p className="text-2xl font-black text-emerald-800 mb-0.5">{authUser?.stats?.photosContributed || 0}</p>
                      <p className="text-[10px] font-bold text-[#52685E] uppercase tracking-wider">Photos Uploaded</p>
                    </div>
                  </div>
                  <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-[#E2ECE4]">
                    <p className="text-xs font-bold text-[#52685E] uppercase tracking-wider mb-2">
                      Forts Visited
                    </p>
                    {authUser?.stats?.fortsVisited?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {authUser.stats.fortsVisited.map(fort => (
                          <span key={fort} className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg">
                            {fort}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic font-normal">Hasn't logged any forts yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
