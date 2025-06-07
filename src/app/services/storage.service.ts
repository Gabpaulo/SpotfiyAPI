// src/app/services/storage.service.ts

import { Injectable } from '@angular/core';
import { Storage }    from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _store: Storage | null = null;

  constructor(private storage: Storage) {}

  private async getStore(): Promise<Storage> {
    if (!this._store) {
      this._store = await this.storage.create();
    }
    return this._store;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const store = await this.getStore();
    return store.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    const store = await this.getStore();
    return store.get(key);
  }

  /** Wrapper around Storage.remove */
  async remove(key: string): Promise<void> {
    const store = await this.getStore();
    return store.remove(key);
  }
}
