import { ScheduleResult, ScheduleSlot, ScheduledExam, SubjectStats } from '../types';

// Constants for slot logic
// const SLOT_DURATION_MIN = 90; // Moved to parameter

// Helper to generate infinite sequence of slots
const generateSlot = (globalIndex: number, duration: 60 | 90): ScheduleSlot => {
  let dayName = '';
  let timeRange = '';
  let dayIndex = 0; // 0=Mon, 1=Tue, 2=Thu
  let slotInDay = 0;
  let weekIndex = 0;

  if (duration === 90) {
    // 90 MINUTE LOGIC (ORIGINAL)
    // Pattern: Mon(1), Tue(2), Thu(1) -> 4 slots per week
    const slotsPerWeek = 4;
    weekIndex = Math.floor(globalIndex / slotsPerWeek);
    const slotInWeek = globalIndex % slotsPerWeek;

    switch (slotInWeek) {
      case 0: // Monday
        dayName = 'Dilluns';
        timeRange = '15:00 - 16:30';
        dayIndex = 0;
        slotInDay = 0;
        break;
      case 1: // Tuesday Slot 1
        dayName = 'Dimarts';
        timeRange = '15:00 - 16:30';
        dayIndex = 1;
        slotInDay = 0;
        break;
      case 2: // Tuesday Slot 2
        dayName = 'Dimarts';
        timeRange = '16:30 - 18:00';
        dayIndex = 1;
        slotInDay = 1;
        break;
      case 3: // Thursday
        dayName = 'Dijous';
        timeRange = '15:00 - 16:30';
        dayIndex = 2;
        slotInDay = 0;
        break;
    }
  } else {
    // 60 MINUTE LOGIC
    // Pattern: Mon(2), Tue(3), Thu(2) -> 7 slots per week
    const slotsPerWeek = 7;
    weekIndex = Math.floor(globalIndex / slotsPerWeek);
    const slotInWeek = globalIndex % slotsPerWeek;

    switch (slotInWeek) {
      case 0: // Mon 1
        dayName = 'Dilluns';
        timeRange = '15:00 - 16:00';
        dayIndex = 0;
        slotInDay = 0;
        break;
      case 1: // Mon 2
        dayName = 'Dilluns';
        timeRange = '16:00 - 17:00';
        dayIndex = 0;
        slotInDay = 1;
        break;
      case 2: // Tue 1
        dayName = 'Dimarts';
        timeRange = '15:00 - 16:00';
        dayIndex = 1;
        slotInDay = 0;
        break;
      case 3: // Tue 2
        dayName = 'Dimarts';
        timeRange = '16:00 - 17:00';
        dayIndex = 1;
        slotInDay = 1;
        break;
      case 4: // Tue 3
        dayName = 'Dimarts';
        timeRange = '17:00 - 18:00';
        dayIndex = 1;
        slotInDay = 2;
        break;
      case 5: // Thu 1
        dayName = 'Dijous';
        timeRange = '15:00 - 16:00';
        dayIndex = 2;
        slotInDay = 0;
        break;
      case 6: // Thu 2
        dayName = 'Dijous';
        timeRange = '16:00 - 17:00';
        dayIndex = 2;
        slotInDay = 1;
        break;
    }
  }

  return {
    id: globalIndex,
    dayName,
    timeRange,
    weekIndex,
    dayIndex,
    slotInDay
  };
};

