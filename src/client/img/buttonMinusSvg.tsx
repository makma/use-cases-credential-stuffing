import { FunctionComponent } from 'react';

type ButtonMinusSvgProps = {
  onClick?: () => void;
};
export const ButtonMinusSvg: FunctionComponent<ButtonMinusSvgProps> = ({ onClick }) => (
  <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick}>
    <path d="M10.7932 7.66016H7.2501H3.70703" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);
