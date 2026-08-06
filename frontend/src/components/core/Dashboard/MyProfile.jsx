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
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-line bg-surface">
      <span className="text-muted shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-subtle">{label}</p>
        <p className="text-sm text-fg font-medium truncate">
          {value || `Add ${label.toLowerCase()}`}
        </p>
      </div>
    </div>
  );

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-6">
          <img
            src={user?.image}
            alt={fullName || 'Profile'}
            className="w-20 h-20 rounded-full object-cover bg-elevated"
          />

          <div className="mt-4 sm:mt-0 flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-fg truncate">
              {fullName}
            </h1>
            <p className="mt-1 text-sm text-muted truncate">{user?.email}</p>
          </div>

          <div className="mt-5 sm:mt-0 flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="btn-secondary"
            >
              <Edit className="w-4 h-4" />
              Edit profile
            </button>

            <button
              onClick={() => navigate(user?.accountType === 'Instructor' ? "/dashboard/instructor" : "/dashboard/enrolled-courses")}
              className="btn-primary"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-sm font-medium text-fg">About me</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {user?.additionalDetails?.about || "Tell us about yourself..."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard
          icon={<User className="w-5 h-5" />}
          label="Full Name"
          value={fullName}
        />
        <InfoCard
          icon={<Mail className="w-5 h-5" />}
          label="Email"
          value={user?.email}
        />
        <InfoCard
          icon={<Phone className="w-5 h-5" />}
          label="Phone"
          value={user?.additionalDetails?.contactNumber}
        />
        <InfoCard
          icon={<Calendar className="w-5 h-5" />}
          label="Date of Birth"
          value={user?.additionalDetails?.dateOfBirth}
        />
        <InfoCard
          icon={<Users className="w-5 h-5" />}
          label="Gender"
          value={user?.additionalDetails?.gender}
        />
        <InfoCard
          icon={<User className="w-5 h-5" />}
          label="Account Type"
          value={user?.accountType}
        />
      </div>
    </div>
  );
};

export default MyProfile;
