/**
 * CashierPaymentsPage.tsx  ─  LEDGER CONNECTED + DYNAMIC POS
 */

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosSetup';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_status: string;
  section: number | null;
  program_enrolled: string;
}

interface Assessment {
  id: number;
  student_id: number;
  total_amount: string; // Django decimals come back as strings
  balance_due: string;
}

export default function CashierPaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [search, setSearch] = useState('');
  
  // Form State
  const [selected, setSelected] = useState<Student | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both students and their official financial assessments
      const [studentsRes, assessmentsRes] = await Promise.all([
        api.get<Student[]>('students/'),
        api.get<Assessment[]>('assessments/')
      ]);
      setStudents(studentsRes.data);
      setAssessments(assessmentsRes.data);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to find the official ledger balance for a student
  const getStudentAssessment = (studentId: number) => {
    return assessments.find(a => a.student_id === studentId);
  };

  const handlePost = async () => {
    if (!selected) return;
    
    const assessment = getStudentAssessment(selected.id);
    if (!assessment) {
      alert("Error: No financial assessment record found for this student.");
      return;
    }

    const enteredAmount = Number(amount);
    const currentBalance = Number(assessment.balance_due);
    const remainingBalance = currentBalance - enteredAmount;

    if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    try {
      const receiptNumber = 'REC-' + Math.floor(100000 + Math.random() * 900000);
      console.log('Posting payment', {
        studentId: selected.id,
        assessmentId: assessment.id,
        enteredAmount,
        currentBalance,
        remainingBalance,
        receiptNumber
      });

      await api.post('payments/', {
        assessment: assessment.id,
        amount_paid: enteredAmount,
        receipt_number: receiptNumber,
        payment_method: method
      });

      let statusMessage = `✅ Payment of ₱${enteredAmount.toLocaleString()} posted!\nReceipt: ${receiptNumber}`;

      if (remainingBalance <= 0) {
        console.log('Balance cleared, updating enrollment status to ENROLLED');
        await api.patch(`students/${selected.id}/`, { enrollment_status: 'ENROLLED' });
        statusMessage += `\n\nFully Paid! Student is now ENROLLED.`;
      } else {
        console.log('Partial payment recorded, remaining balance remains positive');
        statusMessage += `\n\nPartial Payment Successful. Remaining Balance: ₱${remainingBalance.toLocaleString()}`;
      }

      if (remainingBalance < 0) {
        statusMessage += `\nChange Due: ₱${Math.abs(remainingBalance).toLocaleString()}`;
      }

      alert(statusMessage);
      setSelected(null);
      setAmount('');
      fetchData();
    } catch (error) {
      console.error('Failed to post payment', error);
      alert('Failed to process payment. Ensure the backend payments API is running.');
    }
  };

  const pendingPayments = students.filter(s => {
    const assessment = getStudentAssessment(s.id);
    return assessment ? Number(assessment.balance_due) > 0 : false;
  });

  const filtered = pendingPayments.filter(p =>
    `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => '₱' + n.toLocaleString();

  if (loading) return <div className="p-10 text-center text-gray-400 font-medium animate-pulse">Loading Official Ledgers...</div>;

  return (
    <div className="space-y-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-ustpDarkBlue">Pending Payments</h3>
          <p className="text-[12px] text-gray-400">{filtered.length} students awaiting payment</p>
        </div>
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-ustpBlue/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3 text-right">Ledger Balance</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const assessment = getStudentAssessment(p.id);
                  const balance = assessment ? Number(assessment.balance_due) : 0;
                  
                  return (
                    <tr key={p.id} className={`border-t border-gray-100 transition-colors ${selected?.id === p.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-5 py-3 text-gray-700 font-medium">{p.last_name}, {p.first_name}</td>
                      <td className="px-5 py-3 text-right font-bold text-red-500">
                        {assessment ? (
                          <div className="space-y-1">
                            <div>{fmt(balance)}</div>
                            <div className="text-[10px] uppercase tracking-wide font-semibold text-gray-500">
                              {Number(assessment.balance_due) < Number(assessment.total_amount)
                                ? 'Partial Balance'
                                : 'Full Tuition'}
                            </div>
                          </div>
                        ) : (
                          'No Assessment'
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          disabled={!assessment}
                          onClick={() => { setSelected(p); setAmount(String(balance)); }}
                          className={`text-[11px] px-3 py-1 rounded-lg transition-colors font-semibold ${
                              assessment ? 'bg-ustpDarkBlue text-white hover:bg-ustpBlue' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                    <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-gray-400">No pending assessments.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-fit">
          <h4 className="text-[13px] font-bold text-ustpDarkBlue mb-4">Post POS Payment</h4>
          {selected ? (
            <div className="space-y-4">
              <div>
                <div className="text-[11px] text-gray-400 font-semibold mb-1">Student</div>
                <div className="text-[13px] font-bold text-gray-800">
                  {selected.first_name} {selected.last_name}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Database Balance Due: <span className="text-red-500 font-bold">
                    {fmt(Number(getStudentAssessment(selected.id)?.balance_due || 0))}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Amount Received (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ustpBlue/30"
                />
                
                {/* 🟢 DYNAMIC POS DISPLAY LOGIC 🟢 */}
                {Number(amount) > 0 && getStudentAssessment(selected.id) && (
                  <div className="mt-2 text-[12px] font-bold">
                    {Number(amount) < Number(getStudentAssessment(selected.id)!.balance_due) && (
                      <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded inline-block">
                        Remaining Balance: {fmt(Number(getStudentAssessment(selected.id)!.balance_due) - Number(amount))}
                      </span>
                    )}
                    {Number(amount) > Number(getStudentAssessment(selected.id)!.balance_due) && (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                        Change Due: {fmt(Number(amount) - Number(getStudentAssessment(selected.id)!.balance_due))}
                      </span>
                    )}
                    {Number(amount) === Number(getStudentAssessment(selected.id)!.balance_due) && (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                        Fully Covered
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ustpBlue/30"
                >
                  <option>Cash</option>
                  <option>GCash</option>
                  <option>Bank Transfer</option>
                  <option>Check</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handlePost}
                  className="flex-1 bg-ustpDarkBlue text-white text-[12px] font-bold py-2 rounded-lg hover:bg-ustpBlue transition-colors"
                >
                  ✓ Confirm
                </button>
                <button
                  onClick={() => {
                    setSelected(null);
                    setAmount('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-600 text-[12px] font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-300 py-10 text-[13px]">
              Select a student from the list to post a payment to their DB ledger.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}