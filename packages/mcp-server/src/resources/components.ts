import { Resource } from "../types";

export const componentsResources: Resource[] = [
  {
    uri: "minijs://components/basics",
    name: "Components Guide",
    description: "Guia de criação e uso de componentes",
    mimeType: "text/markdown",
    content: `# Components Guide

## Props e Tipos
\`\`\`typescript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export class UserCard extends Component<UserCardProps> {
  render() {
    return (
      <div>
        <h2>{this.props.user.name}</h2>
        <button onClick={() => this.props.onEdit?.(this.props.user)}>
          Edit
        </button>
      </div>
    );
  }
}
\`\`\`

## Slots com @Child
\`\`\`typescript
export class Modal extends Component {
  @Child('header') header!: any;
  @Child('footer') footer!: any;
  @Child() content!: any;

  render() {
    return (
      <div className="modal">
        <header>{this.header}</header>
        <main>{this.content}</main>
        <footer>{this.footer}</footer>
      </div>
    );
  }
}

// Uso
<Modal>
  <h2 slot="header">Title</h2>
  <p>Content</p>
  <button slot="footer">OK</button>
</Modal>
\`\`\`
`,
  },
];
