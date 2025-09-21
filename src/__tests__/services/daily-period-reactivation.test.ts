import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Daily } from '@/domain/entities/daily';
import type { DailyPeriod } from '@/domain/entities/daily-period';
import { DailyService } from '@/infra/services/daily-service';

describe('DailyService - Testes de Reativação de Períodos', () => {
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

  describe('Reativação de Tarefas Diárias', () => {
    it('deve reativar tarefa diária quando período anterior expirou', async () => {
      // Arrange
      const daily: Daily = {
        id: 'daily-1',
        title: 'Exercitar-se',
        observations: 'Fazer exercício diário',
        tasks: ['Aquecimento', 'Exercício'],
        difficulty: 'Médio',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Diariamente',
          frequency: 1,
        },
        tags: ['saúde'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      // Período que foi completado ontem
      const expiredPeriod: DailyPeriod = {
        id: 'period-1',
        dailyId: 'daily-1',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      // Simular que hoje é 2024-01-02
      const today = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([daily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('daily-1');
      expect(result.completedToday).toHaveLength(0);
      expect(result.totalDailies).toBe(1);
    });

    it('deve reativar tarefa semanal quando período anterior expirou', async () => {
      // Arrange
      const weeklyDaily: Daily = {
        id: 'daily-2',
        title: 'Limpeza semanal',
        observations: 'Limpeza geral da casa',
        tasks: ['Aspirar', 'Passar pano'],
        difficulty: 'Médio',
        startDate: new Date('2024-01-01'), // Segunda-feira
        repeat: {
          type: 'Semanalmente',
          frequency: 1,
        },
        tags: ['casa'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      // Período da semana passada que foi completado
      const expiredWeeklyPeriod: DailyPeriod = {
        id: 'period-2',
        dailyId: 'daily-2',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-01T00:00:00'), // Segunda-feira
        endDate: new Date('2024-01-07T23:59:59'), // Domingo
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-07'),
      };

      // Simular que hoje é segunda-feira da próxima semana
      const today = new Date('2024-01-08T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([weeklyDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredWeeklyPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('daily-2');
      expect(result.completedToday).toHaveLength(0);
      expect(result.totalDailies).toBe(1);
    });

    it('deve reativar tarefa mensal quando período anterior expirou', async () => {
      // Arrange
      const monthlyDaily: Daily = {
        id: 'daily-3',
        title: 'Revisão mensal',
        observations: 'Revisão de metas mensais',
        tasks: ['Analisar progresso', 'Definir próximas metas'],
        difficulty: 'Difícil',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Mensalmente',
          frequency: 1,
        },
        tags: ['planejamento'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      // Período do mês passado que foi completado
      const expiredMonthlyPeriod: DailyPeriod = {
        id: 'period-3',
        dailyId: 'daily-3',
        periodType: 'Mensalmente',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-31T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-31'),
      };

      // Simular que hoje é primeiro dia do próximo mês
      const today = new Date('2024-02-01T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([monthlyDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredMonthlyPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('daily-3');
      expect(result.completedToday).toHaveLength(0);
      expect(result.totalDailies).toBe(1);
    });

    it('deve mostrar tarefa como completada hoje quando período foi completado hoje', async () => {
      // Arrange
      const daily: Daily = {
        id: 'daily-4',
        title: 'Meditação',
        observations: 'Meditar por 10 minutos',
        tasks: ['Preparar ambiente', 'Meditar'],
        difficulty: 'Fácil',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Diariamente',
          frequency: 1,
        },
        tags: ['bem-estar'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      // Período que foi completado hoje
      const todayCompletedPeriod: DailyPeriod = {
        id: 'period-4',
        dailyId: 'daily-4',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      // Simular que hoje é 2024-01-02
      const today = new Date('2024-01-02T15:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([daily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(todayCompletedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.availableDailies).toHaveLength(0);
      expect(result.completedToday).toHaveLength(1);
      expect(result.completedToday[0].id).toBe('daily-4');
      expect(result.completedToday[0].nextAvailableAt).toBeDefined();
      
      // Próxima disponibilidade deve ser amanhã às 00:00
      const nextAvailable = result.completedToday[0].nextAvailableAt;
      expect(nextAvailable.getDate()).toBe(3); // 2024-01-03
      expect(nextAvailable.getHours()).toBe(0);
      expect(nextAvailable.getMinutes()).toBe(0);
    });

    it('deve calcular corretamente próxima disponibilidade para diferentes frequências', async () => {
      // Arrange - Tarefa a cada 2 dias
      const customDaily: Daily = {
        id: 'daily-5',
        title: 'Tarefa personalizada',
        observations: 'Tarefa que se repete a cada 2 dias',
        tasks: ['Tarefa 1'],
        difficulty: 'Fácil',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Diariamente',
          frequency: 2,
        },
        tags: ['personalizada'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-1',
        order: 1,
        subtasks: [],
      };

      // Período completado hoje
      const completedPeriod: DailyPeriod = {
        id: 'period-5',
        dailyId: 'daily-5',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-03T00:00:00'),
        endDate: new Date('2024-01-03T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      };

      const today = new Date('2024-01-03T14:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([customDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.completedToday).toHaveLength(1);
      const completedDaily = result.completedToday[0];
      const nextAvailable = completedDaily.nextAvailableAt;
      
      // Com frequência 2, próxima disponibilidade deve ser em 2 dias
      expect(nextAvailable.getDate()).toBe(5); // 2024-01-05
      expect(nextAvailable.getHours()).toBe(0);
    });
  });

  describe('Cenários Específicos de Reativação', () => {
    it('deve garantir que tarefa diária reapareça exatamente no próximo período', async () => {
      // Arrange
      const daily: Daily = {
        id: 'test-daily',
        title: 'Teste de Reativação',
        observations: 'Teste para garantir reativação correta',
        tasks: ['Teste'],
        difficulty: 'Trivial',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Diariamente',
          frequency: 1,
        },
        tags: ['teste'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-test',
        order: 1,
        subtasks: [],
      };

      // Cenário 1: Período não existe ainda (primeira execução)
      mockDailyRepository.findByUserId.mockResolvedValue([daily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(null);

      const day1 = new Date('2024-01-01T10:00:00');
      vi.setSystemTime(day1);

      let result = await dailyService.getAvailableDailies('user-test');
      expect(result.availableDailies).toHaveLength(1);
      expect(result.completedToday).toHaveLength(0);

      // Cenário 2: Período foi completado ontem, hoje deve estar disponível novamente
      const yesterdayCompletedPeriod: DailyPeriod = {
        id: 'period-yesterday',
        dailyId: 'test-daily',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const day2 = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(day2);

      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(yesterdayCompletedPeriod);

      result = await dailyService.getAvailableDailies('user-test');
      expect(result.availableDailies).toHaveLength(1);
      expect(result.completedToday).toHaveLength(0);

      // Cenário 3: Período foi completado hoje, deve aparecer em completedToday
      const todayCompletedPeriod: DailyPeriod = {
        id: 'period-today',
        dailyId: 'test-daily',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(todayCompletedPeriod);

      result = await dailyService.getAvailableDailies('user-test');
      expect(result.availableDailies).toHaveLength(0);
      expect(result.completedToday).toHaveLength(1);
      expect(result.completedToday[0].nextAvailableAt.getDate()).toBe(3); // Amanhã
    });

    it('deve garantir que tarefa semanal reapareça na próxima semana', async () => {
      // Arrange
      const weeklyDaily: Daily = {
        id: 'weekly-test',
        title: 'Tarefa Semanal',
        observations: 'Teste semanal',
        tasks: ['Teste semanal'],
        difficulty: 'Médio',
        startDate: new Date('2024-01-01'), // Segunda-feira
        repeat: {
          type: 'Semanalmente',
          frequency: 1,
        },
        tags: ['semanal'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-test',
        order: 1,
        subtasks: [],
      };

      // Período da semana passada completado
      const lastWeekPeriod: DailyPeriod = {
        id: 'period-lastweek',
        dailyId: 'weekly-test',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-01T00:00:00'), // Segunda
        endDate: new Date('2024-01-07T23:59:59'), // Domingo
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-07'),
      };

      // Hoje é segunda-feira da próxima semana
      const nextMonday = new Date('2024-01-08T10:00:00');
      vi.setSystemTime(nextMonday);

      mockDailyRepository.findByUserId.mockResolvedValue([weeklyDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(lastWeekPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-test');

      // Assert
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('weekly-test');
      expect(result.completedToday).toHaveLength(0);
    });

    it('deve garantir que tarefa mensal reapareça no próximo mês', async () => {
      // Arrange
      const monthlyDaily: Daily = {
        id: 'monthly-test',
        title: 'Tarefa Mensal',
        observations: 'Teste mensal',
        tasks: ['Teste mensal'],
        difficulty: 'Difícil',
        startDate: new Date('2024-01-01'),
        repeat: {
          type: 'Mensalmente',
          frequency: 1,
        },
        tags: ['mensal'],
        createdAt: new Date('2024-01-01'),
        userId: 'user-test',
        order: 1,
        subtasks: [],
      };

      // Período do mês passado completado
      const lastMonthPeriod: DailyPeriod = {
        id: 'period-lastmonth',
        dailyId: 'monthly-test',
        periodType: 'Mensalmente',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-31T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-31'),
      };

      // Hoje é primeiro dia do próximo mês
      const nextMonth = new Date('2024-02-01T10:00:00');
      vi.setSystemTime(nextMonth);

      mockDailyRepository.findByUserId.mockResolvedValue([monthlyDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(lastMonthPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-test');

      // Assert
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('monthly-test');
      expect(result.completedToday).toHaveLength(0);
    });
  });

  describe('Cálculo de Próxima Disponibilidade', () => {
    it('deve calcular corretamente próxima disponibilidade para diferentes tipos de repetição', () => {
      // Test do método privado calculateNextPeriodStart
      const service = dailyService as any;
      
      // Teste diário
      const baseDate = new Date('2024-01-01T23:59:59');
      let nextDate = service.calculateNextPeriodStart('Diariamente', baseDate, 1);
      expect(nextDate.getDate()).toBe(2);
      expect(nextDate.getHours()).toBe(0);
      expect(nextDate.getMinutes()).toBe(0);

      // Teste semanal
      nextDate = service.calculateNextPeriodStart('Semanalmente', baseDate, 1);
      expect(nextDate.getDate()).toBe(8); // 7 dias depois

      // Teste mensal
      nextDate = service.calculateNextPeriodStart('Mensalmente', baseDate, 1);
      expect(nextDate.getMonth()).toBe(1); // Fevereiro

      // Teste anual
      nextDate = service.calculateNextPeriodStart('Anualmente', baseDate, 1);
      expect(nextDate.getFullYear()).toBe(2025);
    });

    it('deve calcular corretamente com frequências personalizadas', () => {
      const service = dailyService as any;
      const baseDate = new Date('2024-01-01T12:00:00');

      // A cada 3 dias
      let nextDate = service.calculateNextPeriodStart('Diariamente', baseDate, 3);
      expect(nextDate.getDate()).toBe(4);
      expect(nextDate.getHours()).toBe(0);

      // A cada 2 semanas
      nextDate = service.calculateNextPeriodStart('Semanalmente', baseDate, 2);
      expect(nextDate.getDate()).toBe(15); // 14 dias depois

      // A cada 3 meses
      nextDate = service.calculateNextPeriodStart('Mensalmente', baseDate, 3);
      expect(nextDate.getMonth()).toBe(3); // Abril (0-indexed)
    });
  });
});