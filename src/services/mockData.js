// ==========================================================================
// Project Satya - Mock Data Repository
// Department of Social Justice and Empowerment (DoSJE) Schemes
// ==========================================================================

export const INITIAL_INSTITUTES = [
  {
    id: "INST-RAJ-104",
    name: "Adarsh Rehabilitation & Special Care Kendra",
    scheme: "DDRS (Deendayal Disabled Rehabilitation)",
    state: "Rajasthan",
    district: "Jaipur",
    lat: 26.9124,
    lng: 75.7873,
    address: "Plot 42, Sector 8, Mansarovar, Jaipur",
    inchargeName: "Rameshwar Sharma",
    inchargePhone: "+91 98290 41230",
    claimedBeneficiaries: 50,
    aiDetectedBeneficiaries: 11,
    cctvStatus: "ANOMALY", // ONLINE | OFFLINE | ANOMALY
    lastHeartbeat: "4 mins ago",
    cctvUptimePercent: 82.4,
    riskScore: 89.2, // 0 - 100
    riskLevel: "CRITICAL",
    riskFactors: [
      "Attendance Deficit: 78% (50 claimed vs 11 AI-counted)",
      "Frequent CCTV disconnects during peak feeding hours (12:00-14:00)",
      "Past non-compliance warning in Q1 audit"
    ],
    lastAuditDate: "2026-08-14",
    lastInspectedBy: "INS-04 (Sunil Verma)", // Important for anti-collusion
    allocatedFundsLakhs: 42.5,
    snapshotImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "INST-UP-302",
    name: "Nav-Prabhat Garima Greh & Shelter Home",
    scheme: "SMILE (Livelihood & Enterprise)",
    state: "Uttar Pradesh",
    district: "Lucknow",
    lat: 26.8467,
    lng: 80.9462,
    address: "Gomti Nagar Extension, Lucknow",
    inchargeName: "Pooja Trivedi",
    inchargePhone: "+91 94150 88219",
    claimedBeneficiaries: 35,
    aiDetectedBeneficiaries: 14,
    cctvStatus: "ANOMALY",
    lastHeartbeat: "12 mins ago",
    cctvUptimePercent: 68.0,
    riskScore: 84.5,
    riskLevel: "HIGH",
    riskFactors: [
      "Attendance Deficit: 60% (35 claimed vs 14 counted)",
      "CCTV signal intermittent over past 48 hours"
    ],
    lastAuditDate: "2026-07-28",
    lastInspectedBy: "INS-07 (Deepak Joshi)",
    allocatedFundsLakhs: 28.0,
    snapshotImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "INST-MP-210",
    name: "Vridha Seva Ashram & Geriatric Care Center",
    scheme: "Atal Vayo Abhyuday Yojana (Senior Citizens)",
    state: "Madhya Pradesh",
    district: "Bhopal",
    lat: 23.2599,
    lng: 77.4126,
    address: "Hoshangabad Road, MP Nagar, Bhopal",
    inchargeName: "Dr. Aniruddh Kulkarni",
    inchargePhone: "+91 98260 19342",
    claimedBeneficiaries: 40,
    aiDetectedBeneficiaries: 38,
    cctvStatus: "ONLINE",
    lastHeartbeat: "Just now",
    cctvUptimePercent: 99.1,
    riskScore: 14.8,
    riskLevel: "LOW",
    riskFactors: ["Nominal discrepancy within allowed ±5% tolerance"],
    lastAuditDate: "2026-09-02",
    lastInspectedBy: "INS-02 (Neeta Saxena)",
    allocatedFundsLakhs: 36.0,
    snapshotImage: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "INST-RAJ-109",
    name: "Dr. Ambedkar Skill Development Institute",
    scheme: "PM-AJAY (Adarsh Gram & Skill Scheme)",
    state: "Rajasthan",
    district: "Chomu (Near Jaipur)",
    lat: 27.1724,
    lng: 75.7208,
    address: "Industrial Area Phase 2, Chomu",
    inchargeName: "Vikram Meena",
    inchargePhone: "+91 97840 55123",
    claimedBeneficiaries: 60,
    aiDetectedBeneficiaries: 22,
    cctvStatus: "OFFLINE",
    lastHeartbeat: "42 mins ago",
    cctvUptimePercent: 44.5,
    riskScore: 92.0,
    riskLevel: "CRITICAL",
    riskFactors: [
      "Camera Offline during mandatory morning session",
      "Attendance Discrepancy > 63% on prior snapshot",
      "Unresolved grievance filed by regional committee"
    ],
    lastAuditDate: "2026-06-11",
    lastInspectedBy: "INS-01 (Rajesh Mehra)",
    allocatedFundsLakhs: 58.4,
    snapshotImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "INST-DEL-015",
    name: "Samarth Special School for Blind Children",
    scheme: "DDRS (Deendayal Disabled Rehabilitation)",
    state: "Delhi NCR",
    district: "South Delhi",
    lat: 28.5355,
    lng: 77.2410,
    address: "Institutional Area, Saket, New Delhi",
    inchargeName: "Sister Mary Abraham",
    inchargePhone: "+91 98110 33452",
    claimedBeneficiaries: 45,
    aiDetectedBeneficiaries: 44,
    cctvStatus: "ONLINE",
    lastHeartbeat: "1 min ago",
    cctvUptimePercent: 98.7,
    riskScore: 8.5,
    riskLevel: "LOW",
    riskFactors: ["Full compliance verified in previous 3 surprise audits"],
    lastAuditDate: "2026-08-30",
    lastInspectedBy: "INS-05 (Amitav Sen)",
    allocatedFundsLakhs: 52.0,
    snapshotImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "INST-MAH-404",
    name: "Sahara De-Addiction & Counseling Center",
    scheme: "NAPDDR (Drug Demand Reduction)",
    state: "Maharashtra",
    district: "Pune",
    lat: 18.5204,
    lng: 73.8567,
    address: "Hadapsar Bypass, Pune",
    inchargeName: "Avinash Deshmukh",
    inchargePhone: "+91 98220 76110",
    claimedBeneficiaries: 30,
    aiDetectedBeneficiaries: 18,
    cctvStatus: "ANOMALY",
    lastHeartbeat: "8 mins ago",
    cctvUptimePercent: 79.0,
    riskScore: 68.4,
    riskLevel: "MEDIUM",
    riskFactors: ["Attendance Deficit: 40% (30 claimed vs 18 counted)"],
    lastAuditDate: "2026-07-15",
    lastInspectedBy: "INS-08 (Prashant Patil)",
    allocatedFundsLakhs: 24.5,
    snapshotImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80"
  }
];

