import { SecurityManager } from '../security/manager';
import { MakeIntegration } from '../integrations/make';
import { EventHandler } from '../events/handler';
import { Scenario, RouterRequest, RouterResponse } from '../types';

export class Router {
  private security: SecurityManager;
  private makeIntegration: MakeIntegration;
  private eventHandler: EventHandler;

  constructor() {
    this.security = new SecurityManager();
    this.makeIntegration = new MakeIntegration();
    this.eventHandler = new EventHandler();
  }

  async handleRequest(input: RouterRequest): Promise<RouterResponse> {
    try {
      // Validate security context
      await this.security.validate(input.context);

      // Process the request
      const scenario = await this.processInput(input);

      // Handle Make.com integration
      const result = await this.makeIntegration.createScenario(scenario);

      // Emit completion event
      this.eventHandler.emit('requestComplete', result);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.eventHandler.emit('error', error);
      throw error;
    }
  }

  private async processInput(input: RouterRequest): Promise<Scenario> {
    // Process input and generate scenario configuration
    const scenario: Scenario = {
      name: input.name,
      description: input.description,
      triggers: this.processTriggers(input.triggers),
      actions: this.processActions(input.actions),
      connections: this.processConnections(input.connections)
    };

    return scenario;
  }

  private processTriggers(triggers: any[]): any[] {
    // Process and validate triggers
    return triggers.map(trigger => ({
      type: trigger.type,
      configuration: trigger.configuration,
      schedule: trigger.schedule
    }));
  }

  private processActions(actions: any[]): any[] {
    // Process and validate actions
    return actions.map(action => ({
      type: action.type,
      configuration: action.configuration,
      inputs: action.inputs,
      outputs: action.outputs
    }));
  }

  private processConnections(connections: any[]): any[] {
    // Process and validate connections between actions
    return connections.map(connection => ({
      source: connection.source,
      target: connection.target,
      mapping: connection.mapping
    }));
  }
}