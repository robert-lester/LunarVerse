import { Context } from '../context';
import { User } from '../models';
import { CommandType, ICommand } from '../@types';
import { parsePhoneNumber } from './phoneParse';
import ConversationUtils from './conversation';

/**
 * Namespace for Uplink commands business logic
 * TODO: Evaluate if business logic might be better suited to an object-oriented approach
 *       Generally, YAGNI unless a beneficial design pattern is immediately needed
 */
export default abstract class Command {
  /**
   * Given a message and an originating user, identify and execute a command
   * TODO: Commands should return a strongly-typed result and payload
   * @static
   * @memberof Commands
   * @param context Provides access to application services
   * @return An "ICommand" type or null to indicate no command was found
   */
  static readonly execute = async (context: Context, user: User, message: string): Promise<ICommand | null> => {
    let command: ICommand = null;

    if (message.length > 0) {
      const args = message.split(' ');
      const type = args[0].length > 0 ? args.shift().toUpperCase() : '';

      if (type) {
        switch (type) {
          case CommandType.START_CONVO:
          case CommandType.START_CONVERSATION:
            command = await Command.startConversation(context, { args, type, user, contact: null });
            break;
          default:
            break;
        }
      }
    }
    return command;
  }

  /**
   * Execute start command business logic
   * @static
   * @memberof Commands
   * @param context Provides access to application services
   * @param command The command to execute
   * @return Returns the command or null if unsuccessful
   */
  private static readonly startConversation = async (context: Context, command: ICommand): Promise<ICommand | null> => {
    // Assume the third argument contains a phone number
    const phoneNumber = parsePhoneNumber(command.args.join(''));

    if (phoneNumber) {
      command.contact = await ConversationUtils.startConversationFromUserToPhoneNumber(context, command.user, phoneNumber);
    } else {
      // TODO: Commands should return a strongly-typed result and payload
      console.error(`The phone number is ${command.args[1]} is invalid`);
    }
    return command.contact ? command : null;
  }
}