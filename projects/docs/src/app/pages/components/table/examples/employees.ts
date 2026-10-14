export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'On leave' | 'Inactive';
  salary: number;
  started: string;
}

const FIRST = ['Ava', 'Ben', 'Chloe', 'Dan', 'Ella', 'Finn', 'Grace', 'Hugo', 'Isla', 'Jack'];
const LAST = ['Nguyen', 'Smith', 'Garcia', 'Okafor', 'Tanaka', 'Meyer', 'Rossi', 'Kowalski'];
const ROLES = ['Engineer', 'Designer', 'Product manager', 'Analyst', 'Support lead'];
const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Finance', 'Support'];
const STATUSES: Employee['status'][] = ['Active', 'Active', 'Active', 'On leave', 'Inactive'];

function pick<T>(list: readonly T[], index: number): T {
  return list[index % list.length] as T;
}

/** 48 made-up employees for the table examples. */
export const EMPLOYEES: Employee[] = Array.from({ length: 48 }, (_, i) => {
  const first = pick(FIRST, i);
  const last = pick(LAST, i * 3);
  return {
    id: i + 1,
    name: `${first} ${last}`,
    email: `${first}.${last}${String(i + 1)}@example.com`.toLowerCase(),
    role: pick(ROLES, i * 7),
    department: pick(DEPARTMENTS, i * 3),
    status: pick(STATUSES, i * 2),
    salary: 52000 + ((i * 37) % 90) * 1000,
    started: `20${String(15 + (i % 10))}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  };
});