export const INITIAL_INSPECTORS = [
  {
    id: "INS-01",
    name: "Rajesh Mehra",
    designation: "Senior PMU Field Officer",
    phone: "+91 94140 12044",
    currentLocationName: "Civil Lines, Jaipur",
    lat: 26.9050,
    lng: 75.7900,
    status: "AVAILABLE", // AVAILABLE | ON-INSPECTION | OFF-DUTY
    totalAuditsDone: 84,
    integrityRating: 4.9,
    lastVisitedInstituteId: "INST-RAJ-109", // Collusion block for Chomu!
    lastInspectionDate: "2026-09-15",
    vehicleType: "Govt Four-Wheeler (GPS Enabled)"
  },
  {
    id: "INS-02",
    name: "Neeta Saxena",
    designation: "District Social Welfare Inspector",
    phone: "+91 98261 44552",
    currentLocationName: "Tonk Phatak, Jaipur",
    lat: 26.8820,
    lng: 75.8010,
    status: "AVAILABLE",
    totalAuditsDone: 62,
    integrityRating: 4.8,
    lastVisitedInstituteId: "INST-MP-210",
    lastInspectionDate: "2026-09-02",
    vehicleType: "Two-Wheeler"
  },
  {
    id: "INS-03",
    name: "Arun Kumar Yadav",
    designation: "Third-Party PMU Auditor",
    phone: "+91 97110 58219",
    currentLocationName: "Sitapura Industrial Area, Jaipur",
    lat: 26.7820,
    lng: 75.8350,
    status: "AVAILABLE",
    totalAuditsDone: 41,
    integrityRating: 4.7,
    lastVisitedInstituteId: "INST-DEL-015",
    lastInspectionDate: "2026-08-20",
    vehicleType: "Car"
  },
  {
    id: "INS-04",
    name: "Sunil Verma",
    designation: "DoSJE Zonal Vigilance Officer",
    phone: "+91 98291 99014",
    currentLocationName: "Bais Godam, Jaipur",
    lat: 26.8990,
    lng: 75.7890,
    status: "AVAILABLE",
    totalAuditsDone: 110,
    integrityRating: 5.0,
    lastVisitedInstituteId: "INST-RAJ-104", // Collusion block for Adarsh Rehabilitation!
    lastInspectionDate: "2026-08-14",
    vehicleType: "Govt EV"
  },
  {
    id: "INS-05",
    name: "Amitav Sen",
    designation: "Quality Assurance Assessor",
    phone: "+91 98112 00192",
    currentLocationName: "New Delhi Central",
    lat: 28.6139,
    lng: 77.2090, // Far away (>200 km) -> Out of 50km radius!
    status: "AVAILABLE",
    totalAuditsDone: 95,
    integrityRating: 4.9,
    lastVisitedInstituteId: "INST-DEL-015",
    lastInspectionDate: "2026-09-10",
    vehicleType: "Car"
  }
];

