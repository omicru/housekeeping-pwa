import { createContext, useContext, useMemo, useState } from 'react';
import {
  ActivityLog,
  AppSettings,
  AppUser,
  DailyRoomAssignment,
  FacchinoTask,
  IssueReport,
  LinenEntry,
  WorkState
} from './types';
import { demoIssues, demoLinenEntries, demoRooms, demoSettings, demoTasks, demoUsers } from '../data/demoData';

interface LinenPayload {
  federe: number;
  lenzuolo: number;
  coprilenzuolo: number;
  asciugamaniViso: number;
  asciugamaniGrandi: number;
  asciugamaniBidet: number;
}

interface AppContextShape {
  currentUser: AppUser | null;
  users: AppUser[];
  rooms: DailyRoomAssignment[];
  tasks: FacchinoTask[];
  issues: IssueReport[];
  linenEntries: LinenEntry[];
  settings: AppSettings;
  activity: ActivityLog[];
  login: (email: string) => boolean;
  logout: () => void;
  updateRoom: (roomId: string, patch: Partial<DailyRoomAssignment>, actorId: string) => void;
  startRoom: (roomId: string, actorId: string) => void;
  completeRoom: (roomId: string, linen: LinenPayload, actorId: string) => void;
  reportIssue: (issue: Omit<IssueReport, 'id' | 'createdAt' | 'date'>, actorId: string) => void;
  startTask: (taskId: string, actorId: string) => void;
  completeTask: (taskId: string, actorId: string) => void;
  createWorkday: () => void;
}

const AppContext = createContext<AppContextShape | undefined>(undefined);

const day = new Date().toISOString().slice(0, 10);

export function AppProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [rooms, setRooms] = useState<DailyRoomAssignment[]>(demoRooms);
  const [tasks, setTasks] = useState<FacchinoTask[]>(demoTasks);
  const [issues, setIssues] = useState<IssueReport[]>(demoIssues);
  const [linenEntries, setLinenEntries] = useState<LinenEntry[]>(demoLinenEntries);
  const [settings] = useState<AppSettings>(demoSettings);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  const logAction = (userId: string, action: string, targetType: ActivityLog['targetType'], targetId: string, detail: string): void => {
    setActivity((prev) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        userId,
        action,
        targetType,
        targetId,
        detail
      },
      ...prev
    ]);
  };

  const updateRoom = (roomId: string, patch: Partial<DailyRoomAssignment>, actorId: string): void => {
    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, ...patch, modified: true, lastUpdatedAt: new Date().toISOString() } : room))
    );
    logAction(actorId, 'room_updated', 'room', roomId, 'Aggiornamento camera');
  };

  const updateRoomFlow = (roomId: string, actorId: string, workflowStatus: WorkState): void => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const now = new Date().toISOString();
        if (workflowStatus === 'in_corso') {
          return { ...room, workflowStatus, startedAt: now, lastUpdatedAt: now };
        }
        return { ...room, workflowStatus, completedAt: now, completedBy: actorId, lastUpdatedAt: now };
      })
    );
  };

  const startRoom = (roomId: string, actorId: string): void => {
    updateRoomFlow(roomId, actorId, 'in_corso');
    logAction(actorId, 'room_started', 'room', roomId, 'Camera iniziata');
  };

  const completeRoom = (roomId: string, linen: LinenPayload, actorId: string): void => {
    updateRoomFlow(roomId, actorId, 'completata');
    setLinenEntries((prev) => [
      {
        id: crypto.randomUUID(),
        roomAssignmentId: roomId,
        userId: actorId,
        createdAt: new Date().toISOString(),
        ...linen
      },
      ...prev
    ]);
    logAction(actorId, 'room_completed', 'room', roomId, `Camera completata con biancheria: ${JSON.stringify(linen)}`);
  };

  const reportIssue = (issue: Omit<IssueReport, 'id' | 'createdAt' | 'date'>, actorId: string): void => {
    const created = { ...issue, id: crypto.randomUUID(), createdAt: new Date().toISOString(), date: day };
    setIssues((prev) => [created, ...prev]);
    logAction(actorId, 'issue_reported', 'issue', created.id, created.category);
  };

  const startTask = (taskId: string, actorId: string): void => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: 'in_corso', updatedAt: new Date().toISOString() } : task))
    );
    logAction(actorId, 'task_started', 'task', taskId, 'Task in corso');
  };

  const completeTask = (taskId: string, actorId: string): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: 'fatto', completedBy: actorId, updatedAt: new Date().toISOString() } : task
      )
    );
    logAction(actorId, 'task_completed', 'task', taskId, 'Task completato');
  };

  const createWorkday = (): void => {
    setRooms((prev) => prev.map((room) => ({ ...room, date: day })));
    setTasks((prev) => prev.map((task) => ({ ...task, date: day })));
  };

  const value = useMemo(
    () => ({
      currentUser,
      users: demoUsers,
      rooms,
      tasks,
      issues,
      linenEntries,
      settings,
      activity,
      login: (email: string) => {
        const user = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.isActive);
        if (!user) return false;
        setCurrentUser(user);
        return true;
      },
      logout: () => setCurrentUser(null),
      updateRoom,
      startRoom,
      completeRoom,
      reportIssue,
      startTask,
      completeTask,
      createWorkday
    }),
    [activity, currentUser, issues, linenEntries, rooms, settings, tasks]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = (): AppContextShape => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside provider');
  return ctx;
};
