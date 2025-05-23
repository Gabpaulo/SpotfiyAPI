import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Folder } from '../models/folder';

const KEY = 'folders';

@Injectable({ providedIn: 'root' })
export class FolderService {
  private folders: Folder[] = [];

  constructor(private store: StorageService) {
    this.load();
  }
  private async load() {
    const f = await this.store.get<Folder[]>(KEY);
    this.folders = f || [];
  }
  private save() {
    this.store.set(KEY, this.folders);
  }

  async getAll(): Promise<Folder[]> {
    await this.load();
    return [...this.folders];
  }

  async create(name: string): Promise<Folder> {
    const f: Folder = { id: Date.now().toString(), name, itemIds: [] };
    this.folders.push(f);
    this.save();
    return f;
  }
  async rename(id: string, name: string) {
    const f = this.folders.find(x=>x.id===id);
    if (f) { f.name = name; this.save(); }
  }
  async delete(id: string) {
    this.folders = this.folders.filter(x=>x.id!==id);
    this.save();
  }

  async addItem(folderId: string, itemId: string) {
    const f = this.folders.find(x=>x.id===folderId);
    if (f && !f.itemIds.includes(itemId)) {
      f.itemIds.push(itemId);
      this.save();
    }
  }
  async removeItem(folderId: string, itemId: string) {
    const f = this.folders.find(x=>x.id===folderId);
    if (f) {
      f.itemIds = f.itemIds.filter(i=>i!==itemId);
      this.save();
    }
  }
}
