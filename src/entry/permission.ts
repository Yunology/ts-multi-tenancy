// src/entry/permission.ts
export class Permission {
  public readonly index: number;
  public readonly name: string;
  public readonly description?: string;

  constructor(index: number, name: string, description?: string) {
    this.index = index;
    this.name = name;
    this.description = description;
  }
}
