import { ai } from '../../genkit';
import { z } from 'genkit';

/**
 * Genkit Tool to fetch the raw README.md content of a public GitHub repository.
 */
export const getGithubReadmeTool = ai.defineTool(
  {
    name: 'getGithubReadme',
    description: 'Fetches the raw README.md content of any public GitHub repository to explain project purpose, features, and setup.',
    inputSchema: z.object({
      owner: z.string().default('s1yav').describe('GitHub username or organization name (defaults to s1yav)'),
      repo: z.string().describe('Repository name (e.g. agentic-api, agent-swarm, digital-identity-eraser)'),
    }),
    outputSchema: z.object({
      readme: z.string().describe('Raw Markdown content of the repository README file'),
    }),
  },
  async ({ owner, repo }) => {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.raw+json',
        'User-Agent': 'agentic-api',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch README for ${owner}/${repo}: ${response.statusText} (${response.status})`);
    }

    const readmeText = await response.text();
    return { readme: readmeText };
  }
);
