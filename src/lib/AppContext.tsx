import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import {
  AppUser,
  DailyRoomAssignment,
  FacchinoTask,
  HotelRoom,
  LinenUsage,
  MinibarUsage,
  RoomCompletion,
  RoomWorkStatus,
  Workday,
  emptyLinenUsage,
  emptyMinibarUsage
} from './types';

interface CompletionDraft {
  assignmentId: string;
  linen: LinenUsage;
  minibar: MinibarUsage;
}

interface AppContextShape {
  session: Session | null;
  currentUser: AppUser | null;
  users: AppUser[];
  rooms: HotelRoom[];
  workdays: Workday[];
  activeWorkday: Workday | null;
  assignments: DailyRoomAssignment[];
  facchinoTasks: FacchinoTask[];
  completions: RoomCompletion[];
  loading: boolean;
  authError: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getRoomById: (roomId: string) => HotelRoom | undefined;
  createWorkday: (workDate: string) => Promise<void>;
  setActiveWorkday: (workdayId: string) => Promise<void>;
  assignRoomsBulk: (roomIds: string[], camerieraId: string) => Promise<void>;
  setRoomStatus: (assignmentId: string, status: RoomWorkStatus) => Promise<void>;
  completeRoomWithUsage: (assignmentId: string, linen: LinenUsage, minibar: MinibarUsage, userId: string) => Promise<void>;
  updateFacchinoTaskStatus: (taskId: string, status: FacchinoTask['status']) => Promise<void>;
  createFacchinoTask: (payload: { title: string; zone: string; priority: 'bassa' | 'media' | 'alta'; assignedToProfileId: string; suggestedTime?: string }) => Promise<void>;
  createCompletionDraft: (assignmentId: string) => CompletionDraft;
}

const AppContext = createContext<AppContextShape | undefined>(undefined);

function mapProfile(row: any): AppUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

function mapRoom(row: any): HotelRoom {
  return {
    id: row.id,
    roomNumber: row.room_number,
    floor: row.floor,
    roomType: row.room_type,
    peopleCapacity: row.people_capacity,
    hasMinibar: row.has_minibar,
    isActive: row.is_active
  };
}

function mapWorkday(row: any): Workday {
  return {
    id: row.id,
    workDate: row.work_date,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at
  };
}

function mapAssignment(row: any): DailyRoomAssignment {
  return {
    id: row.id,
    workdayId: row.workday_id,
    roomId: row.room_id,
    assignedCamerieraId: row.assigned_to_profile_id ?? undefined,
    status: row.workflow_status,
    housekeepingStatus: row.housekeeping_status,
    peopleCount: row.people_count,
    extraBed: row.extra_bed,
    balcony: row.balcony,
    urgent: row.urgent,
    vip: row.vip,
    supervisorNote: row.notes ?? undefined,
    updatedAt: row.updated_at
  };
}

function mapTask(row: any): FacchinoTask {
  return {
    id: row.id,
    workdayId: row.workday_id,
    title: row.title,
    area: row.zone,
    priority: row.priority,
    assignedFacchinoId: row.assigned_to_profile_id,
    suggestedTime: row.suggested_time ?? undefined,
    status: row.workflow_status,
    note: row.notes ?? undefined,
    updatedAt: row.updated_at
  };
}

function mapCompletion(row: any): RoomCompletion {
  return {
    id: `${row.linen_id}-${row.minibar_id}`,
    assignmentId: row.assignment_id,
    roomId: row.room_id,
    date: row.work_date,
    userId: row.recorded_by,
    linen: {
      federe: row.federe,
      lenzuolo: row.lenzuolo,
      coprilenzuolo: row.coprilenzuolo,
      asciugamaniViso: row.asciugamani_viso,
      asciugamaniGrandi: row.asciugamani_grandi,
      asciugamaniBidet: row.asciugamani_bidet
    },
    minibar: {
      acquaNaturale: row.acqua_naturale,
      acquaFrizzante: row.acqua_frizzante,
      cocaCola: row.coca_cola,
      estathe: row.estathe,
      fanta: row.fanta,
      succo: row.succo,
      snackDolce: row.snack_dolce,
      snackSalato: row.snack_salato,
      prosecco: row.prosecco
    },
    createdAt: row.recorded_at
  };
}

