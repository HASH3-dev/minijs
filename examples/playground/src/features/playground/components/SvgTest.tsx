import { Component } from "@mini/core";

export class SvgTest extends Component {
  render() {
    return (
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">SVG Test</h2>

        <div class="space-y-4">
          <div>
            <h3 class="font-semibold mb-2">Simple Circle</h3>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="blue"
                stroke="black"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div>
            <h3 class="font-semibold mb-2">Path Example</h3>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <path
                d="M 10 10 L 190 10 L 190 190 L 10 190 Z"
                fill="none"
                stroke="red"
                strokeWidth="3"
              />
              <path
                d="M 50 50 Q 100 10, 150 50 T 150 150"
                fill="none"
                stroke="green"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div>
            <h3 class="font-semibold mb-2">Complex SVG Icon</h3>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <div>
            <h3 class="font-semibold mb-2">Multiple Shapes</h3>
            <svg width="300" height="200" viewBox="0 0 300 200">
              <rect
                x="10"
                y="10"
                width="80"
                height="80"
                fill="purple"
                opacity="0.5"
              />
              <circle cx="150" cy="100" r="50" fill="orange" />
              <ellipse cx="250" cy="100" rx="40" ry="60" fill="cyan" />
              <line
                x1="10"
                y1="150"
                x2="290"
                y2="150"
                stroke="black"
                strokeWidth="2"
              />
              <polygon
                points="150,20 180,80 120,80"
                fill="yellow"
                stroke="black"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }
}
