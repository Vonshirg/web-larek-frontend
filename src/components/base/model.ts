import { IEvents } from './events';

export abstract class model<T> {
  constructor(data: Partial<T>, protected events: IEvents) {
    Object.assign(this, data);
  }

  emitChanges(event: string, payload?: object) {
    this.events.emit(event, payload ?? {});
  }
}