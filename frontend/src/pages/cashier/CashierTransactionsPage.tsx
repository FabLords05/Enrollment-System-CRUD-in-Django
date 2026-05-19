/**
 * CashierTransactionsPage.tsx  ─  REFACTORED FOR NEW PAYMENT LEDGER
 * 
 * Fetches from the official finance.Payment model and correlates with:
 * - Assessment records (for pricing)
 * - Student records (for names)
 */

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosSetup';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

interface Payment {
  id: number;
  assessment: number; // FK to Assessment model
  amount_paid: string; // Decimal as string from Django
  payment_date: string; // ISO 8601 timestamp
  receipt_number: string;
}

interface Assessment {
  id: number;
  enrollment_record: number;
  student_id: number; // FK to StudentProfile
  total_units: number;
  total_amount: string;
  balance_due: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CashierTransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all three data sources in parallel
      const [paymentsRes, assessmentsRes, studentsRes] = await Promise.all([
        api.get<Payment[]>('payments/'),
        api.get<Assessment[]>('assessments/'),
        api.get<Student[]>('students/'),
      ]);

      setPayments(paymentsRes.data);
      setAssessments(assessmentsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setLoading(false);
    }
  };


  // ─────────────────────────────────────────────────────────────────────────
  // FILTERING & CALCULATIONS
  // ─────────────────────────────────────────────────────────────────────────

  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  );

  // Filter by date
  const filtered = sortedPayments.filter(p => {
    if (!dateFilter) return true;
    const pDate = new Date(p.payment_date).toLocaleDateString();
    return pDate.includes(dateFilter);
  });

  // Calculate total amount paid
  const total = filtered.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  
  // Formatting utility
  const fmt = (n: number) => 
    '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400 font-medium animate-pulse">
        Loading Transaction Logs...
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-ustpDarkBlue">Transaction Log</h3>
          <p className="text-[12px] text-gray-400">
            All official receipts · {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by date (e.g. 5/19/2026)"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ustpBlue/30"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Records Shown
          </div>
          <div className="text-xl font-extrabold text-ustpDarkBlue">{filtered.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-4 text-center">
          <div className="text-[11px] text-green-500 font-semibold uppercase tracking-wider mb-1">
            Total Amount Paid
          </div>
          <div className="text-xl font-extrabold text-green-600">{fmt(total)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            Avg. Per Transaction
          </div>
          <div className="text-xl font-extrabold text-ustpDarkBlue">
            {filtered.length ? fmt(total / filtered.length) : '—'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3">Receipt No.</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3 text-right">Amount Paid</th>
                <th className="px-5 py-3">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(payment => {
                // Two-step lookup: Payment → Assessment → Student
                const assessment = assessments.find(a => a.id === payment.assessment);
                const student = students.find(s => s.id === assessment?.student_id);
                const studentName = student ? `${student.last_name}, ${student.first_name}` : 'Unknown Student';
                
                const dateObj = new Date(payment.payment_date);
                const amountNum = Number(payment.amount_paid);

                return (
                  <tr 
                    key={payment.id} 
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-[11px] text-ustpBlue font-semibold">
                      {payment.receipt_number}
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {studentName}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-600">
                      {fmt(amountNum)}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      <div>{dateObj.toLocaleDateString()}</div>
                      <div className="text-[11px] text-gray-400">{dateObj.toLocaleTimeString()}</div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-300 text-sm">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}