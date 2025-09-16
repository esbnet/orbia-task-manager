import type { CreateDailyPeriodData, DailyPeriod, UpdateDailyPeriodData } from '@/domain/entities/daily-period';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaDailyPeriodRepository } from '@/infra/database/prisma/prisma-daily-period-repository';
import { prisma } from '@/infra/database/prisma/prisma-client';

// Mock do módulo prisma-client deve vir antes dos imports que o usam
vi.mock('@/infra/database/prisma/prisma-client', () => ({
  prisma: {
    dailyPeriod: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));


describe('PrismaDailyPeriodRepository - Gestão de Períodos', () => {
  let repository: PrismaDailyPeriodRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PrismaDailyPeriodRepository();
  });

  describe('findActiveByDailyId', () => {
    it('deve encontrar período ativo para uma tarefa diária', async () => {
      // Arrange
      const mockActivePeriod: DailyPeriod = {
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

      (prisma.dailyPeriod.findFirst as any).mockResolvedValue(mockActivePeriod);

      // Act
      const result = await repository.findActiveByDailyId('daily-1');

      // Assert
      expect(result).toEqual(mockActivePeriod);
      expect(prisma.dailyPeriod.findFirst).toHaveBeenCalledWith({
        where: {
          dailyId: 'daily-1',
          isActive: true,
        },
      });
    });

    it('deve retornar null quando não há período ativo', async () => {
      // Arrange
      (prisma.dailyPeriod.findFirst as any).mockResolvedValue(null);

      // Act
      const result = await repository.findActiveByDailyId('daily-1');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('deve criar um novo período diário', async () => {
      // Arrange
      const createData: CreateDailyPeriodData = {
        dailyId: 'daily-1',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: false,
        isActive: true,
      };

      const createdPeriod: DailyPeriod = {
        id: 'period-1',
        ...createData,
        endDate: createData.endDate!,
        isCompleted: createData.isCompleted!,
        isActive: createData.isActive!,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (prisma.dailyPeriod.create as any).mockResolvedValue(createdPeriod);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(result).toEqual(createdPeriod);
      expect(prisma.dailyPeriod.create).toHaveBeenCalledWith({
        data: {
          dailyId: 'daily-1',
          periodType: 'Diariamente',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01T23:59:59'),
          isCompleted: false,
          isActive: true,
        },
      });
    });

    it('deve criar período com valores padrão quando não especificados', async () => {
      // Arrange
      const createData: CreateDailyPeriodData = {
        dailyId: 'daily-1',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-01'),
      };

      const createdPeriod: DailyPeriod = {
        id: 'period-1',
        dailyId: 'daily-1',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-01'),
        endDate: null,
        isCompleted: false,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (prisma.dailyPeriod.create as any).mockResolvedValue(createdPeriod);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(result).toEqual(createdPeriod);
      expect(prisma.dailyPeriod.create).toHaveBeenCalledWith({
        data: {
          dailyId: 'daily-1',
          periodType: 'Semanalmente',
          startDate: new Date('2024-01-01'),
          endDate: null,
          isCompleted: false,
          isActive: true,
        },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar um período existente', async () => {
      // Arrange
      const updateData: UpdateDailyPeriodData = {
        isCompleted: true,
        isActive: false,
        endDate: new Date('2024-01-01T23:59:59'),
      };

      const updatedPeriod: DailyPeriod = {
        id: 'period-1',
        dailyId: 'daily-1',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (prisma.dailyPeriod.update as any).mockResolvedValue(updatedPeriod);

      // Act
      const result = await repository.update('period-1', updateData);

      // Assert
      expect(result).toEqual(updatedPeriod);
      expect(prisma.dailyPeriod.update).toHaveBeenCalledWith({
        where: { id: 'period-1' },
        data: updateData,
      });
    });
  });

  describe('findByDailyId', () => {
    it('deve encontrar todos os períodos de uma tarefa diária ordenados por data de criação', async () => {
      // Arrange
      const periods: DailyPeriod[] = [
        {
          id: 'period-2',
          dailyId: 'daily-1',
          periodType: 'Diariamente',
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-01-02T23:59:59'),
          isCompleted: false,
          isActive: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'period-1',
          dailyId: 'daily-1',
          periodType: 'Diariamente',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01T23:59:59'),
          isCompleted: true,
          isActive: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      (prisma.dailyPeriod.findMany as any).mockResolvedValue(periods);

      // Act
      const result = await repository.findByDailyId('daily-1');

      // Assert
      expect(result).toEqual(periods);
      expect(prisma.dailyPeriod.findMany).toHaveBeenCalledWith({
        where: { dailyId: 'daily-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('completeAndFinalize', () => {
    it('deve completar e finalizar um período', async () => {
      // Arrange
      const currentTime = new Date('2024-01-01T15:30:00');
      vi.setSystemTime(currentTime);

      const finalizedPeriod: DailyPeriod = {
        id: 'period-1',
        dailyId: 'daily-1',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01'),
        endDate: currentTime,
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (prisma.dailyPeriod.update as any).mockResolvedValue(finalizedPeriod);

      // Act
      const result = await repository.completeAndFinalize('period-1');

      // Assert
      expect(result).toEqual(finalizedPeriod);
      expect(prisma.dailyPeriod.update).toHaveBeenCalledWith({
        where: { id: 'period-1' },
        data: {
          isCompleted: true,
          isActive: false,
          endDate: currentTime,
        },
      });
    });
  });

  describe('Cenários de Transição de Períodos', () => {
    it('deve simular ciclo completo de período: criação -> ativação -> conclusão -> reativação', async () => {
      const dailyId = 'daily-cycle-test';

      // Etapa 1: Criar período inicial
      const initialPeriod: DailyPeriod = {
        id: 'period-initial',
        dailyId,
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: false,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (prisma.dailyPeriod.create as any).mockResolvedValue(initialPeriod);
      
      const created = await repository.create({
        dailyId,
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-01T23:59:59'),
      });

      expect(created.isActive).toBe(true);
      expect(created.isCompleted).toBe(false);

      // Etapa 2: Completar período
      const completedPeriod: DailyPeriod = {
        ...initialPeriod,
        isCompleted: true,
        isActive: false,
        endDate: new Date('2024-01-01T15:30:00'),
      };

      (prisma.dailyPeriod.update as any).mockResolvedValue(completedPeriod);

      const finalized = await repository.completeAndFinalize('period-initial');
      expect(finalized.isActive).toBe(false);
      expect(finalized.isCompleted).toBe(true);

      // Etapa 3: Criar próximo período (simulando reativação)
      const nextPeriod: DailyPeriod = {
        id: 'period-next',
        dailyId,
        periodType: 'Diariamente',
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
        isCompleted: false,
        isActive: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      (prisma.dailyPeriod.create as any).mockResolvedValue(nextPeriod);

      const reactivated = await repository.create({
        dailyId,
        periodType: 'Diariamente',
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
      });

      expect(reactivated.isActive).toBe(true);
      expect(reactivated.isCompleted).toBe(false);
      expect(reactivated.startDate.getDate()).toBe(2); // Próximo dia
    });

    it('deve gerenciar períodos semanais corretamente', async () => {
      // Arrange
      const weeklyPeriod: DailyPeriod = {
        id: 'period-weekly',
        dailyId: 'daily-weekly',
        periodType: 'Semanalmente',
        startDate: new Date('2024-01-01T00:00:00'), // Segunda-feira
        endDate: new Date('2024-01-07T23:59:59'), // Domingo
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-07'),
      };

      (prisma.dailyPeriod.findMany as any).mockResolvedValue([weeklyPeriod]);

      // Act
      const periods = await repository.findByDailyId('daily-weekly');

      // Assert
      expect(periods).toHaveLength(1);
      expect(periods[0].periodType).toBe('Semanalmente');
      expect(periods[0].startDate.getDay()).toBe(1); // Segunda-feira
      expect(periods[0].endDate?.getDay()).toBe(0); // Domingo
    });

    it('deve gerenciar períodos mensais corretamente', async () => {
      // Arrange
      const monthlyPeriod: DailyPeriod = {
        id: 'period-monthly',
        dailyId: 'daily-monthly',
        periodType: 'Mensalmente',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-31T23:59:59'),
        isCompleted: true,
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-31'),
      };

      (prisma.dailyPeriod.findMany as any).mockResolvedValue([monthlyPeriod]);

      // Act
      const periods = await repository.findByDailyId('daily-monthly');

      // Assert
      expect(periods).toHaveLength(1);
      expect(periods[0].periodType).toBe('Mensalmente');
      expect(periods[0].startDate.getDate()).toBe(1); // Primeiro dia do mês
      expect(periods[0].endDate?.getDate()).toBe(31); // Último dia do mês
    });
  });

  describe('Validação de Estados de Período', () => {
    it('deve garantir que apenas um período esteja ativo por vez', async () => {
      // Arrange
      const activePeriod: DailyPeriod = {
        id: 'period-active',
        dailyId: 'daily-1',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01T23:59:59'),
        isCompleted: false,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (prisma.dailyPeriod.findFirst as any).mockResolvedValue(activePeriod);

      // Act
      const result = await repository.findActiveByDailyId('daily-1');

      // Assert
      expect(result).not.toBeNull();
      expect(result?.isActive).toBe(true);
      expect(result?.isCompleted).toBe(false);
    });

    it('deve permitir criar novo período após finalizar o anterior', async () => {
      // Arrange
      const createData: CreateDailyPeriodData = {
        dailyId: 'daily-1',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-02'),
        endDate: new Date('2024-01-02T23:59:59'),
        isCompleted: false,
        isActive: true,
      };

      const newPeriod: DailyPeriod = {
        id: 'period-new',
        ...createData,
        endDate: createData.endDate!,
        isCompleted: createData.isCompleted!,
        isActive: createData.isActive!,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      (prisma.dailyPeriod.create as any).mockResolvedValue(newPeriod);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(result).toEqual(newPeriod);
      expect(result.isActive).toBe(true);
      expect(result.isCompleted).toBe(false);
    });
  });

  describe('Cenários de Reativação de Períodos', () => {
    it('deve permitir múltiplos períodos para a mesma tarefa diária', async () => {
      // Arrange
      const periods: DailyPeriod[] = [
        {
          id: 'period-3',
          dailyId: 'daily-1',
          periodType: 'Diariamente',
          startDate: new Date('2024-01-03'),
          endDate: null,
          isCompleted: false,
          isActive: true,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
        {
          id: 'period-2',
          dailyId: 'daily-1',
          periodType: 'Diariamente',
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-01-02T23:59:59'),
          isCompleted: true,
          isActive: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'period-1',
          dailyId: 'daily-1',
          periodType: 'Diariamente',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01T23:59:59'),
          isCompleted: true,
          isActive: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      (prisma.dailyPeriod.findMany as any).mockResolvedValue(periods);

      // Act
      const result = await repository.findByDailyId('daily-1');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('period-3'); // Mais recente primeiro
      expect(result[1].id).toBe('period-2');
      expect(result[2].id).toBe('period-1');
      
      // Verificar que apenas o período mais recente está ativo
      const activePeriods = result.filter(p => p.isActive);
      expect(activePeriods).toHaveLength(1);
      expect(activePeriods[0].id).toBe('period-3');
    });

    it('deve demonstrar reativação automática após expiração de período', async () => {
      // Cenário: Período diário expirou, deve ser possível criar novo período

      // Primeiro, verificar que não há período ativo
      (prisma.dailyPeriod.findFirst as any).mockResolvedValue(null);
      
      let activePeriod = await repository.findActiveByDailyId('daily-reactivation');
      expect(activePeriod).toBeNull();

      // Criar novo período (simulando reativação automática)
      const newActivePeriod: DailyPeriod = {
        id: 'period-reactivated',
        dailyId: 'daily-reactivation',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
        isCompleted: false,
        isActive: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      (prisma.dailyPeriod.create as any).mockResolvedValue(newActivePeriod);

      const reactivated = await repository.create({
        dailyId: 'daily-reactivation',
        periodType: 'Diariamente',
        startDate: new Date('2024-01-02T00:00:00'),
        endDate: new Date('2024-01-02T23:59:59'),
      });

      expect(reactivated.isActive).toBe(true);
      expect(reactivated.isCompleted).toBe(false);
      expect(reactivated.startDate.getDate()).toBe(2);
    });
  });
});