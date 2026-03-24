import { createContext, useContext, useMemo, useState } from 'react';
import {
  AppUser,
  DailyRoomAssignment,
  FacchinoTask,
  HotelRoom,
  LinenUsage,
  MinibarUsage,
  RoomCompletion,
  RoomWorkStatus
} from './types';
import {
  demoAssignments,
  demoCompletions,
  demoFacchinoTasks,
  demoRooms,
  demoUsers,
  emptyLinenUsage,
  emptyMinibarUsage
} from '../data/demoData';

interface CompletionDraft {
  assignmentId: string;
  linen: LinenUsage;
  minibar: MinibarUsage;
}

interface AppContextShape {
  currentUser: AppUser | null;
  users: AppUser[];
  rooms: HotelRoom[];
  assignments: DailyRoomAssignment[];
  facchinoTasks: FacchinoTask[];
  completions: RoomCompletion[];
  login: (email: string) => boolean;
  logout: () => void;
  getRoomById: (roomId: string) => HotelRoom | undefined;
  assignRoomsBulk: (roomIds: string[], camerieraId: string) => void;
  setRoomStatus: (assignmentId: string, status: RoomWorkStatus) => void;
  completeRoomWithUsage: (assignmentId: string, linen: LinenUsage, minibar: MinibarUsage, userId: string) => void;
  updateFacchinoTaskStatus: (taskId: string, status: FacchinoTask['status']) => void;
  createCompletionDraft: (assignmentId: string) => CompletionDraft;
}

const AppContext = createContext<AppContextShape | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [assignments, setAssignments] = useState<DailyRoomAssignment[]>(demoAssignments);
  const [facchinoTasks, setFacchinoTasks] = useState<FacchinoTask[]>(demoFacchinoTasks);
  const [completions, setCompletions] = useState<RoomCompletion[]>(demoCompletions);

  const assignRoomsBulk = (roomIds: string[], camerieraId: string): void => {
    const now = new Date().toISOString();
    const roomIdSet = new Set(roomIds);
    setAssignments((prev) =>
      prev.map((assignment) =>
        roomIdSet.has(assignment.roomId)
          ? {
              ...assignment,
              assignedCamerieraId: camerieraId,
              status: assignment.status === 'completata' ? assignment.status : 'da_fare',
              startedAt: undefined,
              updatedAt: now
            }
          : assignment
      )
    );
  };

  const setRoomStatus = (assignmentId: string, status: RoomWorkStatus): void => {
    const now = new Date().toISOString();
    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.id !== assignmentId) return assignment;
        if (status === 'in_corso') {
          return { ...assignment, status, startedAt: now, updatedAt: now };
        }
        if (status === 'da_fare') {
          return { ...assignment, status, startedAt: undefined, updatedAt: now };
        }
        return assignment;
      })
    );
  };

  const completeRoomWithUsage = (assignmentId: string, linen: LinenUsage, minibar: MinibarUsage, userId: string): void => {
    const now = new Date().toISOString();
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, status: 'completata', completedBy: userId, completedAt: now, updatedAt: now } : assignment
      )
    );

    const completedAssignment = assignments.find((assignment) => assignment.id === assignmentId);
    if (!completedAssignment) return;

    setCompletions((prev) => [
      {
        id: crypto.randomUUID(),
        assignmentId,
        roomId: completedAssignment.roomId,
        date: completedAssignment.date,
        userId,
        linen,
        minibar,
        createdAt: now
      },
      ...prev
    ]);
  };

  const updateFacchinoTaskStatus = (taskId: string, status: FacchinoTask['status']): void => {
    setFacchinoTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task))
    );
  };

  const value = useMemo(
    () => ({
      currentUser,
      users: demoUsers,
      rooms: demoRooms,
      assignments,
      facchinoTasks,
      completions,
      login: (email: string) => {
        const user = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
        if (!user) return false;
        setCurrentUser(user);
        return true;
      },
      logout: () => setCurrentUser(null),
      getRoomById: (roomId: string) => demoRooms.find((room) => room.id === roomId),
      assignRoomsBulk,
      setRoomStatus,
      completeRoomWithUsage,
      updateFacchinoTaskStatus,
      createCompletionDraft: (assignmentId: string) => ({ assignmentId, linen: emptyLinenUsage(), minibar: emptyMinibarUsage() })
    }),
    [assignments, completions, currentUser, facchinoTasks]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = (): AppContextShape => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside provider');
  return ctx;
};
