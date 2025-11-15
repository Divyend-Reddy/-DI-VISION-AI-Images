
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { User, PaymentRequest } from '../types';
import { UsersIcon, PaymentsIcon, CheckIcon, XIcon } from '../components/Icons';

type AdminTab = 'users' | 'payments';

const AdminPage: React.FC = () => {
    const { allUsers, paymentRequests, updateUserCredits, addCredits, updatePaymentRequestStatus } = useAppContext();
    const [activeTab, setActiveTab] = useState<AdminTab>('payments');

    const pendingPayments = paymentRequests.filter(p => p.status === 'pending');

    return (
        <div className="max-w-7xl mx-auto py-8 animate-slide-in-up">
            <h1 className="text-4xl font-extrabold mb-8">Admin Dashboard</h1>
            
            <div className="flex border-b border-light-border dark:border-dark-border mb-8">
                <AdminTabButton icon={<PaymentsIcon />} label="Payment Requests" count={pendingPayments.length} isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                <AdminTabButton icon={<UsersIcon />} label="User Management" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            </div>

            <div className="p-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-soft dark:shadow-soft-dark border border-light-border dark:border-dark-border backdrop-filter backdrop-blur">
                {activeTab === 'payments' && <PaymentRequestsTable requests={paymentRequests} onStatusChange={updatePaymentRequestStatus} addCredits={addCredits} />}
                {activeTab === 'users' && <UsersTable users={allUsers} onCreditsChange={updateUserCredits} />}
            </div>
        </div>
    );
};

interface AdminTabButtonProps {
    icon: React.ReactNode;
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
}
const AdminTabButton: React.FC<AdminTabButtonProps> = ({ icon, label, count, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3 font-semibold border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-800 dark:hover:text-gray-200'}`}>
        {icon}
        <span>{label}</span>
        {count !== undefined && count > 0 && (
            <span className="ml-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
        )}
    </button>
);

const PaymentRequestsTable: React.FC<{ requests: PaymentRequest[], onStatusChange: (id: number, status: 'approved' | 'rejected') => void, addCredits: (userId: number, amount: number) => void }> = ({ requests, onStatusChange, addCredits }) => {
    const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const handleApprove = (req: PaymentRequest) => {
        const planCredits = parseInt(req.plan.split(' ')[1]); // "30 Credits" -> 30
        addCredits(req.userId, planCredits);
        onStatusChange(req.id, 'approved');
    };
    
    return (
        <TableContainer>
            <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                    <Th>User</Th>
                    <Th>Plan</Th>
                    <Th>Amount</Th>
                    <Th>UTR Code</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                </tr>
            </thead>
            <tbody>
                {sortedRequests.map(req => (
                    <tr key={req.id} className="border-b border-light-border dark:border-dark-border">
                        <Td>{req.userEmail}</Td>
                        <Td>{req.plan}</Td>
                        <Td>₹{req.amount}</Td>
                        <Td>{req.utrCode}</Td>
                        <Td>{new Date(req.createdAt).toLocaleString()}</Td>
                        <Td><StatusBadge status={req.status} /></Td>
                        <Td>
                            {req.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleApprove(req)} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"><CheckIcon /></button>
                                    <button onClick={() => onStatusChange(req.id, 'rejected')} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><XIcon /></button>
                                </div>
                            )}
                        </Td>
                    </tr>
                ))}
            </tbody>
        </TableContainer>
    );
};


const UsersTable: React.FC<{ users: User[], onCreditsChange: (userId: number, newCredits: number) => void }> = ({ users, onCreditsChange }) => {
    const handleCreditChange = (userId: number) => {
        const newCreditsStr = prompt("Enter new credit amount:");
        if (newCreditsStr) {
            const newCredits = parseInt(newCreditsStr, 10);
            if (!isNaN(newCredits) && newCredits >= 0) {
                onCreditsChange(userId, newCredits);
            } else {
                alert("Invalid credit amount.");
            }
        }
    };
    
    return (
        <TableContainer>
            <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                    <Th>ID</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Credits</Th>
                    <Th>Joined At</Th>
                    <Th>Actions</Th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} className="border-b border-light-border dark:border-dark-border">
                        <Td>{user.id}</Td>
                        <Td>{user.name}</Td>
                        <Td>{user.email}</Td>
                        <Td>{user.credits}</Td>
                        <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                        <Td>
                            <button onClick={() => handleCreditChange(user.id)} className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-hover">Edit Credits</button>
                        </Td>
                    </tr>
                ))}
            </tbody>
        </TableContainer>
    );
};

// Reusable table components
const TableContainer: React.FC<{children: React.ReactNode}> = ({children}) => <div className="overflow-x-auto"><table className="w-full text-sm text-left">{children}</table></div>
const Th: React.FC<{children: React.ReactNode}> = ({children}) => <th scope="col" className="px-6 py-3 font-semibold">{children}</th>
const Td: React.FC<{children: React.ReactNode}> = ({children}) => <td className="px-6 py-4">{children}</td>
const StatusBadge: React.FC<{status: PaymentRequest['status']}> = ({status}) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
}

export default AdminPage;
