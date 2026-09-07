import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { User, Mail, Building, Camera, Loader2, Save, Shield, Compass, MapPin, Calendar, CheckCircle2, Edit2, X } from "lucide-react";

export const ProfilePage = () => {
  const { authUser, updateProfile, uploadAvatar, isUpdatingProfile, isUploadingAvatar } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Reset form data if user data changes externally
    setFormData({
      fullName: authUser?.fullName || "",
      bio: authUser?.bio || "",
      location: authUser?.location || "",
    });
  }, [authUser]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessMsg("");

    // Client-side validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Only jpg, png, and webp are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrorMsg("Image must be less than 5MB.");
      return;
    }

    const res = await uploadAvatar(authUser._id, file);
    if (res.success) {
      setSuccessMsg("Profile photo updated successfully!");
    } else {
      setErrorMsg(res.message || "Failed to update profile photo.");
    }

    // Reset input so the same file can be selected again if needed
    e.target.value = null;
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
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-slate-950 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">

        {/* Messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-sm font-medium">
            <X className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* 1. Header Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="h-40 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 relative">
            <div className="absolute inset-0 bg-black/20" />
            {/* Edit Button */}
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="absolute top-4 right-4 py-2 px-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-xl border border-white/10 transition flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20">

              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-2xl flex items-center justify-center relative">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-slate-500" />
                  )}

                  {/* Upload Spinner Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Change Photo Overlay (only available when not uploading) */}
                {!isUploadingAvatar && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent hover:border-emerald-500/50"
                  >
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">Change Photo</span>
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

              {/* Title Info */}
              <div className="text-center sm:text-left flex-1 mb-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {authUser?.fullName || authUser?.username}
                </h1>
                <p className="text-slate-400 font-medium mt-1 flex items-center justify-center sm:justify-start gap-2">
                  @{authUser?.username}
                  {authUser?.authProvider === "google" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/10 text-slate-300 border border-white/20">
                      Google
                    </span>
                  )}
                </p>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${authUser?.role === "authority"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    }`}
                  >
                    {authUser?.role === "authority" ? <Shield className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                    {authUser?.role === "authority" ? "Park Authority" : "Trekker"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 2. Info Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Profile Information
              </h2>

              {isEditMode ? (
                <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                        placeholder="e.g. Pune, Maharashtra"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex justify-between">
                        Bio
                        <span className={formData.bio.length > 150 ? "text-rose-400" : ""}>
                          {formData.bio.length} / 150
                        </span>
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        maxLength={150}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition resize-none"
                        placeholder="Tell us about your connection to the Sahyadris..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/50">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isUpdatingProfile}
                      className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-semibold text-slate-200">{authUser?.fullName || <span className="text-slate-600 italic">Not provided</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</p>
                      <p className="text-sm font-semibold text-slate-200">{authUser?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</p>
                      <p className="text-sm font-semibold text-slate-200">{authUser?.location || <span className="text-slate-600 italic">Not provided</span>}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined</p>
                      <p className="text-sm font-semibold text-slate-200">{joinedDate}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bio</p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {authUser?.bio || <span className="text-slate-600 italic">No bio provided yet. Add one to tell others about yourself!</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Activity Feed Placeholder */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-700/50 rounded-2xl bg-slate-950/30">
                <Compass className="w-10 h-10 text-slate-600 mb-3" />
                <h3 className="text-slate-300 font-semibold mb-1">No Activity Yet</h3>
                <p className="text-xs text-slate-500 max-w-[250px]">
                  {authUser?.role === "authority"
                    ? "Recent resolved alerts and inspections will appear here."
                    : "Photos you upload for degradation audits will appear here."}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Role Specific Section */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                {authUser?.role === "authority" ? (
                  <><Shield className="w-5 h-5 text-amber-400" /> Official Details</>
                ) : (
                  <><Compass className="w-5 h-5 text-cyan-400" /> Trekker Stats</>
                )}
              </h2>

              {authUser?.role === "authority" ? (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" /> Department / Designation
                    </p>
                    <p className="text-sm font-semibold text-slate-200">
                      {authUser?.authorityDetails?.designation || authUser?.organization || <span className="text-slate-600 italic">Unassigned</span>}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Assigned Forts
                    </p>
                    {authUser?.authorityDetails?.assignedForts?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {authUser.authorityDetails.assignedForts.map(fort => (
                          <span key={fort} className="px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 text-center">
                      <p className="text-2xl font-bold text-cyan-400 mb-1">{authUser?.stats?.treksCompleted || 0}</p>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Treks Logged</p>
                    </div>
                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 text-center">
                      <p className="text-2xl font-bold text-emerald-400 mb-1">{authUser?.stats?.photosContributed || 0}</p>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Photos Contributed</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Forts Visited
                    </p>
                    {authUser?.stats?.fortsVisited?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {authUser.stats.fortsVisited.map(fort => (
                          <span key={fort} className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">
                            {fort}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Hasn't logged any forts yet.</p>
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
