import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZapIcon, DatabaseIcon, FilterIcon, BrainIcon, BarChart4Icon, RefreshCwIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PlusIcon, MinusIcon, SettingsIcon, MaximizeIcon, MinimizeIcon, DownloadIcon, Share2Icon, PlayIcon, PauseIcon, InfoIcon, HelpCircleIcon, FileTextIcon } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

type WorkflowStatus = 'idle' | 'running' | 'completed' | 'error';
interface WorkflowProgress {
  dataIngestion: WorkflowStatus;
  preprocessing: WorkflowStatus;
  featureExtraction: WorkflowStatus;
  modelTraining: WorkflowStatus;
  evaluation: WorkflowStatus;
  deployment: WorkflowStatus;
}
{}
interface WorkflowStats {
  dataPoints: number;
  processedRecords: number;
  extractedFeatures: number;
  modelAccuracy: number;
  inferenceTime: number;
  deploymentStatus: string;
}
{}
interface Log {
  id: number;
  time: string;
  message: string;
}
{}
export function AIWorkflowPanel() {
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress>({
    dataIngestion: 'idle',
    preprocessing: 'idle',
    featureExtraction: 'idle',
    modelTraining: 'idle',
    evaluation: 'idle',
    deployment: 'idle'
  });
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats>({
    dataPoints: 0,
    processedRecords: 0,
    extractedFeatures: 0,
    modelAccuracy: 0,
    inferenceTime: 0,
    deploymentStatus: 'Not Started'
  });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showDetails, setShowDetails] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  // Simulating a workflow run
  useEffect(() => {
    if (workflowRunning) {
      // Clear previous stats
      setWorkflowStats({
        dataPoints: 0,
        processedRecords: 0,
        extractedFeatures: 0,
        modelAccuracy: 0,
        inferenceTime: 0,
        deploymentStatus: 'In Progress'
      });
      setLogs([]);
      // Data Ingestion phase
      setWorkflowProgress(prev => ({
        ...prev,
        dataIngestion: 'running'
      }));
      addLog('Starting data ingestion process...');
      const timer1 = simulateApiDelay(3000).then(() => {
        setWorkflowProgress(prev => ({
          ...prev,
          dataIngestion: 'completed'
        }));
        setWorkflowStats(prev => ({
          ...prev,
          dataPoints: 24386
        }));
        addLog('Data ingestion completed: 24,386 records loaded');
        // Preprocessing phase
        setWorkflowProgress(prev => ({
          ...prev,
          preprocessing: 'running'
        }));
        addLog('Beginning data preprocessing and cleaning...');
        const timer2 = setTimeout(() => {
          setWorkflowProgress(prev => ({
            ...prev,
            preprocessing: 'completed'
          }));
          setWorkflowStats(prev => ({
            ...prev,
            processedRecords: 23105
          }));
          addLog('Preprocessing completed: 23,105 valid records (94.7% retention)');
          // Feature Extraction phase
          setWorkflowProgress(prev => ({
            ...prev,
            featureExtraction: 'running'
          }));
          addLog('Extracting features from preprocessed data...');
          const timer3 = setTimeout(() => {
            setWorkflowProgress(prev => ({
              ...prev,
              featureExtraction: 'completed'
            }));
            setWorkflowStats(prev => ({
              ...prev,
              extractedFeatures: 128
            }));
            addLog('Feature extraction completed: 128 features identified');
            // Model Training phase
            setWorkflowProgress(prev => ({
              ...prev,
              modelTraining: 'running'
            }));
            addLog('Initiating model training with cross-validation...');
            const timer4 = setTimeout(() => {
              setWorkflowProgress(prev => ({
                ...prev,
                modelTraining: 'completed'
              }));
              addLog('Model training completed: XGBoost ensemble selected as best performer');
              // Evaluation phase
              setWorkflowProgress(prev => ({
                ...prev,
                evaluation: 'running'
              }));
              addLog('Evaluating model performance on hold-out test set...');
              const timer5 = setTimeout(() => {
                setWorkflowProgress(prev => ({
                  ...prev,
                  evaluation: 'completed'
                }));
                setWorkflowStats(prev => ({
                  ...prev,
                  modelAccuracy: 92.7,
                  inferenceTime: 18
                }));
                addLog('Model evaluation completed: 92.7% accuracy, 18ms average inference time');
                // Deployment phase
                setWorkflowProgress(prev => ({
                  ...prev,
                  deployment: 'running'
                }));
                addLog('Preparing model for deployment...');
                const timer6 = setTimeout(() => {
                  setWorkflowProgress(prev => ({
                    ...prev,
                    deployment: 'completed'
                  }));
                  setWorkflowStats(prev => ({
                    ...prev,
                    deploymentStatus: 'Deployed'
                  }));
                  addLog('Model successfully deployed to production environment');
                  addLog('Workflow completed successfully');
                  setWorkflowRunning(false);
                });
                return () => clearTimeout(timer6);
              }, 4000);
              return () => clearTimeout(timer5);
            }, 6000);
            return () => clearTimeout(timer4);
          }, 3000);
          return () => clearTimeout(timer3);
        }, 4000);
        return () => clearTimeout(timer2);
      }, 3000);
      return () => clearTimeout(timer1);
    }
  }, [workflowRunning]);
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, {
      id: prevLogs.length,
      time: timestamp,
      message
    }]);
  };
  const toggleWorkflow = () => {
    if (workflowRunning) {
      setWorkflowRunning(false);
      addLog('Workflow execution paused by user');
    } else {
      resetWorkflow();
      setWorkflowRunning(true);
      addLog('Initiating AI workflow execution');
    }
  };
  const resetWorkflow = () => {
    setWorkflowProgress({
      dataIngestion: 'idle',
      preprocessing: 'idle',
      featureExtraction: 'idle',
      modelTraining: 'idle',
      evaluation: 'idle',
      deployment: 'idle'
    });
    setWorkflowStats({
      dataPoints: 0,
      processedRecords: 0,
      extractedFeatures: 0,
      modelAccuracy: 0,
      inferenceTime: 0,
      deploymentStatus: 'Not Started'
    });
    setLogs([]);
    addLog('Workflow reset and ready to execute');
  };
  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'idle':
        return <ClockIcon size={16} className="text-slate-400" />;
      case 'running':
        return <RefreshCwIcon size={16} className="text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon size={16} className="text-emerald-500" />;
      case 'error':
        return <XCircleIcon size={16} className="text-red-500" />;
      default:
        return null;
    }
  };
  const getNodeClass = (status: WorkflowStatus) => {
    switch (status) {
      case 'idle':
        return 'border-slate-300 bg-white';
      case 'running':
        return 'border-blue-400 bg-blue-50 shadow-md';
      case 'completed':
        return 'border-emerald-400 bg-emerald-50 shadow-md';
      case 'error':
        return 'border-red-400 bg-red-50 shadow-md';
      default:
        return 'border-slate-300 bg-white';
    }
  };
  const handleNodeClick = (node: string) => {
    setSelectedNode(selectedNode === node ? null : node);
  };
  return <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">
            AI Workflow Visualization
          </h1>

          <AnimatePresence>
            {workflowRunning && <motion.span initial={{
            scale: 0,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} exit={{
            scale: 0,
            opacity: 0
          }} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center shadow-sm">
                <RefreshCwIcon size={12} className="mr-1.5 animate-spin" />
                Workflow Running
              </motion.span>}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={toggleWorkflow} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${workflowRunning ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}>
          {workflowRunning ? <>
              <PauseIcon size={16} /> Pause
            </> : <>
              <PlayIcon size={16} /> Run Workflow
            </>}
        </motion.button>

        <motion.button whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={resetWorkflow} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50" disabled={workflowRunning}>
          <RefreshCwIcon size={16} /> Reset
        </motion.button>

        <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden">
          <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="px-3 py-2 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50" disabled={zoomLevel <= 50}>
            <MinusIcon size={16} />
          </button>
          <span className="px-3 text-sm font-medium text-slate-700 min-w-[60px] text-center">
            {zoomLevel}%
          </span>
          <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="px-3 py-2 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50" disabled={zoomLevel >= 150}>
            <PlusIcon size={16} />
          </button>
        </div>

        <button onClick={() => setShowDetails(!showDetails)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          {showDetails ? <MinimizeIcon size={18} /> : <MaximizeIcon size={18} />}
        </button>

        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <DownloadIcon size={18} />
        </button>

        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Share2Icon size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col lg:flex-row h-full gap-6">
          {/* Workflow Diagram */}
          <div className="lg:w-2/3 bg-slate-50 rounded-xl border border-slate-200 p-6 overflow-auto">
            <div className="min-w-[800px] min-h-[500px] relative" style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left'
          }}>
              {/* Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{
              minWidth: '800px',
              minHeight: '500px'
            }}>
                {/* Data Ingestion to Preprocessing */}
                <motion.path d="M180,100 C220,100 220,200 260,200" stroke={workflowProgress.preprocessing !== 'idle' ? 'var(--nexus-3b82f6)' : 'var(--nexus-cbd5e1)'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.preprocessing === 'running' ? '5,5' : 'none'} initial={{
                pathLength: 0
              }} animate={{
                pathLength: workflowProgress.preprocessing !== 'idle' ? 1 : 0
              }} transition={{
                duration: 0.5
              }} />

                {/* Preprocessing to Feature Extraction */}
                <motion.path d="M380,200 C420,200 420,100 460,100" stroke={workflowProgress.featureExtraction !== 'idle' ? 'var(--nexus-3b82f6)' : 'var(--nexus-cbd5e1)'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.featureExtraction === 'running' ? '5,5' : 'none'} initial={{
                pathLength: 0
              }} animate={{
                pathLength: workflowProgress.featureExtraction !== 'idle' ? 1 : 0
              }} transition={{
                duration: 0.5
              }} />

                {/* Feature Extraction to Model Training */}
                <motion.path d="M580,100 C620,100 620,200 660,200" stroke={workflowProgress.modelTraining !== 'idle' ? 'var(--nexus-3b82f6)' : 'var(--nexus-cbd5e1)'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.modelTraining === 'running' ? '5,5' : 'none'} initial={{
                pathLength: 0
              }} animate={{
                pathLength: workflowProgress.modelTraining !== 'idle' ? 1 : 0
              }} transition={{
                duration: 0.5
              }} />

                {/* Model Training to Evaluation */}
                <motion.path d="M380,300 C420,300 420,400 460,400" stroke={workflowProgress.evaluation !== 'idle' ? 'var(--nexus-3b82f6)' : 'var(--nexus-cbd5e1)'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.evaluation === 'running' ? '5,5' : 'none'} initial={{
                pathLength: 0
              }} animate={{
                pathLength: workflowProgress.evaluation !== 'idle' ? 1 : 0
              }} transition={{
                duration: 0.5
              }} />

                {/* Evaluation to Deployment */}
                <motion.path d="M580,400 C620,400 620,300 660,300" stroke={workflowProgress.deployment !== 'idle' ? 'var(--nexus-3b82f6)' : 'var(--nexus-cbd5e1)'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.deployment === 'running' ? '5,5' : 'none'} initial={{
                pathLength: 0
              }} animate={{
                pathLength: workflowProgress.deployment !== 'idle' ? 1 : 0
              }} transition={{
                duration: 0.5
              }} />
              </svg>

              {/* Workflow Nodes */}
              <div className="relative z-10">
                {/* Data Ingestion */}
                <WorkflowNode position={{
                left: 20,
                top: 16
              }} icon={DatabaseIcon} label="Data Ingestion" status={workflowProgress.dataIngestion} isSelected={selectedNode === 'dataIngestion'} onClick={() => handleNodeClick('dataIngestion')} showDetails={showDetails} details={<>
                      <div className="flex justify-between mb-1">
                        <span>Data Points:</span>
                        <span className="font-medium">
                          {workflowStats.dataPoints.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Source:</span>
                        <span className="font-medium">MySQL, S3</span>
                      </div>
                    </>} />

                {/* Preprocessing */}
                <WorkflowNode position={{
                left: 260,
                top: 168
              }} icon={FilterIcon} label="Preprocessing" status={workflowProgress.preprocessing} isSelected={selectedNode === 'preprocessing'} onClick={() => handleNodeClick('preprocessing')} showDetails={showDetails} details={<>
                      <div className="flex justify-between mb-1">
                        <span>Processed:</span>
                        <span className="font-medium">
                          {workflowStats.processedRecords.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retention:</span>
                        <span className="font-medium">
                          {workflowStats.dataPoints ? Math.round(workflowStats.processedRecords / workflowStats.dataPoints * 100) : 0}
                          %
                        </span>
                      </div>
                    </>} />

                {/* Feature Extraction */}
                <WorkflowNode position={{
                left: 460,
                top: 16
              }} icon={ZapIcon} label="Feature Extract" status={workflowProgress.featureExtraction} isSelected={selectedNode === 'featureExtraction'} onClick={() => handleNodeClick('featureExtraction')} showDetails={showDetails} details={<>
                      <div className="flex justify-between mb-1">
                        <span>Features:</span>
                        <span className="font-medium">
                          {workflowStats.extractedFeatures}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="font-medium">PCA, SHAP</span>
                      </div>
                    </>} />

                {/* Model Training */}
                <WorkflowNode position={{
                left: 660,
                top: 168
              }} icon={BrainIcon} label="Model Training" status={workflowProgress.modelTraining} isSelected={selectedNode === 'modelTraining'} onClick={() => handleNodeClick('modelTraining')} showDetails={showDetails} details={<>
                      <div className="flex justify-between mb-1">
                        <span>Algorithm:</span>
                        <span className="font-medium">XGBoost</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CV Folds:</span>
                        <span className="font-medium">5</span>
                      </div>
                    </>} />

                {/* Evaluation */}
                <WorkflowNode position={{
                left: 460,
                top: 368
              }} icon={BarChart4Icon} label="Evaluation" status={workflowProgress.evaluation} isSelected={selectedNode === 'evaluation'} onClick={() => handleNodeClick('evaluation')} showDetails={showDetails} details={<>
                      <div className="flex justify-between mb-1">
                        <span>Accuracy:</span>
                        <span className="font-medium">
                          {workflowStats.modelAccuracy}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inference:</span>
                        <span className="font-medium">
                          {workflowStats.inferenceTime}ms
                        </span>
                      </div>
                    </>} />

                {/* Deployment */}
                <WorkflowNode position={{
                left: 660,
                top: 268
              }} icon={SettingsIcon} label="Deployment" status={workflowProgress.deployment} isSelected={selectedNode === 'deployment'} onClick={() => handleNodeClick('deployment')} showDetails={showDetails} details={<>
                      <div className="flex justify-between mb-1">
                        <span>Status:</span>
                        <span className="font-medium">
                          {workflowStats.deploymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span className="font-medium">Kubernetes</span>
                      </div>
                    </>} />
              </div>
            </div>
          </div>

          {/* Workflow Details */}
          <div className="lg:w-1/3 flex flex-col gap-4">
            {/* Stats */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
                <InfoIcon size={16} className="mr-2" /> Workflow Statistics
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Data Points" value={workflowStats.dataPoints.toLocaleString()} color="blue" />
                <StatCard label="Features" value={workflowStats.extractedFeatures} color="emerald" />
                <StatCard label="Model Accuracy" value={`${workflowStats.modelAccuracy}%`} color="purple" />
                <StatCard label="Inference Time" value={`${workflowStats.inferenceTime}ms`} color="amber" />
              </div>
            </motion.div>

            {/* Execution Logs */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.1
          }} className="bg-white rounded-xl border border-slate-200 flex-1 flex flex-col shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center">
                  <FileTextIcon size={16} className="mr-2" /> Execution Logs
                </h2>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium" onClick={() => setLogs([])}>
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 bg-slate-50">
                {logs.length === 0 ? <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No logs available. Run the workflow to generate logs.
                  </div> : <div className="space-y-1">
                    {logs.map(log => <motion.div key={log.id} initial={{
                  opacity: 0,
                  x: -10
                }} animate={{
                  opacity: 1,
                  x: 0
                }} className="text-xs p-2 bg-white rounded border border-slate-100 flex gap-2">
                        <span className="text-slate-500 shrink-0">
                          [{log.time}]
                        </span>
                        <span className="text-slate-700">{log.message}</span>
                      </motion.div>)}
                  </div>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center text-xs text-slate-600">
          <HelpCircleIcon size={14} className="mr-2 text-slate-400" />
          <span>
            Click on any node in the workflow to view detailed information.
            Press the "Run Workflow" button to execute the entire pipeline.
          </span>
        </div>
      </div>
    </div>;
}
// Workflow Node Component
interface WorkflowNodeProps {
  position: {
    left: number;
    top: number;
  };
  icon: ElementType;
  label: string;
  status: WorkflowStatus;
  isSelected: boolean;
  onClick: () => void;
  showDetails: boolean;
  details: ReactNode;
}
function WorkflowNode({
  position,
  icon: Icon,
  label,
  status,
  isSelected,
  onClick,
  showDetails,
  details
}: WorkflowNodeProps) {
  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'idle':
        return <ClockIcon size={16} className="text-slate-400" />;
      case 'running':
        return <RefreshCwIcon size={16} className="text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon size={16} className="text-emerald-500" />;
      case 'error':
        return <XCircleIcon size={16} className="text-red-500" />;
    }
  };
  const getNodeClass = (status: WorkflowStatus) => {
    switch (status) {
      case 'idle':
        return 'border-slate-300 bg-white';
      case 'running':
        return 'border-blue-400 bg-blue-50 shadow-lg';
      case 'completed':
        return 'border-emerald-400 bg-emerald-50 shadow-lg';
      case 'error':
        return 'border-red-400 bg-red-50 shadow-lg';
    }
  };
  return <motion.div initial={{
    scale: 0,
    opacity: 0
  }} animate={{
    scale: 1,
    opacity: 1
  }} transition={{
    type: 'spring',
    stiffness: 200,
    damping: 20
  }} className={`absolute w-40 p-3 rounded-xl border-2 ${getNodeClass(status)} cursor-pointer transition-all hover:shadow-xl`} style={{
    left: position.left,
    top: position.top
  }} onClick={onClick} whileHover={{
    y: -2
  }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className={status === 'idle' ? 'text-slate-500' : 'text-blue-600'} />
          <span className="font-semibold text-sm text-slate-900">{label}</span>
        </div>
        {getStatusIcon(status)}
      </div>

      <AnimatePresence>
        {isSelected && showDetails && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} className="text-xs text-slate-600 border-t border-slate-200 pt-2 mt-2 overflow-hidden">
            {details}
          </motion.div>}
      </AnimatePresence>
    </motion.div>;
}
// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}
function StatCard({
  label,
  value,
  color
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return <motion.div whileHover={{
    scale: 1.02
  }} className={`p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-xs font-medium mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </motion.div>;
}