import React, { useState, useEffect } from 'react';
import { FolderOpen, Briefcase, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import QuoteBar from '../components/QuoteBar';
import QuickNotesCardEnhanced from './dashboard/QuickNotesCardEnhanced';
import MorningChecklistCard from './dashboard/MorningChecklistCard';
import TaskListFull from './dashboard/TaskListFull';
import { errorBus } from '../utils/errorBus';
import ErrorInline from '../components/ErrorInline';
import BackgroundDoodles from '../components/decors/BackgroundDoodles';

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
    if (user?.id) loadKPIs();
  }, [user?.id]);

  const loadKPIs = async () => {
    await Promise.all([loadOpenCases(), loadActiveProjects(), loadRolesAtRisk()]);
  };

  const loadOpenCases = async () => {
    try {
      setKpiLoading(p => ({ ...p, openCases: true }));
      setKpiErrors(p => ({ ...p, openCases: null }));
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'open');
      if (error) throw error;
      setKpiData(p => ({ ...p, openCases: count || 0 }));
    } catch (err) {
      setKpiErrors(p => ({ ...p, openCases: err.message }));
      errorBus.pushError({ source: 'Open Cases KPI', message: err.message });
    } finally {
      setKpiLoading(p => ({ ...p, openCases: false }));
    }
  };

  const loadActiveProjects = async () => {
    try {
      setKpiLoading(p => ({ ...p, activeProjects: true }));
      setKpiErrors(p => ({ ...p, activeProjects: null }));
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');
      if (error) throw error;
      setKpiData(p => ({ ...p, activeProjects: count || 0 }));
    } catch (err) {
      setKpiErrors(p => ({ ...p, activeProjects: err.message }));
      errorBus.pushError({ source: 'Active Projects KPI', message: err.message });
    } finally {
      setKpiLoading(p => ({ ...p, activeProjects: false }));
    }
  };

  const loadRolesAtRisk = async () => {
    try {
      setKpiLoading(p => ({ ...p, rolesAtRisk: true }));
      setKpiErrors(p => ({ ...p, rolesAtRisk: null }));
      const { count, error } = await supabase
        .from('roles_at_risk')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'monitoring');
      if (error) throw error;
      setKpiData(p => ({ ...p, rolesAtRisk: count || 0 }));
    } catch (err) {
      setKpiErrors(p => ({ ...p, rolesAtRisk: err.message }));
      errorBus.pushError({ source: 'Roles at Risk KPI', message: err.message });
    } finally {
      setKpiLoading(p => ({ ...p, rolesAtRisk: false }));
    }
  };

  const handleKPIClick = (type) => {
    if (type === 'cases') setActiveTab('cases');
    if (type === 'projects') setActiveTab('projects');
    if (type === 'roles') setActiveTab('roles-at-risk');
  };

  
  
  const KPICard = ({ title, value, loading, error, onRetry, onClick, icon: Icon, variant = 'info' }) => {
    // Specific colors for each card type
    let headerStyle = {};
    let headerClass = '';
    
    if (title === 'Open Cases') {
      headerStyle = { backgroundColor: '#dcd6f7' }; // soft lilac
    } else if (title === 'Active Projects') {
      headerStyle = { backgroundColor: '#a8d5d5' }; // minty green
    } else if (title === 'Roles at Risk') {
      headerStyle = { backgroundColor: '#f7e1d6' }; // pale peach
    } else {
      // Fallback to original variant system for any other cards
      headerClass =
        variant === 'success' ? 'bg-success-soft' :
        variant === 'warning' ? 'bg-warning-soft' :
        'bg-info-soft';
    }

    return (
      <article
        onClick={onClick}
        className="card cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-offset-2 active:scale-[0.98]"
        style={{ 
          backgroundColor: '#f3f4fd',  /* Your cards/tables color */
          border: '2px solid #c5cae9',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';  /* Your hover/expanded color */
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4fd';   /* Back to cards color */
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)';
        }}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
        role="button"
        aria-label={`${title}: ${loading ? 'loading' : error ? 'error' : value || 0}. Click to view details.`}
      >
        <div 
          className={`px-3 py-2 border-b border-subtle rounded-t-[1rem] ${headerClass}`}
          style={headerStyle}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-current/70"></span>
              <span className="title-xs !text-current">{title}</span>
            </span>
            <Icon className="w-4 h-4 opacity-80" aria-hidden />
          </div>
        </div>
        <div className="p-4 md:p-5 text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 md:h-12 w-20 bg-surface rounded mb-2 mx-auto" />
              <div className="h-3 bg-surface rounded w-2/3 mx-auto" />
            </div>
          ) : error ? (
            <div className="space-y-2">
              <div className="text-sm text-red-600">Error</div>
              {onRetry && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry();
                  }} 
                  className="text-xs underline text-accent hover:text-[#8a87d6] focus:ring-2 focus:ring-[#8a87d6] focus:ring-offset-2"
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-3xl md:text-4xl font-semibold leading-tight mb-2 text-gray-900">
                {value ?? 0}
              </p>
              <p className="text-xs text-muted">{value === 0 ? 'All clear' : 'Click to view'}</p>
            </>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-app relative" style={{ backgroundColor: '#e3e3f5' }}>
      <BackgroundDoodles />
      
      <div className="container mx-auto px-6 py-6 relative z-10">
        <section className="grid grid-cols-1 xl:grid-cols-6 gap-5">
          {/* LEFT column */}
          <div className="xl:col-span-3 space-y-6">
            {/* KPIs */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard
                title="Open Cases"
                value={kpiData.openCases}
                loading={kpiLoading.openCases}
                error={kpiErrors.openCases}
                onRetry={loadOpenCases}
                onClick={() => handleKPIClick('cases')}
                icon={FolderOpen}
                variant="info"
              />
              <KPICard
                title="Active Projects"
                value={kpiData.activeProjects}
                loading={kpiLoading.activeProjects}
                error={kpiErrors.activeProjects}
                onRetry={loadActiveProjects}
                onClick={() => handleKPIClick('projects')}
                icon={Briefcase}
                variant="success"
              />
              <KPICard
                title="Roles at Risk"
                value={kpiData.rolesAtRisk}
                loading={kpiLoading.rolesAtRisk}
                error={kpiErrors.rolesAtRisk}
                onRetry={loadRolesAtRisk}
                onClick={() => handleKPIClick('roles')}
                icon={AlertTriangle}
                variant="warning"
              />
            </div>

            <QuoteBar isDarkTheme={isDarkTheme} />
            <QuickNotesCardEnhanced isDarkTheme={isDarkTheme} user={user} />
          </div>

          {/* RIGHT column */}
          <div className="xl:col-span-3 space-y-6">
            <MorningChecklistCard isDarkTheme={isDarkTheme} user={user} />
            <TaskListFull isDarkTheme={isDarkTheme} user={user} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
