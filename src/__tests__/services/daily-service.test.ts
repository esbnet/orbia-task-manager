import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Daily } from '@/domain/entities/daily';
import type { DailyPeriod } from '@/domain/entities/daily-period';
import { DailyService } from '@/infra/services/daily-service';

// Mock repositories
const mockDailyRepository = {
  // BaseRepository methods
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  // UserOwnedRepository methods
  findByUserId: vi.fn(),
  deleteByUserId: vi.fn(),
  // CompletableRepository methods
  toggleComplete: vi.fn(),
  markComplete: vi.fn(),
  markIncomplete: vi.fn(),
  // OrderableRepository methods
  reorder: vi.fn(),
  moveToPosition: vi.fn(),
  // TaggableRepository methods
  findByTags: vi.fn(),
  findByTag: vi.fn(),
  getTagStats: vi.fn(),
};

const mockDailyLogRepository = {
  // BaseRepository methods
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  // LogRepository methods
  findByEntityId: vi.fn(),
  findByDateRange: vi.fn(),
  deleteOlderThan: vi.fn(),
};

const mockDailyPeriodRepository = {
  findActiveByDailyId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  findByDailyId: vi.fn(),
  completeAndFinalize: vi.fn(),
};

describe('DailyService - Reativação de Tarefas por Período', () => {
  let dailyService: DailyService;
  let mockDaily: Daily;
  let mockPeriod: DailyPeriod;

  beforeEach(() => {
    vi.clearAllMocks();
    
    dailyService = new DailyService(
      mockDailyRepository as any,
      mockDailyLogRepository as any,
      mockDailyPeriodRepository as any
    );

    // Mock daily task
    mockDaily = {
      id: 'daily-1',
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
      lastCompletedDate: undefined,
      subtasks: [],
    };

    // Mock period
    mockPeriod = {
      id: 'period-1',
      dailyId: 'daily-1',
      periodType: 'Diariamente',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-01T23:59:59'),
      isCompleted: false,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
  });

  describe('getAvailableDailies', () => {
    it('deve retornar tarefa diária disponível quando não há período ativo', async () => {
      // Arrange
      mockDailyRepository.findByUserId.mockResolvedValue([mockDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(null);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('daily-1');
      expect(result.completedToday).toHaveLength(0);
      expect(result.totalDailies).toBe(1);
    });

    it('deve retornar tarefa diária disponível quando período anterior foi completado e novo período deve começar', async () => {
      // Arrange
      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        isCompleted: true,
        isActive: false,
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-01T23:59:59'),
      };

      const today = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([mockDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('daily-1');
      expect(result.completedToday).toHaveLength(0);
    });

    it('deve retornar tarefa na lista de completadas hoje quando foi completada no período atual', async () => {
      // Arrange
      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        isCompleted: true,
        isActive: false,
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
      };

      const today = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([mockDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.availableDailies).toHaveLength(0);
      expect(result.completedToday).toHaveLength(1);
      expect(result.completedToday[0].id).toBe('daily-1');
      expect(result.completedToday[0].nextAvailableAt).toBeDefined();
    });

    it('deve calcular corretamente o próximo período disponível para tarefa diária', async () => {
      // Arrange
      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        isCompleted: true,
        isActive: false,
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
      };

      const today = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([mockDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      const completedDaily = result.completedToday[0];
      const nextAvailable = completedDaily.nextAvailableAt;
      
      expect(nextAvailable.getDate()).toBe(3);
      expect(nextAvailable.getHours()).toBe(0);
      expect(nextAvailable.getMinutes()).toBe(0);
    });

    it('deve calcular corretamente o próximo período para tarefa semanal', async () => {
      // Arrange
      const weeklyDaily: Daily = {
        ...mockDaily,
        repeat: {
          type: 'Semanalmente',
          frequency: 1,
        },
      };

      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        periodType: 'Semanalmente',
        isCompleted: true,
        isActive: false,
        startDate: new Date('2024-01-05T00:00:00'),
        endDate: new Date('2024-01-11T23:59:59'),
      };

      const today = new Date('2024-01-05T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([weeklyDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.completedToday).toHaveLength(1);
      const completedDaily = result.completedToday[0];
      const nextAvailable = completedDaily.nextAvailableAt;
      
      // Para tarefa semanal, próxima segunda-feira (dia 15 de janeiro)
      expect(nextAvailable.getDate()).toBe(15);
    });

    it('deve calcular corretamente o próximo período para tarefa mensal', async () => {
      // Arrange
      const monthlyDaily: Daily = {
        ...mockDaily,
        repeat: {
          type: 'Mensalmente',
          frequency: 1,
        },
      };

      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        periodType: 'Mensalmente',
        isCompleted: true,
        isActive: false,
        startDate: new Date('2024-01-15T00:00:00'),
        endDate: new Date('2024-02-14T23:59:59'),
      };

      const today = new Date('2024-01-15T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([monthlyDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.completedToday).toHaveLength(1);
      const completedDaily = result.completedToday[0];
      const nextAvailable = completedDaily.nextAvailableAt;
      
      // Para tarefa mensal, próximo mês (março, pois calcula a partir do fim do período em fevereiro)
      expect(nextAvailable.getMonth()).toBe(2);
    });

    it('deve retornar tarefa disponível quando período expirou mas não foi completado', async () => {
      // Arrange
      const expiredPeriod: DailyPeriod = {
        ...mockPeriod,
        isCompleted: false,
        isActive: true,
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-01T23:59:59'),
      };

      const today = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([mockDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(expiredPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.availableDailies).toHaveLength(1);
      expect(result.availableDailies[0].id).toBe('daily-1');
      expect(result.completedToday).toHaveLength(0);
    });

    it('deve lidar com frequência personalizada corretamente', async () => {
      // Arrange - Tarefa a cada 3 dias
      const customDaily: Daily = {
        ...mockDaily,
        repeat: {
          type: 'Diariamente',
          frequency: 3,
        },
      };

      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        isCompleted: true,
        isActive: false,
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
      };

      const today = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(today);

      mockDailyRepository.findByUserId.mockResolvedValue([customDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      expect(result.completedToday).toHaveLength(1);
      const completedDaily = result.completedToday[0];
      const nextAvailable = completedDaily.nextAvailableAt;
      
      expect(nextAvailable.getDate()).toBe(5);
      expect(nextAvailable.getHours()).toBe(0);
    });
  });

  describe('shouldShowToday', () => {
    it('deve mostrar tarefa diária todos os dias após a data de início', () => {
      // Arrange
      const daily: Daily = {
        ...mockDaily,
        startDate: new Date('2024-01-01'),
        repeat: { type: 'Diariamente', frequency: 1 },
      };

      const today = new Date('2024-01-05');
      vi.setSystemTime(today);

      // Act
      const shouldShow = (dailyService as any).shouldShowToday(daily);

      // Assert
      expect(shouldShow).toBe(true);
    });

    it('não deve mostrar tarefa se a data de início for no futuro', () => {
      // Arrange
      const daily: Daily = {
        ...mockDaily,
        startDate: new Date('2024-01-10'),
        repeat: { type: 'Diariamente', frequency: 1 },
      };

      const today = new Date('2024-01-05');
      vi.setSystemTime(today);

      // Act
      const shouldShow = (dailyService as any).shouldShowToday(daily);

      // Assert
      expect(shouldShow).toBe(false);
    });

    it('deve mostrar tarefa semanal apenas nos dias corretos', () => {
      // Arrange
      const daily: Daily = {
        ...mockDaily,
        startDate: new Date('2024-01-01'), // Segunda-feira
        repeat: { type: 'Semanalmente', frequency: 1 },
      };

      // Test segunda-feira (dia 8 - exatamente 1 semana depois)
      let testDate = new Date('2024-01-08');
      vi.setSystemTime(testDate);
      let shouldShow = (dailyService as any).shouldShowToday(daily);
      expect(shouldShow).toBe(true);

      // Test terça-feira (deve mostrar - tarefa semanal fica disponível a semana toda)
      testDate = new Date('2024-01-09');
      vi.setSystemTime(testDate);
      shouldShow = (dailyService as any).shouldShowToday(daily);
      expect(shouldShow).toBe(true);
    });
  });

  describe('completeDaily', () => {
    it('deve completar uma tarefa diária e criar o próximo período', async () => {
      // Arrange
      const completedDaily = { ...mockDaily, lastCompletedDate: '2024-01-01' };
      mockDailyRepository.markComplete.mockResolvedValue(completedDaily);
      
      const nextPeriod: DailyPeriod = {
        ...mockPeriod,
        id: 'period-2',
        startDate: new Date('2024-01-02'),
        endDate: new Date('2024-01-02T23:59:59'),
      };
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(nextPeriod);

      // Act
      const result = await dailyService.completeDaily('daily-1');

      // Assert
      expect(result.daily).toEqual(completedDaily);
      expect(result.nextAvailableAt).toEqual(nextPeriod.startDate);
      expect(mockDailyRepository.markComplete).toHaveBeenCalledWith('daily-1');
    });

    it('deve calcular corretamente a próxima data disponível quando não há período ativo', async () => {
      // Arrange
      const completedDaily = { ...mockDaily, lastCompletedDate: '2024-01-01' };
      mockDailyRepository.markComplete.mockResolvedValue(completedDaily);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(null);

      const today = new Date('2024-01-01T10:00:00');
      vi.setSystemTime(today);

      // Act
      const result = await dailyService.completeDaily('daily-1');

      // Assert
      expect(result.daily).toEqual(completedDaily);
      expect(result.nextAvailableAt.getDate()).toBe(2);
      expect(result.nextAvailableAt.getHours()).toBe(0);
    });
  });

  describe('Cenários de Reativação de Períodos', () => {
    it('deve reativar tarefa diária no início do próximo dia', async () => {
      // Arrange - Tarefa completada ontem
      const yesterday = new Date('2024-01-01T00:00:00');
      const today = new Date('2024-01-02T10:00:00');
      vi.setSystemTime(today);

      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        isCompleted: true,
        isActive: false,
        startDate: yesterday,
        endDate: new Date('2024-01-01T23:59:59'),
      };

      mockDailyRepository.findByUserId.mockResolvedValue([mockDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      // Como hoje (2024-01-02) >= endDate (2024-01-01T23:59:59), deve estar disponível
      expect(result.availableDailies).toHaveLength(1);
      expect(result.completedToday).toHaveLength(0);
    });

    it('deve reativar tarefa semanal no início da próxima semana', async () => {
      // Arrange - Tarefa semanal completada na semana passada
      const weeklyDaily: Daily = {
        ...mockDaily,
        repeat: { type: 'Semanalmente', frequency: 1 },
      };

      const lastWeek = new Date('2024-01-01T00:00:00'); // Segunda-feira
      const thisWeek = new Date('2024-01-08T10:00:00'); // Segunda-feira da próxima semana
      vi.setSystemTime(thisWeek);

      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        periodType: 'Semanalmente',
        isCompleted: true,
        isActive: false,
        startDate: lastWeek,
        endDate: new Date('2024-01-07T23:59:59'), // Domingo
      };

      mockDailyRepository.findByUserId.mockResolvedValue([weeklyDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      // Como hoje (2024-01-08) >= endDate (2024-01-07T23:59:59), deve estar disponível
      expect(result.availableDailies).toHaveLength(1);
      expect(result.completedToday).toHaveLength(0);
    });

    it('deve reativar tarefa mensal no início do próximo mês', async () => {
      // Arrange - Tarefa mensal completada no mês passado
      const monthlyDaily: Daily = {
        ...mockDaily,
        repeat: { type: 'Mensalmente', frequency: 1 },
      };

      const lastMonth = new Date('2024-01-01T00:00:00');
      const thisMonth = new Date('2024-02-01T10:00:00');
      vi.setSystemTime(thisMonth);

      const completedPeriod: DailyPeriod = {
        ...mockPeriod,
        periodType: 'Mensalmente',
        isCompleted: true,
        isActive: false,
        startDate: lastMonth,
        endDate: new Date('2024-01-31T23:59:59'),
      };

      mockDailyRepository.findByUserId.mockResolvedValue([monthlyDaily]);
      mockDailyPeriodRepository.findActiveByDailyId.mockResolvedValue(completedPeriod);

      // Act
      const result = await dailyService.getAvailableDailies('user-1');

      // Assert
      // Como hoje (2024-02-01) >= endDate (2024-01-31T23:59:59), deve estar disponível
      expect(result.availableDailies).toHaveLength(1);
      expect(result.completedToday).toHaveLength(0);
    });
  });
});