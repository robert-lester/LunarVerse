import { User } from '../models';
import { CommandType } from './';

export interface ICommand {
  args: string[];
  type: CommandType;
  user: User;
  contact: User | null;
}