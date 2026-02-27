import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

interface TimeEntry {
  taskId: string;
  taskType: "habit" | "daily" | "todo" | "goal";
  category: string;
  duration: number; // em segundos
  date: Date;
}

/**
 * @swagger
 * /api/time-tracking:
 *   post:
 *     tags: [Time Tracking]
 *     summary: Registra tempo gasto em uma tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - taskType
 *               - category
 *               - duration
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: ID da tarefa - habit, daily, todo ou goal
 *               taskType:
 *                 type: string
 *                 enum: [habit, daily, todo, goal]
 *               category:
 *                 type: string
 *                 description: Categoria da tarefa
 *               duration:
 *                 type: number
 *                 description: Duração em segundos
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: "Data do registro - opcional, padrão: agora"
 *     responses:
 *       201:
 *         description: Tempo registrado com sucesso
 *       401:
 *         description: Não autorizado
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 },
      );
    }

    // Parsing do body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "JSON inválido" },
        { status: 400 },
      );
    }

    const { taskId, taskType, category, duration, date } = body;

    // Validação de campos obrigatórios
    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json(
        { error: "ID da tarefa é obrigatório" },
        { status: 400 },
      );
    }

    if (!taskType || !["habit", "daily", "todo", "goal"].includes(taskType)) {
      return NextResponse.json(
        { error: "Tipo de tarefa inválido" },
        { status: 400 },
      );
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { error: "Categoria é obrigatória" },
        { status: 400 },
      );
    }

    if (!duration || typeof duration !== "number" || duration <= 0) {
      return NextResponse.json(
        { error: "Duração deve ser um número positivo" },
        { status: 400 },
      );
    }

    // Validação de data
    const entryDate = date ? new Date(date) : new Date();
    if (isNaN(entryDate.getTime())) {
      return NextResponse.json(
        { error: "Data inválida" },
        { status: 400 },
      );
    }

	    // Log apenas em desenvolvimento
	    if (process.env.NODE_ENV === "development") {
	      console.log("Time entry payload", {
	        userId: session.user.id,
	        taskId,
	        taskType,
	        category,
	        duration,
	        date: entryDate,
	      });
	    }

    // TODO: Implementar salvamento no banco de dados
    // Por enquanto, apenas simular sucesso
    const timeEntry: TimeEntry = {
      taskId,
      taskType,
      category,
      duration,
      date: entryDate
    };

    // Aqui você implementaria a lógica para salvar no banco
    // Exemplo:
    // const savedEntry = await saveTimeEntryToDatabase(timeEntry, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Tempo registrado com sucesso",
      timeEntry: {
        id: `temp-${Date.now()}`, // ID temporário
        ...timeEntry
      }
    }, { status: 201 });

  } catch (error) {

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/time-tracking:
 *   get:
 *     tags: [Time Tracking]
 *     summary: Busca registros de tempo
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: taskType
 *         schema:
 *           type: string
 *           enum: [habit, daily, todo, goal]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de registros de tempo
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 },
      );
    }

    // Parsing de parâmetros
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const taskType = searchParams.get("taskType");
    const category = searchParams.get("category");

    // TODO: Implementar busca no banco de dados
    // Por enquanto, retornar dados mock
    const mockEntries: TimeEntry[] = [
      {
        taskId: "mock-1",
        taskType: "todo",
        category: "Trabalho",
        duration: 3600, // 1 hora
        date: new Date()
      }
    ];

    return NextResponse.json({
      timeEntries: mockEntries
    });

  } catch (error) {

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