// Check if Subject A and Subject B clash based on hard constraints
const isDayIncompatible = (subA: string, subB: string): boolean => {
  const a = subA.toUpperCase();
  const b = subB.toUpperCase();

  const mathGroup = ['MATES', 'MATES CS', 'MATEMÀTIQUES'];
  const spanishGroup = ['CASTELLÀ', 'LLENGUA CASTELLANA'];
  const catalanGroup = ['CATALÀ', 'LLENGUA CATALANA'];
  const litCatalanGroup = ['LIT CATALANA', 'LITERATURA CATALANA'];
  
  const physicsGroup = ['FÍSICA'];
  
  const econGroup = ['ECONOMIA'];
  const businessGroup = ['F. EMPRESA', 'EMPRESA', 'NEGOCI'];

  const drawingGroup = ['DIBUIX', 'DIBUIX TÈCNIC'];
  // Sci-Tech excluding Math (Math is handled specifically vs Physics)
  const sciTechGroup = ['FÍSICA', 'QUÍMICA', 'BIOLOGIA', 'TECNOLOGIA', 'GEOLOGIA', 'CIÈNCIES DE LA TERRA', 'ELECTROTÈCNIA'];

  // Check Math vs Spanish
  const isMathA = mathGroup.some(m => a.includes(m));
  const isSpanA = spanishGroup.some(s => a.includes(s));
  const isMathB = mathGroup.some(m => b.includes(m));
  const isSpanB = spanishGroup.some(s => b.includes(s));

  if ((isMathA && isSpanB) || (isSpanA && isMathB)) return true;
  
  // Check Math vs Physics (Specific request)
  const isPhysA = physicsGroup.some(p => a.includes(p));
  const isPhysB = physicsGroup.some(p => b.includes(p));

  if ((isMathA && isPhysB) || (isPhysA && isMathB)) return true;

  // Check Catalan vs Spanish
  const isCatA = catalanGroup.some(c => a.includes(c));
  const isCatB = catalanGroup.some(c => b.includes(c));
  // Reuse Spanish check from above (isSpanA, isSpanB)

  if ((isCatA && isSpanB) || (isSpanA && isCatB)) return true;

  // Check Catalan vs Math
  if ((isCatA && isMathB) || (isMathA && isCatB)) return true;

  // Check Catalan vs Catalan Literature
  const isLitCatA = litCatalanGroup.some(l => a.includes(l));
  const isLitCatB = litCatalanGroup.some(l => b.includes(l));

  if ((isCatA && isLitCatB) || (isLitCatA && isCatB)) return true;

  // Check Economics vs Business
  const isEconA = econGroup.some(e => a.includes(e));
  const isBusA = businessGroup.some(bus => a.includes(bus));
  const isEconB = econGroup.some(e => b.includes(e));
  const isBusB = businessGroup.some(bus => b.includes(bus));

  if ((isEconA && isBusB) || (isBusA && isEconB)) return true;

  // Check Sci-Tech vs Sci-Tech (To encourage pairing with Troncal/Core subjects)
  // This covers Physics vs Chemistry, Bio vs Physics, etc.
  const isSciTechA = sciTechGroup.some(st => a.includes(st));
  const isSciTechB = sciTechGroup.some(st => b.includes(st));

  if (isSciTechA && isSciTechB) return true;

  // Check Technical Drawing vs Sci-Tech Field
  const isDrawA = drawingGroup.some(d => a.includes(d));
  const isDrawB = drawingGroup.some(d => b.includes(d));

  if ((isDrawA && isSciTechB) || (isSciTechA && isDrawB)) return true;

  return false;
};

// Core scheduling logic that runs on a specific order of subjects
const runSchedulerAttempt = (orderedSubjects: SubjectStats[], duration: 60 | 90): ScheduleResult => {
  const schedule: ScheduledExam[] = [];
  const unassignable: string[] = [];
  const usedSlots: ScheduleSlot[] = [];

  for (const subject of orderedSubjects) {
    let assigned = false;
    let slotIndex = 0;

    // Try to find a slot (limit search to avoid infinite loops, but high enough)
    while (!assigned && slotIndex < 150) {
      const currentSlot = generateSlot(slotIndex, duration);
      
      // 1. Check for Student Conflicts in this exact slot (Direct Overlap)
      const studentConflict = subject.students.some(studentId => {
        return schedule.some(existingExam => 
          existingExam.slotId === currentSlot.id && 
          existingExam.students.includes(studentId)
        );
      });

      if (studentConflict) {
        slotIndex++;
        continue;
      }

      // 2. Check for Daily Limit (Max 2 exams per student per day)
      // Applied to both durations as requested
      const currentDayId = `${currentSlot.weekIndex}-${currentSlot.dayIndex}`;
      
      const dailyLimitExceeded = subject.students.some(studentId => {
        let examsToday = 0;
        for (const existingExam of schedule) {
          if (existingExam.students.includes(studentId)) {
              const existingExamSlot = generateSlot(existingExam.slotId, duration);
              const existingExamDayId = `${existingExamSlot.weekIndex}-${existingExamSlot.dayIndex}`;
              if (existingExamDayId === currentDayId) {
                examsToday++;
              }
          }
        }
        return examsToday >= 2;
      });

      if (dailyLimitExceeded) {
        slotIndex++;
        continue;
      }

      // 3. Check for Day-Level Hard Constraints (Math/Spanish, Phys/Chem, Cat/Span, Cat/Math, Econ/Bus, Draw/SciTech)
      const uniqueDayId = `${currentSlot.weekIndex}-${currentSlot.dayIndex}`;
      
      const dayConflict = schedule.some(existingExam => {
        const existingSlot = generateSlot(existingExam.slotId, duration);
        const existingDayId = `${existingSlot.weekIndex}-${existingSlot.dayIndex}`;

        if (existingDayId === uniqueDayId) {
          return isDayIncompatible(subject.name, existingExam.subject);
        }
        return false;
      });

      if (dayConflict) {
        slotIndex++;
        continue;
      }

      // If we got here, it's valid
      schedule.push({
        subject: subject.name,
        slotId: currentSlot.id,
        students: subject.students
      });
      
      if (!usedSlots.some(s => s.id === currentSlot.id)) {
        usedSlots.push(currentSlot);
      }

      assigned = true;
    }

    if (!assigned) {
      unassignable.push(subject.name);
    }
  }

  // Calculate metrics
  const uniqueDays = new Set(schedule.map(s => {
    const slot = generateSlot(s.slotId, duration);
    return `${slot.weekIndex}-${slot.dayIndex}`;
  }));

  usedSlots.sort((a, b) => a.id - b.id);

  return {
    schedule,
    totalDays: uniqueDays.size,
    slots: usedSlots,
    unassignable
  };
};