export const INITIAL_ANOMALIES = [
  {
    id: "ANO-2026-891",
    instituteId: "INST-RAJ-104",
    instituteName: "Adarsh Rehabilitation & Special Care Kendra",
    scheme: "DDRS",
    district: "Jaipur, Rajasthan",
    timestamp: "10:45 AM (Today)",
    claimedCount: 50,
    detectedCount: 11,
    deficitPercent: 78.0,
    severity: "CRITICAL",
    status: "PENDING_DISPATCH", // PENDING_DISPATCH | DISPATCHED | RESOLVED
    recommendedAction: "Immediate Physical Audit or Surprise VC"
  },
  {
    id: "ANO-2026-889",
    instituteId: "INST-RAJ-109",
    instituteName: "Dr. Ambedkar Skill Development Institute",
    scheme: "PM-AJAY",
    district: "Chomu, Rajasthan",
    timestamp: "10:15 AM (Today)",
    claimedCount: 60,
    detectedCount: 22,
    deficitPercent: 63.3,
    severity: "CRITICAL",
    status: "DISPATCHED",
    assignedInspector: "INS-02 (Neeta Saxena)",
    recommendedAction: "Physical Audit Assigned"
  },
  {
    id: "ANO-2026-882",
    instituteId: "INST-UP-302",
    instituteName: "Nav-Prabhat Garima Greh & Shelter Home",
    scheme: "SMILE",
    district: "Lucknow, UP",
    timestamp: "09:30 AM (Today)",
    claimedCount: 35,
    detectedCount: 14,
    deficitPercent: 60.0,
    severity: "HIGH",
    status: "PENDING_DISPATCH",
    recommendedAction: "Frictionless Surprise VC Verification"
  }
];

export const SCHEME_STATS = {
  totalInstitutesMonitored: 1842,
  activeEdgeCctvNodes: 1798,
  todayBeneficiariesVerified: 48920,
  ghostBeneficiariesFlagged: 1428,
  estimatedFundsProtectedCr: 12.45,
  averageAiAuditLatencySeconds: 1.8,
  tamperAttemptsBlocked: 37
};
