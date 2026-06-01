import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { ProfileSidebar } from '../components/layout/ProfileSidebar';
import { TimesheetView } from './TimesheetView';
import { TeamView } from './TeamView';
import { AdminView } from './AdminView';

export const Dashboard = (props) => {
  const { activeTab, setActiveTab } = props;
  const [showProfile, setShowProfile] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <TimesheetView {...props} />
          </motion.div>
        );
      case 'team':
        return (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <TeamView {...props} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <AdminView {...props} />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar
        user={props.user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={props.onLogout}
        onProfileClick={() => setShowProfile(true)}
      />

      <AnimatePresence>
        {showProfile && (
          <ProfileSidebar
            user={props.user}
            onClose={() => setShowProfile(false)}
            showToast={props.showToast}
            onUpdateUser={props.onUpdateUser}
            showConfirm={props.showConfirm}
          />
        )}
      </AnimatePresence>

      <main className="pt-28 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 max-w-7xl mx-auto w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          {renderActiveView()}
        </AnimatePresence>
      </main>
    </div>
  );
};

Dashboard.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  onUpdateUser: PropTypes.func.isRequired,
  showConfirm: PropTypes.func.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.object),
  selectedDate: PropTypes.instanceOf(Date),
  setSelectedDate: PropTypes.func,
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
  addTask: PropTypes.func,
  deleteTask: PropTypes.func,
  editingTask: PropTypes.object,
  setEditingTask: PropTypes.func,
};
