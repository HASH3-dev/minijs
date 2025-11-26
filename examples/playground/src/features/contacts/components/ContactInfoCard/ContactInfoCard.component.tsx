import { Component } from "@mini/core";

interface ContactInfoProps {
  icon: JSX.Element;
  iconBgColor: string;
  iconColor: string;
  title: string;
  content: string | JSX.Element;
}

export class ContactInfoCard extends Component<ContactInfoProps> {
  render() {
    const { icon, iconBgColor, iconColor, title, content } = this.props;

    return (
      <div className="flex items-start gap-4">
        <div className={`${iconBgColor} p-3 rounded-lg`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="text-gray-600">{content}</div>
        </div>
      </div>
    );
  }
}
