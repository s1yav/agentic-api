import { FlowServer } from '../../../reusable-components';
import { PORT } from './agent';
import { answerProjectQuestion, welcomeVisitor } from './flows';

export const flows = {
  welcomeVisitor,
  answerProjectQuestion,
} as const;

export const flowServer = new FlowServer({
  agentName: 'mouse',
  port: PORT,
  flows,
});

export const server = flowServer.start();
