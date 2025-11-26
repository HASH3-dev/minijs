export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  content: string;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}
