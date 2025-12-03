/// <reference types="vite/client" />
import { Component, Inject } from "@mini/core";
import { takeUntil } from "rxjs";
import { RouterService } from "../../RouterService";
import type { LinkProps } from "./types";

export class Link extends Component<LinkProps> {
  @Inject(RouterService) router!: RouterService;

  render() {
    const { href, ...rest } = this.props;
    return (
      // @ts-ignore
      <a
        href={href}
        {...rest}
        onClick={async (evt) => {
          evt.preventDefault();
          if (!href) return;
          if (typeof href === "string") {
            this.router.push(
              (import.meta.env.BASE_URL + href).replace(/\/\//, "/")
            );
            return;
          }

          href
            .pipe(takeUntil(this.$.unmount$))
            .subscribe((hrefVal) =>
              this.router.push(
                (import.meta.env.BASE_URL + hrefVal).replace(/\/\//, "/")
              )
            );
        }}
      >
        {this.children}
      </a>
    );
  }
}
