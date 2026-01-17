// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useAppContext } from "../context/AppContext";

// const PolicyAcceptance = ({ employeeId }) => {
//   const [accepted, setAccepted] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [signature, setSignature] = useState("");
//   const [loading, setLoading] = useState(true);
//   const { API_URL } = useAppContext();

//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/employees/${employeeId}/policy-status`);
//         if (res.data?.accepted) {
//           setAccepted(true);
//           setSubmitted(true);
//         }
//       } catch (err) {
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStatus();
//   }, [API_URL, employeeId]);

//   const handleSubmit = async () => {
//     if (!signature.trim()) {
//       alert("Please enter your signature.");
//       return;
//     }
//     try {
//       await axios.post(`${API_URL}/api/employees/${employeeId}/accept-policy`, { signature });
//       setSubmitted(true);
//     } catch (error) {
//       alert("Submission failed.");
//     }
//   };

//   if (loading) return <div className="p-6 text-gray-500">Loading policy...</div>;

//   return (
//     <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4 text-center">Employee Policy Document</h2>

//       <div className="text-gray-700 dark:text-gray-200 space-y-4">
//         <p><strong>Company Name:</strong> Shine Infosolutions</p>
//         <p><strong>Applicable To:</strong> All Employees (Full-Time, Part-Time, Interns, Freelancers)</p>
//         <p><strong>Effective From:</strong> ___________________</p>

//         {[...Array(10).keys()].map((i) => {
//           const titles = [
//             "Employment Classification",
//             "Work Hours & Attendance",
//             "Leave Policy",
//             "Code of Conduct",
//             "Dress Code",
//             "Confidentiality & Data Security",
//             "Device & Asset Use",
//             "Termination & Resignation",
//             "Salary & Benefits",
//             "Policy Amendments",
//           ];
//           const contents = [
//             [
//               "Full-Time: Standard working hours with all company benefits.",
//               "Part-Time: Limited hours with defined scope of work.",
//               "Intern: Temporary training role for a fixed tenure.",
//               "Freelancer/Contractual: Project-based or task-specific engagement.",
//             ],
//             [
//               "Office hours: 10:00 AM – 6:00 PM, Monday to Saturday.",
//               "Employees are expected to be punctual.",
//               "Attendance will be recorded digitally or manually each day.",
//             ],
//             [
//               "Casual Leave: 12 days annually",
//               "Sick Leave: 6 days annually",
//               "Paid Leave: Based on tenure and designation.",
//               "Leaves must be applied in advance via the designated portal or HR.",
//               "Emergency or uninformed leave may lead to deductions or disciplinary action.",
//             ],
//             [
//               "Maintain professionalism, punctuality, and respect at the workplace.",
//               "Misconduct, harassment, or disrespectful behavior will not be tolerated.",
//               "Substance abuse or bringing contraband to the workplace is strictly prohibited.",
//             ],
//             [
//               "Smart casual or professional attire required during working hours.",
//               "Uniform (if provided) must be worn and maintained properly.",
//             ],
//             [
//               "Employees must not disclose any client, project, or company information.",
//               "Any data, report, or software provided remains company property.",
//             ],
//             [
//               "Company equipment (laptops, ID cards, documents) must be handled responsibly.",
//               "Loss or damage due to negligence may result in penalty or deduction.",
//             ],
//             [
//               "Either party can terminate employment with notice (as per offer letter, e.g., 30 days).",
//               "Misconduct, fraud, or non-performance can lead to immediate termination.",
//               "All company assets must be returned before full and final settlement.",
//             ],
//             [
//               "Salary will be credited by 7th of every month.",
//               "Deductions (PF, leaves, penalties) will be reflected in the payslip.",
//               "Benefits like bonuses, increments, or perks are performance-based.",
//             ],
//             [
//               "The company reserves the right to update or modify policies with prior notice.",
//               "Employees are expected to stay updated via internal communication.",
//             ],
//           ];
//           return (
//             <div key={i}>
//               <h4 className="font-semibold text-lg mt-4 mb-2">{i + 1}. {titles[i]}</h4>
//               <ul className="list-disc list-inside">
//                 {contents[i].map((line, idx) => (
//                   <li key={idx}>{line}</li>
//                 ))}
//               </ul>
//             </div>
//           );
//         })}

//         <hr className="my-6" />

//         <h4 className="text-lg font-semibold">Declaration:</h4>
//         <p>
//           I hereby confirm that I have read and understood the Employee Policy Document. I agree to
//           comply with the above policies during my employment.
//         </p>

//         {submitted ? (
//           <p className="mt-4 text-green-600 font-semibold">✔ You have accepted the policy.</p>
//         ) : (
//           <div className="mt-4 space-y-4">
//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={accepted}
//                 onChange={(e) => setAccepted(e.target.checked)}
//                 className="w-4 h-4"
//               />
//               <label>I Accept the Policy</label>
//             </div>
//             <input
//               type="text"
//               placeholder="Enter your name as signature"
//               value={signature}
//               onChange={(e) => setSignature(e.target.value)}
//               disabled={!accepted}
//               className="px-4 py-2 border rounded-md w-full md:w-1/2"
//             />
//             <button
//               onClick={handleSubmit}
//               disabled={!accepted || !signature.trim()}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
//             >
//               Submit Acceptance
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PolicyAcceptance;
