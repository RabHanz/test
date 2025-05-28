
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useClientSuccessStore from '../../../store/clientSuccessStore';
import type { LaunchProgramClientData, ClientProgramMilestone, ClientProgramTask } from '../../../types';
import ChecklistItemClient, { ChecklistItemClientProps } from '../shared/ChecklistItemClient';
import Button from '../../Button';
import { ClipboardListIcon, TargetIcon, ShieldCheckIcon, BookOpenIcon, ChatAlt2Icon, CalendarIcon } from '../../icons';
import { LAUNCH_PROGRAM_MILESTONES, PERSONAS_DATA } from '../../../constants';

const LaunchProgramDashboard: React.FC = () => {
    const { currentProgramData, programMilestones, completeLaunchProgramTask } = useClientSuccessStore(state => ({
        currentProgramData: state.currentProgramData as LaunchProgramClientData | null,
        programMilestones: state.programMilestones,
        completeLaunchProgramTask: state.completeLaunchProgramTask,
    }));
    
    const [activeTab, setActiveTab] = useState<'roadmap' | 'tools' | 'resources' | 'coach'>('roadmap');

    const persona = PERSONAS_DATA.find(p => p.id === 'launch');
    const accentColor = persona?.accentColorClass.split('-')[1] + '-500' || 'green-500'; // e.g. green-500

    if (!currentProgramData || !programMilestones || programMilestones.length === 0) {
        return <div className="p-6 text-center text-gray-400">Loading Launch Program data...</div>;
    }

    const { completedTasks, activeMilestoneId } = currentProgramData;
    
    const activeMilestone = programMilestones.find(m => m.id === activeMilestoneId) || programMilestones.find(m => !m.isAchieved) || programMilestones[programMilestones.length -1];
    const activeMilestoneIndex = programMilestones.findIndex(m => m.id === activeMilestone?.id);
    
    const totalTasksInMilestone = activeMilestone?.tasks.reduce((acc, task) => acc + 1 + (task.subTasks?.length || 0), 0) || 0;
    const completedTasksInMilestone = activeMilestone?.tasks.reduce((acc, task) => {
        let count = 0;
        if (completedTasks.has(task.id)) count++;
        if (task.subTasks) {
            count += task.subTasks.filter(st => completedTasks.has(st.id)).length;
        }
        return acc + count;
    }, 0) || 0;
    const milestoneProgress = totalTasksInMilestone > 0 ? (completedTasksInMilestone / totalTasksInMilestone) * 100 : (activeMilestone?.isAchieved ? 100 : 0) ;


    const renderRoadmap = () => (
        <div className="space-y-6">
            {activeMilestone && (
                 <div className={`p-4 md:p-6 bg-gray-800 rounded-lg border-l-4 border-${accentColor}`}>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-100 mb-1">Current Focus: {activeMilestone.phase}</h3>
                    <p className={`text-md font-medium text-${accentColor.replace('500','300')} mb-3`}>{activeMilestone.title}</p>
                    
                    <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-300 mb-0.5">
                            <span>Milestone Progress</span>
                            <span>{completedTasksInMilestone} / {totalTasksInMilestone} Tasks</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                                className={`h-2 rounded-full bg-${accentColor.replace('500','400')}`}
                                initial={{ width: '0%'}}
                                animate={{ width: `${milestoneProgress}%`}}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                         {activeMilestone.isAchieved && <p className="text-xs text-green-400 mt-1">Milestone Achieved! Well done!</p>}
                    </div>

                    <h4 className="text-sm font-semibold text-gray-300 mt-4 mb-2">Tasks for this milestone:</h4>
                    <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
                        {activeMilestone.tasks.map(task => (
                            <ChecklistItemClient
                                key={task.id}
                                id={task.id}
                                title={task.title}
                                description={task.description}
                                isCompleted={completedTasks.has(task.id)}
                                onToggle={() => completeLaunchProgramTask(activeMilestone.id, task.id, undefined)}
                                subSteps={task.subTasks?.map(st => {
                                    // Minimal mapping for subSteps to satisfy ChecklistItemClientProps for the fix.
                                    // A more robust solution would be a recursive mapping function.
                                    const subStepProps: ChecklistItemClientProps = {
                                        id: st.id,
                                        title: st.title,
                                        description: st.description,
                                        isCompleted: completedTasks.has(st.id),
                                        onToggle: () => completeLaunchProgramTask(activeMilestone.id, task.id, st.id),
                                        // estimatedTime and relatedAction could be mapped if present in ClientProgramTask subTasks
                                        accentColorClass: accentColor,
                                        // depth could be passed if ChecklistItemClient uses it for rendering
                                    };
                                    return subStepProps;
                                })}
                                accentColorClass={accentColor}
                            />
                        ))}
                    </div>
                 </div>
            )}

            <details className="bg-gray-800 p-3 rounded-md">
                <summary className="text-sm font-medium text-gray-300 cursor-pointer hover:text-white">View All Milestones ({activeMilestoneIndex + 1} / {programMilestones.length})</summary>
                <div className="mt-3 space-y-2">
                    {programMilestones.map((milestone, index) => (
                        <div key={milestone.id} className={`p-2 rounded text-xs ${milestone.isAchieved ? 'bg-green-700/30 text-green-300' : (milestone.id === activeMilestone?.id ? `bg-${accentColor.replace('500','800')}/30 border border-${accentColor.replace('500','700')}` : 'bg-gray-700/50 text-gray-400')}`}>
                           {index + 1}. {milestone.title} {milestone.isAchieved ? '(Completed)' : (milestone.id === activeMilestone?.id ? '(Active)' : '')}
                        </div>
                    ))}
                </div>
            </details>
        </div>
    );

    const renderTools = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
                <TargetIcon className={`w-6 h-6 mb-2 text-${accentColor.replace('500','400')}`}/>
                <h4 className="font-semibold text-gray-100 mb-1">Product Selection Framework</h4>
                <p className="text-xs text-gray-400 mb-2">Complete this interactive guide to validate your product idea.</p>
                <Button size="sm" variant="secondary" onClick={() => alert("Open Product Selection Tool (placeholder)")}>Open Tool</Button>
                {/* Placeholder for progress */}
                <p className="text-xs text-gray-500 mt-2">Progress: {currentProgramData.productSelectionFrameworkAnswers ? 'Started' : 'Not Started'}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <ShieldCheckIcon className={`w-6 h-6 mb-2 text-${accentColor.replace('500','400')}`}/>
                <h4 className="font-semibold text-gray-100 mb-1">Risk Assessment Checklist</h4>
                <p className="text-xs text-gray-400 mb-2">Identify and mitigate potential risks for your launch.</p>
                <Button size="sm" variant="secondary" onClick={() => alert("Open Risk Assessment Tool (placeholder)")}>Open Checklist</Button>
                <p className="text-xs text-gray-500 mt-2">Progress: {currentProgramData.riskAssessmentChecklistAnswers ? 'Started' : 'Not Started'}</p>
            </div>
        </div>
    );
    
    const renderResources = () => (
        <div className="bg-gray-800 p-4 rounded-lg">
            <BookOpenIcon className={`w-6 h-6 mb-2 text-${accentColor.replace('500','400')}`}/>
            <h4 className="font-semibold text-gray-100 mb-2">Resource Library</h4>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li><a href="#" className={`hover:underline text-${accentColor.replace('500','300')}`}>Product Research Guide (PDF)</a></li>
                <li><a href="#" className={`hover:underline text-${accentColor.replace('500','300')}`}>Supplier Vetting Checklist (PDF)</a></li>
                <li><a href="#" className={`hover:underline text-${accentColor.replace('500','300')}`}>Listing Optimization Template</a></li>
                <li><a href="#" className={`hover:underline text-${accentColor.replace('500','300')}`}>PPC Launch Strategy Video</a></li>
            </ul>
        </div>
    );

    const renderCoachConnect = () => (
         <div className="bg-gray-800 p-4 rounded-lg text-center">
            <ChatAlt2Icon className={`w-8 h-8 mb-2 mx-auto text-${accentColor.replace('500','400')}`}/>
            <h4 className="font-semibold text-gray-100 mb-2">Your Launch Coach</h4>
            <p className="text-sm text-gray-300 mb-3">Need help or have questions? Your dedicated Launch Coach is here to support you.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button size="sm" variant="primary" className={`!bg-${accentColor} hover:!bg-${accentColor.replace('500','600')}`} onClick={() => alert("Open Messaging (placeholder)")}>
                    <ChatAlt2Icon className="w-4 h-4 mr-1.5"/> Send Message
                </Button>
                <Button size="sm" variant="secondary" onClick={() => alert("Open Calendar (placeholder)")}>
                     <CalendarIcon className="w-4 h-4 mr-1.5"/> Book a Call
                </Button>
            </div>
        </div>
    );


    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex space-x-1 border-b border-gray-700 mb-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'roadmap', label: 'Roadmap', Icon: ClipboardListIcon },
                    { id: 'tools', label: 'Frameworks & Tools', Icon: TargetIcon },
                    { id: 'resources', label: 'Resources', Icon: BookOpenIcon },
                    { id: 'coach', label: 'Coach Connect', Icon: ChatAlt2Icon },
                ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center whitespace-nowrap py-2 px-3 md:px-4 font-medium text-xs md:text-sm transition-colors duration-200 ease-in-out focus:outline-none
                        ${activeTab === tab.id
                            ? `border-b-2 border-${accentColor} text-${accentColor.replace('500','300')}`
                            : `text-gray-400 hover:text-gray-100 border-b-2 border-transparent hover:border-gray-600`
                        }`}
                    >
                        <tab.Icon className={`w-4 h-4 mr-1.5 flex-shrink-0 ${activeTab === tab.id ? `text-${accentColor.replace('500','400')}` : 'text-gray-500'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'roadmap' && renderRoadmap()}
            {activeTab === 'tools' && renderTools()}
            {activeTab === 'resources' && renderResources()}
            {activeTab === 'coach' && renderCoachConnect()}
            
        </div>
    );
};

export default LaunchProgramDashboard;
