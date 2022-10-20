export interface Role {
  _id: string;
  role: string;
  parent: string | null;
  path: string;
  name: string;
  status: boolean;
  children: Role[];
}
