import React, { useEffect, useState } from 'react';
import { ZapIcon, DatabaseIcon, FilterIcon, BrainIcon, BarChart4Icon, RefreshCwIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PlusIcon, MinusIcon, SettingsIcon, MaximizeIcon, MinimizeIcon, PlusCircleIcon, DownloadIcon, Share2Icon, PlayIcon, PauseIcon, InfoIcon, HelpCircleIcon, FileTextIcon } from 'lucide-react';
export const AIWorkflowPanel = () => {
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState({
    dataIngestion: 'idle',
    preprocessing: 'idle',
    featureExtraction: 'idle',
    modelTraining: 'idle',
    evaluation: 'idle',
    deployment: 'idle'
  });
  const [workflowStats, setWorkflowStats] = useState({
    dataPoints: 0,
    processedRecords: 0,
    extractedFeatures: 0,
    modelAccuracy: 0,
    inferenceTime: 0,
    deploymentStatus: 'Not Started'
  });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showDetails, setShowDetails] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [logs, setLogs] = useState([]);
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
      const timer1 = setTimeout(() => {
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
                }, 3000);
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
  const addLog = message => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, {
      id: prevLogs.length,
      time: timestamp,
      message
    }]);
  };
  const toggleWorkflow = () => {
    if (workflowRunning) {
      // Stop workflow
      setWorkflowRunning(false);
      addLog('Workflow execution paused by user');
    } else {
      // Start workflow
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
  const getStatusIcon = status => {
    switch (status) {
      case 'idle':
        return <ClockIcon size={16} className="text-gray-400" />;
      case 'running':
        return <RefreshCwIcon size={16} className="text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon size={16} className="text-green-500" />;
      case 'error':
        return <XCircleIcon size={16} className="text-red-500" />;
      default:
        return null;
    }
  };
  const getNodeClass = status => {
    switch (status) {
      case 'idle':
        return 'border-gray-300 bg-white';
      case 'running':
        return 'border-blue-400 bg-blue-50 shadow-md animate-pulse';
      case 'completed':
        return 'border-green-400 bg-green-50 shadow-md';
      case 'error':
        return 'border-red-400 bg-red-50 shadow-md';
      default:
        return 'border-gray-300 bg-white';
    }
  };
  const handleNodeClick = node => {
    setSelectedNode(selectedNode === node ? null : node);
  };
  return <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">AI Workflow Visualization</h1>
          {workflowRunning && <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
              <RefreshCwIcon size={12} className="mr-1 animate-spin" />
              Workflow Running
            </span>}
        </div>
        <div className="flex space-x-2">
          <button onClick={toggleWorkflow} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${workflowRunning ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
            {workflowRunning ? <>
                <PauseIcon size={14} className="mr-1" /> Pause
              </> : <>
                <PlayIcon size={14} className="mr-1" /> Run Workflow
              </>}
          </button>
          <button onClick={resetWorkflow} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium flex items-center" disabled={workflowRunning}>
            <RefreshCwIcon size={14} className="mr-1" /> Reset
          </button>
          <div className="flex items-center bg-gray-100 rounded-md">
            <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="px-2 py-1 text-gray-700" disabled={zoomLevel <= 50}>
              <MinusIcon size={14} />
            </button>
            <span className="text-xs font-medium text-gray-700">
              {zoomLevel}%
            </span>
            <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="px-2 py-1 text-gray-700" disabled={zoomLevel >= 150}>
              <PlusIcon size={14} />
            </button>
          </div>
          <button onClick={() => setShowDetails(!showDetails)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            {showDetails ? <MinimizeIcon size={18} /> : <MaximizeIcon size={18} />}
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <DownloadIcon size={18} />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Share2Icon size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col lg:flex-row h-full gap-4">
          {/* Workflow Diagram */}
          <div className="lg:w-2/3 bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-auto" style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left'
        }}>
            <div className="min-w-[800px] min-h-[500px] relative">
              {/* Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{
              minWidth: '800px',
              minHeight: '500px'
            }}>
                {/* Data Ingestion to Preprocessing */}
                <path d="M180,100 C220,100 220,200 260,200" stroke={workflowProgress.preprocessing !== 'idle' ? '#3B82F6' : '#D1D5DB'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.preprocessing === 'running' ? '5,5' : 'none'} />
                {/* Preprocessing to Feature Extraction */}
                <path d="M380,200 C420,200 420,100 460,100" stroke={workflowProgress.featureExtraction !== 'idle' ? '#3B82F6' : '#D1D5DB'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.featureExtraction === 'running' ? '5,5' : 'none'} />
                {/* Feature Extraction to Model Training */}
                <path d="M580,100 C620,100 620,200 660,200" stroke={workflowProgress.modelTraining !== 'idle' ? '#3B82F6' : '#D1D5DB'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.modelTraining === 'running' ? '5,5' : 'none'} />
                {/* Model Training to Evaluation */}
                <path d="M380,300 C420,300 420,400 460,400" stroke={workflowProgress.evaluation !== 'idle' ? '#3B82F6' : '#D1D5DB'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.evaluation === 'running' ? '5,5' : 'none'} />
                {/* Evaluation to Deployment */}
                <path d="M580,400 C620,400 620,300 660,300" stroke={workflowProgress.deployment !== 'idle' ? '#3B82F6' : '#D1D5DB'} strokeWidth="2" fill="none" strokeDasharray={workflowProgress.deployment === 'running' ? '5,5' : 'none'} />
              </svg>
              {/* Nodes */}
              <div className="relative z-10">
                {/* Data Ingestion */}
                <div className={`absolute left-20 top-16 w-40 p-3 rounded-lg border-2 ${getNodeClass(workflowProgress.dataIngestion)} cursor-pointer transition-all`} onClick={() => handleNodeClick('dataIngestion')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DatabaseIcon size={18} className={workflowProgress.dataIngestion === 'idle' ? 'text-gray-500' : 'text-blue-600'} />
                      <span className="ml-2 font-medium text-sm">
                        Data Ingestion
                      </span>
                    </div>
                    {getStatusIcon(workflowProgress.dataIngestion)}
                  </div>
                  {selectedNode === 'dataIngestion' && showDetails && <div className="mt-2 text-xs text-gray-600 border-t pt-2">
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
                    </div>}
                </div>
                {/* Preprocessing */}
                <div className={`absolute left-[260px] top-[168px] w-40 p-3 rounded-lg border-2 ${getNodeClass(workflowProgress.preprocessing)} cursor-pointer transition-all`} onClick={() => handleNodeClick('preprocessing')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FilterIcon size={18} className={workflowProgress.preprocessing === 'idle' ? 'text-gray-500' : 'text-blue-600'} />
                      <span className="ml-2 font-medium text-sm">
                        Preprocessing
                      </span>
                    </div>
                    {getStatusIcon(workflowProgress.preprocessing)}
                  </div>
                  {selectedNode === 'preprocessing' && showDetails && <div className="mt-2 text-xs text-gray-600 border-t pt-2">
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
                    </div>}
                </div>
                {/* Feature Extraction */}
                <div className={`absolute left-[460px] top-16 w-40 p-3 rounded-lg border-2 ${getNodeClass(workflowProgress.featureExtraction)} cursor-pointer transition-all`} onClick={() => handleNodeClick('featureExtraction')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ZapIcon size={18} className={workflowProgress.featureExtraction === 'idle' ? 'text-gray-500' : 'text-blue-600'} />
                      <span className="ml-2 font-medium text-sm">
                        Feature Extract
                      </span>
                    </div>
                    {getStatusIcon(workflowProgress.featureExtraction)}
                  </div>
                  {selectedNode === 'featureExtraction' && showDetails && <div className="mt-2 text-xs text-gray-600 border-t pt-2">
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
                    </div>}
                </div>
                {/* Model Training */}
                <div className={`absolute left-[660px] top-[168px] w-40 p-3 rounded-lg border-2 ${getNodeClass(workflowProgress.modelTraining)} cursor-pointer transition-all`} onClick={() => handleNodeClick('modelTraining')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BrainIcon size={18} className={workflowProgress.modelTraining === 'idle' ? 'text-gray-500' : 'text-blue-600'} />
                      <span className="ml-2 font-medium text-sm">
                        Model Training
                      </span>
                    </div>
                    {getStatusIcon(workflowProgress.modelTraining)}
                  </div>
                  {selectedNode === 'modelTraining' && showDetails && <div className="mt-2 text-xs text-gray-600 border-t pt-2">
                      <div className="flex justify-between mb-1">
                        <span>Algorithm:</span>
                        <span className="font-medium">XGBoost</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CV Folds:</span>
                        <span className="font-medium">5</span>
                      </div>
                    </div>}
                </div>
                {/* Evaluation */}
                <div className={`absolute left-[460px] top-[368px] w-40 p-3 rounded-lg border-2 ${getNodeClass(workflowProgress.evaluation)} cursor-pointer transition-all`} onClick={() => handleNodeClick('evaluation')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart4Icon size={18} className={workflowProgress.evaluation === 'idle' ? 'text-gray-500' : 'text-blue-600'} />
                      <span className="ml-2 font-medium text-sm">
                        Evaluation
                      </span>
                    </div>
                    {getStatusIcon(workflowProgress.evaluation)}
                  </div>
                  {selectedNode === 'evaluation' && showDetails && <div className="mt-2 text-xs text-gray-600 border-t pt-2">
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
                    </div>}
                </div>
                {/* Deployment */}
                <div className={`absolute left-[660px] top-[268px] w-40 p-3 rounded-lg border-2 ${getNodeClass(workflowProgress.deployment)} cursor-pointer transition-all`} onClick={() => handleNodeClick('deployment')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <SettingsIcon size={18} className={workflowProgress.deployment === 'idle' ? 'text-gray-500' : 'text-blue-600'} />
                      <span className="ml-2 font-medium text-sm">
                        Deployment
                      </span>
                    </div>
                    {getStatusIcon(workflowProgress.deployment)}
                  </div>
                  {selectedNode === 'deployment' && showDetails && <div className="mt-2 text-xs text-gray-600 border-t pt-2">
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
                    </div>}
                </div>
              </div>
            </div>
          </div>
          {/* Workflow Details */}
          <div className="lg:w-1/3 flex flex-col gap-4">
            {/* Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <InfoIcon size={16} className="mr-1" /> Workflow Statistics
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="text-xs text-blue-600">Data Points</div>
                  <div className="text-lg font-bold text-blue-800">
                    {workflowStats.dataPoints.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="text-xs text-green-600">Features</div>
                  <div className="text-lg font-bold text-green-800">
                    {workflowStats.extractedFeatures}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-md">
                  <div className="text-xs text-purple-600">Model Accuracy</div>
                  <div className="text-lg font-bold text-purple-800">
                    {workflowStats.modelAccuracy}%
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-md">
                  <div className="text-xs text-amber-600">Inference Time</div>
                  <div className="text-lg font-bold text-amber-800">
                    {workflowStats.inferenceTime}ms
                  </div>
                </div>
              </div>
            </div>
            {/* Execution Logs */}
            <div className="bg-white rounded-lg border border-gray-200 flex-1 flex flex-col">
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-sm font-medium text-gray-700 flex items-center">
                  <FileTextIcon size={16} className="mr-1" /> Execution Logs
                </h2>
                <button className="text-xs text-blue-600 hover:underline" onClick={() => setLogs([])}>
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
                {logs.length === 0 ? <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No logs available. Run the workflow to generate logs.
                  </div> : <div className="space-y-1">
                    {logs.map(log => <div key={log.id} className="text-xs p-1 border-b border-gray-100 flex">
                        <span className="text-gray-500 mr-2">[{log.time}]</span>
                        <span className="text-gray-800">{log.message}</span>
                      </div>)}
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center">
          <HelpCircleIcon size={14} className="mr-1" />
          <span>
            Click on any node in the workflow to view detailed information.
            Press the "Run Workflow" button to execute the entire pipeline.
          </span>
        </div>
      </div>
    </div>;
};