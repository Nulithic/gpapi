export interface Role {
  role: string;
  parent: string | null;
  name: string;
  status: boolean;
  children: Role[];
}
