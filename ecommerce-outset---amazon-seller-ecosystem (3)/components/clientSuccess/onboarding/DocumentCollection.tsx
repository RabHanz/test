
import React from 'react';
import useClientSuccessStore from '../../../store/clientSuccessStore';
import SectionWrapperClient from '../shared/SectionWrapperClient';
import Button from '../../Button';
import { UploadIcon, CheckCircleIcon, AlertTriangleIcon, ClockIcon, InformationCircleIcon } from '../../icons';

interface DocumentCollectionProps {
    accentColorClass?: string;
}

const DocumentCollection: React.FC<DocumentCollectionProps> = ({ accentColorClass = 'text-orange-400' }) => {
    const { documents, updateDocumentStatus } = useClientSuccessStore();

    const handleFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            // Simulate upload process
            updateDocumentStatus(docId, 'submitted_for_review', `Uploaded: ${event.target.files[0].name}`);
            // In a real app, you'd upload to a server here.
            setTimeout(() => {
                // Simulate verification
                const isVerified = Math.random() > 0.3; // 70% chance of verification
                if(isVerified) {
                    updateDocumentStatus(docId, 'verified', 'Document verified by EO Team.');
                } else {
                    updateDocumentStatus(docId, 'rejected_needs_resubmission', 'Issue found: Please re-upload a clearer copy.');
                }
            }, 2000);
        }
    };
    
    const statusInfo: Record<string, { icon: React.FC<any>, color: string, text: string }> = {
        pending_submission: { icon: UploadIcon, color: 'text-gray-400', text: 'Pending Submission' },
        submitted_for_review: { icon: ClockIcon, color: 'text-yellow-400', text: 'Submitted for Review' },
        verified: { icon: CheckCircleIcon, color: 'text-green-400', text: 'Verified' },
        rejected_needs_resubmission: { icon: AlertTriangleIcon, color: 'text-red-400', text: 'Rejected - Resubmit' },
    };

    return (
        <SectionWrapperClient 
            title="Required Documents" 
            icon={UploadIcon} 
            accentColorClass={accentColorClass}
            description="Please upload the following documents to complete your profile and unlock all program features. All documents are stored securely."
        >
            {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No documents are currently required for your program.</p>
            ) : (
                <div className="space-y-4">
                    {documents.map(doc => {
                        const SIcon = statusInfo[doc.status].icon;
                        const sColor = statusInfo[doc.status].color;
                        return (
                            <div key={doc.id} className="p-4 bg-gray-700/50 rounded-lg shadow">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-100">{doc.name}</h4>
                                        <p className="text-xs text-gray-400 mb-1">Type: {doc.type}</p>
                                        <div className={`flex items-center text-xs font-medium ${sColor}`}>
                                            <SIcon className="w-4 h-4 mr-1.5" /> {statusInfo[doc.status].text}
                                        </div>
                                    </div>
                                    <div className="mt-3 sm:mt-0">
                                        {(doc.status === 'pending_submission' || doc.status === 'rejected_needs_resubmission') && (
                                            <label htmlFor={`file-upload-${doc.id}`} className={`btn-sm btn-secondary !bg-gray-600 hover:!bg-gray-500 cursor-pointer`}>
                                                <UploadIcon className="w-4 h-4 mr-1.5"/> Upload Document
                                                <input id={`file-upload-${doc.id}`} type="file" className="hidden" onChange={(e) => handleFileUpload(doc.id, e)} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                {doc.notes && (
                                    <div className={`mt-2 p-2 rounded text-xs flex items-start ${doc.status === 'rejected_needs_resubmission' ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/30 text-yellow-300'}`}>
                                        <InformationCircleIcon className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0"/>
                                        <span>{doc.notes}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            <style>{`
            .btn-sm {
                padding: 0.375rem 0.75rem; font-size: 0.875rem; border-radius: 0.375rem; font-weight: 500; display: inline-flex; align-items: center;
            }
            .btn-secondary {
                background-color: #4B5563; color: #F3F4F6;
            }
            .btn-secondary:hover {
                background-color: #6B7280;
            }
            `}</style>
        </SectionWrapperClient>
    );
};

export default DocumentCollection;
