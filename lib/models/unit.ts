/**
 * Unit options for expense quantity
 */

import type { Unit } from './transaction';

export const UNITS: { value: Unit; label: string }[] = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'g', label: 'Gramo' },
  { value: 'L', label: 'Litro' },
  { value: 'ml', label: 'Mililitro' },
  { value: 'lb', label: 'Libra' },
  { value: 'oz', label: 'Onza' },
  { value: 'caja', label: 'Caja' },
  { value: 'paquete', label: 'Paquete' },
  { value: 'otro', label: 'Otro' },
];
