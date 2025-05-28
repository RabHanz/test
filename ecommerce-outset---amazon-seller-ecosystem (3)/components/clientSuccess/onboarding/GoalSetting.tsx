
import React, { useState } from 'react';
import useClientSuccessStore from '../../../store/clientSuccessStore';
import type { ClientGoal } from '../../../types';
import SectionWrapperClient from '../shared/SectionWrapperClient';
import Button from '../../Button';
import { TargetIcon, CheckCircleIcon, TrashIcon } from '../../icons';

interface GoalSettingProps {
    accentColorClass?: string;
}

const GoalSetting: React.FC<GoalSettingProps> = ({ accentColorClass = 'text-orange-400' }) => {
    const { goals, addGoal, updateGoal, toggleGoalAchieved } = useClientSuccessStore();
    const [newGoalText, setNewGoalText] = useState('');
    const [newGoalCategory, setNewGoalCategory] = useState<ClientGoal['category']>('financial');
    const [editingGoal, setEditingGoal] = useState<ClientGoal | null>(null);

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoalText.trim()) return;
        if (editingGoal) {
            updateGoal(editingGoal.id, { text: newGoalText, category: newGoalCategory });
            setEditingGoal(null);
        } else {
            addGoal({ text: newGoalText, category: newGoalCategory });
        }
        setNewGoalText('');
        setNewGoalCategory('financial');
    };

    const handleEditGoal = (goal: ClientGoal) => {
        setEditingGoal(goal);
        setNewGoalText(goal.text);
        setNewGoalCategory(goal.category);
    };
    
    const categoryColors: Record<ClientGoal['category'], string> = {
        financial: 'bg-green-500/20 text-green-300',
        operational: 'bg-blue-500/20 text-blue-300',
        learning: 'bg-purple-500/20 text-purple-300',
        personal_growth: 'bg-yellow-500/20 text-yellow-300',
    };

    return (
        <SectionWrapperClient 
            title="Your Program Goals" 
            icon={TargetIcon} 
            accentColorClass={accentColorClass}
            description="Define what success looks like for you. Clear goals will help us tailor your experience and track your progress effectively."
        >
            <form onSubmit={handleAddGoal} className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="goalText" className="block text-sm font-medium text-gray-300 mb-1">Goal Description</label>
                        <textarea
                            id="goalText"
                            value={newGoalText}
                            onChange={(e) => setNewGoalText(e.target.value)}
                            placeholder="e.g., Launch first product with $5k revenue in 90 days"
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label htmlFor="goalCategory" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <select
                            id="goalCategory"
                            value={newGoalCategory}
                            onChange={(e) => setNewGoalCategory(e.target.value as ClientGoal['category'])}
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        >
                            <option value="financial">Financial</option>
                            <option value="operational">Operational</option>
                            <option value="learning">Learning</option>
                            <option value="personal_growth">Personal Growth</option>
                        </select>
                    </div>
                </div>
                <Button type="submit" variant="primary" size="sm" className="mt-4">
                    {editingGoal ? 'Update Goal' : 'Add Goal'}
                </Button>
                {editingGoal && (
                    <Button variant="secondary" size="sm" onClick={() => { setEditingGoal(null); setNewGoalText(''); setNewGoalCategory('financial');}} className="mt-4 ml-2">
                        Cancel Edit
                    </Button>
                )}
            </form>

            {goals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No goals set yet. Add your first goal above!</p>
            ) : (
                <div className="space-y-3">
                    {goals.map(goal => (
                        <div key={goal.id} className={`p-3 rounded-md shadow ${goal.isAchieved ? 'bg-gray-700 opacity-70' : 'bg-gray-700'} flex items-start justify-between`}>
                            <div>
                                <p className={`font-medium ${goal.isAchieved ? 'line-through text-gray-500' : 'text-gray-100'}`}>{goal.text}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[goal.category]} mr-2`}>{goal.category.replace('_', ' ')}</span>
                                {goal.targetDate && <span className="text-xs text-gray-400">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                <button onClick={() => toggleGoalAchieved(goal.id)} title={goal.isAchieved ? "Mark as Incomplete" : "Mark as Achieved"} className={`p-1 rounded ${goal.isAchieved ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-green-400'}`}>
                                    <CheckCircleIcon className="w-5 h-5" />
                                </button>
                                {!goal.isAchieved && (
                                    <Button variant="link" onClick={() => handleEditGoal(goal)} className="p-1 text-xs !text-gray-400 hover:!text-yellow-400">Edit</Button>
                                )}
                                {/* <Button variant="link" onClick={() => { if(confirm("Are you sure?")) deleteGoal(goal.id);}} className="p-1 text-xs !text-gray-400 hover:!text-red-400"><TrashIcon className="w-4 h-4"/></Button> */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionWrapperClient>
    );
};

export default GoalSetting;
