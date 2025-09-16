import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Daily } from '@/domain/entities/daily';
import type { DailyPeriod } from '@/domain/entities/daily-period';
import { DailyService } from '@/services/daily-service';

describe('Integração - Fluxo Completo de Reativação de Tarefas Diárias', () => {
  let dailyService: DailyService;
  let mockDailyRepository: any;
  let mockDailyLogRepository: any;
  let mockDailyPeriodRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockDailyRepository = {
      findByUserId: vi.fn(),
      deleteByUserId: vi.fn(),
      findById: vi.fn(),
      markComplete: vi.fn(),
      markIncomplete: vi.fn(),
      toggleComplete: vi.fn(),
      reorder: vi.fn(),
      moveToPosition: vi.fn(),
      findByTags: vi.fn(),
      findByTag: vi.fn(),
      getTagStats: vi.fn(),
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockDailyLogRepository = {
      create: vi.fn(),
      list: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByEntityId: vi.fn(),
      findByDateRange: vi.fn(),
      deleteOlderThan: vi.fn(),
    };

    mockDailyPeriodRepository = {
      findActiveByDailyId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByDailyId: vi.fn(),
      completeAndFinalize: vi.fn(),
    };
    
    dailyService = new DailyService(
      mockDailyRepository,
      mockDailyLogRepository,
      mockDailyPeriodRepository
    );
  });

  describe('Fluxo de Reativação Diária', () => {
    it('deve garantir que tarefa diária reapareça no próximo dia após conclusão', async () => {
      // Arrange
      const exerciseDaily: Daily = {
        id: 'exercise-daily',
        title: 'Exercitar-se',
        observations: 'Fazer 30 minutos de exercício',
        tasks: ['Aquecimento', 'Exercício principal', 'Alongamento'],
        difficulty: 'Médio',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Diariamente',
          frequency: 1,
        },
        tags: ['saúde', 'exercício'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      // Dia 1: Tarefa está disponível (primeira vez)
      const day1 = new Date('2024-01-01T08:00:00');
      vi.setSystemTime(day1);

      mockDailyRepository.findByUserId.mockResolvedValue([exerciseDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(null);

      let result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);
      expect(result.completedToday).toHaveLength(0);

      // Dia 1: Usuário completa a tarefa
      const completedDaily = { ...exerciseDaily, lastCompletedDate: '2024-01-01' };
      mockDailyRepository.markComplete.mockResolvedValue(completedDaily);
      
      const nextPeriod: DailyPeriod = {
        id: 'period-next',
        dailyId: 'exercise-daily',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
        isCompleted: false,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(nextPeriod);

      const completionResult = await dailyService.completeDaily('exercise-daily');
      expect(completionResult.daily.lastCompletedDate).toBe('2024-01-01');
      expect(completionResult.nextAvailableAt).toEqual(nextPeriod.startDate);

      // Dia 1: Verificar que tarefa agora aparece como completada hoje
      const completedPeriodDay1: DailyPeriod = {
        id: 'period-day1',
        dailyId: 'exercise-daily',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriodDay1);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(0);
      expect(result.completedToday).toHaveLength(1);

      // Dia 2: Tarefa deve reaparecer como disponível
      const day2 = new Date('2024-01-02T08:00:00');
      vi.setSystemTime(day2);

      // Simular que o período anterior expirou
      const expiredPeriod: DailyPeriod = {
        ...completedPeriodDay1,
        endDate: new Date('2024-01-01T23:59:59'), // Ontem
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredPeriod);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('exercise-daily');
      expect(result.completedToday).toHaveLength(0);
    });

    it('deve garantir que tarefa semanal reapareça na próxima semana', async () => {
      // Arrange
      const weeklyCleaningDaily: Daily = {
        id: 'weekly-cleaning',
        title: 'Limpeza Semanal',
        observations: 'Limpeza geral da casa',
        tasks: ['Aspirar', 'Passar pano', 'Organizar'],
        difficulty: 'Médio',
        startDate: new Date('2024-01-01'), // Segunda-feira
        repeat: {
          type: 'Semanalmente',
          frequency: 1,
        },
        tags: ['casa', 'limpeza'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      // Semana 1: Tarefa está disponível
      const week1Monday = new Date('2024-01-01T09:00:00');
      vi.setSystemTime(week1Monday);

      mockDailyRepository.findByUserId.mockResolvedValue([weeklyCleaningDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(null);

      let result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);

      // Semana 1: Usuário completa a tarefa na quarta-feira
      const week1Wednesday = new Date('2024-01-03T14:00:00');
      vi.setSystemTime(week1Wednesday);

      const completedWeeklyDaily = { ...weeklyCleaningDaily, lastCompletedDate: '2024-01-03' };
      mockDailyRepository.markComplete.mockResolvedValue(completedWeeklyDaily);

      const nextWeekPeriod: DailyPeriod = {
        id: 'period-week2',
        dailyId: 'weekly-cleaning',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-08T00:00:00'), // Próxima segunda
        endDate: new Date('2024-01-14T23:59:59'), // Próximo domingo
        isCompleted: false,
        isActive: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(nextWeekPeriod);

      const completionResult = await dailyService.completeDaily('weekly-cleaning');
      expect(completionResult.nextAvailableAt).toEqual(nextWeekPeriod.startDate);

      // Semana 1: Resto da semana - tarefa deve aparecer como completada
      const completedWeekPeriod: DailyPeriod = {
        id: 'period-week1',
        dailyId: 'weekly-cleaning',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-03T00:00:00'),
        endDate: new Date('2024-01-09T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedWeekPeriod);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.completedToday).toHaveLength(1);

      // Semana 2: Tarefa deve reaparecer como disponível
      const week2Monday = new Date('2024-01-08T09:00:00');
      vi.setSystemTime(week2Monday);

      const expiredWeekPeriod: DailyPeriod = {
        ...completedWeekPeriod,
        endDate: new Date('2024-01-07T23:59:59'), // Semana passada
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredWeekPeriod);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('weekly-cleaning');
      expect(result.completedToday).toHaveLength(0);
    });

    it('deve garantir que tarefa mensal reapareça no próximo mês', async () => {
      // Arrange
      const monthlyReviewDaily: Daily = {
        id: 'monthly-review',
        title: 'Revisão Mensal',
        observations: 'Revisão de metas e progresso mensal',
        tasks: ['Analisar metas', 'Revisar progresso', 'Planejar próximo mês'],
        difficulty: 'Difícil',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Mensalmente',
          frequency: 1,
        },
        tags: ['planejamento', 'metas'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      // Janeiro: Tarefa está disponível
      const january15 = new Date('2024-01-15T10:00:00');
      vi.setSystemTime(january15);

      mockDailyRepository.findByUserId.mockResolvedValue([monthlyReviewDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(null);

      let result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);

      // Janeiro: Usuário completa a tarefa
      const completedMonthlyDaily = { ...monthlyReviewDaily, lastCompletedDate: '2024-01-15' };
      mockDailyRepository.markComplete.mockResolvedValue(completedMonthlyDaily);

      const nextMonthPeriod: DailyPeriod = {
        id: 'period-february',
        dailyId: 'monthly-review',
        periodType: 'Mensalmente',
        startDate: new Date('2024-02-01T00:00:00'),
        endDate: new Date('2024-02-29T23:59:59'),
        isCompleted: false,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(nextMonthPeriod);

      const completionResult = await dailyService.completeDaily('monthly-review');
      expect(completionResult.nextAvailableAt).toEqual(nextMonthPeriod.startDate);

      // Janeiro: Resto do mês - tarefa deve aparecer como completada
      const completedJanuaryPeriod: DailyPeriod = {
        id: 'period-january',
        dailyId: 'monthly-review',
        periodType: 'Mensalmente',
        startDate: new Date('2024-01-15T00:00:00'),
        endDate: new Date('2024-01-31T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedJanuaryPeriod);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.completedToday).toHaveLength(1);

      // Fevereiro: Tarefa deve reaparecer como disponível
      const february1 = new Date('2024-02-01T10:00:00');
      vi.setSystemTime(february1);

      const expiredJanuaryPeriod: DailyPeriod = {
        ...completedJanuaryPeriod,
        endDate: new Date('2024-01-31T23:59:59'), // Mês passado
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredJanuaryPeriod);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('monthly-review');
      expect(result.completedToday).toHaveLength(0);
    });
  });

  describe('Cenários de Múltiplas Tarefas com Diferentes Períodos', () => {
    it('deve gerenciar múltiplas tarefas com períodos diferentes simultaneamente', async () => {
      // Arrange
      const dailyExercise: Daily = {
        id: 'daily-exercise',
        title: 'Exercício Diário',
        observations: 'Exercício todos os dias',
        tasks: ['Exercitar'],
        difficulty: 'Médio',
        startDate: new Date('2024-01-01'),
        repeat: { type: 'Diariamente', frequency: 1 },
        tags: ['saúde'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      const weeklyMeeting: Daily = {
        id: 'weekly-meeting',
        title: 'Reunião Semanal',
        observations: 'Reunião de equipe',
        tasks: ['Participar da reunião'],
        difficulty: 'Fácil',
        startDate: new Date('2024-01-01'), // Segunda-feira
        repeat: { type: 'Semanalmente', frequency: 1 },
        tags: ['trabalho'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 2,
        subtasks: [],
      };

      const monthlyReport: Daily = {
        id: 'monthly-report',
        title: 'Relatório Mensal',
        observations: 'Relatório de atividades',
        tasks: ['Escrever relatório'],
        difficulty: 'Difícil',
        startDate: new Date('2024-01-01'),
        repeat: { type: 'Mensalmente', frequency: 1 },
        tags: ['trabalho', 'relatório'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 3,
        subtasks: [],
      };

      // Cenário: Segunda-feira da primeira semana
      const monday = new Date('2024-01-01T09:00:00');
      vi.setSystemTime(monday);

      mockDailyRepository.findByUserId.mockResolvedValue([dailyExercise, weeklyMeeting, monthlyReport]);
      
      // Todas as tarefas estão disponíveis (primeira execução)
      mockDailyPeriodRepository.findActiveByDailyId
        .mockResolvedValueOnce(null) // daily-exercise
        .mockResolvedValueOnce(null) // weekly-meeting
        .mockResolvedValueOnce(null); // monthly-report

      let result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(3);
      expect(result.completedToday).toHaveLength(0);
      expect(result.totalDailies).toBe(3);

      // Cenário: Terça-feira - apenas exercício diário deve estar disponível
      const tuesday = new Date('2024-01-02T09:00:00');
      vi.setSystemTime(tuesday);

      // Exercício diário: período anterior expirou, deve estar disponível
      const expiredDailyPeriod: DailyPeriod = {
        id: 'period-daily-1',
        dailyId: 'daily-exercise',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      // Reunião semanal: ainda no mesmo período, completada
      const activeWeeklyPeriod: DailyPeriod = {
        id: 'period-weekly-1',
        dailyId: 'weekly-meeting',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      // Relatório mensal: ainda no mesmo período, completado
      const activeMonthlyPeriod: DailyPeriod = {
        id: 'period-monthly-1',
        dailyId: 'monthly-report',
        periodType: 'Mensalmente',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDailyPeriodRepository.findActiveByDailyId
        .mockResolvedValueOnce(expiredDailyPeriod) // daily-exercise
        .mockResolvedValueOnce(activeWeeklyPeriod) // weekly-meeting
        .mockResolvedValueOnce(activeMonthlyPeriod); // monthly-report

      result = await dailyService.getAvailableDailies('user-1');
      
      // Apenas o exercício diário deve estar disponível
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('daily-exercise');
      expect(result.completedToday).toHaveLength(0);

      // Cenário: Segunda-feira da próxima semana
      const nextMondayWeek2 = new Date('2024-01-08T09:00:00');
      vi.setSystemTime(nextMondayWeek2);

      // Exercício diário: novo período expirado
      const expiredDailyPeriod2: DailyPeriod = {
        id: 'period-daily-2',
        dailyId: 'daily-exercise',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-07'),
        endDate: new Date('2024-01-07T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-07'),
        updatedAt: new Date('2024-01-07'),
      };

      // Reunião semanal: período anterior expirou
      const expiredWeeklyPeriod: DailyPeriod = {
        ...activeWeeklyPeriod,
        endDate: new Date('2024-01-07T23:59:59'), // Domingo passado
      };

      // Relatório mensal: ainda no mesmo período
      const stillActiveMonthlyPeriod: DailyPeriod = {
        ...activeMonthlyPeriod,
        endDate: new Date('2024-01-31T23:59:59'), // Ainda em janeiro
      };

      mockDailyPeriodRepository.findActiveByDailyId
        .mockResolvedValueOnce(expiredDailyPeriod2) // daily-exercise
        .mockResolvedValueOnce(expiredWeeklyPeriod) // weekly-meeting
        .mockResolvedValueOnce(stillActiveMonthlyPeriod); // monthly-report

      result = await dailyService.getAvailableDailies('user-1');
      
      // Exercício diário e reunião semanal devem estar disponíveis
      expect(result.availableDailies).toHaveLength(2);
      const availableIds = result.availableDailies.map(d => d.id);
      expect(availableIds).toContain('daily-exercise');
      expect(availableIds).toContain('weekly-meeting');
      expect(result.completedToday).toHaveLength(0);
    });
  });

  describe('Cenários de Frequência Personalizada', () => {
    it('deve reativar tarefa a cada 3 dias corretamente', async () => {
      // Arrange
      const every3DaysDaily: Daily = {
        id: 'every-3-days',
        title: 'Tarefa a cada 3 dias',
        observations: 'Tarefa que se repete a cada 3 dias',
        tasks: ['Tarefa especial'],
        difficulty: 'Médio',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Diariamente',
          frequency: 3,
        },
        tags: ['personalizada'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      mockDailyRepository.findByUserId.mockResolvedValue([every3DaysDaily]);

      // Dia 1: Disponível
      const day1 = new Date('2024-01-01T10:00:00');
      vi.setSystemTime(day1);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(null);

      let result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);

      // Dia 2: Não deve estar disponível (frequência = 3)
      const day2 = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(day2);

      const completedPeriodDay1: DailyPeriod = {
        id: 'period-day1',
        dailyId: 'every-3-days',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriodDay1);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(0); // Não deve estar disponível ainda

      // Dia 3: Não deve estar disponível ainda
      const day3 = new Date('2024-01-03T10:00:00');
      vi.setSystemTime(day3);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(0);

      // Dia 4: Deve estar disponível novamente (3 dias depois)
      const day4 = new Date('2024-01-04T10:00:00');
      vi.setSystemTime(day4);

      const expiredPeriod: DailyPeriod = {
        ...completedPeriodDay1,
        endDate: new Date('2024-01-03T23:59:59'), // 3 dias atrás
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredPeriod);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('every-3-days');
    });

    it('deve reativar tarefa quinzenal (a cada 2 semanas) corretamente', async () => {
      // Arrange
      const biweeklyDaily: Daily = {
        id: 'biweekly-task',
        title: 'Tarefa Quinzenal',
        observations: 'Tarefa que se repete a cada 2 semanas',
        tasks: ['Tarefa quinzenal'],
        difficulty: 'Médio',
        startDate: new Date('2024-01-01'), // Segunda-feira
        repeat: {
          type: 'Semanalmente',
          frequency: 2,
        },
        tags: ['quinzenal'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      mockDailyRepository.findByUserId.mockResolvedValue([biweeklyDaily]);

      // Semana 1: Disponível
      const week1 = new Date('2024-01-01T10:00:00');
      vi.setSystemTime(week1);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(null);

      let result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);

      // Semana 2: Não deve estar disponível (completada na semana 1)
      const week2 = new Date('2024-01-08T10:00:00');
      vi.setSystemTime(week2);

      const completedBiweeklyPeriod: DailyPeriod = {
        id: 'period-biweekly',
        dailyId: 'biweekly-task',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14T23:59:59'), // 2 semanas
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedBiweeklyPeriod);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(0); // Ainda no período de 2 semanas

      // Semana 3: Deve estar disponível novamente (2 semanas depois)
      const week3 = new Date('2024-01-15T10:00:00');
      vi.setSystemTime(week3);

      const expiredBiweeklyPeriod: DailyPeriod = {
        ...completedBiweeklyPeriod,
        endDate: new Date('2024-01-14T23:59:59'), // Período expirou
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredBiweeklyPeriod);

      result = await dailyService.getAvailableDailies('user-1');
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('biweekly-task');
    });
  });

  describe('Validação de Integridade de Períodos', () => {
    it('deve garantir que períodos não se sobreponham incorretamente', async () => {
      // Este teste verifica que a lógica de períodos mantém integridade temporal
      
      const daily: Daily = {
        id: 'integrity-test',
        title: 'Teste de Integridade',
        observations: 'Teste para validar integridade de períodos',
        tasks: ['Teste'],
        difficulty: 'Trivial',
        startDate: new Date('2024-01-01'),
        repeat: { type: 'Diariamente', frequency: 1 },
        tags: ['teste'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      mockDailyRepository.findByUserId.mockResolvedValue([daily]);

      // Simular sequência de dias
      const dates = [
        new Date('2024-01-01T10:00:00'),
        new Date('2024-01-02T10:00:00'),
        new Date('2024-01-03T10:00:00'),
      ];

      const periods = [
        null, // Dia 1: sem período
        { // Dia 2: período do dia 1 expirado
          id: 'period-1',
          dailyId: 'integrity-test',
          periodType: 'Diariamente',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01T23:59:59'),
          isCompleted: true,
          isActive: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        { // Dia 3: período do dia 2 expirado
          id: 'period-2',
          dailyId: 'integrity-test',
          periodType: 'Diariamente',
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-01-02T23:59:59'),
          isCompleted: true,
          isActive: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      for (let i = 0; i < dates.length; i++) {
        vi.setSystemTime(dates[i]);
        mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(periods[i]);

        const result = await dailyService.getAvailableDailies('user-1');
        
        // Em todos os dias, a tarefa deve estar disponível
        expect(result.availableDailies).toHaveLength(1);
        expect(result.availableDailies[0].id).toBe('integrity-test');
      }
    });
  });
});