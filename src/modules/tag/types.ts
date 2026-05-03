/**
 * Tipos canônicos do módulo Tag.
 * Fonte única de verdade — substitui:
 *   - src/domain/entities/tag.ts
 *   - use-cases legados de Tag
 */

export interface Tag {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: Date;
}

export interface CreateTagInput {
    name: string;
    color: string;
    userId: string;
}

export interface UpdateTagInput {
    id: string;
    name?: string;
    color?: string;
}
