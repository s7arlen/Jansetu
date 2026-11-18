import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Complaint } from '../models/Complaint.js';
import { ComplaintHistory } from '../models/ComplaintHistory.js';
import { Counter } from '../models/Counter.js';
import { Notification } from '../models/Notification.js';
import { Escalation } from '../models/Escalation.js';
import { calculatePriority, suggestDepartment, PRIORITY_THRESHOLDS } from '../utils/priorityEngine.js';
import { generateComplaintId } from '../utils/idGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const runIntegrationTests = async () => {
  console.log('========================================================');
  console.log('🧪 STARTING JANSETU AUTOMATED INTEGRATION & QA TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jansetu');
    console.log('Connected to test database.\n');

    // ----------------------------------------------------
    // TEST SUITE 1: RULE-BASED PRIORITY ENGINE (Section 6)
    // ----------------------------------------------------
    console.log('--- TEST SUITE 1: RULE-BASED PRIORITY ENGINE ---');
    const pCritical = calculatePriority({
      severity: 'Critical',
      isPublicInstitutionAffected: true,
      createdAt: new Date(Date.now() - 50 * 3600 * 1000), // > 48h
    });
    // Critical (40) + Public Inst (20) + Age > 48h (15) = 75 pts
    assert(pCritical.score === 75, 'Critical + Institution + 48h Age calculates to 75 pts', `Got: ${pCritical.score}`);
    assert(pCritical.level === 'Critical', 'Score 75 classified as Critical priority');
    assert(pCritical.targetHours === 6, 'Critical priority maps to 6h target resolution window');

    const pLow = calculatePriority({
      severity: 'Low',
      isPublicInstitutionAffected: false,
      createdAt: new Date(),
    });
    // Low (10) = 10 pts
    assert(pLow.score === 10, 'Low severity calculates to 10 pts', `Got: ${pLow.score}`);
    assert(pLow.level === 'Low', 'Score 10 classified as Low priority');
    assert(pLow.targetHours === 72, 'Low priority maps to 72h target resolution window');

    const pMedium = calculatePriority({
      severity: 'Medium',
      isPublicInstitutionAffected: false,
      createdAt: new Date(Date.now() - 25 * 3600 * 1000), // > 24h
    });
    // Medium (20) + 24h Age (10) = 30 pts -> High threshold or Medium
    assert(pMedium.score === 30, 'Medium + 24h Age calculates to 30 pts', `Got: ${pMedium.score}`);
    assert(pMedium.level === 'Medium', 'Score 30 classified as Medium priority');

    // Department Suggestions
    assert(suggestDepartment('Roads and potholes') === 'Roads and Infrastructure', 'Roads maps to Roads and Infrastructure');
    assert(suggestDepartment('Water supply and leakage') === 'Water Supply', 'Water leakage maps to Water Supply');
    assert(suggestDepartment('Garbage and sanitation') === 'Sanitation', 'Garbage maps to Sanitation');
    assert(suggestDepartment('Streetlights and electricity') === 'Electrical Department', 'Streetlights maps to Electrical Department');
    assert(suggestDepartment('Drainage and sewage') === 'Drainage Department', 'Drainage maps to Drainage Department');

    // ----------------------------------------------------
    // TEST SUITE 2: UNIQUE COMPLAINT ID GENERATION (Section 5)
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 2: COMPLAINT ID GENERATOR ---');
    const id1 = await generateComplaintId();
    const id2 = await generateComplaintId();
    const currentYear = new Date().getFullYear();
    const idRegex = new RegExp(`^JAN-${currentYear}-\\d{5}$`);

    assert(idRegex.test(id1), `Generated ID format JAN-${currentYear}-XXXXX matches specification (${id1})`);
    assert(idRegex.test(id2), `Second generated ID matches specification (${id2})`);
    assert(id1 !== id2, `Sequential IDs are unique and incrementing (${id1} != ${id2})`);

    // ----------------------------------------------------
    // TEST SUITE 3: AUTHENTICATION & ACCESS CONTROL (Section 4 & 16)
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 3: AUTHENTICATION & ROLE-BASED ACCESS ---');
    const testAdmin = await User.findOne({ role: 'admin' });
    assert(!!testAdmin, 'Seeded Administrator account exists in database');

    const testOfficial = await User.findOne({ role: 'official' });
    assert(!!testOfficial, 'Seeded Department Official exists in database');

    const testCitizen1 = await User.findOne({ email: 'citizen1@jansetu.org' });
    const testCitizen2 = await User.findOne({ email: 'citizen2@jansetu.org' });
    assert(!!testCitizen1 && !!testCitizen2, 'Both seeded Citizens exist in database');

    const passwordMatches = await bcrypt.compare('Password@123', testAdmin.password);
    assert(passwordMatches, 'bcrypt password hash verification succeeds');

    const wrongPasswordMatches = await bcrypt.compare('WrongPassword', testAdmin.password);
    assert(!wrongPasswordMatches, 'bcrypt safely rejects invalid password');

    // ----------------------------------------------------
    // TEST SUITE 4: END-TO-END WORKFLOW INTEGRATION (Section 8, 10 & 23)
    // CITIZEN SUBMITS COMPLAINT
    // -> SYSTEM GENERATES ID
    // -> SYSTEM CALCULATES PRIORITY
    // -> ADMIN ASSIGNS DEPARTMENT
    // -> OFFICIAL UPDATES STATUS
    // -> OFFICIAL SUBMITS EVIDENCE
    // -> CITIZEN VERIFIES RESOLUTION
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 4: COMPLETE END-TO-END WORKFLOW VERIFICATION ---');

    // 1. Citizen Submits
    const testCompId = await generateComplaintId();
    const priorityCalc = calculatePriority({
      severity: 'Critical',
      isPublicInstitutionAffected: true,
      createdAt: new Date(),
    });

    const roadsDept = await Department.findOne({ code: 'ROADS' });

    const newComp = await Complaint.create({
      complaintId: testCompId,
      title: 'Automated QA: Critical Highway Cavity at Hospital Turn',
      description: 'Massive sinkhole blocking emergency ambulance ingress.',
      category: 'Roads and potholes',
      severity: 'Critical',
      isPublicInstitutionAffected: true,
      publicInstitutionDetails: 'City General Emergency Hospital',
      priorityScore: priorityCalc.score,
      priorityLevel: priorityCalc.level,
      priorityFactors: priorityCalc.factors,
      location: {
        address: 'Hospital Ring Road Junction 4',
        landmark: 'Ambulance Bay Gate',
        city: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
      },
      citizenId: testCitizen1._id,
      departmentId: roadsDept._id,
      status: 'SUBMITTED',
      targetResolutionHours: priorityCalc.targetHours,
      deadline: new Date(Date.now() + priorityCalc.targetHours * 3600 * 1000),
    });

    await ComplaintHistory.create({
      complaintId: newComp._id,
      complaintCode: newComp.complaintId,
      previousStatus: '',
      newStatus: 'SUBMITTED',
      updatedBy: testCitizen1._id,
      updaterRole: 'citizen',
      remarks: 'Automated test intake submission.',
    });

    assert(newComp.status === 'SUBMITTED', 'Workflow Step 1: Complaint created in SUBMITTED state');
    assert(newComp.priorityLevel === 'Critical', 'Workflow Step 1: Priority correctly classified as Critical');

    // 2. Admin Assigns
    newComp.status = 'ASSIGNED';
    newComp.assignedOfficialId = testOfficial._id;
    await newComp.save();

    await ComplaintHistory.create({
      complaintId: newComp._id,
      complaintCode: newComp.complaintId,
      previousStatus: 'SUBMITTED',
      newStatus: 'ASSIGNED',
      updatedBy: testAdmin._id,
      updaterRole: 'admin',
      remarks: 'Assigned to Roads Division for immediate patching.',
    });

    assert(newComp.status === 'ASSIGNED', 'Workflow Step 2: Admin transitions status to ASSIGNED');

    // 3. Official Starts Work (IN PROGRESS)
    newComp.status = 'IN PROGRESS';
    await newComp.save();

    await ComplaintHistory.create({
      complaintId: newComp._id,
      complaintCode: newComp.complaintId,
      previousStatus: 'ASSIGNED',
      newStatus: 'IN PROGRESS',
      updatedBy: testOfficial._id,
      updaterRole: 'official',
      remarks: 'Field asphalt batch mobilized on site.',
    });

    assert(newComp.status === 'IN PROGRESS', 'Workflow Step 3: Official starts work (IN PROGRESS)');

    // 4. Official Submits Resolution Evidence
    newComp.status = 'CITIZEN VERIFICATION';
    newComp.afterImage = '/uploads/demo-completion.jpg';
    newComp.resolutionRemarks = 'Pothole excavated, backfilled with gravel, and sealed with dense bituminous macadam.';
    newComp.resolutionSubmittedAt = new Date();
    await newComp.save();

    await ComplaintHistory.create({
      complaintId: newComp._id,
      complaintCode: newComp.complaintId,
      previousStatus: 'IN PROGRESS',
      newStatus: 'CITIZEN VERIFICATION',
      updatedBy: testOfficial._id,
      updaterRole: 'official',
      remarks: 'Work complete. Forwarded for citizen inspection and confirmation.',
      evidence: newComp.afterImage,
    });

    assert(newComp.status === 'CITIZEN VERIFICATION', 'Workflow Step 4: Status changed to CITIZEN VERIFICATION');
    assert(!!newComp.afterImage, 'Workflow Step 4: After image evidence recorded');

    // 5. Citizen Confirms Resolution
    newComp.status = 'RESOLVED';
    newComp.resolvedAt = new Date();
    newComp.citizenFeedback = {
      rating: 5,
      comment: 'Excellent and swift emergency road repair. Well done!',
      submittedAt: new Date(),
    };
    await newComp.save();

    await ComplaintHistory.create({
      complaintId: newComp._id,
      complaintCode: newComp.complaintId,
      previousStatus: 'CITIZEN VERIFICATION',
      newStatus: 'RESOLVED',
      updatedBy: testCitizen1._id,
      updaterRole: 'citizen',
      remarks: 'Citizen confirmed resolution with 5/5 star feedback.',
    });

    assert(newComp.status === 'RESOLVED', 'Workflow Step 5: Citizen confirms resolution -> RESOLVED');
    assert(newComp.citizenFeedback.rating === 5, 'Workflow Step 5: Citizen feedback & 5-star rating persisted');

    // 6. Verify Complete Audit History Persistence
    const historyLogs = await ComplaintHistory.find({ complaintId: newComp._id }).sort({ timestamp: 1 });
    assert(historyLogs.length === 5, `Workflow Audit Trail contains all 5 transitions (got ${historyLogs.length})`);
    assert(historyLogs[0].newStatus === 'SUBMITTED', 'Audit log 1: SUBMITTED');
    assert(historyLogs[1].newStatus === 'ASSIGNED', 'Audit log 2: ASSIGNED');
    assert(historyLogs[2].newStatus === 'IN PROGRESS', 'Audit log 3: IN PROGRESS');
    assert(historyLogs[3].newStatus === 'CITIZEN VERIFICATION', 'Audit log 4: CITIZEN VERIFICATION');
    assert(historyLogs[4].newStatus === 'RESOLVED', 'Audit log 5: RESOLVED');

    // ----------------------------------------------------
    // TEST SUITE 5: ESCALATION & OVERDUE MONITORING (Section 9)
    // ----------------------------------------------------
    console.log('\n--- TEST SUITE 5: ESCALATION & OVERDUE AUDITING ---');
    const overdueComplaint = await Complaint.findOne({ isOverdue: true });
    assert(!!overdueComplaint, 'Identified overdue complaint in database');

    const escalationCount = await Complaint.countDocuments({ isEscalated: true });
    assert(escalationCount > 0, `Identified active administrative escalations in database (${escalationCount})`);

    // Clean up test complaint
    await Complaint.deleteOne({ _id: newComp._id });
    await ComplaintHistory.deleteMany({ complaintId: newComp._id });

    console.log('\n========================================================');
    console.log(`🎉 TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal Integration Test Failure:', error);
    process.exit(1);
  }
};

runIntegrationTests();
