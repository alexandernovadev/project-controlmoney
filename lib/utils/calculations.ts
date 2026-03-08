import type { Transaction } from '@/lib/models';

/**
 * Representa la distribución del saldo por cada método de pago
 */
export type BalanceByMethod = {
  id: string;
  name: string;
  type: 'cash' | 'digital';
  balance: number;
};

/**
 * Representa la distribución de gastos agrupados por categoría
 */
export type ExpenseByCategory = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
};

/**
 * Calcula el total de la suma de montos de una lista de transacciones.
 * @param transactions Lista de transacciones (ingresos o gastos).
 * @returns El monto total sumado.
 */
export function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calcula el balance general sumando todos los ingresos y restando todos los gastos.
 * @param incomes Lista de ingresos.
 * @param expenses Lista de gastos.
 * @returns El balance total (ingresos - gastos).
 */
export function calculateGeneralBalance(incomes: Transaction[], expenses: Transaction[]): number {
  const totalIncome = calculateTotal(incomes);
  const totalExpense = calculateTotal(expenses);
  return totalIncome - totalExpense;
}

/**
 * Calcula el saldo (balance) disponible agrupado por cada método de pago configurado.
 * Para cada método, suma sus ingresos y le resta sus gastos.
 * Si el balance queda en 0, no lo incluye en la lista final.
 * 
 * @param incomes Lista de ingresos.
 * @param expenses Lista de gastos.
 * @param paymentMethods Mapa de métodos de pago desde Firebase (clave: ID del método, valor: objeto con label y type).
 * @returns Array con el saldo detallado por cada método de pago.
 */
export function calculateBalanceByMethod(
  incomes: Transaction[],
  expenses: Transaction[],
  paymentMethods: Record<string, { label: string; type: 'cash' | 'digital' }>
): BalanceByMethod[] {
  return Object.keys(paymentMethods)
    .map((methodId) => {
      // 1. Sumar todos los ingresos que entraron a este método de pago
      const incomeForMethod = incomes
        .filter((t) => t.paymentMethodId === methodId)
        .reduce((sum, t) => sum + t.amount, 0);

      // 2. Sumar todos los gastos que salieron de este método de pago
      const expenseForMethod = expenses
        .filter((t) => t.paymentMethodId === methodId)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        id: methodId,
        name: paymentMethods[methodId]?.label || 'Desconocido',
        type: paymentMethods[methodId]?.type || 'digital',
        // 3. El saldo final de este método es ingresos menos gastos
        balance: incomeForMethod - expenseForMethod,
      };
    })
    // 4. Ocultar de la lista los métodos de pago que no tienen saldo (balance exacto a 0)
    .filter((m) => m.balance !== 0);
}

/**
 * Agrupa y suma los gastos según su categoría, y calcula qué porcentaje del total
 * de gastos representa cada categoría. Devuelve las categorías ordenadas de mayor a menor gasto.
 * 
 * @param expenses Lista de gastos.
 * @param categories Mapa de categorías desde Firebase (clave: ID de categoría, valor: Nombre).
 * @param limit Opcional. Límite de categorías a devolver (ej. para un "Top 3"). Si no se pasa, devuelve todas.
 * @returns Array de objetos con el id, nombre, monto total y porcentaje de la categoría.
 */
export function calculateExpensesByCategory(
  expenses: Transaction[],
  categories: Record<string, string>,
  limit?: number
): ExpenseByCategory[] {
  const totalExpense = calculateTotal(expenses);

  // 1. Agrupar la suma de montos usando el ID de la categoría
  const expensesGrouped = expenses.reduce((acc, t) => {
    const catId = t.categoryId || 'uncategorized';
    acc[catId] = (acc[catId] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // 2. Convertir a array, ordenar de mayor a menor, mapear nombre/porcentaje, y aplicar límite si existe
  let result = Object.entries(expensesGrouped)
    .sort(([, amountA], [, amountB]) => amountB - amountA)
    .map(([id, amount]) => ({
      id,
      name: categories[id] || 'Otras',
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }));

  if (limit) {
    result = result.slice(0, limit);
  }

  return result;
}

/**
 * Encuentra el gasto de mayor valor (el más caro) en la lista de gastos.
 * @param expenses Lista de gastos.
 * @returns La transacción más cara o null si la lista está vacía.
 */
export function getMostExpensiveTransaction(expenses: Transaction[]): Transaction | null {
  if (expenses.length === 0) return null;
  return expenses.reduce((max, t) => (t.amount > max.amount ? t : max), expenses[0]);
}

/**
 * Encuentra el gasto de menor valor (el más barato) en la lista de gastos.
 * @param expenses Lista de gastos.
 * @returns La transacción más barata o null si la lista está vacía.
 */
export function getCheapestTransaction(expenses: Transaction[]): Transaction | null {
  if (expenses.length === 0) return null;
  return expenses.reduce((min, t) => (t.amount < min.amount ? t : min), expenses[0]);
}

/**
 * Analiza descripciones y tiendas para encontrar en qué se gasta repetidamente.
 * Útil para encontrar "suscripciones" o "gastos hormiga" frecuentes.
 * 
 * @param expenses Lista de gastos.
 * @returns El nombre del gasto más repetido, cuántas veces se repitió y su costo total acumulado. Si no hay repeticiones, devuelve null.
 */
export function getMostRepeatedExpense(expenses: Transaction[]): { name: string; count: number; total: number } | null {
  const repetitions = expenses.reduce((acc, t) => {
    const key =
      t.description?.toLowerCase().trim() ||
      (typeof t.store === 'string' ? t.store : t.store?.name)?.toLowerCase().trim() ||
      'Desconocido';
      
    if (!acc[key]) {
      acc[key] = { count: 0, total: 0, name: t.description || 'Desconocido' };
    }
    
    acc[key].count += 1;
    acc[key].total += t.amount;
    return acc;
  }, {} as Record<string, { count: number; total: number; name: string }>);

  // Filtrar los que se repiten más de una vez y obtener el mayor
  const mostRepeated = Object.values(repetitions)
    .filter((r) => r.count > 1)
    .sort((a, b) => b.count - a.count)[0];

  return mostRepeated || null;
}

/**
 * Calcula el total sumado de transacciones (ingresos o gastos) filtrando por el tipo de método de pago (efectivo o digital).
 * @param transactions Lista de transacciones.
 * @param paymentMethods Mapa de métodos de pago (clave: ID del método, valor: objeto con type).
 * @param type Tipo de método de pago a calcular ('cash' o 'digital').
 * @returns La suma total para el tipo de método de pago especificado.
 */
export function calculateTotalByMethodType(
  transactions: Transaction[],
  paymentMethods: Record<string, 'cash' | 'digital'>,
  type: 'cash' | 'digital'
): number {
  return transactions
    .filter((t) => {
      if (!t.paymentMethodId) return type === 'digital';
      const methodType = paymentMethods[t.paymentMethodId] || 'digital';
      return methodType === type;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}
