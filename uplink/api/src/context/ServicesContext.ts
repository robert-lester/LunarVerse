// TODO: Refactor this file to remove unnecessary boilerplate
import * as Knex from 'knex';
import * as NosQL from '../../../../lib/nos-ql';
import {
  ConversationController,
  MessageController,
  OrganizationController,
  PhoneNumberController,
  UserController,
  IntakeController
} from '../controllers';

import { Context } from './Context';

/**
 *  Handle all instances of data models
 * @alias module:ServicesContext
 */
export class ServicesContext {
  constructor(connection: Knex, nosql: NosQL = null, ctx: Context = null) {
    this.setConversationService(new ConversationController(connection))
      .setMessageService(new MessageController(connection))
      // This is likely broken because it can pass a null reference
      .setOrganizationService(new OrganizationController(nosql))
      .setPhoneService(new PhoneNumberController(connection))
      .setUserService(new UserController(connection));

    // I'm perpetuating the nonsense. Context and ServicesContext
    // association should be unwound and refactored.
    if (ctx) {
      this.setIntakeService(new IntakeController(connection, { services: this, ctx }));
    }
    else {
      this.intakeService = null;
    }
  }

  private conversationService: ConversationController;
  private messageService: MessageController;
  private organizationService: OrganizationController;
  private phoneService: PhoneNumberController;
  private userService: UserController;
  private intakeService: IntakeController;

  public get ConversationService() {
    return this.conversationService;
  }

  public get MessageService() {
    return this.messageService;
  }

  public get OrganizationService() {
    return this.organizationService;
  }

  public get PhoneService() {
    return this.phoneService;
  }

  public get UserService() {
    return this.userService;
  }

  public get IntakeService(): IntakeController | null {
    return this.intakeService;
  }

  /**
   * Sets the conversation service to an instance of a conversation controller
   * @param conversationService Instance of a conversation controller
   */
  public setConversationService(conversationService: ConversationController): ServicesContext {
    this.conversationService = conversationService;
    return this;
  }

  /**
   * Sets the message service to an instance of a message controller
   * @param messageService Instance of a message controller
   */
  public setMessageService(messageService: MessageController): ServicesContext {
    this.messageService = messageService;
    return this;
  }

  /**
   * Sets the organization service to an instance of an organization controller
   * @param organizationService Instance of an organization controller
   */
  public setOrganizationService(organizationService: OrganizationController): ServicesContext {
    this.organizationService = organizationService;
    return this;
  }

  /**
   * Sets the phone service to an instance of a phone number controller
   * @param phoneService Instnace of a phone number controller
   */
  public setPhoneService(phoneService: PhoneNumberController): ServicesContext {
    this.phoneService = phoneService;
    return this;
  }

  /**
   * Sets the user service to an instance of a user controller
   * @param userService Instance of a user controller
   */
  public setUserService(userService: UserController): ServicesContext {
    this.userService = userService;
    return this;
  }

  /**
   * Sets the intake service
   * @param userService Instance of a user controller
   */
  public setIntakeService(intakeService: IntakeController): ServicesContext {
    this.intakeService = intakeService;
    return this;
   }
}
