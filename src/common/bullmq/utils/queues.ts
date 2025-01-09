import { QueueName } from '../constants';

export function isReservedQueueName(name: string): boolean {
  return Object.values(QueueName).includes(name);
}
