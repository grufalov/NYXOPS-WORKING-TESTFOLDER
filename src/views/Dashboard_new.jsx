import React, { useState, useEffect } from 'react';
import { FolderOpen, Briefcase, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { errorBus } from '../utils/errorBus';
import ErrorInline from '../components/ErrorInline';
import QuoteBar from '../components/QuoteBar';
import MorningChecklistCard from './dashboard/MorningChecklistCard';
import TaskListFull from './dashboard/TaskListFull';
import QuickNotesCard from './dashboard/QuickNotesCard';

const Dashboard = ({ setActiveTab, isDarkTheme, user }) => {
  // KPI state
  const [kpiData, setKpiData] = useState({
    openCases: 0,
    activeProjects: 0,
    rolesAtRisk: 0
  });
  const [kpiLoading, setKpiLoading] = useState({
    openCases: true,
    activeProjects: true,
    rolesAtRisk: true
  });
  const [kpiErrors, setKpiErrors] = useState({
    openCases: null,
    activeProjects: null,
    rolesAtRisk: null
  });

  useEffect(() => {
    if (user?.id) {
      loadKPIs();
    }
  }, [user?.id]);

  const loadKPIs = async () => {
    await Promise.all([
      loadOpenCases(),
      loadActiveProjects(),
      loadRolesAtRisk()
    ]);
  };

  const loadOpenCases = async () => {
    try {
      setKpiLoading(prev => ({ ...prev, openCases: true }));
      setKpiErrors(prev => ({ ...prev, openCases: null }));

      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'open');

      if (error) throw error;

      setKpiData(prev => ({ ...prev, openCases: count || 0 }));
    } catch (err) {
      setKpiErrors(prev => ({ ...prev, openCases: err.message }));
      errorBus.pushError({ source: 'Open Cases KPI', message: err.message });
    } finally {
      setKpiLoading(prev => ({ ...prev, openCases: false }));
    }
  };

  const loadActiveProjects = async () => {
    try {
      setKpiLoading(prev => ({ ...prev, activeProjects: true }));
      setKpiErrors(prev => ({ ...prev, activeProjects: null }));

      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      setKpiData(prev => ({ ...prev, activeProjects: count || 0 }));
    } catch (err) {
      setKpiErrors(prev => ({ ...prev, activeProjects: err.message }));
      errorBus.pushError({ source: 'Active Projects KPI', message: err.message });
    } finally {
      setKpiLoading(prev => ({ ...prev, activeProjects: false }));
    }
  };

  const loadRolesAtRisk = async () => {
    try {
      setKpiLoading(prev => ({ ...prev, rolesAtRisk: true }));
      setKpiErrors(prev => ({ ...prev, rolesAtRisk: null }));

      const { count, error } = await supabase
        .from('roles_at_risk')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'monitoring');

      if (error) throw error;

      setKpiData(prev => ({ ...prev, rolesAtRisk: count || 0 }));
    } catch (err) {
      setKpiErrors(prev => ({ ...prev, rolesAtRisk: err.message }));
      errorBus.pushError({ source: 'Roles at Risk KPI', message: err.message });
    } finally {
      setKpiLoading(prev => ({ ...prev, rolesAtRisk: false }));
    }
  };

  const handleKPIClick = (type) => {
    switch (type) {
      case 'cases':
        setActiveTab('cases');
        break;
      case 'projects':
        setActiveTab('projects');
        break;
      case 'roles':
        setActiveTab('roles-at-risk');
        break;
    }
  };

  const KPICard = ({ title, value, loading, error, onRetry, onClick, icon: Icon, gradient }) => (
    <div 
      onClick={onClick}
      className={`${isDarkTheme ? 'bg-[#424250]' : 'bg-[#f3f4fd]'} rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-offset-2`}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className={`${gradient} p-3`}>
        <div className="flex items-center gap-2 text-white">
          <Icon className="w-4 h-4" />
          <p className="text-xs font-medium">{title}</p>
        </div>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        ) : error ? (
          <ErrorInline 
            message="Error loading"
            onRetry={onRetry}
            isDarkTheme={isDarkTheme}
          />
        ) : value === 0 ? (
          <div className="text-center py-2">
            <p className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>0</p>
            <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} text-xs`}>
              All clear
            </p>
          </div>
        ) : (
          <>
            <p className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            <p className={`${isDarkTheme ? 'text-slate-400' : 'text-gray-500'} text-xs`}>
              Click to view
            </p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[#30313e]' : 'bg-[#e3e3f5]'}`}>
      <div className="container mx-auto px-6 py-8">
        
        {/* Top: Quote Bar */}
        <div className="mb-8">
          <QuoteBar />
        </div>

        {/* Row 1: Morning Checklist (Left) + Task List (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
          {/* Left: Morning Checklist */}
          <div className="xl:col-span-2">
            <MorningChecklistCard isDarkTheme={isDarkTheme} user={user} />
          </div>
          
          {/* Right: Task List Full */}
          <div className="xl:col-span-3">
            <TaskListFull isDarkTheme={isDarkTheme} user={user} />
          </div>
        </div>

        {/* Row 2: KPI Stack (Left) + Quick Notes (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: KPI Cards Stack */}
          <div className="xl:col-span-2 grid grid-rows-3 gap-6">
            
            {/* Open Cases KPI */}
            <KPICard
              title="Open Cases"
              value={kpiData.openCases}
              loading={kpiLoading.openCases}
              error={kpiErrors.openCases}
              onRetry={loadOpenCases}
              onClick={() => handleKPIClick('cases')}
              icon={FolderOpen}
              gradient="bg-gradient-to-r from-teal-500 to-teal-600"
            />

            {/* Active Projects KPI */}
            <KPICard
              title="Active Projects"
              value={kpiData.activeProjects}
              loading={kpiLoading.activeProjects}
              error={kpiErrors.activeProjects}
              onRetry={loadActiveProjects}
              onClick={() => handleKPIClick('projects')}
              icon={Briefcase}
              gradient="bg-gradient-to-r from-green-500 to-green-600"
            />

            {/* Roles at Risk KPI */}
            <KPICard
              title="Roles at Risk"
              value={kpiData.rolesAtRisk}
              loading={kpiLoading.rolesAtRisk}
              error={kpiErrors.rolesAtRisk}
              onRetry={loadRolesAtRisk}
              onClick={() => handleKPIClick('roles')}
              icon={AlertTriangle}
              gradient="bg-gradient-to-r from-orange-500 to-orange-600"
            />
          </div>

          {/* Right: Quick Notes */}
          <div className="xl:col-span-3">
            <QuickNotesCard isDarkTheme={isDarkTheme} user={user} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

