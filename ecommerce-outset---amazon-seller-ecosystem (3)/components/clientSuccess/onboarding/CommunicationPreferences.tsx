
import React, { useState, useEffect } from 'react';
import useClientSuccessStore from '../../../store/clientSuccessStore';
import type { ClientCommunicationPreference } from '../../../types';
import SectionWrapperClient from '../shared/SectionWrapperClient';
import Button from '../../Button';
import { MailIcon } from '../../icons';

interface CommunicationPreferencesProps {
    accentColorClass?: string;
}

const CommunicationPreferences: React.FC<CommunicationPreferencesProps> = ({ accentColorClass = 'text-orange-400' }) => {
    const { communicationPreferences, saveCommunicationPreferences } = useClientSuccessStore();
    
    const initialPrefs: ClientCommunicationPreference = {
        primaryContactMethod: 'email',
        meetingFrequency: 'weekly',
        notificationPreferences: {
            newTasks: true,
            milestoneUpdates: true,
            documentStatus: true,
            communityMentions: false,
        }
    };

    const [prefs, setPrefs] = useState<ClientCommunicationPreference>(communicationPreferences || initialPrefs);

    useEffect(() => {
        if (communicationPreferences) {
            setPrefs(communicationPreferences);
        }
    }, [communicationPreferences]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setPrefs(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    [name]: checked,
                }
            }));
        } else {
            setPrefs(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveCommunicationPreferences(prefs);
        alert("Communication preferences saved!"); // Simple feedback
    };

    return (
        <SectionWrapperClient 
            title="Communication Preferences" 
            icon={MailIcon} 
            accentColorClass={accentColorClass}
            description="Help us communicate with you effectively. Set your preferences for updates, meetings, and notifications."
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="primaryContactMethod" className="block text-sm font-medium text-gray-300 mb-1">Primary Contact Method</label>
                        <select name="primaryContactMethod" value={prefs.primaryContactMethod} onChange={handleChange} className="input-form-style">
                            <option value="email">Email</option>
                            <option value="platform_message">Platform Message</option>
                            <option value="video_call">Video Call (for scheduled meetings)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="meetingFrequency" className="block text-sm font-medium text-gray-300 mb-1">Preferred Meeting Frequency (with Coach)</label>
                        <select name="meetingFrequency" value={prefs.meetingFrequency} onChange={handleChange} className="input-form-style">
                            <option value="weekly">Weekly</option>
                            <option value="bi-weekly">Bi-Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="as_needed">As Needed</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="preferredMeetingTimes" className="block text-sm font-medium text-gray-300 mb-1">Preferred Meeting Times (Optional)</label>
                    <input type="text" name="preferredMeetingTimes" value={prefs.preferredMeetingTimes || ''} onChange={handleChange} placeholder="e.g., Weekdays 10am-2pm ET" className="input-form-style"/>
                </div>

                <fieldset>
                    <legend className="text-sm font-medium text-gray-300 mb-2">Notification Preferences:</legend>
                    <div className="space-y-2">
                        {(Object.keys(prefs.notificationPreferences) as Array<keyof ClientCommunicationPreference['notificationPreferences']>).map(key => (
                             <div key={key} className="flex items-center">
                                <input 
                                    id={`notif-${key}`} 
                                    name={key} 
                                    type="checkbox" 
                                    checked={prefs.notificationPreferences[key]} 
                                    onChange={handleChange} 
                                    className="h-4 w-4 text-orange-500 border-gray-600 rounded focus:ring-orange-400"
                                />
                                <label htmlFor={`notif-${key}`} className="ml-2 text-sm text-gray-300 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Updates
                                </label>
                            </div>
                        ))}
                    </div>
                </fieldset>
                
                <Button type="submit" variant="primary" size="md">Save Preferences</Button>
            </form>
             <style>{`
                .input-form-style {
                    width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; 
                    background-color: #111827; /* bg-gray-900 or similar dark */
                    border: 1px solid #4B5563; /* border-gray-600 */
                    color: #F3F4F6; /* text-gray-100 */
                    font-size: 0.875rem; /* text-sm */
                }
                .input-form-style:focus {
                    outline: 2px solid transparent; outline-offset: 2px;
                    border-color: #F97316; /* ring-orange-500 */
                    box-shadow: 0 0 0 2px #F9731630;
                }
            `}</style>
        </SectionWrapperClient>
    );
};

export default CommunicationPreferences;
