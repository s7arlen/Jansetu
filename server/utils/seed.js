import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
import { calculatePriority } from './priorityEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jansetu';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Complaint.deleteMany(),
      ComplaintHistory.deleteMany(),
      Counter.deleteMany(),
      Notification.deleteMany(),
      Escalation.deleteMany(),
    ]);

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password@123', salt);

    // 1. Seed 6 Departments
    console.log('[Seed] Creating 6 Default Departments...');
    const departmentsData = [
      {
        name: 'Roads and Infrastructure',
        code: 'ROADS',
        description: 'Municipal road maintenance, pothole patching, pedestrian pathways, and bridge infrastructure.',
        icon: 'Hammer',
        contactEmail: 'roads@jansetu.gov.in',
        contactPhone: '+91 11 2345 6781',
        defaultCategories: ['Roads and potholes', 'Public infrastructure'],
      },
      {
        name: 'Water Supply',
        code: 'WATER',
        description: 'Potable water pipelines, distribution, tanker logistics, and pipe burst remediation.',
        icon: 'Droplets',
        contactEmail: 'water@jansetu.gov.in',
        contactPhone: '+91 11 2345 6782',
        defaultCategories: ['Water supply and leakage'],
      },
      {
        name: 'Sanitation',
        code: 'SANIT',
        description: 'Solid waste management, community dumpsters, street sweeping, and composting.',
        icon: 'Trash2',
        contactEmail: 'sanitation@jansetu.gov.in',
        contactPhone: '+91 11 2345 6783',
        defaultCategories: ['Garbage and sanitation'],
      },
      {
        name: 'Electrical Department',
        code: 'ELECT',
        description: 'Streetlight maintenance, power transformers, cable repairs, and public illumination.',
        icon: 'Zap',
        contactEmail: 'electricity@jansetu.gov.in',
        contactPhone: '+91 11 2345 6784',
        defaultCategories: ['Streetlights and electricity'],
      },
      {
        name: 'Drainage Department',
        code: 'DRAIN',
        description: 'Stormwater drains, sewer lines, desilting, manhole covers, and urban flood prevention.',
        icon: 'Waves',
        contactEmail: 'drainage@jansetu.gov.in',
        contactPhone: '+91 11 2345 6785',
        defaultCategories: ['Drainage and sewage'],
      },
      {
        name: 'General Administration',
        code: 'GENAD',
        description: 'Public civic inquiries, municipal parks, encroached walkways, and miscellaneous issues.',
        icon: 'Building2',
        contactEmail: 'admin@jansetu.gov.in',
        contactPhone: '+91 11 2345 6780',
        defaultCategories: ['Other civic issues'],
      },
    ];

    const departments = await Department.insertMany(departmentsData);
    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d._id;
    });

    // 2. Seed Users
    console.log('[Seed] Creating Administrator, Officials, and Citizens...');
    // One Administrator
    const admin = await User.create({
      name: 'Dr. Alok Verma',
      email: 'admin@jansetu.gov.in',
      password: defaultPasswordHash,
      role: 'admin',
      phone: '+91 98100 11223',
      designation: 'Chief Municipal Commissioner',
    });

    // Three Department Officials
    const official1 = await User.create({
      name: 'Er. Rajesh Kumar',
      email: 'official.roads@jansetu.gov.in',
      password: defaultPasswordHash,
      role: 'official',
      departmentId: deptMap['ROADS'],
      phone: '+91 98111 22334',
      designation: 'Senior Infrastructure Engineer',
    });

    const official2 = await User.create({
      name: 'Er. Sunita Rao',
      email: 'official.water@jansetu.gov.in',
      password: defaultPasswordHash,
      role: 'official',
      departmentId: deptMap['WATER'],
      phone: '+91 98222 33445',
      designation: 'Assistant Executive Engineer (Water Works)',
    });

    const official3 = await User.create({
      name: 'Mr. Vikram Singh',
      email: 'official.sanitation@jansetu.gov.in',
      password: defaultPasswordHash,
      role: 'official',
      departmentId: deptMap['SANIT'],
      phone: '+91 98333 44556',
      designation: 'Sanitation Inspection Officer',
    });

    // Two Citizens
    const citizen1 = await User.create({
      name: 'Rohan Sharma',
      email: 'citizen1@jansetu.org',
      password: defaultPasswordHash,
      role: 'citizen',
      phone: '+91 99100 44556',
    });

    const citizen2 = await User.create({
      name: 'Priya Iyer',
      email: 'citizen2@jansetu.org',
      password: defaultPasswordHash,
      role: 'citizen',
      phone: '+91 99200 55667',
    });

    // Initialize Counter for 2026
    const currentYear = new Date().getFullYear();
    await Counter.create({
      name: `complaint_${currentYear}`,
      seq: 5,
    });

    // 3. Seed 5 Realistic Sample Complaints
    console.log('[Seed] Seeding 5 Scenarios across different priorities and statuses...');

    // Scenario 1: Dangerous pothole near a school (Critical safety risk -> Critical)
    const prio1 = calculatePriority({
      severity: 'Critical',
      isPublicInstitutionAffected: true,
      createdAt: new Date(Date.now() - 36 * 3600 * 1000),
    });
    const c1Deadline = new Date(Date.now() - 10 * 3600 * 1000); // Intentionally overdue for demo

    const c1 = await Complaint.create({
      complaintId: `JAN-${currentYear}-00001`,
      title: 'Deep Hazardous Pothole Opposite St. Xavier School Gate',
      description:
        'A large 2-foot deep trench-like crater has opened directly facing the primary school entrance gate. Two schoolchildren on bicycles suffered falls yesterday. High accident risk during morning school bus transit.',
      category: 'Roads and potholes',
      severity: 'Critical',
      isPublicInstitutionAffected: true,
      publicInstitutionDetails: 'St. Xavier Primary & Higher Secondary School',
      priorityScore: prio1.score,
      priorityLevel: prio1.level,
      priorityFactors: prio1.factors,
      location: {
        address: 'Sector 14 Main Avenue, Opposite Gate No. 2, St. Xavier School',
        landmark: 'St. Xavier School Campus Gate',
        city: 'New Delhi',
        pincode: '110001',
        latitude: 28.6289,
        longitude: 77.2065,
      },
      beforeImage: '/uploads/pothole_inspection_before.jpg',
      citizenId: citizen1._id,
      departmentId: deptMap['ROADS'],
      assignedOfficialId: official1._id,
      status: 'IN PROGRESS',
      targetResolutionHours: prio1.targetHours,
      deadline: c1Deadline,
      isOverdue: true,
      isEscalated: true,
      escalationDetails: {
        level: 1,
        reason: 'Severe student safety risk; pending road restoration past demonstration target.',
        escalatedBy: admin._id,
        escalatedAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
      createdAt: new Date(Date.now() - 36 * 3600 * 1000),
    });

    await ComplaintHistory.insertMany([
      {
        complaintId: c1._id,
        complaintCode: c1.complaintId,
        previousStatus: '',
        newStatus: 'SUBMITTED',
        updatedBy: citizen1._id,
        updaterRole: 'citizen',
        remarks: 'Reported dangerous pothole near school front.',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000),
      },
      {
        complaintId: c1._id,
        complaintCode: c1.complaintId,
        previousStatus: 'SUBMITTED',
        newStatus: 'ASSIGNED',
        updatedBy: admin._id,
        updaterRole: 'admin',
        remarks: 'Assigned urgently to Roads & Infrastructure department.',
        timestamp: new Date(Date.now() - 28 * 3600 * 1000),
      },
      {
        complaintId: c1._id,
        complaintCode: c1.complaintId,
        previousStatus: 'ASSIGNED',
        newStatus: 'IN PROGRESS',
        updatedBy: official1._id,
        updaterRole: 'official',
        remarks: 'Asphalt cold-mix batch dispatched; site cordoned with safety bollards.',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000),
      },
    ]);

    // Scenario 2: Water leakage in a residential area (In Citizen Verification)
    const prio2 = calculatePriority({
      severity: 'High',
      isPublicInstitutionAffected: false,
      createdAt: new Date(Date.now() - 20 * 3600 * 1000),
    });

    const c2 = await Complaint.create({
      complaintId: `JAN-${currentYear}-00002`,
      title: 'High-Pressure Underground Main Pipeline Leakage',
      description:
        'Continuous potable water geyser spurting from the pavement valve chamber. Over 5000 liters wasting every hour, leading to sub-soil saturation and weak water pressure for 40 households.',
      category: 'Water supply and leakage',
      severity: 'High',
      isPublicInstitutionAffected: false,
      priorityScore: prio2.score,
      priorityLevel: prio2.level,
      priorityFactors: prio2.factors,
      location: {
        address: 'B-Block Lane 4, Shanti Niketan Society',
        landmark: 'Opposite Community Park Valve Box',
        city: 'New Delhi',
        pincode: '110021',
        latitude: 28.5824,
        longitude: 77.1687,
      },
      beforeImage: '/uploads/pothole_inspection_before.jpg',
      afterImage: '/uploads/pothole_repaired_after.jpg',
      resolutionRemarks: 'Main pipeline collar gasket replaced, pressure tested at 4.2 bar, valve vault dry and resealed.',
      resolutionEvidence: 'Flange replacement certificate #WTR-4919 issued.',
      resolutionSubmittedAt: new Date(Date.now() - 2 * 3600 * 1000),
      citizenId: citizen2._id,
      departmentId: deptMap['WATER'],
      assignedOfficialId: official2._id,
      status: 'CITIZEN VERIFICATION',
      targetResolutionHours: prio2.targetHours,
      deadline: new Date(Date.now() + 4 * 3600 * 1000),
      createdAt: new Date(Date.now() - 20 * 3600 * 1000),
    });

    await ComplaintHistory.insertMany([
      {
        complaintId: c2._id,
        complaintCode: c2.complaintId,
        previousStatus: '',
        newStatus: 'SUBMITTED',
        updatedBy: citizen2._id,
        updaterRole: 'citizen',
        remarks: 'Reported water gush on residential sidewalk.',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000),
      },
      {
        complaintId: c2._id,
        complaintCode: c2.complaintId,
        previousStatus: 'SUBMITTED',
        newStatus: 'ASSIGNED',
        updatedBy: admin._id,
        updaterRole: 'admin',
        remarks: 'Dispatched to Water Works rapid repair division.',
        timestamp: new Date(Date.now() - 15 * 3600 * 1000),
      },
      {
        complaintId: c2._id,
        complaintCode: c2.complaintId,
        previousStatus: 'ASSIGNED',
        newStatus: 'IN PROGRESS',
        updatedBy: official2._id,
        updaterRole: 'official',
        remarks: 'Excavation completed, pipeline isolated.',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000),
      },
      {
        complaintId: c2._id,
        complaintCode: c2.complaintId,
        previousStatus: 'IN PROGRESS',
        newStatus: 'CITIZEN VERIFICATION',
        updatedBy: official2._id,
        updaterRole: 'official',
        remarks: 'Pipeline leak completely fixed and tested under operating pressure. Submitted for citizen sign-off.',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000),
      },
    ]);

    // Scenario 3: Garbage accumulation in a public area (Resolved with Citizen Confirmation)
    const prio3 = calculatePriority({
      severity: 'Medium',
      isPublicInstitutionAffected: false,
      createdAt: new Date(Date.now() - 72 * 3600 * 1000),
    });

    const c3 = await Complaint.create({
      complaintId: `JAN-${currentYear}-00003`,
      title: 'Illegal Commercial Waste Dump near Market Complex',
      description:
        'Large pile of rotting organic waste and plastic cartons dumped adjacent to the vegetable market. Causing foul odor, stray animal pack buildup, and pedestrian hazard.',
      category: 'Garbage and sanitation',
      severity: 'Medium',
      isPublicInstitutionAffected: false,
      priorityScore: prio3.score,
      priorityLevel: prio3.level,
      priorityFactors: prio3.factors,
      location: {
        address: 'Market Square Corner, Block C, Central Bazaar',
        landmark: 'Adjacent to Metro Gate 3',
        city: 'New Delhi',
        pincode: '110005',
        latitude: 28.6448,
        longitude: 77.2167,
      },
      beforeImage: '/uploads/pothole_inspection_before.jpg',
      afterImage: '/uploads/pothole_repaired_after.jpg',
      resolutionRemarks: 'Entire site cleared using compact loader. 3 tons debris hauled to composting yard; lime powder and disinfectant sprayed.',
      resolutionSubmittedAt: new Date(Date.now() - 24 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 12 * 3600 * 1000),
      citizenFeedback: {
        rating: 5,
        comment: 'Fast action by the sanitation crew! Spot is spotless and disinfected now. Thank you!',
        submittedAt: new Date(Date.now() - 12 * 3600 * 1000),
      },
      citizenId: citizen1._id,
      departmentId: deptMap['SANIT'],
      assignedOfficialId: official3._id,
      status: 'RESOLVED',
      targetResolutionHours: prio3.targetHours,
      deadline: new Date(Date.now() - 24 * 3600 * 1000),
      createdAt: new Date(Date.now() - 72 * 3600 * 1000),
    });

    await ComplaintHistory.insertMany([
      {
        complaintId: c3._id,
        complaintCode: c3.complaintId,
        previousStatus: '',
        newStatus: 'SUBMITTED',
        updatedBy: citizen1._id,
        updaterRole: 'citizen',
        remarks: 'Reported garbage pile.',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000),
      },
      {
        complaintId: c3._id,
        complaintCode: c3.complaintId,
        previousStatus: 'SUBMITTED',
        newStatus: 'ASSIGNED',
        updatedBy: admin._id,
        updaterRole: 'admin',
        remarks: 'Assigned to Sanitation Division.',
        timestamp: new Date(Date.now() - 60 * 3600 * 1000),
      },
      {
        complaintId: c3._id,
        complaintCode: c3.complaintId,
        previousStatus: 'ASSIGNED',
        newStatus: 'IN PROGRESS',
        updatedBy: official3._id,
        updaterRole: 'official',
        remarks: 'Sanitation tipper truck mobilized.',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000),
      },
      {
        complaintId: c3._id,
        complaintCode: c3.complaintId,
        previousStatus: 'IN PROGRESS',
        newStatus: 'CITIZEN VERIFICATION',
        updatedBy: official3._id,
        updaterRole: 'official',
        remarks: 'Site cleared and disinfected.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000),
      },
      {
        complaintId: c3._id,
        complaintCode: c3.complaintId,
        previousStatus: 'CITIZEN VERIFICATION',
        newStatus: 'RESOLVED',
        updatedBy: citizen1._id,
        updaterRole: 'citizen',
        remarks: 'Citizen confirmed work complete. Rating 5/5.',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000),
      },
    ]);

    // Scenario 4: Broken streetlight on dark stretch (SUBMITTED / Auto-Suggested Electrical)
    const prio4 = calculatePriority({
      severity: 'Low',
      isPublicInstitutionAffected: false,
      createdAt: new Date(Date.now() - 6 * 3600 * 1000),
    });

    const c4 = await Complaint.create({
      complaintId: `JAN-${currentYear}-00004`,
      title: 'Four Successive Non-Functional LED Streetlights on Park Perimeter',
      description:
        'The walking pathway along the municipal botanical park is pitch black at night due to 4 dark poles (Poles #E-401 to E-404). Senior citizens unable to walk after 7 PM.',
      category: 'Streetlights and electricity',
      severity: 'Low',
      isPublicInstitutionAffected: false,
      priorityScore: prio4.score,
      priorityLevel: prio4.level,
      priorityFactors: prio4.factors,
      location: {
        address: 'Ring Road Service Lane, Outer Boundary of Botanical Park',
        landmark: 'Near Joggers Entry Kiosk',
        city: 'New Delhi',
        pincode: '110016',
        latitude: 28.5562,
        longitude: 77.1994,
      },
      citizenId: citizen2._id,
      departmentId: deptMap['ELECT'],
      status: 'SUBMITTED',
      targetResolutionHours: prio4.targetHours,
      deadline: new Date(Date.now() + 66 * 3600 * 1000),
      createdAt: new Date(Date.now() - 6 * 3600 * 1000),
    });

    await ComplaintHistory.create({
      complaintId: c4._id,
      complaintCode: c4.complaintId,
      previousStatus: '',
      newStatus: 'SUBMITTED',
      updatedBy: citizen2._id,
      updaterRole: 'citizen',
      remarks: 'Initial submission with rule-based priority assessment.',
      timestamp: new Date(Date.now() - 6 * 3600 * 1000),
    });

    // Scenario 5: Blocked drainage causing street flooding (UNDER REVIEW / Drainage Dept)
    const prio5 = calculatePriority({
      severity: 'High',
      isPublicInstitutionAffected: true,
      createdAt: new Date(Date.now() - 14 * 3600 * 1000),
    });

    const c5 = await Complaint.create({
      complaintId: `JAN-${currentYear}-00005`,
      title: 'Severely Clogged Main Storm Sewer Backing up into Primary Health Center',
      description:
        'Plastic silt and construction debris have plugged the 600mm diameter stormwater line. Knee-deep stagnant black water accumulating right outside the entry ramp of the Primary Health Center.',
      category: 'Drainage and sewage',
      severity: 'High',
      isPublicInstitutionAffected: true,
      publicInstitutionDetails: 'Government Primary Health Center (PHC Ward 9)',
      priorityScore: prio5.score,
      priorityLevel: prio5.level,
      priorityFactors: prio5.factors,
      location: {
        address: 'Ward 9 Health Center Approach Road, Old City',
        landmark: 'In front of PHC Emergency Clinic Gate',
        city: 'New Delhi',
        pincode: '110006',
        latitude: 28.6562,
        longitude: 77.2312,
      },
      citizenId: citizen1._id,
      departmentId: deptMap['DRAIN'],
      status: 'UNDER REVIEW',
      targetResolutionHours: prio5.targetHours,
      deadline: new Date(Date.now() + 10 * 3600 * 1000),
      createdAt: new Date(Date.now() - 14 * 3600 * 1000),
    });

    await ComplaintHistory.insertMany([
      {
        complaintId: c5._id,
        complaintCode: c5.complaintId,
        previousStatus: '',
        newStatus: 'SUBMITTED',
        updatedBy: citizen1._id,
        updaterRole: 'citizen',
        remarks: 'Reported storm sewer overflow near clinic.',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000),
      },
      {
        complaintId: c5._id,
        complaintCode: c5.complaintId,
        previousStatus: 'SUBMITTED',
        newStatus: 'UNDER REVIEW',
        updatedBy: admin._id,
        updaterRole: 'admin',
        remarks: 'Under review by municipal engineering desk; scheduling jetting machine.',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000),
      },
    ]);

    // 4. Sample In-App Notifications
    console.log('[Seed] Seeding sample notifications...');
    await Notification.insertMany([
      {
        userId: citizen1._id,
        complaintId: c1._id,
        complaintCode: c1.complaintId,
        title: 'Priority Escalated',
        message: 'Your complaint regarding the dangerous pothole has been escalated to Level 1 by Municipal Administration.',
        type: 'danger',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
      {
        userId: citizen2._id,
        complaintId: c2._id,
        complaintCode: c2.complaintId,
        title: 'Resolution Ready for Verification',
        message: 'Water Supply Department has completed repairs on your reported pipeline leak. Please verify and confirm resolution.',
        type: 'warning',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        userId: admin._id,
        complaintId: c1._id,
        complaintCode: c1.complaintId,
        title: 'Overdue Warning: JAN-2026-00001',
        message: 'High priority complaint #JAN-2026-00001 has crossed its target resolution window.',
        type: 'danger',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ JANSETU Database Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('1. Admin: admin@jansetu.gov.in / Password@123');
    console.log('2. Official (Roads): official.roads@jansetu.gov.in / Password@123');
    console.log('3. Official (Water): official.water@jansetu.gov.in / Password@123');
    console.log('4. Official (Sanitation): official.sanitation@jansetu.gov.in / Password@123');
    console.log('5. Citizen 1: citizen1@jansetu.org / Password@123');
    console.log('6. Citizen 2: citizen2@jansetu.org / Password@123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
