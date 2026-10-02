import {
  CandidateScreeningScore,
  AttritionRiskProfile,
  PayrollAnomalyAlert,
  Employee,
  Candidate,
  JobRequisition,
  AttendanceRecord,
} from '../types';

export const aiService = {
  // 1. AI Resume Screening Engine
  screenCandidateResume(
    candidate: Candidate,
    requisition: JobRequisition
  ): CandidateScreeningScore {
    const resumeText = (candidate.resumeSummary + ' ' + (candidate.interviewNotes || '')).toLowerCase();
    const requirements = requisition.requirements || [];

    let matchedSkillsCount = 0;
    const strengths: string[] = [];
    const missing: string[] = [];

    // Analyze skills match
    requirements.forEach(req => {
      const normalizedReq = req.toLowerCase();
      if (resumeText.includes(normalizedReq) || normalizedReq.split(' ').some(w => w.length > 3 && resumeText.includes(w))) {
        matchedSkillsCount++;
        strengths.push(req);
      } else {
        missing.push(req);
      }
    });

    const skillsMatchScore = requirements.length > 0
      ? Math.round((matchedSkillsCount / requirements.length) * 100)
      : 80;

    // Experience matching
    const reqExpYears = parseInt(requisition.experienceRequired) || 3;
    const candExpYears = candidate.experienceYears || 2;
    let experienceMatchScore = Math.min(100, Math.round((candExpYears / reqExpYears) * 100));

    // Education match
    const educationMatchScore = resumeText.includes('bachelor') || resumeText.includes('b.tech') || resumeText.includes('master') || resumeText.includes('degree')
      ? 95
      : 75;

    // Weighted Overall Score: 50% skills, 35% experience, 15% education
    const overallMatchScore = Math.round(
      skillsMatchScore * 0.5 + experienceMatchScore * 0.35 + educationMatchScore * 0.15
    );

    let recommendation: CandidateScreeningScore['recommendation'] = 'Borderline';
    if (overallMatchScore >= 80) recommendation = 'Strong Hire';
    else if (overallMatchScore >= 65) recommendation = 'Shortlist';
    else if (overallMatchScore < 50) recommendation = 'Reject';

    const aiSummary = `Candidate ${candidate.name} matches ${skillsMatchScore}% of required technical competencies for ${requisition.title}. Demonstrated ${candExpYears} years track record (Req: ${reqExpYears}y). High compatibility in ${strengths.slice(0, 3).join(', ') || 'core responsibilities'}.`;

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      requisitionId: requisition.id,
      overallMatchScore,
      skillsMatchScore,
      experienceMatchScore,
      educationMatchScore,
      keyStrengths: strengths.length > 0 ? strengths : ['General Domain Experience', 'Core Industry Background'],
      missingKeywords: missing.length > 0 ? missing : ['Advanced certifications'],
      recommendation,
      aiSummary,
    };
  },

  // 2. AI Attrition Risk Predictor
  predictAttritionRisk(
    employee: Employee,
    recentAttendance: AttendanceRecord[]
  ): AttritionRiskProfile {
    // Model predictors:
    // 1. Tenure in months
    const joinDate = new Date(employee.joiningDate);
    const now = new Date();
    const tenureMonths = Math.max(1, Math.round((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

    // 2. Recent attendance health & late occurrences
    const empAttendance = recentAttendance.filter(a => a.employeeId === employee.id);
    const lateDays = empAttendance.filter(a => a.status === 'Late').length;
    const absentDays = empAttendance.filter(a => a.status === 'Absent').length;

    let riskScore = 20; // baseline
    const drivers: string[] = [];
    const retentionActions: string[] = [];

    // Critical tenure cliff: 12-24 months
    if (tenureMonths >= 12 && tenureMonths <= 24) {
      riskScore += 25;
      drivers.push('1-2 Year Tenure Transition Cliff');
    }

    if (lateDays >= 2 || absentDays >= 1) {
      riskScore += 20;
      drivers.push('Declining Attendance & Late Clock-ins');
      retentionActions.push('Manager 1-on-1 check-in to assess workload friction');
    }

    // Compensation ratio check
    if (employee.salaryStructure.annualCTC < 600000 && employee.experience.length >= 2) {
      riskScore += 15;
      drivers.push('Below Industry Median Compensation Ratio');
      retentionActions.push('Schedule market salary correction review in upcoming cycle');
    }

    // Role stagnation
    if (tenureMonths > 20) {
      riskScore += 10;
      drivers.push('Time in Role > 18 Months Without Designation Shift');
      retentionActions.push('Explore vertical promotion or lateral rotation project');
    }

    riskScore = Math.min(95, Math.max(10, riskScore));

    let riskLevel: AttritionRiskProfile['riskLevel'] = 'Low';
    if (riskScore >= 70) riskLevel = 'Critical';
    else if (riskScore >= 50) riskLevel = 'High';
    else if (riskScore >= 35) riskLevel = 'Medium';

    if (retentionActions.length === 0) {
      retentionActions.push('Maintain quarterly career path progression discussions');
    }

    return {
      employeeId: employee.id,
      employeeName: employee.fullName,
      department: employee.departmentName,
      tenureMonths,
      riskScore,
      riskLevel,
      topDrivers: drivers.length > 0 ? drivers : ['Stable tenure', 'Consistent attendance records'],
      recommendedRetentionActions: retentionActions,
    };
  },

  // 3. AI Payroll Anomaly Detector
  detectPayrollAnomalies(
    employees: Employee[],
    attendance: AttendanceRecord[]
  ): PayrollAnomalyAlert[] {
    const alerts: PayrollAnomalyAlert[] = [];

    employees.forEach(emp => {
      const empAttendance = attendance.filter(a => a.employeeId === emp.id);
      const absentCount = empAttendance.filter(a => a.status === 'Absent').length;

      // Anomaly 1: Sudden Absenteeism Spike
      if (absentCount >= 3) {
        alerts.push({
          id: `anomaly-lop-${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.fullName,
          anomalyType: 'Sudden LOP Spike',
          severity: 'Critical',
          description: `Detected ${absentCount} unpaid absences in current pay period. Projected Loss of Pay (LOP) deduction exceeds standard baseline.`,
          variancePercentage: 45.0,
          suggestedResolution: 'Verify if medical leave or regularizations were submitted before locking payroll run.',
        });
      }

      // Anomaly 2: Negative Net Pay Risk under excessive deductions
      const gross = emp.salaryStructure.monthlyGross;
      const totalDeductions =
        emp.salaryStructure.pfEmployee +
        emp.salaryStructure.esi +
        emp.salaryStructure.professionalTax +
        emp.salaryStructure.tdsMonthly;

      if (totalDeductions > gross * 0.5) {
        alerts.push({
          id: `anomaly-ded-${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.fullName,
          anomalyType: 'Negative Net Pay Risk',
          severity: 'Warning',
          description: `Total deductions (₹${totalDeductions.toLocaleString()}) exceed 50% of monthly gross (₹${gross.toLocaleString()}), violating Section 7 of Payment of Wages Act.`,
          variancePercentage: Math.round((totalDeductions / gross) * 100),
          suggestedResolution: 'Spread advance or recovery deductions across multiple pay cycles.',
        });
      }
    });

    return alerts;
  },

  // 4. AI HR Assistant (Natural Language Policy & Query Engine)
  queryHRAssistant(question: string): {
    answer: string;
    sourcePolicy: string;
    actionableLink?: string;
  } {
    const q = question.toLowerCase();

    if (q.includes('leave') || q.includes('vacation') || q.includes('casual') || q.includes('sick')) {
      return {
        answer: 'Employees are entitled to 12 days of Casual Leave (CL), 12 days of Sick Leave (SL), and 15 days of Earned/Privilege Leave (EL) annually. Leaves accrue on a pro-rata monthly basis. Earned leaves can be carried forward up to a maximum cap of 45 days.',
        sourcePolicy: 'ARQENSIAL Comprehensive Leave & Attendance Policy (Sec. 4.2)',
        actionableLink: 'leaves',
      };
    }

    if (q.includes('tax') || q.includes('regime') || q.includes('80c') || q.includes('form 16') || q.includes('tds')) {
      return {
        answer: 'Under the default New Tax Regime (FY 2024-25/2025-26), individuals with income up to ₹7.75 Lakhs enjoy zero tax liability due to the ₹75,000 standard deduction and Section 87A rebate. Old Tax Regime allows claiming exemptions under Section 80C (up to ₹1.5L), 80D (health insurance), and HRA rent receipts.',
        sourcePolicy: 'Indian Income Tax Act 1961 - Sections 115BAC & 87A Guidelines',
        actionableLink: 'payroll',
      };
    }

    if (q.includes('pf') || q.includes('provident') || q.includes('epfo') || q.includes('uan')) {
      return {
        answer: 'Employee Provident Fund (EPF) is mandatory for eligible employees with 12% deduction on Basic + DA. The employer matches 12%, divided into 8.33% for Employee Pension Scheme (EPS capped at ₹1,250) and 3.67% for EPF, plus EDLI and admin charges.',
        sourcePolicy: 'Employees Provident Funds & Miscellaneous Provisions Act, 1952',
        actionableLink: 'payroll',
      };
    }

    if (q.includes('exit') || q.includes('notice') || q.includes('resignation') || q.includes('gratuity')) {
      return {
        answer: 'Standard notice period is 60 days (or 30 days during probation). Gratuity is payable under the Payment of Gratuity Act 1972 upon completing 5 years of continuous service, calculated as (15 * Last Drawn Basic * Years of Service) / 26.',
        sourcePolicy: 'Employment Separation & Exit Management Framework (Sec. 9.1)',
        actionableLink: 'exit_management',
      };
    }

    return {
      answer: 'ARQENSIAL Enterprise policies enforce equal opportunity, transparent performance appraisals via quarterly OKRs, structured health benefits, and hybrid work flexibility with geo-fenced attendance check-ins.',
      sourcePolicy: 'ARQENSIAL Enterprise Employee Handbook v4.5',
    };
  },
};