const groupMathSubjects = (stats: SubjectStats[]): SubjectStats[] => {
  const mathKeys = ['MATES', 'MATES CS', 'MATEMÀTIQUES'];
  
  // Identify math subjects
  const mathSubjects = stats.filter(s => mathKeys.some(k => s.name.toUpperCase().includes(k)));
  
  // If 0 or 1 math subject, no grouping needed
  if (mathSubjects.length <= 1) return stats;

  const otherSubjects = stats.filter(s => !mathKeys.some(k => s.name.toUpperCase().includes(k)));
  
  // Combine students from all math subjects
  const allMathStudents = new Set<string>();
  mathSubjects.forEach(s => s.students.forEach(student => allMathStudents.add(student)));
  
  // Create merged subject
  // Using a name that contains 'MATEMÀTIQUES' ensures it triggers the conflict checks in isDayIncompatible
  const combinedMath: SubjectStats = {
    name: 'MATEMÀTIQUES / MATES CS', 
    count: allMathStudents.size,
    students: Array.from(allMathStudents)
  };

  return [...otherSubjects, combinedMath];
};

// Modified to return an array of results
export const generateSchedule = (subjectStats: SubjectStats[], duration: 60 | 90 = 90): ScheduleResult[] => {
  // Pre-process to group Math subjects
  const processedStats = groupMathSubjects(subjectStats);

  // Strategy 1: Sort by Student Count (Descending)
  const byCount = [...processedStats].sort((a, b) => b.count - a.count);
  
  // Strategy 2: Conflict Degree
  const conflictScores = new Map<string, number>();
  processedStats.forEach(subA => {
    let score = 0;
    processedStats.forEach(subB => {
      if (subA.name === subB.name) return;
      const shared = subA.students.filter(s => subB.students.includes(s)).length;
      score += shared;
    });
    conflictScores.set(subA.name, score);
  });
  
  const byConflict = [...processedStats].sort((a, b) => {
    const scoreA = conflictScores.get(a.name) || 0;
    const scoreB = conflictScores.get(b.name) || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.count - a.count;
  });

  let candidates: ScheduleResult[] = [];
  
  candidates.push(runSchedulerAttempt(byCount, duration));
  candidates.push(runSchedulerAttempt(byConflict, duration));

  // Strategy 3: Random Restarts (Increased count to find more variations)
  for (let i = 0; i < 1000; i++) {
    const shuffled = [...processedStats].sort(() => Math.random() - 0.5);
    candidates.push(runSchedulerAttempt(shuffled, duration));
  }

  // Deduplicate candidates based on signature (subject -> slotId)
  const uniqueCandidates: ScheduleResult[] = [];
  const seenSignatures = new Set<string>();

  // Sort candidates first by quality so we keep the best unique ones
  candidates.sort((a, b) => {
    // 1. Fewer unassigned subjects
    if (a.unassignable.length !== b.unassignable.length) {
      return a.unassignable.length - b.unassignable.length;
    }
    // 2. Fewer total days
    if (a.totalDays !== b.totalDays) {
        return a.totalDays - b.totalDays;
    }
    // 3. More compact (lower max slot ID)
    const maxA = a.slots.length > 0 ? a.slots[a.slots.length - 1].id : 0;
    const maxB = b.slots.length > 0 ? b.slots[b.slots.length - 1].id : 0;
    return maxA - maxB;
  });

  for (const cand of candidates) {
      // Create a unique string key for this schedule configuration
      // Sort exams by subject to ensure consistent key regardless of array order
      const signature = cand.schedule
        .map(s => `${s.subject}:${s.slotId}`)
        .sort()
        .join('|');
      
      if (!seenSignatures.has(signature)) {
          seenSignatures.add(signature);
          uniqueCandidates.push(cand);
      }

      // Limit to top 10 unique valid options
      if (uniqueCandidates.length >= 10) break;
  }

  return uniqueCandidates;
};