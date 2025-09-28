declare module 'goober' {
  import { ComponentType, ReactNode } from 'react';
  
  export interface GooberProps {
    [key: string]: any;
  }
  
  export function styled<T = GooberProps>(
    tag: string | ComponentType<T>
  ): (strings: TemplateStringsArray, ...values: any[]) => ComponentType<T>;
  
  export function css(strings: TemplateStringsArray, ...values: any[]): string;
  export function glob(strings: TemplateStringsArray, ...values: any[]): string;
  export function keyframes(strings: TemplateStringsArray, ...values: any[]): string;
  
  export function setup(
    pragma: (type: any, props: any, ...children: any[]) => ReactNode,
    prefixer?: (key: string, value: any) => string,
    theme?: any
  ): void;
  
  export function extractCss(): string;
  export function glob(strings: TemplateStringsArray, ...values: any[]): string;
}
