import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Edit, 
  LayoutDashboard 
} from 'lucide-react';

const MyProfile = () => {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const InfoCard = ({ icon, label, value }) => (
    <div className="flex items-center space-x-4 p-4 bg-zinc-800 rounded-lg hover:bg-slate-700 transition-colors">
      {icon}
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-white font-medium">{value || `Add ${label}`}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-900 rounded-md p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-zinc-800 rounded-xl p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <img
              src={user?.image}
              alt={`${user?.firstName}'s profile`}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-700"
            />
            
            <h1 className="mt-4 text-2xl font-bold text-white">
              {`${user?.firstName} ${user?.lastName}`}
            </h1>
            
            <p className="text-gray-400 mt-1">{user?.email}</p>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-zinc-900 rounded-lg"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              
              <button
                onClick={() => navigate(user?.accountType === 'Instructor' ? "/dashboard/instructor" : "/dashboard/enrolled-courses")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-zinc-900 rounded-lg"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-zinc-800 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">About Me</h2>
          <p className="text-gray-300">
            {user?.additionalDetails?.about || "Tell us about yourself..."}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard
            icon={<User className="w-5 h-5 text-blue-400" />}
            label="Full Name"
            value={`${user?.firstName} ${user?.lastName}`}
          />
          <InfoCard
            icon={<Mail className="w-5 h-5 text-blue-400" />}
            label="Email"
            value={user?.email}
          />
          <InfoCard
            icon={<Phone className="w-5 h-5 text-blue-400" />}
            label="Phone"
            value={user?.additionalDetails?.contactNumber}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-blue-400" />}
            label="Date of Birth"
            value={user?.additionalDetails?.dateOfBirth}
          />
          <InfoCard
            icon={<Users className="w-5 h-5 text-blue-400" />}
            label="Gender"
            value={user?.additionalDetails?.gender}
          />
          <InfoCard
            icon={<User className="w-5 h-5 text-blue-400" />}
            label="Account Type"
            value={user?.accountType}
          />
        </div>
      </div>
    </div>
  );
};

export default MyProfile;