import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { LibraryItem }   from '../models/library-item';

const ITEMS_KEY = 'library-items';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private items: LibraryItem[] = [];

  constructor(private store: StorageService) {
    this.load();
  }
  private async load() {
    const arr = await this.store.get<LibraryItem[]>(ITEMS_KEY);
    this.items = arr || [];
  }
  private save() {
    this.store.set(ITEMS_KEY, this.items);
  }

  async getAll(): Promise<LibraryItem[]> {
    await this.load();
    return [...this.items];
  }

  async add(item: LibraryItem) {
    if (!this.items.find(x=>x.id===item.id)) {
      this.items.push(item);
      this.save();
    }
  }
  async remove(id: string) {
    this.items = this.items.filter(x=>x.id!==id);
    this.save();
  }
}