export function AppProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [workdays, setWorkdays] = useState<Workday[]>([]);
  const [activeWorkday, setActiveWorkdayState] = useState<Workday | null>(null);
  const [assignments, setAssignments] = useState<DailyRoomAssignment[]>([]);
  const [facchinoTasks, setFacchinoTasks] = useState<FacchinoTask[]>([]);
  const [completions, setCompletions] = useState<RoomCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const refreshData = useCallback(async () => {
    if (!supabase || !session?.user) return;

    const [{ data: profile }, { data: roomsData }, { data: workdaysData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
      supabase.from('hotel_rooms').select('*').eq('is_active', true).order('room_number'),
      supabase.from('workdays').select('*').order('work_date', { ascending: false }).limit(14)
    ]);

    if (profile) {
      setCurrentUser(mapProfile(profile));
    }

    setRooms((roomsData ?? []).map(mapRoom));
    const mappedWorkdays = (workdaysData ?? []).map(mapWorkday);
    setWorkdays(mappedWorkdays);
    const active = mappedWorkdays.find((item) => item.status === 'attivo') ?? mappedWorkdays[0] ?? null;
    setActiveWorkdayState(active);

    if (!active) {
      setAssignments([]);
      setFacchinoTasks([]);
      setCompletions([]);
      return;
    }

    const [{ data: usersData }, { data: assignmentData }, { data: taskData }, { data: completionData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('is_active', true).order('full_name'),
      supabase.from('room_assignments').select('*').eq('workday_id', active.id),
      supabase.from('facchino_tasks').select('*').eq('workday_id', active.id),
      supabase
        .from('v_room_completions')
        .select('*')
        .eq('workday_id', active.id)
    ]);

    setUsers((usersData ?? []).map(mapProfile));
    setAssignments((assignmentData ?? []).map(mapAssignment));
    setFacchinoTasks((taskData ?? []).map(mapTask));
    setCompletions((completionData ?? []).map(mapCompletion));
  }, [session?.user, session]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user || !supabase) {
      setCurrentUser(null);
      setUsers([]);
      setAssignments([]);
      setFacchinoTasks([]);
      setCompletions([]);
      return;
    }

    const client = supabase;
    setLoading(true);
    refreshData().finally(() => setLoading(false));

    const channel = client
      .channel('housekeeping-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_assignments' }, refreshData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'facchino_tasks' }, refreshData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'linen_entries' }, refreshData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'minibar_entries' }, refreshData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workdays' }, refreshData)
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [session?.user, refreshData]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      setAuthError('Config Supabase mancante.');
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return false;
    }
    setAuthError('');
    return true;
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const createWorkday = useCallback(
    async (workDate: string) => {
      if (!supabase || !currentUser) return;

      await supabase.from('workdays').update({ status: 'chiuso' }).eq('status', 'attivo');
      const { data: created } = await supabase
        .from('workdays')
        .insert({ work_date: workDate, created_by: currentUser.id, status: 'attivo' })
        .select('*')
        .single();

      if (!created) return;
      const { data: roomData } = await supabase.from('hotel_rooms').select('id').eq('is_active', true);
      if ((roomData?.length ?? 0) > 0) {
        await supabase.from('room_assignments').insert(
          roomData!.map((room) => ({
            workday_id: created.id,
            room_id: room.id,
            housekeeping_status: 'da_fare',
            workflow_status: 'da_fare',
            people_count: 2,
            extra_bed: false,
            balcony: false,
            urgent: false,
            vip: false
          }))
        );
      }
      await refreshData();
    },
    [currentUser, refreshData]
  );

  const setActiveWorkday = useCallback(
    async (workdayId: string) => {
      if (!supabase) return;
      await supabase.from('workdays').update({ status: 'chiuso' }).neq('id', workdayId);
      await supabase.from('workdays').update({ status: 'attivo' }).eq('id', workdayId);
      await refreshData();
    },
    [refreshData]
  );

  const assignRoomsBulk = useCallback(
    async (roomIds: string[], camerieraId: string) => {
      if (!supabase || !activeWorkday) return;
      const now = new Date().toISOString();
      await supabase
        .from('room_assignments')
        .update({ assigned_to_profile_id: camerieraId, workflow_status: 'da_fare', updated_at: now })
        .eq('workday_id', activeWorkday.id)
        .in('room_id', roomIds)
        .neq('workflow_status', 'completata');
    },
    [activeWorkday]
  );

  const setRoomStatus = useCallback(async (assignmentId: string, status: RoomWorkStatus) => {
    if (!supabase) return;
    const payload = {
      workflow_status: status,
      updated_at: new Date().toISOString()
    } as Record<string, string>;
    if (status === 'in_corso') payload.started_at = new Date().toISOString();
    if (status === 'da_fare') payload.started_at = null as unknown as string;
    await supabase.from('room_assignments').update(payload).eq('id', assignmentId);
  }, []);

  const completeRoomWithUsage = useCallback(
    async (assignmentId: string, linen: LinenUsage, minibar: MinibarUsage, userId: string) => {
      if (!supabase) return;
      const now = new Date().toISOString();
      await Promise.all([
        supabase.from('linen_entries').insert({
          room_assignment_id: assignmentId,
          federe: linen.federe,
          lenzuolo: linen.lenzuolo,
          coprilenzuolo: linen.coprilenzuolo,
          asciugamani_viso: linen.asciugamaniViso,
          asciugamani_grandi: linen.asciugamaniGrandi,
          asciugamani_bidet: linen.asciugamaniBidet,
          recorded_by: userId,
          recorded_at: now
        }),
        supabase.from('minibar_entries').insert({
          room_assignment_id: assignmentId,
          acqua_naturale: minibar.acquaNaturale,
          acqua_frizzante: minibar.acquaFrizzante,
          coca_cola: minibar.cocaCola,
          estathe: minibar.estathe,
          fanta: minibar.fanta,
          succo: minibar.succo,
          snack_dolce: minibar.snackDolce,
          snack_salato: minibar.snackSalato,
          prosecco: minibar.prosecco,
          recorded_by: userId,
          recorded_at: now
        }),
        supabase
          .from('room_assignments')
          .update({ workflow_status: 'completata', updated_at: now })
          .eq('id', assignmentId)
      ]);
    },
    []
  );

  const updateFacchinoTaskStatus = useCallback(async (taskId: string, status: FacchinoTask['status']) => {
    if (!supabase) return;
    await supabase.from('facchino_tasks').update({ workflow_status: status, updated_at: new Date().toISOString() }).eq('id', taskId);
  }, []);

  const createFacchinoTask = useCallback(
    async (payload: { title: string; zone: string; priority: 'bassa' | 'media' | 'alta'; assignedToProfileId: string; suggestedTime?: string }) => {
      if (!supabase || !activeWorkday) return;
      await supabase.from('facchino_tasks').insert({
        workday_id: activeWorkday.id,
        title: payload.title,
        zone: payload.zone,
        priority: payload.priority,
        suggested_time: payload.suggestedTime ?? null,
        workflow_status: 'da_fare',
        assigned_to_profile_id: payload.assignedToProfileId
      });
    },
    [activeWorkday]
  );

  const value = useMemo(
    () => ({
      session,
      currentUser,
      users,
      rooms,
      workdays,
      activeWorkday,
      assignments,
      facchinoTasks,
      completions,
      loading,
      authError,
      login,
      logout,
      getRoomById: (roomId: string) => rooms.find((room) => room.id === roomId),
      createWorkday,
      setActiveWorkday,
      assignRoomsBulk,
      setRoomStatus,
      completeRoomWithUsage,
      updateFacchinoTaskStatus,
      createFacchinoTask,
      createCompletionDraft: (assignmentId: string) => ({ assignmentId, linen: emptyLinenUsage(), minibar: emptyMinibarUsage() })
    }),
    [
      session,
      currentUser,
      users,
      rooms,
      workdays,
      activeWorkday,
      assignments,
      facchinoTasks,
      completions,
      loading,
      authError,
      login,
      logout,
      createWorkday,
      setActiveWorkday,
      assignRoomsBulk,
      setRoomStatus,
      completeRoomWithUsage,
      updateFacchinoTaskStatus,
      createFacchinoTask
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = (): AppContextShape => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside provider');
  return ctx;
};
