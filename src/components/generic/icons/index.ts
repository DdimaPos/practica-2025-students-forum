import type {MouseEventHandler} from 'react';

export interface IconProps {
  className?: string;
  color?: string;
  hoverColor?: string;

  /**
   * FIXME: svg elements should not have any click listeners, this is an a11y issue
   * svg are only for representation role
   * any click events should be attached to a button or input instead
   *
   * @deprecated
   */
  onClick?: MouseEventHandler<SVGSVGElement>;
}
